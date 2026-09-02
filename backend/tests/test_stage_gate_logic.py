import pytest
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.interview_template import InterviewTemplate
from app.models.candidate import Candidate
from app.models.interview_attempt import InterviewAttempt
from app.models.stage_attempt import StageAttempt
from app.models.question_attempt import QuestionAttempt
from app.services.interview_service import InterviewService
from app.services.stage_service import StageService

@pytest.mark.asyncio
async def test_stage_gate_fail_at_79_percent(db_session):
    """
    CRITICAL REQUIREMENT TEST:
    A stage score of 79% (below 80% threshold) MUST mark stage as FAILED
    and keep Stage 2 in LOCKED state.
    """
    # 1. Start interview attempt
    cand = (await db_session.execute(select(Candidate))).scalars().first()
    template = (await db_session.execute(select(InterviewTemplate))).scalars().first()
    
    interview_svc = InterviewService(db_session)
    attempt = await interview_svc.start_interview_attempt(template.id, cand.id, cand.organization_id)
    
    # Reload attempt with stages
    attempt_full = await interview_svc.get_attempt_details(attempt.id)
    stage1_att = next(s for s in attempt_full.stage_attempts if s.stage_number == 1)
    stage2_att = next(s for s in attempt_full.stage_attempts if s.stage_number == 2)
    
    assert stage1_att.status == "IN_PROGRESS"
    assert stage2_att.status == "LOCKED"

    # Set question attempt score to exactly 79.0
    q_att = stage1_att.question_attempts[0]
    q_att.overall_score = 79.0
    q_att.status = "EVALUATED"
    await db_session.flush()

    # 2. Evaluate stage
    stage_svc = StageService(db_session)
    resp = await stage_svc.evaluate_and_advance_stage(stage1_att.id)

    # 3. Assertions
    assert resp.passed is False
    assert resp.stage_score == 79.0
    assert resp.unlocked_next_stage is False
    assert resp.status == "FAILED"

    # Check database state
    await db_session.refresh(stage1_att)
    await db_session.refresh(stage2_att)
    assert stage1_att.status == "FAILED"
    assert stage2_att.status == "LOCKED"

@pytest.mark.asyncio
async def test_stage_gate_pass_at_80_percent_unlocks_next_stage(db_session):
    """
    CRITICAL REQUIREMENT TEST:
    A stage score of exactly 80% (meets 80% threshold) MUST mark stage as PASSED
    and unlock Stage 2 into IN_PROGRESS state.
    """
    cand = (await db_session.execute(select(Candidate))).scalars().first()
    template = (await db_session.execute(select(InterviewTemplate))).scalars().first()
    
    interview_svc = InterviewService(db_session)
    attempt = await interview_svc.start_interview_attempt(template.id, cand.id, cand.organization_id)
    
    attempt_full = await interview_svc.get_attempt_details(attempt.id)
    stage1_att = next(s for s in attempt_full.stage_attempts if s.stage_number == 1)
    stage2_att = next(s for s in attempt_full.stage_attempts if s.stage_number == 2)

    # Set question attempt score to exactly 80.0
    q_att = stage1_att.question_attempts[0]
    q_att.overall_score = 80.0
    q_att.status = "EVALUATED"
    await db_session.flush()

    # Evaluate stage
    stage_svc = StageService(db_session)
    resp = await stage_svc.evaluate_and_advance_stage(stage1_att.id)

    # Assertions
    assert resp.passed is True
    assert resp.stage_score == 80.0
    assert resp.unlocked_next_stage is True
    assert resp.status == "PASSED"
    assert resp.next_stage_id == stage2_att.id

    # Check database state
    await db_session.refresh(stage1_att)
    await db_session.refresh(stage2_att)
    assert stage1_att.status == "PASSED"
    assert stage2_att.status == "IN_PROGRESS"
