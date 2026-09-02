import os
from typing import Dict, Any
from app.speech.provider import SpeechToTextProvider

class MockSTTProvider(SpeechToTextProvider):
    async def transcribe(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Deterministic mock transcription provider.
        If file exists and has companion text or metadata, extracts it; otherwise returns high-quality sample transcript.
        """
        # Check if companion transcript file exists (useful for test fixtures)
        text_path = audio_file_path + ".txt"
        if os.path.exists(text_path):
            with open(text_path, "r", encoding="utf-8") as f:
                text = f.read().strip()
                return {
                    "transcript": text,
                    "language": "en",
                    "confidence": 0.96,
                    "duration": 45.0,
                    "segments": [{"start": 0.0, "end": 45.0, "text": text}]
                }

        # Return realistic technical answer sample
        default_transcript = (
            "To resolve this, I would first check kubectl describe pod to inspect the events, "
            "and check for exit code 137 which indicates an OOMKilled condition. Then I would run kubectl logs "
            "with the --previous flag to capture the application stack trace right before the container crashed. "
            "If it is memory related, I would increase the memory limit in the deployment spec. "
            "I would also verify the liveness and readiness probe timeouts to make sure they are not killing the pod prematurely."
        )

        return {
            "transcript": default_transcript,
            "language": "en",
            "confidence": 0.94,
            "duration": 38.5,
            "segments": [{"start": 0.0, "end": 38.5, "text": default_transcript}]
        }
