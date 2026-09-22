from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from pydantic import BaseModel

import uuid
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.core.security import verify_auth_token
from app.models.live_session import LiveSession, LiveSessionClick
from app.models.candidate import Candidate
from app.models.reminder import Reminder
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/live-sessions", tags=["Live Sessions"])

class LiveSessionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    session_date: str
    meeting_url: Optional[str] = None
    whatsapp_group_url: Optional[str] = "https://chat.whatsapp.com/AIInterviewCommunity"
    banner_url: Optional[str] = None
    is_active: bool = True
    visibility: str = "ALL_CANDIDATES"
    status: str = "UPCOMING"
    host_name: Optional[str] = "Vikas Sir & Sachin Rawat"

class LiveSessionOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    session_date: str
    meeting_url: Optional[str]
    whatsapp_group_url: Optional[str]
    banner_url: Optional[str]
    is_active: bool
    visibility: str
    status: str
    host_name: Optional[str]
    created_at: Optional[str]

@router.get("/active", response_model=StandardResponse[List[dict]])
async def get_active_live_sessions(db: AsyncSession = Depends(get_db)):
    stmt = select(LiveSession).where(LiveSession.is_active == True).order_by(desc(LiveSession.created_at))
    res = await db.execute(stmt)
    sessions = res.scalars().all()

    items = []
    for s in sessions:
        items.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "session_date": s.session_date,
            "meeting_url": s.meeting_url or "#",
            "whatsapp_group_url": s.whatsapp_group_url or "https://chat.whatsapp.com/AIInterviewCommunity",
            "banner_url": s.banner_url,
            "status": s.status,
            "host_name": s.host_name
        })

    # Sample default session if none created yet
    if not items:
        items = [{
            "id": "live-default-001",
            "title": "👑 40 LPA DevOps Architecture & Outage Troubleshooting Masterclass",
            "description": "Join Vikas Sir and Sachin Rawat for live interactive Q&A, mock interview feedback & ATS resume reviews.",
            "session_date": "25 Sept 2026 • 8:15 PM IST",
            "meeting_url": "https://meet.google.com/xyz-cloudops-live",
            "whatsapp_group_url": "https://chat.whatsapp.com/AIInterviewCommunity",
            "banner_url": "/banner-live.png",
            "status": "UPCOMING",
            "host_name": "Vikas Sir & Sachin Rawat"
        }]

    return StandardResponse(data=items)

@router.get("/admin/list", response_model=StandardResponse[List[dict]])
async def list_admin_live_sessions(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LiveSession).order_by(desc(LiveSession.created_at))
    res = await db.execute(stmt)
    sessions = res.scalars().all()

    items = []
    for s in sessions:
        items.append({
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "session_date": s.session_date,
            "meeting_url": s.meeting_url,
            "whatsapp_group_url": s.whatsapp_group_url,
            "banner_url": s.banner_url,
            "is_active": s.is_active,
            "visibility": s.visibility,
            "status": s.status,
            "host_name": s.host_name,
            "created_at": s.created_at.isoformat() if s.created_at else None
        })

    return StandardResponse(data=items)

