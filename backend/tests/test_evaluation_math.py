import pytest
from app.ai.confidence_analyzer import analyze_communication_signals
from app.ai.mock_provider import MockAIProvider

@pytest.mark.asyncio
async def test_communication_confidence_metrics():
    # Test hesitant speech with high filler frequency
    hesitant_transcript = (
        "Um, like, basically to troubleshoot disk I/O, uh, you know, maybe we run iotop? "
        "Or like, um, err, maybe df -h? Actually, sort of check /proc."
    )
    metrics = analyze_communication_signals(hesitant_transcript, duration_seconds=20.0)
    
    assert metrics.filler_words_count >= 5
    assert len(metrics.filler_words_detected) >= 3
    assert metrics.confidence_estimate < 85.0
    assert "The confidence indicator is an estimate" in metrics.disclaimer

    # Test clear, structured speech
    crisp_transcript = (
        "To troubleshoot high disk I/O, I first execute top to inspect the wa metric for CPU wait. "
        "Next, I run iotop with the -o flag to isolate the specific process ID causing disk writes. "
        "Then I utilize iostat -xz 1 to inspect disk queue depth and device utilization percentage."
    )
    crisp_metrics = analyze_communication_signals(crisp_transcript, duration_seconds=18.0)
    assert crisp_metrics.filler_words_count == 0
    assert crisp_metrics.confidence_estimate >= 85.0
    assert crisp_metrics.structural_clarity_score >= 85.0

@pytest.mark.asyncio
async def test_5_pillar_scoring_rubric_weights():
    ai = MockAIProvider()
    expected = ["iotop", "iostat", "top", "lsof"]
    reference = "Run top to check wa metric, iotop to find PID, iostat to check util, and lsof for files."
    candidate_answer = "I would run top to check wa, then iotop to find the offending PID and iostat to inspect util."

    result = await ai.evaluate_answer(
        question_text="How do you troubleshoot disk IO?",
        expected_topics=expected,
        reference_answer=reference,
        candidate_transcript=candidate_answer,
        duration_seconds=15.0
    )

    # Verify 5-pillar components exist
    assert 0 <= result.technical_score <= 100
    assert 0 <= result.concept_coverage_score <= 100
    assert 0 <= result.reasoning_score <= 100
    assert 0 <= result.practical_score <= 100
    assert 0 <= result.communication_score <= 100
    assert 0 <= result.confidence_score <= 100

    # Verify overall score range
    assert 0 <= result.overall_score <= 100

@pytest.mark.asyncio
async def test_begging_and_question_text_exclusion():
    ai = MockAIProvider()
    question_text = "STAGE 1 TECHNICAL ASSESSMENT"
    expected = ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD"]
    reference = "Provide a structured technical answer detailing key cloud & DevOps concepts, tools, and real-world practices for: Stage 1 Technical Assessment"
    
    # Candidate transcript from user screenshot containing question title words + begging
    bad_transcript = "Kya Karun main bus to I don't have anything technical assessment 1 give me pass"

    result = await ai.evaluate_answer(
        question_text=question_text,
        expected_topics=expected,
        reference_answer=reference,
        candidate_transcript=bad_transcript,
        duration_seconds=10.0
    )

    # Must fail with low score because candidate did not provide technical solution
    assert result.overall_score < 40.0
    assert "NEEDS IMPROVEMENT" in result.feedback
    assert "PASSED" not in result.feedback

    # Good technical transcript
    good_transcript = "In AWS and Kubernetes, we use Docker containers deployed with GitHub Actions CI/CD pipelines on Linux."
    good_result = await ai.evaluate_answer(
        question_text=question_text,
        expected_topics=expected,
        reference_answer=reference,
        candidate_transcript=good_transcript,
        duration_seconds=12.0
    )

    assert good_result.overall_score >= 65.0
    assert "PASSED" in good_result.feedback

