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

    async def list_templates(self, org_id: Optional[str] = None) -> List[InterviewTemplate]:
        stmt = (
            select(InterviewTemplate)
            .where(InterviewTemplate.status != "ARCHIVED")
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

    async def start_interview_attempt(self, template_id: str, candidate_id: str, org_id: str, start_stage_num: int = 1) -> InterviewAttempt:
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

        # Create InterviewAttempt starting from stage 1 (or requested stage)
        now = datetime.now(timezone.utc)
        effective_start_stage = max(1, start_stage_num)
        attempt = InterviewAttempt(
            candidate_id=candidate_id,
            interview_template_id=template.id,
            organization_id=org_id,
            status="IN_PROGRESS",
            current_stage_number=effective_start_stage,
            started_at=now
        )
        self.db.add(attempt)
        await self.db.flush()

        # Create stage attempts (excluding stage 0 which is for profile setup form in UI)
        room_stages = [s for s in template.stages if s.stage_number >= 1]
        sorted_stages = sorted(room_stages, key=lambda s: s.stage_number)

        stage_tuples = []
        for idx, stage in enumerate(sorted_stages):
            is_target = (stage.stage_number == effective_start_stage) or (idx == 0 and effective_start_stage <= 1)
            stage_att = StageAttempt(
                interview_attempt_id=attempt.id,
                interview_stage_id=stage.id,
                stage_number=stage.stage_number,
                status="IN_PROGRESS" if is_target else "LOCKED",
                started_at=now if is_target else None
            )
            self.db.add(stage_att)
            stage_tuples.append((stage_att, stage))

        await self.db.flush()

        for stage_att, stage in stage_tuples:
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

        await self.db.commit()
        return attempt

    async def get_attempt_details(self, attempt_id: str, org_id: Optional[str] = None) -> InterviewAttempt:
        stmt = (
            select(InterviewAttempt)
            .where(InterviewAttempt.id == attempt_id)
            .options(
                selectinload(InterviewAttempt.template),
                selectinload(InterviewAttempt.candidate).selectinload(Candidate.user),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.stage).selectinload(InterviewStage.questions),
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
        
        # Auto-advance stage 0 to PASSED if stuck in IN_PROGRESS, so room opens Stage 1
        stg0_sa = next((sa for sa in attempt.stage_attempts if sa.stage_number == 0), None)
        stg1_sa = next((sa for sa in attempt.stage_attempts if sa.stage_number == 1), None)
        has_new_attempts = False

        if stg0_sa and stg0_sa.status == "IN_PROGRESS":
            stg0_sa.status = "PASSED"
            if stg1_sa and stg1_sa.status == "LOCKED":
                stg1_sa.status = "IN_PROGRESS"
                stg1_sa.started_at = datetime.now(timezone.utc)
            has_new_attempts = True

        # Ensure question attempts exist for all stage questions and auto-map to real DB stages
        for sa in attempt.stage_attempts:
            if sa.stage_number == 0:
                continue

            if not sa.stage:
                stg_stmt = select(InterviewStage).where(InterviewStage.stage_number == sa.stage_number).options(selectinload(InterviewStage.questions))
                stg_res = await self.db.execute(stg_stmt)
                matching_stage = stg_res.scalar_one_or_none()
                if matching_stage:
                    sa.interview_stage_id = matching_stage.id
                    sa.stage = matching_stage
                    has_new_attempts = True

            if sa.stage and sa.stage.questions:
                # Delete old generic placeholder question attempts if real DB questions exist
                generic_qas = [
                    qa for qa in sa.question_attempts 
                    if qa.question_text_snapshot and ("TECHNICAL ASSESSMENT" in qa.question_text_snapshot or "Generic" in qa.question_text_snapshot or qa.question_id is None)
                ]
                for gqa in generic_qas:
                    await self.db.delete(gqa)
                    sa.question_attempts.remove(gqa)
                    has_new_attempts = True

                existing_q_ids = {qa.question_id for qa in sa.question_attempts if qa.question_id}
                sorted_qs = sorted(sa.stage.questions, key=lambda q: q.order_index)
                for q in sorted_qs:
                    if q.id not in existing_q_ids:
                        new_qa = QuestionAttempt(
                            stage_attempt_id=sa.id,
                            interview_attempt_id=attempt.id,
                            question_id=q.id,
                            question_text_snapshot=q.question_text,
                            status="PENDING"
                        )
                        self.db.add(new_qa)
                        sa.question_attempts.append(new_qa)
                        has_new_attempts = True
                    else:
                        # Update snapshot text if changed by Admin
                        for qa in sa.question_attempts:
                            if qa.question_id == q.id and qa.question_text_snapshot != q.question_text:
                                qa.question_text_snapshot = q.question_text
                                has_new_attempts = True

        if has_new_attempts:
            await self.db.flush()
            await self.db.commit()

        return attempt
