from app.schemas.common import BaseSchema, StandardResponse, PaginatedResponse
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserOut, TokenResponse, LoginRequest, MockLoginRequest
from app.schemas.candidate import CandidateBase, CandidateCreate, CandidateUpdate, CandidateOut, CandidateWithAttemptsOut
from app.schemas.job_description import JobDescriptionBase, JobDescriptionCreate, JobDescriptionUpdate, JobDescriptionOut, JDAnalyzeRequest, JDAnalyzeResponse
from app.schemas.question import QuestionBase, QuestionCreate, QuestionUpdate, QuestionCandidateOut, QuestionAdminOut, QuestionGenerateRequest
from app.schemas.interview import StageBase, StageCreate, StageUpdate, StageCandidateOut, StageAdminOut, TemplateBase, TemplateCreate, TemplateUpdate, TemplateCandidateOut, TemplateAdminOut
from app.schemas.evaluation import CommunicationMetrics, QuestionEvaluationResult
from app.schemas.attempt import QuestionAttemptOut, StageAttemptOut, InterviewAttemptOut, StartInterviewRequest, SubmitAnswerRequest, StageEvaluationResponse
from app.schemas.report import RecommendedTopicItem, WeeklyLearningMilestone, StageReportBreakdown, CandidateReportOut, AdminReportOut
from app.schemas.admin import StagePassRateMetric, WeakTopicMetric, RecentInterviewItem, AdminDashboardMetrics, StageOverrideRequest, RetentionCleanupResponse, AssignInterviewRequest

__all__ = [
    "BaseSchema", "StandardResponse", "PaginatedResponse",
    "UserBase", "UserCreate", "UserUpdate", "UserOut", "TokenResponse", "LoginRequest", "MockLoginRequest",
    "CandidateBase", "CandidateCreate", "CandidateUpdate", "CandidateOut", "CandidateWithAttemptsOut",
    "JobDescriptionBase", "JobDescriptionCreate", "JobDescriptionUpdate", "JobDescriptionOut", "JDAnalyzeRequest", "JDAnalyzeResponse",
    "QuestionBase", "QuestionCreate", "QuestionUpdate", "QuestionCandidateOut", "QuestionAdminOut", "QuestionGenerateRequest",
    "StageBase", "StageCreate", "StageUpdate", "StageCandidateOut", "StageAdminOut", "TemplateBase", "TemplateCreate", "TemplateUpdate", "TemplateCandidateOut", "TemplateAdminOut",
    "CommunicationMetrics", "QuestionEvaluationResult",
    "QuestionAttemptOut", "StageAttemptOut", "InterviewAttemptOut", "StartInterviewRequest", "SubmitAnswerRequest", "StageEvaluationResponse",
    "RecommendedTopicItem", "WeeklyLearningMilestone", "StageReportBreakdown", "CandidateReportOut", "AdminReportOut",
    "StagePassRateMetric", "WeakTopicMetric", "RecentInterviewItem", "AdminDashboardMetrics", "StageOverrideRequest", "RetentionCleanupResponse", "AssignInterviewRequest"
]
