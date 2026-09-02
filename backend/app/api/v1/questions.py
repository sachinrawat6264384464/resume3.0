from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate, QuestionAdminOut, QuestionGenerateRequest, QuestionHintsOut,
    QuickPracticeRequest
)
from app.schemas.evaluation import QuestionEvaluationResult
from app.schemas.common import StandardResponse
from app.ai import get_ai_provider

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("/{question_id}/hints", response_model=StandardResponse[QuestionHintsOut])
async def get_question_hints(
    question_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Question).where(Question.id == question_id)
    res = await db.execute(stmt)
    q = res.scalar_one_or_none()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    # If hints are not stored yet, dynamically generate them using AI
    h1 = q.hint_level_1
    h2 = q.hint_level_2
    h3 = q.hint_level_3

    if not h1 or not h2:
        ai = get_ai_provider()
        hints = await ai.generate_question_hints(q.question_text, q.expected_topics or [])
        h1 = hints.get("hint_level_1", "Focus on the core troubleshooting diagnostics first.")
        h2 = hints.get("hint_level_2", "Inspect key logs, status metrics, and recent events.")
        h3 = hints.get("hint_level_3", "Apply structured remediation: check root cause, apply fix, and verify health.")
        q.hint_level_1 = h1
        q.hint_level_2 = h2
        q.hint_level_3 = h3
        await db.flush()

    return StandardResponse(
        message="Hints retrieved",
        data=QuestionHintsOut(
            question_id=q.id,
            hint_level_1=h1,
            hint_level_2=h2,
            hint_level_3=h3
        )
    )

@router.post("", response_model=StandardResponse[QuestionAdminOut], status_code=status.HTTP_201_CREATED)
async def create_question(
    q_in: QuestionCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    q = Question(
        interview_stage_id=q_in.interview_stage_id,
        order_index=q_in.order_index,
        question_text=q_in.question_text,
        question_type=q_in.question_type,
        difficulty=q_in.difficulty,
        skill_category=q_in.skill_category,
        expected_topics=q_in.expected_topics,
        reference_answer=q_in.reference_answer,
        evaluation_rubric=q_in.evaluation_rubric,
        follow_up_question=q_in.follow_up_question,
        hint_level_1=q_in.hint_level_1,
        hint_level_2=q_in.hint_level_2,
        hint_level_3=q_in.hint_level_3,
        is_active=q_in.is_active
    )
    db.add(q)
    await db.flush()
    return StandardResponse(
        message="Question created",
        data=QuestionAdminOut.model_validate(q)
    )

@router.post("/generate-ai", response_model=StandardResponse[List[dict]])
async def generate_ai_questions(
    req: QuestionGenerateRequest,
    payload: dict = Depends(verify_auth_token)
):
    ai = get_ai_provider()
    generated = await ai.generate_questions(
        role=req.role,
        stage_title=req.stage_title,
        topic=req.topic,
        difficulty=req.difficulty,
        question_type=req.question_type,
        count=req.count
    )
    return StandardResponse(
        message=f"Generated {len(generated)} questions",
        data=generated
    )

@router.post("/quick-practice-evaluate", response_model=StandardResponse[QuestionEvaluationResult])
async def quick_practice_evaluate(
    req: QuickPracticeRequest,
    payload: Optional[dict] = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    ai = get_ai_provider()
    eval_result = await ai.evaluate_answer(
        question_text=req.question_text,
        expected_topics=req.expected_topics or [],
        reference_answer="Comprehensive standard production response.",
        candidate_transcript=req.candidate_transcript,
        rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
        duration_seconds=req.duration_seconds
    )

    # Award Candidate XP if authenticated
    if payload:
        try:
            from app.services.auth_service import AuthService
            from app.services.candidate_service import CandidateService
            auth_svc = AuthService(db)
            user = await auth_svc.get_current_user_from_payload(payload)
            cand_svc = CandidateService(db)
            cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
            if cand:
                await cand_svc.award_xp(cand.id, 10)
        except Exception as e:
            print(f"Quick practice XP award failed: {e}")

    return StandardResponse(
        message="Quick practice evaluated successfully (+10 XP)",
        data=eval_result
    )
