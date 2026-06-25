from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from backend.routers.auth import get_current_user_optional
from backend.models.models import User
from backend.schemas.schemas import UserResponse

router = APIRouter()

@router.get("/users/me", response_model=UserResponse)
def get_me(current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return current_user
