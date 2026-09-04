from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.candidates import router as candidates_router
from app.api.v1.job_descriptions import router as jd_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.questions import router as questions_router
from app.api.v1.attempts import router as attempts_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router
from app.api.v1.recordings import router as recordings_router
from app.api.v1.resumes import router as resumes_router
from app.api.v1.leaderboard import router as leaderboard_router
from app.api.v1.study_planner import router as study_planner_router
from app.api.v1.reminders import router as reminders_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(candidates_router)
api_router.include_router(resumes_router)
api_router.include_router(leaderboard_router)
api_router.include_router(study_planner_router)
api_router.include_router(reminders_router)
api_router.include_router(jd_router)
api_router.include_router(interviews_router)
api_router.include_router(questions_router)
api_router.include_router(attempts_router)
api_router.include_router(reports_router)
api_router.include_router(admin_router)
api_router.include_router(recordings_router)
