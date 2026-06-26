import time
from typing import Dict, Any, Optional
from backend.core.security import hash_password, verify_password, create_access_token
from backend.models.models import User, Profile, RoadmapTask
from backend.schemas.schemas import OnboardingRequest, UserCreate, UserLogin
from backend.core.constants import DEFAULT_ROADMAP_TASKS
from backend.core.logger import logger
from bson import ObjectId

class AuthService:
    @staticmethod
    def register_user(db, data: UserCreate) -> User:
        """Registers a new user and creates an empty Profile in MongoDB."""
        existing_user = db.users.find_one({"email": data.email})
        if existing_user:
            raise ValueError("Email already registered")
            
        hashed = hash_password(data.password)
        datetime_now = time.time()
        new_user_dict = {
            "email": data.email,
            "name": data.name,
            "password_hash": hashed,
            "is_verified": False,
            "google_user": False,
            "created_at": datetime_now
        }
        res = db.users.insert_one(new_user_dict)
        user_id = str(res.inserted_id)
        
        # Create user profile
        profile_dict = {
            "user_id": user_id,
            "registered": False,
            "is_public": False,
            "startup_name": "",
            "description": "",
            "industry": "AI & SaaS",
            "country": "India",
            "stage": "Idea",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "created_at": datetime_now,
            "updated_at": datetime_now
        }
        db.profiles.insert_one(profile_dict)
        
        # Create founder profile
        db.founder_profiles.insert_one({
            "user_id": user_id,
            "name": data.name,
            "email": data.email,
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "created_at": datetime_now
        })
        
        # Create startups
        db.startups.insert_one({
            "user_id": user_id,
            "startup_name": "",
            "industry": "AI & SaaS",
            "stage": "Idea",
            "is_public": False,
            "created_at": datetime_now
        })
        
        user_doc = db.users.find_one({"_id": res.inserted_id})
        return User(user_doc, db)

    @staticmethod
    def register_google_user(db, email: str, name: str, avatar: Optional[str] = None) -> User:
        """Registers a new Google user (pre-verified) or returns an existing one, updating details."""
        existing_user = db.users.find_one({"email": email})
        datetime_now = time.time()
        
        if existing_user:
            # Update user to be Google user
            db.users.update_one(
                {"_id": existing_user["_id"]},
                {"$set": {"google_user": True, "is_verified": True}}
            )
            # Ensure profile has details
            user_id = str(existing_user["_id"])
            db.profiles.update_one(
                {"user_id": user_id},
                {"$set": {"updated_at": datetime_now}}
            )
            user_doc = db.users.find_one({"_id": existing_user["_id"]})
            return User(user_doc, db)
            
        # Register new Google user
        new_user_dict = {
            "email": email,
            "name": name,
            "password_hash": "google_oauth_no_password",
            "is_verified": True,
            "google_user": True,
            "created_at": datetime_now
        }
        res = db.users.insert_one(new_user_dict)
        user_id = str(res.inserted_id)
        
        avatar_url = avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        
        # Create user profile
        profile_dict = {
            "user_id": user_id,
            "registered": False,
            "is_public": False,
            "startup_name": "",
            "description": "",
            "industry": "AI & SaaS",
            "country": "India",
            "stage": "Idea",
            "avatar": avatar_url,
            "created_at": datetime_now,
            "updated_at": datetime_now
        }
        db.profiles.insert_one(profile_dict)
        
        # Create founder profile
        db.founder_profiles.insert_one({
            "user_id": user_id,
            "name": name,
            "email": email,
            "avatar": avatar_url,
            "created_at": datetime_now
        })
        
        # Create startups
        db.startups.insert_one({
            "user_id": user_id,
            "startup_name": "",
            "industry": "AI & SaaS",
            "stage": "Idea",
            "is_public": False,
            "created_at": datetime_now
        })
        
        user_doc = db.users.find_one({"_id": res.inserted_id})
        return User(user_doc, db)

    @staticmethod
    def authenticate_user(db, data: UserLogin) -> Optional[User]:
        """Authenticates email/password, returning User object if successful."""
        user_doc = db.users.find_one({"email": data.email})
        if not user_doc:
            return None
        if not verify_password(data.password, user_doc.get("password_hash")):
            return None
        return User(user_doc, db)

    @staticmethod
    def onboard_user(db, user: User, data: OnboardingRequest) -> Profile:
        """Completes user onboarding by populating profile and seeding roadmap tasks in MongoDB."""
        profile_doc = db.profiles.find_one({"user_id": user.id})
        datetime_now = time.time()
        if not profile_doc:
            profile_dict = {
                "user_id": user.id,
                "registered": True,
                "is_public": False,
                "startup_name": data.startupName,
                "description": data.description,
                "industry": data.industry,
                "country": data.country,
                "stage": data.stage,
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "created_at": datetime_now,
                "updated_at": datetime_now
            }
            db.profiles.insert_one(profile_dict)
        else:
            db.profiles.update_one(
                {"user_id": user.id},
                {"$set": {
                    "registered": True,
                    "startup_name": data.startupName,
                    "description": data.description,
                    "industry": data.industry,
                    "country": data.country,
                    "stage": data.stage,
                    "updated_at": datetime_now
                }}
            )
            
        # Update founder profile
        db.founder_profiles.update_one(
            {"user_id": user.id},
            {"$set": {
                "name": data.name,
                "email": data.email
            }},
            upsert=True
        )
        
        # Update startups
        db.startups.update_one(
            {"user_id": user.id},
            {"$set": {
                "startup_name": data.startupName,
                "industry": data.industry,
                "stage": data.stage,
                "updated_at": datetime_now
            }},
            upsert=True
        )
            
        # Seed default tasks for this user if they don't have any
        existing_tasks = db.roadmap_tasks.count_documents({"user_id": user.id})
        if existing_tasks == 0:
            tasks_to_insert = []
            for stage_name, tasks_list in DEFAULT_ROADMAP_TASKS.items():
                for idx, task in enumerate(tasks_list):
                    tasks_to_insert.append({
                        "id": f"t-{stage_name.lower()}-{idx}-{user.id}",
                        "user_id": user.id,
                        "text": task["text"],
                        "completed": False,
                        "category": task["category"],
                        "stage": stage_name,
                        "guide_id": task.get("guide_id"),
                        "created_at": datetime_now
                    })
            if tasks_to_insert:
                db.roadmap_tasks.insert_many(tasks_to_insert)
                
        updated_profile_doc = db.profiles.find_one({"user_id": user.id})
        return Profile(updated_profile_doc, db)
