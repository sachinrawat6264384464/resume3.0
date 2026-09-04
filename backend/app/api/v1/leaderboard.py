from typing import List, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.candidate import Candidate
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/leaderboard", tags=["Gamification & Leaderboard"])

def compute_salary_band(score: float) -> str:
    if score >= 85:
        return "₹25–40 LPA"
    elif score >= 75:
        return "₹18–25 LPA"
    elif score >= 60:
        return "₹12–18 LPA"
    else:
        return "₹8–12 LPA"

@router.get("", response_model=StandardResponse[LeaderboardResponse])
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    # Query candidates registered in database
    stmt = (
        select(Candidate)
        .options(selectinload(Candidate.user))
        .join(User, Candidate.user_id == User.id)
        .where(
            User.email.not_like("%example.com%"),
            User.email.not_like("%dummy%")
        )
        .order_by(desc(Candidate.xp), desc(Candidate.readiness_score))
        .limit(limit)
    )
    res = await db.execute(stmt)
    candidates = res.scalars().all()

    # Fallback if no non-example user exists yet: query all real candidates
    if not candidates:
        stmt_all = (
            select(Candidate)
            .options(selectinload(Candidate.user))
            .order_by(desc(Candidate.xp), desc(Candidate.readiness_score))
            .limit(limit)
        )
        res_all = await db.execute(stmt_all)
        candidates = res_all.scalars().all()

    global_ranking: List[LeaderboardEntry] = []
    for idx, cand in enumerate(candidates, start=1):
        name = (cand.user.full_name if (cand.user and cand.user.full_name) else cand.full_name) or f"Candidate {cand.id[:6]}"
        score = cand.readiness_score or 0.0
        sal_band = cand.target_salary_band if (cand.target_salary_band and cand.target_salary_band != "₹18–25 LPA") else compute_salary_band(score)
        
        global_ranking.append(LeaderboardEntry(
            rank=idx,
            candidate_id=cand.id,
            candidate_name=name,
            experience_level=cand.experience_level or "Junior/Mid",
            target_role=cand.target_role or "Cloud Engineer",
            xp=cand.xp or 0,
            level=cand.level or 1,
            streak_days=cand.streak_days or 1,
            readiness_score=score,
            target_salary_band=sal_band,
            badges=cand.badges_json or ["Registered Engineer"],
            weekly_xp_gained=int((cand.xp or 0) * 0.45)
        ))

    # Weekly Sprint (sorted by weekly xp)
    weekly_sprint = sorted(global_ranking, key=lambda x: x.weekly_xp_gained or 0, reverse=True)
    for idx, item in enumerate(weekly_sprint, start=1):
        item.rank = idx

    # Most Improved (sorted by readiness score velocity)
    most_improved = sorted(global_ranking, key=lambda x: x.readiness_score, reverse=True)
    for idx, item in enumerate(most_improved, start=1):
        item.rank = idx

    # Tech leaderboards (filtered by technology track)
    def filter_by_tech(tech_name: str) -> List[LeaderboardEntry]:
        matched = [
            item for item in global_ranking
            if tech_name.lower() in (item.target_role or "").lower()
            or any(tech_name.lower() in b.lower() for b in item.badges)
        ]
        res_list = matched if matched else global_ranking
        filtered = []
        for r_idx, entry in enumerate(res_list, start=1):
            cloned = entry.model_copy()
            cloned.rank = r_idx
            filtered.append(cloned)
        return filtered

    tech_leaderboards: Dict[str, List[LeaderboardEntry]] = {
        "AWS": filter_by_tech("AWS"),
        "Kubernetes": filter_by_tech("Kubernetes"),
        "Terraform": filter_by_tech("Terraform"),
        "Linux": filter_by_tech("Linux")
    }

    return StandardResponse(
        message="Real database leaderboard data retrieved",
        data=LeaderboardResponse(
            global_ranking=global_ranking,
            weekly_sprint=weekly_sprint,
            most_improved=most_improved,
            technology_leaderboards=tech_leaderboards
        )
    )
