from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from fastapi import HTTPException, status
from app.models.job_description import JobDescription
from app.models.interview_template import InterviewTemplate
from app.models.interview_stage import InterviewStage
from app.models.question import Question
from app.schemas.job_description import JobDescriptionCreate, JDAnalyzeRequest, JDAnalyzeResponse
from app.ai import get_ai_provider

class JobDescriptionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai = get_ai_provider()

    async def analyze_and_extract(self, req: JDAnalyzeRequest) -> JDAnalyzeResponse:
        data = await self.ai.analyze_job_description(
            title=req.title,
            raw_description=req.raw_description,
            experience_level=req.experience_level or "MID"
        )
        return JDAnalyzeResponse(
            title=data.get("title", req.title),
            target_role=data.get("target_role", req.target_role or "CloudOps Engineer"),
            experience_level=data.get("experience_level", req.experience_level or "MID"),
            skills=data.get("skills", []),
            technologies=data.get("technologies", []),
            responsibilities=data.get("responsibilities", []),
            suggested_stages=data.get("suggested_stages", [])
        )

    async def create_job_description(self, jd_in: JobDescriptionCreate, org_id: str, user_id: Optional[str] = None) -> JobDescription:
        # If skills/technologies are empty, auto-extract
        if not jd_in.skills_json or not jd_in.technologies_json:
            extracted = await self.ai.analyze_job_description(
                title=jd_in.title,
                raw_description=jd_in.raw_description,
                experience_level=jd_in.experience_level
            )
            skills = extracted.get("skills", ["Linux", "Cloud", "Containers", "DevOps"])
            technologies = extracted.get("technologies", ["AWS", "Kubernetes", "Docker", "Terraform"])
            responsibilities = extracted.get("responsibilities", [])
        else:
            skills = jd_in.skills_json
            technologies = jd_in.technologies_json
            responsibilities = jd_in.responsibilities_json

        jd = JobDescription(
            organization_id=org_id,
            title=jd_in.title,
            raw_description=jd_in.raw_description,
            skills_json=skills,
            technologies_json=technologies,
            responsibilities_json=responsibilities,
            experience_level=jd_in.experience_level,
            target_role=jd_in.target_role,
            created_by=user_id
        )
        self.db.add(jd)
        await self.db.flush()
        return jd

    async def list_job_descriptions(self, org_id: str) -> List[JobDescription]:
        stmt = select(JobDescription).where(JobDescription.organization_id == org_id).order_by(desc(JobDescription.created_at))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def generate_template_from_jd(self, jd_id: str, org_id: str, user_id: Optional[str] = None) -> InterviewTemplate:
        stmt = select(JobDescription).where(JobDescription.id == jd_id, JobDescription.organization_id == org_id)
        result = await self.db.execute(stmt)
        jd = result.scalar_one_or_none()
        if not jd:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found")

        # Create Interview Template
        template = InterviewTemplate(
            organization_id=org_id,
            job_description_id=jd.id,
            title=f"{jd.title} Assessment Blueprint",
            description=f"Automated AI-generated technical interview for {jd.target_role} ({jd.experience_level})",
            target_role=jd.target_role,
            passing_score=80.0,
            status="ACTIVE",
            created_by=user_id
        )
        self.db.add(template)
        await self.db.flush()

        # Generate 4 standard stages
        stage_configs = [
            ("Stage 1: Cloud & Linux Fundamentals", "Fundamentals", "Core OS, Shell, IAM, and Networking primitives"),
            ("Stage 2: Containerization & CI/CD", "DevOps", "Docker packaging, Kubernetes orchestration, pipeline design"),
            ("Stage 3: Infrastructure as Code & Observability", "Operations", "Terraform state, monitoring, Prometheus/Grafana alerts"),
            ("Stage 4: Production Troubleshooting Scenario", "Troubleshooting", "Outage response, 502/504 errors, CrashLoopBackOff remediation")
        ]

        for idx, (stage_title, category, desc) in enumerate(stage_configs, start=1):
            stage = InterviewStage(
                interview_template_id=template.id,
                stage_number=idx,
                title=stage_title,
                category=category,
                description=desc,
                minimum_score=80.0,
                unlock_rule="PASS_PREVIOUS_STAGE"
            )
            self.db.add(stage)
            await self.db.flush()

            # Generate questions for stage using AI
            ai_questions = await self.ai.generate_questions(
                role=jd.target_role,
                stage_title=stage_title,
                topic=category,
                difficulty="INTERMEDIATE",
                question_type="TROUBLESHOOTING" if "Troubleshooting" in stage_title else "PRACTICAL",
                count=3
            )

            for q_idx, q_data in enumerate(ai_questions, start=1):
                q = Question(
                    interview_stage_id=stage.id,
                    order_index=q_idx,
                    question_text=q_data["question_text"],
                    question_type=q_data.get("question_type", "PRACTICAL"),
                    difficulty=q_data.get("difficulty", "INTERMEDIATE"),
                    skill_category=q_data.get("skill_category", category),
                    expected_topics=q_data.get("expected_topics", []),
                    reference_answer=q_data["reference_answer"],
                    evaluation_rubric=q_data.get("evaluation_rubric", {}),
                    follow_up_question=q_data.get("follow_up_question"),
                    is_active="ACTIVE"
                )
                self.db.add(q)

        await self.db.flush()
        return template
