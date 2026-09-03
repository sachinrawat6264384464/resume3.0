import asyncio
import os
import sys
from datetime import datetime, timezone
import dotenv

# Configure utf-8 stdout for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load environment variables
dotenv.load_dotenv()

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.interview_attempt import InterviewAttempt

CANDIDATES_DATA = [
    {
        "full_name": "Aarav Sharma",
        "email": "aarav@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-101",
        "phone": "+91 98765 43210",
        "target_role": "Senior DevOps Engineer",
        "experience_level": "SENIOR",
        "readiness_score": 92.5,
        "level": 5,
        "xp": 1450,
        "streak_days": 12,
        "target_salary_band": "₹25–40 LPA",
        "course": "DevOps Master Track",
        "batch": "2026-A",
        "skills_matrix": {"Linux": 95, "AWS": 92, "Docker": 90, "Kubernetes": 88, "Terraform": 94},
        "badges": ["Registered Engineer", "Linux Warrior", "AWS Specialist", "K8s Architect"]
    },
    {
        "full_name": "Priya Patel",
        "email": "priya@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-102",
        "phone": "+91 98765 43211",
        "target_role": "AWS Cloud Solutions Architect",
        "experience_level": "MID",
        "readiness_score": 88.0,
        "level": 4,
        "xp": 1200,
        "streak_days": 8,
        "target_salary_band": "₹18–25 LPA",
        "course": "Cloud Architecture",
        "batch": "2026-A",
        "skills_matrix": {"Linux": 85, "AWS": 96, "Docker": 82, "Kubernetes": 78, "Terraform": 88},
        "badges": ["Registered Engineer", "AWS Specialist", "Cloud Architect"]
    },
    {
        "full_name": "Rohan Gupta",
        "email": "rohan@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-103",
        "phone": "+91 98765 43212",
        "target_role": "Kubernetes & SRE Specialist",
        "experience_level": "MID",
        "readiness_score": 84.0,
        "level": 3,
        "xp": 950,
        "streak_days": 6,
        "target_salary_band": "₹18–25 LPA",
        "course": "Kubernetes SRE Track",
        "batch": "2026-A",
        "skills_matrix": {"Linux": 88, "AWS": 80, "Docker": 95, "Kubernetes": 94, "Terraform": 82},
        "badges": ["Registered Engineer", "K8s Specialist", "Docker Master"]
    },
    {
        "full_name": "Ananya Verma",
        "email": "ananya@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-104",
        "phone": "+91 98765 43213",
        "target_role": "Site Reliability Engineer",
        "experience_level": "SENIOR",
        "readiness_score": 90.0,
        "level": 4,
        "xp": 1300,
        "streak_days": 15,
        "target_salary_band": "₹25–40 LPA",
        "course": "SRE & Incident Ops",
        "batch": "2026-A",
        "skills_matrix": {"Linux": 92, "AWS": 88, "Docker": 90, "Kubernetes": 91, "Terraform": 86},
        "badges": ["Registered Engineer", "Incident Boss", "SRE Expert"]
    },
    {
        "full_name": "Vikram Singh",
        "email": "vikram@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-105",
        "phone": "+91 98765 43214",
        "target_role": "Cloud Infrastructure Engineer",
        "experience_level": "MID",
        "readiness_score": 79.5,
        "level": 2,
        "xp": 650,
        "streak_days": 4,
        "target_salary_band": "₹12–18 LPA",
        "course": "Infrastructure Track",
        "batch": "2026-B",
        "skills_matrix": {"Linux": 80, "AWS": 82, "Docker": 75, "Kubernetes": 70, "Terraform": 85},
        "badges": ["Registered Engineer", "Terraform Associate"]
    },
    {
        "full_name": "Sneha Reddy",
        "email": "sneha@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-106",
        "phone": "+91 98765 43215",
        "target_role": "DevSecOps Engineer",
        "experience_level": "MID",
        "readiness_score": 86.5,
        "level": 3,
        "xp": 1050,
        "streak_days": 9,
        "target_salary_band": "₹18–25 LPA",
        "course": "DevSecOps Security",
        "batch": "2026-A",
        "skills_matrix": {"Linux": 86, "AWS": 85, "Docker": 88, "Kubernetes": 84, "Terraform": 89},
        "badges": ["Registered Engineer", "Security Champion"]
    },
    {
        "full_name": "Kabir Mehta",
        "email": "kabir@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-107",
        "phone": "+91 98765 43216",
        "target_role": "Platform Engineer",
        "experience_level": "JUNIOR",
        "readiness_score": 75.0,
        "level": 2,
        "xp": 580,
        "streak_days": 3,
        "target_salary_band": "₹12–18 LPA",
        "course": "Platform Engineering",
        "batch": "2026-B",
        "skills_matrix": {"Linux": 78, "AWS": 74, "Docker": 80, "Kubernetes": 76, "Terraform": 72},
        "badges": ["Registered Engineer"]
    },
    {
        "full_name": "Neha Nair",
        "email": "neha@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-108",
        "phone": "+91 98765 43217",
        "target_role": "Multi-Cloud Architect",
        "experience_level": "SENIOR",
        "readiness_score": 94.0,
        "level": 5,
        "xp": 1600,
        "streak_days": 20,
        "target_salary_band": "₹25–40 LPA",
        "course": "Multi-Cloud Master",
        "batch": "2026-A",
        "skills_matrix": {"Linux": 96, "AWS": 95, "Docker": 92, "Kubernetes": 94, "Terraform": 96},
        "badges": ["Registered Engineer", "Multi-Cloud Master", "AWS Specialist", "K8s Architect"]
    },
    {
        "full_name": "Aditya Joshi",
        "email": "aditya@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-109",
        "phone": "+91 98765 43218",
        "target_role": "Linux Systems Administrator",
        "experience_level": "JUNIOR",
        "readiness_score": 72.5,
        "level": 2,
        "xp": 490,
        "streak_days": 5,
        "target_salary_band": "₹8–12 LPA",
        "course": "Linux Systems",
        "batch": "2026-B",
        "skills_matrix": {"Linux": 90, "AWS": 65, "Docker": 70, "Kubernetes": 60, "Terraform": 68},
        "badges": ["Registered Engineer", "Linux Admin"]
    },
    {
        "full_name": "Riya Malhotra",
        "email": "riya@cloudops.internal",
        "password": "Password@123",
        "student_id": "STU-2026-110",
        "phone": "+91 98765 43219",
        "target_role": "Junior Cloud Engineer",
        "experience_level": "JUNIOR",
        "readiness_score": 68.0,
        "level": 1,
        "xp": 320,
        "streak_days": 2,
        "target_salary_band": "₹8–12 LPA",
        "course": "Cloud Foundations",
        "batch": "2026-B",
        "skills_matrix": {"Linux": 70, "AWS": 68, "Docker": 65, "Kubernetes": 58, "Terraform": 60},
        "badges": ["Registered Engineer"]
    }
]

