from sqlalchemy import Column, String, ForeignKey, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class InterviewAttempt(TimeStampedModel):
    __tablename__ = "interview_attempts"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_template_id = Column(String(36), ForeignKey("interview_templates.id", ondelete="RESTRICT"), nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status = Column(String(50), default="IN_PROGRESS", nullable=False, index=True) # IN_PROGRESS, COMPLETED, ABANDONED, REQUIRES_REVIEW
    current_stage_number = Column(Float, default=1, nullable=False)
    overall_score = Column(Float, nullable=True)
    technical_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    decision = Column(String(50), nullable=True) # PASS, NEEDS_IMPROVEMENT, FAILED
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    summary_report_json = Column(JSON, nullable=True) # Executive summary, strengths, weaknesses, 30-day learning plan

    candidate = relationship("Candidate", back_populates="attempts")
    template = relationship("InterviewTemplate", back_populates="attempts")
    stage_attempts = relationship("StageAttempt", back_populates="interview_attempt", order_by="StageAttempt.stage_number", cascade="all, delete-orphan")
    recordings = relationship("Recording", back_populates="interview_attempt", cascade="all, delete-orphan")
