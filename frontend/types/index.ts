export type UserRole = "SUPER_ADMIN" | "ADMIN" | "INTERVIEWER" | "CANDIDATE";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  firebase_uid?: string;
  is_active: boolean;
  created_at: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  organization_id: string;
  student_id?: string;
  phone?: string;
  course?: string;
  batch?: string;
  experience_level: string;
  target_role: string;
  notes?: string;
  xp?: number;
  level?: number;
  streak_days?: number;
  readiness_score?: number;
  target_salary_band?: string;
  skills_matrix_json?: Record<string, number>;
  badges_json?: string[];
  latest_ats_score?: number;
  user?: User;
  total_attempts?: number;
  passed_interviews?: number;
  latest_score?: number;
  latest_status?: string;
  created_at: string;
}

export interface QuestionHints {
  question_id: string;
  hint_level_1?: string;
  hint_level_2?: string;
  hint_level_3?: string;
}

export interface Question {
  id: string;
  order_index: number;
  question_text: string;
  question_type: "CONCEPTUAL" | "PRACTICAL" | "TROUBLESHOOTING" | "SCENARIO" | "COMMAND";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  skill_category: string;
  expected_topics: string[];
  reference_answer?: string; // only in admin view
  evaluation_rubric?: Record<string, number>;
  follow_up_question?: string;
  hint_level_1?: string;
  hint_level_2?: string;
  hint_level_3?: string;
}

export interface InterviewStage {
  id: string;
  interview_template_id: string;
  stage_number: number;
  title: string;
  description?: string;
  category: string;
  minimum_score: number;
  unlock_rule: string;
  questions?: Question[];
  questions_count?: number;
}

export interface InterviewTemplate {
  id: string;
  organization_id: string;
  job_description_id?: string;
  title: string;
  description?: string;
  target_role: string;
  passing_score: number;
  status: string;
  stages: InterviewStage[];
  created_at: string;
}

export interface QuestionAttempt {
  id: string;
  stage_attempt_id: string;
  interview_attempt_id: string;
  question_id: string;
  question_text_snapshot: string;
  answer_transcript?: string;
  status: "PENDING" | "RECORDING" | "PROCESSING" | "EVALUATED" | "FAILED";
  technical_score?: number;
  concept_coverage_score?: number;
  reasoning_score?: number;
  practical_score?: number;
  communication_score?: number;
  confidence_score?: number;
  overall_score?: number;
  evaluation_json?: QuestionEvaluationResult;
  started_at?: string;
  completed_at?: string;
  question?: Question;
}

export interface CommunicationMetrics {
  speech_rate_wpm: number;
  filler_words_count: number;
  filler_words_detected: string[];
  hesitation_pauses_count: number;
  structural_clarity_score: number;
  confidence_estimate: number;
  assessment_notes: string;
  disclaimer: string;
}

export interface QuestionEvaluationResult {
  technical_score: number;
  concept_coverage_score: number;
  reasoning_score: number;
  practical_score: number;
  communication_score: number;
  confidence_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_concepts: string[];
  feedback: string;
  recommendations: string[];
  communication_metrics: CommunicationMetrics;
}

export interface StageAttempt {
  id: string;
  interview_attempt_id: string;
  interview_stage_id: string;
  stage_number: number;
  title?: string;
  category?: string;
  status: "LOCKED" | "NOT_STARTED" | "IN_PROGRESS" | "PASSED" | "FAILED";
  score?: number;
  is_override: boolean;
  override_reason?: string;
  started_at?: string;
  completed_at?: string;
  stage?: InterviewStage;
  question_attempts: QuestionAttempt[];
}

export interface InterviewAttempt {
  id: string;
  candidate_id: string;
  interview_template_id: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "REQUIRES_REVIEW";
  current_stage_number: number;
  overall_score?: number;
  technical_score?: number;
  communication_score?: number;
  confidence_score?: number;
  decision?: "PASS" | "NEEDS_IMPROVEMENT" | "FAILED";
  started_at?: string;
  completed_at?: string;
  template?: InterviewTemplate;
  candidate?: Candidate;
  stage_attempts: StageAttempt[];
  created_at: string;
}

