from abc import ABC, abstractmethod
from typing import Dict, Any

class SpeechToTextProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Transcribes audio file to text transcript with confidence and duration metrics.
        Returns:
            {
                "transcript": str,
                "language": str,
                "confidence": float,
                "duration": float,
                "segments": list
            }
        """
        pass
