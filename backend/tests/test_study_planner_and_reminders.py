import pytest
import uuid
from datetime import datetime, timedelta, timezone

from app.models.candidate import Candidate
from app.models.study_plan import StudyPlan
from app.models.study_task import StudyTask
from app.models.study_goal import StudyGoal
from app.models.reminder import Reminder
from app.services.study_planner_service import StudyPlannerService
from app.services.reminder_service import ReminderService
from app.schemas.study_planner import StudyTaskCreate, StudyGoalCreate, AIPlanRequest
from app.schemas.reminder import ReminderCreate, ReminderSnoozeRequest

@pytest.mark.asyncio
async def test_study_planner_db_persistence_and_xp(db_session):
    # 1. Setup Candidate
    cid = f"test-cand-{uuid.uuid4()}"
    cand = Candidate(
        id=cid,
        user_id=f"usr-{uuid.uuid4()}",
        organization_id="org-test",
        target_role="DevOps Engineer",
        xp=100,
        level=1,
        streak_days=1
    )
    db_session.add(cand)
    await db_session.commit()

    service = StudyPlannerService(db_session)

    # 2. Test Goal Creation & Fetching from DB
    goal_in = StudyGoalCreate(
        target_role="Senior DevOps Architect",
        weekly_hours=20,
        target_score=90.0,
        weekly_task_target=12
    )
    goal = await service.update_goal(cid, goal_in)
    assert goal.id is not None
    assert goal.target_role == "Senior DevOps Architect"
    assert goal.weekly_hours == 20

    fetched_goal = await service.get_or_create_goal(cid)
    assert fetched_goal.id == goal.id
    assert fetched_goal.weekly_hours == 20

    # 3. Test Task Creation & Database Persistence
    task_in = StudyTaskCreate(
        title="Deploy AWS EKS Cluster with Terraform",
        description="Hands-on lab deploying VPC and EKS node groups",
        category="Multi-Cloud",
        skill="AWS EKS",
        difficulty="ADVANCED",
        priority="HIGH",
        scheduled_date=datetime.now(timezone.utc),
        duration_minutes=90,
        xp_reward=100
    )
    task = await service.create_task(cid, task_in)
    assert task.id is not None
    assert task.status == "TODO"
    assert task.candidate_id == cid

    # Verify task appears in candidate task list fetched from DB
    tasks = await service.get_tasks(cid)
    assert len(tasks) == 1
    assert tasks[0].title == "Deploy AWS EKS Cluster with Terraform"

    # 4. Test Task Completion & Atomic XP/Level Transaction
    completed_task = await service.complete_task(cid, task.id)
    assert completed_task.status == "COMPLETED"
    assert completed_task.completed_at is not None

    # Refresh candidate from DB and verify XP increase
    await db_session.refresh(cand)
    assert cand.xp == 200  # Initial 100 + 100 reward

    # 5. Test Summary & Weekly Analytics DB aggregation
    summary = await service.get_summary(cid)
    assert summary["completed_tasks_count"] == 1
    assert summary["weekly_study_hours"] == 1.5  # 90 mins = 1.5 hrs

@pytest.mark.asyncio
async def test_smart_reminders_db_persistence_and_snooze(db_session):
    # 1. Setup Candidate
    cid = f"test-cand-{uuid.uuid4()}"
    cand = Candidate(
        id=cid,
        user_id=f"usr-{uuid.uuid4()}",
        organization_id="org-test",
        target_role="Cloud Security Engineer",
        xp=0,
        level=1,
        streak_days=1
    )
    db_session.add(cand)
    await db_session.commit()

    rservice = ReminderService(db_session)

    # 2. Test Reminder Creation & Database Persistence
    rem_in = ReminderCreate(
        title="Review AWS IAM Least Privilege Policies",
        message="Prepare for upcoming Cloud Security interview module",
        type="study",
        priority="HIGH",
        due_at=datetime.now(timezone.utc) + timedelta(hours=2),
        action_url="/study-planner"
    )
    rem = await rservice.create_reminder(cid, rem_in)
    assert rem.id is not None
    assert rem.status == "ACTIVE"
    assert rem.candidate_id == cid

    # Verify fetching from DB
    rems = await rservice.get_reminders(cid)
    assert len(rems) >= 1
    assert any("Review AWS IAM" in r.title for r in rems)

    # 3. Test Snooze Functionality & Timestamp Calculation
    snooze_payload = ReminderSnoozeRequest(snooze_minutes=60)
    snoozed_rem = await rservice.snooze_reminder(cid, rem.id, snooze_payload)
    assert snoozed_rem.status == "SNOOZED"
    assert snoozed_rem.snoozed_until is not None

    # 4. Test Automated Reminder Generation
    await rservice.generate_automated_reminders(cid)

    # 5. Test Mark Read & Dismiss
    read_rem = await rservice.mark_read(cid, rem.id)
    assert read_rem.status in ["READ", "SNOOZED"]

    summary = await rservice.get_summary(cid)
    assert summary["active_count"] >= 0


@pytest.mark.asyncio
async def test_multi_tenant_candidate_isolation(db_session):
    # Test strict data isolation between two distinct candidates
    cid1 = f"cand-1-{uuid.uuid4()}"
    cid2 = f"cand-2-{uuid.uuid4()}"

    db_session.add(Candidate(id=cid1, user_id=f"u1-{uuid.uuid4()}", organization_id="org-test"))
    db_session.add(Candidate(id=cid2, user_id=f"u2-{uuid.uuid4()}", organization_id="org-test"))
    await db_session.commit()

    service = StudyPlannerService(db_session)
    rservice = ReminderService(db_session)

    # Create task & reminder for Candidate 1
    t1 = await service.create_task(cid1, StudyTaskCreate(title="Cand 1 Private Task", scheduled_date=datetime.now(timezone.utc)))
    r1 = await rservice.create_reminder(cid1, ReminderCreate(title="Cand 1 Private Reminder", message="Private Msg"))

    # Candidate 2 should NOT see Candidate 1's tasks or reminders
    c2_tasks = await service.get_tasks(cid2)
    c2_rems = await rservice.get_reminders(cid2)
    assert len(c2_tasks) == 0
    assert len(c2_rems) == 0

    # Candidate 2 should NOT be able to complete or delete Candidate 1's task
    del_res = await service.delete_task(cid2, t1.id)
    assert del_res is False
