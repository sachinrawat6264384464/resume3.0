# CloudOps AI Assessment Platform — Database Schema & Data Models

## 1. Relational Entity Overview

The database is built with SQLAlchemy 2.0 and supports PostgreSQL (including Neon Serverless PostgreSQL) with full async driver support (`asyncpg`) and local SQLite (`aiosqlite`) for zero-configuration development.

```
                    ┌─────────────────────────┐
                    │      organizations      │
                    └────────────┬────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │ 1:N                       │ 1:N                       │ 1:N
     ▼                           ▼                           ▼
┌───────────┐             ┌───────────────┐           ┌─────────────────────┐
│   users   │             │job_description│           │ interview_templates │
└─────┬─────┘             └───────┬───────┘           └──────────┬──────────┘
      │ 1:1                       │ 1:N                          │ 1:N
      ▼                           ▼                              ▼
┌───────────┐             ┌───────────────┐           ┌─────────────────────┐
│candidates │             │   questions   │           │  interview_stages   │
└─────┬─────┘             └───────┬───────┘           └──────────┬──────────┘
      │                           │                              │
      │ 1:N                       │                              │
      ▼                           │                              │
┌─────────────────────────┐       │                              │
│   interview_attempts    │◄──────┼──────────────────────────────┘
└────────────┬────────────┘       │
             │ 1:N                │
             ▼                    │
┌─────────────────────────┐       │
│     stage_attempts      │       │
└────────────┬────────────┘       │
             │ 1:N                │
             ▼                    │
┌─────────────────────────┐       │
│    question_attempts    │◄──────┘
└────────────┬────────────┘
             │ 1:1
             ▼
┌─────────────────────────┐
│       recordings        │ (90-Day Retention, GDrive/Local Storage)
└─────────────────────────┘
```

---

## 2. Table Specifications & Indexes

### `organizations`
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255)
- `slug`: VARCHAR(100) — Unique index
- `description`: TEXT
- `is_active`: BOOLEAN

### `users`
- `id`: UUID (Primary Key)
- `organization_id`: UUID (Foreign Key -> `organizations.id` ON DELETE CASCADE) — Indexed
- `firebase_uid`: VARCHAR(128) — Unique index
- `email`: VARCHAR(255) — Unique index
- `hashed_password`: VARCHAR(255)
- `full_name`: VARCHAR(255)
- `role`: VARCHAR(30) (`SUPER_ADMIN`, `ADMIN`, `INTERVIEWER`, `CANDIDATE`) — Indexed
- `is_active`: BOOLEAN

### `candidates`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id` ON DELETE CASCADE) — Unique index
- `organization_id`: UUID (Foreign Key -> `organizations.id`) — Indexed
- `student_id`: VARCHAR(100) — Indexed
- `course`, `batch`, `experience_level`, `target_role`

### `job_descriptions`
- `id`: UUID (Primary Key)
- `organization_id`: UUID — Indexed
- `title`: VARCHAR(255) — Indexed
- `raw_description`: TEXT
- `skills_json`: JSON
- `technologies_json`: JSON
- `responsibilities_json`: JSON
- `experience_level`: VARCHAR(50)
- `target_role`: VARCHAR(100)

### `interview_templates`
- `id`: UUID (Primary Key)
- `organization_id`: UUID — Indexed
- `job_description_id`: UUID (Foreign Key -> `job_descriptions.id` ON DELETE SET NULL)
- `title`: VARCHAR(255) — Indexed
- `target_role`: VARCHAR(100)
- `passing_score`: FLOAT (Default 80.0)
- `status`: VARCHAR(30) (`ACTIVE`, `DRAFT`, `ARCHIVED`)

### `interview_stages`
- `id`: UUID (Primary Key)
- `interview_template_id`: UUID (Foreign Key -> `interview_templates.id` ON DELETE CASCADE) — Indexed
- `stage_number`: INTEGER
- `title`: VARCHAR(255)
- `category`: VARCHAR(100)
- `minimum_score`: FLOAT (Default 80.0)
- `unlock_rule`: VARCHAR(50) (`PASS_PREVIOUS_STAGE`)

