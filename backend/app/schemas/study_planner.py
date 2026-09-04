from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class StudyTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "DevOps & Cloud"
    skill: Optional[str] = "General CloudOps"
    difficulty: Optional[str] = "INTERMEDIATE" # BEGINNER, INTERMEDIATE, ADVANCED
    priority: Optional[str] = "MEDIUM" # LOW, MEDIUM, HIGH
    scheduled_date: datetime
    start_time: Optional[str] = "09:00 AM"
    duration_minutes: Optional[int] = 60
    xp_reward: Optional[int] = 50
    roadmap_stage_id: Optional[int] = None
    interview_stage_id: Optional[int] = None

class StudyTaskCreate(StudyTaskBase):
    study_plan_id: Optional[str] = None

class StudyTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    skill: Optional[str] = None
    difficulty: Optional[str] = None
    priority: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None # TODO, IN_PROGRESS, COMPLETED, SKIPPED, OVERDUE
    xp_reward: Optional[int] = None
    roadmap_stage_id: Optional[int] = None
    interview_stage_id: Optional[int] = None

class StudyTaskOut(StudyTaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    candidate_id: str
    study_plan_id: Optional[str] = None
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class StudyGoalBase(BaseModel):
    target_role: Optional[str] = "Senior DevOps Engineer"
    target_date: Optional[datetime] = None
    weekly_hours: Optional[int] = 15
    target_score: Optional[float] = 85.0
    weekly_task_target: Optional[int] = 10

class StudyGoalCreate(StudyGoalBase):
    pass

class StudyGoalOut(StudyGoalBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    candidate_id: str
    created_at: datetime
    updated_at: datetime

class StudySummaryOut(BaseModel):
    todays_tasks_count: int
    completed_tasks_count: int
    weekly_study_hours: float
    current_streak: int
    pending_tasks_count: int
    weekly_completion_pct: float

class WeeklyAnalyticsOut(BaseModel):
    planned_hours: float
    completed_hours: float
    remaining_hours: float
    completion_pct: float
    streak_days: int
    tasks_per_day: List[dict]
    skill_distribution: List[dict]

class AIPlanRequest(BaseModel):
    target_role: Optional[str] = None
    target_date: Optional[datetime] = None
    available_weekly_hours: Optional[int] = 15
    focus_areas: Optional[List[str]] = None
