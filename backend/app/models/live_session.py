from sqlalchemy import Column, String, Boolean, DateTime, Text
from datetime import datetime
import uuid
from app.models.base import Base, TimeStampedModel

class LiveSession(TimeStampedModel):
    __tablename__ = "live_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    session_date = Column(String(100), nullable=False) # e.g. "2026-09-25 18:00 IST"
    meeting_url = Column(String(500), nullable=True)
    whatsapp_group_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)
    visibility = Column(String(50), default="ALL_CANDIDATES", nullable=False) # ALL_CANDIDATES, ENROLLED
    status = Column(String(50), default="UPCOMING", nullable=False) # UPCOMING, LIVE_NOW, COMPLETED, CANCELLED
    
    host_name = Column(String(255), default="Vikas Sir & Sachin Rawat")

class LiveSessionClick(TimeStampedModel):
    __tablename__ = "live_session_clicks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    live_session_id = Column(String(36), nullable=False)
    session_title = Column(String(255), nullable=True)
    candidate_name = Column(String(255), nullable=False)
    candidate_email = Column(String(255), nullable=False)
    platform_clicked = Column(String(50), nullable=False) # ZOOM or WHATSAPP
    clicked_at = Column(DateTime, default=datetime.utcnow)
