import os

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models import ClothingItem, User
from app.schemas import MessageResponse, TokenResponse, UserCreate

router = APIRouter()

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "./uploads")


@router.post("/api/auth/register", status_code=201, response_model=TokenResponse)
def register(body: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(body.password)
    user = User(email=body.email, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/api/auth/login", response_model=TokenResponse)
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.delete("/api/auth/account", response_model=MessageResponse)
def delete_account(
    request: Request,
    db: Session = Depends(get_db),
):
    user = get_current_user(request, db)

    clothing_items = db.query(ClothingItem).filter(ClothingItem.owner_id == user.id).all()

    image_paths: list[str] = []
    for item in clothing_items:
        image_paths.append(item.image_path)

    db.delete(user)
    db.commit()

    for image_path in image_paths:
        full_path = (
            os.path.join(UPLOAD_DIR, image_path) if not os.path.isabs(image_path) else image_path
        )
        try:
            if os.path.isfile(full_path):
                os.remove(full_path)
        except OSError:
            pass

    return {"message": "Account deleted successfully"}
