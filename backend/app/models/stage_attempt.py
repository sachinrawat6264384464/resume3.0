from sqlalchemy import Column, String, ForeignKey, Integer, Float, Boolean, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class StageAttempt(TimeStampedModel):
    __tablename__ = "stage_attempts"

    interview_attempt_id = Column(String(36), ForeignKey("interview_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_stage_id = Column(String(36), ForeignKey("interview_stages.id", ondelete="RESTRICT"), nullable=False, index=True)
    stage_number = Column(Integer, nullable=False)
    
    status = Column(String(50), default="LOCKED", nullable=False, index=True) # LOCKED, NOT_STARTED, IN_PROGRESS, PASSED, FAILED
    score = Column(Float, nullable=True)
    
    is_override = Column(Boolean, default=False, nullable=False)
    override_reason = Column(Text, nullable=True)
    override_by = Column(String(36), nullable=True)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    feedback_summary = Column(JSON, nullable=True)

    interview_attempt = relationship("InterviewAttempt", back_populates="stage_attempts")
    stage = relationship("InterviewStage", back_populates="stage_attempts")
    question_attempts = relationship("QuestionAttempt", back_populates="stage_attempt", cascade="all, delete-orphan")
