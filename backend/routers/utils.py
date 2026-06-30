from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
import time
import datetime
from backend.core.database import get_db
from backend.routers.auth import get_current_user_optional
from backend.models.models import User, ValidationReport, RoadmapTask, Investor, Mentor, Application, ActivityLog, Resource

router = APIRouter()

@router.get("/stats")
def get_workspace_stats(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return {
            "overallHealth": 60,
            "validationScore": 0,
            "roadmapScore": 0,
            "networkScore": 25,
            "fundingScore": 0,
            "totalReports": 0,
            "totalApplications": 0,
            "acceptedApplications": 0,
            "totalTasksCompleted": 0,
            "totalTasksCount": 0,
            "investorsMatched": 0,
            "mentorsAvailable": 0,
            "resourcesCount": 0,
            "currentStage": "Idea",
            "startupName": "My Startup"
        }
        
    stage = current_user.profile.stage if current_user.profile else "Idea"
    
    latest_report = db.validation_reports.find_one({"user_id": current_user.id}, sort=[("created_at", -1)])
    validation_score = latest_report.get("scores", {}).get("overall", 0) if latest_report else 0
    total_reports = db.validation_reports.count_documents({"user_id": current_user.id})
    
    all_tasks = list(db.roadmap_tasks.find({"user_id": current_user.id}))
    total_tasks_count = len(all_tasks)
    total_tasks_completed = sum(1 for t in all_tasks if t.get("completed"))
    
    current_stage_tasks = [t for t in all_tasks if t.get("stage") == stage]
    current_stage_completed = sum(1 for t in current_stage_tasks if t.get("completed"))
    
    roadmap_score = 0
    if current_stage_tasks:
        roadmap_score = int((current_stage_completed / len(current_stage_tasks)) * 100)
        
    investors_count = db.investors.count_documents({})
    mentors_count = db.mentors.count_documents({})
    network_score = min(100, investors_count * 10 + mentors_count * 15)
    
    total_apps = list(db.applications.find({"user_id": current_user.id}))
    accepted_apps = sum(1 for a in total_apps if a.get("status") == "Accepted")
    funding_score = min(100, accepted_apps * 30 + len(total_apps) * 10)
    
    overall_health = int(
        (validation_score * 0.3) + (roadmap_score * 0.3) + (network_score * 0.2) + (funding_score * 0.2)
    )
    if overall_health == 0:
        overall_health = 60
        
    resources_count = db.resources.count_documents({})
    
    return {
        "overallHealth": overall_health,
        "validationScore": validation_score,
        "roadmapScore": roadmap_score,
        "networkScore": network_score,
        "fundingScore": funding_score,
        "totalReports": total_reports,
        "totalApplications": len(total_apps),
        "acceptedApplications": accepted_apps,
        "totalTasksCompleted": total_tasks_completed,
        "totalTasksCount": total_tasks_count,
        "investorsMatched": investors_count,
        "mentorsAvailable": mentors_count,
        "resourcesCount": resources_count,
        "currentStage": stage,
        "startupName": current_user.profile.startup_name if current_user.profile else "My Startup"
    }

@router.get("/activity")
def get_activity_logs(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return []
    logs = list(db.activity_logs.find({"user_id": current_user.id}).sort("timestamp", -1).limit(20))
    
    result = []
    for log in logs:
        ts = log.get("timestamp")
        if isinstance(ts, (int, float)):
            ts_str = datetime.datetime.utcfromtimestamp(ts).isoformat()
        else:
            ts_str = str(ts)
            
        result.append({
            "id": log.get("id") or str(log["_id"]),
            "action": log.get("action", "General Activity"),
            "detail": log.get("detail", ""),
            "timestamp": ts_str
        })
    return result

@router.post("/activity")
def add_activity_log(data: Dict[str, Any], db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return {"success": False}
        
    log_id = f"act-{int(time.time() * 1000)}"
    new_log = {
        "id": log_id,
        "user_id": current_user.id,
        "action": data.get("action", "General Activity"),
        "detail": data.get("detail", ""),
        "timestamp": time.time()
    }
    db.activity_logs.insert_one(new_log)
    return {"success": True}

@router.get("/dashboard/connected-data")
async def get_dashboard_connected_data(db = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    if not current_user:
        return {
            "startupHealthScore": 60,
            "validationScore": 0,
            "roadmapProgress": 0,
            "fundingReadiness": 40,
            "recommendedMentors": [],
            "recommendedInvestors": [],
            "upcomingDeadlines": [],
            "openOpportunities": [],
            "aiSuggestions": [
                {"title": "Validate Startup Concept", "text": "Run an AI Validation scan on your startup idea to check viability.", "action": "Validate Concept", "route": "/"}
            ],
            "fundingReadinessReasons": ["Signup completed"]
        }
        
    profile = current_user.profile
    stage = profile.stage if profile else "Idea"
    startup_name = profile.startup_name if profile else "My Startup"
    
    # 1. Validation Score
    latest_report = db.validation_reports.find_one({"user_id": current_user.id}, sort=[("created_at", -1)])
    validation_score = latest_report.get("scores", {}).get("overall", 0) if latest_report else 0
    
    # 2. Roadmap Progress
    all_tasks = list(db.roadmap_tasks.find({"user_id": current_user.id}))
    current_stage_tasks = [t for t in all_tasks if t.get("stage") == stage]
    current_stage_completed = sum(1 for t in current_stage_tasks if t.get("completed"))
    roadmap_progress = 0
    if current_stage_tasks:
        roadmap_progress = int((current_stage_completed / len(current_stage_tasks)) * 100)
    
    # 3. Recommended Mentors
    from backend.services.network_service import NetworkService
    all_mentors = NetworkService.get_mentors(db, current_user)
    recommended_mentors = all_mentors[:3]
    
    # 4. Recommended Investors
    all_investors = await NetworkService.get_investors(db, current_user)
    recommended_investors = all_investors[:3]
    
    # 5. Upcoming Funding Deadlines
    from backend.services.funding_service import FundingService
    schemes = await FundingService.get_schemes(db, current_user)
    upcoming_deadlines = []
    for s in schemes:
        deadline_str = getattr(s, "deadline", "Rolling") or "Rolling"
        upcoming_deadlines.append({
            "id": s.id,
            "name": getattr(s, "name", "Funding Program"),
            "provider": getattr(s, "provider", ""),
            "amount": getattr(s, "amount", ""),
            "deadline": deadline_str,
            "applyLink": getattr(s, "apply_link", "")
        })
    upcoming_deadlines = upcoming_deadlines[:3]
    
    # 6. Open Opportunities
    from backend.services.opportunity_service import OpportunityService
    opps = OpportunityService.get_opportunities(db)
    open_opportunities = []
    for o in opps:
        open_opportunities.append({
            "id": o.get("id"),
            "title": o.get("title"),
            "startupName": o.get("startup_name") or "YC Partner Portfolio",
            "location": o.get("location"),
            "type": o.get("type"),
            "equity": o.get("equity")
        })
    open_opportunities = open_opportunities[:3]
    
    # 7. Funding Readiness
    readiness_score = 30
    reasons = []
    
    if profile and profile.startup_name and profile.description:
        readiness_score += 15
        reasons.append("Startup profile completed")
    else:
        reasons.append("Incomplete startup description")
        
    if validation_score > 0:
        readiness_score += 20
        reasons.append(f"AI Validation completed (Score: {validation_score}%)")
    else:
        reasons.append("AI Validation scan not run yet")
        
    if roadmap_progress >= 50:
        readiness_score += 20
        reasons.append(f"Roadmap tasks completed for {stage} stage ({roadmap_progress}%)")
    elif roadmap_progress > 0:
        readiness_score += 10
        reasons.append(f"Began roadmap checklist ({roadmap_progress}%)")
    else:
        reasons.append("Roadmap checklist not started")
        
    sb = db.saved_storyboards.find_one({"user_id": current_user.id})
    if sb:
        readiness_score += 15
        reasons.append("Sequoia pitch deck storyboard customized")
    else:
        reasons.append("Sequoia storyboard not customized")
        
    has_apps = db.applications.count_documents({"user_id": current_user.id})
    if has_apps > 0:
        readiness_score += 10
        reasons.append(f"Applied to {has_apps} funding program(s)")
        
    funding_readiness = min(100, readiness_score)
    
    # 8. Startup Health Score
    health_score = int(
        (validation_score * 0.3) +
        (roadmap_progress * 0.3) +
        (funding_readiness * 0.2) +
        (min(100, len(all_mentors) * 5 + len(all_investors) * 5) * 0.2)
    )
    if health_score == 0:
        health_score = 60
        
    # 9. AI Suggestions
    ai_suggestions = []
    
    if validation_score == 0:
        ai_suggestions.append({
            "title": "Validate Startup Concept",
            "text": "Run an AI validation scan to calculate market demand and discover competitors.",
            "action": "Scan Concept",
            "route": "/"
        })
    elif validation_score < 70:
        ai_suggestions.append({
            "title": "Refine Value Proposition",
            "text": f"Your latest AI validation score is {validation_score}%. Refine your hypothesis with AI Copilot.",
            "action": "Chat Copilot",
            "route": "/copilot"
        })
        
    if roadmap_progress < 40:
        ai_suggestions.append({
            "title": "Progress On Stages Checklist",
            "text": f"Complete remaining tasks in the {stage} stage roadmap to stay on track.",
            "action": "Open Roadmap",
            "route": "/roadmap"
        })
        
    if not sb:
        ai_suggestions.append({
            "title": "Customize Sequoia Storyboard",
            "text": "Customize and save your 10-slide pitch storyboard to prepare for VC pitch review.",
            "action": "View Storyboard",
            "route": "/roadmap"
        })
        
    if funding_readiness >= 70 and not has_apps:
        ai_suggestions.append({
            "title": "Submit First Grant Application",
            "text": "Your venture is funding-ready! Review open grant matches and submit an application.",
            "action": "View Schemes",
            "route": "/funding"
        })
        
    if len(ai_suggestions) < 3:
        ai_suggestions.append({
            "title": "Practice Pitch Q&A",
            "text": "Run a simulated VC Q&A practice session to receive AI feedback on your GTM answers.",
            "action": "Practice Pitch",
            "route": "/pitch-review"
        })
        
    return {
        "startupHealthScore": health_score,
        "validationScore": validation_score,
        "roadmapProgress": roadmap_progress,
        "fundingReadiness": funding_readiness,
        "recommendedMentors": recommended_mentors,
        "recommendedInvestors": recommended_investors,
        "upcomingDeadlines": upcoming_deadlines,
        "openOpportunities": open_opportunities,
        "aiSuggestions": ai_suggestions,
        "fundingReadinessReasons": reasons
    }

@router.post("/build-advisor")
async def get_build_advice(
    data: Dict[str, Any],
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    from backend.services.ai_service import AIService
    startup_type = data.get("startupType", "SaaS")
    
    startup_name = ""
    industry = ""
    description = ""
    if current_user and current_user.profile:
        startup_name = current_user.profile.startup_name or ""
        industry = current_user.profile.industry or ""
        description = current_user.profile.description or ""

    advice = await AIService.generate_build_advice(
        startup_type=startup_type,
        startup_name=startup_name,
        industry=industry,
        description=description
    )
    return {
        "success": True,
        "stack": advice.get("stack", {}),
        "phases": advice.get("phases", []),
        "costEstimates": advice.get("costEstimates", [])
    }
