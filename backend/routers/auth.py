from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any, Optional
import time
import secrets
import httpx
from bson import ObjectId

from backend.core.database import get_db
from backend.core.security import decode_access_token, create_access_token
from backend.core.config import settings
from backend.core.logger import logger
from backend.models.models import User, Profile, RoadmapTask
from backend.schemas.schemas import (
    OnboardingRequest, ProfileResponse, UserCreate, UserLogin, Token,
    GoogleLoginRequest, VerifyOtpRequest, ResendOtpRequest
)
from backend.services.auth_service import AuthService
from backend.services.startup_service import StartupService
from backend.utils.email import send_otp_email

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def set_session_cookie(response: Response, token: str):
    """Sets the JWT access token in an HTTP-only secure cookie."""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
        max_age=3600 * 24 * 7  # 7 days
    )

def get_current_user_optional(request: Request, token: Optional[str] = Depends(oauth2_scheme), db = Depends(get_db)) -> Optional[User]:
    """Decodes JWT access token from HTTP-only cookies or Bearer header if present."""
    access_token = request.cookies.get("access_token") or token
    if access_token:
        try:
            payload = decode_access_token(access_token)
            if payload and "sub" in payload:
                email = payload["sub"]
                user_doc = db.users.find_one({"email": email})
                if user_doc:
                    return User(user_doc, db)
        except Exception as e:
            logger.error(f"Error decoding JWT token: {e}")
    return None

def get_current_user(request: Request, token: Optional[str] = Depends(oauth2_scheme), db = Depends(get_db)) -> User:
    """Strictly authenticates the user using JWT from cookies or headers."""
    access_token = request.cookies.get("access_token") or token
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(access_token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    email = payload["sub"]
    user_doc = db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = User(user_doc, db)
    # Check verification status
    if not user_doc.get("is_verified", False) and not user_doc.get("google_user", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required",
        )
    return user

@router.get("/auth/config", response_model=Dict[str, Any])
def get_auth_config():
    """Returns public authentication configurations, like Google Client ID."""
    return {
        "google_client_id": settings.GOOGLE_CLIENT_ID
    }

@router.post("/auth/register", response_model=Dict[str, Any])
def register(response: Response, data: UserCreate, db = Depends(get_db)):
    try:
        user = AuthService.register_user(db, data)
        
        # Ensure is_verified is False initially for verification flow
        db.users.update_one({"email": user.email}, {"$set": {"is_verified": False}})
        
        # Generate and save OTP code and token for email verification link
        otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
        verification_token = secrets.token_urlsafe(32)
        
        db.otps.update_one(
            {"email": user.email},
            {"$set": {
                "otp": otp_code,
                "token": verification_token,
                "expires_at": time.time() + 600
            }},
            upsert=True
        )
        
        # Build email verification link (pointing to frontend /verify-email)
        verification_link = f"http://localhost:3001/verify-email?token={verification_token}"
        send_otp_email(user.email, otp_code, verification_link)
        
        response_data: Dict[str, Any] = {
            "success": True,
            "requires_verification": True,
            "message": "Verification link and OTP code sent to your email."
        }
        # In DEBUG_MODE, return the OTP code directly so developers can verify without email
        if settings.DEBUG_MODE:
            response_data["debug_otp"] = otp_code
            logger.info(f"[DEBUG MODE] OTP for {user.email}: {otp_code}")
        
        return response_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/login", response_model=Dict[str, Any])
def login(response: Response, data: UserLogin, db = Depends(get_db)):
    user = AuthService.authenticate_user(db, data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check verification status
    user_doc = db.users.find_one({"email": user.email})
    if not user_doc.get("is_verified", False) and not user_doc.get("google_user", False):
        # Generate new verification token and OTP
        otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
        verification_token = secrets.token_urlsafe(32)
        
        db.otps.update_one(
            {"email": user.email},
            {"$set": {
                "otp": otp_code,
                "token": verification_token,
                "expires_at": time.time() + 600
            }},
            upsert=True
        )
        
        verification_link = f"http://localhost:3001/verify-email?token={verification_token}"
        send_otp_email(user.email, otp_code, verification_link)
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "requires_verification": True,
                "message": "Email verification required. Verification code and link sent to your email."
            }
        )
        
    token = create_access_token({"sub": user.email})
    set_session_cookie(response, token)
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

