from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ClothingItemCreate(BaseModel):
    name: str
    category: str


class ClothingItemResponse(BaseModel):
    id: int
    name: str
    category: str
    image_path: str
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitCreate(BaseModel):
    name: str
    item_ids: list[int]


class OutfitResponse(BaseModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime
    items: list[ClothingItemResponse]

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str
