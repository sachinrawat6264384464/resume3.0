from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.interview_template import InterviewTemplate
from app.models.interview_stage import InterviewStage
from app.models.question import Question
from app.models.interview_attempt import InterviewAttempt
from app.models.stage_attempt import StageAttempt
from app.models.question_attempt import QuestionAttempt
from app.models.candidate import Candidate
from app.schemas.interview import TemplateCreate

class InterviewService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_templates(self, org_id: str) -> List[InterviewTemplate]:
        stmt = (
            select(InterviewTemplate)
            .where(InterviewTemplate.organization_id == org_id, InterviewTemplate.status != "ARCHIVED")
            .options(selectinload(InterviewTemplate.stages).selectinload(InterviewStage.questions))
            .order_by(desc(InterviewTemplate.created_at))
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_template_by_id(self, template_id: str, org_id: str) -> InterviewTemplate:
        stmt = (
            select(InterviewTemplate)
            .where(InterviewTemplate.id == template_id, InterviewTemplate.organization_id == org_id)
            .options(selectinload(InterviewTemplate.stages).selectinload(InterviewStage.questions))
        )
        result = await self.db.execute(stmt)
        template = result.scalar_one_or_none()
        if not template:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview template not found")
        return template

    async def create_template(self, t_in: TemplateCreate, org_id: str, user_id: Optional[str] = None) -> InterviewTemplate:
        template = InterviewTemplate(
            organization_id=org_id,
            job_description_id=t_in.job_description_id,
            title=t_in.title,
            description=t_in.description,
            target_role=t_in.target_role,
            passing_score=t_in.passing_score,
            status=t_in.status,
            created_by=user_id
        )
        self.db.add(template)
        await self.db.flush()

        if t_in.stages:
            for s_in in t_in.stages:
                stage = InterviewStage(
                    interview_template_id=template.id,
                    stage_number=s_in.stage_number,
                    title=s_in.title,
                    description=s_in.description,
                    category=s_in.category,
                    minimum_score=s_in.minimum_score,
                    unlock_rule=s_in.unlock_rule
                )
                self.db.add(stage)
        await self.db.flush()
        return template

    async def start_interview_attempt(self, template_id: str, candidate_id: str, org_id: str) -> InterviewAttempt:
        # Fetch template with stages and questions
        stmt = (
            select(InterviewTemplate)
            .where(InterviewTemplate.id == template_id, InterviewTemplate.organization_id == org_id)
            .options(selectinload(InterviewTemplate.stages).selectinload(InterviewStage.questions))
        )
        res = await self.db.execute(stmt)
        template = res.scalar_one_or_none()
        if not template or not template.stages:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Template has no configured stages")

        # Create InterviewAttempt
        now = datetime.now(timezone.utc)
        attempt = InterviewAttempt(
            candidate_id=candidate_id,
            interview_template_id=template.id,
            organization_id=org_id,
            status="IN_PROGRESS",
            current_stage_number=1,
            started_at=now
        )
        self.db.add(attempt)
        await self.db.flush()

        # Create stage attempts
        sorted_stages = sorted(template.stages, key=lambda s: s.stage_number)
        for idx, stage in enumerate(sorted_stages):
            is_first = (idx == 0)
            stage_att = StageAttempt(
                interview_attempt_id=attempt.id,
                interview_stage_id=stage.id,
                stage_number=stage.stage_number,
                status="IN_PROGRESS" if is_first else "LOCKED",
                started_at=now if is_first else None
            )
            self.db.add(stage_att)
            await self.db.flush()

            # Pre-create question attempts for the stage with immutable snapshots
            sorted_questions = sorted(stage.questions, key=lambda q: q.order_index)
            for q in sorted_questions:
                q_att = QuestionAttempt(
                    stage_attempt_id=stage_att.id,
                    interview_attempt_id=attempt.id,
                    question_id=q.id,
                    question_text_snapshot=q.question_text,
                    status="PENDING"
                )
                self.db.add(q_att)

        await self.db.flush()
        return attempt

    async def get_attempt_details(self, attempt_id: str, org_id: Optional[str] = None) -> InterviewAttempt:
        stmt = (
            select(InterviewAttempt)
            .where(InterviewAttempt.id == attempt_id)
            .options(
                selectinload(InterviewAttempt.template),
                selectinload(InterviewAttempt.candidate).selectinload(Candidate.user),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.stage),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.question_attempts).selectinload(QuestionAttempt.question),
                selectinload(InterviewAttempt.recordings)
            )
        )
        if org_id:
            stmt = stmt.where(InterviewAttempt.organization_id == org_id)

        res = await self.db.execute(stmt)
        attempt = res.scalar_one_or_none()
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview attempt not found")
        return attempt
