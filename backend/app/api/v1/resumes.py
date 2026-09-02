from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.resume_service import ResumeService
from app.services.candidate_service import CandidateService
from app.schemas.resume import (
    ResumeATSResponse, BulletImprovementRequest, BulletImprovementItem,
    ResumeParseRequest
)
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/resumes", tags=["AI Resume & ATS Checker"])

@router.post("/parse-and-match", response_model=StandardResponse[ResumeATSResponse])
async def parse_and_match_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_title: Optional[str] = Form("CloudOps / DevOps Engineer"),
    job_description: Optional[str] = Form(None),
    payload: Optional[dict] = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    text = ""
    if file:
        file_bytes = await file.read()
        text = ResumeService.extract_text_from_file_bytes(file_bytes, file.filename or "resume.pdf")
    elif resume_text:
        text = resume_text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a resume file (PDF/DOCX) or resume text content."
        )

    resume_svc = ResumeService(db)
    result = await resume_svc.analyze_and_match(
        resume_text=text,
        job_title=job_title or "CloudOps / DevOps Engineer",
        job_description=job_description
    )

    # If user is authenticated, automatically link ATS analysis to candidate profile
    if payload:
        try:
            auth_svc = AuthService(db)
            user = await auth_svc.get_current_user_from_payload(payload)
            cand_svc = CandidateService(db)
            cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
            if cand:
                await cand_svc.update_ats_profile(
                    candidate_id=cand.id,
                    ats_score=result.ats_score,
                    profile_data=result.candidate_profile.model_dump()
                )
        except Exception as e:
            print(f"Failed to auto-update candidate profile with resume: {e}")

    return StandardResponse(
        message="Resume analyzed and matched successfully",
        data=result
    )

@router.post("/parse-text", response_model=StandardResponse[ResumeATSResponse])
async def parse_text_resume(
    req: ResumeParseRequest,
    payload: Optional[dict] = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    resume_svc = ResumeService(db)
    result = await resume_svc.analyze_and_match(
        resume_text=req.resume_text,
        job_title=req.job_title or "CloudOps / DevOps Engineer",
        job_description=req.job_description
    )
    return StandardResponse(
        message="Resume matched successfully",
        data=result
    )

@router.post("/improve-bullet", response_model=StandardResponse[BulletImprovementItem])
async def improve_bullet_point(
    req: BulletImprovementRequest,
    payload: Optional[dict] = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    resume_svc = ResumeService(db)
    result = await resume_svc.improve_single_bullet(
        role=req.role,
        current_bullet=req.current_bullet,
        keywords=req.keywords or ""
    )
    return StandardResponse(
        message="Bullet point improved",
        data=result
    )
