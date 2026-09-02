# AI-Powered CloudOps & DevOps Interview & Assessment Platform

[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Ready-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

A production-oriented, AI-powered interview and skill assessment platform designed for candidates and students training for **Cloud Operations, DevOps, Site Reliability Engineering (SRE), and Infrastructure Engineering** roles.

Architected to scale seamlessly to **50,000+ registered users** and transition into a multi-tenant SaaS assessment ecosystem.

---

## 🌟 Key Platform Features

1. **AI Interviewer Chamber**: Spoken audio questions delivered via AI Voice synthesis with live webcam preview and real-time audio waveform visualizers.
2. **5-Pillar Evaluation Rubric**: Automated grading across Technical Accuracy (40%), Concept Coverage (25%), Reasoning Quality (20%), Practical Knowledge (10%), and Communication Clarity (5%).
3. **Observable Communication & Confidence Analysis**: Analyzes speech pacing (WPM), filler word frequency, and hesitation markers (strictly non-psychological, privacy-first).
4. **Strict 80% Stage Gate Unlocking**: Multi-stage assessment (Stage 1 to 4) where subsequent stages remain locked until the candidate scores $\ge 80\%$, with full administrator manual override capabilities.
5. **Personalized 30-Day Learning Roadmap**: Automated synthesis of weekly study sprints targeting candidate-specific knowledge gaps with direct links to official documentation and hands-on lab challenges.
6. **Automated 90-Day Recording Retention**: Idempotent background cleaner purges video chunk files older than 90 days from Google Drive / storage while preserving audit metadata.
7. **AI Job Description Ingestion**: Ingest raw job descriptions to automatically extract skill maps and generate customized 4-stage interview blueprints with gold-standard grading rubrics.
8. **Admin Intelligence Suite**: Aggregate cohort analytics, stage-wise pass rate tracking, knowledge gap heatmaps, and full candidate recording review with manual stage override.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      Client Tier       │
                                  │ Next.js 14+ App Router │
                                  │ TypeScript / Tailwind  │
                                  │ Zustand / TanStack Q   │
                                  └───────────┬────────────┘
                                              │ HTTPS / REST
                                              ▼
                                  ┌────────────────────────┐
                                  │     FastAPI Gateway    │
                                  │  Auth & RBAC Middleware│
                                  │  Pydantic V2 Schemas   │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      │                       │                       │
                      ▼                       ▼                       ▼
            ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
            │  Database Layer   │   │  Provider Layer   │   │ Background Tasks  │
            │  PostgreSQL (Neon)│   │  (Extensible ABC) │   │ Async Task Queue  │
            │  SQLAlchemy Async │   │ - AI LLM Engine   │   │ - STT Extraction  │
            │  Alembic Migration│   │ - Speech-To-Text  │   │ - AI Evaluation   │
            │  Multi-Tenant Org │   │ - Voice TTS       │   │ - Retention Clean │
            └───────────────────┘   │ - Cloud Storage   │   │ - Report Synthesis│
                                    └───────────────────┘   └───────────────────┘
```

---

## 🚀 Quickstart & Setup

### Option 1: Full Stack with Docker Compose
```bash
# Launch PostgreSQL, FastAPI backend, and Next.js frontend
cd docker
docker-compose up -d --build
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development Setup

#### 1. Backend Setup:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run initial database migrations and sample data seeding
python -m app.seeds.initial_data

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Accounts

The database comes pre-populated with default credentials and pre-configured CloudOps & DevOps interview blueprints:

| Role | Email | Password | Description |
|---|---|---|---|
| **Administrator** | `admin@cloudops.internal` | `Admin@12345` | Full access to aggregate analytics, blueprint builder, audit logs, and stage overrides. |
| **Candidate / Student** | `candidate@cloudops.internal` | `Candidate@12345` | Student profile enrolled in Cloud & DevOps Engineering Immersive (Cohort 2026-A). |

> **Note**: The login screen also features an **Instant One-Click Demo Role Switcher** for instant friction-free testing.

---

## 🧪 Testing

The repository contains an asynchronous test suite verifying:
- Strict 80% stage gate locking/unlocking rules (79% fails vs 80% passes).
- 5-Pillar evaluation weight calculations.
- Observable verbal communication & confidence analysis.
- 90-day recording retention expiration and idempotent cleanup.
- Administrative manual stage override with audit trail.

To run tests:
```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/ -v
```

---

## 📁 Repository Structure

```
cloudOSS/
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST API route handlers
│   │   ├── core/           # Security, config, database engine
│   │   ├── models/         # SQLAlchemy 2.0 async domain models
│   │   ├── schemas/        # Pydantic v2 validation schemas
│   │   ├── services/       # Core business logic & assessment orchestration
│   │   ├── ai/             # Pluggable AI engine (Ollama, OpenAI, Mock)
│   │   ├── speech/         # Speech-to-text providers (Whisper, Mock)
│   │   ├── storage/        # Cloud storage (Google Drive, Local)
│   │   ├── tasks/          # 90-day retention cleanup & background workers
│   │   ├── seeds/          # Sample CloudOps & DevOps blueprints
│   │   └── main.py         # FastAPI entry point
│   ├── tests/              # Pytest automated test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/                # Next.js 14 App Router (Auth, Dashboard, Room, Results, Admin)
│   ├── components/         # UI components (Avatar, Waveform, Webcam, Radar, Roadmap)
│   ├── lib/                # API client, Zustand stores, MediaRecorder
│   ├── types/              # TypeScript interfaces
│   ├── tailwind.config.ts
│   ├── package.json
│   └── Dockerfile
├── docs/
│   ├── architecture.md     # Multi-tenant and 50k users scale architecture
│   ├── api.md              # REST API endpoint reference
│   ├── database.md         # Data models, schema, and indexes
│   ├── ai_pipeline.md      # 5-Pillar rubric, confidence analysis, retention
│   └── deployment.md       # Neon, Google Drive API, and production setup
├── docker/
│   └── docker-compose.yml
└── README.md
```

---

## 📚 Technical Documentation

For detailed technical specifications, explore the `/docs` directory:
- [Architecture & Multi-Tenancy Design](file:///mnt/d/HP%20Shared/All%20Freelance%20Projects/cloudOSS/docs/architecture.md)
- [REST API Reference](file:///mnt/d/HP%20Shared/All%20Freelance%20Projects/cloudOSS/docs/api.md)
- [Database Schema & Indexes](file:///mnt/d/HP%20Shared/All%20Freelance%20Projects/cloudOSS/docs/database.md)
- [AI Evaluation & Communication Pipeline](file:///mnt/d/HP%20Shared/All%20Freelance%20Projects/cloudOSS/docs/ai_pipeline.md)
- [Production Deployment Guide](file:///mnt/d/HP%20Shared/All%20Freelance%20Projects/cloudOSS/docs/deployment.md)
