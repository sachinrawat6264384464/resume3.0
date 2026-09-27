from sqlalchemy import Column, String, Text, Boolean, JSON
from app.models.base import TimeStampedModel

class WalkthroughVideo(TimeStampedModel):
    __tablename__ = "walkthrough_videos"

    category = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    cloudinary_url = Column(String(1024), nullable=False)
    cloudinary_public_id = Column(String(255), nullable=True)
    audio_enabled = Column(Boolean, default=True, nullable=False)
    key_features = Column(JSON, nullable=True)
    mock_route = Column(String(255), default="/dashboard", nullable=False)
    file_size_bytes = Column(String(50), nullable=True)
