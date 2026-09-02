# CloudOps AI Assessment Platform — System Architecture

## 1. High-Level Architecture Overview

The CloudOps AI Assessment Platform is an enterprise-ready, AI-driven assessment engine designed to test, record, transcribe, grade, and coach candidates interviewing for Cloud Operations, DevOps, SRE, and Systems Engineering roles.

```
                           ┌────────────────────────────────────────┐
                           │            Candidate Tier              │
                           │  Next.js 14 (App Router, TypeScript)   │
                           │  Webcam + Mic (MediaRecorder API)      │
                           │  Web Audio Visualizer + Speech Synth   │
                           └──────────────────┬─────────────────────┘
                                              │ HTTPS / JSON / Binary
                                              ▼
                           ┌────────────────────────────────────────┐
                           │             FastAPI Gateway            │
                           │  Async SQLAlchemy 2.0 + Pydantic v2    │
                           │  Firebase JWT & RBAC Auth Middleware   │
                           └──────────────────┬─────────────────────┘
                                              │
        ┌─────────────────────────┬───────────┴───────────┬─────────────────────────┐
        ▼                         ▼                       ▼                         ▼
┌───────────────┐         ┌───────────────┐       ┌───────────────┐         ┌───────────────┐
│ PostgreSQL    │         │ AI LLM Engine │       │ Speech-to-Text│         │ Storage Layer │
│ (Neon-Ready)  │         │ (Abstracted)  │       │ (Abstracted)  │         │ (Abstracted)  │
│ Multi-Tenant  │         │ Ollama/OpenAI/│       │ Whisper/      │         │ Google Drive/ │
│ 50k+ Users    │         │ Mock Provider │       │ Faster-Whisper│         │ Local Storage │
└───────────────┘         └───────────────┘       └───────────────┘         └───────────────┘
```

---

## 2. Multi-Tenant SaaS Architecture

Although initialized with a default internal organization (`organizations.slug = 'default'`), every core database entity and API endpoint is strictly tenant-scoped via `organization_id`:

- `organizations`: Root tenant container.
- `users`: Associated with an organization; roles: `SUPER_ADMIN`, `ADMIN`, `INTERVIEWER`, `CANDIDATE`.
- `job_descriptions`: Tenant-specific JD storage and skill maps.
- `interview_templates`: Customizable multi-stage blueprints.
- `interview_attempts`: Student assessment sessions.
- `recordings`: Video chunk metadata linked to candidates and tenant storage.
- `audit_logs`: Compliance trails and admin overrides.

---

## 3. Scale Architecture: Supporting 50,000+ Registered Users

The architecture achieves high scale through stateless service design and optimized database query patterns:

1. **Stateless API Gateway**: FastAPI instances maintain no in-memory session state. All session progression is persisted in the PostgreSQL database.
2. **Chunked Media Recording**: Rather than streaming a monolithic 1-hour video file, candidate answers are captured per-question in individual WebM blobs, minimizing upload failure blast radius.
3. **Storage Decoupling**: Large video binaries are stored in Google Drive or object storage. PostgreSQL only stores lightweight recording metadata, duration, file size, and expiration timestamps.
4. **Optimized B-Tree Indexing**: Explicit database indexes on `(organization_id, user_id)`, `(interview_attempt_id, stage_id)`, `(created_at, status)`, and `(expires_at, deleted_at)` ensure sub-millisecond query execution even at hundreds of thousands of attempt records.
5. **Background Task Isolation**: Speech transcription and LLM evaluation execute asynchronously without blocking API request threads.

---

## 4. Pluggable Provider Architecture

To avoid vendor lock-in, all external dependencies are built behind abstract interfaces:

- **`AIProvider`**: `analyze_job_description()`, `generate_questions()`, `evaluate_answer()`, `generate_feedback_and_plan()`. Concrete providers: `OllamaAIProvider`, `OpenAIProvider`, `MockAIProvider`.
- **`SpeechToTextProvider`**: `transcribe()`. Concrete providers: `WhisperSTTProvider`, `MockSTTProvider`.
- **`StorageProvider`**: `upload_file()`, `get_download_or_view_url()`, `delete_file()`. Concrete providers: `GoogleDriveStorageProvider`, `LocalStorageProvider`.
