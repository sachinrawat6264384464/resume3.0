from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Organization(TimeStampedModel):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="organization", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="organization", cascade="all, delete-orphan")
    interview_templates = relationship("InterviewTemplate", back_populates="organization", cascade="all, delete-orphan")
