from sqlalchemy import Column, String, ForeignKey, Text, Integer, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class StudyTask(TimeStampedModel):
    __tablename__ = "study_tasks"
    __table_args__ = (
        Index("idx_study_tasks_cand_date", "candidate_id", "scheduled_date"),
        Index("idx_study_tasks_cand_status", "candidate_id", "status"),
    )

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    study_plan_id = Column(String(36), ForeignKey("study_plans.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="DevOps & Cloud", nullable=False) # e.g. Linux, AWS, Kubernetes, CI/CD, General
    skill = Column(String(100), default="General CloudOps", nullable=False)
    difficulty = Column(String(50), default="INTERMEDIATE", nullable=False) # BEGINNER, INTERMEDIATE, ADVANCED
    priority = Column(String(50), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH
    scheduled_date = Column(DateTime(timezone=True), nullable=False, index=True)
    start_time = Column(String(20), default="09:00 AM", nullable=True)
    duration_minutes = Column(Integer, default=60, nullable=False)
    status = Column(String(50), default="TODO", nullable=False, index=True) # TODO, IN_PROGRESS, COMPLETED, SKIPPED, OVERDUE
    xp_reward = Column(Integer, default=50, nullable=False)
    roadmap_stage_id = Column(Integer, nullable=True)
    interview_stage_id = Column(Integer, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    candidate = relationship("Candidate", backref="study_tasks")
    study_plan = relationship("StudyPlan", back_populates="tasks")
