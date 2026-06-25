from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User
from backend.services.startup_service import StartupService

router = APIRouter()

@router.get("/startups/profile")
def get_startup_profile(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return StartupService.get_profile(db, current_user)

@router.post("/startups/profile")
def update_startup_profile(data: Dict[str, Any], db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        return StartupService.update_profile(db, current_user, data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/startups/directory")
def get_startups_directory(db = Depends(get_db)):
    return StartupService.get_public_directory(db)

@router.post("/startups/toggle-public")
def toggle_public_visibility(
    data: Dict[str, Any],
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        is_public = bool(data.get("is_public", False))
        return StartupService.toggle_public_visibility(db, current_user, is_public)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

