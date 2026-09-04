from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
import uuid

from app.models.candidate import Candidate
from app.models.study_plan import StudyPlan
from app.models.study_task import StudyTask
from app.models.study_goal import StudyGoal
from app.models.roadmap import CandidateRoadmap
from app.models.question_attempt import QuestionAttempt
from app.models.interview_attempt import InterviewAttempt
from app.models.resume_audit import ResumeAudit
from app.schemas.study_planner import (
    StudyTaskCreate, StudyTaskUpdate, StudyGoalCreate, AIPlanRequest
)

class StudyPlannerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_goal(self, candidate_id: str) -> StudyGoal:
        stmt = select(StudyGoal).where(StudyGoal.candidate_id == candidate_id)
        res = await self.db.execute(stmt)
        goal = res.scalar_one_or_none()
        if not goal:
            goal = StudyGoal(
                id=str(uuid.uuid4()),
                candidate_id=candidate_id,
                target_role="Senior DevOps Engineer",
                target_date=datetime.now(timezone.utc) + timedelta(days=30),
                weekly_hours=15,
                target_score=85.0,
                weekly_task_target=10
            )
            self.db.add(goal)
            await self.db.commit()
            await self.db.refresh(goal)
        return goal

    async def update_goal(self, candidate_id: str, goal_in: StudyGoalCreate) -> StudyGoal:
        goal = await self.get_or_create_goal(candidate_id)
        if goal_in.target_role is not None:
            goal.target_role = goal_in.target_role
        if goal_in.target_date is not None:
            goal.target_date = goal_in.target_date
        if goal_in.weekly_hours is not None:
            goal.weekly_hours = goal_in.weekly_hours
        if goal_in.target_score is not None:
            goal.target_score = goal_in.target_score
        if goal_in.weekly_task_target is not None:
            goal.weekly_task_target = goal_in.weekly_task_target
        
        await self.db.commit()
        await self.db.refresh(goal)
        return goal

    async def get_summary(self, candidate_id: str) -> dict:
        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        today_end = today_start + timedelta(days=1)
        
        # Start of current week (Monday)
        start_of_week = today_start - timedelta(days=today_start.weekday())

        # Today's tasks
        stmt_today = select(func.count(StudyTask.id)).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.scheduled_date >= today_start,
                StudyTask.scheduled_date < today_end
            )
        )
        todays_tasks_count = (await self.db.execute(stmt_today)).scalar() or 0

        # Completed tasks total
        stmt_completed = select(func.count(StudyTask.id)).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.status == "COMPLETED"
            )
        )
        completed_tasks_count = (await self.db.execute(stmt_completed)).scalar() or 0

        # Pending tasks total
        stmt_pending = select(func.count(StudyTask.id)).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.status.in_(["TODO", "IN_PROGRESS", "OVERDUE"])
            )
        )
        pending_tasks_count = (await self.db.execute(stmt_pending)).scalar() or 0

        # Weekly study hours completed
        stmt_weekly_mins = select(func.sum(StudyTask.duration_minutes)).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.status == "COMPLETED",
                StudyTask.completed_at >= start_of_week
            )
        )
        weekly_mins = (await self.db.execute(stmt_weekly_mins)).scalar() or 0
        weekly_study_hours = round(weekly_mins / 60.0, 1)

        # Weekly total tasks planned vs completed
        stmt_weekly_all = select(func.count(StudyTask.id)).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.scheduled_date >= start_of_week
            )
        )
        weekly_all_count = (await self.db.execute(stmt_weekly_all)).scalar() or 0
        
        stmt_weekly_done = select(func.count(StudyTask.id)).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.scheduled_date >= start_of_week,
                StudyTask.status == "COMPLETED"
            )
        )
        weekly_done_count = (await self.db.execute(stmt_weekly_done)).scalar() or 0

        weekly_completion_pct = round((weekly_done_count / weekly_all_count * 100.0), 1) if weekly_all_count > 0 else 0.0

        # Fetch candidate for streak
        stmt_cand = select(Candidate).where(Candidate.id == candidate_id)
        cand = (await self.db.execute(stmt_cand)).scalar_one_or_none()
        current_streak = cand.streak_days if cand else 1

        return {
            "todays_tasks_count": todays_tasks_count,
            "completed_tasks_count": completed_tasks_count,
            "weekly_study_hours": weekly_study_hours,
            "current_streak": current_streak,
            "pending_tasks_count": pending_tasks_count,
            "weekly_completion_pct": weekly_completion_pct
        }

    async def get_tasks(
        self, 
        candidate_id: str, 
        status: Optional[str] = None, 
        date_from: Optional[datetime] = None, 
        date_to: Optional[datetime] = None,
        view_mode: Optional[str] = None
    ) -> List[StudyTask]:
        stmt = select(StudyTask).where(StudyTask.candidate_id == candidate_id)

        if status:
            stmt = stmt.where(StudyTask.status == status)

        if view_mode == "today":
            now = datetime.now(timezone.utc)
            today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
            today_end = today_start + timedelta(days=1)
            stmt = stmt.where(and_(StudyTask.scheduled_date >= today_start, StudyTask.scheduled_date < today_end))
        elif view_mode == "this_week":
            now = datetime.now(timezone.utc)
            today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
            start_of_week = today_start - timedelta(days=today_start.weekday())
            end_of_week = start_of_week + timedelta(days=7)
            stmt = stmt.where(and_(StudyTask.scheduled_date >= start_of_week, StudyTask.scheduled_date < end_of_week))

        if date_from:
            stmt = stmt.where(StudyTask.scheduled_date >= date_from)
        if date_to:
            stmt = stmt.where(StudyTask.scheduled_date <= date_to)

        stmt = stmt.order_by(StudyTask.scheduled_date.asc(), StudyTask.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def create_task(self, candidate_id: str, task_in: StudyTaskCreate) -> StudyTask:
        task = StudyTask(
            id=str(uuid.uuid4()),
            candidate_id=candidate_id,
            study_plan_id=task_in.study_plan_id,
            title=task_in.title.strip(),
            description=task_in.description,
            category=task_in.category or "DevOps & Cloud",
            skill=task_in.skill or "General CloudOps",
            difficulty=task_in.difficulty or "INTERMEDIATE",
            priority=task_in.priority or "MEDIUM",
            scheduled_date=task_in.scheduled_date,
            start_time=task_in.start_time or "09:00 AM",
            duration_minutes=task_in.duration_minutes or 60,
            status="TODO",
            xp_reward=task_in.xp_reward or 50,
            roadmap_stage_id=task_in.roadmap_stage_id,
            interview_stage_id=task_in.interview_stage_id
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def update_task(self, candidate_id: str, task_id: str, task_in: StudyTaskUpdate) -> Optional[StudyTask]:
        stmt = select(StudyTask).where(and_(StudyTask.id == task_id, StudyTask.candidate_id == candidate_id))
        task = (await self.db.execute(stmt)).scalar_one_or_none()
        if not task:
            return None

        for field, value in task_in.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(task, field, value)

        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete_task(self, candidate_id: str, task_id: str) -> bool:
        stmt = select(StudyTask).where(and_(StudyTask.id == task_id, StudyTask.candidate_id == candidate_id))
        task = (await self.db.execute(stmt)).scalar_one_or_none()
        if not task:
            return False

        await self.db.delete(task)
        await self.db.commit()
        return True

    async def complete_task(self, candidate_id: str, task_id: str) -> Optional[StudyTask]:
        stmt = select(StudyTask).where(and_(StudyTask.id == task_id, StudyTask.candidate_id == candidate_id))
        task = (await self.db.execute(stmt)).scalar_one_or_none()
        if not task:
            return None

        if task.status != "COMPLETED":
            now = datetime.now(timezone.utc)
            task.status = "COMPLETED"
            task.completed_at = now

            # Fetch candidate and perform atomic XP & Streak transaction
            stmt_cand = select(Candidate).where(Candidate.id == candidate_id)
            cand = (await self.db.execute(stmt_cand)).scalar_one_or_none()
            if cand:
                cand.xp = (cand.xp or 0) + (task.xp_reward or 50)
                cand.level = max(1, cand.xp // 1000 + 1)
                
                # Check streak update
                if cand.last_active_at:
                    delta = (now.date() - cand.last_active_at.date()).days
                    if delta == 1:
                        cand.streak_days = (cand.streak_days or 1) + 1
                    elif delta > 1:
                        cand.streak_days = 1
                else:
                    cand.streak_days = 1
                cand.last_active_at = now

            # If task is linked to roadmap stage, update candidate roadmap progress
            if task.roadmap_stage_id:
                stmt_rm = select(CandidateRoadmap).where(
                    and_(
                        CandidateRoadmap.candidate_id == candidate_id,
                        CandidateRoadmap.week_number == task.roadmap_stage_id
                    )
                )
                rm = (await self.db.execute(stmt_rm)).scalar_one_or_none()
                if rm and not rm.is_completed:
                    rm.is_completed = True
                    rm.completed_at = now

        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def get_weekly_analytics(self, candidate_id: str) -> dict:
        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        start_of_week = today_start - timedelta(days=today_start.weekday())
        end_of_week = start_of_week + timedelta(days=7)

        stmt_tasks = select(StudyTask).where(
            and_(
                StudyTask.candidate_id == candidate_id,
                StudyTask.scheduled_date >= start_of_week,
                StudyTask.scheduled_date < end_of_week
            )
        )
        tasks = list((await self.db.execute(stmt_tasks)).scalars().all())

        planned_mins = sum(t.duration_minutes for t in tasks)
        completed_mins = sum(t.duration_minutes for t in tasks if t.status == "COMPLETED")
        planned_hours = round(planned_mins / 60.0, 1)
        completed_hours = round(completed_mins / 60.0, 1)
        remaining_hours = max(0.0, round((planned_mins - completed_mins) / 60.0, 1))
        completion_pct = round((completed_hours / planned_hours * 100.0), 1) if planned_hours > 0 else 0.0

        # Tasks per day breakdown (Mon to Sun)
        days_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        tasks_per_day = []
        for i, dname in enumerate(days_map):
            d_date = (start_of_week + timedelta(days=i)).date()
            d_tasks = [t for t in tasks if t.scheduled_date.date() == d_date]
            d_planned = sum(t.duration_minutes for t in d_tasks) / 60.0
            d_completed = sum(t.duration_minutes for t in d_tasks if t.status == "COMPLETED") / 60.0
            tasks_per_day.append({
                "day": dname,
                "planned_hours": round(d_planned, 1),
                "completed_hours": round(d_completed, 1),
                "tasks_count": len(d_tasks)
            })

        # Skill distribution breakdown
        skill_counts: Dict[str, int] = {}
        for t in tasks:
            sk = t.skill or t.category or "General"
            skill_counts[sk] = skill_counts.get(sk, 0) + 1

        total_skills_count = sum(skill_counts.values()) or 1
        skill_distribution = [
            {"skill": k, "count": v, "percentage": round((v / total_skills_count) * 100.0, 1)}
            for k, v in skill_counts.items()
        ]

        stmt_cand = select(Candidate).where(Candidate.id == candidate_id)
        cand = (await self.db.execute(stmt_cand)).scalar_one_or_none()
        streak = cand.streak_days if cand else 1

        return {
            "planned_hours": planned_hours,
            "completed_hours": completed_hours,
            "remaining_hours": remaining_hours,
            "completion_pct": completion_pct,
            "streak_days": streak,
            "tasks_per_day": tasks_per_day,
            "skill_distribution": skill_distribution
        }

    async def generate_ai_plan(self, candidate_id: str, req: AIPlanRequest) -> List[StudyTask]:
        # 1. Fetch Candidate & Context from DB
        stmt_cand = select(Candidate).where(Candidate.id == candidate_id)
        cand = (await self.db.execute(stmt_cand)).scalar_one_or_none()
        target_role = req.target_role or (cand.target_role if cand else "Senior DevOps Engineer")

        # Query weak question attempt skills (< 70%)
        stmt_q = (
            select(QuestionAttempt)
            .join(InterviewAttempt, QuestionAttempt.interview_attempt_id == InterviewAttempt.id)
            .where(and_(InterviewAttempt.candidate_id == candidate_id, QuestionAttempt.overall_score < 70))
            .limit(5)
        )
        weak_q = list((await self.db.execute(stmt_q)).scalars().all())

        # Query latest ResumeAudit missing skills
        stmt_aud = select(ResumeAudit).where(ResumeAudit.candidate_id == candidate_id).order_by(desc(ResumeAudit.created_at)).limit(1)
        latest_aud = (await self.db.execute(stmt_aud)).scalar_one_or_none()
        missing_skills = latest_aud.missing_skills if latest_aud and latest_aud.missing_skills else []

        # Build dynamic AI tasks based on REAL DB gaps
        focus_skills = []
        if missing_skills:
            focus_skills.extend(missing_skills[:3])
        if weak_q:
            focus_skills.append("AWS VPC & Subnet Troubleshooting")
            focus_skills.append("Kubernetes Pod Eviction & CrashLoopBackOff")

        if not focus_skills:
            focus_skills = ["AWS IAM & IRSA Roles", "Kubernetes EKS Architecture", "Terraform State Locking", "Linux SystemD & Process Management"]

        # Create or update StudyPlan container
        plan = StudyPlan(
            id=str(uuid.uuid4()),
            candidate_id=candidate_id,
            title=f"AI Personalized Prep Plan ({target_role})",
            description=f"Generated AI study roadmap targeting detected skill gaps: {', '.join(focus_skills[:3])}",
            start_date=datetime.now(timezone.utc),
            end_date=datetime.now(timezone.utc) + timedelta(days=14),
            target_hours=req.available_weekly_hours or 15,
            status="ACTIVE",
            generated_by="AI"
        )
        self.db.add(plan)

        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

        ai_templates = [
            {
                "title": f"Mastery & Troubleshooting: {focus_skills[0] if len(focus_skills) > 0 else 'Linux SystemD'}",
                "category": "Linux & Systems",
                "skill": focus_skills[0] if len(focus_skills) > 0 else "Linux Admin",
                "difficulty": "INTERMEDIATE",
                "priority": "HIGH",
                "duration": 60,
                "xp": 75,
                "days_offset": 0,
                "time": "09:00 AM",
                "roadmap_stage": 1,
                "interview_stage": 2
            },
            {
                "title": f"Production Incident Simulation: {focus_skills[1] if len(focus_skills) > 1 else 'AWS VPC'}",
                "category": "Multi-Cloud",
                "skill": focus_skills[1] if len(focus_skills) > 1 else "AWS VPC Networking",
                "difficulty": "ADVANCED",
                "priority": "HIGH",
                "duration": 90,
                "xp": 100,
                "days_offset": 1,
                "time": "10:30 AM",
                "roadmap_stage": 2,
                "interview_stage": 3
            },
            {
                "title": f"Deep Dive Lab: {focus_skills[2] if len(focus_skills) > 2 else 'Kubernetes EKS'}",
                "category": "Containers & K8s",
                "skill": focus_skills[2] if len(focus_skills) > 2 else "Kubernetes Deployments",
                "difficulty": "ADVANCED",
                "priority": "MEDIUM",
                "duration": 75,
                "xp": 80,
                "days_offset": 2,
                "time": "02:00 PM",
                "roadmap_stage": 3,
                "interview_stage": 4
            },
            {
                "title": "CI/CD Pipeline Failure & Helm Rollback Exercise",
                "category": "DevOps & CI/CD",
                "skill": "GitHub Actions & Helm",
                "difficulty": "INTERMEDIATE",
                "priority": "MEDIUM",
                "duration": 60,
                "xp": 60,
                "days_offset": 3,
                "time": "04:00 PM",
                "roadmap_stage": 4,
                "interview_stage": 4
            },
            {
                "title": "Full Outage Boss Battle Preparation (Stage 5 Review)",
                "category": "Site Reliability",
                "skill": "Production RCA & Outage Triage",
                "difficulty": "ADVANCED",
                "priority": "HIGH",
                "duration": 90,
                "xp": 120,
                "days_offset": 4,
                "time": "11:00 AM",
                "roadmap_stage": 5,
                "interview_stage": 5
            }
        ]

        created_tasks = []
        for tspec in ai_templates:
            task_date = today_start + timedelta(days=tspec["days_offset"])
            task = StudyTask(
                id=str(uuid.uuid4()),
                candidate_id=candidate_id,
                study_plan_id=plan.id,
                title=tspec["title"],
                description=f"AI recommended task targeting {tspec['skill']}. Boosts readiness for {target_role}.",
                category=tspec["category"],
                skill=tspec["skill"],
                difficulty=tspec["difficulty"],
                priority=tspec["priority"],
                scheduled_date=task_date,
                start_time=tspec["time"],
                duration_minutes=tspec["duration"],
                status="TODO",
                xp_reward=tspec["xp"],
                roadmap_stage_id=tspec["roadmap_stage"],
                interview_stage_id=tspec["interview_stage"]
            )
            self.db.add(task)
            created_tasks.append(task)

        await self.db.commit()
        for t in created_tasks:
            await self.db.refresh(t)

        return created_tasks
