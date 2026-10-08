import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.candidate import Candidate

async def check_cands():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User))
        users = res.scalars().all()
        print(f"=== ALL USERS ({len(users)}) ===")
        for u in users:
            print(f"User ID: {u.id} | Email: {u.email} | Phone: {u.phone_number} | FullName: {u.full_name} | Role: {u.role}")

        res_cand = await db.execute(select(Candidate))
        cands = res_cand.scalars().all()
        print(f"\n=== ALL CANDIDATES ({len(cands)}) ===")
        for c in cands:
            print(f"Cand ID: {c.id} | User ID: {c.user_id} | Phone: {c.phone} | StudentID: {c.student_id}")

if __name__ == "__main__":
    asyncio.run(check_cands())
