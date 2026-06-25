from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User, RoadmapTask, SavedStoryboard
from backend.schemas.schemas import ToggleTaskRequest, ToggleTaskResponse, StoryboardResponse, StoryboardSaveRequest
from backend.core.constants import DEFAULT_SEQUOIA_SLIDES, DEFAULT_ROADMAP_TASKS
import time

router = APIRouter()

@router.get("/roadmap")
def get_roadmap(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return {"stage": "Idea", "tasks": []}
        
    stage = current_user.profile.stage if current_user.profile else "Idea"
    
    tasks = list(db.roadmap_tasks.find({
        "user_id": current_user.id,
        "stage": stage
    }))
    
    if not tasks:
        default_list = DEFAULT_ROADMAP_TASKS.get(stage, [])
        tasks_to_insert = []
        for idx, task in enumerate(default_list):
            tasks_to_insert.append({
                "id": f"t-{stage.lower()}-{idx}-{current_user.id}",
                "user_id": current_user.id,
                "text": task["text"],
                "completed": False,
                "category": task["category"],
                "stage": stage,
                "guide_id": task.get("guide_id"),
                "created_at": time.time()
            })
        if tasks_to_insert:
            db.roadmap_tasks.insert_many(tasks_to_insert)
            tasks = list(db.roadmap_tasks.find({
                "user_id": current_user.id,
                "stage": stage
            }))
        
    mapped_tasks = []
    for t in tasks:
        mapped_tasks.append({
            "id": t.get("id"),
            "text": t.get("text"),
            "completed": t.get("completed"),
            "category": t.get("category"),
            "guideId": t.get("guide_id")
        })
        
    return {
        "stage": stage,
        "tasks": mapped_tasks
    }

@router.post("/roadmap/toggle", response_model=ToggleTaskResponse)
def toggle_task(data: ToggleTaskRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    task = db.roadmap_tasks.find_one({"id": data.id})
    if not task:
        return {"success": False}
            
    db.roadmap_tasks.update_one(
        {"id": data.id}, 
        {"$set": {"completed": not task.get("completed", False)}}
    )
    return {"success": True}

@router.get("/roadmap/storyboard", response_model=StoryboardResponse)
async def get_storyboard(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return {"success": True, "storyboard": DEFAULT_SEQUOIA_SLIDES}
        
    sb = db.saved_storyboards.find_one({"user_id": current_user.id})
    if not sb:
        startup_name = "My Startup"
        industry = "AI & SaaS"
        description = "Building software products."
        if current_user.profile:
            startup_name = current_user.profile.startup_name or startup_name
            industry = current_user.profile.industry or industry
            description = current_user.profile.description or description
            
        customized_slides = []
        for slide in DEFAULT_SEQUOIA_SLIDES:
            s = slide.copy()
            s["guidance"] = s["guidance"].replace("your startup", startup_name).replace("the target sector", industry)
            customized_slides.append(s)
            
        db.saved_storyboards.update_one(
            {"user_id": current_user.id},
            {"$set": {"storyboard": customized_slides}},
            upsert=True
        )
        return {"success": True, "storyboard": customized_slides}
        
    return {"success": True, "storyboard": sb.get("storyboard", [])}

@router.post("/roadmap/storyboard/customize", response_model=StoryboardResponse)
async def customize_storyboard(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    from backend.services.ai_service import AIService
    
    startup_name = "My Startup"
    industry = "AI & SaaS"
    description = "Building software products."
    if current_user.profile:
        startup_name = current_user.profile.startup_name or startup_name
        industry = current_user.profile.industry or industry
        description = current_user.profile.description or description
        
    customized_slides = await AIService.customize_storyboard(
        startup_name=startup_name,
        industry=industry,
        description=description,
        slides=DEFAULT_SEQUOIA_SLIDES
    )
    
    db.saved_storyboards.update_one(
        {"user_id": current_user.id},
        {"$set": {"storyboard": customized_slides}},
        upsert=True
    )
    return {"success": True, "storyboard": customized_slides}

@router.post("/roadmap/storyboard/save")
def save_storyboard(data: StoryboardSaveRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    slides_data = [slide.dict() for slide in data.storyboard]
    
    db.saved_storyboards.update_one(
        {"user_id": current_user.id},
        {"$set": {"storyboard": slides_data}},
        upsert=True
    )
    return {"success": True, "message": "Storyboard progression saved successfully."}
