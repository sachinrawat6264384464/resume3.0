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

    # Verify weighted calculation
    expected_overall = (
        result.technical_score * 0.40 +
        result.concept_coverage_score * 0.25 +
        result.reasoning_score * 0.20 +
        result.practical_score * 0.10 +
        result.communication_score * 0.05
    )
    assert abs(result.overall_score - round(expected_overall, 1)) < 0.2
