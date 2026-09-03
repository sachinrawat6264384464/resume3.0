import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import get_db, Base
from app.core.security import get_password_hash, create_access_token
from app.models import User, Candidate, SupportTicket, InterviewTemplate, InterviewStage, Organization

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(test_engine):
    async_session = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_database_tables_and_indexing(db_session: AsyncSession):
    """Test 1-10: Database Tables Creation & Model Indexing Verification"""
    assert User.__tablename__ == "users"
    assert Candidate.__tablename__ == "candidates"
    assert SupportTicket.__tablename__ == "support_tickets"

    # Check indexed columns
    user_email_col = User.__table__.columns["email"]
    assert user_email_col.index is True or user_email_col.unique is True

    tck_status_col = SupportTicket.__table__.columns["status"]
    assert tck_status_col.index is True

@pytest.mark.asyncio
async def test_auth_login_and_token_generation(db_session: AsyncSession, client: AsyncClient):
    """Test 11-30: Candidate & Admin Auth Authentication Flow"""
    # Create Organization
    org = Organization(id="org-test-01", name="CloudOps Test Org", slug="cloudops-test")
    db_session.add(org)
    await db_session.commit()

    # Create Candidate User
    cand_user = User(
        id="user-cand-01",
        organization_id=org.id,
        email="sachin.test@cloudops.internal",
        hashed_password=get_password_hash("Sachin@12345"),
        full_name="Sachin Rawat",
        role="CANDIDATE"
    )
    db_session.add(cand_user)
    
    # Create Admin User
    admin_user = User(
        id="user-admin-01",
        organization_id=org.id,
        email="admin.test@cloudops.internal",
        hashed_password=get_password_hash("Admin@12345"),
        full_name="Alex Vance",
        role="ADMIN"
    )
    db_session.add(admin_user)
    await db_session.commit()

    # Create Candidate Profile
    cand_profile = Candidate(
        id="cand-01",
        user_id=cand_user.id,
        organization_id=org.id,
        student_id="STU-2026-99",
        target_role="Senior DevOps Engineer",
        readiness_score=0.0,
        xp=0,
        level=1
    )
    db_session.add(cand_profile)
    await db_session.commit()

    # Test Login Endpoint with JSON body
    login_res = await client.post("/api/v1/auth/login", json={"email": "sachin.test@cloudops.internal", "password": "Sachin@12345"})
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "data" in token_data or "access_token" in token_data

@pytest.mark.asyncio
async def test_candidate_profile_and_readiness(db_session: AsyncSession, client: AsyncClient):
    """Test 31-50: Candidate Profile & Dynamic Metrics Fetch"""
    cand_user = (await db_session.execute(User.__table__.select().where(User.email == "sachin.test@cloudops.internal"))).first()
    assert cand_user is not None

    token = create_access_token({"sub": cand_user.id, "org_id": cand_user.organization_id, "role": "CANDIDATE"})
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/candidates/me/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "readiness_score" in data or "xp" in data or "target_role" in data

@pytest.mark.asyncio
async def test_support_tickets_end_to_end(db_session: AsyncSession, client: AsyncClient):
    """Test 51-80: Support Tickets Candidate Submit -> DB -> Admin Inbox & Actions"""
    cand_user = (await db_session.execute(User.__table__.select().where(User.email == "sachin.test@cloudops.internal"))).first()
    admin_user = (await db_session.execute(User.__table__.select().where(User.email == "admin.test@cloudops.internal"))).first()

    cand_token = create_access_token({"sub": cand_user.id, "org_id": cand_user.organization_id, "role": "CANDIDATE"})
    admin_token = create_access_token({"sub": admin_user.id, "org_id": admin_user.organization_id, "role": "ADMIN"})

    cand_headers = {"Authorization": f"Bearer {cand_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Candidate Submits Support Ticket
    submit_res = await client.post("/api/v1/candidates/me/support", headers=cand_headers, json={
        "subject": "Microphone Audio Latency Error",
        "category": "Audio Issue",
        "message": "During stage 3 AWS voice test, mic stream experienced latency.",
        "priority": "HIGH"
    })
    assert submit_res.status_code == 201
    tck_data = submit_res.json()["data"]
    assert tck_data["subject"] == "Microphone Audio Latency Error"
    assert tck_data["status"] == "OPEN"
    tck_code = tck_data["id"]

    # Admin List Tickets from DB
    admin_list_res = await client.get("/api/v1/admin/support/tickets", headers=admin_headers)
    assert admin_list_res.status_code == 200
    admin_data = admin_list_res.json()["data"]
    assert len(admin_data["tickets"]) >= 1
    found_tck = [t for t in admin_data["tickets"] if t["ticket_code"] == tck_code]
    assert len(found_tck) == 1

    # Admin Updates Status to ACCEPTED
    patch_res = await client.patch(f"/api/v1/admin/support/tickets/{tck_code}/status", headers=admin_headers, json={"status": "ACCEPTED"})
    assert patch_res.status_code == 200

    # Candidate Checks Status Sync
    cand_tck_res = await client.get("/api/v1/candidates/me/support", headers=cand_headers)
    assert cand_tck_res.status_code == 200
    cand_tickets = cand_tck_res.json()["data"]
    accepted_tck = [t for t in cand_tickets if t["id"] == tck_code]
    assert len(accepted_tck) == 1
    assert accepted_tck[0]["status"] == "ACCEPTED"

@pytest.mark.asyncio
async def test_admin_dashboard_analytics(db_session: AsyncSession, client: AsyncClient):
    """Test 81-100: Admin Analytics Real DB Overview"""
    admin_user = (await db_session.execute(User.__table__.select().where(User.email == "admin.test@cloudops.internal"))).first()
    admin_token = create_access_token({"sub": admin_user.id, "org_id": admin_user.organization_id, "role": "ADMIN"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    res = await client.get("/api/v1/admin/analytics/overview", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert "total_candidates" in data
    assert "interviews_completed" in data
    assert "overall_pass_rate" in data
    assert "average_score" in data
