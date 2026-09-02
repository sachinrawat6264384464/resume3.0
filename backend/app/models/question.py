from sqlalchemy import Column, String, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import relationship
from app.models.base import TimeStampedModel

class Question(TimeStampedModel):
    __tablename__ = "questions"

    interview_stage_id = Column(String(36), ForeignKey("interview_stages.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="CONCEPTUAL", nullable=False) # CONCEPTUAL, PRACTICAL, TROUBLESHOOTING, SCENARIO, COMMAND
    difficulty = Column(String(30), default="INTERMEDIATE", nullable=False) # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    skill_category = Column(String(100), default="Linux & Cloud", nullable=False)
    expected_topics = Column(JSON, default=list, nullable=False)
    reference_answer = Column(Text, nullable=False) # Internal grading reference, NEVER exposed to candidate
    evaluation_rubric = Column(JSON, default=dict, nullable=False) # Grading weights and key evaluation criteria
    follow_up_question = Column(Text, nullable=True)
    hint_level_1 = Column(Text, nullable=True) # Conceptual clue
    hint_level_2 = Column(Text, nullable=True) # Command & diagnostic suggestion
    hint_level_3 = Column(Text, nullable=True) # Full architectural guidance
    is_active = Column(String(30), default="ACTIVE", nullable=False) # ACTIVE, ARCHIVED, DRAFT

    stage = relationship("InterviewStage", back_populates="questions")
