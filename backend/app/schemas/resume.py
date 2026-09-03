from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema

class ResumeExperienceItem(BaseSchema):
    company: str
    role: str
    duration: Optional[str] = None
    bullet_points: List[str] = []

class ResumeProjectItem(BaseSchema):
    title: str
    description: Optional[str] = None
    technologies: List[str] = []

class ResumeProfile(BaseSchema):
    candidate_name: str = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    current_designation: Optional[str] = "Cloud / DevOps Engineer"
    years_of_experience: float = 0.0
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

class BulletImprovementRequest(BaseModel):
    role: str = "CloudOps / DevOps Engineer"
    current_bullet: str
    keywords: Optional[str] = ""

class ResumeParseRequest(BaseModel):
    resume_text: str
    job_title: Optional[str] = "CloudOps Engineer"
    job_description: Optional[str] = None
