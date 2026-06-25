from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User
from backend.services.opportunity_service import OpportunityService

router = APIRouter()

@router.get("/opportunities")
def get_opportunities(db = Depends(get_db)):
    return OpportunityService.get_opportunities(db)

@router.get("/opportunities/list")
def get_opportunities_list(db = Depends(get_db)):
    return OpportunityService.get_opportunities(db)

@router.post("/opportunities/post")
def post_opportunity(
    data: Dict[str, Any],
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user or not current_user.profile:
        raise HTTPException(status_code=401, detail="Unauthorized - profile not found")
    return OpportunityService.post_opportunity(db, current_user.profile.id, data)

@router.post("/opportunities/apply")
def apply_opportunity(
    data: Dict[str, Any],
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        return OpportunityService.apply_opportunity(db, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/opportunities/applications")
def get_applications(
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user or not current_user.profile:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return OpportunityService.get_applications_for_startup(db, current_user.profile.id)

@router.post("/opportunities/applications/{id}/status")
def update_application_status(
    id: str,
    data: Dict[str, Any],
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user or not current_user.profile:
        raise HTTPException(status_code=401, detail="Unauthorized - profile not found")
    
    status = data.get("status")
    if status not in ("Accepted", "Rejected"):
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'Accepted' or 'Rejected'")
        
    success = OpportunityService.update_application_status(db, current_user.profile.id, id, status)
    if not success:
        raise HTTPException(status_code=404, detail="Application not found or unauthorized")
        
    return {"success": True, "message": f"Application status updated to {status}."}
