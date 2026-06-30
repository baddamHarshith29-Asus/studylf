import httpx
import asyncio
from backend.ai.base_provider import BaseAIProvider, BaseMockLLM
from backend.core.logger import logger
from backend.core.config import settings
from backend.core.database import get_db

class OllamaProvider(BaseAIProvider):
    def __init__(self):
        self.endpoint = "http://localhost:11434/api/generate"
        self._default_model = getattr(settings, "OLLAMA_MODEL", "llama3")

    def _get_model_name(self) -> str:
        try:
            db = get_db()
            doc = db.settings.find_one({"setting_name": "ollama_model"})
            if doc and doc.get("value"):
                return doc.get("value")
        except Exception as e:
            logger.error(f"Error fetching Ollama model from DB: {e}")
        return self._default_model

    async def _resolve_model(self) -> str:
        configured = self._get_model_name()
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.get("http://localhost:11434/api/tags")
                if r.status_code == 200:
                    data = r.json()
                    installed_tags = [m.get("name") for m in data.get("models", []) if m.get("name")]
                    
                    if not installed_tags:
                        return configured
                        
                    # 1. Exact match
                    if configured in installed_tags:
                        return configured
                    # 2. Match configured:latest
                    if f"{configured}:latest" in installed_tags:
                        return f"{configured}:latest"
                    # 3. Match prefix (e.g. configured:*)
                    for tag in installed_tags:
                        if tag.startswith(f"{configured}:"):
                            return tag
                    # 4. Match base name (e.g. if tag has a colon)
                    for tag in installed_tags:
                        if ":" in tag:
                            base = tag.split(":")[0]
                            if base == configured:
                                return tag
                    # 4.5. Match substring (e.g. if tag contains configured name)
                    for tag in installed_tags:
                        if configured.lower() in tag.lower():
                            return tag
                                
                    # 5. Fallback to a non-reasoning installed model if possible, otherwise first installed
                    fallback_model = None
                    for tag in installed_tags:
                        tag_lower = tag.lower()
                        if "deepseek-r1" not in tag_lower and "thinking" not in tag_lower:
                            fallback_model = tag
                            break
                    if not fallback_model:
                        fallback_model = installed_tags[0]
                    logger.warning(f"Configured Ollama model '{configured}' not found in installed models {installed_tags}. Falling back to '{fallback_model}'.")
                    return fallback_model
        except Exception as e:
            logger.warning(f"Failed to query local Ollama tags for resolution: {e}")
        return configured

    async def generate(self, prompt: str) -> str:
        model = await self._resolve_model()
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    self.endpoint,
                    json=payload
                )
                response.raise_for_status()
                return response.json()["response"]
        except httpx.TimeoutException:
            logger.error("Ollama timeout")
            raise
        except Exception as e:
            logger.error(f"Ollama Error: {str(e)}")
            raise

    async def test_connection(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(
                    "http://localhost:11434/api/tags"
                )
                return response.status_code == 200
        except Exception:
            return False
