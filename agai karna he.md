Maine pure project ka backend aur frontend thoroughly analyze kar liya hai.

Neeche poori detail hai:

Current Project me kaun-kaun se pages bane huye hain (Admin Panel & Candidate Panel).
Client ki new requirement ("FEATURE - 2") ka exact gap analysis.
Isko implement karne ka complete step-by-step roadmap (kahan kya model, API, aur page banega).
🧭 PART 1: Current Project me Kaun-Kaun se Pages Bane Hain?
👨‍💻 A. Candidate Side Pages (/frontend/app/(dashboard)/...)
Page Route	Kaam / Features
/dashboard	Candidate Command Center — Overall readiness score, active day streak, XP/Level, completed stages, quick actions.
/interviews	31-Stage Structured Interview Pipeline — Foundation (Linux, Git), Cloud (AWS, Azure, GCP), DevOps (Docker, K8s, CI/CD), Advanced Incident Troubleshooting aur 40 LPA Final Boss Battle.
/interviews/[attemptId]	Live Voice/Audio AI Interview Screen — Mic recording, real-time waveform, speech-to-text, 5-pillar rubric evaluation (Technical Accuracy, Concept Coverage, etc.).
/practice	Practice Arena — AI practice questions (10 questions mode) bina stage lock ke practice karne ke liye.
/resume-ats	AI Resume ATS Audit — Resume upload, JD matching %, ATS score, missing skills list, aur STAR bullet-point rewriter.
/performance	My Progress & Matrix — 5-Pillar radar chart, WPM (speech pace), filler word count, confidence signals.
/leaderboard	Global Leaderboard — Global ranking, XP scores, badges, active day streaks.
/study-planner	Study Goals & Tasks — 30-day task checklist aur study tracker.
/reminders	Smart Reminders — Candidate ke pending interview tests aur study alerts.
/certificates	Certificates & Badges — Stages complete hone par certificates aur credential verification.
/help	AI Career Assistant & Support Desk — 24/7 AI chat query solver aur support tickets.
/settings	Profile & Role Preferences — Target role (e.g. CloudOps), target salary band (₹18-40 LPA), password reset.
🛡️ B. Admin Side Pages (/frontend/app/(dashboard)/admin/...)
Page Route	Kaam / Features
/admin	Admin Analytics Overview — Pass rate, total attempts, candidate registrations, retention cleanup, aur JDParserModal (JD text paste karke AI blueprint generate karne ka modal).
/admin/candidates	Candidates Management — All candidates table, 31-stage status breakdown, Paid/Unpaid toggle, Admin feedback modal with ratings & strengths/weaknesses.
/admin/templates	Assessment Blueprints & Templates — JD se bane huye templates aur stage-wise question sets.
/admin/live-sessions	Live / Zoom Sessions Management — Zoom/Google Meet links, session date/time, WhatsApp community link, banner, candidate join click logs.
/admin/leaderboard	Admin Leaderboard View — Top rankers ka filtered view.
/admin/reports	Export & Reports — Candidate performance metrics aur stage audit reports.
/admin/reviews	Voice Review Queue — Candidates ke voice recordings ko manual listen karna aur scores adjust karna.
/admin/scoring	Scoring Rubric Config — 5-pillar evaluation weights adjust karna.
/admin/roles-permissions	RBAC Management — Admin, Recruiter, Examiner access controls.
/admin/payment-gateway	Payment Gateways — Razorpay/Stripe configuration aur transaction history.
/admin/reminders	Reminder Broadcasts — Batch reminders send karna.
/admin/video-management	Video Tutorials — Platform walkthrough videos upload karna.
🎯 PART 2: Client ki Requirement ("FEATURE - 2") me Abhi Kya Missing Hai?
Client chahta hai ek End-to-End Recruitment Journey in One Place:

[Admin Uploads JD] ➔ [Public URL to Apply Generated]
       │
       ▼
[Student Opens Public Link & Applies (Resume + Details)]
       │
       ▼
[AI Interview (5-10 Questions based on JD) OR Practice (10 Qs)]
       │ (Optional: Admin schedules Manual Zoom Interview)
       ▼
[Results & Scorecard Shared]
       │
       ▼
[Application Status Tracker: Applied ➔ Reviewed ➔ Feedback ➔ Submitted to Client ➔ Hold ➔ Interviewed ➔ Selected / Rejected]
       │
       ▼
