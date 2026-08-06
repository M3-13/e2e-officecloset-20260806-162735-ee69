from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user
from app.database import get_db
from app.models import ClothingItem, Outfit, OutfitItem
from app.schemas import ClothingItemResponse, MessageResponse, OutfitCreate, OutfitResponse

router = APIRouter()


@router.get("/api/outfits", response_model=list[OutfitResponse])
def list_outfits(
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = get_current_user(request, db)

    outfits = (
        db.query(Outfit)
        .options(joinedload(Outfit.items).joinedload(OutfitItem.clothing_item))
        .filter(Outfit.owner_id == current_user.id)
        .all()
    )

    return [
        OutfitResponse(
            id=o.id,
            name=o.name,
            owner_id=o.owner_id,
            created_at=o.created_at,
            items=[ClothingItemResponse.model_validate(oi.clothing_item) for oi in o.items],
        )
        for o in outfits
    ]


@router.post("/api/outfits", response_model=OutfitResponse, status_code=201)
def create_outfit(
    body: OutfitCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = get_current_user(request, db)

    if not body.item_ids:
        raise HTTPException(status_code=400, detail="item_ids must not be empty")

    clothing_items = db.query(ClothingItem).filter(ClothingItem.id.in_(body.item_ids)).all()

    found_ids = {item.id for item in clothing_items}
    for item_id in body.item_ids:
        if item_id not in found_ids:
            raise HTTPException(status_code=404, detail=f"Clothing item {item_id} not found")

    for item in clothing_items:
        if item.owner_id != current_user.id:
            raise HTTPException(
                status_code=403, detail=f"Clothing item {item.id} does not belong to you"
            )

    outfit = Outfit(name=body.name, owner_id=current_user.id)
    db.add(outfit)
    db.flush()

    for item_id in body.item_ids:
        db.add(OutfitItem(outfit_id=outfit.id, clothing_item_id=item_id))

    db.commit()

    outfit = (
        db.query(Outfit)
        .options(joinedload(Outfit.items).joinedload(OutfitItem.clothing_item))
        .filter(Outfit.id == outfit.id)
        .first()
    )

    return OutfitResponse(
        id=outfit.id,
        name=outfit.name,
        owner_id=outfit.owner_id,
        created_at=outfit.created_at,
        items=[ClothingItemResponse.model_validate(oi.clothing_item) for oi in outfit.items],
    )


@router.delete("/api/outfits/{outfit_id}", response_model=MessageResponse)
def delete_outfit(
    outfit_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    current_user = get_current_user(request, db)

    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit is None:
        raise HTTPException(status_code=404, detail="Outfit not found")

    if outfit.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Outfit does not belong to you")

    db.delete(outfit)
    db.commit()

    return {"message": "Outfit deleted"}
