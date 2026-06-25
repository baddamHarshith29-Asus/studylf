import time
from typing import List, Dict, Any, Optional
from backend.models.models import User, FundingScheme, Application, RadarItem
from backend.schemas.schemas import ApplicationCreate, ApplicationUpdateStatus

class FundingService:
    @staticmethod
    def get_schemes(db) -> List[FundingScheme]:
        """Lists all funding schemes in the database."""
        schemes = list(db.funding_schemes.find({}))
        return [FundingScheme(s, db) for s in schemes]

    @staticmethod
    def get_applications(db, user: User) -> List[Application]:
        """Lists applications submitted by the user."""
        apps = list(db.applications.find({"user_id": user.id}))
        return [Application(a, db) for a in apps]

    @staticmethod
    def create_application(db, user: User, data: ApplicationCreate) -> Application:
        """Applies to a funding scheme and logs user application status."""
        scheme_doc = db.funding_schemes.find_one({"id": data.schemeId})
        if not scheme_doc:
            raise ValueError("Scheme not found")
            
        app_id = f"app-{int(time.time() * 1000)}"
        applied_date = time.strftime("%Y-%m-%d")
        
        new_app_dict = {
            "id": app_id,
            "user_id": user.id,
            "scheme_id": data.schemeId,
            "status": "Applied",
            "applied_date": applied_date,
            "notes": data.notes or "Applied via STUDLYF workspace auto-fill.",
            "created_at": time.time()
        }
        db.applications.insert_one(new_app_dict)
        return Application(new_app_dict, db)

    @staticmethod
    def update_application_status(db, user: User, data: ApplicationUpdateStatus) -> bool:
        """Updates the status and notes of a user application."""
        app_doc = db.applications.find_one({
            "id": data.id,
            "user_id": user.id
        })
        if not app_doc:
            return False
            
        update_fields = {"status": data.status}
        if data.notes:
            update_fields["notes"] = data.notes
            
        db.applications.update_one(
            {"id": data.id, "user_id": user.id},
            {"$set": update_fields}
        )
        return True

    @staticmethod
    def get_radar_items(db) -> List[RadarItem]:
        """Lists ecosystem news/radar updates."""
        items = list(db.radar_items.find({}))
        return [RadarItem(i, db) for i in items]
