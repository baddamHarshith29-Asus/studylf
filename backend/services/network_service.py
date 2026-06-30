import csv
import io
import time
import uuid
from typing import List, Dict, Any, Optional
from backend.models.models import User, Investor, Mentor, Contact
from backend.services.recommendation_service import RecommendationService
from backend.services.ai_service import AIService
from bson import ObjectId

class NetworkService:
    @staticmethod
    async def get_investors(db, user: Optional[User], industry: Optional[str] = None, stage: Optional[str] = None, revenue: Optional[str] = None) -> List[Dict[str, Any]]:
        """Queries investors, performs dynamic web searches to fetch real-world matches, caches them, and applies matching scores."""
        # 1. Fetch user profile context for search tailoring and overrides
        p = user.profile if user else None
        
        country = p.country if p else "India"
        stage_val = stage if stage else (p.stage if p else "Idea")
        industry_val = industry if industry else (p.industry if p else "AI & SaaS")
        revenue_val = revenue if revenue else (getattr(p, "annual_revenue", None) if p else "Pre-revenue")
            
        # 2. Perform live search retrieval of VCs/Angels
        from backend.services.ai_service import AIService
        real_investors = await AIService.search_real_investors(stage=stage_val, geography=country, industry=industry_val)
        
        # 3. Cache/Upsert real investors in MongoDB database
        import hashlib
        for inv in real_investors:
            name = inv.get("name")
            if not name:
                continue
            name_hash = hashlib.md5(name.encode('utf-8')).hexdigest()[:8]
            investor_id = f"inv-real-{name_hash}"
            
            db_investor = {
                "id": investor_id,
                "name": name,
                "type": inv.get("type", "Venture Capital"),
                "ticket_size": inv.get("ticket_size", "$100K"),
                "stages": inv.get("stages", [stage_val]),
                "sectors": inv.get("sectors", [industry_val]),
                "geography": inv.get("geography", country),
                "readiness_score": inv.get("readiness_score", 80),
                "match_reason": inv.get("match_reason", ""),
                "contact_email": inv.get("contact_email", "info@firm.com")
            }
            
            db.investors.update_one(
                {"id": investor_id},
                {"$set": db_investor},
                upsert=True
            )
            
        # 4. Query all stored investors
        investors = list(db.investors.find({}))
        investor_list = []
        for i in investors:
            investor_list.append({
                "id": i.get("id") or str(i["_id"]),
                "name": i.get("name"),
                "type": i.get("type"),
                "ticket_size": i.get("ticket_size"),
                "stages": i.get("stages", []),
                "sectors": i.get("sectors", []),
                "geography": i.get("geography"),
                "readiness_score": i.get("readiness_score", 80),
                "match_reason": i.get("match_reason", ""),
                "contact_email": i.get("contact_email", "")
            })
            
        profile_data = {
            "startupName": p.startup_name if p else "",
            "description": p.description if p else "",
            "stage": stage_val,
            "industry": industry_val,
            "country": country,
            "legalEntityType": getattr(p, "legal_entity_type", "Unincorporated / Individual") if p else "Unincorporated / Individual",
            "dpiitRecognized": getattr(p, "dpiit_recognized", False) if p else False,
            "incorporationDate": getattr(p, "incorporation_date", "") if p else "",
            "annualTurnoverCrores": getattr(p, "annual_turnover_crores", 0.0) if p else 0.0,
            "annualRevenue": revenue_val,
            "has_validation": db.validation_reports.count_documents({"user_id": user.id}) > 0 if user else False,
            "has_applications": db.applications.count_documents({"user_id": user.id}) > 0 if user else False
        }
            
        return RecommendationService.match_investors(profile_data, investor_list)

    @staticmethod
    def get_mentors(db, user: Optional[User], industry: Optional[str] = None, stage: Optional[str] = None, geography: Optional[str] = None) -> List[Dict[str, Any]]:
        """Queries mentors and ranks them by stage, industry, and geography fit."""
        mentors = list(db.mentors.find({}))
        mentor_list = []
        for m in mentors:
            mentor_list.append({
                "id": m.get("id") or str(m["_id"]),
                "name": m.get("name"),
                "role": m.get("role"),
                "expertise": m.get("expertise", []),
                "availability": m.get("availability"),
                "experience": m.get("experience"),
                "geography": m.get("geography"),
                "stages": m.get("stages", []),
                "image": m.get("image", "")
            })
            
        stage_val = stage if stage else (user.profile.stage if user and user.profile else "Idea")
        industry_val = industry if industry else (user.profile.industry if user and user.profile else "AI & SaaS")
        geo_val = geography if geography else (user.profile.country if user and user.profile else "India")
        
        profile_data = {"stage": stage_val}
        sorted_mentors = RecommendationService.match_mentors(profile_data, mentor_list)
        
        result = []
        for m in sorted_mentors:
            # Dynamic matching score calculation
            m_exp = [x.lower() for x in m["expertise"]]
            industry_words = [w.lower() for w in industry_val.replace("&", " ").split()]
            expertise_match = any(any(w in x for w in industry_words) for x in m_exp)
            
            stages = [s.lower() for s in m["stages"]]
            stage_match = stage_val.lower() in stages
            
            geo_match = m["geography"].lower() == "any" or m["geography"].lower() == "global" or geo_val.lower() in m["geography"].lower()
            
            score = 100
            if not stage_match:
                score -= 20
            if not expertise_match:
                score -= 15
            if not geo_match:
                score -= 10
            score = max(40, score)
            
            result.append({
                "id": m["id"],
                "name": m["name"],
                "role": m["role"],
                "expertise": m["expertise"],
                "availability": m["availability"],
                "experience": m["experience"],
                "geography": m["geography"],
                "stages": m["stages"],
                "image": m["image"],
                "matchScore": score
            })
        return sorted(result, key=lambda x: x["matchScore"], reverse=True)
        
    @staticmethod
    def get_relationship_path(user: User, contact_name: str, target_entity: str) -> Dict[str, Any]:
        """Calculates mock connection path representation."""
        founder_name = user.name if user else "You (Founder)"
        path = [
            {"name": founder_name, "type": "founder"},
            {"name": contact_name, "type": "contact"},
            {"name": f"{target_entity} Partner", "type": "target"}
        ]
        return {
            "success": True,
            "path": path,
            "strength": "Strong (Frequent emails detected in metadata upload)",
            "advice": (
                f"{contact_name} has co-invested with {target_entity} twice in the last 12 months. "
                f"Request a 15-minute sync with {contact_name} first to ask for a warm double-opt-in intro."
            )
        }

    @staticmethod
    def import_linkedin_contacts_csv(db, user: User, csv_content: str) -> Dict[str, Any]:
        """Parses a LinkedIn connections CSV export and imports contacts to the database."""
        if not user:
            return {"success": False, "error": "Unauthorized"}
            
        f = io.StringIO(csv_content.strip())
        reader = csv.reader(f)
        headers = []
        rows = []
        for row in reader:
            if not row:
                continue
            # Look for standard headers
            if "First Name" in row or "Last Name" in row or "Company" in row or "Position" in row:
                headers = [h.strip() for h in row]
                break
        
        if not headers:
            f.seek(0)
            reader = csv.DictReader(f)
            rows = list(reader)
        else:
            for row in reader:
                if len(row) == len(headers):
                    rows.append(dict(zip(headers, row)))
        
        imported_count = 0
        contacts_to_insert = []
        for row in rows:
            first_name = row.get("First Name") or row.get("first_name") or ""
            last_name = row.get("Last Name") or row.get("last_name") or ""
            name = f"{first_name} {last_name}".strip()
            if not name:
                continue
                
            company = row.get("Company") or row.get("company") or ""
            position = row.get("Position") or row.get("position") or ""
            email = row.get("Email Address") or row.get("email") or ""
            
            notes = f"Position: {position} at {company}."
            
            contact_id = f"contact-{uuid.uuid4().hex[:8]}"
            contacts_to_insert.append({
                "id": contact_id,
                "user_id": user.id,
                "name": name,
                "company": f"{position} @ {company}" if position else company,
                "email": email,
                "relationship_strength": "Medium",
                "notes": notes,
                "created_at": time.time()
            })
            
        if contacts_to_insert:
            db.contacts.delete_many({"user_id": user.id}) # Clear old imported connections
            db.contacts.insert_many(contacts_to_insert)
            imported_count = len(contacts_to_insert)
            
        return {"success": True, "count": imported_count}

    @staticmethod
    async def analyze_linkedin_network(db, user: User, startup_idea: str) -> Dict[str, Any]:
        """Matches a startup idea against user's uploaded professional contacts (LinkedIn import)."""
        if not user:
            return {"success": False, "error": "Unauthorized"}
            
        contacts = list(db.contacts.find({"user_id": user.id}))
        
        # Seed default mock LinkedIn connections if database is empty
        if not contacts:
            seeds = [
                {
                    "name": "Priya Sharma",
                    "company": "Lead Engineer @ Razorpay",
                    "email": "priya.sharma@razorpay.com",
                    "relationship_strength": "Strong",
                    "notes": "Full-stack developer, expert in Node.js, Python, PostgreSQL, scale architectures."
                },
                {
                    "name": "Rohan Deshmukh",
                    "company": "VP GTM Strategy @ BrowserStack",
                    "email": "rohan.deshmukh@browserstack.com",
                    "relationship_strength": "Medium",
                    "notes": "Helped launch BrowserStack enterprise products. Specializes in Sales, SEO, and inbound marketing."
                },
                {
                    "name": "Vikram Malhotra",
                    "company": "Investment Director @ Peak XV Partners",
                    "email": "vikram.m@peakxv.com",
                    "relationship_strength": "Medium",
                    "notes": "Prior co-worker. Invests in early-stage fintech, SaaS, and GenAI applications."
                },
                {
                    "name": "Amit Goel",
                    "company": "Co-founder @ SaaSify",
                    "email": "amit.goel@saasify.io",
                    "relationship_strength": "Weak",
                    "notes": "College junior. Experienced product manager, built MVPs for SaaSify from scratch."
                }
            ]
            contacts_to_insert = []
            for s in seeds:
                contacts_to_insert.append({
                    "id": f"contact-{s['name'].replace(' ', '-').lower()}",
                    "user_id": user.id,
                    "name": s["name"],
                    "company": s["company"],
                    "email": s["email"],
                    "relationship_strength": s["relationship_strength"],
                    "notes": s["notes"],
                    "created_at": time.time()
                })
            db.contacts.insert_many(contacts_to_insert)
            contacts = list(db.contacts.find({"user_id": user.id}))
            
        contacts_data = [{
            "name": c.get("name"),
            "company": c.get("company"),
            "notes": c.get("notes")
        } for c in contacts]
        
        recommendations = await AIService.match_linkedin_network(startup_idea, contacts_data)
        return {
            "success": True,
            "recommendations": recommendations
        }
