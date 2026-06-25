import uuid
import time
from backend.models.models import JobOpportunity, JobApplication, Profile
from typing import List, Dict, Any
from bson import ObjectId

class OpportunityService:
    @staticmethod
    def get_opportunities(db) -> List[Dict[str, Any]]:
        """Retrieves list of active ecosystem job/support opportunities."""
        opportunities = list(db.job_opportunities.find({}))
        
        # Seed default items if database is empty
        if not opportunities:
            default_profile = db.profiles.find_one({})
            startup_id = str(default_profile["_id"]) if default_profile else "seed-startup-id"
            
            seeds = [
                {
                    "id": "opp-seed-1",
                    "startup_id": startup_id,
                    "title": "Lead AI Engineer",
                    "role_type": "Team Member",
                    "description": "Looking for a founding AI engineer to lead our NLP/LLM orchestration efforts.",
                    "requirements": "3+ years Python experience, familiarity with LangChain and API designs.",
                    "equity_range": "1.0% - 2.5%",
                    "created_at": time.time()
                },
                {
                    "id": "opp-seed-2",
                    "startup_id": startup_id,
                    "title": "Venture Mentor / GTM Consultant",
                    "role_type": "Mentor",
                    "description": "Seeking a mentor with a strong sales background to advise our B2B pricing model.",
                    "requirements": "Prior experience scale-up sales, advisor network matches.",
                    "equity_range": "0.1% - 0.5% Advisory",
                    "created_at": time.time()
                }
            ]
            db.job_opportunities.insert_many(seeds)
            opportunities = list(db.job_opportunities.find({}))
            
        result = []
        for opp in opportunities:
            # Fetch profile details
            p_id = opp.get("startup_id")
            try:
                p = db.profiles.find_one({"_id": ObjectId(p_id)})
            except Exception:
                p = db.profiles.find_one({"_id": p_id}) or db.profiles.find_one({"user_id": p_id})
                
            result.append({
                "id": opp.get("id") or str(opp["_id"]),
                "startupId": p_id,
                "startupName": p.get("startup_name") if p else "STUDLYF Venture",
                "startupIndustry": p.get("industry") if p else "AI & SaaS",
                "startupStage": p.get("stage") if p else "MVP",
                "title": opp.get("title"),
                "roleType": opp.get("role_type"),
                "description": opp.get("description"),
                "requirements": opp.get("requirements"),
                "equityRange": opp.get("equity_range"),
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(opp.get("created_at", time.time())))
            })
        return result

    @staticmethod
    def post_opportunity(db, startup_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new opportunity post for a startup (Wellfound model)."""
        opp_id = f"opp-{uuid.uuid4().hex[:8]}"
        opp_dict = {
            "id": opp_id,
            "startup_id": startup_id,
            "title": data.get("title", "Founding Engineer"),
            "role_type": data.get("roleType", "Team Member"),
            "description": data.get("description", ""),
            "requirements": data.get("requirements", ""),
            "equity_range": data.get("equityRange", "0.0%"),
            "created_at": time.time()
        }
        db.job_opportunities.insert_one(opp_dict)
        
        try:
            p = db.profiles.find_one({"_id": ObjectId(startup_id)})
        except Exception:
            p = db.profiles.find_one({"_id": startup_id}) or db.profiles.find_one({"user_id": startup_id})
            
        return {
            "success": True,
            "opportunity": {
                "id": opp_id,
                "startupId": startup_id,
                "startupName": p.get("startup_name") if p else "STUDLYF Venture",
                "title": opp_dict["title"],
                "roleType": opp_dict["role_type"],
                "description": opp_dict["description"],
                "requirements": opp_dict["requirements"],
                "equityRange": opp_dict["equity_range"]
            }
        }

    @staticmethod
    def apply_opportunity(db, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Submits a user application to support a startup opportunity."""
        app_id = f"app-{uuid.uuid4().hex[:8]}"
        opp_id = data.get("opportunityId")
        
        opp = db.job_opportunities.find_one({"id": opp_id})
        if not opp:
            raise ValueError("Opportunity not found")
            
        app_dict = {
            "id": app_id,
            "opportunity_id": opp_id,
            "user_id": user_id,
            "role_applied": opp.get("role_type"),
            "pitch_notes": data.get("pitchNotes", ""),
            "status": "Pending",
            "created_at": time.time()
        }
        db.job_applications.insert_one(app_dict)
        return {
            "success": True,
            "message": "Application submitted successfully",
            "applicationId": app_id
        }

    @staticmethod
    def get_applications_for_startup(db, startup_id: str) -> List[Dict[str, Any]]:
        """Retrieves all applications submitted to opportunities posted by a startup."""
        opps = list(db.job_opportunities.find({"startup_id": startup_id}))
        opp_ids = [opp.get("id") for opp in opps if opp.get("id")]
        
        if not opp_ids:
            return []
            
        apps = list(db.job_applications.find({"opportunity_id": {"$in": opp_ids}}))
        
        result = []
        for a in apps:
            opp = db.job_opportunities.find_one({"id": a.get("opportunity_id")})
            
            uid = a.get("user_id")
            try:
                usr = db.users.find_one({"_id": ObjectId(uid)})
            except Exception:
                usr = db.users.find_one({"_id": uid})
                
            result.append({
                "id": a.get("id"),
                "opportunityTitle": opp.get("title") if opp else "Unknown Position",
                "roleType": a.get("role_applied"),
                "applicantName": usr.get("name") if usr else "Alex Applicant",
                "applicantEmail": usr.get("email") if usr else "alex@applicant.io",
                "pitchNotes": a.get("pitch_notes"),
                "status": a.get("status", "Pending"),
                "appliedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(a.get("created_at", time.time())))
            })
        return result

    @staticmethod
    def update_application_status(db, startup_id: str, app_id: str, status: str) -> bool:
        """Updates decision status (Accepted/Rejected) of an application if the opportunity belongs to this startup."""
        app = db.job_applications.find_one({"id": app_id})
        if not app:
            return False
            
        opp = db.job_opportunities.find_one({"id": app.get("opportunity_id")})
        if not opp or opp.get("startup_id") != startup_id:
            return False
            
        db.job_applications.update_one(
            {"id": app_id},
            {"$set": {"status": status}}
        )
        return True