[Job-Specific Leaderboard Updates & Ranks]
Abhi ke Codebase me Kahan Gap Hai:
Public URL & Landing Page Missing: Abhi Admin JD paste karta hai toh internal template ban jata hai, lekin Public Shareable Apply Link (jaise /apply/[jobSlug]) nahi banta jahan external student bina pre-registered account ke apply kar sake.
Dedicated JobApplication Model Missing: Database me Candidate, JobDescription, aur InterviewAttempt hain, lekin Job Application Pipeline Tracker Model nahi hai jo student ki application ko APPLIED ➔ REVIEWED ➔ FEEDBACK ➔ SUBMITTED_TO_CLIENT ➔ HOLD ➔ INTERVIEWED ➔ SELECTED / REJECTED track kare.
JD-Specific 5–10 Question Interview Flow: Abhi candidate generic 31 stages deta hai. Job-specific application ke against direct 5–10 AI Questions ya 10-question practice test trigger karne ka flow standalone candidate application se directly tied nahi hai.
Zoom 1-on-1 Link Attachment: Live Sessions page generic webinars ke liye hai; specific candidate ki application me 1:1 Zoom meeting link attach karne ka field abhi candidate row me nahi hai.
Job-Specific Leaderboard: Abhi leaderboard pure platform ka global hai, specific Job Posting ke applicants ka leaderboard nahi hai.
🛠️ PART 3: Yeh Kaise Hoga Aur Kahan Kya-Kya Karna Hoga?
Hum isko 5 Clear Modules me divide karke implement karenge:

mermaid
graph TD
    A[1. Backend: JobApplication Model & APIs] --> B[2. Admin: JD Manager + Public URL Generator]
    B --> C[3. Public Page: /apply/job-slug]
    C --> D[4. AI Interview Engine: 5-10 JD Questions + Practice]
    D --> E[5. ATS Kanban Pipeline & Job Leaderboard]
