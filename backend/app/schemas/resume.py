from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.schemas.common import BaseSchema

class ResumeExperienceItem(BaseSchema):
    company: Optional[str] = "Company"
    role: Optional[str] = "DevOps Engineer"
    duration: Optional[str] = None
    bullet_points: List[str] = []

    @field_validator("company", "role", mode="before")
    @classmethod
    def sanitize_experience_strings(cls, v: Any) -> str:
        if not v or v is None:
            return "N/A"
        return str(v)

class ResumeProjectItem(BaseSchema):
    title: Optional[str] = "Project"
    description: Optional[str] = None
    technologies: List[str] = []

    @field_validator("title", mode="before")
    @classmethod
    def sanitize_title(cls, v: Any) -> str:
        if not v or v is None:
            return "Project"
        return str(v)

class ResumeProfile(BaseSchema):
    candidate_name: Optional[str] = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    current_designation: Optional[str] = "Cloud / DevOps Engineer"
    years_of_experience: Optional[float] = 0.0
    summary: Optional[str] = None
    primary_skills: List[str] = []
    cloud_platforms: List[str] = []
    devops_tools: List[str] = []
    devsecops_tools: List[str] = []
    ai_skills: List[str] = []
    certifications: List[str] = []
    education: List[str] = []
    experience: List[ResumeExperienceItem] = []
    projects: List[ResumeProjectItem] = []

    @field_validator("candidate_name", mode="before")
    @classmethod
    def sanitize_candidate_name(cls, v: Any) -> str:
        if not v or v is None:
            return "Candidate"
        return str(v)

    @field_validator("years_of_experience", mode="before")
    @classmethod
    def sanitize_yoe(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return float(v)
        except (ValueError, TypeError):
            return 0.0

    @field_validator(
        "primary_skills", "cloud_platforms", "devops_tools", "devsecops_tools", 
        "ai_skills", "certifications", "education", "experience", "projects", 
        mode="before"
    )
    @classmethod
    def sanitize_lists(cls, v: Any) -> list:
        if v is None:
            return []
        if isinstance(v, list):
            return v
        return [v]

class ATSScoreBreakdown(BaseSchema):
    skills_match: float = 0.0
    experience_match: float = 0.0
    keywords_match: float = 0.0
    projects_match: float = 0.0
    certifications_match: float = 0.0
    job_role_match: float = 0.0

class RecommendedInterviewStage(BaseSchema):
    stage_id: int
    title: str
    reason: str

class BulletImprovementItem(BaseSchema):
    current: str
    improved: str
    impact_metrics_added: List[str] = []
    skills_highlighted: List[str] = []
    rationale: str

class ResumeATSResponse(BaseSchema):
    ats_score: float
    breakdown: ATSScoreBreakdown
    matching_skills: List[str]
    missing_skills: List[str]
    weak_areas: List[str]
    strong_areas: List[str]
    recommended_interview_stages: List[RecommendedInterviewStage]
    candidate_profile: ResumeProfile
    bullet_suggestions: List[BulletImprovementItem]
    cloudinary_url: Optional[str] = None
    job_title: Optional[str] = "Senior DevOps Engineer"

class BulletImprovementRequest(BaseModel):
    role: str = "CloudOps / DevOps Engineer"
    current_bullet: str
    keywords: Optional[str] = ""

class ResumeParseRequest(BaseModel):
    resume_text: str
    job_title: Optional[str] = "CloudOps Engineer"
    job_description: Optional[str] = None
