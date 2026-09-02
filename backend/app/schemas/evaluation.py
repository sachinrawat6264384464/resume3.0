from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema

class CommunicationMetrics(BaseModel):
    speech_rate_wpm: float = 130.0
    filler_words_count: int = 0
    filler_words_detected: List[str] = []
    hesitation_pauses_count: int = 0
    structural_clarity_score: float = 85.0
    confidence_estimate: float = 85.0
    assessment_notes: str = ""
    disclaimer: str = (
        "The confidence indicator is an estimate derived from observable verbal patterns "
        "(hesitation pauses, speech pacing, filler-word frequency, structure). "
        "It is not a psychological or personality assessment."
    )

class QuestionEvaluationResult(BaseModel):
    technical_score: float = Field(..., ge=0, le=100)
    concept_coverage_score: float = Field(..., ge=0, le=100)
    reasoning_score: float = Field(..., ge=0, le=100)
    practical_score: float = Field(..., ge=0, le=100)
    communication_score: float = Field(..., ge=0, le=100)
    confidence_score: float = Field(..., ge=0, le=100)
    overall_score: float = Field(..., ge=0, le=100)
    
    strengths: List[str] = []
    weaknesses: List[str] = []
    missing_concepts: List[str] = []
    feedback: str = ""
    recommendations: List[str] = []
    communication_metrics: CommunicationMetrics = Field(default_factory=CommunicationMetrics)
