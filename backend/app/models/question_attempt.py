from sqlalchemy import Column, String, ForeignKey, Float, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class QuestionAttempt(TimeStampedModel):
    __tablename__ = "question_attempts"

    stage_attempt_id = Column(String(36), ForeignKey("stage_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_attempt_id = Column(String(36), ForeignKey("interview_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("questions.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    question_text_snapshot = Column(Text, nullable=False)
    answer_transcript = Column(Text, nullable=True)
    recording_id = Column(String(36), ForeignKey("recordings.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status = Column(String(30), default="PENDING", nullable=False) # PENDING, RECORDING, PROCESSING, EVALUATED, FAILED
    
    # 5-Pillar & Confidence Scores (0 - 100)
    technical_score = Column(Float, nullable=True)
    concept_coverage_score = Column(Float, nullable=True)
    reasoning_score = Column(Float, nullable=True)
    practical_score = Column(Float, nullable=True)
    communication_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)
    
    evaluation_json = Column(JSON, nullable=True) # Full evaluation breakdown & communication indicators
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    stage_attempt = relationship("StageAttempt", back_populates="question_attempts")
    question = relationship("Question")
    recording = relationship("Recording", back_populates="question_attempt", uselist=False)