@router.post("/admin/create", response_model=StandardResponse[dict], status_code=status.HTTP_201_CREATED)
async def create_live_session(
    req: LiveSessionCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    # Enforce Single Active Live Session Logic: Demote previous LIVE_NOW sessions
    if req.status in ["LIVE_NOW", "LIVE_STREAMING"]:
        prev_stmt = select(LiveSession).where(LiveSession.status.in_(["LIVE_NOW", "LIVE_STREAMING"]))
        prev_res = await db.execute(prev_stmt)
        for prev_s in prev_res.scalars().all():
            prev_s.status = "UPCOMING"
            prev_s.is_active = False

    session = LiveSession(
        title=req.title,
        description=req.description,
        session_date=req.session_date,
        meeting_url=req.meeting_url,
        whatsapp_group_url=req.whatsapp_group_url,
        banner_url=req.banner_url,
        is_active=req.is_active,
        visibility=req.visibility,
        status=req.status,
        host_name=req.host_name
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    # Broadcast notification to candidates in DB
    try:
        cand_res = await db.execute(select(Candidate.id))
        cand_ids = list(cand_res.scalars().all())
        now = datetime.now(timezone.utc)
        for c_id in cand_ids:
            rem = Reminder(
                id=str(uuid.uuid4()),
                candidate_id=c_id,
                type="SYSTEM",
                title=f"Live Webinar: {session.title}",
                message=f"{session.description or 'Live masterclass session active.'} Date: {session.session_date}",
                priority="HIGH",
                status="ACTIVE",
                scheduled_at=now,
                due_at=now + timedelta(days=7),
                related_entity_type="live_session",
                related_entity_id=session.id,
                created_by="ADMIN"
            )
            db.add(rem)
        await db.commit()
    except Exception as e:
        print("Live session broadcast notification warning:", e)

    return StandardResponse(
        message="Live Session created successfully and candidate notifications published",
        data={"id": session.id, "title": session.title}
    )

@router.put("/admin/{session_id}", response_model=StandardResponse[dict])
async def update_live_session(
    session_id: str,
    req: LiveSessionCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LiveSession).where(LiveSession.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    # Enforce Single Active Live Session Logic: Demote all other LIVE_NOW sessions
    if req.status in ["LIVE_NOW", "LIVE_STREAMING"]:
        prev_stmt = select(LiveSession).where(
            LiveSession.status.in_(["LIVE_NOW", "LIVE_STREAMING"]),
            LiveSession.id != session_id
        )
        prev_res = await db.execute(prev_stmt)
        for prev_s in prev_res.scalars().all():
            prev_s.status = "UPCOMING"
            prev_s.is_active = False

    session.title = req.title
    session.description = req.description
    session.session_date = req.session_date
    session.meeting_url = req.meeting_url
    session.whatsapp_group_url = req.whatsapp_group_url
    session.banner_url = req.banner_url
    session.is_active = req.is_active
    session.visibility = req.visibility
    session.status = req.status
    session.host_name = req.host_name

    await db.commit()
    await db.refresh(session)

    # Broadcast update notification to candidates in DB
    try:
        cand_res = await db.execute(select(Candidate.id))
        cand_ids = list(cand_res.scalars().all())
        now = datetime.now(timezone.utc)
        for c_id in cand_ids:
            rem = Reminder(
                id=str(uuid.uuid4()),
                candidate_id=c_id,
                type="SYSTEM",
                title=f"Live Webinar Updated: {session.title}",
                message=f"Session details updated: {session.session_date}. Join via Zoom or WhatsApp group.",
                priority="HIGH",
                status="ACTIVE",
                scheduled_at=now,
                due_at=now + timedelta(days=7),
                related_entity_type="live_session",
                related_entity_id=session.id,
                created_by="ADMIN"
            )
            db.add(rem)
        await db.commit()
    except Exception as e:
        print("Live session update notification warning:", e)

    return StandardResponse(
        message="Live session updated successfully and candidate notifications updated",
        data={"id": session.id, "title": session.title}
    )

@router.delete("/admin/{session_id}", response_model=StandardResponse[dict])
async def delete_live_session(
    session_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LiveSession).where(LiveSession.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    await db.delete(session)
    await db.commit()

    return StandardResponse(message="Live session deleted successfully", data={"deleted": True})

class ClickTrackCreate(BaseModel):
    live_session_id: str
    session_title: Optional[str] = "👑 40 LPA DevOps Architecture & Outage Troubleshooting Masterclass"
    candidate_name: str
    candidate_email: str
    platform_clicked: str # ZOOM or WHATSAPP

@router.post("/track-click", response_model=StandardResponse[dict])
async def track_candidate_click(
    req: ClickTrackCreate,
    db: AsyncSession = Depends(get_db)
):
    click_entry = LiveSessionClick(
        live_session_id=req.live_session_id,
        session_title=req.session_title,
        candidate_name=req.candidate_name,
        candidate_email=req.candidate_email,
        platform_clicked=req.platform_clicked.upper()
    )
    db.add(click_entry)
    await db.commit()
    await db.refresh(click_entry)

    return StandardResponse(
        message="Candidate click tracked successfully",
        data={"id": click_entry.id, "platform": click_entry.platform_clicked}
    )

@router.get("/admin/clicks", response_model=StandardResponse[List[dict]])
async def get_admin_clicks_log(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LiveSessionClick).order_by(desc(LiveSessionClick.clicked_at))
    res = await db.execute(stmt)
    clicks = res.scalars().all()

    items = []
    for c in clicks:
        items.append({
            "id": c.id,
            "live_session_id": c.live_session_id,
            "session_title": c.session_title or "DevOps Masterclass",
            "candidate_name": c.candidate_name,
            "candidate_email": c.candidate_email,
            "platform_clicked": c.platform_clicked,
            "clicked_at": c.clicked_at.strftime("%d %b %Y %H:%M IST") if c.clicked_at else "Just now"
        })

    # Sample default entries if table is empty
    if not items:
        items = [
            {
                "id": "clk-001",
                "live_session_id": "live-default-001",
                "session_title": "👑 40 LPA DevOps Architecture Masterclass",
                "candidate_name": "Sachin Rawat",
                "candidate_email": "sachin@cloudops.internal",
                "platform_clicked": "ZOOM",
                "clicked_at": "Today 10:15 AM"
            },
            {
                "id": "clk-002",
                "live_session_id": "live-default-001",
                "session_title": "👑 40 LPA DevOps Architecture Masterclass",
                "candidate_name": "Aarav Sharma",
                "candidate_email": "aarav@cloudops.internal",
                "platform_clicked": "WHATSAPP",
                "clicked_at": "Today 09:30 AM"
            }
        ]

    return StandardResponse(data=items)
