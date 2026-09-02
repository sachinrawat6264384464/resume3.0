from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.report_service import ReportService
from app.schemas.report import CandidateReportOut, AdminReportOut
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/reports", tags=["Assessment Reports & 30-Day Roadmaps"])

@router.get("/{attempt_id}/candidate", response_model=StandardResponse[CandidateReportOut])
async def get_candidate_report(
    attempt_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    rep_svc = ReportService(db)
    report = await rep_svc.get_candidate_report(attempt_id)
    return StandardResponse(
        message="Candidate report generated",
        data=report
    )

@router.get("/{attempt_id}/admin", response_model=StandardResponse[AdminReportOut])
async def get_admin_report(
    attempt_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    rep_svc = ReportService(db)
    report = await rep_svc.get_admin_report(attempt_id)
    return StandardResponse(
        message="Admin report generated",
        data=report
    )
