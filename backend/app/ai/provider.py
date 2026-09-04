from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.schemas.evaluation import QuestionEvaluationResult

class AIProvider(ABC):
    @abstractmethod
    async def analyze_job_description(
        self,
        title: str,
        raw_description: str,
        experience_level: str = "MID"
    ) -> Dict[str, Any]:
        """Extracts required skills, technologies, responsibilities, and interview stages blueprint."""
        pass

    @abstractmethod
    async def generate_questions(
        self,
        role: str,
        stage_title: str,
        topic: str,
        difficulty: str = "INTERMEDIATE",
        question_type: str = "PRACTICAL",
        count: int = 3
    ) -> List[Dict[str, Any]]:
        """Generates structured questions with gold standard reference answers and rubrics."""
        pass

    @abstractmethod
    async def evaluate_answer(
        self,
        question_text: str,
        expected_topics: List[str],
        reference_answer: str,
        candidate_transcript: str,
        rubric: Dict[str, Any] = None,
        duration_seconds: float = 0.0
    ) -> QuestionEvaluationResult:
        """Evaluates technical correctness, concept coverage, reasoning, practical depth, and communication clarity."""
        pass

    @abstractmethod
    async def generate_feedback_and_plan(
        self,
        role: str,
        stage_scores: List[Dict[str, Any]],
        question_evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Synthesizes executive summary, strengths, weaknesses, gaps, and 30-day learning roadmap."""
        pass

    @abstractmethod
    async def extract_resume_profile(self, resume_text: str) -> Dict[str, Any]:
        """Extracts structured candidate profile (skills, cloud tools, experience, projects) from resume text."""
        pass

    @abstractmethod
    async def match_resume_ats(self, job_title: str, job_description: str, resume_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Computes ATS match percentage and 6-factor breakdown comparing Resume to Job Description."""
        pass

    @abstractmethod
    async def improve_resume_bullet(self, role: str, current_bullet: str, keywords: str = "") -> Dict[str, Any]:
        """Rewrites resume bullet point with quantifiable metrics, action verbs, and STAR methodology."""
        pass

    @abstractmethod
    async def generate_question_hints(self, question_text: str, expected_topics: List[str]) -> Dict[str, str]:
        """Generates 3 progressive hint levels (clue, commands/tools, solution walkthrough)."""
        pass

    @abstractmethod
    async def generate_study_plan(self, target_role: str, available_hours: int, focus_skills: List[str]) -> List[Dict[str, Any]]:
        """Generates structured 5-day study plan tasks tailored to detected skill gaps."""
        pass

