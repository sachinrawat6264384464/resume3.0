import pytest
from app.services.resume_service import ResumeService

@pytest.mark.asyncio
async def test_resume_text_analysis_and_matching():
    sample_resume = """
    Rahul Sharma
    rahul@cloudops.internal | +91 98765 43210
    Senior DevOps Engineer with 4 years of experience.
    Skills: Linux, AWS (VPC, IAM, EC2, S3, EKS), Docker, Kubernetes, Terraform, Jenkins, Prometheus, Grafana.
    Experience:
    - Managed multi-region AWS cloud infrastructure with Terraform.
    - Automated CI/CD pipelines in Jenkins and Docker for Kubernetes microservices.
    """
    
    svc = ResumeService()
    result = await svc.analyze_and_match(
        resume_text=sample_resume,
        job_title="Senior DevOps & CloudOps Engineer"
    )
    
    assert result.ats_score > 0
    assert result.breakdown.skills_match > 0
    assert len(result.matching_skills) > 0
    assert len(result.recommended_interview_stages) > 0
    assert len(result.bullet_suggestions) > 0

@pytest.mark.asyncio
async def test_bullet_improvement():
    svc = ResumeService()
    res = await svc.improve_single_bullet(
        role="DevOps Engineer",
        current_bullet="Managed Jenkins jobs for building microservices."
    )
    assert res.improved != ""
    assert "Jenkins" in res.improved or "CI/CD" in res.improved
