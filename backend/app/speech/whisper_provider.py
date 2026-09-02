import os
from typing import Dict, Any
from app.speech.provider import SpeechToTextProvider
from app.speech.mock_provider import MockSTTProvider
from app.core.config import settings

class WhisperSTTProvider(SpeechToTextProvider):
    def __init__(self):
        self.fallback = MockSTTProvider()
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from faster_whisper import WhisperModel
                self._model = WhisperModel("base", device="cpu", compute_type="int8")
            except ImportError:
                print("faster-whisper not installed, will use fallback mock STT.")

    async def transcribe(self, audio_file_path: str) -> Dict[str, Any]:
        if not os.path.exists(audio_file_path):
            return await self.fallback.transcribe(audio_file_path)

        try:
            self._load_model()
            if self._model:
                segments, info = self._model.transcribe(audio_file_path, beam_size=5)
                seg_list = []
                full_text = []
                for seg in segments:
                    seg_list.append({"start": seg.start, "end": seg.end, "text": seg.text})
                    full_text.append(seg.text)
                return {
                    "transcript": " ".join(full_text).strip(),
                    "language": info.language,
                    "confidence": round(float(info.language_probability), 2),
                    "duration": round(float(info.duration), 1),
                    "segments": seg_list
                }
        except Exception as e:
            print(f"Whisper transcription failed ({e}), falling back to mock STT.")

        return await self.fallback.transcribe(audio_file_path)
