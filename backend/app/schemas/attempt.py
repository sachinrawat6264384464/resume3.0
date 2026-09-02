from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema
from app.schemas.question import QuestionCandidateOut
from app.schemas.evaluation import QuestionEvaluationResult

class QuestionAttemptOut(BaseSchema):
    id: str
    stage_attempt_id: str
    interview_attempt_id: str
    question_id: str
    question_text_snapshot: str
    answer_transcript: Optional[str] = None
    status: str
    technical_score: Optional[float] = None
    concept_coverage_score: Optional[float] = None
    reasoning_score: Optional[float] = None
    practical_score: Optional[float] = None
    communication_score: Optional[float] = None
    confidence_score: Optional[float] = None
    overall_score: Optional[float] = None
    evaluation_json: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class StageAttemptOut(BaseSchema):
    id: str
    interview_attempt_id: str
    interview_stage_id: str
    stage_number: int
    title: Optional[str] = None
    category: Optional[str] = None
    status: str # LOCKED, NOT_STARTED, IN_PROGRESS, PASSED, FAILED
    score: Optional[float] = None
    is_override: bool = False
    override_reason: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    question_attempts: List[QuestionAttemptOut] = []

class InterviewAttemptOut(BaseSchema):
    id: str
    candidate_id: str
    interview_template_id: str
    template_title: Optional[str] = None
    target_role: Optional[str] = None
    status: str # IN_PROGRESS, COMPLETED, ABANDONED
    current_stage_number: float
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    confidence_score: Optional[float] = None
    decision: Optional[str] = None # PASS, NEEDS_IMPROVEMENT, FAILED
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    stage_attempts: List[StageAttemptOut] = []
    created_at: datetime

class StartInterviewRequest(BaseModel):
    interview_template_id: str
    candidate_id: Optional[str] = None

class SubmitAnswerRequest(BaseModel):
    transcript: Optional[str] = None
    duration_seconds: float = 0.0

class StageEvaluationResponse(BaseModel):
    stage_attempt_id: str
    stage_number: int
    stage_title: str
    stage_score: float
    passing_threshold: float
    passed: bool
    status: str
    feedback: str
    unlocked_next_stage: bool
    next_stage_id: Optional[str] = None
    next_stage_number: Optional[int] = None
    is_final_stage: bool = False
