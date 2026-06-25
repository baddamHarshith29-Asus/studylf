import re
from typing import Dict, Any, List, Optional
from backend.models.models import User, Profile

class StartupService:
    @staticmethod
    def get_slug(name: str) -> str:
        """Generates a URL-friendly slug from the startup name."""
        if not name:
            return ""
        # Lowercase, strip non-alphanumeric except spaces and hyphens
        name = name.lower().strip()
        name = re.sub(r'[^a-z0-9\s-]', '', name)
        # Replace spaces/multiple hyphens with a single hyphen
        return re.sub(r'[\s-]+', '-', name)

    @staticmethod
    def get_profile(db, user: User) -> Dict[str, Any]:
        """Gets user profile info formatted for the frontend."""
        if not user:
            return {
                "registered": False,
                "email": "",
                "name": "",
                "startupName": "",
                "description": "",
                "industry": "AI & SaaS",
                "country": "India",
                "stage": "Idea",
                "is_public": False,
                "slug": "",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            }
            
        p = user.profile
        if not p:
            return {
                "registered": False,
                "email": user.email,
                "name": user.name,
                "startupName": "",
                "description": "",
                "industry": "AI & SaaS",
                "country": "India",
                "stage": "Idea",
                "is_public": False,
                "slug": "",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            }
            
        return {
            "registered": p.registered,
            "email": user.email,
            "name": user.name,
            "startupName": p.startup_name or "",
            "description": p.description or "",
            "industry": p.industry or "AI & SaaS",
            "country": p.country or "India",
            "stage": p.stage or "Idea",
            "is_public": getattr(p, "is_public", False),
            "slug": getattr(p, "slug", StartupService.get_slug(p.startup_name)),
            "avatar": p.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        }

    @staticmethod
    def update_profile(db, user: User, data: Dict[str, Any]) -> Dict[str, Any]:
        """Updates user profile attributes in MongoDB."""
        p = user.profile
        if not p:
            raise ValueError("Profile not found")
            
        update_fields = {}
        if "stage" in data:
            update_fields["stage"] = data["stage"]
        if "description" in data:
            update_fields["description"] = data["description"]
        if "industry" in data:
            update_fields["industry"] = data["industry"]
        if "country" in data:
            update_fields["country"] = data["country"]
        if "startupName" in data:
            update_fields["startup_name"] = data["startupName"]
            update_fields["slug"] = StartupService.get_slug(data["startupName"])
        if "is_public" in data:
            update_fields["is_public"] = bool(data["is_public"])
        if "avatar" in data:
            update_fields["avatar"] = data["avatar"]
            
        if update_fields:
            db.profiles.update_one({"user_id": user.id}, {"$set": update_fields})
            
        # Refresh current user's profile state
        return StartupService.get_profile(db, user)

    @staticmethod
    def get_public_directory(db) -> List[Dict[str, Any]]:
        """Retrieves list of all public-facing startups for YC directory."""
        public_profiles = list(db.profiles.find({"is_public": True}))
        
        # If directory is empty, seed or make first few public for demo/UX
        if not public_profiles:
            all_profiles = list(db.profiles.find({}))
            for p in all_profiles[:3]:
                p_id = p["_id"]
                slug = StartupService.get_slug(p.get("startup_name", "Founding Venture"))
                db.profiles.update_one({"_id": p_id}, {"$set": {"is_public": True, "slug": slug}})
            public_profiles = list(db.profiles.find({"is_public": True}))
            
        result = []
        for p in public_profiles:
            usr = db.users.find_one({"_id": ObjectId(p["user_id"])}) if isinstance(p.get("user_id"), str) else db.users.find_one({"_id": p["user_id"]})
            result.append({
                "id": str(p["_id"]),
                "startupName": p.get("startup_name") or "Founding Venture",
                "description": p.get("description") or "Building next generation SaaS products.",
                "industry": p.get("industry") or "AI & SaaS",
                "country": p.get("country") or "India",
                "stage": p.get("stage") or "Idea",
                "avatar": p.get("avatar") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "slug": p.get("slug") or StartupService.get_slug(p.get("startup_name")),
                "founderName": usr.get("name") if usr else "Alex Founder",
                "founderEmail": usr.get("email") if usr else "alex@startup.io"
            })
        return result

    @staticmethod
    def toggle_public_visibility(db, user: User, is_public: bool) -> Dict[str, Any]:
        """Toggles the public status of the user's company profile."""
        p = user.profile
        if not p:
            raise ValueError("Profile not found")
        
        db.profiles.update_one(
            {"user_id": user.id}, 
            {"$set": {
                "is_public": is_public,
                "slug": StartupService.get_slug(p.startup_name)
            }}
        )
        return {"success": True, "is_public": is_public}
