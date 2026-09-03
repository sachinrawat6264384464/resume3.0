from fastapi import APIRouter, Depends, UploadFile, File, Form, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.core.security import verify_auth_token
from app.services.auth_service import AuthService
from app.services.interview_service import InterviewService
from app.services.evaluation_service import EvaluationService
from app.services.stage_service import StageService
from app.schemas.attempt import (
    StartInterviewRequest, InterviewAttemptOut, SubmitAnswerRequest,
    StageEvaluationResponse
)
from app.schemas.evaluation import QuestionEvaluationResult
from app.schemas.common import StandardResponse
from app.schemas.interview import TemplateCreate
from app.models.candidate import Candidate
from app.models.interview_template import InterviewTemplate
from app.models.interview_stage import InterviewStage
from app.models.question import Question
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/attempts", tags=["Interview Attempts & Live Session"])

@router.post("/start", response_model=StandardResponse[InterviewAttemptOut], status_code=status.HTTP_201_CREATED)
async def start_attempt(
    req: StartInterviewRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)

    candidate_id = req.candidate_id
    if not candidate_id:
        cand_stmt = select(Candidate).where(Candidate.user_id == user.id)
        cand_res = await db.execute(cand_stmt)
        cand = cand_res.scalar_one_or_none()
        if cand:
            candidate_id = cand.id
        else:
            cand = Candidate(
                user_id=user.id,
                organization_id=user.organization_id,
                target_role="CloudOps Engineer"
            )
            db.add(cand)
            await db.flush()
            candidate_id = cand.id

    interview_svc = InterviewService(db)
    
    # Check if requested template exists or seed default 5-stage assessment template
    template_id = req.interview_template_id
    stmt_tmpl = select(InterviewTemplate).where(
        InterviewTemplate.organization_id == user.organization_id
    ).options(selectinload(InterviewTemplate.stages))
    
    res_tmpl = await db.execute(stmt_tmpl)
    existing_tmpl = res_tmpl.scalars().first()

    if not existing_tmpl:
        # Create default 5-stage assessment template with questions
        t_create = TemplateCreate(
            title="CloudOps Gatekeeper Assessment Pipeline",
            target_role="Senior Cloud & DevOps Engineer",
            passing_score=80.0,
            stages=[]
        )
        existing_tmpl = await interview_svc.create_template(t_create, user.organization_id, user.id)

        # Seed 5 stages with 10 questions in Stage 1
        stages_def = [
            ("Profile & Career Pitch", "Fundamentals", 1, [
                ("Demonstrate your background in CloudOps engineering. Explain how you automate AWS infrastructure deployments using Terraform and CI/CD pipelines.", "CONCEPTUAL", ["terraform", "aws", "ci/cd"]),
                ("Walk us through your Linux system troubleshooting methodology when a production server exhibits high memory utilization or kernel panic errors.", "TROUBLESHOOTING", ["linux", "memory", "kernel"]),
                ("How do you configure high availability and multi-region failover across AWS EC2, S3, and RDS database clusters?", "PRACTICAL", ["aws", "high availability", "rds"]),
                ("Explain IAM security best practices when configuring service accounts and IRSA for Kubernetes workloads.", "CONCEPTUAL", ["iam", "irsa", "kubernetes"]),
                ("How do you manage secrets and environment variables securely in Docker containerized microservice deployments?", "PRACTICAL", ["docker", "secrets", "security"]),
                ("Describe how you monitor microservice health telemetry using Prometheus metrics and Grafana dashboards.", "CONCEPTUAL", ["prometheus", "grafana", "monitoring"]),
                ("Explain how you handle a database connection pool exhaustion incident under sudden user traffic spikes.", "TROUBLESHOOTING", ["database", "connection pool", "scaling"]),
                ("How do you perform zero-downtime rolling deployments and canary rollouts using Kubernetes deployment strategies?", "PRACTICAL", ["kubernetes", "rolling update", "canary"]),
                ("Explain how you configure cloud cost alerts and anomaly detection to prevent unexpected AWS cloud bill spikes.", "CONCEPTUAL", ["aws", "finops", "cost"]),
                ("Describe a critical production outage incident you resolved under tight SLA pressure and the post-mortem steps you took.", "TROUBLESHOOTING", ["outage", "post-mortem", "sla"])
            ]),
            ("Linux Systems Warrior", "Linux OS", 2, [
                ("Explain how systemd manages background service processes and how you triage a crashing daemon using journalctl and systemctl.", "TROUBLESHOOTING", ["systemd", "journalctl", "linux"]),
                ("How do you identify high I/O wait on a Linux storage volume using iostat, iotop, and lsof?", "PRACTICAL", ["iostat", "iotop", "linux"])
            ]),
            ("Multi-Cloud Architecture", "AWS & Architecture", 3, [
                ("Describe your approach to designing a secure multi-region AWS VPC peering topology with zero-trust network ACLs.", "PRACTICAL", ["vpc", "aws", "networking"]),
                ("How do you optimize cloud expenditure using AWS Savings Plans, Reserved Instances, and S3 lifecycle rules?", "CONCEPTUAL", ["finops", "aws", "cost"])
            ]),
            ("DevOps & Containers", "Kubernetes & Docker", 4, [
                ("Explain the step-by-step triage workflow when an EKS Kubernetes pod enters CrashLoopBackOff due to an OOMKilled exception.", "TROUBLESHOOTING", ["kubernetes", "oomkilled", "docker"]),
                ("How do you construct an optimized multi-stage Dockerfile for a Node/Python microservice to minimize image size?", "PRACTICAL", ["docker", "multi-stage", "containers"])
            ]),
            ("Production Incident Boss Battle", "Outage Triage", 5, [
                ("Live Incident Battle: A 502 Bad Gateway alert triggers across all ingress nodes. Walk through your first 5 minutes of outage triage.", "TROUBLESHOOTING", ["502 bad gateway", "outage", "ingress"])
            ])
        ]

        for s_title, s_cat, s_num, q_list in stages_def:
            stage = InterviewStage(
                interview_template_id=existing_tmpl.id,
                stage_number=s_num,
                title=s_title,
                category=s_cat,
                minimum_score=80.0
            )
            db.add(stage)
            await db.flush()

            for q_idx, (q_text, q_type, q_topics) in enumerate(q_list, 1):
                q_obj = Question(
                    interview_stage_id=stage.id,
                    order_index=q_idx,
                    question_text=q_text,
                    question_type=q_type,
                    difficulty="INTERMEDIATE",
                    skill_category=s_cat,
                    expected_topics=q_topics
                )
                db.add(q_obj)
            await db.flush()

    template_id = existing_tmpl.id

    attempt = await interview_svc.start_interview_attempt(
        template_id=template_id,
        candidate_id=candidate_id,
        org_id=user.organization_id
    )

    full_attempt = await interview_svc.get_attempt_details(attempt.id)
    return StandardResponse(
        message="Interview attempt started successfully",
        data=InterviewAttemptOut.model_validate(full_attempt)
    )

