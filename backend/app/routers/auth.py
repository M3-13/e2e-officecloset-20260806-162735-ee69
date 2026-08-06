from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/api/auth/register")
async def register():
    raise HTTPException(status_code=501, detail="auth #1 implements this")


@router.post("/api/auth/login")
async def login():
    raise HTTPException(status_code=501, detail="auth #1 implements this")


@router.delete("/api/auth/account")
async def delete_account():
    raise HTTPException(status_code=501, detail="auth #1 implements this")
