from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import BaseSchema

class JobDescriptionBase(BaseSchema):
    title: str
    raw_description: str
    target_role: str
    experience_level: str = "MID"

class JobDescriptionCreate(JobDescriptionBase):
    skills_json: Optional[List[str]] = []
    technologies_json: Optional[List[str]] = []
    responsibilities_json: Optional[List[str]] = []

class JobDescriptionUpdate(BaseSchema):
    title: Optional[str] = None
    raw_description: Optional[str] = None
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    skills_json: Optional[List[str]] = None
    technologies_json: Optional[List[str]] = None
    responsibilities_json: Optional[List[str]] = None

class JobDescriptionOut(JobDescriptionBase):
    id: str
    organization_id: str
    skills_json: List[str]
    technologies_json: List[str]
    responsibilities_json: List[str]
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class JDAnalyzeRequest(BaseModel):
    title: str
    raw_description: str
    target_role: Optional[str] = None
    experience_level: Optional[str] = "MID"

class JDAnalyzeResponse(BaseModel):
    title: str
    target_role: str
    experience_level: str
    skills: List[str]
    technologies: List[str]
    responsibilities: List[str]
    suggested_stages: List[dict]
