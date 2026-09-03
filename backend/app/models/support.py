from sqlalchemy import Column, String, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class SupportTicket(TimeStampedModel):
    __tablename__ = "support_tickets"

    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_code = Column(String(50), unique=True, index=True, nullable=False)
    subject = Column(String(255), nullable=False)
    category = Column(String(100), default="Technical Issue", nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN", nullable=False, index=True)  # OPEN, IN_PROGRESS, RESOLVED
    priority = Column(String(50), default="MEDIUM", nullable=False)

    candidate = relationship("Candidate", backref="support_tickets")
