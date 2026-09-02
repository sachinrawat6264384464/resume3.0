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
