from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
import uuid

from app.models.candidate import Candidate
from app.models.reminder import Reminder
from app.models.study_task import StudyTask
from app.models.interview_attempt import InterviewAttempt
from app.models.question_attempt import QuestionAttempt
from app.models.resume_audit import ResumeAudit
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderSnoozeRequest

class ReminderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_reminders(
        self,
        candidate_id: str,
        status: Optional[str] = None,
        rem_type: Optional[str] = None,
        unread_only: bool = False
    ) -> List[Reminder]:
        # 1. Trigger automated reminder generation for current candidate activity
        await self.generate_automated_reminders(candidate_id)

        now = datetime.now(timezone.utc)

        stmt = select(Reminder).where(Reminder.candidate_id == candidate_id)

        if unread_only:
            stmt = stmt.where(Reminder.status.in_(["ACTIVE", "SNOOZED"]))
        elif status:
            stmt = stmt.where(Reminder.status == status)

        if rem_type:
            stmt = stmt.where(Reminder.type == rem_type)

        # Exclude currently snoozed items if snooze time is in future
        # Note: If snoozed_until is in the past, update status back to ACTIVE
        stmt_snoozed = select(Reminder).where(
            and_(
                Reminder.candidate_id == candidate_id,
                Reminder.status == "SNOOZED",
                Reminder.snoozed_until <= now
            )
        )
        expired_snoozes = list((await self.db.execute(stmt_snoozed)).scalars().all())
        if expired_snoozes:
            for rem in expired_snoozes:
                rem.status = "ACTIVE"
            await self.db.commit()

        stmt = stmt.order_by(Reminder.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_summary(self, candidate_id: str) -> dict:
        await self.generate_automated_reminders(candidate_id)

        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        today_end = today_start + timedelta(days=1)

        stmt_active = select(func.count(Reminder.id)).where(
            and_(Reminder.candidate_id == candidate_id, Reminder.status == "ACTIVE")
        )
        active_count = (await self.db.execute(stmt_active)).scalar() or 0

        stmt_due_today = select(func.count(Reminder.id)).where(
            and_(
                Reminder.candidate_id == candidate_id,
                Reminder.status == "ACTIVE",
                Reminder.due_at >= today_start,
                Reminder.due_at < today_end
            )
        )
        due_today_count = (await self.db.execute(stmt_due_today)).scalar() or 0

        stmt_upcoming = select(func.count(Reminder.id)).where(
            and_(
                Reminder.candidate_id == candidate_id,
                Reminder.status == "ACTIVE",
                Reminder.due_at >= today_end
            )
        )
        upcoming_count = (await self.db.execute(stmt_upcoming)).scalar() or 0

        stmt_completed = select(func.count(Reminder.id)).where(
            and_(Reminder.candidate_id == candidate_id, Reminder.status == "COMPLETED")
        )
        completed_count = (await self.db.execute(stmt_completed)).scalar() or 0

        stmt_snoozed = select(func.count(Reminder.id)).where(
            and_(Reminder.candidate_id == candidate_id, Reminder.status == "SNOOZED")
        )
        snoozed_count = (await self.db.execute(stmt_snoozed)).scalar() or 0

        stmt_unread = select(func.count(Reminder.id)).where(
            and_(Reminder.candidate_id == candidate_id, Reminder.status == "ACTIVE", Reminder.read_at.is_(None))
        )
        unread_count = (await self.db.execute(stmt_unread)).scalar() or 0

        return {
            "active_count": active_count,
            "due_today_count": due_today_count,
            "upcoming_count": upcoming_count,
            "completed_count": completed_count,
            "snoozed_count": snoozed_count,
            "unread_count": unread_count
        }

    async def create_reminder(self, candidate_id: str, rem_in: ReminderCreate) -> Reminder:
        now = datetime.now(timezone.utc)
        reminder = Reminder(
            id=str(uuid.uuid4()),
            candidate_id=candidate_id,
            type=rem_in.type or "STUDY",
            title=rem_in.title.strip(),
            message=rem_in.message.strip(),
            priority=rem_in.priority or "MEDIUM",
            status="ACTIVE",
            scheduled_at=rem_in.scheduled_at or now,
            due_at=rem_in.due_at or (now + timedelta(hours=24)),
            related_entity_type=rem_in.related_entity_type,
            related_entity_id=rem_in.related_entity_id,
            created_by="USER"
        )
        self.db.add(reminder)
        await self.db.commit()
        await self.db.refresh(reminder)
        return reminder

    async def mark_read(self, candidate_id: str, reminder_id: str) -> Optional[Reminder]:
        stmt = select(Reminder).where(and_(Reminder.id == reminder_id, Reminder.candidate_id == candidate_id))
        reminder = (await self.db.execute(stmt)).scalar_one_or_none()
        if not reminder:
            return None

        if reminder.status == "ACTIVE":
            reminder.status = "READ"
        reminder.read_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(reminder)
        return reminder

    async def complete_reminder(self, candidate_id: str, reminder_id: str) -> Optional[Reminder]:
        stmt = select(Reminder).where(and_(Reminder.id == reminder_id, Reminder.candidate_id == candidate_id))
        reminder = (await self.db.execute(stmt)).scalar_one_or_none()
        if not reminder:
            return None

        reminder.status = "COMPLETED"
        reminder.completed_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(reminder)
        return reminder

    async def snooze_reminder(self, candidate_id: str, reminder_id: str, req: ReminderSnoozeRequest) -> Optional[Reminder]:
        stmt = select(Reminder).where(and_(Reminder.id == reminder_id, Reminder.candidate_id == candidate_id))
        reminder = (await self.db.execute(stmt)).scalar_one_or_none()
        if not reminder:
            return None

        now = datetime.now(timezone.utc)
        if req.snooze_until:
            snooze_until = req.snooze_until
        else:
            minutes = req.snooze_minutes or 30
            snooze_until = now + timedelta(minutes=minutes)

        reminder.status = "SNOOZED"
        reminder.snoozed_until = snooze_until

        await self.db.commit()
        await self.db.refresh(reminder)
        return reminder

    async def dismiss_reminder(self, candidate_id: str, reminder_id: str) -> bool:
        stmt = select(Reminder).where(and_(Reminder.id == reminder_id, Reminder.candidate_id == candidate_id))
        reminder = (await self.db.execute(stmt)).scalar_one_or_none()
        if not reminder:
            return False

        reminder.status = "DISMISSED"
        await self.db.commit()
        return True

    async def generate_automated_reminders(self, candidate_id: str):
        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        today_end = today_start + timedelta(days=1)

        # 1. Check today's study tasks still in TODO state
        stmt_t = select(StudyTask).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.scheduled_date >= today_start,
                StudyTask.scheduled_date < today_end,
                StudyTask.status == "TODO"
            )
        )
        todo_tasks = list((await self.db.execute(stmt_t)).scalars().all())

        if todo_tasks:
            # Check if reminder already exists for today's tasks to avoid duplicates
            title = f"You have {len(todo_tasks)} pending study tasks for today"
            stmt_ex = select(Reminder).where(
                and_(
                    Reminder.candidate_id == candidate_id,
                    Reminder.title == title,
                    Reminder.created_at >= today_start
                )
            )
            if not (await self.db.execute(stmt_ex)).scalar_one_or_none():
                rem = Reminder(
                    id=str(uuid.uuid4()),
                    candidate_id=candidate_id,
                    type="STUDY",
                    title=title,
                    message=f"Complete today's task: {todo_tasks[0].title} (+{todo_tasks[0].xp_reward} XP).",
                    priority="HIGH",
                    status="ACTIVE",
                    scheduled_at=now,
                    due_at=today_end,
                    related_entity_type="study_task",
                    related_entity_id=todo_tasks[0].id,
                    created_by="SYSTEM"
                )
                self.db.add(rem)

        # 2. Check Candidate Streak Expiry Risk
        stmt_cand = select(Candidate).where(Candidate.id == candidate_id)
        cand = (await self.db.execute(stmt_cand)).scalar_one_or_none()
        if cand and cand.streak_days and cand.last_active_at:
            hours_since_active = (now - cand.last_active_at).total_seconds() / 3600.0
            if hours_since_active > 18:
                streak_title = "Your Study Streak is at Risk!"
                stmt_st_ex = select(Reminder).where(
                    and_(
                        Reminder.candidate_id == candidate_id,
                        Reminder.title == streak_title,
                        Reminder.created_at >= today_start
                    )
                )
                if not (await self.db.execute(stmt_st_ex)).scalar_one_or_none():
                    rem_st = Reminder(
                        id=str(uuid.uuid4()),
                        candidate_id=candidate_id,
                        type="STREAK",
                        title=streak_title,
                        message=f"You are on a {cand.streak_days}-Day Streak! Complete 1 study task today to protect your streak.",
                        priority="HIGH",
                        status="ACTIVE",
                        scheduled_at=now,
                        due_at=today_end,
                        related_entity_type="candidate",
                        related_entity_id=candidate_id,
                        created_by="SYSTEM"
                    )
                    self.db.add(rem_st)

        # 3. Check Weak Skills AI Practice Recommendation
        stmt_weak = (
            select(QuestionAttempt)
            .join(InterviewAttempt, QuestionAttempt.interview_attempt_id == InterviewAttempt.id)
            .where(and_(InterviewAttempt.candidate_id == candidate_id, QuestionAttempt.overall_score < 70))
            .limit(1)
        )
        weak_q = (await self.db.execute(stmt_weak)).scalar_one_or_none()
        if weak_q:
            ai_title = "AI Skill Target: AWS & K8s Troubleshooting"
            stmt_ai_ex = select(Reminder).where(
                and_(
                    Reminder.candidate_id == candidate_id,
                    Reminder.title == ai_title,
                    Reminder.created_at >= today_start
                )
            )
            if not (await self.db.execute(stmt_ai_ex)).scalar_one_or_none():
                rem_ai = Reminder(
                    id=str(uuid.uuid4()),
                    candidate_id=candidate_id,
                    type="AI_RECOMMENDATION",
                    title=ai_title,
                    message="Your AWS & Kubernetes interview score was below target. Practice Stage 4 to boost readiness.",
                    priority="MEDIUM",
                    status="ACTIVE",
                    scheduled_at=now,
                    due_at=now + timedelta(days=2),
                    related_entity_type="interview",
                    related_entity_id="4",
                    created_by="AI"
                )
                self.db.add(rem_ai)

        await self.db.commit()
