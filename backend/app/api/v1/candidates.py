from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.candidate_service import CandidateService
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateOut, CandidateWithAttemptsOut
from app.schemas.common import StandardResponse, PaginatedResponse

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=PaginatedResponse[CandidateWithAttemptsOut])
async def list_candidates(
    search: Optional[str] = None,
    role: Optional[str] = None,
    experience_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    cand_svc = CandidateService(db)
    items, total = await cand_svc.list_candidates(
        org_id=user.organization_id,
        search=search,
        role=role,
        experience_level=experience_level,
        page=page,
        size=size
    )
    pages = (total + size - 1) // size if total > 0 else 1
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=pages
    )

@router.get("/me/profile", response_model=StandardResponse[CandidateOut])
async def get_my_profile(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
    if not cand:
        # Auto-create if missing
        cand = await cand_svc.create_candidate(
            CandidateCreate(
                email=user.email,
                full_name=user.full_name,
                target_role="Senior DevOps Engineer"
            ),
            user.organization_id
        )
    return StandardResponse(data=CandidateOut.model_validate(cand))

@router.put("/me/profile", response_model=StandardResponse[CandidateOut])
async def update_my_profile(
    cand_update: CandidateUpdate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    if cand_update.phone is not None: cand.phone = cand_update.phone
    if cand_update.target_role is not None: cand.target_role = cand_update.target_role
    if cand_update.experience_level is not None: cand.experience_level = cand_update.experience_level
    if cand_update.target_salary_band is not None: cand.target_salary_band = cand_update.target_salary_band
    if cand_update.course is not None: cand.course = cand_update.course
    if cand_update.batch is not None: cand.batch = cand_update.batch
    if cand_update.notes is not None: cand.notes = cand_update.notes

    await db.flush()
    return StandardResponse(message="Profile updated successfully", data=CandidateOut.model_validate(cand))

@router.post("/me/verify-otp", response_model=StandardResponse[CandidateOut])
async def verify_otp(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    badges = list(cand.badges_json or [])
    if "Verified Candidate" not in badges:
        badges.append("Verified Candidate")
        cand.badges_json = badges
        cand.xp = (cand.xp or 0) + 50 # Bonus 50 XP on verification
        cand.level = max(1, 1 + cand.xp // 300)

    await db.flush()
    return StandardResponse(message="Mobile verified! +50 XP and 'Verified Candidate' badge awarded!", data=CandidateOut.model_validate(cand))

@router.get("/{candidate_id}", response_model=StandardResponse[CandidateOut])
async def get_candidate(
    candidate_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_id(candidate_id, user.organization_id)
    return StandardResponse(
        data=CandidateOut.model_validate(cand)
    )

@router.post("", response_model=StandardResponse[CandidateOut], status_code=status.HTTP_201_CREATED)
async def create_candidate(
    cand_in: CandidateCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    cand_svc = CandidateService(db)
    cand = await cand_svc.create_candidate(cand_in, user.organization_id)
    return StandardResponse(
        message="Candidate created successfully",
        data=CandidateOut.model_validate(cand)
    )
