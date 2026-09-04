from sqlalchemy import Column, String, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class StudyGoal(TimeStampedModel):
    __tablename__ = "study_goals"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    target_role = Column(String(100), default="Senior DevOps Engineer", nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=True)
    weekly_hours = Column(Integer, default=15, nullable=False)
    target_score = Column(Float, default=85.0, nullable=False)
    weekly_task_target = Column(Integer, default=10, nullable=False)

    candidate = relationship("Candidate", backref="study_goal")
