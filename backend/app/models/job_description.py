from sqlalchemy import Column, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class JobDescription(TimeStampedModel):
    __tablename__ = "job_descriptions"

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    raw_description = Column(Text, nullable=False)
    skills_json = Column(JSON, default=list, nullable=False)  # Extracted required skills
    technologies_json = Column(JSON, default=list, nullable=False) # Extracted tools & technologies
    responsibilities_json = Column(JSON, default=list, nullable=False)
    experience_level = Column(String(50), default="MID", nullable=False)
    target_role = Column(String(100), nullable=False)
    created_by = Column(String(36), nullable=True)

    organization = relationship("Organization", back_populates="job_descriptions")
    templates = relationship("InterviewTemplate", back_populates="job_description")
