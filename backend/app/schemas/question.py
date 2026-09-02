from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema

class QuestionBase(BaseSchema):
    order_index: int = 1
    question_text: str
    question_type: str = "CONCEPTUAL" # CONCEPTUAL, PRACTICAL, TROUBLESHOOTING, SCENARIO, COMMAND
    difficulty: str = "INTERMEDIATE" # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    skill_category: str = "Linux & Cloud"
    expected_topics: List[str] = []
    evaluation_rubric: Dict[str, Any] = {}
    follow_up_question: Optional[str] = None
    hint_level_1: Optional[str] = None
    hint_level_2: Optional[str] = None
    hint_level_3: Optional[str] = None
    is_active: str = "ACTIVE"

class QuestionCreate(QuestionBase):
    interview_stage_id: str
    reference_answer: str

class QuestionUpdate(BaseSchema):
    order_index: Optional[int] = None
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    difficulty: Optional[str] = None
    skill_category: Optional[str] = None
    expected_topics: Optional[List[str]] = None
    reference_answer: Optional[str] = None
    evaluation_rubric: Optional[Dict[str, Any]] = None
    follow_up_question: Optional[str] = None
    hint_level_1: Optional[str] = None
    hint_level_2: Optional[str] = None
    hint_level_3: Optional[str] = None
    is_active: Optional[str] = None

# Candidate-facing schema (NEVER exposes reference_answer)
class QuestionCandidateOut(BaseSchema):
    id: str
    order_index: int
    question_text: str
    question_type: str
    difficulty: str
    skill_category: str
    expected_topics: List[str]
    follow_up_question: Optional[str] = None
    hint_level_1: Optional[str] = None
    hint_level_2: Optional[str] = None
    hint_level_3: Optional[str] = None

class QuestionHintsOut(BaseSchema):
    question_id: str
    hint_level_1: Optional[str] = None
    hint_level_2: Optional[str] = None
    hint_level_3: Optional[str] = None

# Admin-facing schema (includes reference_answer and rubric)
class QuestionAdminOut(QuestionBase):
    id: str
    interview_stage_id: str
    reference_answer: str
    created_at: datetime
    updated_at: datetime

class QuestionGenerateRequest(BaseModel):
    role: str
    stage_title: str
    topic: str
    difficulty: str = "INTERMEDIATE"
    question_type: str = "PRACTICAL"
    count: int = 3

class QuickPracticeRequest(BaseModel):
    question_text: str
    candidate_transcript: str
    expected_topics: List[str] = []
    difficulty: str = "INTERMEDIATE"
    duration_seconds: float = 30.0
