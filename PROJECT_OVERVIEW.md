# 🚀 CloudOps AI Assessment & Career OS — Project Documentation

## 📌 Project Overview & Purpose (Basis of Project)

The **CloudOps AI Assessment Platform** is a production-grade, AI-powered technical interview and skill evaluation Operating System tailored specifically for **Cloud Operations, DevOps, DevSecOps, and SRE Engineers**.

### 🎯 Core Mission:
Traditional hiring relies on generic questionnaires and superficial resumes. This platform bridges the gap between candidate preparation and enterprise hiring by providing:
1. **Real-time Voice AI Technical Interviews** with 5-pillar objective scoring rubrics.
2. **Automated 6-Factor Resume ATS Screening** with STAR-formula bullet-point rewrites.
3. **80% Stage-Gated Progression System** (Candidates must score ≥80% to unlock successive interview rounds up to the Production Incident Final Boss).
4. **Target Salary Tier:** ₹18–40 LPA High-CTC Engineering roles.

---

## 🛠️ Complete Tech Stack & Skills Used

### 1. Backend Architecture (Python & FastAPI)
* **Framework:** Python 3.14 + FastAPI (Async RESTful microservices architecture).
* **ORM & Database Client:** SQLAlchemy 2.0 (Async) + `asyncpg` driver.
* **Data Validation:** Pydantic v2 schemas + `pydantic-settings`.
* **Security & Auth:** OAuth2 Password Bearer, JWT (JSON Web Tokens), `passlib` bcrypt password hashing, and Firebase Admin ID Token verification.
* **Testing:** `pytest` unit test suite covering stage gating, ATS math, retention cleanup, and admin overrides.

### 2. Database & Cloud Infrastructure
* **Database:** **Neon Cloud PostgreSQL** (Serverless cloud PostgreSQL instance with SSL mode enabled).
* **Media & Document Storage:** **Cloudinary Cloud Storage** (Direct upload integration for PDF/DOCX resumes and recorded audio interview clips).
* **Firebase Ecosystem:**
  * **Firebase Admin SDK:** Server-side verification for phone OTP logins.
  * **Firebase Web SDK:** Client-side reCAPTCHA & Phone SMS OTP authentication.
  * **Firebase Rules:** `firestore.rules`, `storage.rules`, and `firebase.json` for security compliance.

### 3. Artificial Intelligence & Speech Engine
* **AI Provider:** **OpenAI GPT-4o-Mini** (Used for 5-pillar interview answer evaluation, STAR bullet rewriting, 30-day roadmap generation, and ATS scoring).
* **Speech-to-Text (STT):** **Whisper Engine / OpenAI STT** (Transcribes candidate spoken audio into text with Words Per Minute [WPM] pacing calculation).

### 4. Frontend Web Application (Next.js & Modern UI)
* **Framework:** Next.js 14 (App Router) + React 18 + TypeScript.
* **State Management:** Zustand (Persistent auth state & candidate progress).
* **Styling & Design System:**
  * **SovoHR Royal Blue Corporate SaaS Theme** (Vibrant royal blue `#1D4ED8` -> `#2563EB`, ice-blue `#F8FAFC` background, rounded glass cards).
  * **Dual Theme Engine:** Light Mode (Default) & Dark Mode (Deep Midnight) with smooth `ThemeToggle` switcher and `localStorage` persistence.
  * **Typography:** Google Fonts `Plus Jakarta Sans` & `Inter`.
* **Icons:** `lucide-react` modern icon library.

---

## 🔑 Key Features & How They Work

### 1. 5-Stage Gated Interview Progression System
Candidates cannot skip directly to advanced rounds. They must clear each stage with an **80% minimum score**:
1. **Stage 1: Profile & Career Pitch** (90-second intro, past achievements).
2. **Stage 2: Linux Systems Warrior** (Kernel sockets, systemd, process triage, disk I/O wait).
3. **Stage 3: Multi-Cloud Architecture** (AWS VPC subnets, NAT Gateways, IAM STS, IRSA).
4. **Stage 4: DevOps & Containers** (Multi-stage Docker builds, Kubernetes EKS manifests, Canary releases).
5. **Stage 5: Production Incident Boss Battle** (CrashLoopBackOff triage, 502/504 outage response).

### 2. 5-Pillar Voice Interview Evaluation Rubric
Every spoken answer is evaluated across 5 weighted pillars:
- **Technical Accuracy (35%):** Correctness of technical concepts and commands.
- **Depth of Knowledge (25%):** System internals and edge cases.
- **Problem-Solving Approach (20%):** Logical troubleshooting methodology.
- **Communication Clarity (10%):** Structuring of explanation.
- **Speech Pacing WPM (10%):** Ideal cadence (120–160 WPM).

### 3. Resume ATS Analyzer & STAR Metric Rewriter
- Extracts skills from uploaded PDF/DOCX or pasted text.
- Scores resume against any target DevOps Job Description (JD).
- Detects missing critical keywords (e.g., Terraform state locking, Trivy DevSecOps).
- Automatically rewrites weak resume bullet points using the **STAR formula** (Situation, Task, Action, Result) with quantified metrics.

### 4. Leaderboard & Gamification OS
- Calculates total candidate **XP (Experience Points)**, level tiers, streak days, and readiness scores.
- Ranks candidates across global cohort leaderboards and specific tech tracks (AWS, Kubernetes, Terraform, Linux).

---

## 📁 Repository Directory Structure

```
d:\AI_Interview3.0\
├── backend/
│   ├── app/
│   │   ├── api/v1/         # REST API Endpoints (Auth, Resumes, Interviews, Leaderboard)
│   │   ├── core/           # Config, Database Engine, Security
│   │   ├── models/         # SQLAlchemy DB Models (User, Candidate, Stage, Evaluation)
│   │   ├── schemas/        # Pydantic Request/Response Data Validation Schemas
│   │   ├── services/       # Core Business Logic (Auth, ATS Engine, Interview OS)
│   │   ├── speech/         # Whisper Speech-to-Text STT Integration
│   │   └── storage/        # Cloudinary Storage Provider
│   ├── tests/              # Pytest Unit & Integration Test Suite
│   ├── firebase_service_account.json
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js App Router Pages (Landing, Login, Dashboard, Resume ATS, Leaderboard)
│   ├── components/         # Reusable UI Components (Navbar, ThemeToggle, Cards)
│   ├── lib/                # API Client, Firebase Web SDK, Zustand Auth Store
│   └── globals.css         # SovoHR Royal Blue Light/Dark Design System
├── firestore.rules
├── storage.rules
├── firebase.json
└── PROJECT_OVERVIEW.md
```

---

## ⚡ How to Run the Platform Locally

### 1. Backend Server (FastAPI on Port 8000)
```powershell
cd d:\AI_Interview3.0\backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```

### 2. Frontend App (Next.js on Port 3001)
```powershell
cd d:\AI_Interview3.0\frontend
npx next dev -p 3001
```

---

## 🏆 Project Deliverable Summary
- **Database:** Live Neon Cloud PostgreSQL (`postgresql://neondb_owner:...`).
- **AI Model:** Real OpenAI GPT-4o-Mini connected & verified.
- **Cloud Storage:** Cloudinary integration connected & verified.
- **Design System:** SovoHR Royal Blue Theme with Light/Dark Mode Toggle.
- **Test Status:** 8/8 `pytest` suites PASS, 100% Live API integration PASS.
