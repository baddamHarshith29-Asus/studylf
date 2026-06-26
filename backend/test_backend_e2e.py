import sys
import os
import time
import json
import traceback

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import get_db, db
from backend.services.ai_service import AIService
from backend.ai.rag import RAGPipeline
from bson import ObjectId

def log_test_result(name: str, passed: bool, error_msg: str = ""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if not passed and error_msg:
        print(f"   Reason: {error_msg}")

async def test_database_crud():
    print("\n--- Running Database CRUD Tests ---")
    try:
        active_db = get_db()
        if active_db is None:
            log_test_result("Database connection check", False, "Database client is None")
            return False
            
        db_type = active_db.__class__.__name__
        print(f"Active database type: {db_type}")
        
        # Test document structure
        test_doc = {
            "name": "Test Entry",
            "type": "E2E Sandbox Check",
            "timestamp": time.time()
        }
        
        # 1. Insert
        insert_res = active_db.test_sandbox.insert_one(test_doc)
        inserted_id = insert_res.inserted_id
        log_test_result("DB Insert Operation", True)
        
        # 2. Find
        retrieved = active_db.test_sandbox.find_one({"_id": inserted_id})
        if retrieved and retrieved.get("name") == "Test Entry":
            log_test_result("DB Find Operation", True)
        else:
            log_test_result("DB Find Operation", False, f"Retrieved doc: {retrieved}")
            
        # 3. Update
        active_db.test_sandbox.update_one(
            {"_id": inserted_id},
            {"$set": {"name": "Updated Test Entry"}}
        )
        updated = active_db.test_sandbox.find_one({"_id": inserted_id})
        if updated and updated.get("name") == "Updated Test Entry":
            log_test_result("DB Update Operation", True)
        else:
            log_test_result("DB Update Operation", False, f"Updated doc: {updated}")
            
        # 4. Delete
        delete_res = active_db.test_sandbox.delete_one({"_id": inserted_id})
        if delete_res.deleted_count == 1:
            log_test_result("DB Delete Operation", True)
        else:
            log_test_result("DB Delete Operation", False, f"Deleted count: {delete_res.deleted_count}")
            
        return True
    except Exception as e:
        log_test_result("Database CRUD Tests", False, f"Exception: {str(e)}\n{traceback.format_exc()}")
        return False

async def test_ai_services():
    print("\n--- Running AI / LLM Integration Tests ---")
    
    # 1. Test resume parser (Gemini)
    try:
        parsed_resume = await AIService.parse_resume("john_doe_resume.pdf")
        if parsed_resume and "name" in parsed_resume and "startupName" in parsed_resume:
            log_test_result("AIService.parse_resume (Gemini)", True)
        else:
            log_test_result("AIService.parse_resume (Gemini)", False, f"Unexpected structure: {parsed_resume}")
    except Exception as e:
        log_test_result("AIService.parse_resume (Gemini)", False, str(e))

    # 2. Test validation report (Tavily + Groq ValidationChain)
    try:
        report = await AIService.generate_validation_report(
            startup_idea="Smart water filters for smart cities",
            problem_statement="Municipal water lacks tracking and cleanliness validation",
            customer_segment="Housing societies and municipalities",
            geography="India"
        )
        if report and "scores" in report and "marketResearch" in report:
            log_test_result("AIService.generate_validation_report (Tavily + Groq RAG)", True)
        else:
            log_test_result("AIService.generate_validation_report (Tavily + Groq RAG)", False, f"Unexpected structure: {report}")
    except Exception as e:
        log_test_result("AIService.generate_validation_report (Tavily + Groq RAG)", False, str(e))

    # 3. Test pitch simulation answer evaluation (Groq)
    try:
        evaluation = await AIService.evaluate_pitch_answer(
            question="How do you acquire customers?",
            answer="We use organic content marketing, developer outreach on GitHub, and seed targeted Google ads."
        )
        if evaluation and "score" in evaluation and "critique" in evaluation:
            log_test_result("AIService.evaluate_pitch_answer (Groq)", True)
        else:
            log_test_result("AIService.evaluate_pitch_answer (Groq)", False, f"Unexpected structure: {evaluation}")
    except Exception as e:
        log_test_result("AIService.evaluate_pitch_answer (Groq)", False, str(e))

    # 4. Test build advice generation (Groq)
    try:
        build_advice = await AIService.generate_build_advice(
            startup_type="SaaS Platform",
            startup_name="CleanWater IoT",
            industry="Healthcare / CleanTech",
            description="Smart water monitoring devices and dashboard."
        )
        if build_advice and "stack" in build_advice and "phases" in build_advice:
            log_test_result("AIService.generate_build_advice (Groq)", True)
        else:
            log_test_result("AIService.generate_build_advice (Groq)", False, f"Unexpected structure: {build_advice}")
    except Exception as e:
        log_test_result("AIService.generate_build_advice (Groq)", False, str(e))

    # 5. Test pitch questions (Groq)
    try:
        questions = await AIService.generate_pitch_questions(
            stage="MVP",
            startup_name="CleanWater IoT",
            industry="CleanTech",
            description="Smart IoT filters"
        )
        if questions and len(questions) > 0 and "text" in questions[0]:
            log_test_result("AIService.generate_pitch_questions (Groq)", True)
        else:
            log_test_result("AIService.generate_pitch_questions (Groq)", False, f"Unexpected structure: {questions}")
    except Exception as e:
        log_test_result("AIService.generate_pitch_questions (Groq)", False, str(e))

def test_api_endpoints():
    print("\n--- Running FastAPI Endpoint Tests ---")
    client = TestClient(app)
    
    test_email = "e2e_tester_123@studlyf.io"
    test_password = "SecurePassword123"
    token = None
    headers = {}
    
    try:
        # Pre-cleanup: Delete if user already exists
        active_db = get_db()
        active_db.users.delete_many({"email": test_email})
        
        # 1. Register
        reg_res = client.post("/api/auth/register", json={
            "name": "E2E Tester",
            "email": test_email,
            "password": test_password
        })
        if reg_res.status_code == 200 and reg_res.json().get("success"):
            log_test_result("POST /api/auth/register", True)
        else:
            log_test_result("POST /api/auth/register", False, f"Status: {reg_res.status_code}, Body: {reg_res.text}")
            return
            
        # 1.5. Verify OTP (required for verification flow)
        otp_record = active_db.otps.find_one({"email": test_email})
        if otp_record:
            otp_code = otp_record["otp"]
            verify_res = client.post("/api/auth/verify-otp", json={
                "email": test_email,
                "otp": otp_code
            })
            if verify_res.status_code == 200:
                log_test_result("POST /api/auth/verify-otp", True)
            else:
                log_test_result("POST /api/auth/verify-otp", False, f"Status: {verify_res.status_code}, Body: {verify_res.text}")
                return
        else:
            log_test_result("POST /api/auth/verify-otp", False, "No OTP record found in database")
            return
            
        # 2. Login
        login_res = client.post("/api/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        if login_res.status_code == 200 and login_res.json().get("access_token"):
            log_test_result("POST /api/auth/login", True)
            token = login_res.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            user_id = login_res.json().get("user", {}).get("id")
        else:
            log_test_result("POST /api/auth/login", False, f"Status: {login_res.status_code}, Body: {login_res.text}")
            return

        # 3. Get profile
        profile_res = client.get("/api/profile", headers=headers)
        if profile_res.status_code == 200:
            log_test_result("GET /api/profile", True)
        else:
            log_test_result("GET /api/profile", False, f"Status: {profile_res.status_code}, Body: {profile_res.text}")

        # 4. Onboarding
        onboard_res = client.post("/api/onboarding", headers=headers, json={
            "name": "E2E Tester Updated",
            "email": test_email,
            "startupName": "Agriculture Bot",
            "description": "Robotic crop seeding and automated watering.",
            "industry": "AgTech / Robotics",
            "country": "India",
            "stage": "Idea"
        })
        if onboard_res.status_code == 200 and onboard_res.json().get("success"):
            log_test_result("POST /api/onboarding", True)
        else:
            log_test_result("POST /api/onboarding", False, f"Status: {onboard_res.status_code}, Body: {onboard_res.text}")

        # 5. Run validation report
        validate_res = client.post("/api/validate", headers=headers, json={
            "startupIdea": "Agriculture Bot",
            "problemStatement": "Farmers spend excessive time manual seeding",
            "customerSegment": "Medium scale farmers in central India",
            "geography": "India"
        })
        report_id = None
        if validate_res.status_code == 200 and validate_res.json().get("success"):
            log_test_result("POST /api/validate", True)
            report_id = validate_res.json().get("report", {}).get("id")
        else:
            log_test_result("POST /api/validate", False, f"Status: {validate_res.status_code}, Body: {validate_res.text}")

        # 6. Retrieve reports history
        history_res = client.get("/api/validation/reports", headers=headers)
        if history_res.status_code == 200 and len(history_res.json()) > 0:
            log_test_result("GET /api/validation/reports", True)
        else:
            log_test_result("GET /api/validation/reports", False, f"Status: {history_res.status_code}, Body: {history_res.text}")

        # 7. Export report
        if report_id:
            export_res = client.get(f"/api/validation/export/{report_id}", headers=headers)
            if export_res.status_code == 200 and export_res.json().get("success"):
                log_test_result("GET /api/validation/export/{id}", True)
            else:
                log_test_result("GET /api/validation/export/{id}", False, f"Status: {export_res.status_code}, Body: {export_res.text}")

        # 8. Get Roadmap tasks
        roadmap_res = client.get("/api/roadmap", headers=headers)
        task_id = None
        if roadmap_res.status_code == 200:
            log_test_result("GET /api/roadmap", True)
            tasks = roadmap_res.json().get("tasks", [])
            if tasks:
                task_id = tasks[0].get("id")
        else:
            log_test_result("GET /api/roadmap", False, f"Status: {roadmap_res.status_code}, Body: {roadmap_res.text}")

        # 9. Toggle roadmap task status
        if task_id:
            toggle_res = client.post("/api/roadmap/toggle", headers=headers, json={"id": task_id})
            if toggle_res.status_code == 200 and toggle_res.json().get("success"):
                log_test_result("POST /api/roadmap/toggle", True)
            else:
                log_test_result("POST /api/roadmap/toggle", False, f"Status: {toggle_res.status_code}, Body: {toggle_res.text}")

        # 10. Copilot Chat
        chat_res = client.post("/api/copilot/chat", headers=headers, json={
            "message": "What is the best way to get pre-seed funding under SISFS?",
            "chatHistory": []
        })
        if chat_res.status_code == 200 and chat_res.json().get("success"):
            log_test_result("POST /api/copilot/chat", True)
        else:
            log_test_result("POST /api/copilot/chat", False, f"Status: {chat_res.status_code}, Body: {chat_res.text}")

        # 11. Pitch simulator questions
        questions_res = client.post("/api/copilot/pitch-simulator/questions", headers=headers)
        if questions_res.status_code == 200 and questions_res.json().get("success"):
            log_test_result("POST /api/copilot/pitch-simulator/questions", True)
        else:
            log_test_result("POST /api/copilot/pitch-simulator/questions", False, f"Status: {questions_res.status_code}, Body: {questions_res.text}")

        # 12. Pitch simulator evaluation
        evaluate_res = client.post("/api/copilot/pitch-simulator/evaluate", headers=headers, json={
            "question": "What is your main client acquisition channel?",
            "answer": "Direct partnership with farmer cooperatives and local dealers."
        })
        if evaluate_res.status_code == 200 and evaluate_res.json().get("success"):
            log_test_result("POST /api/copilot/pitch-simulator/evaluate", True)
        else:
            log_test_result("POST /api/copilot/pitch-simulator/evaluate", False, f"Status: {evaluate_res.status_code}, Body: {evaluate_res.text}")

        # 13. Network Investors and Mentors
        investors_res = client.get("/api/network/investors", headers=headers)
        if investors_res.status_code == 200:
            log_test_result("GET /api/network/investors", True)
        else:
            log_test_result("GET /api/network/investors", False, f"Status: {investors_res.status_code}, Body: {investors_res.text}")
            
        mentors_res = client.get("/api/network/mentors", headers=headers)
        if mentors_res.status_code == 200:
            log_test_result("GET /api/network/mentors", True)
        else:
            log_test_result("GET /api/network/mentors", False, f"Status: {mentors_res.status_code}, Body: {mentors_res.text}")

        # 14. Network relationship path
        rel_res = client.post("/api/network/relationship-path", headers=headers, json={
            "contactName": "Priya Sharma",
            "targetEntity": "Peak XV Partners"
        })
        if rel_res.status_code == 200 and rel_res.json().get("success"):
            log_test_result("POST /api/network/relationship-path", True)
        else:
            log_test_result("POST /api/network/relationship-path", False, f"Status: {rel_res.status_code}, Body: {rel_res.text}")

        # 15. CSV Import & LinkedIn Analysis
        csv_payload = "First Name,Last Name,Company,Position,Email Address\nVikram,Malhotra,Peak XV,Investment Director,vikram@peakxv.com\nPriya,Sharma,Razorpay,Lead Engineer,priya@razorpay.com"
        import_res = client.post("/api/network/import-csv", headers=headers, json={"csvContent": csv_payload})
        if import_res.status_code == 200 and import_res.json().get("success"):
            log_test_result("POST /api/network/import-csv", True)
        else:
            log_test_result("POST /api/network/import-csv", False, f"Status: {import_res.status_code}, Body: {import_res.text}")

        analyze_res = client.post("/api/network/analyze-linkedin", headers=headers, json={"startupIdea": "Agriculture Bot"})
        if analyze_res.status_code == 200 and analyze_res.json().get("success"):
            log_test_result("POST /api/network/analyze-linkedin", True)
        else:
            log_test_result("POST /api/network/analyze-linkedin", False, f"Status: {analyze_res.status_code}, Body: {analyze_res.text}")

        # 16. Public startup profile by slug
        # We need to save slug on user profile first
        if user_id:
            active_db.profiles.update_one({"user_id": user_id}, {"$set": {"slug": "agbot-123"}})
        public_res = client.get("/api/public/startup/agbot-123")
        if public_res.status_code == 200 and public_res.json().get("success"):
            log_test_result("GET /api/public/startup/{slug}", True)
        else:
            log_test_result("GET /api/public/startup/{slug}", False, f"Status: {public_res.status_code}, Body: {public_res.text}")

        # 17. Connected Dashboard Data
        dash_res = client.get("/api/dashboard/connected-data", headers=headers)
        if dash_res.status_code == 200 and "startupHealthScore" in dash_res.json():
            log_test_result("GET /api/dashboard/connected-data", True)
        else:
            log_test_result("GET /api/dashboard/connected-data", False, f"Status: {dash_res.status_code}, Body: {dash_res.text}")

        # Clean up test user & associated docs
        if user_id:
            try:
                active_db.users.delete_one({"_id": ObjectId(user_id)})
            except Exception:
                active_db.users.delete_one({"_id": user_id})
            active_db.users.delete_one({"email": test_email})
            active_db.profiles.delete_many({"user_id": user_id})
            active_db.validation_reports.delete_many({"user_id": user_id})
            active_db.contacts.delete_many({"user_id": user_id})
            active_db.roadmap_tasks.delete_many({"user_id": user_id})
            print("Cleanup of test user database records completed.")

    except Exception as e:
        log_test_result("FastAPI Endpoints E2E", False, f"Exception: {str(e)}\n{traceback.format_exc()}")

async def main():
    await test_database_crud()
    await test_ai_services()
    test_api_endpoints()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
