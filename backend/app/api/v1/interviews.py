from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.interview_service import InterviewService
from app.models.interview_stage import InterviewStage
from app.models.interview_template import InterviewTemplate
from app.schemas.interview import TemplateCreate, TemplateAdminOut, TemplateCandidateOut, StageUpdate, StageCreate
from app.schemas.common import StandardResponse

router = APIRouter(prefix="/interviews", tags=["Interviews & Templates"])

@router.get("/stages", response_model=StandardResponse[List[dict]])
async def get_candidate_stages(
    payload: Optional[dict] = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(InterviewStage)
        .options(selectinload(InterviewStage.questions))
        .order_by(InterviewStage.stage_number)
    )
    res = await db.execute(stmt)
    stages = res.scalars().all()
    
    data = []
    for s in stages:
        active_q = [q for q in (s.questions or []) if q.is_active != "INACTIVE"]
        lvl_num = 1 if s.stage_number <= 5 else (2 if s.stage_number <= 10 else (3 if s.stage_number <= 15 else (4 if s.stage_number <= 20 else "Bonus")))
        lvl_name = getattr(s, "level_name", None) or (f"Level {lvl_num}: Foundation" if lvl_num == 1 else (f"Level {lvl_num}: Cloud" if lvl_num == 2 else (f"Level {lvl_num}: DevOps" if lvl_num == 3 else (f"Level {lvl_num}: Advanced" if lvl_num == 4 else "Bonus Challenge"))))
        
        data.append({
            "id": s.stage_number,
            "stage_id": s.id,
            "level": f"Level {lvl_num}",
            "levelName": lvl_name,
            "title": s.title,
            "description": s.description or "",
            "category": s.category or "General",
            "difficulty": s.difficulty or "Medium",
            "xp_reward": s.xp_reward or "+200 XP",
            "duration": s.duration or "20 Mins",
            "icon": s.icon or "🏆",
            "questions_count": len(active_q),
            "minimum_score": s.minimum_score or 80.0,
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "difficulty": q.difficulty,
                    "skill_category": q.skill_category
                } for q in active_q
            ]
        })
    return StandardResponse(data=data)

@router.put("/stages/{stage_id}", response_model=StandardResponse[dict])
async def update_stage(
    stage_id: str,
    s_in: StageUpdate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(InterviewStage).where(InterviewStage.id == stage_id)
    res = await db.execute(stmt)
    stage = res.scalar_one_or_none()

    if not stage:
        # Fallback search by stage_number
        num_str = stage_id.replace("stage-new-", "").replace("stage-", "")
        if num_str.isdigit():
            stmt = select(InterviewStage).where(InterviewStage.stage_number == int(num_str))
            res = await db.execute(stmt)
            stage = res.scalar_one_or_none()

    if not stage:
        # Get active default template to attach newly created custom stage
        t_stmt = select(InterviewTemplate).limit(1)
        t_res = await db.execute(t_stmt)
        template = t_res.scalar_one_or_none()
        if template:
            max_num_stmt = select(InterviewStage.stage_number).order_by(InterviewStage.stage_number.desc()).limit(1)
            max_res = await db.execute(max_num_stmt)
            last_num = max_res.scalar_one_or_none() or 0
            
            stage = InterviewStage(
                interview_template_id=template.id,
                stage_number=last_num + 1,
                title=s_in.title or f"Stage {last_num + 1}: Custom Stage",
                category=s_in.category or "Foundation",
                description=s_in.description or "",
                difficulty=s_in.difficulty or "Medium",
                xp_reward=s_in.xp_reward or "+200 XP",
                duration=s_in.duration or "20 Mins",
                icon=s_in.icon or "🏆",
                minimum_score=s_in.minimum_score or 80.0
            )
            db.add(stage)
            await db.flush()

    if not stage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview stage not found")

    update_data = s_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if hasattr(stage, field) and val is not None:
            setattr(stage, field, val)

    await db.commit()
    await db.refresh(stage)
    return StandardResponse(
        message="Interview stage updated successfully in database",
        data={
            "id": stage.id,
            "stage_number": stage.stage_number,
            "title": stage.title,
            "description": stage.description,
            "category": stage.category,
            "difficulty": stage.difficulty,
            "xp_reward": stage.xp_reward,
            "duration": stage.duration,
            "icon": stage.icon,
            "minimum_score": stage.minimum_score
        }
    )

@router.post("/stages", response_model=StandardResponse[dict], status_code=status.HTTP_201_CREATED)
async def create_stage(
    s_in: StageCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    t_stmt = select(InterviewTemplate).limit(1)
    t_res = await db.execute(t_stmt)
    template = t_res.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="No active interview template found")

    stage = InterviewStage(
        interview_template_id=template.id,
        stage_number=s_in.stage_number,
        title=s_in.title,
        description=s_in.description,
        category=s_in.category,
        minimum_score=s_in.minimum_score,
        unlock_rule=s_in.unlock_rule,
        difficulty=s_in.difficulty,
        xp_reward=s_in.xp_reward,
        duration=s_in.duration,
        icon=s_in.icon
    )
    db.add(stage)
    await db.commit()
    await db.refresh(stage)
    return StandardResponse(
        message="Interview stage created successfully in database",
        data={
            "id": stage.id,
            "stage_number": stage.stage_number,
            "title": stage.title,
            "description": stage.description,
            "category": stage.category,
            "difficulty": stage.difficulty,
            "xp_reward": stage.xp_reward,
            "duration": stage.duration,
            "icon": stage.icon,
            "minimum_score": stage.minimum_score
        }
    )

@router.get("/templates", response_model=StandardResponse[List[TemplateAdminOut]])
async def list_templates(
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    templates = await interview_svc.list_templates(user.organization_id)
    return StandardResponse(
        data=[TemplateAdminOut.model_validate(t) for t in templates]
    )

@router.get("/templates/{template_id}", response_model=StandardResponse[TemplateAdminOut])
async def get_template(
    template_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    template = await interview_svc.get_template_by_id(template_id, user.organization_id)
    return StandardResponse(
        data=TemplateAdminOut.model_validate(template)
    )

@router.post("/templates", response_model=StandardResponse[TemplateAdminOut], status_code=status.HTTP_201_CREATED)
async def create_template(
    t_in: TemplateCreate,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    template = await interview_svc.create_template(t_in, user.organization_id, user.id)
    return StandardResponse(
        message="Interview template created successfully",
        data=TemplateAdminOut.model_validate(template)
    )

