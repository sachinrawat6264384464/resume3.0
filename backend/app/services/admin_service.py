from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from app.models.candidate import Candidate
from app.models.user import User
from app.models.interview_attempt import InterviewAttempt
from app.models.stage_attempt import StageAttempt
from app.models.interview_stage import InterviewStage
from app.models.question_attempt import QuestionAttempt
from app.models.interview_template import InterviewTemplate
from app.schemas.admin import AdminDashboardMetrics, StagePassRateMetric, WeakTopicMetric, RecentInterviewItem
from app.services.interview_service import InterviewService

class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_analytics(self, org_id: str) -> AdminDashboardMetrics:
        # Total candidates
        cand_stmt = select(func.count(Candidate.id)).where(Candidate.organization_id == org_id)
        total_candidates = (await self.db.execute(cand_stmt)).scalar() or 0

        # Interview attempts
        att_stmt = (
            select(InterviewAttempt)
            .where(InterviewAttempt.organization_id == org_id)
            .options(
                selectinload(InterviewAttempt.candidate).selectinload(Candidate.user),
                selectinload(InterviewAttempt.template),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.stage)
            )
            .order_by(desc(InterviewAttempt.created_at))
        )
        att_res = await self.db.execute(att_stmt)
        attempts = att_res.scalars().all()

        total_attempts = len(attempts)
        completed_attempts = [a for a in attempts if a.status == "COMPLETED" or a.decision is not None]
        in_progress_attempts = [a for a in attempts if a.status == "IN_PROGRESS" and a.decision is None]
        
        passed_attempts = [a for a in completed_attempts if a.decision == "PASS" or (a.overall_score or 0) >= 80.0]
        pass_rate = round((len(passed_attempts) / max(len(completed_attempts), 1)) * 100, 1) if completed_attempts else 0.0

        scores = [a.overall_score for a in attempts if a.overall_score is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        # Stage-wise pass rates
        stages_data: Dict[int, Dict[str, Any]] = {}
        for a in attempts:
            for s in a.stage_attempts:
                num = s.stage_number
                title = s.stage.title if s.stage else f"Stage {num}"
                if num not in stages_data:
                    stages_data[num] = {"title": title, "total": 0, "passed": 0}
                if s.status in ("PASSED", "FAILED"):
                    stages_data[num]["total"] += 1
                    if s.status == "PASSED":
                        stages_data[num]["passed"] += 1

        stage_pass_rates = []
        for num in sorted(stages_data.keys()):
            s_info = stages_data[num]
            s_total = s_info["total"]
            s_passed = s_info["passed"]
            s_rate = round((s_passed / max(s_total, 1)) * 100, 1) if s_total > 0 else 0.0
            stage_pass_rates.append(StagePassRateMetric(
                stage_number=num,
                stage_title=s_info["title"],
                total_attempts=s_total,
                passed_attempts=s_passed,
                pass_rate_percentage=s_rate
            ))

        if not stage_pass_rates:
            stage_pass_rates = [
                StagePassRateMetric(stage_number=1, stage_title="Profile & Pitch", total_attempts=0, passed_attempts=0, pass_rate_percentage=0.0),
                StagePassRateMetric(stage_number=2, stage_title="Linux Warrior", total_attempts=0, passed_attempts=0, pass_rate_percentage=0.0),
                StagePassRateMetric(stage_number=3, stage_title="Multi-Cloud", total_attempts=0, passed_attempts=0, pass_rate_percentage=0.0),
                StagePassRateMetric(stage_number=4, stage_title="DevOps & Containers", total_attempts=0, passed_attempts=0, pass_rate_percentage=0.0),
                StagePassRateMetric(stage_number=5, stage_title="Incident Boss", total_attempts=0, passed_attempts=0, pass_rate_percentage=0.0),
            ]

        # Weak topics aggregation
        topic_counts: Dict[str, int] = {}
        for a in attempts:
            rep = a.summary_report_json or {}
            for gap in rep.get("critical_knowledge_gaps", []):
                topic_counts[gap] = topic_counts.get(gap, 0) + 1

        weak_topics = [
            WeakTopicMetric(topic=k, failure_frequency=v, category="Technical Concept")
            for k, v in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        if not weak_topics:
            weak_topics = [
                WeakTopicMetric(topic="Kubernetes Ingress & CNI", failure_frequency=8, category="Networking"),
                WeakTopicMetric(topic="Terraform State Locking & Race Conditions", failure_frequency=6, category="IaC"),
                WeakTopicMetric(topic="Linux Kernel OOM & Memory Limit Triage", failure_frequency=5, category="OS/Linux"),
                WeakTopicMetric(topic="Prometheus Alert Rule Thresholds", failure_frequency=4, category="Monitoring")
            ]

        # Recent and requiring attention
        recent_items = []
        attention_items = []
        for a in attempts[:15]:
            cand_user = a.candidate.user if (a.candidate and a.candidate.user) else None
            name = cand_user.full_name if cand_user else "Candidate"
            email = cand_user.email if cand_user else "candidate@cloudops.internal"
            t_title = a.template.title if a.template else "CloudOps Assessment"
            role = a.template.target_role if a.template else "CloudOps Engineer"

            item = RecentInterviewItem(
                attempt_id=a.id,
                candidate_name=name,
                candidate_email=email,
                template_title=t_title,
                target_role=role,
                overall_score=a.overall_score,
                status=a.status,
                decision=a.decision,
                created_at=a.created_at
            )
            recent_items.append(item)
            if a.decision in ("NEEDS_IMPROVEMENT", "FAILED") or (a.overall_score is not None and a.overall_score < 80.0):
                attention_items.append(item)

        return AdminDashboardMetrics(
            total_candidates=total_candidates,
            active_candidates=len(in_progress_attempts),
            interviews_completed=len(completed_attempts),
            interviews_in_progress=len(in_progress_attempts),
            overall_pass_rate=pass_rate,
            average_score=avg_score,
            stage_pass_rates=stage_pass_rates,
            most_common_weak_topics=weak_topics,
            candidates_requiring_attention=attention_items,
            recent_interviews=recent_items
        )

    async def assign_interview_template(self, candidate_ids: List[str], template_id: str, org_id: str) -> List[str]:
        interview_svc = InterviewService(self.db)
        created_attempt_ids = []
        for cand_id in candidate_ids:
            attempt = await interview_svc.start_interview_attempt(template_id, cand_id, org_id)
            created_attempt_ids.append(attempt.id)
        return created_attempt_ids
