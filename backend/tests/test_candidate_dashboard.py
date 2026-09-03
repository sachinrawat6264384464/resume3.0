import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_unauthorized_dashboard_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/candidates/me/dashboard-metrics")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_unauthorized_performance_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/candidates/me/performance")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_unauthorized_roadmap_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/candidates/me/roadmap")
        assert response.status_code == 401
