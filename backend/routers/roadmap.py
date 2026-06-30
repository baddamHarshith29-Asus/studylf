from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User, RoadmapTask, SavedStoryboard
from backend.schemas.schemas import (
    ToggleTaskRequest, ToggleTaskResponse, StoryboardResponse, StoryboardSaveRequest,
    RoadmapResponse, UpdateTaskRequest, AddTaskRequest, DeleteTaskRequest, ResetRoadmapRequest
)
from backend.core.constants import DEFAULT_SEQUOIA_SLIDES, DEFAULT_ROADMAP_TASKS
import time

router = APIRouter()

@router.get("/roadmap", response_model=RoadmapResponse)
def get_roadmap(stage: Optional[str] = None, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return {
            "activeStage": "Idea",
            "selectedStage": stage or "Idea",
            "tasks": [],
            "progress": 0
        }
        
    active_stage = current_user.profile.stage if current_user.profile else "Idea"
    selected_stage = stage if stage else active_stage
    
    tasks = list(db.roadmap_tasks.find({
        "user_id": current_user.id,
        "stage": selected_stage
    }))
    
    if not tasks:
        default_list = DEFAULT_ROADMAP_TASKS.get(selected_stage, [])
        tasks_to_insert = []
        for idx, task in enumerate(default_list):
            tasks_to_insert.append({
                "id": f"t-{selected_stage.lower()}-{idx}-{current_user.id}",
                "user_id": current_user.id,
                "text": task["text"],
                "completed": False,
                "category": task["category"],
                "stage": selected_stage,
                "guide_id": task.get("guide_id"),
                "week": task.get("week", 1),
                "description": task.get("description", ""),
                "notes": "",
                "subtasks": [],
                "is_custom": False,
                "created_at": time.time()
            })
        if tasks_to_insert:
            db.roadmap_tasks.insert_many(tasks_to_insert)
            tasks = list(db.roadmap_tasks.find({
                "user_id": current_user.id,
                "stage": selected_stage
            }))
            
    # Migration helper for old tasks
    for t in tasks:
        needs_update = False
        update_fields = {}
        if "week" not in t:
            default_tasks_list = DEFAULT_ROADMAP_TASKS.get(selected_stage, [])
            default_match = next((dt for dt in default_tasks_list if dt["text"] == t.get("text")), None)
            update_fields["week"] = default_match.get("week", 1) if default_match else 1
            needs_update = True
        if "description" not in t:
            default_tasks_list = DEFAULT_ROADMAP_TASKS.get(selected_stage, [])
            default_match = next((dt for dt in default_tasks_list if dt["text"] == t.get("text")), None)
            update_fields["description"] = default_match.get("description", "") if default_match else ""
            needs_update = True
        if "notes" not in t:
            update_fields["notes"] = ""
            needs_update = True
        if "subtasks" not in t:
            update_fields["subtasks"] = []
            needs_update = True
        if "is_custom" not in t:
            update_fields["is_custom"] = False
            needs_update = True
            
        if needs_update:
            db.roadmap_tasks.update_one({"_id": t["_id"]}, {"$set": update_fields})
            t.update(update_fields)
            
    # Sort tasks by week
    tasks = sorted(tasks, key=lambda x: (x.get("week", 1), x.get("created_at", 0)))
    
    mapped_tasks = []
    completed_count = 0
    total_count = len(tasks)
    
    for t in tasks:
        is_completed = t.get("completed", False)
        if is_completed:
            completed_count += 1
            
        mapped_tasks.append({
            "id": t.get("id"),
            "text": t.get("text"),
            "completed": is_completed,
            "category": t.get("category"),
            "guideId": t.get("guide_id"),
            "week": t.get("week", 1),
            "description": t.get("description", ""),
            "notes": t.get("notes", ""),
            "subtasks": [{
                "id": st.get("id"),
                "text": st.get("text"),
                "completed": st.get("completed", False)
            } for st in t.get("subtasks", [])] if t.get("subtasks") else [],
            "isCustom": t.get("is_custom", False)
        })
        
    progress = int((completed_count / total_count) * 100) if total_count > 0 else 0
    
    return {
        "activeStage": active_stage,
        "selectedStage": selected_stage,
        "tasks": mapped_tasks,
        "progress": progress
    }

@router.post("/roadmap/toggle", response_model=ToggleTaskResponse)
def toggle_task(data: ToggleTaskRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    task = db.roadmap_tasks.find_one({"id": data.id, "user_id": current_user.id})
    if not task:
        return {"success": False}
            
    db.roadmap_tasks.update_one(
        {"id": data.id, "user_id": current_user.id}, 
        {"$set": {"completed": not task.get("completed", False)}}
    )
    return {"success": True}

@router.post("/roadmap/task/update")
def update_task_details(data: UpdateTaskRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    task = db.roadmap_tasks.find_one({"id": data.id, "user_id": current_user.id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    subtasks_list = [{"id": st.id, "text": st.text, "completed": st.completed} for st in data.subtasks]
    
    db.roadmap_tasks.update_one(
        {"id": data.id, "user_id": current_user.id},
        {"$set": {
            "notes": data.notes,
            "subtasks": subtasks_list
        }}
    )
    return {"success": True}

@router.post("/roadmap/task/add")
def add_custom_task(data: AddTaskRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    import uuid
    task_id = f"t-custom-{uuid.uuid4().hex[:8]}-{current_user.id}"
    
    new_task = {
        "id": task_id,
        "user_id": current_user.id,
        "text": data.text,
        "completed": False,
        "category": data.category,
        "stage": data.stage,
        "guide_id": None,
        "week": data.week,
        "description": data.description,
        "notes": "",
        "subtasks": [],
        "is_custom": True,
        "created_at": time.time()
    }
    
    db.roadmap_tasks.insert_one(new_task)
    return {"success": True, "id": task_id}

@router.post("/roadmap/task/delete")
def delete_task(data: DeleteTaskRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    res = db.roadmap_tasks.delete_one({"id": data.id, "user_id": current_user.id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or not owned by user")
        
    return {"success": True}

@router.post("/roadmap/reset")
def reset_roadmap(data: ResetRoadmapRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    # Delete all tasks for this stage
    db.roadmap_tasks.delete_many({
        "user_id": current_user.id,
        "stage": data.stage
    })
    
    # Re-seed default tasks
    default_list = DEFAULT_ROADMAP_TASKS.get(data.stage, [])
    tasks_to_insert = []
    for idx, task in enumerate(default_list):
        tasks_to_insert.append({
            "id": f"t-{data.stage.lower()}-{idx}-{current_user.id}",
            "user_id": current_user.id,
            "text": task["text"],
            "completed": False,
            "category": task["category"],
            "stage": data.stage,
            "guide_id": task.get("guide_id"),
            "week": task.get("week", 1),
            "description": task.get("description", ""),
            "notes": "",
            "subtasks": [],
            "is_custom": False,
            "created_at": time.time()
        })
    if tasks_to_insert:
        db.roadmap_tasks.insert_many(tasks_to_insert)
        
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
