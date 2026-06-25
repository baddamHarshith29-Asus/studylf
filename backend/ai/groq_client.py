import asyncio
from backend.ai.base_provider import BaseAIProvider, BaseMockLLM
from backend.core.config import settings
from backend.core.logger import logger

class GroqProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model_name = "llama-3.3-70b-versatile"
        self._llm = None
        self._init_client()

    def _init_client(self):
        if not self.api_key or self.api_key.startswith("your_"):
            logger.warning("GROQ_API_KEY is not set or is placeholder. Using BaseMockLLM.")
            self._llm = BaseMockLLM("Groq")
        else:
            try:
                from langchain_groq import ChatGroq
                self._llm = ChatGroq(
                    api_key=self.api_key,
                    model=self.model_name,
                    temperature=0.2
                )
                logger.info("Successfully initialized ChatGroq client.")
            except Exception as e:
                logger.error(f"Error loading langchain_groq. Using BaseMockLLM. Error: {e}")
                self._llm = BaseMockLLM("Groq")

    async def generate(self, prompt: str) -> str:
        if isinstance(self._llm, BaseMockLLM):
            raise RuntimeError("Groq is not configured (using Mock LLM).")
        try:
            response = await asyncio.to_thread(self._llm.invoke, prompt)
            return response.content.strip()
        except Exception as e:
            logger.error(f"Groq generation failed: {e}")
            raise

    async def test_connection(self) -> bool:
        if not self.api_key or self.api_key.startswith("your_"):
            return False
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(api_key=self.api_key, model=self.model_name, timeout=2.0)
            await asyncio.to_thread(llm.invoke, "ping")
            return True
        except Exception:
            return False
