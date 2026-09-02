from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema
from app.schemas.question import QuestionCandidateOut, QuestionAdminOut

class StageBase(BaseSchema):
    stage_number: int
    title: str
    description: Optional[str] = None
    category: str = "Fundamentals"
    minimum_score: float = 80.0
    unlock_rule: str = "PASS_PREVIOUS_STAGE"

class StageCreate(StageBase):
    pass

class StageUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    minimum_score: Optional[float] = None
    unlock_rule: Optional[str] = None

class StageCandidateOut(StageBase):
    id: str
    interview_template_id: str
    questions_count: int = 0

class StageAdminOut(StageBase):
    id: str
    interview_template_id: str
    questions: List[QuestionAdminOut] = []
    created_at: datetime
    updated_at: datetime

class TemplateBase(BaseSchema):
    title: str
    description: Optional[str] = None
    target_role: str = "CloudOps Engineer"
    passing_score: float = 80.0
    status: str = "ACTIVE"

class TemplateCreate(TemplateBase):
    job_description_id: Optional[str] = None
    stages: Optional[List[StageCreate]] = None

class TemplateUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    target_role: Optional[str] = None
    passing_score: Optional[float] = None
    status: Optional[str] = None

class TemplateCandidateOut(TemplateBase):
    id: str
    stages: List[StageCandidateOut] = []

class TemplateAdminOut(TemplateBase):
    id: str
    organization_id: str
    job_description_id: Optional[str] = None
    stages: List[StageAdminOut] = []
    created_at: datetime
    updated_at: datetime
