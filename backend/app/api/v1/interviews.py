from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.interview_service import InterviewService
from app.schemas.interview import TemplateCreate, TemplateAdminOut, TemplateCandidateOut
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/interviews", tags=["Interviews & Templates"])

@router.get("/templates", response_model=StandardResponse[List[TemplateAdminOut]])
async def list_templates(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    templates = await interview_svc.list_templates(user.organization_id)
    return StandardResponse(
        data=[TemplateAdminOut.model_validate(t) for t in templates]
    )

@router.get("/templates/{template_id}", response_model=StandardResponse[TemplateAdminOut])
async def get_template(
    template_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    template = await interview_svc.get_template_by_id(template_id, user.organization_id)
    return StandardResponse(
        data=TemplateAdminOut.model_validate(template)
    )

@router.post("/templates", response_model=StandardResponse[TemplateAdminOut], status_code=status.HTTP_201_CREATED)
async def create_template(
    t_in: TemplateCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    template = await interview_svc.create_template(t_in, user.organization_id, user.id)
    return StandardResponse(
        message="Interview template created successfully",
        data=TemplateAdminOut.model_validate(template)
    )
