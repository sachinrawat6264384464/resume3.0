from sqlalchemy import Column, String, ForeignKey, Text, Integer, DateTime
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class StudyPlan(TimeStampedModel):
    __tablename__ = "study_plans"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    target_hours = Column(Integer, default=10, nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False, index=True) # ACTIVE, COMPLETED, ARCHIVED
    generated_by = Column(String(50), default="MANUAL", nullable=False) # MANUAL, AI

    candidate = relationship("Candidate", backref="study_plans")
    tasks = relationship("StudyTask", back_populates="study_plan", cascade="all, delete-orphan")
