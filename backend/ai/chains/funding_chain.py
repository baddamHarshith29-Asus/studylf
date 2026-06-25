import json
from typing import Dict, Any
from backend.ai.ai_manager import ai_manager
from backend.ai.prompts.copilot_prompt import COPILOT_PROMPT_TEMPLATE
from backend.core.logger import logger

class FundingChain:
    @staticmethod
    async def run_copilot_chat(message: str, context: str) -> str:
        """Runs the copilot LLM chain for general queries or funding questions."""
        prompt = COPILOT_PROMPT_TEMPLATE.format(message=message, context=context)
        
        try:
            content = await ai_manager.generate_response(prompt)
            return content.strip()
        except Exception as e:
            logger.error(f"Error in FundingChain copilot chat: {str(e)}")
            lower = message.lower()
            if "grant" in lower or "sisfs" in lower:
                return "Based on your query, the most relevant program is the Startup India Seed Fund Scheme (SISFS). It is a non-dilutive grant of up to ₹50 Lakhs provided by DPIIT. Eligibility requires DPIIT recognition, incorporation, and stage between Idea and MVP."
            return "Starting a startup in the AI & SaaS space requires a structured GTM. Your immediate priorities should be validation interviews, defining your core value proposition, and building a lightweight landing page before investing heavily in software development."
