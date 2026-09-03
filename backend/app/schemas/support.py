from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=255)
    category: str = Field(default="Technical Issue")
    message: str = Field(..., min_length=5)
    priority: str = Field(default="MEDIUM")

class SupportTicketStatusUpdate(BaseModel):
    status: str = Field(..., description="OPEN, IN_PROGRESS, RESOLVED, or CLOSED")

class SupportTicketOut(BaseModel):
    id: str
    ticket_code: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    subject: str
    category: str
    message: str
    status: str
    priority: str
    created_at: str

    class Config:
        from_attributes = True
