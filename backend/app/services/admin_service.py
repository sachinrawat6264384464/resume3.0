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
        # Total candidates count across org or all candidates
        from sqlalchemy import or_
        cand_stmt = select(func.count(Candidate.id))
        total_candidates = (await self.db.execute(cand_stmt)).scalar() or 0

        # Fetch all interview attempts in organization
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

        completed_attempts = [a for a in attempts if a.status == "COMPLETED" or a.decision is not None]
        in_progress_attempts = [a for a in attempts if a.status == "IN_PROGRESS" and a.decision is None]
        
        passed_attempts = [a for a in completed_attempts if a.decision == "PASS" or (a.overall_score or 0) >= 80.0]
        pass_rate = round((len(passed_attempts) / len(completed_attempts)) * 100, 1) if completed_attempts else 0.0

        scores = [a.overall_score for a in attempts if a.overall_score is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        # Query all stages from DB (Stage 0 to Stage 30)
        stg_stmt = select(InterviewStage).order_by(InterviewStage.stage_number)
        stg_res = await self.db.execute(stg_stmt)
        all_db_stages = stg_res.scalars().all()

        # Map attempts per stage
        stage_attempts_map: Dict[int, List[StageAttempt]] = {}
        for a in attempts:
            for sa in a.stage_attempts:
                s_num = sa.stage_number
                if s_num not in stage_attempts_map:
                    stage_attempts_map[s_num] = []
                stage_attempts_map[s_num].append(sa)

        stage_pass_rates: List[StagePassRateMetric] = []

        if all_db_stages:
            for st in all_db_stages:
                s_num = st.stage_number
                s_attempts = stage_attempts_map.get(s_num, [])
                eval_attempts = [sa for sa in s_attempts if sa.status in ("PASSED", "FAILED") or sa.score is not None]
                s_passed = [sa for sa in eval_attempts if sa.status == "PASSED" or (sa.score or 0) >= 70.0]
                s_total = len(s_attempts)
                
                s_rate = round((len(s_passed) / len(eval_attempts)) * 100, 1) if eval_attempts else 0.0
                s_scores = [sa.score for sa in eval_attempts if sa.score is not None]
                s_avg = round(sum(s_scores) / len(s_scores), 1) if s_scores else 0.0

                stage_pass_rates.append(StagePassRateMetric(
                    stage_number=s_num,
                    stage_title=st.title,
                    total_attempts=s_total,
                    passed_attempts=len(s_passed),
                    pass_rate_percentage=s_rate,
                    avg_score=s_avg
                ))
        else:
            # Fallback if DB table isn't populated yet
            for s_num, s_attempts in sorted(stage_attempts_map.items()):
                eval_attempts = [sa for sa in s_attempts if sa.status in ("PASSED", "FAILED") or sa.score is not None]
                s_passed = [sa for sa in eval_attempts if sa.status == "PASSED"]
                s_rate = round((len(s_passed) / len(eval_attempts)) * 100, 1) if eval_attempts else 0.0
                s_scores = [sa.score for sa in eval_attempts if sa.score is not None]
                s_avg = round(sum(s_scores) / len(s_scores), 1) if s_scores else 0.0
                st_title = s_attempts[0].stage.title if (s_attempts and s_attempts[0].stage) else f"Stage {s_num}"
                stage_pass_rates.append(StagePassRateMetric(
                    stage_number=s_num,
                    stage_title=st_title,
                    total_attempts=len(s_attempts),
                    passed_attempts=len(s_passed),
                    pass_rate_percentage=s_rate,
                    avg_score=s_avg
                ))

        # Weak topics aggregation strictly from candidate failure reports
        topic_counts: Dict[str, int] = {}
        for a in attempts:
            rep = a.summary_report_json or {}
            for gap in rep.get("critical_knowledge_gaps", []):
                topic_counts[gap] = topic_counts.get(gap, 0) + 1

        weak_topics = [
            WeakTopicMetric(topic=k, failure_frequency=v, category="Technical Concept")
            for k, v in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

        # Calculate 5-Pillar Score Matrix strictly from real data
        pillar_scores = {
            "technical_command": 0.0,
            "architectural_concept": 0.0,
            "troubleshooting": 0.0,
            "practical_execution": 0.0,
            "communication": 0.0
        }

        if attempts:
            pillar_sums = {"technical": [], "arch": [], "trouble": [], "practical": [], "comm": []}
            for a in attempts:
                rep = a.summary_report_json or {}
                p_breakdown = rep.get("pillar_scores", {})
                if p_breakdown:
                    if "technical_command" in p_breakdown: pillar_sums["technical"].append(p_breakdown["technical_command"])
                    if "architectural_concept" in p_breakdown: pillar_sums["arch"].append(p_breakdown["architectural_concept"])
                    if "troubleshooting" in p_breakdown: pillar_sums["trouble"].append(p_breakdown["troubleshooting"])
                    if "practical_execution" in p_breakdown: pillar_sums["practical"].append(p_breakdown["practical_execution"])
                    if "communication" in p_breakdown: pillar_sums["comm"].append(p_breakdown["communication"])
            
            pillar_scores = {
                "technical_command": round(sum(pillar_sums["technical"]) / len(pillar_sums["technical"]), 1) if pillar_sums["technical"] else 0.0,
                "architectural_concept": round(sum(pillar_sums["arch"]) / len(pillar_sums["arch"]), 1) if pillar_sums["arch"] else 0.0,
                "troubleshooting": round(sum(pillar_sums["trouble"]) / len(pillar_sums["trouble"]), 1) if pillar_sums["trouble"] else 0.0,
                "practical_execution": round(sum(pillar_sums["practical"]) / len(pillar_sums["practical"]), 1) if pillar_sums["practical"] else 0.0,
                "communication": round(sum(pillar_sums["comm"]) / len(pillar_sums["comm"]), 1) if pillar_sums["comm"] else 0.0
            }

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

        # Query top performing candidates dynamically
        top_cand_stmt = (
            select(Candidate)
            .options(selectinload(Candidate.user))
            .order_by(desc(Candidate.readiness_score))
            .limit(5)
        )
        top_cand_res = await self.db.execute(top_cand_stmt)
        top_cands = top_cand_res.scalars().all()

        top_candidates_list = []
        medals = ["🥇", "🥈", "🥉"]
        for idx, tc in enumerate(top_cands, 1):
            cand_u = tc.user
            c_name = cand_u.full_name if cand_u else "Candidate"
            c_email = cand_u.email if cand_u else "candidate@cloudops.internal"
            r_score = tc.readiness_score or 0.0
            medal = medals[idx - 1] if idx <= 3 else f"#{idx}"
            top_candidates_list.append({
                "rank": idx,
                "name": c_name,
                "email": c_email,
                "score": f"{r_score:.1f}%",
                "stage": tc.target_role or "Senior DevOps Engineer",
                "date": "Active",
                "medal": medal
            })

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
            recent_interviews=recent_items,
            pillar_scores=pillar_scores,
            top_candidates=top_candidates_list
        )


    async def assign_interview_template(self, candidate_ids: List[str], template_id: str, org_id: str) -> List[str]:
        interview_svc = InterviewService(self.db)
        created_attempt_ids = []
        for cand_id in candidate_ids:
            attempt = await interview_svc.start_interview_attempt(template_id, cand_id, org_id)
            created_attempt_ids.append(attempt.id)
        return created_attempt_ids