async def seed_10_candidates():
    print("\n🚀 Starting Seeding of 10 Candidate Accounts into Database...\n")

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Get or create default organization
        org_stmt = select(Organization).where(Organization.slug == "default")
        res = await db.execute(org_stmt)
        org = res.scalar_one_or_none()
        if not org:
            org = Organization(
                name="CloudOps Academy",
                slug="default",
                description="Default Organization for Internal Assessments"
            )
            db.add(org)
            await db.flush()

        seeded_count = 0
        existing_count = 0

        print("=" * 90)
        print(f"{'#':<3} | {'NAME':<16} | {'EMAIL':<26} | {'PASSWORD':<12} | {'READINESS':<9} | {'ROLE':<20}")
        print("=" * 90)

        for idx, cdata in enumerate(CANDIDATES_DATA, 1):
            user_stmt = select(User).where(User.email == cdata["email"])
            user_res = await db.execute(user_stmt)
            existing_user = user_res.scalar_one_or_none()

            if existing_user:
                existing_count += 1
                # Check candidate profile
                cand_stmt = select(Candidate).where(Candidate.user_id == existing_user.id)
                cand_res = await db.execute(cand_stmt)
                cand = cand_res.scalar_one_or_none()
                if cand:
                    cand.readiness_score = cdata["readiness_score"]
                    cand.target_role = cdata["target_role"]
                    cand.level = cdata["level"]
                    cand.xp = cdata["xp"]
                    cand.skills_matrix_json = cdata["skills_matrix"]
                    cand.badges_json = cdata["badges"]
            else:
                user = User(
                    organization_id=org.id,
                    email=cdata["email"],
                    full_name=cdata["full_name"],
                    phone_number=cdata["phone"],
                    hashed_password=get_password_hash(cdata["password"]),
                    role=UserRole.CANDIDATE.value,
                    is_active=True
                )
                db.add(user)
                await db.flush()

                cand = Candidate(
                    user_id=user.id,
                    organization_id=org.id,
                    student_id=cdata["student_id"],
                    phone=cdata["phone"],
                    course=cdata["course"],
                    batch=cdata["batch"],
                    experience_level=cdata["experience_level"],
                    target_role=cdata["target_role"],
                    readiness_score=cdata["readiness_score"],
                    level=cdata["level"],
                    xp=cdata["xp"],
                    streak_days=cdata["streak_days"],
                    target_salary_band=cdata["target_salary_band"],
                    skills_matrix_json=cdata["skills_matrix"],
                    badges_json=cdata["badges"]
                )
                db.add(cand)
                await db.flush()
                seeded_count += 1

            print(f"{idx:<3} | {cdata['full_name']:<16} | {cdata['email']:<26} | {cdata['password']:<12} | {cdata['readiness_score']:>7.1f}% | {cdata['target_role']:<20}")

        await db.commit()
        print("=" * 90)
        print(f"\n✅ Successfully Processed 10 Candidates! (Seeded New: {seeded_count}, Updated Existing: {existing_count})\n")

if __name__ == "__main__":
    asyncio.run(seed_10_candidates())