@router.post("/auth/verify-otp", response_model=Dict[str, Any])
def verify_otp(response: Response, data: VerifyOtpRequest, db = Depends(get_db)):
    email = data.email
    otp = data.otp
    
    # Find OTP
    otp_record = db.otps.find_one({"email": email, "otp": otp})
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    # Check expiration
    if otp_record.get("expires_at", 0) < time.time():
        raise HTTPException(status_code=400, detail="Verification code has expired")
        
    # Mark user as verified
    db.users.update_one({"email": email}, {"$set": {"is_verified": True}})
    
    # Delete OTP record
    db.otps.delete_one({"_id": otp_record["_id"]})
    
    # Create session token and cookie
    token = create_access_token({"sub": email})
    set_session_cookie(response, token)
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/auth/resend-otp", response_model=Dict[str, Any])
def resend_otp(data: ResendOtpRequest, db = Depends(get_db)):
    email = data.email
    user_doc = db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_doc.get("is_verified", False) or user_doc.get("google_user", False):
        return {"success": True, "message": "Email is already verified"}
        
    # Generate new OTP and token
    otp_code = "".join(secrets.choice("0123456789") for _ in range(6))
    verification_token = secrets.token_urlsafe(32)
    db.otps.update_one(
        {"email": email},
        {"$set": {
            "otp": otp_code,
            "token": verification_token,
            "expires_at": time.time() + 600
        }},
        upsert=True
    )
    
    verification_link = f"http://localhost:3001/verify-email?token={verification_token}"
    send_otp_email(email, otp_code, verification_link)
    return {"success": True, "message": "Verification link and OTP code resent"}

@router.get("/auth/verify-email", response_model=Dict[str, Any])
def verify_email(response: Response, token: str, db = Depends(get_db)):
    """Verifies a user's email directly via the token from their verification link."""
    otp_record = db.otps.find_one({"token": token})
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid verification link")
        
    if otp_record.get("expires_at", 0) < time.time():
        raise HTTPException(status_code=400, detail="Verification link has expired")
        
    email = otp_record["email"]
    db.users.update_one({"email": email}, {"$set": {"is_verified": True}})
    db.otps.delete_one({"_id": otp_record["_id"]})
    
    session_token = create_access_token({"sub": email})
    set_session_cookie(response, session_token)
    return {
        "success": True,
        "access_token": session_token,
        "token_type": "bearer",
        "message": "Email verified successfully."
    }

@router.post("/auth/admin-bypass", response_model=Dict[str, Any])
def admin_bypass(response: Response, db = Depends(get_db)):
    """Direct enter bypass into the workspace for admin."""
    admin_email = "admin@studlyf.com"
    admin_doc = db.users.find_one({"email": admin_email})
    
    if not admin_doc:
        from backend.core.security import hash_password
        hashed = hash_password("adminpassword")
        datetime_now = time.time()
        admin_user_dict = {
            "email": admin_email,
            "name": "Studlyf Admin",
            "password_hash": hashed,
            "is_verified": True,
            "google_user": False,
            "is_admin": True,
            "created_at": datetime_now
        }
        res = db.users.insert_one(admin_user_dict)
        admin_uid = str(res.inserted_id)
        
        db.profiles.insert_one({
            "user_id": admin_uid,
            "registered": True,
            "is_public": False,
            "startup_name": "Studlyf Operations",
            "description": "Platform administration and operations workspace.",
            "industry": "AI & SaaS",
            "country": "India",
            "stage": "MVP",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "created_at": datetime_now,
            "updated_at": datetime_now
        })
        
        db.founder_profiles.insert_one({
            "user_id": admin_uid,
            "name": "Studlyf Admin",
            "email": admin_email,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "created_at": datetime_now
        })
        
        db.startups.insert_one({
            "user_id": admin_uid,
            "startup_name": "Studlyf Operations",
            "industry": "AI & SaaS",
            "stage": "MVP",
            "is_public": False,
            "created_at": datetime_now
        })
        admin_doc = db.users.find_one({"email": admin_email})
        
    user = User(admin_doc, db)
    token = create_access_token({"sub": user.email})
    set_session_cookie(response, token)
    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }

