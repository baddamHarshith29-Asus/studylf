from fastapi import APIRouter, Depends, HTTPException
from backend.core.database import get_db
from typing import Dict, Any
from bson import ObjectId

router = APIRouter()

@router.get("/public/startup/{slug}")
def get_public_startup_by_slug(slug: str, db = Depends(get_db)):
    """Public lookup for startup profiles by slug (e.g. studlyf.com/startup/healthai)."""
    p_doc = db.profiles.find_one({"slug": slug})
    if not p_doc:
        raise HTTPException(status_code=404, detail="Public startup profile not found")
        
    uid = p_doc.get("user_id")
    try:
        usr = db.users.find_one({"_id": ObjectId(uid)})
    except Exception:
        usr = db.users.find_one({"_id": uid})
        
    return {
        "success": True,
        "profile": {
            "startupName": p_doc.get("startup_name") or "Founding Venture",
            "description": p_doc.get("description") or "Building next generation SaaS products.",
            "industry": p_doc.get("industry") or "AI & SaaS",
            "country": p_doc.get("country") or "India",
            "stage": p_doc.get("stage") or "Idea",
            "avatar": p_doc.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "slug": p_doc.get("slug") or slug,
            "founderName": usr.get("name") if usr else "Alex Founder",
            "founderEmail": usr.get("email") if usr else "alex@startup.io"
        }
    }
