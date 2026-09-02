from app.speech.provider import SpeechToTextProvider
from app.speech.mock_provider import MockSTTProvider
from app.speech.whisper_provider import WhisperSTTProvider
from app.core.config import settings

def get_stt_provider() -> SpeechToTextProvider:
    provider_name = settings.STT_PROVIDER.lower()
    if provider_name in ("whisper", "faster-whisper"):
        return WhisperSTTProvider()
    return MockSTTProvider()

__all__ = ["SpeechToTextProvider", "MockSTTProvider", "WhisperSTTProvider", "get_stt_provider"]
