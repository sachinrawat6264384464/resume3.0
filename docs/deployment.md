# CloudOps AI Assessment Platform — Production Deployment Guide

## 1. Prerequisites
- Docker & Docker Compose (or Kubernetes / Managed Cloud Run / AWS ECS)
- PostgreSQL (Neon Serverless PostgreSQL or AWS RDS Aurora)
- Optional: Google Cloud Service Account (for Google Drive recording backups)
- Optional: Firebase Project (for Firebase Authentication)

---

## 2. Quickstart with Docker Compose

```bash
# Clone repository
git clone https://github.com/cloudops-assessment/platform.git
cd platform

# Launch full stack (Postgres + FastAPI + Next.js)
cd docker
docker-compose up -d --build
```
- Frontend will be accessible at: `http://localhost:3000`
- Backend API will be accessible at: `http://localhost:8000`
- API Interactive Docs: `http://localhost:8000/docs`

---

## 3. Neon PostgreSQL Configuration

1. Create a serverless PostgreSQL instance on [Neon](https://neon.tech).
2. Copy your pooled connection string:
   ```env
   DATABASE_URL="postgresql+asyncpg://user:password@ep-sparkling-pool-123456.us-east-2.aws.neon.tech/cloudops_interview?ssl=require"
   ```
3. Set `DATABASE_URL` in `backend/.env`.

---

## 4. Google Drive API Service Account Setup

To enable candidate recordings to stream into a dedicated Google Drive folder hierarchy:

1. Enable the **Google Drive API** in Google Cloud Console.
2. Create a **Service Account** with Role: `Project > Editor` or grant access to the target Google Drive folder.
3. Download the Service Account Key JSON file to `backend/credentials/google_drive_sa.json`.
4. Create a folder in Google Drive named `AI Interview Platform` and share it with the Service Account email (`service-account@project.iam.gserviceaccount.com`).
5. Configure backend `.env`:
   ```env
   STORAGE_PROVIDER="google_drive"
   GOOGLE_DRIVE_FOLDER_ID="your_google_drive_folder_id"
   GOOGLE_DRIVE_SERVICE_ACCOUNT_FILE="credentials/google_drive_sa.json"
   ```

---

## 5. Local Development Execution

### Backend:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seeds.initial_data
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### Running Backend Unit & Gate Logic Tests:
```bash
cd backend
PYTHONPATH=. pytest tests/ -v
```
