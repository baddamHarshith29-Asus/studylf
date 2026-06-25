import asyncio
from backend.ai.base_provider import BaseAIProvider, BaseMockLLM
from backend.core.config import settings
from backend.core.logger import logger

class GeminiProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = "gemini-2.5-flash-lite"
        self._llm = None
        self._init_client()

    def _get_llm(self, model_name: str):
        if not self.api_key or self.api_key.startswith("your_"):
            return BaseMockLLM("Gemini")
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(
                api_key=self.api_key,
                model=model_name,
                temperature=0.2
            )
        except Exception as e:
            logger.error(f"Error loading langchain_google_genai for model {model_name}: {e}")
            return BaseMockLLM("Gemini")

    def _init_client(self):
        self._llm = self._get_llm(self.model_name)
        if not isinstance(self._llm, BaseMockLLM):
            logger.info(f"Successfully initialized ChatGoogleGenerativeAI client for {self.model_name}.")
        else:
            logger.warning("GEMINI_API_KEY is not set or invalid. Using BaseMockLLM.")

    async def generate(self, prompt: str) -> str:
        if isinstance(self._llm, BaseMockLLM):
            raise RuntimeError("Gemini is not configured (using Mock LLM).")
        try:
            response = await asyncio.to_thread(self._llm.invoke, prompt)
            return response.content.strip()
        except Exception as e:
            err_str = str(e)
            if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str or "503" in err_str:
                fallback_model = "gemini-2.5-flash" if self.model_name == "gemini-2.5-flash-lite" else "gemini-2.5-flash-lite"
                logger.warning(f"Gemini generation with {self.model_name} failed with quota/rate limit: {e}. Retrying with fallback model {fallback_model}...")
                fallback_llm = self._get_llm(fallback_model)
                if not isinstance(fallback_llm, BaseMockLLM):
                    try:
                        response = await asyncio.to_thread(fallback_llm.invoke, prompt)
                        # Self-heal: update primary model since the fallback succeeded
                        self.model_name = fallback_model
                        self._llm = fallback_llm
                        logger.info(f"Successfully self-healed Gemini provider to use {fallback_model}.")
                        return response.content.strip()
                    except Exception as fallback_err:
                        logger.error(f"Gemini fallback generation also failed: {fallback_err}")
            logger.error(f"Gemini generation failed: {e}")
            raise

    async def test_connection(self) -> bool:
        if not self.api_key or self.api_key.startswith("your_"):
            return False
        
        # Try primary model first
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(api_key=self.api_key, model=self.model_name, timeout=3.0)
            await asyncio.to_thread(llm.invoke, "ping")
            return True
        except Exception as e:
            err_str = str(e)
            if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str or "503" in err_str:
                fallback_model = "gemini-2.5-flash" if self.model_name == "gemini-2.5-flash-lite" else "gemini-2.5-flash-lite"
                logger.warning(f"Gemini connection test for {self.model_name} failed: {e}. Trying fallback model {fallback_model}...")
                try:
                    llm_fb = ChatGoogleGenerativeAI(api_key=self.api_key, model=fallback_model, timeout=3.0)
                    await asyncio.to_thread(llm_fb.invoke, "ping")
                    # Fallback succeeded! Switch primary model name.
                    self.model_name = fallback_model
                    self._llm = self._get_llm(fallback_model)
                    logger.info(f"Successfully self-healed Gemini connection to use {fallback_model}.")
                    return True
                except Exception as fb_err:
                    logger.error(f"Gemini fallback connection test also failed: {fb_err}")
            return False
