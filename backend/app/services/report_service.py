from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.interview_attempt import InterviewAttempt
from app.models.stage_attempt import StageAttempt
from app.models.question_attempt import QuestionAttempt
from app.models.candidate import Candidate
from app.models.user import User
from app.models.recording import Recording
from app.schemas.report import CandidateReportOut, AdminReportOut, StageReportBreakdown, RecommendedTopicItem, WeeklyLearningMilestone
from app.ai import get_ai_provider

class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai = get_ai_provider()

    async def synthesize_final_report(self, interview_attempt_id: str) -> Dict[str, Any]:
        stmt = (
            select(InterviewAttempt)
            .where(InterviewAttempt.id == interview_attempt_id)
            .options(
                selectinload(InterviewAttempt.template),
                selectinload(InterviewAttempt.candidate).selectinload(Candidate.user),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.stage),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.question_attempts).selectinload(QuestionAttempt.question)
            )
        )
        res = await self.db.execute(stmt)
        attempt = res.scalar_one_or_none()
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview attempt not found")

        # Collect all questions and stages
        all_q_evals = []
        stage_summaries = []
        all_tech_scores = []
        all_comm_scores = []
        all_conf_scores = []
        all_overall_scores = []

        for stage_att in sorted(attempt.stage_attempts, key=lambda s: s.stage_number):
            q_list = stage_att.question_attempts or []
            s_tech, s_comm, s_conf, s_overall = [], [], [], []
            for q in q_list:
                if q.overall_score is not None:
                    s_tech.append(q.technical_score or 70.0)
                    s_comm.append(q.communication_score or 80.0)
                    s_conf.append(q.confidence_score or 80.0)
                    s_overall.append(q.overall_score)
                    all_tech_scores.append(q.technical_score or 70.0)
                    all_comm_scores.append(q.communication_score or 80.0)
                    all_conf_scores.append(q.confidence_score or 80.0)
                    all_overall_scores.append(q.overall_score)
                    all_q_evals.append({
                        "question": q.question_text_snapshot,
                        "transcript": q.answer_transcript,
                        "overall_score": q.overall_score,
                        "missing_concepts": (q.evaluation_json or {}).get("missing_concepts", [])
                    })

            s_avg = round(sum(s_overall) / len(s_overall), 1) if s_overall else 0.0
            stage_summaries.append({
                "stage_number": stage_att.stage_number,
                "title": stage_att.stage.title if stage_att.stage else f"Stage {stage_att.stage_number}",
                "category": stage_att.stage.category if stage_att.stage else "Core",
                "score": s_avg,
                "status": stage_att.status,
                "passed": stage_att.status == "PASSED"
            })

        avg_overall = round(sum(all_overall_scores) / len(all_overall_scores), 1) if all_overall_scores else 0.0
        avg_tech = round(sum(all_tech_scores) / len(all_tech_scores), 1) if all_tech_scores else 0.0
        avg_comm = round(sum(all_comm_scores) / len(all_comm_scores), 1) if all_comm_scores else 0.0
        avg_conf = round(sum(all_conf_scores) / len(all_conf_scores), 1) if all_conf_scores else 0.0

        attempt.overall_score = avg_overall
        attempt.technical_score = avg_tech
        attempt.communication_score = avg_comm
        attempt.confidence_score = avg_conf

        role = attempt.template.target_role if attempt.template else "CloudOps Engineer"
        ai_synthesis = await self.ai.generate_feedback_and_plan(role, stage_summaries, all_q_evals)

        report_payload = {
            "overall_score": avg_overall,
            "technical_score": avg_tech,
            "communication_score": avg_comm,
            "confidence_score": avg_conf,
            "stages": stage_summaries,
            "executive_summary": ai_synthesis.get("executive_summary", ""),
            "strengths": ai_synthesis.get("strengths", []),
            "weaknesses": ai_synthesis.get("weaknesses", []),
            "critical_knowledge_gaps": ai_synthesis.get("critical_knowledge_gaps", []),
            "recommended_topics": ai_synthesis.get("recommended_topics", []),
            "thirty_day_plan": ai_synthesis.get("thirty_day_plan", [])
        }

        attempt.summary_report_json = report_payload
        await self.db.flush()
        return report_payload

    async def get_candidate_report(self, interview_attempt_id: str) -> CandidateReportOut:
        stmt = (
            select(InterviewAttempt)
            .where(InterviewAttempt.id == interview_attempt_id)
            .options(
                selectinload(InterviewAttempt.template),
                selectinload(InterviewAttempt.candidate).selectinload(Candidate.user),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.stage),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.question_attempts)
            )
        )
        res = await self.db.execute(stmt)
        attempt = res.scalar_one_or_none()
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview attempt not found")

        report_data = attempt.summary_report_json
        if not report_data:
            report_data = await self.synthesize_final_report(attempt.id)

        cand_user = attempt.candidate.user if attempt.candidate else None
        cand_name = cand_user.full_name if cand_user else "Candidate"
        cand_email = cand_user.email if cand_user else "candidate@cloudops.internal"
        role = attempt.template.target_role if attempt.template else "CloudOps Engineer"

        stage_breakdowns = []
        for s in attempt.stage_attempts:
            s_evals = [q.evaluation_json or {} for q in s.question_attempts if q.evaluation_json]
            s_strengths = []
            s_weaknesses = []
            for ev in s_evals:
                s_strengths.extend(ev.get("strengths", []))
                s_weaknesses.extend(ev.get("weaknesses", []))

            stage_breakdowns.append(StageReportBreakdown(
                stage_number=s.stage_number,
                title=s.stage.title if s.stage else f"Stage {s.stage_number}",
                category=s.stage.category if s.stage else "Operations",
                score=s.score or 0.0,
                status=s.status,
                passed=s.status == "PASSED",
                strengths=list(set(s_strengths))[:3],
                weaknesses=list(set(s_weaknesses))[:3],
                questions_count=len(s.question_attempts)
            ))

        recommended_items = [
            RecommendedTopicItem(
                topic=item.get("topic", "Topic"),
                why_it_matters=item.get("why_it_matters", ""),
                candidate_gap=item.get("candidate_gap", ""),
                what_to_learn=item.get("what_to_learn", []),
                recommended_docs=item.get("recommended_docs", []),
                practice_exercises=item.get("practice_exercises", [])
            )
            for item in report_data.get("recommended_topics", [])
        ]

        thirty_day = [
            WeeklyLearningMilestone(
                week=plan.get("week", 1),
                theme=plan.get("theme", "Week Plan"),
                objectives=plan.get("objectives", []),
                hands_on_labs=plan.get("hands_on_labs", []),
                documentation_links=plan.get("documentation_links", [])
            )
            for plan in report_data.get("thirty_day_plan", [])
        ]

        disclaimer = (
            "The confidence score is an estimate based on observable verbal communication patterns "
            "(hesitation pauses, speech pacing, filler-word frequency, and structural clarity). "
            "It is not a psychological assessment."
        )

        return CandidateReportOut(
            attempt_id=attempt.id,
            candidate_name=cand_name,
            candidate_email=cand_email,
            target_role=role,
            interview_date=attempt.started_at or attempt.created_at,
            overall_score=attempt.overall_score or 0.0,
            decision=attempt.decision or ("PASS" if (attempt.overall_score or 0) >= 80.0 else "NEEDS_IMPROVEMENT"),
            technical_score=attempt.technical_score or 0.0,
            communication_score=attempt.communication_score or 0.0,
            confidence_score=attempt.confidence_score or 0.0,
            confidence_disclaimer=disclaimer,
            stages=stage_breakdowns,
            strengths=report_data.get("strengths", []),
            weaknesses=report_data.get("weaknesses", []),
            critical_knowledge_gaps=report_data.get("critical_knowledge_gaps", []),
            recommended_topics=recommended_items,
            thirty_day_plan=thirty_day,
            executive_summary=report_data.get("executive_summary", "")
        )

    async def get_admin_report(self, interview_attempt_id: str) -> AdminReportOut:
        cand_rep = await self.get_candidate_report(interview_attempt_id)
        stmt = (
            select(InterviewAttempt)
            .where(InterviewAttempt.id == interview_attempt_id)
            .options(
                selectinload(InterviewAttempt.candidate).selectinload(Candidate.organization),
                selectinload(InterviewAttempt.recordings),
                selectinload(InterviewAttempt.stage_attempts).selectinload(StageAttempt.question_attempts)
            )
        )
        res = await self.db.execute(stmt)
        attempt = res.scalar_one_or_none()

        org_name = attempt.candidate.organization.name if (attempt and attempt.candidate and attempt.candidate.organization) else "Default Org"
        student_id = attempt.candidate.student_id if (attempt and attempt.candidate) else None

        recs = []
        for r in (attempt.recordings if attempt else []):
            recs.append({
                "id": r.id,
                "file_name": r.file_name,
                "view_link": r.google_drive_view_link or f"/api/v1/recordings/stream/{r.id}",
                "file_size": r.file_size_bytes,
                "duration": r.duration_seconds,
                "expires_at": r.expires_at,
                "status": r.deletion_status
            })

        transcripts = []
        overrides = []
        for s in (attempt.stage_attempts if attempt else []):
            if s.is_override:
                overrides.append({
                    "stage_number": s.stage_number,
                    "override_reason": s.override_reason,
                    "override_by": s.override_by,
                    "status": s.status
                })
            for q in s.question_attempts:
                transcripts.append({
                    "stage": s.stage_number,
                    "question": q.question_text_snapshot,
                    "transcript": q.answer_transcript,
                    "scores": {
                        "technical": q.technical_score,
                        "concept": q.concept_coverage_score,
                        "reasoning": q.reasoning_score,
                        "practical": q.practical_score,
                        "communication": q.communication_score,
                        "confidence": q.confidence_score,
                        "overall": q.overall_score
                    }
                })

        return AdminReportOut(
            **cand_rep.model_dump(),
            candidate_id=attempt.candidate_id if attempt else "",
            student_id=student_id,
            organization_name=org_name,
            recordings=recs,
            full_transcript_log=transcripts,
            stage_overrides=overrides,
            ai_raw_evaluation_metadata=attempt.summary_report_json or {}
        )
