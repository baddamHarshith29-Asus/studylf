from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User
from backend.schemas.schemas import SchemeResponse, ApplicationResponse, ApplicationCreate, ApplicationUpdateStatus, RadarResponse
from backend.services.funding_service import FundingService

router = APIRouter()

@router.get("/funding/schemes", response_model=List[SchemeResponse])
async def get_schemes(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    schemes = await FundingService.get_schemes(db, current_user)
    result = []
    for s in schemes:
        result.append({
            "id": s.id,
            "name": s.name,
            "provider": s.provider,
            "type": s.type,
            "description": s.description,
            "amount": s.amount,
            "equity": s.equity,
            "deadline": s.deadline,
            "applyLink": s.apply_link,
            "stages": s.stages,
            "countries": s.countries,
            "industries": s.industries,
            "criteria": s.criteria,
            "lastVerified": s.last_verified
        })
    return result

@router.get("/funding/applications", response_model=List[ApplicationResponse])
def get_applications(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return []
        
    apps = FundingService.get_applications(db, current_user)
    result = []
    for a in apps:
        scheme_data = None
        if a.scheme:
            scheme_data = {
                "id": a.scheme.id,
                "name": a.scheme.name,
                "provider": a.scheme.provider,
                "type": a.scheme.type,
                "description": a.scheme.description,
                "amount": a.scheme.amount,
                "equity": a.scheme.equity,
                "deadline": a.scheme.deadline,
                "applyLink": a.scheme.apply_link,
                "stages": a.scheme.stages,
                "countries": a.scheme.countries,
                "industries": a.scheme.industries,
                "criteria": a.scheme.criteria,
                "lastVerified": a.scheme.last_verified
            }
            
        result.append({
            "id": a.id,
            "schemeId": a.scheme_id,
            "status": a.status,
            "appliedDate": a.applied_date,
            "notes": a.notes,
            "scheme": scheme_data
        })
    return result

@router.post("/funding/apply")
def apply_to_scheme(data: ApplicationCreate, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_app = FundingService.create_application(db, current_user, data)
        return {
            "success": True,
            "application": {
                "id": new_app.id,
                "schemeId": new_app.scheme_id,
                "status": new_app.status,
                "appliedDate": new_app.applied_date,
                "notes": new_app.notes
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/funding/update-status")
def update_application_status(data: ApplicationUpdateStatus, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    success = FundingService.update_application_status(db, current_user, data)
    return {"success": success}

@router.get("/radar", response_model=List[RadarResponse])
def get_radar(db = Depends(get_db)):
    return FundingService.get_radar_items(db)
