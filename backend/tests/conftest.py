import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.database import Base
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.interview_template import InterviewTemplate
from app.models.interview_stage import InterviewStage
from app.models.question import Question

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def db_session():
    test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        # Seed test organization & user
        org = Organization(name="Test Org", slug="test-org")
        session.add(org)
        await session.flush()

        user = User(
            organization_id=org.id,
            email="testcandidate@cloudops.internal",
            full_name="Test Student",
            role=UserRole.CANDIDATE.value
        )
        session.add(user)
        await session.flush()

        candidate = Candidate(
            user_id=user.id,
            organization_id=org.id,
            target_role="CloudOps Engineer"
        )
        session.add(candidate)
        await session.flush()

        # Create multi-stage template
        template = InterviewTemplate(
            organization_id=org.id,
            title="CloudOps Test Assessment",
            target_role="CloudOps Engineer",
            passing_score=80.0
        )
        session.add(template)
        await session.flush()

        stage1 = InterviewStage(
            interview_template_id=template.id,
            stage_number=1,
            title="Stage 1: Fundamentals",
            minimum_score=80.0,
            unlock_rule="PASS_PREVIOUS_STAGE"
        )
        stage2 = InterviewStage(
            interview_template_id=template.id,
            stage_number=2,
            title="Stage 2: DevOps",
            minimum_score=80.0,
            unlock_rule="PASS_PREVIOUS_STAGE"
        )
        session.add_all([stage1, stage2])
        await session.flush()

        q1 = Question(
            interview_stage_id=stage1.id,
            order_index=1,
            question_text="What command checks disk utilization in Linux?",
            reference_answer="Use df -h and du -sh to check filesystem and directory disk usage.",
            expected_topics=["df -h", "du -sh"]
        )
        q2 = Question(
            interview_stage_id=stage2.id,
            order_index=1,
            question_text="Explain Docker multi-stage builds.",
            reference_answer="Multi-stage builds reduce image size by separating build dependencies from final runtime.",
            expected_topics=["multi-stage", "reduce image size"]
        )
        session.add_all([q1, q2])
        await session.commit()

        yield session

    await test_engine.dispose()
