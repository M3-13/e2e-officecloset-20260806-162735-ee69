import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.image_utils import create_thumbnail, strip_exif, validate_image
from app.models import ClothingItem, User
from app.schemas import ClothingItemResponse, MessageResponse

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "./uploads")
ALLOWED_CATEGORIES = frozenset({"Oberteile", "Hosen", "Schuhe", "Accessoires", "Kleider"})

router = APIRouter()


@router.get("/api/wardrobe", response_model=list[ClothingItemResponse])
def list_items(
    category: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(ClothingItem).filter(ClothingItem.owner_id == current_user.id)
    if category:
        query = query.filter(ClothingItem.category == category)
    return query.all()


@router.post("/api/wardrobe", response_model=ClothingItemResponse, status_code=201)
async def create_item(
    name: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(sorted(ALLOWED_CATEGORIES))}",
        )

    validate_image(image)

    image.file.seek(0)
    stripped_bytes = strip_exif(image)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    item = ClothingItem(
        name=name,
        category=category,
        image_path="",
        owner_id=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    img_path = os.path.join(UPLOAD_DIR, f"img_{item.id}.jpg")
    thumb_path = os.path.join(UPLOAD_DIR, f"thumb_{item.id}.jpg")

    with open(img_path, "wb") as f:
        f.write(stripped_bytes)

    thumbnail_bytes = create_thumbnail(stripped_bytes)
    with open(thumb_path, "wb") as f:
        f.write(thumbnail_bytes)

    item.image_path = img_path
    db.commit()
    db.refresh(item)

    return item


@router.get("/api/wardrobe/{id}/image")
def get_item_image(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(ClothingItem).filter(ClothingItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this item")

    thumb_path = os.path.join(UPLOAD_DIR, f"thumb_{id}.jpg")
    if not os.path.isfile(thumb_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    with open(thumb_path, "rb") as f:
        thumb_data = f.read()
    return Response(content=thumb_data, media_type="image/jpeg")


@router.delete("/api/wardrobe/{id}", response_model=MessageResponse)
def delete_item(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(ClothingItem).filter(ClothingItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this item")

    img_path = os.path.join(UPLOAD_DIR, f"img_{id}.jpg")
    thumb_path = os.path.join(UPLOAD_DIR, f"thumb_{id}.jpg")
    if os.path.isfile(img_path):
        os.remove(img_path)
    if os.path.isfile(thumb_path):
        os.remove(thumb_path)

    db.delete(item)
    db.commit()

    return {"message": "Item deleted successfully"}
