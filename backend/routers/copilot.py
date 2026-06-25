from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
import time
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User, Resource, FundingScheme, Investor, ChatHistory
from backend.schemas.schemas import ChatRequest, ChatResponse, PitchEvaluationRequest, PitchEvaluationResponse, ResourceResponse, ChatMessage
from backend.services.ai_service import AIService
from backend.services.recommendation_service import RecommendationService

from pydantic import BaseModel

router = APIRouter()

class ResourceCreate(BaseModel):
    title: str
    category: str
    desc: str
    fileType: str
    size: str

@router.get("/resources", response_model=List[ResourceResponse])
def get_resources(db = Depends(get_db)):
    resources = list(db.resources.find({}))
    result = []
    for r in resources:
        result.append({
            "id": r.get("id") or str(r["_id"]),
            "title": r.get("title"),
            "category": r.get("category"),
            "desc": r.get("desc"),
            "fileType": r.get("file_type"),
            "size": r.get("size"),
            "downloads": r.get("downloads", 0)
        })
    return result

@router.post("/resources", response_model=ResourceResponse)
def create_resource(data: ResourceCreate, db = Depends(get_db)):
    resource_id = f"r-{int(time.time() * 1000)}"
    new_res = {
        "id": resource_id,
        "title": data.title,
        "category": data.category,
        "desc": data.desc,
        "file_type": data.fileType,
        "size": data.size,
        "downloads": 0
    }
    db.resources.insert_one(new_res)
    return {
        "id": resource_id,
        "title": data.title,
        "category": data.category,
        "desc": data.desc,
        "fileType": data.fileType,
        "size": data.size,
        "downloads": 0
    }

@router.post("/copilot/chat", response_model=ChatResponse)
async def chat_copilot_endpoint(data: ChatRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    schemes = list(db.funding_schemes.find({}))
    resources = list(db.resources.find({}))
    investors = list(db.investors.find({}))
    
    searchable_docs = []
    for s in schemes:
        searchable_docs.append({
            "id": s.get("id"), "title": s.get("name"), "type": "Grant", "link": s.get("apply_link"),
            "search_text": f"{s.get('name')} {s.get('provider')} {s.get('type')} {s.get('description')}"
        })
    for r in resources:
        searchable_docs.append({
            "id": r.get("id"), "title": r.get("title"), "type": "Resource Template", "link": None,
            "search_text": f"{r.get('title')} {r.get('category')} {r.get('desc')}"
        })
    for i in investors:
        searchable_docs.append({
            "id": i.get("id"), "title": i.get("name"), "type": "Investor", "link": f"mailto:{i.get('contact_email')}" if i.get('contact_email') else None,
            "search_text": f"{i.get('name')} {i.get('type')} {i.get('match_reason', '')} {' '.join(i.get('sectors', []))}"
        })
        
    ranked_docs = RecommendationService.rank_by_similarity(data.message, searchable_docs, text_field="search_text")
    relevant_docs = [doc for doc in ranked_docs if doc.get("_score", 0.0) > 0.05][:3]
    
    context_blocks = []
    sources = []
    for doc in relevant_docs:
        context_blocks.append(
            f"[{doc['type']}] {doc['title']}\nDetails: {doc['search_text']}\nLink/ID: {doc['link'] or doc['id']}\n"
        )
        sources.append({
            "title": doc["title"], "type": doc["type"], "link": doc["link"], "id": doc["id"] if not doc["link"] else None
        })
        
    context_str = "\n".join(context_blocks) if context_blocks else "No matching local database entries found."
    
    assistant_reply = await AIService.chat_copilot(data.message, context_str)
    
    if current_user:
        user_msg = {
            "user_id": current_user.id,
            "role": "user",
            "content": data.message,
            "created_at": time.time()
        }
        asst_msg = {
            "user_id": current_user.id,
            "role": "assistant",
            "content": assistant_reply,
            "sources": sources,
            "created_at": time.time()
        }
        db.chat_history.insert_many([user_msg, asst_msg])
        
    return {
        "success": True,
        "message": {
            "role": "assistant",
            "content": assistant_reply,
            "sources": sources
        }
    }

@router.get("/copilot/chat", response_model=List[ChatMessage])
def get_chat_history_endpoint(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return []
    history = list(db.chat_history.find({"user_id": current_user.id}).sort("created_at", 1))
    result = []
    for h in history:
        result.append({
            "role": h.get("role"),
            "content": h.get("content"),
            "sources": h.get("sources")
        })
    return result

STAGE_QUESTIONS = {
    'Idea': [
        { "id": 'q-1', "text": "What is the specific pain point that you have personally witnessed?", "tips": "Discuss a concrete scenario or friction point." },
        { "id": 'q-2', "text": "Who is the customer that needs this product the most, and how do you know?", "tips": "Narrow down your ICP persona." }
    ],
    'Validation': [
        { "id": 'q-1', "text": "What is your landing page or waitlist conversion rate so far?", "tips": "Share specific conversion rates." }
    ]
}

@router.post("/copilot/pitch-simulator/questions")
async def get_pitch_questions(current_user: Optional[User] = Depends(get_current_user_optional)):
    stage = current_user.profile.stage if current_user and current_user.profile else "Idea"
    
    startup_name = "My Startup"
    industry = "AI & SaaS"
    description = "Building software products."
    if current_user and current_user.profile:
        startup_name = current_user.profile.startup_name or startup_name
        industry = current_user.profile.industry or industry
        description = current_user.profile.description or description

    questions = await AIService.generate_pitch_questions(
        stage=stage,
        startup_name=startup_name,
        industry=industry,
        description=description
    )
    return {
        "success": True,
        "stage": stage,
        "questions": questions
    }

@router.post("/copilot/pitch-simulator/evaluate", response_model=PitchEvaluationResponse)
async def evaluate_pitch_endpoint(data: PitchEvaluationRequest):
    evaluation = await AIService.evaluate_pitch_answer(data.question, data.answer)
    return {
        "success": True,
        "score": evaluation["score"],
        "critique": evaluation["critique"],
        "tips": evaluation["tips"]
    }
