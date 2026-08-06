from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/api/wardrobe")
async def list_items():
    raise HTTPException(status_code=501, detail="wardrobe #5 implements this")


@router.post("/api/wardrobe")
async def create_item():
    raise HTTPException(status_code=501, detail="wardrobe #5 implements this")


@router.get("/api/wardrobe/{id}/image")
async def get_item_image(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #5 implements this")


@router.delete("/api/wardrobe/{id}")
async def delete_item(id: int):
    raise HTTPException(status_code=501, detail="wardrobe #5 implements this")
