# Minutes of Meeting (MOM) — AI Interview Project Review

**Project Name:** AI Interview  
**Meeting Type:** Feedback & Review Meeting  
**Meeting Date:** 19 September 2026  
**Meeting Time:** 8:15 PM  
**Participants:** Vikas Sir (Reviewer) and Sachin Rawat (Lead Developer)  

---

## 1. Meeting Objective
Review the current AI Interview platform features, evaluate UI/UX responsiveness across devices, simplify candidate login and onboarding flows, and define the technical roadmap for Admin management controls (Payments, Live Sessions, Candidate Exports) and Candidate suite enhancements (LinkedIn Post Integration, Group-Wise Stages, ATS Copy tools).

---

## 2. Key Discussion Points
- **Landing Page Typography & Proportion:** Hero heading font size is oversized on certain screen breakpoints. Needs proportional font size reduction while preserving hollow-stroke design identity. Option 1 and Option 2 cards require reduced padding/height.
- **Candidate Authentication Flow:** Simplify login to Name + Mobile Number + OTP (`Enter Details → Send OTP → Verify OTP → Dashboard`), integrating Firebase Auth SMS/OTP capabilities with proper rate-limiting and validation fallback.
- **Admin Management Capabilities:**
  - Secure Payment Gateway configuration panel (toggle, credentials, test/live mode) without exposing keys to frontend.
  - Comprehensive Candidate Data Export tool (CSV/JSON/PDF) respecting permissions.
  - Live Session Management suite for organizing webinars/mock events with real-time Candidate Panel notification banners.
- **UI Clean-up & Modules Optimization:**
  - Remove deprecated/cluttered AI UI components identified during review.
  - Organize Leaderboard with multi-tab filters and clean real-data rendering.
  - Structure Candidate Dashboard stages into logical Group-Wise Categories (e.g. Fundamentals, Cloud Infrastructure, DevOps & Kubernetes, Incident Ops).
  - Add 1-click Copy button to Resume ATS Audit results with clipboard error fallback.
  - Ensure Study Planner populates real database tasks and candidate study goals.
  - Refine Candidate Settings with dropdown-based selections for target roles and experience levels.
  - Add Candidate LinkedIn Post Creator/Publisher integration flow.

---

## 3. Required UI Updates
- Reduce Hero heading font sizes (`text-3xl sm:text-5xl md:text-6xl lg:text-7xl`).
- Reduce dimensions and inner padding of Option 1 (Resume Review) & Option 2 (Interview Prep) cards.
- Ensure consistent responsive spacing across mobile, tablet, and desktop views.

---

## 4. Admin Panel Updates
- **Payment Gateway Config:** Settings for Gateway toggle, API Keys, Webhook Secrets, and Test/Live modes securely handled via backend.
- **Candidate Download Suite:** Export candidate profiles, readiness scores, and attempt histories to CSV/PDF.
- **Live Session Manager:** Admin CRUD for scheduling live sessions, dates, descriptions, and candidate banner visibility toggles.

---

## 5. Candidate Panel Updates
- **OTP Login:** Simplified Name + Mobile Number + Firebase OTP login flow.
- **Group-Wise Dashboard:** Stages grouped into logical assessment tracks with progress bars.
- **ATS Result Copying:** 1-Click Copy button for improved bullet points and missing skill lists.
- **LinkedIn Post Creator:** Compose, preview, and authorize LinkedIn post creation directly from candidate dashboard.
- **Settings Dropdowns:** Target role, experience level, and notification preferences dropdown selectors.

---

## 6. Next Phase Action Items
1. Generate formal MOM documentation in repository (`docs/MOM_2026-09-19_AI_Interview.md`).
2. Create comprehensive `implementation_plan.md` artifact detailing file-level edits for all 12 requirement modules.
3. Obtain user feedback and approval before proceeding with execution.

---

## 7. Expected Outcome
A production-grade, highly responsive, and robust Next Phase release of the AI Interview Platform with zero broken existing features, clean authentication flows, complete admin control panels, and enhanced candidate preparation tools.
