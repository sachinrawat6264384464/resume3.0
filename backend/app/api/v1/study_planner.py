from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.candidate_service import CandidateService
from app.services.study_planner_service import StudyPlannerService
from app.schemas.study_planner import (
    StudyTaskCreate, StudyTaskUpdate, StudyTaskOut,
    StudyGoalCreate, StudyGoalOut, StudySummaryOut,
    WeeklyAnalyticsOut, AIPlanRequest
)
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/study-planner", tags=["Study Planner"])

async def get_current_candidate_id(payload: dict = Depends(verify_auth_token), db: AsyncSession = Depends(get_db)) -> str:
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    cand_svc = CandidateService(db)
    cand = await cand_svc.get_candidate_by_user_id(user.id, user.organization_id)
    return cand.id

@router.get("/summary", response_model=StandardResponse[StudySummaryOut])
async def get_summary(candidate_id: str = Depends(get_current_candidate_id), db: AsyncSession = Depends(get_db)):
    svc = StudyPlannerService(db)
    summary = await svc.get_summary(candidate_id)
    return StandardResponse(data=StudySummaryOut(**summary))

@router.get("/tasks", response_model=StandardResponse[List[StudyTaskOut]])
async def get_tasks(
    status: Optional[str] = None,
    view_mode: Optional[str] = None, # today, this_week
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    tasks = await svc.get_tasks(candidate_id, status=status, view_mode=view_mode, date_from=date_from, date_to=date_to)
    return StandardResponse(data=[StudyTaskOut.model_validate(t) for t in tasks])

@router.post("/tasks", response_model=StandardResponse[StudyTaskOut], status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: StudyTaskCreate,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    task = await svc.create_task(candidate_id, task_in)
    return StandardResponse(
        message="Study task created successfully in database",
        data=StudyTaskOut.model_validate(task)
    )

@router.patch("/tasks/{task_id}", response_model=StandardResponse[StudyTaskOut])
async def update_task(
    task_id: str,
    task_in: StudyTaskUpdate,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    task = await svc.update_task(candidate_id, task_id, task_in)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study task not found")
    return StandardResponse(
        message="Study task updated successfully in database",
        data=StudyTaskOut.model_validate(task)
    )

@router.delete("/tasks/{task_id}", response_model=StandardResponse[dict])
async def delete_task(
    task_id: str,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    success = await svc.delete_task(candidate_id, task_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study task not found")
    return StandardResponse(message="Study task deleted from database successfully", data={"deleted": True})

@router.post("/tasks/{task_id}/complete", response_model=StandardResponse[StudyTaskOut])
async def complete_task(
    task_id: str,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    task = await svc.complete_task(candidate_id, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study task not found")
    return StandardResponse(
        message=f"Task completed! +{task.xp_reward} XP awarded to candidate in database.",
        data=StudyTaskOut.model_validate(task)
    )

@router.get("/weekly-summary", response_model=StandardResponse[WeeklyAnalyticsOut])
async def get_weekly_summary(candidate_id: str = Depends(get_current_candidate_id), db: AsyncSession = Depends(get_db)):
    svc = StudyPlannerService(db)
    analytics = await svc.get_weekly_analytics(candidate_id)
    return StandardResponse(data=WeeklyAnalyticsOut(**analytics))

@router.get("/goals", response_model=StandardResponse[StudyGoalOut])
async def get_goals(candidate_id: str = Depends(get_current_candidate_id), db: AsyncSession = Depends(get_db)):
    svc = StudyPlannerService(db)
    goal = await svc.get_or_create_goal(candidate_id)
    return StandardResponse(data=StudyGoalOut.model_validate(goal))

@router.put("/goals", response_model=StandardResponse[StudyGoalOut])
async def update_goals(
    goal_in: StudyGoalCreate,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    goal = await svc.update_goal(candidate_id, goal_in)
    return StandardResponse(
        message="Candidate preparation goals saved to database",
        data=StudyGoalOut.model_validate(goal)
    )

@router.post("/generate-ai-plan", response_model=StandardResponse[List[StudyTaskOut]])
async def generate_ai_plan(
    req: AIPlanRequest,
    candidate_id: str = Depends(get_current_candidate_id),
    db: AsyncSession = Depends(get_db)
):
    svc = StudyPlannerService(db)
    tasks = await svc.generate_ai_plan(candidate_id, req)
    return StandardResponse(
        message="Personalized AI preparation plan generated and saved to PostgreSQL database",
        data=[StudyTaskOut.model_validate(t) for t in tasks]
    )
