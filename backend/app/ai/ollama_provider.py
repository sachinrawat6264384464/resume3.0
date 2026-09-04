import json
import httpx
from typing import Dict, Any, List
from app.ai.provider import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.confidence_analyzer import analyze_communication_signals
from app.ai.prompts import JD_EXTRACTION_PROMPT, QUESTION_GENERATION_PROMPT, ANSWER_EVALUATION_PROMPT, REPORT_SYNTHESIS_PROMPT
from app.schemas.evaluation import QuestionEvaluationResult
from app.core.config import settings

class OllamaAIProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.fallback = MockAIProvider()

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "format": "json",
                        "stream": False
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "{}")
                    return json.loads(response_text)
        except Exception as e:
            print(f"Ollama generation failed or Ollama not reachable ({e}), using fallback provider.")
        return {}

    async def analyze_job_description(self, title: str, raw_description: str, experience_level: str = "MID") -> Dict[str, Any]:
        prompt = JD_EXTRACTION_PROMPT.format(role=title, experience_level=experience_level, raw_description=raw_description)
        res = await self._generate_json(prompt)
        if res and "skills" in res:
            return res
        return await self.fallback.analyze_job_description(title, raw_description, experience_level)

    async def generate_questions(self, role: str, stage_title: str, topic: str, difficulty: str = "INTERMEDIATE", question_type: str = "PRACTICAL", count: int = 3) -> List[Dict[str, Any]]:
        prompt = QUESTION_GENERATION_PROMPT.format(role=role, stage_title=stage_title, topic=topic, difficulty=difficulty, question_type=question_type, count=count)
        res = await self._generate_json(prompt)
        if isinstance(res, list) and len(res) > 0:
            return res
        if isinstance(res, dict) and "questions" in res:
            return res["questions"]
        return await self.fallback.generate_questions(role, stage_title, topic, difficulty, question_type, count)

    async def evaluate_answer(self, question_text: str, expected_topics: List[str], reference_answer: str, candidate_transcript: str, rubric: Dict[str, Any] = None, duration_seconds: float = 0.0) -> QuestionEvaluationResult:
        comm_metrics = analyze_communication_signals(candidate_transcript, duration_seconds)
        prompt = ANSWER_EVALUATION_PROMPT.format(
            question_text=question_text,
            expected_topics=", ".join(expected_topics),
            reference_answer=reference_answer,
            candidate_transcript=candidate_transcript
        )
        res = await self._generate_json(prompt)
        if res and "technical_score" in res:
            tech = float(res.get("technical_score", 70.0))
            concept = float(res.get("concept_coverage_score", 70.0))
            reasoning = float(res.get("reasoning_score", 70.0))
            practical = float(res.get("practical_score", 70.0))
            comm = comm_metrics.structural_clarity_score
            conf = comm_metrics.confidence_estimate
            overall = tech * 0.40 + concept * 0.25 + reasoning * 0.20 + practical * 0.10 + comm * 0.05
            return QuestionEvaluationResult(
                technical_score=tech,
                concept_coverage_score=concept,
                reasoning_score=reasoning,
                practical_score=practical,
                communication_score=comm,
                confidence_score=conf,
                overall_score=round(overall, 1),
                strengths=res.get("strengths", []),
                weaknesses=res.get("weaknesses", []),
                missing_concepts=res.get("missing_concepts", []),
                feedback=res.get("feedback", ""),
                recommendations=res.get("recommendations", []),
                communication_metrics=comm_metrics
            )
        return await self.fallback.evaluate_answer(question_text, expected_topics, reference_answer, candidate_transcript, rubric, duration_seconds)

    async def generate_feedback_and_plan(self, role: str, stage_scores: List[Dict[str, Any]], question_evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
        prompt = REPORT_SYNTHESIS_PROMPT.format(
            role=role,
            stage_scores_json=json.dumps(stage_scores),
            evaluations_json=json.dumps(question_evaluations)
        )
        res = await self._generate_json(prompt)
        if res and "thirty_day_plan" in res:
            return res
        return await self.fallback.generate_feedback_and_plan(role, stage_scores, question_evaluations)

    async def extract_resume_profile(self, resume_text: str) -> Dict[str, Any]:
        return await self.fallback.extract_resume_profile(resume_text)

    async def match_resume_ats(self, job_title: str, job_description: str, resume_profile: Dict[str, Any]) -> Dict[str, Any]:
        return await self.fallback.match_resume_ats(job_title, job_description, resume_profile)

    async def improve_resume_bullet(self, role: str, current_bullet: str, keywords: str = "") -> Dict[str, Any]:
        return await self.fallback.improve_resume_bullet(role, current_bullet, keywords)

    async def generate_question_hints(self, question_text: str, expected_topics: List[str]) -> Dict[str, str]:
        return await self.fallback.generate_question_hints(question_text, expected_topics)

    async def generate_study_plan(self, target_role: str, available_hours: int, focus_skills: List[str]) -> List[Dict[str, Any]]:
        return await self.fallback.generate_study_plan(target_role, available_hours, focus_skills)

