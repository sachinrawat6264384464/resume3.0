from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema

class RecommendedTopicItem(BaseModel):
    topic: str
    why_it_matters: str
    candidate_gap: str
    what_to_learn: List[str] = []
    recommended_docs: List[str] = []
    practice_exercises: List[str] = []

class WeeklyLearningMilestone(BaseModel):
    week: int
    theme: str
    objectives: List[str]
    hands_on_labs: List[str]
    documentation_links: List[str]

class StageReportBreakdown(BaseModel):
    stage_number: int
    title: str
    category: str
    score: float
    status: str
    passed: bool
    strengths: List[str] = []
    weaknesses: List[str] = []
    questions_count: int

class CandidateReportOut(BaseModel):
    attempt_id: str
    candidate_name: str
    candidate_email: str
    target_role: str
    interview_date: datetime
    overall_score: float
    decision: str # PASS, NEEDS_IMPROVEMENT
    technical_score: float
    communication_score: float
    confidence_score: float
    confidence_disclaimer: str
    
    stages: List[StageReportBreakdown]
    strengths: List[str]
    weaknesses: List[str]
    critical_knowledge_gaps: List[str]
    recommended_topics: List[RecommendedTopicItem]
    thirty_day_plan: List[WeeklyLearningMilestone]
    executive_summary: str

class AdminReportOut(CandidateReportOut):
    candidate_id: str
    student_id: Optional[str] = None
    organization_name: str
    recordings: List[Dict[str, Any]] = []
    full_transcript_log: List[Dict[str, Any]] = []
    stage_overrides: List[Dict[str, Any]] = []
    ai_raw_evaluation_metadata: Dict[str, Any] = {}
