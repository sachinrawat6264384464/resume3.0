from sqlalchemy import Column, String, ForeignKey, Text, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Reminder(TimeStampedModel):
    __tablename__ = "reminders"
    __table_args__ = (
        Index("idx_reminders_cand_status", "candidate_id", "status"),
        Index("idx_reminders_cand_due", "candidate_id", "due_at"),
    )

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(50), default="STUDY", nullable=False, index=True) # INTERVIEW, STUDY, ROADMAP, GOAL, RESUME, STREAK, SYSTEM, AI_RECOMMENDATION
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(50), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH
    status = Column(String(50), default="ACTIVE", nullable=False, index=True) # ACTIVE, READ, COMPLETED, SNOOZED, DISMISSED, EXPIRED
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    due_at = Column(DateTime(timezone=True), nullable=True, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    snoozed_until = Column(DateTime(timezone=True), nullable=True, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    related_entity_type = Column(String(50), nullable=True) # e.g. task, interview, roadmap
    related_entity_id = Column(String(100), nullable=True)
    created_by = Column(String(50), default="SYSTEM", nullable=False) # SYSTEM, USER, AI

    candidate = relationship("Candidate", backref="reminders")