@router.post("/auth/google", response_model=Dict[str, Any])
async def google_login(response: Response, data: GoogleLoginRequest, db = Depends(get_db)):
    credential = data.credential
    
    # Check if mock credential or unconfigured settings to enable bypass
    google_client_id = settings.GOOGLE_CLIENT_ID
    firebase_project_id = settings.FIREBASE_PROJECT_ID
    
    is_mock = (
        credential == "mock_google_token" or 
        (not google_client_id and not firebase_project_id) or
        google_client_id == "your_google_client_id"
    )
    
    if is_mock:
        logger.info("Bypassing Google OAuth token verification: using Demo Google User.")
        email = "demo_google_founder@studlyf.com"
        name = "Google Demo Founder"
        avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        
        user = AuthService.register_google_user(db, email, name, avatar)
        token = create_access_token({"sub": user.email})
        set_session_cookie(response, token)
        return {
            "success": True,
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "name": user.name}
        }
        
    # Determine token type by inspecting the unverified issuer claim
    import jwt as pyjwt
    is_firebase_token = False
    try:
        unverified_payload = pyjwt.decode(credential, options={"verify_signature": False})
        iss = unverified_payload.get("iss", "")
        if "securetoken.google.com" in iss:
            is_firebase_token = True
    except Exception as e:
        logger.warning(f"Could not parse unverified token payload: {e}")
        
    # Verify Firebase ID token if token is a Firebase token and project ID is provided
    if is_firebase_token and firebase_project_id and firebase_project_id != "your_firebase_project_id":
        try:
            logger.info("Verifying Firebase ID Token...")
            # Fetch Google public keys
            async with httpx.AsyncClient() as client:
                r = await client.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com")
                if r.status_code != 200:
                    raise Exception("Failed to fetch Google public keys")
                public_keys = r.json()
                
            unverified_header = pyjwt.get_unverified_header(credential)
            kid = unverified_header.get("kid")
            if not kid or kid not in public_keys:
                raise HTTPException(status_code=400, detail="Invalid kid in ID token")
                
            cert = public_keys[kid]
            payload = pyjwt.decode(
                credential,
                cert,
                algorithms=["RS256"],
                audience=firebase_project_id,
                issuer=f"https://securetoken.google.com/{firebase_project_id}"
            )
            
            email = payload.get("email")
            name = payload.get("name", email.split("@")[0] if email else "Google User")
            avatar = payload.get("picture")
            
            if not email:
                raise HTTPException(status_code=400, detail="Could not retrieve email from Firebase ID Token")
                
            user = AuthService.register_google_user(db, email, name, avatar)
            token = create_access_token({"sub": user.email})
            set_session_cookie(response, token)
            return {
                "success": True,
                "access_token": token,
                "token_type": "bearer",
                "user": {"id": user.id, "email": user.email, "name": user.name}
            }
        except Exception as e:
            logger.error(f"Firebase token verification failed: {e}")
            raise HTTPException(status_code=400, detail=f"Firebase verification error: {str(e)}")
            
    # Verify credential via Google Tokeninfo API (fallback/standard Google Sign-In)
    try:
        async with httpx.AsyncClient() as client:
            response_api = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": credential},
                timeout=5.0
            )
            
        if response_api.status_code != 200:
            logger.error(f"Google token verification failed: {response_api.text}")
            raise HTTPException(status_code=400, detail="Invalid Google credential token")
            
        payload = response_api.json()
        
        # Optional audience check if client ID is configured and not default
        if google_client_id and google_client_id != "your_google_client_id" and google_client_id.strip():
            aud = payload.get("aud")
            if aud != google_client_id:
                logger.error(f"Google token audience mismatch: expected {google_client_id}, got {aud}")
                raise HTTPException(status_code=400, detail="Google token verification failed (audience mismatch)")
                
        email = payload.get("email")
        name = payload.get("name", email.split("@")[0] if email else "Google User")
        avatar = payload.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Could not retrieve email from Google credential")
            
        # Register or retrieve Google User
        user = AuthService.register_google_user(db, email, name, avatar)
        
        # Issue JWT Access Token and set cookie
        token = create_access_token({"sub": user.email})
        set_session_cookie(response, token)
        return {
            "success": True,
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "email": user.email, "name": user.name}
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in google_login endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Google authentication internal error: {str(e)}")

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
def update_profile(data: Dict[str, Any], db = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        profile = StartupService.update_profile(db, current_user, data)
        return {"success": True, "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/onboarding")
def onboard_user(data: OnboardingRequest, db = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = AuthService.onboard_user(db, current_user, data)
    return {
        "success": True,
        "profile": {
            "registered": profile.registered,
            "email": current_user.email,
            "name": current_user.name,
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

@router.post("/auth/update-profile")
def update_user_profile(data: Dict[str, Any], db = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Updates user account name and avatar. Email is immutable after registration."""
    update_fields = {}
    if "name" in data and data["name"].strip():
        update_fields["name"] = data["name"].strip()
    if "avatar" in data and data["avatar"].strip():
        update_fields["avatar"] = data["avatar"].strip()
    
    if update_fields:
        db.users.update_one({"email": current_user.email}, {"$set": update_fields})
        # Also sync avatar to the profile document
        profile_update = {}
        if "avatar" in update_fields:
            profile_update["avatar"] = update_fields["avatar"]
        if profile_update:
            db.profiles.update_one({"user_id": current_user.id}, {"$set": profile_update})
    
    # Return updated full profile
    updated_user = db.users.find_one({"email": current_user.email})
    return {
        "success": True,
        "name": updated_user.get("name", current_user.name),
        "email": current_user.email,
        "avatar": updated_user.get("avatar", current_user.profile.avatar if current_user.profile else "")
    }

@router.post("/logout")
def logout_endpoint(response: Response, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if current_user:
        db.profiles.update_one({"user_id": current_user.id}, {"$set": {"registered": False}})
        db.applications.delete_many({"user_id": current_user.id})
        db.roadmap_tasks.update_many({"user_id": current_user.id}, {"$set": {"completed": False}})
    response.delete_cookie(key="access_token")
    return {"success": True}
