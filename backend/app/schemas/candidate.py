from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.schemas.common import BaseSchema
from app.schemas.user import UserOut

class CandidateBase(BaseSchema):
    student_id: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None
    experience_level: str = "JUNIOR"
    target_role: str = "CloudOps Engineer"
    notes: Optional[str] = None
    xp: int = 0
    level: int = 1
    streak_days: int = 1
    readiness_score: float = 0.0
    target_salary_band: str = "₹8–12 LPA"
    skills_matrix_json: Dict[str, Any] = {}
    badges_json: List[str] = []
    latest_ats_score: Optional[float] = 0.0

class CandidateCreate(CandidateBase):
    email: EmailStr
    full_name: str
    password: Optional[str] = None

class CandidateUpdate(BaseSchema):
    student_id: Optional[str] = None
    phone: Optional[str] = None
    course: Optional[str] = None
    batch: Optional[str] = None
    experience_level: Optional[str] = None
    target_role: Optional[str] = None
    notes: Optional[str] = None
    xp: Optional[int] = None
    level: Optional[int] = None
    streak_days: Optional[int] = None
    readiness_score: Optional[float] = None
    target_salary_band: Optional[str] = None
    skills_matrix_json: Optional[Dict[str, Any]] = None
    badges_json: Optional[List[str]] = None
    latest_ats_score: Optional[float] = None

class CandidateOut(CandidateBase):
    id: str
    user_id: str
    organization_id: str
    user: Optional[UserOut] = None
    created_at: datetime
    updated_at: datetime

class CandidateWithAttemptsOut(CandidateOut):
    total_attempts: int = 0
    passed_interviews: int = 0
    latest_score: Optional[float] = None
    latest_status: Optional[str] = None
