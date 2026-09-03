from sqlalchemy import Column, String, ForeignKey, Float, JSON, Text
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class ResumeAudit(TimeStampedModel):
    __tablename__ = "resume_audits"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    job_title = Column(String(255), nullable=False, default="Senior Cloud & DevOps Engineer")
    job_description = Column(Text, nullable=True)
    resume_text = Column(Text, nullable=True)
    cloudinary_url = Column(String(512), nullable=True)
    
    ats_score = Column(Float, nullable=False, default=0.0)
    breakdown_json = Column(JSON, nullable=True)
    matching_skills_json = Column(JSON, nullable=True)
    missing_skills_json = Column(JSON, nullable=True)
    profile_data_json = Column(JSON, nullable=True)
    bullet_rewrites_json = Column(JSON, nullable=True)

    candidate = relationship("Candidate", backref="resume_audits")
    user = relationship("User", backref="resume_audits")
