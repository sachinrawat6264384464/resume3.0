from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.security import verify_auth_token, verify_optional_auth_token
from app.services.auth_service import AuthService
from app.services.resume_service import ResumeService
from app.services.candidate_service import CandidateService
from app.models.resume_audit import ResumeAudit
from app.models.candidate import Candidate
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
    payload: Optional[dict] = Depends(verify_optional_auth_token),
    db: AsyncSession = Depends(get_db)
):
    text = ""
    cloud_url = None
    if file:
        file_bytes = await file.read()
        text = ResumeService.extract_text_from_file_bytes(file_bytes, file.filename or "resume.pdf")
        
        try:
            from app.storage import get_storage_provider
            storage = get_storage_provider()
            upload_res = await storage.upload_file(
                file_bytes=file_bytes,
                file_name=file.filename or "resume.pdf",
                org_id="default",
                candidate_id="resumes",
                attempt_id="ats_analysis",
                mime_type=file.content_type or "application/pdf"
            )
            cloud_url = upload_res.get("view_url")
        except Exception as e:
            print(f"Failed to upload resume to Cloudinary: {e}")

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
    result.cloudinary_url = cloud_url

    # Persist ResumeAudit into Database
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
                    profile_data=result.candidate_profile.model_dump(),
                    matching_skills=result.matching_skills
                )
                
                audit = ResumeAudit(
                    candidate_id=cand.id,
                    user_id=user.id,
                    job_title=job_title or "Senior Cloud & DevOps Engineer",
                    job_description=job_description,
                    resume_text=text,
                    cloudinary_url=cloud_url,
                    ats_score=result.ats_score,
                    breakdown_json=result.ats_breakdown.model_dump(),
                    matching_skills_json=result.matching_skills,
                    missing_skills_json=result.missing_skills,
                    profile_data_json=result.candidate_profile.model_dump(),
                    bullet_rewrites_json=[b.model_dump() for b in (result.sample_bullet_rewrites or [])]
                )
                db.add(audit)
                await db.commit()
        except Exception as e:
            print(f"Failed to save ResumeAudit to database: {e}")

    return StandardResponse(
        message="Resume analyzed and saved to database successfully",
        data=result
    )

@router.post("/parse-text", response_model=StandardResponse[ResumeATSResponse])
async def parse_text_resume(
    req: ResumeParseRequest,
    payload: Optional[dict] = Depends(verify_optional_auth_token),
    db: AsyncSession = Depends(get_db)
):
    resume_svc = ResumeService(db)
    result = await resume_svc.analyze_and_match(
        resume_text=req.resume_text,
        job_title=req.job_title or "CloudOps / DevOps Engineer",
        job_description=req.job_description
    )

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
                    profile_data=result.candidate_profile.model_dump(),
                    matching_skills=result.matching_skills
                )
                audit = ResumeAudit(
                    candidate_id=cand.id,
                    user_id=user.id,
                    job_title=req.job_title or "Senior Cloud & DevOps Engineer",
                    job_description=req.job_description,
                    resume_text=req.resume_text,
                    ats_score=result.ats_score,
                    breakdown_json=result.ats_breakdown.model_dump(),
                    matching_skills_json=result.matching_skills,
                    missing_skills_json=result.missing_skills,
                    profile_data_json=result.candidate_profile.model_dump(),
                    bullet_rewrites_json=[b.model_dump() for b in (result.sample_bullet_rewrites or [])]
                )
                db.add(audit)
                await db.commit()
        except Exception as e:
            print(f"Failed to save ResumeAudit to database: {e}")

    return StandardResponse(
        message="Resume matched and saved to database successfully",
        data=result
    )

@router.get("/latest", response_model=StandardResponse[Optional[ResumeATSResponse]])
async def get_latest_resume_audit(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    cand_stmt = select(Candidate).where(Candidate.user_id == user.id)
    cand_res = await db.execute(cand_stmt)
    cand = cand_res.scalar_one_or_none()
    
    if not cand:
        return StandardResponse(data=None)

    stmt = select(ResumeAudit).where(ResumeAudit.candidate_id == cand.id).order_by(desc(ResumeAudit.created_at)).limit(1)
    res = await db.execute(stmt)
    latest_audit = res.scalar_one_or_none()

    if not latest_audit:
        return StandardResponse(data=None)

    resp = ResumeATSResponse(
        ats_score=latest_audit.ats_score,
        breakdown=latest_audit.breakdown_json or {},
        matching_skills=latest_audit.matching_skills_json or [],
        missing_skills=latest_audit.missing_skills_json or [],
        weak_areas=latest_audit.missing_skills_json or [],
        strong_areas=latest_audit.matching_skills_json or [],
        recommended_interview_stages=[],
        candidate_profile=latest_audit.profile_data_json or {},
        bullet_suggestions=latest_audit.bullet_rewrites_json or [],
        cloudinary_url=latest_audit.cloudinary_url
    )
    return StandardResponse(data=resp)

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