Step 1: Database & Backend Changes (backend/app/...)
1. Naya Model: JobApplication (backend/app/models/job_application.py)
python
class JobApplication(TimeStampedModel):
    __tablename__ = "job_applications"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_description_id = Column(String(36), ForeignKey("job_descriptions.id", ondelete="CASCADE"), index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    
    # Applicant details (for public applicants)
    applicant_name = Column(String(255), nullable=False)
    applicant_email = Column(String(255), nullable=False, index=True)
    applicant_phone = Column(String(50), nullable=True)
    resume_url = Column(String(500), nullable=True)
    resume_ats_score = Column(Float, default=0.0)
    # Status Tracking Pipeline
    status = Column(String(50), default="APPLIED", nullable=False, index=True)
    # Values: APPLIED, REVIEWED, FEEDBACK, SUBMITTED_TO_CLIENT, HOLD, INTERVIEWED, SELECTED, REJECTED
    
    # Interview Data
    interview_type = Column(String(50), default="AI_INTERVIEW") # AI_INTERVIEW, PRACTICE, MANUAL_ZOOM
    interview_attempt_id = Column(String(36), ForeignKey("interview_attempts.id"), nullable=True)
    ai_score = Column(Float, default=0.0)
    ai_feedback_json = Column(JSON, default=dict)
    
    # Optional Manual Zoom Interview
    zoom_meeting_url = Column(String(500), nullable=True)
    zoom_scheduled_at = Column(DateTime(timezone=True), nullable=True)
    zoom_notes = Column(Text, nullable=True)
    
    # Admin & Client Feedback
    admin_notes = Column(Text, nullable=True)
    client_feedback = Column(Text, nullable=True)
2. JobDescription Model me Public Slug Add Karna (backend/app/models/job_description.py)
slug = Column(String(255), unique=True, index=True) (e.g. senior-devops-engineer-e4a1b2)
is_public = Column(Boolean, default=True)
question_count = Column(Integer, default=5) (5 se 10 questions)
custom_questions_json = Column(JSON, default=list) (Admin ke custom 5-10 questions ya AI auto-generated)
3. New Backend API Endpoints (backend/app/api/v1/applications.py)
GET /api/v1/public/jobs/{slug}: Public endpoint jo applicant ko job details dikhata hai.
POST /api/v1/public/jobs/{slug}/apply: Public application submit karega (Resume + basic details), applicant account ya guest candidate banayega, aur interview start token return karega.
GET /api/v1/applications: Admin panel ke liye all applications with filters (Status filter, Job filter).
PUT /api/v1/applications/{id}/status: Admin candidate ka status change karega (APPLIED ➔ REVIEWED ➔ FEEDBACK ➔ SUBMITTED_TO_CLIENT ➔ HOLD ➔ SELECTED / REJECTED).
PUT /api/v1/applications/{id}/zoom-meeting: Zoom meeting URL aur time schedule karega.
GET /api/v1/jobs/{job_id}/leaderboard: Is specific job ke saare candidates ki rank list based on AI Score + ATS Score.
Step 2: Admin Panel me Changes (frontend/app/(dashboard)/admin/...)
Job Descriptions & Public URL Creation (admin/templates ya new admin/jobs):
Jab Admin JD paste karega:
Title, Experience, JD text enter karega.
Select karega: "AI Interview Questions: 5 Questions ya 10 Questions".
System turant generate karega: Public Shareable URL (e.g. https://cloudops.ai/apply/devops-engineer-92a1).
"Copy Public Link" button aur "Share on LinkedIn / WhatsApp" buttons milenge.
Applications Kanban Board / Tracker Tab (admin/candidates ya admin/applications):
Ek modern ATS Pipeline / Kanban Board jisme columns honge:
📥 Applied
🔍 Reviewed
💬 Feedback
🚀 Submitted to Client
⏸️ Hold
🎙️ Interviewed (AI / Zoom)
✅ Selected
❌ Rejected
Admin single click se candidate ko next stage par drag/move kar sakega.
Har candidate card par:
AI Interview Score %
ATS Resume Match %
"Schedule Zoom Interview" button (pop-up modal jisme Zoom link aur date/time daal sake).
"Add Client Feedback" text area.
Job-Specific Leaderboard:
Dropdown select karega: "Select Job Posting (e.g. AWS Cloud Engineer)".
Us job ke applicants ka instant leaderboard ranking dikhega (Rank #1, #2, #3...).
Step 3: Public Candidate Flow (frontend/app/apply/[slug]/...)
Public Job Landing Page (/apply/[slug]):
Publicly accessible page (bina login ke bhi khulega).
Company branding, Job Title, Tech Stack, Key Responsibilities.
"Apply Now" Form:
Full Name, Email, Phone, LinkedIn profile.
Resume Upload (PDF) — Instant ATS score analysis run hogi.gggg
Next Step: Interview Mode Selection:
Option 1: "Start Official AI Interview (5-10 Questions)" — Voice/Audio ya Text based assessment directly linked to this JD.
Option 2: "Practice Round First (10 Questions)" — Pehle 10 questions ki practice attempt kar le candidate.
Agar Admin ne Zoom link attach kiya hai, toh screen par "Manual Zoom Interview Scheduled" card dikhega with date, time, and "Join Zoom Meeting" button.
Results & Scorecard Page (/apply/[slug]/results or Dashboard):
5-Pillar Rubric Radar.
Overall AI Score out of 100.
Strengths, Weaknesses & STAR Recommendations.
Live Application Tracker Bar: [Applied ✔️] ➔ [Interviewed ✔️] ➔ [Under Review] ➔ [Submitted to Client] ➔ [Decision Pending]
Step 4: Candidate Dashboard Updates (frontend/app/(dashboard)/...)
"My Applications" Tab in Candidate Dashboard:
Candidate apne dashboard me dekh sakega ki usne kin-kin jobs me apply kiya hai.
Har application ka live tracking status:
Application Submitted
AI Interview Completed (Score: 84%)
Profile Submitted to Client
Zoom Round Scheduled for 22 Oct, 3:00 PM
Live Leaderboard:
Candidate dekh sakega ki wo us job ke pool me kis rank par stand karta hai.
📋 Summary Table: Kahan Kya Banega
Component	File Path	Kya Banega / Update Hoga
Database Model	backend/app/models/job_application.py	Naya JobApplication table (status tracking, zoom link, scores).
Database Model	backend/app/models/job_description.py	slug, public_url, question_count (5-10 Qs) fields add honge.
Backend API	backend/app/api/v1/job_descriptions.py	Public apply link generation & 5-10 question generator logic.
Backend API	backend/app/api/v1/applications.py	New API router: public apply, pipeline status updates, zoom scheduling.
Frontend Public Page	frontend/app/apply/[slug]/page.tsx	Naya Public Job Application + Resume Upload page.
Frontend AI Interview	frontend/app/apply/[slug]/interview/page.tsx	JD-based 5-10 questions voice interview & 10 questions practice mode.
Frontend Admin Page	frontend/app/(dashboard)/admin/applications/page.tsx (ya admin/candidates)	Kanban ATS Tracker (Applied ➔ Reviewed ➔ Feedback ➔ Client ➔ Hold ➔ Selected/Rejected).
Frontend Leaderboard	frontend/app/(dashboard)/admin/leaderboard/page.tsx	Job-specific filterable candidate rankings.
Aapka Feedback / Next Step: