from sqlalchemy import Column, String, ForeignKey, Text, Float, Boolean
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class InterviewTemplate(TimeStampedModel):
    __tablename__ = "interview_templates"

    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    job_description_id = Column(String(36), ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    target_role = Column(String(100), default="CloudOps Engineer", nullable=False)
    passing_score = Column(Float, default=80.0, nullable=False)
    status = Column(String(30), default="ACTIVE", nullable=False) # DRAFT, ACTIVE, ARCHIVED
    created_by = Column(String(36), nullable=True)

    organization = relationship("Organization", back_populates="interview_templates")
    job_description = relationship("JobDescription", back_populates="templates")
    stages = relationship("InterviewStage", back_populates="template", order_by="InterviewStage.stage_number", cascade="all, delete-orphan")
    attempts = relationship("InterviewAttempt", back_populates="template")
