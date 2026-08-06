import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.image_utils import create_thumbnail, strip_exif, validate_image
from app.models import ClothingItem, User
from app.schemas import ClothingItemResponse, MessageResponse

router = APIRouter()

ALLOWED_CATEGORIES = {"Oberteile", "Hosen", "Schuhe", "Accessoires", "Kleider"}


def _get_upload_dir() -> str:
    return os.environ.get("UPLOAD_DIR", "./uploads")


@router.get("/api/wardrobe", response_model=list[ClothingItemResponse])
def list_items(
    category: str | None = None,
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
            detail=f"Invalid category. Allowed: {', '.join(sorted(ALLOWED_CATEGORIES))}",
        )

    validate_image(image)
    stripped_data = strip_exif(image)
    thumb_data = create_thumbnail(stripped_data)

    os.makedirs(_get_upload_dir(), exist_ok=True)

    item = ClothingItem(
        name=name,
        category=category,
        image_path="",
        owner_id=current_user.id,
    )
    db.add(item)
    db.flush()

    img_path = os.path.join(_get_upload_dir(), f"img_{item.id}.jpg")
    thumb_path = os.path.join(_get_upload_dir(), f"thumb_{item.id}.jpg")

    with open(img_path, "wb") as f:
        f.write(stripped_data)
    with open(thumb_path, "wb") as f:
        f.write(thumb_data)

    item.image_path = img_path
    db.commit()
    db.refresh(item)

    return item


@router.get("/api/wardrobe/{item_id}/image")
def get_item_image(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    thumb_path = os.path.join(_get_upload_dir(), f"thumb_{item.id}.jpg")
    if not os.path.isfile(thumb_path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    return FileResponse(thumb_path, media_type="image/jpeg")


@router.delete("/api/wardrobe/{item_id}", response_model=MessageResponse)
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(ClothingItem).filter(ClothingItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    img_path = os.path.join(_get_upload_dir(), f"img_{item.id}.jpg")
    thumb_path = os.path.join(_get_upload_dir(), f"thumb_{item.id}.jpg")
    if os.path.isfile(img_path):
        os.remove(img_path)
    if os.path.isfile(thumb_path):
        os.remove(thumb_path)

    db.delete(item)
    db.commit()

    return {"message": "Item deleted"}
