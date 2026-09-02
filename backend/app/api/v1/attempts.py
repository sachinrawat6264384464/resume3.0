from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.interview_service import InterviewService
from app.services.evaluation_service import EvaluationService
from app.services.stage_service import StageService
from app.schemas.attempt import (
    StartInterviewRequest, InterviewAttemptOut, SubmitAnswerRequest,
    StageEvaluationResponse
)
from app.schemas.evaluation import QuestionEvaluationResult
from app.schemas.common import StandardResponse
from app.models.candidate import Candidate
from sqlalchemy import select

router = APIRouter(prefix="/attempts", tags=["Interview Attempts & Live Session"])

@router.post("/start", response_model=StandardResponse[InterviewAttemptOut], status_code=status.HTTP_201_CREATED)
async def start_attempt(
    req: StartInterviewRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)

    candidate_id = req.candidate_id
    if not candidate_id:
        # Check if user has candidate profile
        cand_stmt = select(Candidate).where(Candidate.user_id == user.id)
        cand_res = await db.execute(cand_stmt)
        cand = cand_res.scalar_one_or_none()
        if cand:
            candidate_id = cand.id
        else:
            # Create candidate profile for user
            cand = Candidate(
                user_id=user.id,
                organization_id=user.organization_id,
                target_role="CloudOps Engineer"
            )
            db.add(cand)
            await db.flush()
            candidate_id = cand.id

    interview_svc = InterviewService(db)
    attempt = await interview_svc.start_interview_attempt(
        template_id=req.interview_template_id,
        candidate_id=candidate_id,
        org_id=user.organization_id
    )

    full_attempt = await interview_svc.get_attempt_details(attempt.id)
    return StandardResponse(
        message="Interview attempt started successfully",
        data=InterviewAttemptOut.model_validate(full_attempt)
    )

@router.get("/{attempt_id}", response_model=StandardResponse[InterviewAttemptOut])
async def get_attempt(
    attempt_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    attempt = await interview_svc.get_attempt_details(attempt_id, user.organization_id)
    return StandardResponse(
        data=InterviewAttemptOut.model_validate(attempt)
    )

@router.post("/{attempt_id}/questions/{q_attempt_id}/submit-json", response_model=StandardResponse[QuestionEvaluationResult])
async def submit_question_json(
    attempt_id: str,
    q_attempt_id: str,
    req: SubmitAnswerRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    eval_svc = EvaluationService(db)
    eval_result = await eval_svc.submit_and_evaluate_question(
        question_attempt_id=q_attempt_id,
        transcript=req.transcript,
        duration_seconds=req.duration_seconds
    )
    return StandardResponse(
        message="Answer evaluated successfully",
        data=eval_result
    )

@router.post("/{attempt_id}/questions/{q_attempt_id}/submit-recording", response_model=StandardResponse[QuestionEvaluationResult])
async def submit_question_recording(
    attempt_id: str,
    q_attempt_id: str,
    transcript: Optional[str] = Form(None),
    duration_seconds: float = Form(0.0),
    recording_file: Optional[UploadFile] = File(None),
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    file_bytes = None
    file_name = None
    mime_type = "video/webm"
    if recording_file:
        file_bytes = await recording_file.read()
        file_name = recording_file.filename or f"answer_{q_attempt_id}.webm"
        mime_type = recording_file.content_type or "video/webm"

    eval_svc = EvaluationService(db)
    eval_result = await eval_svc.submit_and_evaluate_question(
        question_attempt_id=q_attempt_id,
        transcript=transcript,
        duration_seconds=duration_seconds,
        recording_bytes=file_bytes,
        file_name=file_name,
        mime_type=mime_type
    )
    return StandardResponse(
        message="Recording processed and answer evaluated successfully",
        data=eval_result
    )

@router.post("/{attempt_id}/stages/{s_attempt_id}/evaluate-and-advance", response_model=StandardResponse[StageEvaluationResponse])
async def evaluate_stage(
    attempt_id: str,
    s_attempt_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stage_svc = StageService(db)
    resp = await stage_svc.evaluate_and_advance_stage(s_attempt_id)
    return StandardResponse(
        message="Stage evaluated",
        data=resp
    )
