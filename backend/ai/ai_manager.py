import time
from typing import Dict, Any, List, Optional
from backend.core.database import get_db
from backend.ai.provider_factory import ProviderFactory
from backend.core.logger import logger

class AIManager:
    def __init__(self):
        self.unhealthy_providers = set()

    @staticmethod
    def _get_db():
        return get_db()

    async def get_configured_providers(self) -> Dict[str, str]:
        """Reads AI provider priority settings from MongoDB, falling back to defaults if not set."""
        db = self._get_db()
        defaults = {
            "primary": "groq",
            "secondary": "gemini",
            "fallback": "ollama"
        }
        
        try:
            p_doc = db.settings.find_one({"setting_name": "primary_ai_provider"})
            s_doc = db.settings.find_one({"setting_name": "secondary_ai_provider"})
            f_doc = db.settings.find_one({"setting_name": "fallback_ai_provider"})
            
            return {
                "primary": p_doc.get("value") if p_doc else defaults["primary"],
                "secondary": s_doc.get("value") if s_doc else defaults["secondary"],
                "fallback": f_doc.get("value") if f_doc else defaults["fallback"]
            }
        except Exception as e:
            logger.error(f"Error fetching AI provider settings from DB: {e}")
            return defaults

    async def generate_response(self, prompt: str) -> str:
        """Executes LLM request using primary -> secondary -> fallback flow, tracking metrics in MongoDB."""
        providers = await self.get_configured_providers()
        priority_list = [
            ("primary", providers["primary"]),
            ("secondary", providers["secondary"]),
            ("fallback", providers["fallback"])
        ]
        
        last_error = None
        
        for priority_type, provider_name in priority_list:
            if provider_name in self.unhealthy_providers:
                continue
                
            provider = ProviderFactory.get_provider(provider_name)
            
            t0 = time.time()
            try:
                is_fallback = (priority_type != "primary")
                response_text = await provider.generate(prompt)
                duration = time.time() - t0
                
                # Success! Log and update metrics
                await self._update_metrics(
                    provider_name=provider_name,
                    duration=duration,
                    success=True,
                    is_fallback=is_fallback
                )
                
                return response_text
            except Exception as e:
                duration = time.time() - t0
                last_error = e
                logger.error(f"AI Provider '{provider_name}' ({priority_type}) failed. Error: {e}")
                self.unhealthy_providers.add(provider_name)
                logger.warning(f"Marked provider '{provider_name}' as unhealthy. Circuit breaker active.")
                
                # Failure! Update metrics
                await self._update_metrics(
                    provider_name=provider_name,
                    duration=duration,
                    success=False,
                    is_fallback=(priority_type != "primary")
                )
                
        # If all providers failed, fall back to mock response to ensure system resilience (Goal 10)
        logger.warning(f"All configured AI Providers failed or are marked unhealthy. Last error: {last_error}. Using local MockLLM backup to ensure system availability.")
        from backend.ai.base_provider import BaseMockLLM
        fallback_mock = BaseMockLLM("SystemFallback")
        response = fallback_mock.invoke(prompt)
        return response.content.strip()

    async def _update_metrics(self, provider_name: str, duration: float, success: bool, is_fallback: bool):
        db = self._get_db()
        try:
            stats = db.ai_analytics.find_one({"provider": provider_name})
            if not stats:
                stats = {
                    "provider": provider_name,
                    "usage_count": 0,
                    "average_response_time": 0.0,
                    "failure_count": 0,
                    "fallback_count": 0,
                    "last_request_time": 0.0
                }
            
            old_count = stats.get("usage_count", 0)
            old_avg = stats.get("average_response_time", 0.0)
            
            new_count = old_count + 1
            new_avg = old_avg
            if success:
                new_avg = ((old_avg * old_count) + duration) / new_count
                
            update_data = {
                "usage_count": new_count,
                "average_response_time": new_avg,
                "last_request_time": time.time(),
                "failure_count": stats.get("failure_count", 0),
                "fallback_count": stats.get("fallback_count", 0)
            }
            
            if not success:
                update_data["failure_count"] += 1
                
            if is_fallback:
                update_data["fallback_count"] += 1
                
            db.ai_analytics.update_one(
                {"provider": provider_name},
                {"$set": update_data},
                upsert=True
            )
        except Exception as e:
            logger.error(f"Failed to update AI analytics for '{provider_name}': {e}")

# Export singleton instance
ai_manager = AIManager()
