from sqlalchemy import Column, String, ForeignKey, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class CandidateRoadmap(TimeStampedModel):
    __tablename__ = "candidate_roadmaps"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False, default=1)
    day_number = Column(Integer, nullable=False, default=1)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Linux", nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    xp_reward = Column(Integer, default=50, nullable=False)

    candidate = relationship("Candidate", backref="roadmap_items")
