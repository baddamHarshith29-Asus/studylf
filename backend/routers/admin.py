from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
import time
from backend.core.database import get_db
from backend.models.models import FundingScheme, Investor, Mentor
from backend.schemas.schemas import AdminGrantCreate, AdminInvestorCreate, AdminMentorCreate

router = APIRouter()

@router.post("/admin/grants")
def admin_create_grant(data: AdminGrantCreate, db = Depends(get_db)):
    scheme_id = f"f-{int(time.time() * 1000)}"
    last_verified = time.strftime("%Y-%m-%d")
    
    grant_dict = {
        "id": scheme_id,
        "name": data.name,
        "provider": data.provider,
        "type": data.type,
        "description": data.description,
        "amount": data.amount,
        "equity": data.equity,
        "deadline": data.deadline,
        "apply_link": data.applyLink,
        "stages": data.stages,
        "countries": data.countries,
        "industries": data.industries,
        "criteria": {
            "minStage": data.stages[0] if data.stages else "Idea",
            "maxStage": data.stages[-1] if data.stages else "MVP",
            "mustBeIncorporated": True,
            "dpiitRecognized": True
        },
        "last_verified": last_verified
    }
    db.funding_schemes.insert_one(grant_dict)
    return {
        "success": True,
        "scheme": {
            "id": scheme_id,
            "name": grant_dict["name"],
            "provider": grant_dict["provider"],
            "type": grant_dict["type"],
            "description": grant_dict["description"],
            "amount": grant_dict["amount"],
            "equity": grant_dict["equity"],
            "deadline": grant_dict["deadline"],
            "applyLink": grant_dict["apply_link"],
            "stages": grant_dict["stages"],
            "countries": grant_dict["countries"],
            "industries": grant_dict["industries"],
            "lastVerified": grant_dict["last_verified"]
        }
    }

@router.delete("/admin/grants/{id}")
def admin_delete_grant(id: str, db = Depends(get_db)):
    res = db.funding_schemes.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"success": True}

@router.post("/admin/investors")
def admin_create_investor(data: AdminInvestorCreate, db = Depends(get_db)):
    investor_id = f"inv-{int(time.time() * 1000)}"
    inv_dict = {
        "id": investor_id,
        "name": data.name,
        "type": data.type,
        "ticket_size": data.ticketSize,
        "sectors": data.sectors,
        "geography": data.geography,
        "readiness_score": data.readinessScore,
        "match_reason": "Added by Admin ops team.",
        "contact_email": data.contactEmail,
        "stages": ["Idea", "Validation", "MVP", "Revenue"]
    }
    db.investors.insert_one(inv_dict)
    return {
        "success": True,
        "investor": {
            "id": investor_id,
            "name": inv_dict["name"],
            "type": inv_dict["type"],
            "ticketSize": inv_dict["ticket_size"],
            "sectors": inv_dict["sectors"],
            "geography": inv_dict["geography"],
            "readinessScore": inv_dict["readiness_score"],
            "matchReason": inv_dict["match_reason"],
            "contactEmail": inv_dict["contact_email"],
            "stages": inv_dict["stages"]
        }
    }

@router.delete("/admin/investors/{id}")
def admin_delete_investor(id: str, db = Depends(get_db)):
    res = db.investors.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investor not found")
    return {"success": True}

