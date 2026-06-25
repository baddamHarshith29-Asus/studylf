import time
from typing import List, Dict, Any, Optional
from backend.models.models import User, ValidationReport
from backend.ai.rag import RAGPipeline
from backend.core.logger import logger

class ValidationService:
    @staticmethod
    def get_reports(db, user: User) -> List[ValidationReport]:
        """Gets all validation reports for the user."""
        reports = list(db.validation_reports.find({"user_id": user.id}).sort("created_at", -1))
        return [ValidationReport(r, db) for r in reports]

    @staticmethod
    async def create_report(
        db, 
        user: User, 
        startup_idea: str, 
        problem_statement: Optional[str] = None, 
        customer_segment: Optional[str] = None, 
        geography: Optional[str] = None
    ) -> ValidationReport:
        """Invokes RAG pipeline to validate a concept, stores results, and progresses stage to Validation."""
        logger.info(f"Generating validation report for user {user.id}")
        
        # Invoke Langchain RAG/Tavily orchestration
        report_data = await RAGPipeline.generate_idea_validation(
            startup_idea=startup_idea,
            problem_statement=problem_statement,
            customer_segment=customer_segment,
            geography=geography
        )
        
        report_id = f"rep-{int(time.time() * 1000)}"
        date_str = time.strftime("%Y-%m-%d")
        
        new_report_dict = {
            "id": report_id,
            "user_id": user.id,
            "startup_idea": startup_idea,
            "problem_statement": problem_statement,
            "customer_segment": customer_segment,
            "geography": geography,
            "date": date_str,
            "scores": report_data.get("scores", {
                "overall": 80, "demand": 80, "competition": 60, "scalability": 90, "revenuePotential": 75
            }),
            "market_research": report_data.get("marketResearch", report_data.get("market_research", {
                "marketSize": "TAM: $1B", "growthTrends": "10% CAGR", "industryOverview": "SaaS growth"
            })),
            "competitors": report_data.get("competitors", []),
            "customer_persona": report_data.get("customerPersona", report_data.get("customer_persona", {
                "name": "Alex", "painPoints": "Slow deployments", "behavior": "Tech worker"
            })),
            "created_at": time.time()
        }
        
        db.validation_reports.insert_one(new_report_dict)
        
        # Automatically progress user phase from Idea to Validation
        p = user.profile
        if p and getattr(p, "stage", "Idea") == "Idea":
            db.profiles.update_one({"user_id": user.id}, {"$set": {"stage": "Validation"}})
            
        return ValidationReport(new_report_dict, db)
