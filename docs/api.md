# CloudOps AI Assessment Platform — API Reference

All API routes are prefixed with `/api/v1`. Interactive Swagger documentation is available at `/docs` and ReDoc at `/redoc`.

---

## Authentication Endpoints (`/api/v1/auth`)

### 1. Register User
`POST /api/v1/auth/register`
```json
{
  "email": "student@cloudops.internal",
  "full_name": "Jane Doe",
  "password": "SecurePassword123",
  "role": "CANDIDATE"
}
```

### 2. Login (Credentials)
`POST /api/v1/auth/login`
```json
{
  "email": "candidate@cloudops.internal",
  "password": "Candidate@12345"
}
```

### 3. Instant Demo Login (Zero Setup)
`POST /api/v1/auth/mock-login`
```json
{
  "role": "CANDIDATE",
  "email": "candidate@cloudops.internal",
  "name": "Sarah Jenkins (Student)"
}
```

### 4. Get Current User Profile
`GET /api/v1/auth/me`
*Headers: `Authorization: Bearer <token>`*

---

## Job Descriptions & Blueprint Ingestion (`/api/v1/job-descriptions`)

### 1. AI Parse & Analyze Job Description
`POST /api/v1/job-descriptions/analyze`
```json
{
  "title": "CloudOps Engineer",
  "raw_description": "We need a CloudOps engineer skilled in AWS, Linux, Kubernetes, Terraform, and Prometheus...",
  "experience_level": "MID"
}
```

### 2. Generate Full 4-Stage Blueprint from JD
`POST /api/v1/job-descriptions/{jd_id}/generate-template`

---

## Interview Templates & Stages (`/api/v1/interviews`)

### 1. List Templates
`GET /api/v1/interviews/templates`

### 2. Get Template Blueprint Details
`GET /api/v1/interviews/templates/{template_id}`

---

## Live Assessment & Attempt Execution (`/api/v1/attempts`)

### 1. Start Interview Attempt
`POST /api/v1/attempts/start`
```json
{
  "interview_template_id": "template_uuid_here"
}
```

### 2. Get Attempt State & Stages
`GET /api/v1/attempts/{attempt_id}`

### 3. Submit Question Recording (Multipart / Audio Blob)
`POST /api/v1/attempts/{attempt_id}/questions/{q_attempt_id}/submit-recording`
- Form fields: `recording_file` (Binary WebM blob), `duration_seconds` (Float), `transcript` (Optional text).

### 4. Submit Question Answer (JSON / Fallback Text)
`POST /api/v1/attempts/{attempt_id}/questions/{q_attempt_id}/submit-json`
```json
{
  "transcript": "I would run top to inspect CPU wait, then iotop to isolate the offending PID...",
  "duration_seconds": 25.0
}
```

### 5. Evaluate Stage Gate & Unlock Next Stage
`POST /api/v1/attempts/{attempt_id}/stages/{s_attempt_id}/evaluate-and-advance`
- Enforces ≥ 80% passing threshold to unlock subsequent stage.

---

## Reports & 30-Day Roadmaps (`/api/v1/reports`)

### 1. Candidate Final Report & 30-Day Plan
`GET /api/v1/reports/{attempt_id}/candidate`

### 2. Admin Audit & Full Transcript Report
`GET /api/v1/reports/{attempt_id}/admin`

---

## Admin Suite & Analytics (`/api/v1/admin`)

### 1. Aggregate Analytics Dashboard
`GET /api/v1/admin/analytics/overview`

### 2. Manual Stage Decision Override
`POST /api/v1/admin/stages/{stage_attempt_id}/override`
```json
{
  "new_status": "PASSED",
  "override_score": 85.0,
  "override_reason": "Candidate demonstrated equivalent CLI command during verbal follow-up."
}
```

### 3. Trigger 90-Day Recording Retention Purge
`POST /api/v1/admin/recordings/trigger-cleanup`
