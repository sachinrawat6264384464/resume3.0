import pytest
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.models.recording import Recording
from app.models.candidate import Candidate
from app.models.interview_attempt import InterviewAttempt
from app.models.interview_template import InterviewTemplate
from app.services.interview_service import InterviewService
from app.services.retention_service import RetentionService

@pytest.mark.asyncio
async def test_90_day_retention_cleanup(db_session):
    cand = (await db_session.execute(select(Candidate))).scalars().first()
    template = (await db_session.execute(select(InterviewTemplate))).scalars().first()
    
    interview_svc = InterviewService(db_session)
    attempt = await interview_svc.start_interview_attempt(template.id, cand.id, cand.organization_id)

    now = datetime.now(timezone.utc)
    
    # 1. Create an active recording (not expired)
    active_rec = Recording(
        candidate_id=cand.id,
        interview_attempt_id=attempt.id,
        storage_provider="local",
        local_file_path="/tmp/active_test.webm",
        file_name="active_test.webm",
        file_size_bytes=1024,
        duration_seconds=30.0,
        expires_at=now + timedelta(days=80),
        deletion_status="ACTIVE"
    )

    # 2. Create an expired recording (95 days old)
    expired_rec = Recording(
        candidate_id=cand.id,
        interview_attempt_id=attempt.id,
        storage_provider="local",
        local_file_path="/tmp/expired_test.webm",
        file_name="expired_test.webm",
        file_size_bytes=2048,
        duration_seconds=45.0,
        expires_at=now - timedelta(days=5),
        deletion_status="ACTIVE"
    )

    db_session.add_all([active_rec, expired_rec])
    await db_session.flush()

    # 3. Trigger retention cleanup
    retention_svc = RetentionService(db_session)
    cleanup_res = await retention_svc.cleanup_expired_recordings()

    assert cleanup_res.expired_count == 1
    assert cleanup_res.purged_count == 1

    # 4. Verify states in DB
    await db_session.refresh(active_rec)
    await db_session.refresh(expired_rec)

    assert active_rec.deletion_status == "ACTIVE"
    assert active_rec.deleted_at is None

    assert expired_rec.deletion_status == "RETENTION_PURGED"
    assert expired_rec.deleted_at is not None

    # 5. Verify Idempotence: Running cleanup again should purge 0 records
    second_run = await retention_svc.cleanup_expired_recordings()
    assert second_run.purged_count == 0
