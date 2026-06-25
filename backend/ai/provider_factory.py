from backend.ai.groq_client import GroqProvider
from backend.ai.gemini_client import GeminiProvider
from backend.ai.ollama_client import OllamaProvider
from backend.ai.base_provider import BaseAIProvider

class ProviderFactory:
    _instances = {}

    @classmethod
    def get_provider(cls, name: str) -> BaseAIProvider:
        name_lower = name.lower()
        if name_lower not in cls._instances:
            if name_lower == "groq":
                cls._instances[name_lower] = GroqProvider()
            elif name_lower == "gemini":
                cls._instances[name_lower] = GeminiProvider()
            elif name_lower == "ollama":
                cls._instances[name_lower] = OllamaProvider()
            else:
                raise ValueError(f"Unknown AI Provider: {name}")
        return cls._instances[name_lower]
