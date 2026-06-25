from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User, ValidationReport
from backend.schemas.schemas import ValidateRequest, ValidationReportResponse, ValidateResponse
from backend.services.validation_service import ValidationService
import datetime

router = APIRouter()

@router.get("/validation/reports", response_model=List[ValidationReportResponse])
def get_validation_reports(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return []
    return ValidationService.get_reports(db, current_user)

@router.post("/validate", response_model=ValidateResponse)
async def run_validation(data: ValidateRequest, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="User context not found")
        
    report = await ValidationService.create_report(
        db=db,
        user=current_user,
        startup_idea=data.startupIdea,
        problem_statement=data.problemStatement,
        customer_segment=data.customerSegment,
        geography=data.geography
    )
    return {
        "success": True,
        "report": report
    }

@router.get("/validation/export/{id}")
def export_validation_report(id: str, db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    report_doc = db.validation_reports.find_one({
        "id": id,
        "user_id": current_user.id
    })
    
    if not report_doc:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report = ValidationReport(report_doc, db)
    
    # Handle created_at date formatting safely
    created_at_val = report.created_at
    if isinstance(created_at_val, (int, float)):
        created_at_str = datetime.datetime.utcfromtimestamp(created_at_val).isoformat()
    elif isinstance(created_at_val, datetime.datetime):
        created_at_str = created_at_val.isoformat()
    else:
        created_at_str = str(created_at_val) if created_at_val else datetime.datetime.utcnow().isoformat()
        
    export_doc = {
        "title": f"STUDLYF Validation Report — {report.startup_idea}",
        "generatedAt": created_at_str,
        "founderProfile": {
            "name": current_user.name,
            "startup": current_user.profile.startup_name if current_user.profile else "",
            "stage": current_user.profile.stage if current_user.profile else ""
        },
        "concept": {
            "idea": report.startup_idea,
            "problem": report.problem_statement,
            "segment": report.customer_segment,
            "geography": report.geography
        },
        "scores": report.scores,
        "marketResearch": report.market_research,
        "competitorAnalysis": report.competitors,
        "customerPersona": report.customer_persona,
        "recommendation": (
            "Strong signal. Proceed with MVP development and begin pre-seed outreach."
            if report.scores.get("overall", 80) >= 75
            else "Moderate signal. Refine value proposition and gather more user discovery data before building."
            if report.scores.get("overall", 80) >= 55
            else "Weak signal. Pivot or significantly narrow the target segment before investing resources."
        )
    }
    
    return {
        "success": True,
        "export": export_doc
    }
