# 🚀 CloudOps AI Assessment OS — Production AI Interview & Career Operating System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Ready-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN%20Storage-blue.svg?style=flat&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![AiSensy](https://img.shields.io/badge/WhatsApp-AiSensy%20OTP-25D366.svg?style=flat&logo=whatsapp&logoColor=white)](https://aisensy.com)

A production-grade, AI-powered interview and skill assessment Operating System designed for candidates training for **Cloud Operations, DevOps, Site Reliability Engineering (SRE), and DevSecOps** careers.

Engineered with a high-performance **Next.js 14 frontend microservice** deployed on Vercel and an asynchronous **FastAPI backend** deployed on Render, backed by **Neon Serverless PostgreSQL** and **Cloudinary CDN**.

---

## 🌐 Live Production Deployments

| Component | Production URL | Status |
|---|---|---|
| **🎓 Candidate Assessment Portal** | [https://resume3-0-mu.vercel.app](https://resume3-0-mu.vercel.app) | 🟢 Live |
| **🛡️ Dedicated Admin Control Suite** | [https://resume3-admin.vercel.app](https://resume3-admin.vercel.app) | 🟢 Live |
| **⚡ Production FastAPI Gateway** | [https://resume3-0.onrender.com/api/v1](https://resume3-0.onrender.com/api/v1) | 🟢 Live |
| **📚 Interactive Swagger API Docs** | [https://resume3-0.onrender.com/docs](https://resume3-0.onrender.com/docs) | 🟢 Live |

---

## 🌟 Core Platform Innovations

### 1. 📲 Seamless WhatsApp & Mobile OTP Authentication
- Instant 6-digit OTP delivery via **AiSensy WhatsApp Business API** and SMS.
- Deterministic priority user lookup: Phone digits are normalized (+91 and 10-digit formats) with strict phone-first priority matching.
- Built-in duplicate key collision protection: Gracefully merges existing accounts and prevents PostgreSQL `ix_users_phone_number` unique constraint collisions.
- CORS-enabled global error handling ensuring clients never experience blank `Failed to fetch` network errors.

### 2. 🎙️ High-Fidelity Speech-to-Text Recognition
- Dual-segment speech transcription engine differentiating **finalized phrases (`isFinal`)** from **interim speech guesses**.
- Session-restart protection: Chrome auto-restarts speech sessions on pauses without dropping previously spoken sentences or jumbling words.
- Normalized spacing and punctuation filtering to prevent words from concatenating together.
- Instant, non-blocking microphone stop controls.

### 3. ⚡ Sub-15ms Instant Answer Evaluation
- Instantaneous candidate feedback: Answers are semantically matched against benchmark answers and expected concepts in **< 15 milliseconds**.
- Non-blocking asynchronous database synchronization: Results and candidate XP are committed to Neon PostgreSQL in the background without freezing the UI.
- Multi-tier AI resilience: Powered by OpenAI GPT-4o-mini with auto-adaptive instant fallback to a deterministic semantic engine if API limits or network drops occur.

### 4. 🎯 30-Stage Group-Wise Assessment Matrix
- Organized into 5 distinct difficulty tracks:
  - **Track 1:** Linux Fundamentals & Cloud Primitives
  - **Track 2:** Multi-Cloud Architecture (AWS, Azure, GCP)
  - **Track 3:** DevOps CI/CD Pipelines & Infrastructure as Code (Terraform)
  - **Track 4:** Production Incident Operations & SRE Runbooks
  - **Track 5:** 40 LPA Multi-Cloud Boss Battles
- Automated stage gatekeeping: Advances candidates upon achieving $\ge 60\%$ concept mastery.

### 5. 📄 6-Factor ATS Resume Analyzer & Bullet Rewriter
- Scans uploaded PDF/DOCX resumes against target CloudOps/DevOps job descriptions.
- Highlights missing keywords, experience gaps, and generates quantified STAR-formula rewrites.
- Direct Cloudinary integration with `resource_type="raw"` support for safe PDF storage and delivery.

### 6. 🏆 Candidate Experience & Community Hub
- Daily practice streak counters and XP leveling system.
- Direct integration links for scheduled Live Masterclass Zoom rooms and official candidate WhatsApp communities.
- In-portal Help & Support ticket system with real-time Admin inbox resolution.

---

## 🔑 Default Test Accounts

| Role | Identifier / Email | Password / OTP | Portal |
|---|---|---|---|
| **🛡️ Administrator** | `admin@cloudops.internal` | `Admin@12345` | [Admin Portal](https://resume3-admin.vercel.app) |
| **🎓 Candidate User** | `+91 6264384464` | WhatsApp OTP / `622601` | [Candidate Portal](https://resume3-0-mu.vercel.app/login) |
| **🎓 Demo Candidate** | `sachin@cloudops.internal` | `Sachin@12345` | [Candidate Portal](https://resume3-0-mu.vercel.app/login) |

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────┐
                               │   Candidate Web App (Vercel)   │
                               │  https://resume3-0-mu.vercel.app │
                               └───────────────┬────────────────┘
                                               │ HTTPS / REST
                                               ▼
                               ┌────────────────────────────────┐
                               │    FastAPI Gateway (Render)    │
                               │ https://resume3-0.onrender.com │
                               │  CORS + Telemetry + Pydantic   │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐           ┌───────────────────┐
     │  Database Layer   │           │   Media & Files   │           │  AI & Messaging   │
     │  PostgreSQL (Neon)│           │  Cloudinary CDN   │           │ OpenAI GPT-4o-mini│
     │  SQLAlchemy Async │           │  Video/Audio/PDF  │           │ AiSensy WhatsApp  │
     └───────────────────┘           └───────────────────┘           └───────────────────┘
```

---

## 🛠️ Local Development & Quickstart

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- PostgreSQL or Neon Serverless DB instance

### 2. Backend Setup:
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure backend/.env with your DATABASE_URL, OPENAI_API_KEY, etc.

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure frontend/.env with NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run backend unit tests and verification scripts:
```bash
# Verify database connection and OTP verification flow
python scratch/test_verify_otp_flow.py

# Verify AI evaluation latency and fallback speed
python scratch/test_eval_speed.py

# Frontend TypeScript check
cd frontend && npx tsc --noEmit
```

---

## 📄 License & Attribution

Designed and engineered for Cloud Operations & DevOps career training. Built for multi-tenant scalability, high-availability, and zero-downtime evaluation resilience. 🚀
