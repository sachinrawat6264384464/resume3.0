from sqlalchemy import Column, String, ForeignKey, Text, Integer, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Candidate(TimeStampedModel):
    __tablename__ = "candidates"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(100), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    course = Column(String(255), nullable=True)
    batch = Column(String(100), nullable=True)
    experience_level = Column(String(50), default="JUNIOR", nullable=False) # JUNIOR, MID, SENIOR
    target_role = Column(String(100), default="CloudOps Engineer", nullable=False)
    notes = Column(Text, nullable=True)

    # Gamification & Readiness
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    streak_days = Column(Integer, default=1, nullable=False)
    last_active_at = Column(DateTime(timezone=True), nullable=True)
    readiness_score = Column(Float, default=0.0, nullable=False)
    target_salary_band = Column(String(50), default="₹8–12 LPA", nullable=False)
    skills_matrix_json = Column(JSON, default=dict, nullable=False)
    badges_json = Column(JSON, default=list, nullable=False)

    # Resume & ATS
    resume_data_json = Column(JSON, default=dict, nullable=False)
    latest_ats_score = Column(Float, default=0.0, nullable=True)

    user = relationship("User", back_populates="candidate_profile")
    organization = relationship("Organization", back_populates="candidates")
    attempts = relationship("InterviewAttempt", back_populates="candidate", cascade="all, delete-orphan")
