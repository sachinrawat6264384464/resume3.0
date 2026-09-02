import pytest
from sqlalchemy import select
from app.models.candidate import Candidate
from app.models.interview_template import InterviewTemplate
from app.models.audit_log import AuditLog
from app.services.interview_service import InterviewService
from app.services.stage_service import StageService

@pytest.mark.asyncio
async def test_admin_manual_stage_override(db_session):
    cand = (await db_session.execute(select(Candidate))).scalars().first()
    template = (await db_session.execute(select(InterviewTemplate))).scalars().first()
    
    interview_svc = InterviewService(db_session)
    attempt = await interview_svc.start_interview_attempt(template.id, cand.id, cand.organization_id)
    attempt_full = await interview_svc.get_attempt_details(attempt.id)
    
    stage1_att = next(s for s in attempt_full.stage_attempts if s.stage_number == 1)
    stage2_att = next(s for s in attempt_full.stage_attempts if s.stage_number == 2)
    
    # Candidate scored 75% -> Failed
    stage1_att.score = 75.0
    stage1_att.status = "FAILED"
    await db_session.flush()

    # Admin overrides to PASSED
    stage_svc = StageService(db_session)
    overridden = await stage_svc.override_stage_decision(
        stage_attempt_id=stage1_att.id,
        new_status="PASSED",
        override_score=82.0,
        override_reason="Candidate provided equivalent command in verbal discussion.",
        admin_user_id="admin-123"
    )

    # Check stage 1 updated
    assert overridden.status == "PASSED"
    assert overridden.score == 82.0
    assert overridden.is_override is True
    assert overridden.override_reason == "Candidate provided equivalent command in verbal discussion."

    # Check Stage 2 unlocked to IN_PROGRESS
    await db_session.refresh(stage2_att)
    assert stage2_att.status == "IN_PROGRESS"

    # Check Audit Log created
    audit_stmt = select(AuditLog).where(AuditLog.entity_id == stage1_att.id)
    audit_res = await db_session.execute(audit_stmt)
    audit = audit_res.scalar_one_or_none()
    assert audit is not None
    assert audit.action == "ADMIN_STAGE_OVERRIDE"