@router.post("/admin/mentors")
def admin_create_mentor(data: AdminMentorCreate, db = Depends(get_db)):
    mentor_id = f"m-{int(time.time() * 1000)}"
    mentor_dict = {
        "id": mentor_id,
        "name": data.name,
        "role": data.role,
        "expertise": data.expertise,
        "availability": data.availability,
        "experience": data.experience,
        "geography": data.geography,
        "stages": ["Idea", "Validation", "MVP"],
        "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
    db.mentors.insert_one(mentor_dict)
    return {
        "success": True,
        "mentor": {
            "id": mentor_id,
            "name": mentor_dict["name"],
            "role": mentor_dict["role"],
            "expertise": mentor_dict["expertise"],
            "availability": mentor_dict["availability"],
            "experience": mentor_dict["experience"],
            "geography": mentor_dict["geography"],
            "stages": mentor_dict["stages"],
            "image": mentor_dict["image"]
        }
    }

@router.delete("/admin/mentors/{id}")
def admin_delete_mentor(id: str, db = Depends(get_db)):
    res = db.mentors.delete_one({"id": id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return {"success": True}

class AISettingsSaveRequest(BaseModel):
    primary: str
    secondary: str
    fallback: str

@router.get("/admin/ai/status")
async def get_ai_providers_status():
    from backend.ai.provider_factory import ProviderFactory
    groq = ProviderFactory.get_provider("groq")
    gemini = ProviderFactory.get_provider("gemini")
    ollama = ProviderFactory.get_provider("ollama")
    
    import asyncio
    groq_ok, gemini_ok, ollama_ok = await asyncio.gather(
        groq.test_connection(),
        gemini.test_connection(),
        ollama.test_connection()
    )
    
    return {
        "groq": "online" if groq_ok else "offline",
        "gemini": "online" if gemini_ok else "offline",
        "ollama": "online" if ollama_ok else "offline"
    }

@router.get("/admin/ai/settings")
async def get_ai_settings(db = Depends(get_db)):
    from backend.ai.ai_manager import ai_manager
    config = await ai_manager.get_configured_providers()
    
    analytics_list = list(db.ai_analytics.find({}))
    analytics_map = {}
    for a in analytics_list:
        provider = a["provider"]
        analytics_map[provider] = {
            "usageCount": a.get("usage_count", 0),
            "averageResponseTime": round(a.get("average_response_time", 0.0), 3),
            "failureCount": a.get("failure_count", 0),
            "fallbackCount": a.get("fallback_count", 0),
            "lastRequestTime": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(a.get("last_request_time", 0.0))) if a.get("last_request_time") else "Never"
        }
        
    for provider in ["groq", "gemini", "ollama"]:
        if provider not in analytics_map:
            analytics_map[provider] = {
                "usageCount": 0,
                "averageResponseTime": 0.0,
                "failureCount": 0,
                "fallbackCount": 0,
                "lastRequestTime": "Never"
            }
            
    ollama_doc = db.settings.find_one({"setting_name": "ollama_model"})
    ollama_model = ollama_doc.get("value") if ollama_doc else "llama3"

    return {
        "success": True,
        "settings": {
            "primary": config["primary"],
            "secondary": config["secondary"],
            "fallback": config["fallback"],
            "ollama_model": ollama_model
        },
        "analytics": analytics_map
    }

@router.post("/admin/ai/settings")
def save_ai_settings(data: AISettingsSaveRequest, db = Depends(get_db)):
    valid = {"groq", "gemini", "ollama"}
    if data.primary.lower() not in valid or data.secondary.lower() not in valid or data.fallback.lower() not in valid:
        raise HTTPException(status_code=400, detail="Invalid provider name")
        
    db.settings.update_one(
        {"setting_name": "primary_ai_provider"},
        {"$set": {"value": data.primary.lower()}},
        upsert=True
    )
    db.settings.update_one(
        {"setting_name": "secondary_ai_provider"},
        {"$set": {"value": data.secondary.lower()}},
        upsert=True
    )
    db.settings.update_one(
        {"setting_name": "fallback_ai_provider"},
        {"$set": {"value": data.fallback.lower()}},
        upsert=True
    )
    return {"success": True, "message": "AI configuration settings saved successfully."}

class AIModelSaveRequest(BaseModel):
    provider: str
    model: str

@router.post("/admin/ai/model")
def save_ai_model(data: AIModelSaveRequest, db = Depends(get_db)):
    if data.provider.lower() != "ollama":
        raise HTTPException(status_code=400, detail="Only Ollama provider model configuration is currently supported.")
    
    valid_models = {"llama3", "llama3.1", "qwen3", "deepseek-r1", "mistral"}
    if data.model.lower() not in valid_models:
        raise HTTPException(status_code=400, detail=f"Invalid model name. Choose from {', '.join(valid_models)}")
        
    db.settings.update_one(
        {"setting_name": "ollama_model"},
        {"$set": {"value": data.model.lower()}},
        upsert=True
    )
    return {"success": True, "message": f"Ollama model updated to {data.model} successfully."}

@router.post("/admin/ai/test/{provider}")
async def test_ai_provider_completion(provider: str):
    valid = {"groq", "gemini", "ollama"}
    if provider.lower() not in valid:
        raise HTTPException(status_code=400, detail="Invalid provider name")
        
    from backend.ai.provider_factory import ProviderFactory
    p = ProviderFactory.get_provider(provider)
    
    t0 = time.time()
    try:
        response = await p.generate("Hello, reply with only the word 'OK'.")
        duration = time.time() - t0
        return {
            "success": True,
            "provider": provider,
            "responseTime": round(duration, 3),
            "response": response
        }
    except Exception as e:
        return {
            "success": False,
            "provider": provider,
            "error": str(e)
        }
