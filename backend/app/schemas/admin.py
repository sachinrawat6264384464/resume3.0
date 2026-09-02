from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema

class StagePassRateMetric(BaseModel):
    stage_number: int
    stage_title: str
    total_attempts: int
    passed_attempts: int
    pass_rate_percentage: float

class WeakTopicMetric(BaseModel):
    topic: str
    failure_frequency: int
    category: str

class RecentInterviewItem(BaseModel):
    attempt_id: str
    candidate_name: str
    candidate_email: str
    template_title: str
    target_role: str
    overall_score: Optional[float] = None
    status: str
    decision: Optional[str] = None
    created_at: datetime

class AdminDashboardMetrics(BaseModel):
    total_candidates: int
    active_candidates: int
    interviews_completed: int
    interviews_in_progress: int
    overall_pass_rate: float
    average_score: float
    stage_pass_rates: List[StagePassRateMetric]
    most_common_weak_topics: List[WeakTopicMetric]
    candidates_requiring_attention: List[RecentInterviewItem]
    recent_interviews: List[RecentInterviewItem]

class StageOverrideRequest(BaseModel):
    new_status: str # PASSED, FAILED, IN_PROGRESS
    override_score: Optional[float] = None
    override_reason: str

class RetentionCleanupResponse(BaseModel):
    scanned_count: int
    expired_count: int
    purged_count: int
    freed_bytes: int
    status: str
    cleaned_at: datetime

class AssignInterviewRequest(BaseModel):
    candidate_ids: List[str]
    interview_template_id: str
