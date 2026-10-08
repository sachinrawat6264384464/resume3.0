import asyncio
from app.db.session import AsyncSessionLocal
from app.models.question import Question
from app.models.question_attempt import QuestionAttempt
from app.models.stage import Stage
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Question))
        qs = res.scalars().all()
        print("=== ALL QUESTIONS IN DB ===")
        for q in qs:
            print(f"ID: {q.id} | StageID: {q.stage_id} | Text: {q.question_text[:40]} | RefAns: {q.reference_answer}")

        res2 = await db.execute(select(QuestionAttempt))
        qats = res2.scalars().all()
        print("\n=== ALL QUESTION ATTEMPTS IN DB ===")
        for qa in qats:
            print(f"QA_ID: {qa.id} | Q_ID: {qa.question_id} | Snapshot: {qa.question_text_snapshot[:40]} | Score: {qa.overall_score}")

if __name__ == "__main__":
    asyncio.run(main())
