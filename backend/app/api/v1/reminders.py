from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.candidate_service import CandidateService
from app.services.reminder_service import ReminderService
from app.schemas.reminder import (
    ReminderCreate, ReminderUpdate, ReminderSnoozeRequest,
    ReminderOut, ReminderSummaryOut
)
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/reminders", tags=["Smart Reminders"])

async def get_current_candidate_id(payload: dict = Depends(verify_auth_token), db: AsyncSession = Depends(get_db)) -> str:
    from sqlalchemy import select
    import uuid
    from app.models.candidate import Candidate
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
    if not cand:
        stmt = select(Candidate).where(Candidate.user_id == user.id)
        res = await db.execute(stmt)
        cand = res.scalar_one_or_none()
        if not cand:
            cand = Candidate(
                id=str(uuid.uuid4()),
                user_id=user.id,
                organization_id=user.organization_id or "org-default",
                target_role="CloudOps Engineer",
                xp=100,
                level=1
            )
            db.add(cand)
            await db.commit()
            await db.refresh(cand)
    return cand.id

@router.get("", response_model=StandardResponse[List[ReminderOut]])
async def get_reminders(
    status: Optional[str] = None,
    rem_type: Optional[str] = None,
    unread_only: bool = False,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = ReminderService(db)
    reminders = await svc.get_reminders(candidate_id, status=status, rem_type=rem_type, unread_only=unread_only)
    return StandardResponse(data=[ReminderOut.model_validate(r) for r in reminders])

@router.get("/summary", response_model=StandardResponse[ReminderSummaryOut])
async def get_summary(candidate_id: str = Depends(get_current_candidate_id), db: AsyncSession = Depends(get_db)):
    svc = ReminderService(db)
    summary = await svc.get_summary(candidate_id)
    return StandardResponse(data=ReminderSummaryOut(**summary))

@router.post("", response_model=StandardResponse[ReminderOut], status_code=status.HTTP_201_CREATED)
async def create_reminder(
    rem_in: ReminderCreate,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = ReminderService(db)
    reminder = await svc.create_reminder(candidate_id, rem_in)
    return StandardResponse(
        message="Custom reminder created in database",
        data=ReminderOut.model_validate(reminder)
    )

@router.post("/{reminder_id}/read", response_model=StandardResponse[ReminderOut])
async def mark_read(
    reminder_id: str,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = ReminderService(db)
    reminder = await svc.mark_read(candidate_id, reminder_id)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return StandardResponse(data=ReminderOut.model_validate(reminder))

@router.post("/{reminder_id}/complete", response_model=StandardResponse[ReminderOut])
async def complete_reminder(
    reminder_id: str,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = ReminderService(db)
    reminder = await svc.complete_reminder(candidate_id, reminder_id)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return StandardResponse(
        message="Reminder completed in database",
        data=ReminderOut.model_validate(reminder)
    )

@router.post("/{reminder_id}/snooze", response_model=StandardResponse[ReminderOut])
async def snooze_reminder(
    reminder_id: str,
    req: ReminderSnoozeRequest,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = ReminderService(db)
    reminder = await svc.snooze_reminder(candidate_id, reminder_id, req)
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return StandardResponse(
        message=f"Reminder snoozed in database until {reminder.snoozed_until}",
        data=ReminderOut.model_validate(reminder)
    )

@router.delete("/{reminder_id}", response_model=StandardResponse[dict])
async def dismiss_reminder(
    reminder_id: str,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = ReminderService(db)
    success = await svc.dismiss_reminder(candidate_id, reminder_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return StandardResponse(message="Reminder dismissed in database", data={"dismissed": True})
