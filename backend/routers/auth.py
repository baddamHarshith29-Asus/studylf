from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any, Optional
from backend.core.database import get_db
from backend.core.security import decode_access_token, create_access_token
from backend.models.models import User, Profile, RoadmapTask
from backend.schemas.schemas import OnboardingRequest, ProfileResponse, UserCreate, UserLogin, Token
from backend.services.auth_service import AuthService
from backend.services.startup_service import StartupService
from backend.core.logger import logger
from bson import ObjectId
import time

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db = Depends(get_db)) -> Optional[User]:
    """Decodes JWT access token if present, else falls back to first DB user for smooth local demo execution."""
    import time
    t0 = time.time()
    user = None
    if token:
        try:
            payload = decode_access_token(token)
            if payload and "sub" in payload:
                email = payload["sub"]
                user_doc = db.users.find_one({"email": email})
                if user_doc:
                    user = User(user_doc, db)
        except Exception as e:
            logger.error(f"Error decoding JWT token: {e}")
            
    if not user:
        # Fallback to the first user in DB to maintain legacy mock support
        t_fallback_start = time.time()
        user_doc = db.users.find_one({})
        t_fallback_end = time.time()
        try:
            with open("d:\\cli\\time_log.txt", "a") as f_log:
                f_log.write(f"[get_current_user_optional] db.users.find_one fallback took {t_fallback_end - t_fallback_start:.3f}s\n")
        except Exception:
            pass
        if user_doc:
            user = User(user_doc, db)
            
    t1 = time.time()
    try:
        with open("d:\\cli\\time_log.txt", "a") as f_log:
            f_log.write(f"[get_current_user_optional] total dependency took {t1 - t0:.3f}s\n")
    except Exception:
        pass
    return user

@router.post("/auth/register", response_model=Dict[str, Any])
def register(data: UserCreate, db = Depends(get_db)):
    try:
        user = AuthService.register_user(db, data)
        token = create_access_token({"sub": user.email})
        return {
            "success": True,
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "name": user.name}
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/login", response_model=Token)
def login(data: UserLogin, db = Depends(get_db)):
    user = AuthService.authenticate_user(db, data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    import time
    t0 = time.time()
    res = StartupService.get_profile(db, current_user)
    t1 = time.time()
    try:
        with open("d:\\cli\\time_log.txt", "a") as f_log:
            f_log.write(f"[get_profile] StartupService.get_profile took {t1 - t0:.3f}s\n")
    except Exception:
        pass
    return res

@router.post("/profile")
def update_profile(data: Dict[str, Any], db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    try:
        profile = StartupService.update_profile(db, current_user, data)
        return {"success": True, "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/onboarding")
def onboard_user(data: OnboardingRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    user = current_user
    if not user:
        # Create a default user if none exists
        user_doc = db.users.find_one({"email": data.email})
        if not user_doc:
            res = db.users.insert_one({
                "email": data.email, 
                "name": data.name, 
                "password_hash": "placeholder",
                "created_at": time.time()
            })
            user_doc = db.users.find_one({"_id": res.inserted_id})
        user = User(user_doc, db)
            
    profile = AuthService.onboard_user(db, user, data)
    return {
        "success": True,
        "profile": {
            "registered": profile.registered,
            "email": user.email,
            "name": user.name,
            "startupName": profile.startup_name,
            "description": profile.description,
            "industry": profile.industry,
            "country": profile.country,
            "stage": profile.stage,
            "avatar": profile.avatar
        }
    }

@router.post("/auth/parse-resume")
async def parse_resume_endpoint(file_payload: Dict[str, str]):
    from backend.services.ai_service import AIService
    filename = file_payload.get("filename", "resume.pdf")
    parsed_data = await AIService.parse_resume(filename)
    return {
        "success": True,
        "data": parsed_data
    }

@router.post("/logout")
def logout_endpoint(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if current_user:
        db.profiles.update_one({"user_id": current_user.id}, {"$set": {"registered": False}})
        db.applications.delete_many({"user_id": current_user.id})
        db.roadmap_tasks.update_many({"user_id": current_user.id}, {"$set": {"completed": False}})
    return {"success": True}
