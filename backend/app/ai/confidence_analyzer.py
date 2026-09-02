import re
from typing import List, Dict, Any
from app.schemas.evaluation import CommunicationMetrics

FILLER_WORDS = [
    "um", "uh", "err", "ah", "like", "you know", "basically", "actually",
    "literally", "i mean", "sort of", "kind of", "maybe", "i guess"
]

def analyze_communication_signals(transcript: str, duration_seconds: float = 0.0) -> CommunicationMetrics:
    """
    Extracts observable communication patterns (speech pacing, filler words, hesitation markers)
    from candidate verbal transcripts and duration.
    
    Privacy-first note: Strictly non-psychological estimate based on verbal fluency.
    """
    if not transcript or not transcript.strip():
        return CommunicationMetrics(
            speech_rate_wpm=0.0,
            filler_words_count=0,
            filler_words_detected=[],
            hesitation_pauses_count=0,
            structural_clarity_score=50.0,
            confidence_estimate=50.0,
            assessment_notes="No spoken answer recorded."
        )

    words = re.findall(r'\b[A-Za-z0-9\'-]+\b', transcript.lower())
    word_count = len(words)
    
    # Calculate Words Per Minute (WPM)
    wpm = 130.0 # Standard conversational baseline
    if duration_seconds > 5:
        wpm = round((word_count / (duration_seconds / 60.0)), 1)
    
    # Detect filler words
    detected_fillers: List[str] = []
    total_fillers = 0
    transcript_lower = transcript.lower()
    
    for filler in FILLER_WORDS:
        # Regex matching word boundary
        matches = re.findall(r'\b' + re.escape(filler) + r'\b', transcript_lower)
        count = len(matches)
        if count > 0:
            total_fillers += count
            detected_fillers.extend([filler] * count)

    # Detect hesitation pauses (marked by ellipsis, dash stops, or repeated short words)
    hesitation_pauses = len(re.findall(r'\.\.\.|--|\b(um|uh|err)\b', transcript_lower))
    
    # Calculate structural clarity score (0 - 100)
    # Penalize excessive filler density (> 5% of spoken words)
    filler_ratio = (total_fillers / max(word_count, 1)) * 100
    pacing_penalty = 0
    if wpm < 80: # Too slow / hesitating
        pacing_penalty = min(25, (80 - wpm) * 0.5)
    elif wpm > 190: # Rushed speech
        pacing_penalty = min(15, (wpm - 190) * 0.3)

    filler_penalty = min(30, filler_ratio * 3)
    
    clarity_score = max(40.0, min(98.0, 95.0 - filler_penalty - (pacing_penalty * 0.5)))
    
    # Calculate confidence estimate
    confidence_score = max(35.0, min(95.0, 90.0 - filler_penalty - pacing_penalty))
    
    notes = []
    if filler_ratio < 2.5:
        notes.append("Crisp verbal delivery with minimal filler words.")
    elif filler_ratio > 6.0:
        notes.append(f"Noticeable frequency of filler words ({total_fillers} detected, {filler_ratio:.1f}% of speech).")
        
    if 110 <= wpm <= 160:
        notes.append("Optimal conversational cadence and pacing.")
    elif wpm < 90:
        notes.append("Slightly hesitant pacing with frequent pauses.")
    elif wpm > 180:
        notes.append("Fast speech cadence; recommend steadying pace for technical clarity.")

    return CommunicationMetrics(
        speech_rate_wpm=wpm,
        filler_words_count=total_fillers,
        filler_words_detected=list(set(detected_fillers)),
        hesitation_pauses_count=hesitation_pauses,
        structural_clarity_score=round(clarity_score, 1),
        confidence_estimate=round(confidence_score, 1),
        assessment_notes=" ".join(notes)
    )
