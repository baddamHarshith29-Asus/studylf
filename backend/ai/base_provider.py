import json
from abc import ABC, abstractmethod
from typing import Any
from backend.core.logger import logger

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """Generates text completion for the given prompt."""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Returns True if the provider is online/accessible, False otherwise."""
        pass

class BaseMockLLM:
    def __init__(self, provider_name: str):
        self.provider_name = provider_name

    def invoke(self, prompt: Any) -> Any:
        prompt_str = str(prompt)
        logger.info(f"[Mock {self.provider_name}] Received prompt: {prompt_str[:100]}...")
        lower = prompt_str.lower()
        
        class MockResponse:
            def __init__(self, content: str):
                self.content = content
                
        # 1. Parse resume
        if "profiling tool" in lower or "sarah connor" in lower or "resume" in lower:
            return MockResponse('{\n  "name": "Sarah Connor",\n  "email": "sarah@skynet.io",\n  "startupName": "Skynet Defender",\n  "description": "Predictive security and AI agent monitoring software for modern enterprise infrastructure.",\n  "industry": "AI & Security",\n  "country": "India",\n  "stage": "Validation"\n}')
            
        # 2. Sequoia customized slides
        elif "sequoia" in lower or "slide" in lower or "guidance" in lower:
            try:
                start = prompt_str.find("[")
                end = prompt_str.rfind("]")
                if start != -1 and end != -1:
                    slides = json.loads(prompt_str[start:end+1])
                    for s in slides:
                        s["guidance"] = f"E2E Custom Guidance: Focus on your core tech solutions and highlight unique traction points."
                    return MockResponse(json.dumps(slides))
            except Exception as e:
                logger.error(f"Error parsing mock slides: {e}")
            return MockResponse('[{"id": 1, "title": "Company Purpose", "guidance": "Define the single-line value proposition.", "placeholder": "E2E Placeholder"}]')
            
        # 4. Startup idea validation (matched first to prevent overlap with advisor prompt text)
        elif "validate" in lower or "validation" in lower or "viability" in lower or "scores" in lower:
            return MockResponse('{\n  "scores": {\n    "overall": 82,\n    "demand": 85,\n    "competition": 60,\n    "scalability": 90,\n    "revenuePotential": 80\n  },\n  "marketResearch": {\n    "marketSize": "TAM: $10B, SAM: $1.2B, SOM: $150M in the targeted developer tools market.",\n    "growthTrends": "Strong CAGR of 18.2% driven by AI adoption.",\n    "industryOverview": "The space is shifting from generic SaaS platforms to hyper-targeted API integrations."\n  },\n  "competitors": [\n    {"name": "Vercel", "funding": "$313M", "pricing": "$20/mo", "type": "Indirect"},\n    {"name": "Heroku", "funding": "N/A", "pricing": "$7/mo", "type": "Indirect"}\n  ],\n  "customerPersona": {\n    "name": "Alex, Lead Engineer at 30-person Startup",\n    "painPoints": "Spends hours configuring server nodes, deployment pipeline bottlenecks.",\n    "behavior": "Sells to developers, uses GitHub Actions, values deployment speed."\n  }\n}')
            
        # 3. Technical build advisor
        elif "build" in lower or "technical stack recommendation" in lower or "costestimates" in lower:
            return MockResponse('{\n  "stack": {\n    "frontend": "React.js (Vite) + Tailwind CSS",\n    "backend": "Python FastAPI + PyMongo + Uvicorn",\n    "database": "MongoDB document store",\n    "hosting": "Docker Compose + Nginx proxy",\n    "ai": "Groq (Llama 3.3) & Gemini (Flash) via LangChain RAG"\n  },\n  "phases": [\n    { "phase": "MVP Phase", "duration": "4-6 weeks", "objectives": "Core functional flow, JWT authentication, user data forms." },\n    { "phase": "Growth Phase", "duration": "4 weeks", "objectives": "Email triggers, stripe subscriptions, custom dashboards." },\n    { "phase": "Scale Phase", "duration": "Ongoing", "objectives": "Multi-region db cluster, query caching, analytics hooks." }\n  ],\n  "costEstimates": [\n    { "item": "Hosting (Vercel + Supabase/Atlas)", "mvp": "$0 / mo", "growth": "$35 / mo", "scale": "$120 / mo" },\n    { "item": "AI Token usage (Groq + Gemini)", "mvp": "$0 (Free tier)", "growth": "$40 / mo", "scale": "$300 / mo" },\n    { "item": "Stripe, Email (Resend) & Logs", "mvp": "$0 / mo", "growth": "$19 / mo", "scale": "$80 / mo" },\n    { "item": "Domain & SSL", "mvp": "$12 / yr", "growth": "$12 / yr", "scale": "$100 / yr" }\n  ]\n}')
            
        # 5. Pitch simulator questions
        elif "interview question" in lower or "generate exactly 2" in lower:
            return MockResponse('{\n  "questions": [\n    {\n      "id": "q-1",\n      "text": "What is the specific pain point that you have personally witnessed?",\n      "tips": "Discuss a concrete scenario or friction point."\n    },\n    {\n      "id": "q-2",\n      "text": "Who is the customer that needs this product the most, and how do you know?",\n      "tips": "Narrow down your ICP persona."\n    }\n  ]\n}')
            
        # 6. Pitch practice evaluation
        elif "pitch" in lower or "feedback" in lower or "score out of 10" in lower or "coach" in lower:
            return MockResponse('{\n  "score": 8,\n  "critique": "Excellent articulation of the core problem. However, your target market sizing and competitor positioning could be clearer.",\n  "tips": "Try specifying your SAM/SOM details and outline a concrete 12-month customer acquisition GTM strategy."\n}')
            
        # 7. Network / Mentor matches
        elif "mentor" in lower or "investor" in lower or "network" in lower or "allies" in lower:
            return MockResponse("This looks like a solid pitch. The investor matches your industry sectors and typical ticket sizes.")
            
        # 8. General fallback chat
        return MockResponse("I am your AI-powered Startup Copilot. How can I help validate your venture, check funding opportunities, or improve your pitch deck today?")
