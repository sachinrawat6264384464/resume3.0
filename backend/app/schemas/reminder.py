from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class ReminderBase(BaseModel):
    type: Optional[str] = "STUDY" # INTERVIEW, STUDY, ROADMAP, GOAL, RESUME, STREAK, SYSTEM, AI_RECOMMENDATION
    title: str
    message: str
    priority: Optional[str] = "MEDIUM" # LOW, MEDIUM, HIGH
    scheduled_at: Optional[datetime] = None
    due_at: Optional[datetime] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None # ACTIVE, READ, COMPLETED, SNOOZED, DISMISSED, EXPIRED
    scheduled_at: Optional[datetime] = None
    due_at: Optional[datetime] = None
    snoozed_until: Optional[datetime] = None

class ReminderSnoozeRequest(BaseModel):
    snooze_minutes: Optional[int] = 30
    snooze_until: Optional[datetime] = None

class ReminderOut(ReminderBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    candidate_id: str
    status: str
    read_at: Optional[datetime] = None
    snoozed_until: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

class ReminderSummaryOut(BaseModel):
    active_count: int
    due_today_count: int
    upcoming_count: int
    completed_count: int
    snoozed_count: int
    unread_count: int
