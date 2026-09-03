# 🚀 CloudOps AI Assessment OS — Microservice Architecture & Assessment Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Ready-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN%20Storage-blue.svg?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28.svg?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com)

A production-oriented, AI-powered interview and skill assessment Operating System designed for candidates training for **Cloud Operations, DevOps, Site Reliability Engineering (SRE), and DevSecOps** roles.

Architected with a dual-microservice frontend structure deployed on Vercel and a FastAPI backend deployed on Render.

---

## 🌐 Live Microservice Deployments

* **🎓 Candidate Microservice Portal**: [https://resume3-0.vercel.app](https://resume3-0.vercel.app)
* **🛡️ Dedicated Admin Suite**: [https://resume3-admin.vercel.app](https://resume3-admin.vercel.app)
* **⚡ FastAPI Backend Gateway**: [https://resume3-0.onrender.com/api/v1](https://resume3-0.onrender.com/api/v1)
* **📚 Interactive Swagger API Docs**: [https://resume3-0.onrender.com/docs](https://resume3-0.onrender.com/docs)

---

## 🌟 Core System Features

1. **AI Voice Interviewer Chamber**: Spoken audio questions delivered via AI Voice synthesis with WebRTC microphone stream capture and real-time audio waveform visualizers.
2. **5-Pillar Evaluation Rubric**: Automated grading across Technical Accuracy (40%), Concept Coverage (25%), Reasoning Quality (20%), Practical Knowledge (10%), and Communication Clarity (5%).
3. **Strict 80% Stage-Gate Progression**: Multi-stage assessment (Stage 1 to 5) where subsequent stages remain locked until candidate scores $\ge 80\%$, with full administrator manual override capabilities.
4. **Automated 6-Factor Resume ATS Screening**: Scans resumes against target job descriptions, identifies missing keywords, and generates STAR-formula bullet-point rewrites with quantified metrics.
5. **🎫 Real-Time Support Tickets Inbox**: Candidates submit technical help tickets from Candidate Portal (`/help`); Admin manages, filters, inspects, and updates ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) from Admin Inbox (`resume3-admin.vercel.app/help`).
6. **🧹 90-Day Recording Retention Purge**: Idempotent background cleaner purges video/audio chunk files older than 90 days from Cloudinary CDN storage while retaining audit logs.
7. **JD-to-Template Blueprint Builder**: Ingest raw job descriptions to automatically extract skill maps and generate customized 5-stage interview blueprints.

---

## 🔑 Verified Active Accounts

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **🛡️ Administrator** | `admin@cloudops.internal` | `Admin@12345` | Dedicated Admin Portal (`resume3-admin.vercel.app`) |
| **🎓 Candidate** | `sachin@cloudops.internal` | `Sachin@12345` | Candidate Portal (`resume3-0.vercel.app`) |

---

## 🏗️ 3-Tier Multi-Cloud Architecture

```
                                  ┌────────────────────────┐
                                  │      Client Tier       │
                                  │ Next.js 14 App Router  │
                                  │  Candidate & Admin FE  │
                                  └───────────┬────────────┘
                                              │ HTTPS / REST
                                              ▼
                                  ┌────────────────────────┐
                                  │     FastAPI Gateway    │
                                  │ CORS Vercel Middleware │
                                  │  Pydantic V2 Schemas   │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┼───────────────────────┐
                      │                       │                       │
                      ▼                       ▼                       ▼
            ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
            │  Database Layer   │   │ Cloudinary Media  │   │   Firebase Auth   │
            │  PostgreSQL (Neon)│   │  Audio/Video CDN  │   │ User Registration │
            │  SQLAlchemy Async │   │  Resume Documents │   │ Token Sync        │
            └───────────────────┘   └───────────────────┘   └───────────────────┘
```

---

## ⚡ Quickstart & Setup

### 1. Backend Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Run initial database migrations and data seeding
python -c "import asyncio; from app.seeds.initial_data import seed_database; asyncio.run(seed_database())"

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) or [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📄 License & Attribution

Architected for Cloud Operations & DevOps skill evaluations. Engineered for high reliability, zero hardcoded fallback protection, and multi-tenant scalability. 🚀
