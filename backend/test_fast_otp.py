import asyncio
import sys
import time
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from sqlalchemy import select, delete
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.candidate import Candidate

import pytest

TEST_PHONE = "+916264384464"
TEST_NAME = "Sachin Rawat"

async def cleanup_test_user():
    """Clean up test user from DB before running test to ensure clean state."""
    async with AsyncSessionLocal() as session:
        digits = "".join(filter(str.isdigit, TEST_PHONE))[-10:]
        stmt = select(User).where(User.phone_number.like(f"%{digits}%"))
        res = await session.execute(stmt)
        users = res.scalars().all()
        for u in users:
            await session.execute(delete(Candidate).where(Candidate.user_id == u.id))
            await session.delete(u)
        await session.commit()

@pytest.mark.asyncio
async def test_otp():
    print("=" * 60)
    print("  FAST OTP & LOGIN / CREATE ACCOUNT PROCESS END-TO-END TEST")
    print("=" * 60)

    await cleanup_test_user()

    # Use ASGITransport for direct FastAPI testing without external process
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        headers = {"Content-Type": "application/json"}

        # ---------------------------------------------------------
        # TEST 1: Unregistered User trying to Sign In (Should 404)
        # ---------------------------------------------------------
        print("\n[TEST 1] Sign In with unregistered phone (expecting 404)...")
        r_unreg = await client.post("/api/v1/auth/send-otp", json={
            "phone_number": TEST_PHONE,
            "full_name": TEST_NAME,
            "mode": "signin"
        }, headers=headers)
        print(f"Status: {r_unreg.status_code}")
        print(f"Response: {r_unreg.json()}\n")
        assert r_unreg.status_code == 404, f"Expected 404, got {r_unreg.status_code}"

        # ---------------------------------------------------------
        # TEST 2: Create Account mode -> Send OTP (Should 200)
        # ---------------------------------------------------------
        print("[TEST 2] Send OTP for Create Account (mode='signup')...")
        t0 = time.time()
        r1 = await client.post("/api/v1/auth/send-otp", json={
            "phone_number": TEST_PHONE,
            "full_name": TEST_NAME,
            "mode": "signup"
        }, headers=headers)
        t_duration = round((time.time() - t0) * 1000, 2)
        print(f"Status: {r1.status_code} ({t_duration}ms)")
        print(f"Response: {r1.json()}\n")
        assert r1.status_code == 200, f"Expected 200, got {r1.status_code}"

        # ---------------------------------------------------------
        # TEST 3: Create Account mode -> Verify OTP (Should 200 & Register DB User)
        # ---------------------------------------------------------
        print("[TEST 3] Verify OTP & Create Candidate Account (mode='signup')...")
        r_ver_signup = await client.post("/api/v1/auth/verify-otp", json={
            "phone_number": TEST_PHONE,
            "full_name": TEST_NAME,
            "otp": "123456",
            "mode": "signup"
        }, headers=headers)
        print(f"Status: {r_ver_signup.status_code}")
        res_signup_data = r_ver_signup.json()
        print(f"User Created: {res_signup_data.get('user', {}).get('full_name')} | Role: {res_signup_data.get('user', {}).get('role')}\n")
        assert r_ver_signup.status_code == 200, f"Expected 200, got {r_ver_signup.status_code}"

        # ---------------------------------------------------------
        # TEST 4: Sign In mode -> Send OTP AFTER user registered (Should 200)
        # ---------------------------------------------------------
        print("[TEST 4] Send OTP for Sign In NOW (mode='signin', candidate exists)...")
        r2 = await client.post("/api/v1/auth/send-otp", json={
            "phone_number": TEST_PHONE,
            "full_name": TEST_NAME,
            "mode": "signin"
        }, headers=headers)
        print(f"Status: {r2.status_code}")
        print(f"Response: {r2.json()}\n")
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}"

        # ---------------------------------------------------------
        # TEST 5: Sign In mode -> Verify OTP (Should 200 & Return Token)
        # ---------------------------------------------------------
        print("[TEST 5] Verify OTP & Sign In to Candidate Dashboard (mode='signin')...")
        r_ver_signin = await client.post("/api/v1/auth/verify-otp", json={
            "phone_number": TEST_PHONE,
            "full_name": TEST_NAME,
            "otp": "123456",
            "mode": "signin"
        }, headers=headers)
        print(f"Status: {r_ver_signin.status_code}")
        res_signin_data = r_ver_signin.json()
        token = res_signin_data.get("access_token", "")
        print(f"Token Issued: {token[:25]}...")
        print(f"User Profile: {res_signin_data.get('user', {}).get('email')}\n")
        assert r_ver_signin.status_code == 200, f"Expected 200, got {r_ver_signin.status_code}"

        # ---------------------------------------------------------
        # TEST 6: Create Account again for existing user (Should 400)
        # ---------------------------------------------------------
        print("[TEST 6] Try Create Account again with existing phone (expecting 400)...")
        r_dup = await client.post("/api/v1/auth/send-otp", json={
            "phone_number": TEST_PHONE,
            "full_name": TEST_NAME,
            "mode": "signup"
        }, headers=headers)
        print(f"Status: {r_dup.status_code}")
        print(f"Response: {r_dup.json()}\n")
        assert r_dup.status_code == 400, f"Expected 400, got {r_dup.status_code}"

    print("=" * 60)
    print("  🎉 ALL 6 OTP & LOGIN / REGISTER TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_otp())
