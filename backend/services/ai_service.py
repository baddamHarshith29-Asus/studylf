import json
import time
from typing import Dict, List, Optional, Any
from backend.ai.ai_manager import ai_manager
from backend.ai.chains.funding_chain import FundingChain
from backend.ai.chains.network_chain import NetworkChain
from backend.ai.rag import RAGPipeline
from backend.core.logger import logger

class AIService:
    @classmethod
    async def parse_resume(cls, filename: str) -> Dict[str, Any]:
        """Parses resume PDF or CSV context using AI Manager."""
        prompt = (
            f"You are a startup co-founder profiling tool. The user uploaded a file named '{filename}'. "
            "Generate a mock profile that fits the file context. If the file name looks like a specific founder profile, "
            "tailor the response. Otherwise, output a typical tech startup profile.\n"
            "You MUST return a JSON object conforming exactly to this structure:\n"
            "{\n"
            "  \"name\": \"Sarah Connor\",\n"
            "  \"email\": \"sarah@skynet.io\",\n"
            "  \"startupName\": \"Skynet Defender\",\n"
            "  \"description\": \"Describe a predictive security AI software project.\",\n"
            "  \"industry\": \"AI & Security\",\n"
            "  \"country\": \"India\",\n"
            "  \"stage\": \"Validation\"\n"
            "}"
        )
        
        try:
            content = await ai_manager.generate_response(prompt)
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except Exception as e:
            logger.error(f"Error parsing resume via Gemini client: {str(e)}")
            return {
                "name": "Sarah Connor",
                "email": "sarah@skynet.io",
                "startupName": "Skynet Defender",
                "description": "Predictive security and AI agent monitoring software for modern enterprise infrastructure.",
                "industry": "AI & Security",
                "country": "India",
                "stage": "Validation"
            }

    @classmethod
    async def generate_validation_report(
        cls, 
        startup_idea: str, 
        problem_statement: Optional[str] = None, 
        customer_segment: Optional[str] = None, 
        geography: Optional[str] = None
    ) -> Dict[str, Any]:
        """Validates ideas using the RAG search pipeline."""
        return await RAGPipeline.generate_idea_validation(
            startup_idea=startup_idea,
            problem_statement=problem_statement,
            customer_segment=customer_segment,
            geography=geography
        )

    @classmethod
    async def evaluate_pitch_answer(cls, question: str, answer: str) -> Dict[str, Any]:
        """Evaluates a pitch practice response using AI Manager."""
        prompt = (
            "You are a startup pitch coach. Evaluate the following response from a founder to a VC:\n"
            f"Question: {question}\n"
            f"Founder's Answer: {answer}\n\n"
            "Score the response out of 10. Be constructive but honest.\n"
            "Output MUST be in JSON format matching this schema:\n"
            "{\n"
            "  \"score\": int (1 to 10),\n"
            "  \"critique\": \"Critique narrative text summarizing strengths and gaps in their answer.\",\n"
            "  \"tips\": \"Tip: Actions they should take next to improve the pitch.\"\n"
            "}"
        )
        
        try:
            content = await ai_manager.generate_response(prompt)
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            data = json.loads(content)
            if isinstance(data.get("tips"), list):
                data["tips"] = " ".join([str(t) for t in data["tips"]])
            return data
        except Exception as e:
            logger.error(f"Error evaluating pitch response via Groq: {str(e)}")
            if not answer or len(answer.strip()) < 15:
                return {
                    "score": 3,
                    "critique": "Your response is too brief. VCs expect structured details.",
                    "tips": "Tip: Use the STAR method: explain the Situation, Task, Action, and the Result."
                }
            return {
                "score": 7,
                "critique": "Solid answer. You focus on the core value. Good use of metrics and data.",
                "tips": "Tip: Highlight your primary acquisition channel more clearly."
            }

    @classmethod
    async def chat_copilot(cls, message: str, context: str) -> str:
        """Copilot chat using FundingChain and localized DB context logs."""
        return await FundingChain.run_copilot_chat(message, context)

    @classmethod
    async def match_linkedin_network(cls, startup_idea: str, contacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Matches a startup idea against professional contacts using NetworkChain."""
        return await NetworkChain.run(startup_idea, contacts)

    @classmethod
    async def generate_build_advice(
        cls,
        startup_type: str,
        startup_name: str,
        industry: str,
        description: str
    ) -> Dict[str, Any]:
        """Generates dynamic technical build advice using AI Manager."""
        prompt = (
            "You are an AI Technical Architect & Startup Build Advisor.\n"
            f"The founder is building a '{startup_type}' startup.\n"
            "Venture Details:\n"
            f"- Startup Name: {startup_name or 'My Startup'}\n"
            f"- Industry: {industry or 'AI & SaaS'}\n"
            f"- Description: {description or 'Building next-generation software products.'}\n\n"
            "Generate a comprehensive, custom technical stack recommendation, phased roadmap, and monthly cost estimates for this startup.\n"
            "The response MUST be a single, valid JSON object conforming exactly to this structure:\n"
            "{\n"
            "  \"stack\": {\n"
            "    \"frontend\": \"Frontend stack recommendation (e.g. React + Vite + Tailwind)\",\n"
            "    \"backend\": \"Backend stack recommendation (e.g. Python FastAPI + Uvicorn)\",\n"
            "    \"database\": \"Database recommendation (e.g. MongoDB Atlas)\",\n"
            "    \"hosting\": \"Hosting and infrastructure recommendation (e.g. AWS ECS / Vercel)\",\n"
            "    \"ai\": \"AI integration recommendation (e.g. LangChain + Groq + Gemini)\"\n"
            "  },\n"
            "  \"phases\": [\n"
            "    {\n"
            "      \"phase\": \"MVP Phase\",\n"
            "      \"duration\": \"Duration (e.g. 4-6 weeks)\",\n"
            "      \"objectives\": \"Key objectives to build the core MVP features\"\n"
            "    },\n"
            "    {\n"
            "      \"phase\": \"Growth Phase\",\n"
            "      \"duration\": \"Duration (e.g. 4-8 weeks)\",\n"
            "      \"objectives\": \"Objectives for user growth, Stripe payments, custom analytics, etc.\"\n"
            "    },\n"
            "    {\n"
            "      \"phase\": \"Scale Phase\",\n"
            "      \"duration\": \"Duration (e.g. Ongoing)\",\n"
            "      \"objectives\": \"Objectives for scale, performance, caching, multi-region deploy\"\n"
            "    }\n"
            "  ],\n"
            "  \"costEstimates\": [\n"
            "    {\n"
            "      \"item\": \"Hosting (e.g. Vercel / AWS)\",\n"
            "      \"mvp\": \"Cost during MVP (e.g. $0 / mo)\",\n"
            "      \"growth\": \"Cost during Growth (e.g. $25 / mo)\",\n"
            "      \"scale\": \"Cost during Scale (e.g. $150 / mo)\"\n"
            "    },\n"
            "    {\n"
            "      \"item\": \"AI APIs (e.g. OpenAI / Gemini / Groq)\",\n"
            "      \"mvp\": \"Cost during MVP (e.g. $0 - Free Tier)\",\n"
            "      \"growth\": \"Cost during Growth (e.g. $40 / mo)\",\n"
            "      \"scale\": \"Cost during Scale (e.g. $300 / mo)\"\n"
            "    },\n"
            "    {\n"
            "      \"item\": \"Database & Storage\",\n"
            "      \"mvp\": \"Cost during MVP\",\n"
            "      \"growth\": \"Cost during Growth\",\n"
            "      \"scale\": \"Cost during Scale\"\n"
            "    },\n"
            "    {\n"
            "      \"item\": \"Domain & Email (e.g. Resend)\",\n"
            "      \"mvp\": \"Cost during MVP\",\n"
            "      \"growth\": \"Cost during Growth\",\n"
            "      \"scale\": \"Cost during Scale\"\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Ensure all recommendations are highly tailored to the specific startup details provided, and keep cost estimates and phases realistic. Return ONLY the valid JSON block without markdown code blocks, backticks, or any conversational text."
        )
        
        try:
            content = await ai_manager.generate_response(prompt)
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except Exception as e:
            logger.error(f"Error generating AI build advice: {str(e)}")
            stack = {
                "frontend": "React.js (Vite) + Tailwind CSS",
                "backend": "Python FastAPI + PyMongo + Uvicorn",
                "database": "MongoDB document store",
                "hosting": "Docker Compose + Nginx proxy",
                "ai": "Groq (Llama 3.3) & Gemini (Flash) via LangChain RAG"
            }
            if startup_type == "Mobile App":
                stack = {
                    "frontend": "React Native / Expo",
                    "backend": "Python FastAPI / MongoDB",
                    "database": "MongoDB",
                    "hosting": "Apple App Store + Google Play Store",
                    "ai": "Gemini API Proxy / Local ML"
                }
            elif startup_type == "Marketplace":
                stack = {
                    "frontend": "React.js + Next.js",
                    "backend": "FastAPI / Stripe Connect",
                    "database": "MongoDB document store",
                    "hosting": "AWS / Nginx proxy",
                    "ai": "Semantic Search vector indexing"
                }
            return {
                "stack": stack,
                "phases": [
                    { "phase": "MVP Phase", "duration": "4-6 weeks", "objectives": "Core functional flow, JWT authentication, user data forms." },
                    { "phase": "Growth Phase", "duration": "4 weeks", "objectives": "Email triggers, stripe subscriptions, custom dashboards." },
                    { "phase": "Scale Phase", "duration": "Ongoing", "objectives": "Multi-region db cluster, query caching, analytics hooks." }
                ],
                "costEstimates": [
                    { "item": "Hosting (Vercel + Supabase/Atlas)", "mvp": "$0 / mo", "growth": "$35 / mo", "scale": "$120 / mo" },
                    { "item": "AI Token usage (Groq + Gemini)", "mvp": "$0 (Free tier)", "growth": "$40 / mo", "scale": "$300 / mo" },
                    { "item": "Stripe, Email (Resend) & Logs", "mvp": "$0 / mo", "growth": "$19 / mo", "scale": "$80 / mo" },
                    { "item": "Domain & SSL", "mvp": "$12 / yr", "growth": "$12 / yr", "scale": "$100 / yr" }
                ]
            }

    @classmethod
    async def customize_storyboard(
        cls,
        startup_name: str,
        industry: str,
        description: str,
        slides: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Uses AI Manager to customize pitch deck slide guidance based on company profile."""
        slides_str = json.dumps(slides)
        prompt = (
            "You are an AI Pitch Deck Coach. You help founders optimize their Sequoia Pitch Storyboard.\n"
            f"The founder's startup is named '{startup_name}' operating in the '{industry}' industry.\n"
            f"Description: {description}\n\n"
            f"Here is the default Sequoia slide structure with placeholder guidance:\n{slides_str}\n\n"
            "Rewrite ONLY the 'guidance' fields of each slide to be highly specific and helpful for this exact startup. "
            "Suggest concrete questions they should answer, examples relevant to their sector, or specific data points they should highlight. "
            "Keep the original slide IDs, titles, and placeholders exactly the same.\n"
            "Return a valid JSON array matching the original slide structure. Do not include markdown code block formatting or backticks in your output."
        )
        
        try:
            content = await ai_manager.generate_response(prompt)
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except Exception as e:
            logger.error(f"Error customizing storyboard via LLM: {str(e)}")
            customized = []
            for slide in slides:
                s = slide.copy()
                s["guidance"] = s["guidance"].replace("your startup", startup_name).replace("the target sector", industry)
                customized.append(s)
            return customized

    @classmethod
    async def generate_pitch_questions(
        cls,
        stage: str,
        startup_name: str,
        industry: str,
        description: str
    ) -> List[Dict[str, Any]]:
        """Generates 2-3 dynamic VC pitch questions tailored to the startup profile."""
        prompt = (
            "You are an AI Venture Capital Pitch Coach.\n"
            f"The founder's startup is '{startup_name}' in the '{industry}' industry at the '{stage}' stage.\n"
            f"Description: {description}\n\n"
            "Generate exactly 2 high-quality VC interview questions that a partner at Sequoia or Y Combinator would ask this specific startup. "
            "For each question, provide a helpful coaching tip to guide the founder's answer.\n"
            "The output MUST be a valid JSON object conforming exactly to this structure:\n"
            "{\n"
            "  \"questions\": [\n"
            "    {\n"
            "      \"id\": \"q-1\",\n"
            "      \"text\": \"Question text?\",\n"
            "      \"tips\": \"Coaching tip for answering this question.\"\n"
            "    },\n"
            "    {\n"
            "      \"id\": \"q-2\",\n"
            "      \"text\": \"Question text?\",\n"
            "      \"tips\": \"Coaching tip for answering this question.\"\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Return ONLY the valid JSON block without markdown formatting or conversational text."
        )
        
        try:
            content = await ai_manager.generate_response(prompt)
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)["questions"]
        except Exception as e:
            logger.error(f"Error generating dynamic pitch questions: {str(e)}")
            fallback_questions = {
                'Idea': [
                    { "id": 'q-1', "text": "What is the specific pain point that you have personally witnessed?", "tips": "Discuss a concrete scenario or friction point." },
                    { "id": 'q-2', "text": "Who is the customer that needs this product the most, and how do you know?", "tips": "Narrow down your ICP persona." }
                ],
                'Validation': [
                    { "id": 'q-1', "text": "What is your landing page or waitlist conversion rate so far?", "tips": "Share specific conversion rates." }
                ],
                'MVP': [
                    { "id": 'q-1', "text": "What are the core technical trade-offs you made when building your MVP?", "tips": "Explain stack choices and load limit workarounds." }
                ]
            }
            return fallback_questions.get(stage, fallback_questions['Idea'])
