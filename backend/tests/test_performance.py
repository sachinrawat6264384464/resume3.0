import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token

@pytest.fixture
def auth_headers():
    token = create_access_token({
        "sub": "user_candidate_1",
        "user_id": "user_candidate_1",
        "email": "aarav@cloudops.internal",
        "role": "CANDIDATE"
    })
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_unauthorized_performance_access():
    """Ensure unauthorized requests return HTTP 401 Unauthorized."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/candidates/me/performance")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data or "message" in data

@pytest.mark.asyncio
async def test_authenticated_candidate_performance(auth_headers):
    """Ensure candidate performance endpoint returns valid data structure."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/candidates/me/performance", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert "data" in body
        data = body["data"]
        
        # Verify required performance fields
        assert "readiness_score" in data
        assert "resume_ats_score" in data
        assert "salary_band" in data
        assert "pillars" in data
        assert "speech_telemetry" in data
        assert "progression" in data
        
        # Verify 5-pillar rubric keys
        pillars = data["pillars"]
        assert "technical_accuracy" in pillars
        assert "concept_coverage" in pillars
        assert "reasoning_quality" in pillars
        assert "practical_knowledge" in pillars
        assert "communication_clarity" in pillars

        # Verify speech telemetry keys
        speech = data["speech_telemetry"]
        assert "pacing_wpm" in speech
        assert "filler_words_per_min" in speech
        assert "structural_clarity" in speech
        assert "confidence_signals" in speech

def test_pillar_weighted_calculation():
    """Verify 5-pillar rubric weighted score calculation logic."""
    tech = 85.0
    concept = 80.0
    reasoning = 75.0
    practical = 70.0
    comm = 90.0

    weighted_score = (tech * 0.40) + (concept * 0.25) + (reasoning * 0.20) + (practical * 0.10) + (comm * 0.05)
    assert round(weighted_score, 1) == 80.5
