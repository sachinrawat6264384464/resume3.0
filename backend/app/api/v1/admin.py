from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.admin_service import AdminService
from app.services.stage_service import StageService
from app.services.retention_service import RetentionService
from app.schemas.admin import (
    AdminDashboardMetrics, StageOverrideRequest, RetentionCleanupResponse, AssignInterviewRequest
)
from app.schemas.attempt import StageAttemptOut
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/admin", tags=["Admin Suite & Analytics"])

@router.get("/analytics/overview", response_model=StandardResponse[AdminDashboardMetrics])
async def get_analytics_overview(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    admin_svc = AdminService(db)
    metrics = await admin_svc.get_dashboard_analytics(user.organization_id)
    return StandardResponse(
        data=metrics
    )

@router.post("/stages/{stage_attempt_id}/override", response_model=StandardResponse[StageAttemptOut])
async def override_stage(
    stage_attempt_id: str,
    req: StageOverrideRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    stage_svc = StageService(db)
    stage_att = await stage_svc.override_stage_decision(
        stage_attempt_id=stage_attempt_id,
        new_status=req.new_status,
        override_score=req.override_score,
        override_reason=req.override_reason,
        admin_user_id=user.id
    )
    return StandardResponse(
        message="Stage decision overridden by administrator",
        data=StageAttemptOut.model_validate(stage_att)
    )

@router.post("/recordings/trigger-cleanup", response_model=StandardResponse[RetentionCleanupResponse])
async def trigger_retention_cleanup(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    retention_svc = RetentionService(db)
    result = await retention_svc.cleanup_expired_recordings()
    return StandardResponse(
        message="Retention cleanup executed successfully",
        data=result
    )

@router.post("/candidates/assign-interview", response_model=StandardResponse[List[str]])
async def assign_interview(
    req: AssignInterviewRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    admin_svc = AdminService(db)
    attempt_ids = await admin_svc.assign_interview_template(
        candidate_ids=req.candidate_ids,
        template_id=req.interview_template_id,
        org_id=user.organization_id
    )
    return StandardResponse(
        message=f"Assigned interview to {len(attempt_ids)} candidates",
        data=attempt_ids
    )

@router.get("/support/tickets", response_model=StandardResponse[dict])
async def get_all_support_tickets_admin(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, desc
    from sqlalchemy.orm import selectinload
    from app.models import SupportTicket, Candidate, User

    stmt = select(SupportTicket).options(
        selectinload(SupportTicket.candidate).selectinload(Candidate.user)
    ).order_by(desc(SupportTicket.created_at))
    
    res = await db.execute(stmt)
    tickets = res.scalars().all()

    ticket_list = []
    total_count = len(tickets)
    open_count = 0
    in_progress_count = 0
    resolved_count = 0

    for t in tickets:
        if t.status == "OPEN":
            open_count += 1
        elif t.status == "IN_PROGRESS":
            in_progress_count += 1
        elif t.status in ("RESOLVED", "CLOSED"):
            resolved_count += 1

        cand_name = "Candidate"
        cand_email = "candidate@cloudops.internal"
        target_role = "Senior DevOps Engineer"
        if t.candidate:
            target_role = t.candidate.target_role or target_role
            if t.candidate.user:
                cand_name = t.candidate.user.full_name or cand_name
                cand_email = t.candidate.user.email or cand_email

        ticket_list.append({
            "id": t.id,
            "ticket_code": t.ticket_code,
            "candidate_id": t.candidate_id,
            "candidate_name": cand_name,
            "candidate_email": cand_email,
            "target_role": target_role,
            "subject": t.subject,
            "category": t.category,
            "message": t.message,
            "status": t.status,
            "priority": t.priority,
            "created_at": t.created_at.strftime("%b %d, %Y %H:%M") if t.created_at else "Recently"
        })

    return StandardResponse(
        data={
            "metrics": {
                "total": total_count,
                "open": open_count,
                "in_progress": in_progress_count,
                "resolved": resolved_count
            },
            "tickets": ticket_list
        }
    )

@router.patch("/support/tickets/{ticket_id}/status", response_model=StandardResponse[dict])
async def update_support_ticket_status_admin(
    ticket_id: str,
    status_update: dict,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, or_
    from app.models import SupportTicket

    stmt = select(SupportTicket).where(
        or_(SupportTicket.id == ticket_id, SupportTicket.ticket_code == ticket_id)
    )
    res = await db.execute(stmt)
    ticket = res.scalar_one_or_none()
    
    if not ticket:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Support ticket not found")

    new_status = status_update.get("status", "IN_PROGRESS").upper()
    ticket.status = new_status
    await db.commit()
    await db.refresh(ticket)

    return StandardResponse(
        message=f"Support ticket status updated to {new_status}",
        data={
            "id": ticket.id,
            "ticket_code": ticket.ticket_code,
            "status": ticket.status
        }
    )

@router.get("/telemetry/performance", response_model=StandardResponse[dict])
async def get_api_performance_telemetry(
    limit: int = 500,
    payload: dict = Depends(verify_auth_token)
):
    from app.core.telemetry_logger import analyze_api_performance_logs
    stats = analyze_api_performance_logs(limit=limit)
    return StandardResponse(
        message="API Telemetry performance metrics retrieved",
        data=stats
    )

