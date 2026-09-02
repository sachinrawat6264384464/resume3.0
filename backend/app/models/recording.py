from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, String, ForeignKey, Integer, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel, get_utc_now
from app.core.config import settings

def get_default_expiration():
    return datetime.now(timezone.utc) + timedelta(days=settings.RECORDING_RETENTION_DAYS)

class Recording(TimeStampedModel):
    __tablename__ = "recordings"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_attempt_id = Column(String(36), ForeignKey("interview_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    storage_provider = Column(String(50), default="local", nullable=False) # local, google_drive, s3
    google_drive_file_id = Column(String(255), nullable=True, index=True)
    google_drive_view_link = Column(String(512), nullable=True)
    local_file_path = Column(String(512), nullable=True)
    
    file_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), default="video/webm", nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    
    expires_at = Column(DateTime(timezone=True), default=get_default_expiration, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    deletion_status = Column(String(50), default="ACTIVE", nullable=False, index=True) # ACTIVE, EXPIRED, DELETED, RETENTION_PURGED

    interview_attempt = relationship("InterviewAttempt", back_populates="recordings")
    question_attempt = relationship("QuestionAttempt", back_populates="recording", uselist=False)
