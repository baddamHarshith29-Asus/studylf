import time
from typing import List, Dict, Any, Optional
from backend.models.models import User, FundingScheme, Application, RadarItem
from backend.schemas.schemas import ApplicationCreate, ApplicationUpdateStatus

class FundingService:
    @staticmethod
    async def get_schemes(db, user: Optional[User]) -> List[FundingScheme]:
        """Lists active funding schemes, performing dynamic web searches to fetch real-world opportunities and caching them."""
        # 1. Fetch user profile context for search tailoring
        stage = "Idea"
        country = "India"
        industry = "AI & SaaS"
        if user and user.profile:
            stage = user.profile.stage or stage
            country = user.profile.country or country
            industry = user.profile.industry or industry
            
        # 2. Perform live search retrieval
        from backend.services.ai_service import AIService
        real_schemes = await AIService.search_real_funding_schemes(stage=stage, country=country, industry=industry)
        
        # 3. Cache/Upsert real schemes in MongoDB database to ensure application tracking ID compatibility
        import hashlib
        for s in real_schemes:
            name = s.get("name")
            if not name:
                continue
            # Create a stable unique ID based on a hash of the name
            name_hash = hashlib.md5(name.encode('utf-8')).hexdigest()[:8]
            scheme_id = f"f-real-{name_hash}"
            
            # Map LLM JSON naming to database field conventions
            criteria_dict = s.get("criteria", {})
            db_scheme = {
                "id": scheme_id,
                "name": name,
                "provider": s.get("provider", "Government Agency"),
                "type": s.get("type", "Grant / Debt"),
                "description": s.get("description", ""),
                "amount": s.get("amount", "Non-dilutive funding"),
                "equity": s.get("equity", "0%"),
                "deadline": s.get("deadline", "Rolling"),
                "apply_link": s.get("apply_link", "https://www.startupindia.gov.in"),
                "stages": s.get("stages", [stage]),
                "countries": s.get("countries", [country]),
                "industries": s.get("industries", [industry]),
                "criteria": {
                    "minStage": criteria_dict.get("minStage", stage),
                    "maxStage": criteria_dict.get("maxStage", "Revenue"),
                    "mustBeIncorporated": bool(criteria_dict.get("mustBeIncorporated", False)),
                    "dpiitRecognized": bool(criteria_dict.get("dpiitRecognized", False))
                },
                "last_verified": s.get("last_verified", "2026-06-30")
            }
            
            db.funding_schemes.update_one(
                {"id": scheme_id},
                {"$set": db_scheme},
                upsert=True
            )
            
        # 4. Query all stored schemes from MongoDB (this ensures both new dynamically discovered and defaults are returned)
        schemes = list(db.funding_schemes.find({}))
        # Sort real ones to the top
        schemes = sorted(schemes, key=lambda x: 1 if x.get("id", "").startswith("f-real-") else 0, reverse=True)
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
