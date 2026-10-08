import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.organization import Organization

async def reset_admin_credentials():
    async with AsyncSessionLocal() as db:
        print("Resetting Admin Credentials in Database...")

        # 1. Get or create organization
        org_stmt = select(Organization).where(Organization.slug == "default")
        res_org = await db.execute(org_stmt)
        org = res_org.scalar_one_or_none()
        if not org:
            org = Organization(name="CloudOps Academy", slug="default")
            db.add(org)
            await db.flush()

        new_password_hash = get_password_hash("AdminPass@123")

        # Admin Emails to ensure
        admin_emails = ["admin@cloudops.internal", "admin@cloudops.ai"]

        for email in admin_emails:
            stmt = select(User).where(User.email == email)
            res = await db.execute(stmt)
            admin_user = res.scalar_one_or_none()

            if admin_user:
                admin_user.hashed_password = new_password_hash
                admin_user.role = UserRole.ADMIN.value
                admin_user.is_active = True
                print(f"Updated existing admin user '{email}' password to 'AdminPass@123'")
            else:
                admin_user = User(
                    organization_id=org.id,
                    email=email,
                    full_name="Super Admin",
                    hashed_password=new_password_hash,
                    role=UserRole.ADMIN.value,
                    is_active=True
                )
                db.add(admin_user)
                print(f"Created new admin user '{email}' with password 'AdminPass@123'")

        await db.commit()
        print("Admin Credentials Reset Successfully!")

if __name__ == "__main__":
    asyncio.run(reset_admin_credentials())
