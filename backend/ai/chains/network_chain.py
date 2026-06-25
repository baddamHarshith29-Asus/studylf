import json
from typing import List, Dict, Any
from backend.ai.ai_manager import ai_manager
from backend.ai.prompts.network_prompt import NETWORK_PROMPT_TEMPLATE
from backend.core.logger import logger

class NetworkChain:
    @staticmethod
    async def run(startup_idea: str, contacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Matches a startup idea against professional contacts and recommends roles."""
        
        contacts_str = "\n".join([f"- Name: {c['name']}, Title/Company: {c.get('company', '')}, Skills/Notes: {c.get('notes', '')}" for c in contacts])
        prompt = NETWORK_PROMPT_TEMPLATE.format(startup_idea=startup_idea, contacts_str=contacts_str)
        
        try:
            content = await ai_manager.generate_response(prompt)
            content = content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)["recommendations"]
        except Exception as e:
            logger.error(f"Error executing NetworkChain: {str(e)}")
            res = []
            for c in contacts[:4]:
                role = "Advisor"
                c_notes = c.get("notes", "").lower()
                c_company = c.get("company", "").lower()
                if "engineer" in c_notes or "developer" in c_company or "cto" in c_notes:
                    role = "Technical Expert"
                elif "founder" in c_company or "director" in c_company or "gtm" in c_notes:
                    role = "Co-founder"
                elif "invest" in c_notes or "vc" in c_company or "angel" in c_notes:
                    role = "Potential Investor"
                res.append({
                    "name": c["name"],
                    "company": c.get("company", "Independent"),
                    "recommendedRole": role,
                    "matchReason": f"Has valuable industry skills matching the development and scale requirements of '{startup_idea}'."
                })
            return res
