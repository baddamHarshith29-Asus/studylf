from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User
from backend.schemas.schemas import InvestorResponse, MentorResponse, RelationshipPathRequest, RelationshipPathResponse
from backend.services.network_service import NetworkService

router = APIRouter()

@router.get("/network/investors", response_model=List[InvestorResponse])
async def get_investors(
    industry: Optional[str] = None,
    stage: Optional[str] = None,
    revenue: Optional[str] = None,
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return await NetworkService.get_investors(db, current_user, industry=industry, stage=stage, revenue=revenue)

@router.get("/network/mentors", response_model=List[MentorResponse])
def get_mentors(
    industry: Optional[str] = None,
    stage: Optional[str] = None,
    geography: Optional[str] = None,
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    return NetworkService.get_mentors(db, current_user, industry=industry, stage=stage, geography=geography)

@router.post("/network/relationship-path", response_model=RelationshipPathResponse)
def get_relationship_path(data: RelationshipPathRequest, current_user: Optional[User] = Depends(get_current_user_optional)):
    res = NetworkService.get_relationship_path(current_user, data.contactName, data.targetEntity)
    return res

@router.post("/network/import-csv")
def import_linkedin_csv(
    data: Dict[str, Any],
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    csv_content = data.get("csvContent", "")
    if not csv_content:
        raise HTTPException(status_code=400, detail="csvContent is required")
    return NetworkService.import_linkedin_contacts_csv(db, current_user, csv_content)

@router.post("/network/analyze-linkedin")
async def analyze_linkedin_network(
    data: Dict[str, Any],
    db = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    idea = data.get("startupIdea", "")
    if not idea and current_user.profile:
        idea = current_user.profile.description or "Automated SaaS solution"
    return await NetworkService.analyze_linkedin_network(db, current_user, idea)
