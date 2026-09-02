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
        now = datetime.now(timezone.utc)
        q_att.started_at = q_att.started_at or now

        # 1. Handle Recording upload if video/audio bytes provided
        recording_id = None
        if recording_bytes and len(recording_bytes) > 0:
            rec_filename = file_name or f"q_att_{q_att.id}.webm"
            # Fetch candidate ID from interview attempt
            stmt_attempt = select(InterviewAttempt).where(InterviewAttempt.id == q_att.interview_attempt_id)
            att_res = await self.db.execute(stmt_attempt)
            interview_att = att_res.scalar_one_or_none()
            
            cand_id = interview_att.candidate_id if interview_att else "candidate"
            org_id = interview_att.organization_id if interview_att else "default"

            upload_result = await self.storage.upload_file(
                file_bytes=recording_bytes,
                file_name=rec_filename,
                org_id=org_id,
                candidate_id=cand_id,
                attempt_id=q_att.interview_attempt_id,
                mime_type=mime_type
            )

            expires_at = now + timedelta(days=settings.RECORDING_RETENTION_DAYS)
            rec = Recording(
                candidate_id=cand_id,
                interview_attempt_id=q_att.interview_attempt_id,
                storage_provider=upload_result["storage_provider"],
                google_drive_file_id=upload_result["file_identifier"] if upload_result["storage_provider"] == "google_drive" else None,
                google_drive_view_link=upload_result.get("view_url") if upload_result["storage_provider"] == "google_drive" else None,
                local_file_path=upload_result["file_identifier"] if upload_result["storage_provider"] == "local" else None,
                file_name=rec_filename,
                mime_type=mime_type,
                file_size_bytes=upload_result["file_size_bytes"],
                duration_seconds=duration_seconds,
                expires_at=expires_at,
                deletion_status="ACTIVE"
            )
            self.db.add(rec)
            await self.db.flush()
            recording_id = rec.id
            q_att.recording_id = rec.id

            # If transcript was empty, perform Speech-To-Text transcription from local file
            if not transcript and upload_result.get("file_identifier") and upload_result["storage_provider"] == "local":
                stt_res = await self.stt.transcribe(upload_result["file_identifier"])
                transcript = stt_res.get("transcript", "")
                if not duration_seconds:
                    duration_seconds = stt_res.get("duration", 30.0)

        final_transcript = transcript or ""

        # 2. Run AI Answer Evaluation
        eval_result = await self.ai.evaluate_answer(
            question_text=q_att.question_text_snapshot,
            expected_topics=q.expected_topics or [],
            reference_answer=q.reference_answer or "",
            candidate_transcript=final_transcript,
            rubric=q.evaluation_rubric or {},
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

        await self.db.flush()
        return eval_result
