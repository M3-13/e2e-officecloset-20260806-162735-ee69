from fastapi import Request
from sqlalchemy.orm import Session

from app.models import User


def create_access_token(data: dict) -> str:
    raise NotImplementedError


def get_current_user(request: Request, db: Session) -> User:
    raise NotImplementedError


def hash_password(password: str) -> str:
    return ""


def verify_password(password: str, hash: str) -> bool:
    return False
