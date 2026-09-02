from app.ai.provider import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.ollama_provider import OllamaAIProvider
from app.ai.openai_provider import OpenAIProvider
from app.core.config import settings

def get_ai_provider() -> AIProvider:
    provider_name = settings.AI_PROVIDER.lower()
    if provider_name == "ollama":
        return OllamaAIProvider()
    elif provider_name in ("openai", "gpt"):
        return OpenAIProvider()
    return MockAIProvider()

__all__ = ["AIProvider", "MockAIProvider", "OllamaAIProvider", "OpenAIProvider", "get_ai_provider"]
