from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.jd_service import JobDescriptionService
from app.schemas.job_description import JobDescriptionCreate, JobDescriptionOut, JDAnalyzeRequest, JDAnalyzeResponse
from app.schemas.interview import TemplateAdminOut
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/job-descriptions", tags=["Job Descriptions"])

@router.post("/analyze", response_model=StandardResponse[JDAnalyzeResponse])
async def analyze_jd(
    req: JDAnalyzeRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    jd_svc = JobDescriptionService(db)
    analysis = await jd_svc.analyze_and_extract(req)
    return StandardResponse(
        message="Job description analyzed successfully",
        data=analysis
    )

@router.get("", response_model=StandardResponse[List[JobDescriptionOut]])
async def list_jds(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    jd_svc = JobDescriptionService(db)
    jds = await jd_svc.list_job_descriptions(user.organization_id)
    return StandardResponse(
        data=[JobDescriptionOut.model_validate(jd) for jd in jds]
    )

@router.post("", response_model=StandardResponse[JobDescriptionOut], status_code=status.HTTP_201_CREATED)
async def create_jd(
    jd_in: JobDescriptionCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    jd_svc = JobDescriptionService(db)
    jd = await jd_svc.create_job_description(jd_in, user.organization_id, user.id)
    return StandardResponse(
        message="Job description created",
        data=JobDescriptionOut.model_validate(jd)
    )

@router.post("/{jd_id}/generate-template", response_model=StandardResponse[TemplateAdminOut])
async def generate_template_from_jd(
    jd_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    jd_svc = JobDescriptionService(db)
    template = await jd_svc.generate_template_from_jd(jd_id, user.organization_id, user.id)
    return StandardResponse(
        message="Interview blueprint generated successfully",
        data=TemplateAdminOut.model_validate(template)
    )