@router.get("/{attempt_id}", response_model=StandardResponse[InterviewAttemptOut])
async def get_attempt(
    attempt_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    auth_svc = AuthService(db)
    user = await auth_svc.get_current_user_from_payload(payload)
    
    interview_svc = InterviewService(db)
    attempt = await interview_svc.get_attempt_details(attempt_id, user.organization_id)
    return StandardResponse(
        data=InterviewAttemptOut.model_validate(attempt)
    )

@router.post("/{attempt_id}/questions/{q_attempt_id}/submit-json", response_model=StandardResponse[QuestionEvaluationResult])
async def submit_question_json(
    attempt_id: str,
    q_attempt_id: str,
    req: SubmitAnswerRequest,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    eval_svc = EvaluationService(db)
    eval_result = await eval_svc.submit_and_evaluate_question(
        question_attempt_id=q_attempt_id,
        transcript=req.transcript,
        duration_seconds=req.duration_seconds
    )
    return StandardResponse(
        message="Answer evaluated successfully",
        data=eval_result
    )

@router.post("/{attempt_id}/questions/{q_attempt_id}/submit-recording", response_model=StandardResponse[QuestionEvaluationResult])
async def submit_question_recording(
    attempt_id: str,
    q_attempt_id: str,
    transcript: Optional[str] = Form(None),
    duration_seconds: float = Form(0.0),
    recording_file: Optional[UploadFile] = File(None),
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    file_bytes = None
    file_name = None
    mime_type = "video/webm"
    if recording_file:
        file_bytes = await recording_file.read()
        file_name = recording_file.filename or f"answer_{q_attempt_id}.webm"
        mime_type = recording_file.content_type or "video/webm"

    eval_svc = EvaluationService(db)
    eval_result = await eval_svc.submit_and_evaluate_question(
        question_attempt_id=q_attempt_id,
        transcript=transcript,
        duration_seconds=duration_seconds,
        recording_bytes=file_bytes,
        file_name=file_name,
        mime_type=mime_type
    )
    return StandardResponse(
        message="Recording processed and answer evaluated successfully",
        data=eval_result
    )

@router.post("/{attempt_id}/stages/{s_attempt_id}/evaluate-and-advance", response_model=StandardResponse[StageEvaluationResponse])
async def evaluate_stage(
    attempt_id: str,
    s_attempt_id: str,
    payload: dict = Depends(verify_auth_token),
    db: AsyncSession = Depends(get_db)
):
    stage_svc = StageService(db)
    resp = await stage_svc.evaluate_and_advance_stage(s_attempt_id)
    return StandardResponse(
        message="Stage evaluated",
        data=resp
    )
