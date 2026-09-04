import json
import httpx
from typing import Dict, Any, List
from app.ai.provider import AIProvider
from app.ai.mock_provider import MockAIProvider
from app.ai.confidence_analyzer import analyze_communication_signals
from app.ai.prompts import (
    JD_EXTRACTION_PROMPT, QUESTION_GENERATION_PROMPT, ANSWER_EVALUATION_PROMPT,
    REPORT_SYNTHESIS_PROMPT, RESUME_EXTRACTION_PROMPT, RESUME_ATS_MATCH_PROMPT,
    RESUME_BULLET_IMPROVEMENT_PROMPT, QUESTION_HINTS_PROMPT, STUDY_PLAN_GENERATION_PROMPT
)
from app.schemas.evaluation import QuestionEvaluationResult
from app.core.config import settings

# Shared persistent HTTP client with keepalive pooling for low latency
_persistent_client: Optional[httpx.AsyncClient] = None

def get_ai_http_client() -> httpx.AsyncClient:
    global _persistent_client
    if _persistent_client is None or _persistent_client.is_closed:
        _persistent_client = httpx.AsyncClient(
            timeout=60.0,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
        )
    return _persistent_client

class OpenAIProvider(AIProvider):
    """
    Provider for OpenAI API and OpenAI-compatible API servers (vLLM, LiteLLM, DeepSeek, LocalAI).
    """
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.base_url = "https://api.openai.com/v1"
        self.fallback = MockAIProvider()

    async def _generate_json(self, prompt: str) -> Dict[str, Any]:
        if not self.api_key:
            return {}
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            client = get_ai_http_client()
            res = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a CloudOps assessment AI engine. Respond ONLY with valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.3
                }
            )
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                return json.loads(content)
        except Exception as e:
            print(f"OpenAI completion failed ({e}), falling back to mock provider.")
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
        prompt = RESUME_EXTRACTION_PROMPT.format(resume_text=resume_text[:6000])
        res = await self._generate_json(prompt)
        if res and "candidate_name" in res:
            return res
        return await self.fallback.extract_resume_profile(resume_text)

    async def match_resume_ats(self, job_title: str, job_description: str, resume_profile: Dict[str, Any]) -> Dict[str, Any]:
        prompt = RESUME_ATS_MATCH_PROMPT.format(
            job_title=job_title,
            job_description=job_description[:4000],
            resume_json=json.dumps(resume_profile)
        )
        res = await self._generate_json(prompt)
        if res and "ats_score" in res:
            return res
        return await self.fallback.match_resume_ats(job_title, job_description, resume_profile)

    async def improve_resume_bullet(self, role: str, current_bullet: str, keywords: str = "") -> Dict[str, Any]:
        prompt = RESUME_BULLET_IMPROVEMENT_PROMPT.format(
            role=role,
            current_bullet=current_bullet,
            keywords=keywords or "Cloud, DevOps, Automation, Production"
        )
        res = await self._generate_json(prompt)
        if res and "improved" in res:
            return res
        return await self.fallback.improve_resume_bullet(role, current_bullet, keywords)

    async def generate_question_hints(self, question_text: str, expected_topics: List[str]) -> Dict[str, str]:
        prompt = QUESTION_HINTS_PROMPT.format(
            question_text=question_text,
            expected_topics=", ".join(expected_topics)
        )
        res = await self._generate_json(prompt)
        if res and "hint_level_1" in res:
            return res
        return await self.fallback.generate_question_hints(question_text, expected_topics)

    async def generate_study_plan(self, target_role: str, available_hours: int, focus_skills: List[str]) -> List[Dict[str, Any]]:
        prompt = STUDY_PLAN_GENERATION_PROMPT.format(
            target_role=target_role,
            available_hours=available_hours,
            focus_skills=", ".join(focus_skills)
        )
        res = await self._generate_json(prompt)
        if res and "tasks" in res and isinstance(res["tasks"], list) and len(res["tasks"]) > 0:
            return res["tasks"]
        return await self.fallback.generate_study_plan(target_role, available_hours, focus_skills)

