from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.question_attempt import QuestionAttempt
from app.models.question import Question
from app.models.stage_attempt import StageAttempt
from app.models.interview_attempt import InterviewAttempt
from app.models.recording import Recording
from app.schemas.evaluation import QuestionEvaluationResult
from app.ai import get_ai_provider
from app.speech import get_stt_provider
from app.storage import get_storage_provider
from app.core.config import settings

class EvaluationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai = get_ai_provider()
        self.stt = get_stt_provider()
        self.storage = get_storage_provider()

    async def submit_and_evaluate_question(
        self,
        question_attempt_id: str,
        transcript: Optional[str] = None,
        duration_seconds: float = 0.0,
        recording_bytes: Optional[bytes] = None,
        file_name: Optional[str] = None,
        mime_type: str = "video/webm"
    ) -> QuestionEvaluationResult:
        # Fetch question attempt with question and attempt details
        stmt = (
            select(QuestionAttempt)
            .where(QuestionAttempt.id == question_attempt_id)
            .options(
                selectinload(QuestionAttempt.question),
                selectinload(QuestionAttempt.stage_attempt),
                selectinload(QuestionAttempt.recording)
            )
        )
        res = await self.db.execute(stmt)
        q_att = res.scalar_one_or_none()
        if not q_att:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question attempt not found")

        q = q_att.question
        if q_att.question_id:
            q_res = await self.db.execute(select(Question).where(Question.id == q_att.question_id))
            live_q = q_res.scalar_one_or_none()
            if live_q:
                q = live_q

        eval_q_text = (q.question_text if q and q.question_text else None) or q_att.question_text_snapshot
        eval_ref_ans = (q.reference_answer if q and q.reference_answer else None) or ""
        eval_topics = (q.expected_topics if q and q.expected_topics else None) or []

        # 2. Run AI Answer Evaluation against fresh Live DB Question
        eval_result = await self.ai.evaluate_answer(
            question_text=eval_q_text,
            expected_topics=eval_topics,
            reference_answer=eval_ref_ans,
            candidate_transcript=final_transcript,
            rubric=q.evaluation_rubric if q else {},
            duration_seconds=duration_seconds
        )

        # 3. Store scores and evaluation breakdown
        q_att.answer_transcript = final_transcript
        q_att.status = "EVALUATED"
        q_att.technical_score = eval_result.technical_score
        q_att.concept_coverage_score = eval_result.concept_coverage_score
        q_att.reasoning_score = eval_result.reasoning_score
        q_att.practical_score = eval_result.practical_score
        q_att.communication_score = eval_result.communication_score
        q_att.confidence_score = eval_result.confidence_score
        q_att.overall_score = eval_result.overall_score
        q_att.evaluation_json = eval_result.model_dump()
        q_att.completed_at = now

        # 4. Award Candidate XP (+10 XP for answering)
        try:
            stmt_attempt = select(InterviewAttempt).where(InterviewAttempt.id == q_att.interview_attempt_id)
            att_res = await self.db.execute(stmt_attempt)
            interview_att = att_res.scalar_one_or_none()
            if interview_att and interview_att.candidate_id:
                stmt_cand = select(Candidate).where(Candidate.id == interview_att.candidate_id)
                cand_res = await self.db.execute(stmt_cand)
                cand = cand_res.scalar_one_or_none()
                if cand:
                    cand.xp = (cand.xp or 0) + 10
                    cand.level = max(1, 1 + cand.xp // 300)
                    cand.last_active_at = now
        except Exception as e:
            print(f"XP award failed: {e}")

        await self.db.commit()
        return eval_result
