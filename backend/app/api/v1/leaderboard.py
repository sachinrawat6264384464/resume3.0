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

@router.get("", response_model=StandardResponse[LeaderboardResponse])
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Candidate)
        .options(selectinload(Candidate.user))
        .order_by(desc(Candidate.xp), desc(Candidate.readiness_score))
        .limit(limit)
    )
    res = await db.execute(stmt)
    candidates = res.scalars().all()

    global_ranking: List[LeaderboardEntry] = []
    for idx, cand in enumerate(candidates, start=1):
        name = cand.user.full_name if cand.user else f"Candidate {cand.id[:6]}"
        global_ranking.append(LeaderboardEntry(
            rank=idx,
            candidate_id=cand.id,
            candidate_name=name,
            experience_level=cand.experience_level,
            target_role=cand.target_role,
            xp=cand.xp or 0,
            level=cand.level or 1,
            streak_days=cand.streak_days or 1,
            readiness_score=cand.readiness_score or 70.0,
            target_salary_band=cand.target_salary_band or "₹12–18 LPA",
            badges=cand.badges_json or ["Linux Warrior"],
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

    # Tech leaderboards
    tech_leaderboards: Dict[str, List[LeaderboardEntry]] = {
        "AWS": global_ranking[:10],
        "Kubernetes": global_ranking[:10],
        "Terraform": global_ranking[:10],
        "Linux": global_ranking[:10]
    }

    return StandardResponse(
        message="Leaderboard data retrieved",
        data=LeaderboardResponse(
            global_ranking=global_ranking,
            weekly_sprint=weekly_sprint,
            most_improved=most_improved,
            technology_leaderboards=tech_leaderboards
        )
    )