export interface RecommendedTopicItem {
  topic: string;
  why_it_matters: string;
  candidate_gap: string;
  what_to_learn: string[];
  recommended_docs: string[];
  practice_exercises: string[];
}

export interface WeeklyLearningMilestone {
  week: number;
  theme: string;
  objectives: string[];
  hands_on_labs: string[];
  documentation_links: string[];
}

export interface StageReportBreakdown {
  stage_number: number;
  title: string;
  category: string;
  score: number;
  status: string;
  passed: boolean;
  strengths: string[];
  weaknesses: string[];
  questions_count: number;
}

export interface CandidateReport {
  attempt_id: string;
  candidate_name: string;
  candidate_email: string;
  target_role: string;
  interview_date: string;
  overall_score: number;
  decision: string;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  confidence_disclaimer: string;
  stages: StageReportBreakdown[];
  strengths: string[];
  weaknesses: string[];
  critical_knowledge_gaps: string[];
  recommended_topics: RecommendedTopicItem[];
  thirty_day_plan: WeeklyLearningMilestone[];
  executive_summary: string;
}

export interface AdminDashboardMetrics {
  total_candidates: number;
  active_candidates: number;
  interviews_completed: number;
  interviews_in_progress: number;
  overall_pass_rate: number;
  average_score: number;
  stage_pass_rates: {
    stage_number: number;
    stage_title: string;
    total_attempts: number;
    passed_attempts: number;
    pass_rate_percentage: number;
  }[];
  most_common_weak_topics: {
    topic: string;
    failure_frequency: number;
    category: string;
  }[];
  candidates_requiring_attention: {
    attempt_id: string;
    candidate_name: string;
    candidate_email: string;
    template_title: string;
    target_role: string;
    overall_score?: number;
    status: string;
    decision?: string;
    created_at: string;
  }[];
  recent_interviews: {
    attempt_id: string;
    candidate_name: string;
    candidate_email: string;
    template_title: string;
    target_role: string;
    overall_score?: number;
    status: string;
    decision?: string;
    created_at: string;
  }[];
}

export interface ResumeExperienceItem {
  company: string;
  role: string;
  duration?: string;
  bullet_points: string[];
}

export interface ResumeProjectItem {
  title: string;
  description?: string;
  technologies: string[];
}

export interface ResumeProfile {
  candidate_name: string;
  email?: string;
  phone?: string;
  current_designation?: string;
  years_of_experience: number;
  summary?: string;
  primary_skills: string[];
  cloud_platforms: string[];
  devops_tools: string[];
  devsecops_tools: string[];
  ai_skills: string[];
  certifications: string[];
  education: string[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
}

export interface ATSScoreBreakdown {
  skills_match: number;
  experience_match: number;
  keywords_match: number;
  projects_match: number;
  certifications_match: number;
  job_role_match: number;
}

export interface RecommendedInterviewStage {
  stage_id: number;
  title: string;
  reason: string;
}

export interface BulletImprovementItem {
  current: string;
  improved: string;
  impact_metrics_added: string[];
  skills_highlighted: string[];
  rationale: string;
}

export interface ResumeATSResponse {
  ats_score: number;
  breakdown: ATSScoreBreakdown;
  matching_skills: string[];
  missing_skills: string[];
  weak_areas: string[];
  strong_areas: string[];
  recommended_interview_stages: RecommendedInterviewStage[];
  candidate_profile: ResumeProfile;
  bullet_suggestions: BulletImprovementItem[];
}

export interface LeaderboardEntry {
  rank: number;
  candidate_id: string;
  candidate_name: string;
  experience_level: string;
  target_role: string;
  xp: number;
  level: number;
  streak_days: number;
  readiness_score: number;
  target_salary_band: string;
  badges: string[];
  weekly_xp_gained?: number;
}

export interface LeaderboardResponse {
  global_ranking: LeaderboardEntry[];
  weekly_sprint: LeaderboardEntry[];
  most_improved: LeaderboardEntry[];
  technology_leaderboards: Record<string, LeaderboardEntry[]>;
}
