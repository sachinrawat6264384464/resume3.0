from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class CandidateCertificate(TimeStampedModel):
    __tablename__ = "candidate_certificates"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    certificate_code = Column(String(100), unique=True, index=True, nullable=False)
    stage_name = Column(String(100), nullable=False)
    score_percentage = Column(Float, default=85.0, nullable=False)
    issued_at = Column(DateTime(timezone=True), nullable=False)
    pdf_url = Column(Text, nullable=True)

    candidate = relationship("Candidate", backref="certificates")
