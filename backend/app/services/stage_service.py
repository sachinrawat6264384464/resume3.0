from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.stage_attempt import StageAttempt
from app.models.interview_attempt import InterviewAttempt
from app.models.question_attempt import QuestionAttempt
from app.models.candidate import Candidate
from app.models.audit_log import AuditLog
from app.schemas.attempt import StageEvaluationResponse
from app.services.report_service import ReportService

class StageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def evaluate_and_advance_stage(self, stage_attempt_id: str) -> StageEvaluationResponse:
        stmt = (
            select(StageAttempt)
            .where(StageAttempt.id == stage_attempt_id)
            .options(
                selectinload(StageAttempt.stage),
                selectinload(StageAttempt.question_attempts),
                selectinload(StageAttempt.interview_attempt).selectinload(InterviewAttempt.stage_attempts)
            )
        )
        res = await self.db.execute(stmt)
        stage_att = res.scalar_one_or_none()
        if not stage_att:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage attempt not found")

        q_attempts = stage_att.question_attempts or []
        if not q_attempts:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No questions found in this stage")

        # Calculate average question overall score
        evaluated_scores = [q.overall_score for q in q_attempts if q.overall_score is not None]
        if not evaluated_scores:
            # Fallback default score if questions were marked completed without individual scores
            stage_score = 0.0
        else:
            stage_score = round(sum(evaluated_scores) / len(evaluated_scores), 1)

        stage_att.score = stage_score
        now = datetime.now(timezone.utc)
        stage_att.completed_at = now

        threshold = stage_att.stage.minimum_score if stage_att.stage else 80.0
        passed = stage_score >= threshold

        stage_att.status = "PASSED" if passed else "FAILED"

        interview_att = stage_att.interview_attempt
        all_stages = sorted(interview_att.stage_attempts, key=lambda s: s.stage_number)
        current_num = stage_att.stage_number
        
        next_stage_att = next((s for s in all_stages if s.stage_number == current_num + 1), None)
        unlocked_next = False
        next_stage_id = None
        next_stage_number = None
        is_final_stage = (next_stage_att is None)

        if passed:
            if next_stage_att:
                # Unlock subsequent stage
                next_stage_att.status = "IN_PROGRESS"
                next_stage_att.started_at = now
                interview_att.current_stage_number = next_stage_att.stage_number
                unlocked_next = True
                next_stage_id = next_stage_att.id
                next_stage_number = next_stage_att.stage_number
            else:
                # All stages completed!
                interview_att.status = "COMPLETED"
                interview_att.completed_at = now
                interview_att.decision = "PASS"
                # Trigger final report synthesis
                report_service = ReportService(self.db)
                await report_service.synthesize_final_report(interview_att.id)
        else:
            # Stage failed -> keeps next stage LOCKED
            interview_att.decision = "NEEDS_IMPROVEMENT"
            # Trigger report synthesis for candidate study feedback
            report_service = ReportService(self.db)
            await report_service.synthesize_final_report(interview_att.id)

        # Gamification: Award XP (+200 completion, +300 passing bonus) and update badges
        try:
            if interview_att.candidate_id:
                stmt_cand = select(Candidate).where(Candidate.id == interview_att.candidate_id)
                cand_res = await self.db.execute(stmt_cand)
                cand = cand_res.scalar_one_or_none()
                if cand:
                    xp_gain = 200 + (300 if passed else 0)
                    cand.xp = (cand.xp or 0) + xp_gain
                    cand.level = max(1, 1 + cand.xp // 300)
                    cand.last_active_at = now
                    cand.readiness_score = round(min(98.0, max(cand.readiness_score, (cand.readiness_score * 0.7 + stage_score * 0.3))), 1)

                    badges = list(cand.badges_json or [])
                    badge_map = {
                        1: "Linux Warrior",
                        2: "Cloud Explorer",
                        3: "AWS Ninja",
                        4: "CI/CD Master",
                        5: "Production TroubleShooter"
                    }
                    earned_badge = badge_map.get(current_num)
                    if earned_badge and earned_badge not in badges and passed:
                        badges.append(earned_badge)
                        cand.badges_json = badges
        except Exception as e:
            print(f"Stage XP award failed: {e}")

        await self.db.flush()

        feedback = (
            f"Stage {current_num} completed with a score of {stage_score}%. "
            + ("Congratulations! You exceeded the 80% passing bar. Next stage is unlocked." if passed
               else "You did not meet the 80% passing threshold for this stage. Review the personalized study roadmap.")
        )

        return StageEvaluationResponse(
            stage_attempt_id=stage_att.id,
            stage_number=current_num,
            stage_title=stage_att.stage.title if stage_att.stage else f"Stage {current_num}",
            stage_score=stage_score,
            passing_threshold=threshold,
            passed=passed,
            status=stage_att.status,
            feedback=feedback,
            unlocked_next_stage=unlocked_next,
            next_stage_id=next_stage_id,
            next_stage_number=next_stage_number,
            is_final_stage=is_final_stage
        )

    async def override_stage_decision(
        self,
        stage_attempt_id: str,
        new_status: str,
        override_score: Optional[float],
        override_reason: str,
        admin_user_id: str
    ) -> StageAttempt:
        stmt = (
            select(StageAttempt)
            .where(StageAttempt.id == stage_attempt_id)
            .options(
                selectinload(StageAttempt.stage),
                selectinload(StageAttempt.interview_attempt).selectinload(InterviewAttempt.stage_attempts)
            )
        )
        res = await self.db.execute(stmt)
        stage_att = res.scalar_one_or_none()
        if not stage_att:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stage attempt not found")

        stage_att.status = new_status.upper()
        if override_score is not None:
            stage_att.score = override_score
        stage_att.is_override = True
        stage_att.override_reason = override_reason
        stage_att.override_by = admin_user_id

        # If override is PASSED, unlock next stage
        if stage_att.status == "PASSED":
            interview_att = stage_att.interview_attempt
            all_stages = sorted(interview_att.stage_attempts, key=lambda s: s.stage_number)
            next_stage = next((s for s in all_stages if s.stage_number == stage_att.stage_number + 1), None)
            if next_stage:
                next_stage.status = "IN_PROGRESS"
                next_stage.started_at = datetime.now(timezone.utc)
                interview_att.current_stage_number = next_stage.stage_number

        # Record audit log
        audit = AuditLog(
            organization_id=stage_att.interview_attempt.organization_id,
            user_id=admin_user_id,
            action="ADMIN_STAGE_OVERRIDE",
            entity_type="stage_attempt",
            entity_id=stage_att.id,
            details={
                "new_status": stage_att.status,
                "override_score": stage_att.score,
                "reason": override_reason
            }
        )
        self.db.add(audit)
        await self.db.flush()
        return stage_att
