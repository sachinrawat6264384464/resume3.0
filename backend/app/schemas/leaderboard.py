from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.schemas.common import BaseSchema

class LeaderboardEntry(BaseSchema):
    rank: int
    candidate_id: str
    candidate_name: str
    experience_level: str = "MID"
    target_role: str = "CloudOps Engineer"
    xp: int
    level: int
    streak_days: int
    readiness_score: float
    target_salary_band: str = "₹12–18 LPA"
    badges: List[str] = []
    weekly_xp_gained: Optional[int] = 0

class LeaderboardResponse(BaseSchema):
    global_ranking: List[LeaderboardEntry]
    weekly_sprint: List[LeaderboardEntry]
    most_improved: List[LeaderboardEntry]
    technology_leaderboards: Dict[str, List[LeaderboardEntry]]
