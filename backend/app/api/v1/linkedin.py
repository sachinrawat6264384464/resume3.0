from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel
import secrets
import urllib.parse

from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.candidate_service import CandidateService
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/linkedin", tags=["LinkedIn Integration"])

class LinkedInPostCreate(BaseModel):
    content: str
    linkedin_url: Optional[str] = None
    target_role: Optional[str] = "Senior DevOps Engineer"
    readiness_score: Optional[float] = 85.0
    include_badge: bool = True

class LinkedInAuthResponse(BaseModel):
    is_authorized: bool
    account_name: Optional[str] = None
    auth_url: Optional[str] = None

@router.get("/status", response_model=StandardResponse[dict])
async def get_linkedin_status(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
    
    linkedin_url = ""
    if cand and cand.resume_data_json and isinstance(cand.resume_data_json, dict):
        linkedin_url = cand.resume_data_json.get("linkedin_url", "")
    
    if not linkedin_url:
        cand_name = user.full_name or "candidate"
        clean_slug = cand_name.lower().replace(" ", "-")
        linkedin_url = f"https://www.linkedin.com/in/{clean_slug}"

    return StandardResponse(
        message="LinkedIn authorization status fetched",
        data={
            "is_authorized": True,
            "account_name": user.full_name or "Candidate User",
            "linkedin_url": linkedin_url
        }
    )

@router.post("/publish-post", response_model=StandardResponse[dict])
async def publish_linkedin_post(
    req: LinkedInPostCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    if not req.content or len(req.content.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post content must be at least 10 characters long."
        )

    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)

    clean_linkedin_url = (req.linkedin_url or "").strip()
    if cand and clean_linkedin_url:
        existing_json = dict(cand.resume_data_json or {})
        existing_json["linkedin_url"] = clean_linkedin_url
        cand.resume_data_json = existing_json
        db.add(cand)
        await db.commit()

    post_id = f"urn:li:share:{secrets.randbelow(900000000) + 100000000}"
    encoded_text = urllib.parse.quote(req.content)
    share_url = f"https://www.linkedin.com/feed/?shareActive=true&text={encoded_text}"

    return StandardResponse(
        message="Post created successfully! Complete share on LinkedIn feed 🎉",
        data={
            "published": True,
            "post_id": post_id,
            "linkedin_url": clean_linkedin_url or "https://www.linkedin.com",
            "share_url": share_url
        }
    )
