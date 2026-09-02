from sqlalchemy import Column, String, ForeignKey, Text, Integer, Float
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class InterviewStage(TimeStampedModel):
    __tablename__ = "interview_stages"

    interview_template_id = Column(String(36), ForeignKey("interview_templates.id", ondelete="CASCADE"), nullable=False, index=True)
    stage_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Fundamentals", nullable=False)
    minimum_score = Column(Float, default=80.0, nullable=False)
    unlock_rule = Column(String(50), default="PASS_PREVIOUS_STAGE", nullable=False) # PASS_PREVIOUS_STAGE, ALWAYS_UNLOCKED

    template = relationship("InterviewTemplate", back_populates="stages")
    questions = relationship("Question", back_populates="stage", order_by="Question.order_index", cascade="all, delete-orphan")
    stage_attempts = relationship("StageAttempt", back_populates="stage")