### `questions`
- `id`: UUID (Primary Key)
- `interview_stage_id`: UUID (Foreign Key -> `interview_stages.id` ON DELETE CASCADE) — Indexed
- `order_index`: INTEGER
- `question_text`: TEXT
- `question_type`: VARCHAR(50) (`CONCEPTUAL`, `PRACTICAL`, `TROUBLESHOOTING`, `SCENARIO`, `COMMAND`)
- `difficulty`: VARCHAR(30) (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`)
- `skill_category`: VARCHAR(100)
- `expected_topics`: JSON
- `reference_answer`: TEXT (Internal only, never returned to candidates)
- `evaluation_rubric`: JSON
- `follow_up_question`: TEXT

### `interview_attempts`
- `id`: UUID (Primary Key)
- `candidate_id`: UUID — Indexed
- `interview_template_id`: UUID — Indexed
- `organization_id`: UUID — Indexed
- `status`: VARCHAR(50) (`IN_PROGRESS`, `COMPLETED`, `ABANDONED`) — Indexed
- `current_stage_number`: FLOAT
- `overall_score`, `technical_score`, `communication_score`, `confidence_score`
- `decision`: VARCHAR(50) (`PASS`, `NEEDS_IMPROVEMENT`, `FAILED`)
- `summary_report_json`: JSON
- `started_at`, `completed_at`, `created_at` — Indexed

### `stage_attempts`
- `id`: UUID (Primary Key)
- `interview_attempt_id`: UUID (Foreign Key -> `interview_attempts.id` ON DELETE CASCADE) — Indexed
- `interview_stage_id`: UUID (Foreign Key -> `interview_stages.id`) — Indexed
- `stage_number`: INTEGER
- `status`: VARCHAR(50) (`LOCKED`, `NOT_STARTED`, `IN_PROGRESS`, `PASSED`, `FAILED`) — Indexed
- `score`: FLOAT
- `is_override`: BOOLEAN (Default False)
- `override_reason`: TEXT
- `override_by`: UUID

### `question_attempts`
- `id`: UUID (Primary Key)
- `stage_attempt_id`: UUID (Foreign Key -> `stage_attempts.id` ON DELETE CASCADE) — Indexed
- `interview_attempt_id`: UUID — Indexed
- `question_id`: UUID — Indexed
- `question_text_snapshot`: TEXT (Immutable copy preserving historical audit integrity)
- `answer_transcript`: TEXT
- `recording_id`: UUID (Foreign Key -> `recordings.id` ON DELETE SET NULL) — Indexed
- `status`: VARCHAR(30) (`PENDING`, `EVALUATED`, `FAILED`)
- `technical_score`, `concept_coverage_score`, `reasoning_score`, `practical_score`, `communication_score`, `confidence_score`, `overall_score`
- `evaluation_json`: JSON

### `recordings`
- `id`: UUID (Primary Key)
- `candidate_id`: UUID — Indexed
- `interview_attempt_id`: UUID — Indexed
- `storage_provider`: VARCHAR(50) (`local`, `google_drive`, `s3`)
- `google_drive_file_id`: VARCHAR(255) — Indexed
- `local_file_path`: VARCHAR(512)
- `file_size_bytes`: INTEGER
- `duration_seconds`: FLOAT
- `expires_at`: DATETIME (`created_at + 90 days`) — Indexed
- `deleted_at`: DATETIME — Indexed
- `deletion_status`: VARCHAR(50) (`ACTIVE`, `RETENTION_PURGED`) — Indexed

### `audit_logs`
- `id`: UUID (Primary Key)
- `organization_id`: UUID — Indexed
- `user_id`: UUID — Indexed
- `action`: VARCHAR(100) — Indexed
- `entity_type`: VARCHAR(100) — Indexed
- `entity_id`: UUID — Indexed
- `details`: JSON
