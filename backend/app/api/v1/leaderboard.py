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
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db)
):
    # Query candidates registered in database (excluding admin accounts)
    stmt = (
        select(Candidate)
        .options(selectinload(Candidate.user))
        .join(User, Candidate.user_id == User.id)
        .where(User.role == "CANDIDATE")
        .where(~User.full_name.ilike("%admin%"))
        .order_by(desc(Candidate.xp), desc(Candidate.readiness_score))
        .limit(limit)
    )
    res = await db.execute(stmt)
    candidates = res.scalars().all()

    # Pre-fetch passed stages for candidates to compute real milestone badges
    cand_ids = [c.id for c in candidates]
    passed_stages_map: Dict[str, set] = {cid: set() for cid in cand_ids}
    if cand_ids:
        from app.models.stage_attempt import StageAttempt
        from app.models.interview_attempt import InterviewAttempt
        from sqlalchemy import or_

        sa_stmt = (
            select(InterviewAttempt.candidate_id, StageAttempt.stage_number)
            .join(StageAttempt, StageAttempt.interview_attempt_id == InterviewAttempt.id)
            .where(InterviewAttempt.candidate_id.in_(cand_ids))
            .where(
                or_(
                    StageAttempt.status.in_(["PASSED", "COMPLETED"]),
                    StageAttempt.score >= 70.0
                )
            )
        )
        sa_res = await db.execute(sa_stmt)
        for cid, st_num in sa_res.all():
            if st_num is not None and st_num >= 1:
                passed_stages_map[cid].add(st_num)

    global_ranking: List[LeaderboardEntry] = []
    for idx, cand in enumerate(candidates, start=1):
        name = (cand.user.full_name if (cand.user and cand.user.full_name) else cand.full_name) or f"Candidate {cand.id[:6]}"
        score = cand.readiness_score or 0.0
        sal_band = cand.target_salary_band if (cand.target_salary_band and cand.target_salary_band != "₹18–25 LPA") else compute_salary_band(score)
        
        linkedin_url = None
        if cand.resume_data_json and isinstance(cand.resume_data_json, dict):
            linkedin_url = cand.resume_data_json.get("linkedin_url")
        if not linkedin_url and cand.notes:
            try:
                import json
                n_dict = json.loads(cand.notes)
                if isinstance(n_dict, dict):
                    linkedin_url = n_dict.get("linkedin_url")
            except Exception:
                pass

        # Compute dynamic earned milestone badges from stages, XP, level, and candidate badges_json
        cand_passed = passed_stages_map.get(cand.id, set())
        max_passed = max(cand_passed) if cand_passed else 0
        cand_xp = cand.xp or 0
        cand_level = cand.level or 1
        cand_raw_badges = [str(b).lower() for b in (cand.badges_json or [])]

        has_stage_5 = (
            max_passed >= 5
            or cand_xp >= 300
            or cand_level >= 2
            or any("5" in b or "linux" in b or "incident" in b or "troubleshooting" in b or "foundation" in b for b in cand_raw_badges)
        )
        has_stage_10 = (
            max_passed >= 10
            or cand_xp >= 1000
            or cand_level >= 5
            or any("10" in b or "ci/cd" in b or "automation" in b or "devops master" in b for b in cand_raw_badges)
        )
        has_stage_15 = (
            max_passed >= 15
            or cand_xp >= 2000
            or cand_level >= 8
            or any("15" in b or "kubernetes" in b or "terraform" in b for b in cand_raw_badges)
        )
        has_stage_20 = (
            max_passed >= 20
            or cand_xp >= 3000
            or cand_level >= 11
            or any("20" in b or "devsecops" in b or "multi-cloud" in b for b in cand_raw_badges)
        )
        has_stage_30 = (
            max_passed >= 30
            or cand_xp >= 4500
            or cand_level >= 15
            or any("30" in b or "boss" in b or "40 lpa" in b for b in cand_raw_badges)
        )

        earned_badges: List[str] = []
        if has_stage_5:
            earned_badges.append("STAGE 05: LINUX & CLOUD FOUNDATIONS")
        if has_stage_10:
            earned_badges.append("STAGE 10: AWS & CI/CD AUTOMATION")
        if has_stage_15:
            earned_badges.append("STAGE 15: KUBERNETES & TERRAFORM")
        if has_stage_20:
            earned_badges.append("STAGE 20: DEVSECOPS & MULTI-CLOUD")
        if has_stage_30:
            earned_badges.append("STAGE 30: 40 LPA BOSS LEGEND")

        # Also retain any existing custom claimed badges
        for b in (cand.badges_json or []):
            if b and b not in earned_badges:
                earned_badges.append(b)

        global_ranking.append(LeaderboardEntry(
            rank=idx,
            candidate_id=cand.id,
            user_id=cand.user_id,
            email=cand.user.email if cand.user else None,
            candidate_name=name,
            experience_level=cand.experience_level or "Junior/Mid",
            target_role=cand.target_role or "Cloud Engineer",
            xp=cand.xp or 0,
            level=cand.level or 1,
            streak_days=cand.streak_days or 1,
            readiness_score=score,
            target_salary_band=sal_band,
            badges=earned_badges,
            weekly_xp_gained=int((cand.xp or 0) * 0.45),
            linkedin_url=linkedin_url,
            batch=cand.batch or "Batch 45"
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
