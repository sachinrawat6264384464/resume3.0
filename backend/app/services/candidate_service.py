from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.candidate import Candidate
from app.models.user import User, UserRole
from app.models.interview_attempt import InterviewAttempt
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidateOut, CandidateWithAttemptsOut
from app.core.security import get_password_hash

class CandidateService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_candidates(
        self,
        org_id: str,
        search: Optional[str] = None,
        role: Optional[str] = None,
        experience_level: Optional[str] = None,
        page: int = 1,
        size: int = 20
    ) -> Tuple[List[CandidateWithAttemptsOut], int]:
        query = (
            select(Candidate)
            .join(User, Candidate.user_id == User.id)
            .where(Candidate.organization_id == org_id)
            .options(selectinload(Candidate.user), selectinload(Candidate.attempts))
        )

        if search:
            search_filter = f"%{search.lower()}%"
            query = query.where(
                (func.lower(User.full_name).like(search_filter)) |
                (func.lower(User.email).like(search_filter)) |
                (func.lower(Candidate.student_id).like(search_filter))
            )

        if role:
            query = query.where(Candidate.target_role == role)

        if experience_level:
            query = query.where(Candidate.experience_level == experience_level)

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        # Paginate
        query = query.order_by(desc(Candidate.created_at)).offset((page - 1) * size).limit(size)
        result = await self.db.execute(query)
        candidates = result.scalars().all()

        output = []
        for cand in candidates:
            attempts = cand.attempts or []
            total_attempts = len(attempts)
            passed = sum(1 for a in attempts if a.decision == "PASS")
            latest_attempt = sorted(attempts, key=lambda a: a.created_at, reverse=True)[0] if attempts else None
            
            output.append(CandidateWithAttemptsOut(
                id=cand.id,
                user_id=cand.user_id,
                organization_id=cand.organization_id,
                student_id=cand.student_id,
                phone=cand.phone,
                course=cand.course,
                batch=cand.batch,
                experience_level=cand.experience_level,
                target_role=cand.target_role,
                notes=cand.notes,
                user=cand.user,
                total_attempts=total_attempts,
                passed_interviews=passed,
                latest_score=latest_attempt.overall_score if latest_attempt else None,
                latest_status=latest_attempt.status if latest_attempt else None,
                created_at=cand.created_at,
                updated_at=cand.updated_at
            ))

        return output, total

    async def get_candidate_by_id(self, candidate_id: str, org_id: str) -> Candidate:
        stmt = (
            select(Candidate)
            .where(Candidate.id == candidate_id, Candidate.organization_id == org_id)
            .options(selectinload(Candidate.user), selectinload(Candidate.attempts))
        )
        result = await self.db.execute(stmt)
        cand = result.scalar_one_or_none()
        if not cand:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
        return cand

    async def create_candidate(self, cand_in: CandidateCreate, org_id: str) -> Candidate:
        # Check if email exists
        stmt = select(User).where(User.email == cand_in.email)
        res = await self.db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(
            email=cand_in.email,
            full_name=cand_in.full_name,
            hashed_password=get_password_hash(cand_in.password) if cand_in.password else None,
            role=UserRole.CANDIDATE.value,
            organization_id=org_id,
            is_active=True
        )
        self.db.add(user)
        await self.db.flush()

        candidate = Candidate(
            user_id=user.id,
            organization_id=org_id,
            student_id=cand_in.student_id,
            phone=cand_in.phone,
            course=cand_in.course,
            batch=cand_in.batch,
            experience_level=cand_in.experience_level,
            target_role=cand_in.target_role,
            notes=cand_in.notes,
            xp=cand_in.xp or 120,
            level=cand_in.level or 1,
            streak_days=cand_in.streak_days or 1,
            readiness_score=cand_in.readiness_score or 70.0,
            target_salary_band=cand_in.target_salary_band or "₹12–18 LPA",
            skills_matrix_json=cand_in.skills_matrix_json or {
                "Linux": 85, "AWS": 80, "Docker": 75, "Kubernetes": 70, "Terraform": 65, "DevSecOps": 50, "AI": 40
            },
            badges_json=cand_in.badges_json or ["Linux Warrior", "Cloud Explorer"]
        )
        self.db.add(candidate)
        await self.db.flush()
        return candidate

    async def get_candidate_by_user_id(self, user_id: str, org_id: str) -> Optional[Candidate]:
        stmt = (
            select(Candidate)
            .where(Candidate.user_id == user_id, Candidate.organization_id == org_id)
            .options(selectinload(Candidate.user), selectinload(Candidate.attempts))
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def award_xp(self, candidate_id: str, xp_amount: int) -> Candidate:
        stmt = select(Candidate).where(Candidate.id == candidate_id)
        res = await self.db.execute(stmt)
        cand = res.scalar_one_or_none()
        if not cand:
            return None
        
        cand.xp = (cand.xp or 0) + xp_amount
        # Calculate level: Level 1 = 0-200, Level 2 = 201-500, Level 3 = 501-1000, etc.
        cand.level = max(1, 1 + cand.xp // 300)
        
        # Recalculate readiness target band
        if cand.readiness_score >= 85:
            cand.target_salary_band = "₹25–40 LPA"
        elif cand.readiness_score >= 75:
            cand.target_salary_band = "₹18–25 LPA"
        else:
            cand.target_salary_band = "₹12–18 LPA"

        await self.db.flush()
        return cand

    async def update_ats_profile(self, candidate_id: str, ats_score: float, profile_data: dict) -> Candidate:
        stmt = select(Candidate).where(Candidate.id == candidate_id)
        res = await self.db.execute(stmt)
        cand = res.scalar_one_or_none()
        if not cand:
            return None
        
        cand.latest_ats_score = ats_score
        cand.resume_data_json = profile_data
        
        # Boost readiness score based on ATS score
        if ats_score > 0:
            cand.readiness_score = round(max(cand.readiness_score, (cand.readiness_score * 0.6 + ats_score * 0.4)), 1)
        
        await self.db.flush()
        return cand
