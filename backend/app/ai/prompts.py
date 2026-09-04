JD_EXTRACTION_PROMPT = """
You are an expert technical recruiter and DevOps/CloudOps architect.
Analyze the following job description and extract key structured information in JSON format.

Role: {role}
Seniority: {experience_level}

Job Description:
{raw_description}

Return ONLY a JSON object with this exact schema:
{{
  "title": "extracted role title",
  "target_role": "CloudOps / DevOps / SRE / etc.",
  "experience_level": "JUNIOR / MID / SENIOR",
  "skills": ["List of 6-12 required hard skills"],
  "technologies": ["List of 6-12 specific tools/platforms, e.g. Kubernetes, AWS, Terraform, Prometheus"],
  "responsibilities": ["List of 4-6 key day-to-day responsibilities"],
  "suggested_stages": [
    {{
      "stage_number": 1,
      "title": "Cloud & Linux Fundamentals",
      "category": "Fundamentals",
      "description": "Assessment of foundational OS, IAM, and cloud primitives."
    }},
    {{
      "stage_number": 2,
      "title": "Containerization & CI/CD",
      "category": "DevOps",
      "description": "Docker, Kubernetes orchestration, pipeline automation."
    }},
    {{
      "stage_number": 3,
      "title": "Infrastructure as Code & Observability",
      "category": "Operations",
      "description": "Terraform, CloudFormation, metrics, logging, alerting."
    }},
    {{
      "stage_number": 4,
      "title": "Production Troubleshooting Scenario",
      "category": "Troubleshooting",
      "description": "Incident response, RCA, and high availability architecture."
    }}
  ]
}}
"""

QUESTION_GENERATION_PROMPT = """
You are a Staff CloudOps/DevOps Interviewer. Generate {count} high-quality interview questions for the following role and stage.

Role: {role}
Stage: {stage_title}
Topic Focus: {topic}
Difficulty: {difficulty}
Question Type: {question_type} (CONCEPTUAL, PRACTICAL, TROUBLESHOOTING, SCENARIO, or COMMAND)

Return ONLY a JSON array of questions matching this schema:
[
  {{
    "question_text": "Clear, direct technical question formulated for verbal delivery",
    "question_type": "{question_type}",
    "difficulty": "{difficulty}",
    "skill_category": "{topic}",
    "expected_topics": ["keyword/concept 1", "keyword/concept 2", "keyword/concept 3"],
    "reference_answer": "Comprehensive technical answer explaining the correct solution and nuances",
    "evaluation_rubric": {{
      "technical_accuracy": 40,
      "concept_coverage": 25,
      "reasoning_quality": 20,
      "practical_knowledge": 10,
      "communication_clarity": 5
    }},
    "follow_up_question": "Optional probe question if candidate gives a brief answer"
  }}
]
"""

ANSWER_EVALUATION_PROMPT = """
You are a Principal DevOps & CloudOps Assessment AI. Evaluate the candidate's spoken answer against the reference standard and expected concepts.

Question:
{question_text}

Expected Topics / Key Concepts:
{expected_topics}

Reference Benchmark Answer (Internal Gold Standard):
{reference_answer}

Candidate Spoken Transcript:
"{candidate_transcript}"

Evaluate the answer using the standard 5-pillar rubric:
- Technical Accuracy (0-100): Is the technical logic correct without hallucinations?
- Concept Coverage (0-100): How many expected core concepts were addressed?
- Reasoning Quality (0-100): Did the candidate articulate cause-and-effect and architectural trade-offs?
- Practical Knowledge (0-100): Does the candidate demonstrate real-world operational/production familiarity?
- Communication Clarity (0-100): Was the explanation concise, logical, and structured?

Return ONLY a JSON object with this schema:
{{
  "technical_score": 85.0,
  "concept_coverage_score": 80.0,
  "reasoning_score": 90.0,
  "practical_score": 75.0,
  "communication_score": 85.0,
  "strengths": ["List of 2-3 specific technical strengths demonstrated"],
  "weaknesses": ["List of 1-3 specific technical omissions or inaccuracies"],
  "missing_concepts": ["List of specific terms/concepts the candidate omitted"],
  "feedback": "2-3 sentences of constructive, actionable verbal feedback for the candidate.",
  "recommendations": ["1-2 concrete topics to study or practice commands"]
}}
"""

REPORT_SYNTHESIS_PROMPT = """
Synthesize a comprehensive interview performance report and a customized 30-day learning roadmap for a CloudOps/DevOps candidate.

Candidate Role: {role}
Stage Results: {stage_scores_json}
Question Evaluations: {evaluations_json}

Return ONLY a JSON object with this schema:
{{
  "executive_summary": "High-level summary of candidate strengths, readiness level, and growth areas.",
  "critical_knowledge_gaps": ["Key gap 1", "Key gap 2", "Key gap 3"],
  "strengths": ["Core strength 1", "Core strength 2", "Core strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "recommended_topics": [
    {{
      "topic": "Kubernetes Networking & Ingress",
      "why_it_matters": "Crucial for routing traffic and debugging service meshes in production.",
      "candidate_gap": "Candidate struggled to explain CNI plugins and Ingress controllers.",
      "what_to_learn": ["ClusterIP vs NodePort vs LoadBalancer", "Ingress Controllers", "NetworkPolicies"],
      "recommended_docs": ["https://kubernetes.io/docs/concepts/services-networking/"],
      "practice_exercises": ["Deploy Nginx ingress in Minikube and configure path-based routing."]
    }}
  ],
  "thirty_day_plan": [
    {{
      "week": 1,
      "theme": "Linux Core & Networking Deep Dive",
      "objectives": ["Master systemd, journalctl, netstat/ss, and cgroups"],
      "hands_on_labs": ["Troubleshoot a broken systemd service and inspect socket backlog"],
      "documentation_links": ["https://wiki.archlinux.org/title/Systemd"]
    }},
    {{
      "week": 2,
      "theme": "Container Architecture & Dockerfile Hardening",
      "objectives": ["Multi-stage builds, non-root users, security scanning"],
      "hands_on_labs": ["Refactor a 1GB image to <100MB using distroless"],
      "documentation_links": ["https://docs.docker.com/develop/develop-images/dockerfile_best-practices/"]
    }},
    {{
      "week": 3,
      "theme": "Kubernetes Cluster Operations & Troubleshooting",
      "objectives": ["Pod lifecycle, CrashLoopBackOff triage, Service debugging"],
      "hands_on_labs": ["Deploy a sample microservice with ConfigMaps and Secrets"],
      "documentation_links": ["https://kubernetes.io/docs/tasks/debug/debug-application/"]
    }},
    {{
      "week": 4,
      "theme": "CI/CD & Observability (Prometheus/Grafana)",
      "objectives": ["Automate deployment pipeline and configure alert thresholds"],
      "hands_on_labs": ["Setup GitHub Actions pipeline with automated smoke testing"],
      "documentation_links": ["https://prometheus.io/docs/introduction/overview/"]
    }}
  ]
}}
"""

RESUME_EXTRACTION_PROMPT = """
You are a senior technical recruiter and talent architect specializing in Multi-Cloud, DevOps, DevSecOps, and AI roles.
Extract structured candidate profile information from the following resume text.

Resume Text:
{resume_text}

Return ONLY a JSON object with this exact schema:
{{
  "candidate_name": "Full Name",
  "email": "Email address or null",
  "phone": "Phone number or null",
  "current_designation": "Current or recent title, e.g., Senior DevOps Engineer",
  "years_of_experience": 4.5,
  "summary": "2-3 sentence executive profile summary",
  "primary_skills": ["Skill 1", "Skill 2", "Skill 3"],
  "cloud_platforms": ["AWS", "Azure", "GCP"],
  "devops_tools": ["Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions"],
  "devsecops_tools": ["Trivy", "SonarQube", "Vault"],
  "ai_skills": ["LangChain", "OpenAI API", "MLOps"],
  "certifications": ["AWS Certified Solutions Architect", "CKA"],
  "education": ["B.Tech / B.S. in Computer Science, University Name (2022)"],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Role Title",
      "duration": "2022 - Present",
      "bullet_points": ["Managed AWS infrastructure...", "Configured CI/CD..."]
    }}
  ],
  "projects": [
    {{
      "title": "Project Name",
      "description": "Project summary",
      "technologies": ["AWS", "Terraform", "Kubernetes"]
    }}
  ]
}}
"""

RESUME_ATS_MATCH_PROMPT = """
You are an advanced Applicant Tracking System (ATS) and Senior Hiring Manager for Cloud & DevOps careers.
Compare the Candidate Resume against the Job Description and evaluate matching strength.

Job Role / Title: {job_title}
Job Description:
{job_description}

Candidate Resume Profile:
{resume_json}

Evaluate the match across 6 key dimensions (each 0 to 100%):
1. Skills Match (40% weight): Core hard skills alignment (Linux, K8s, Cloud, IaC).
2. Experience Match (20% weight): Depth of experience, seniority, and years in production.
3. Keywords Match (15% weight): ATS keyword penetration from the JD into the resume.
4. Projects Match (10% weight): Relevance and architectural complexity of listed projects.
5. Certifications Match (10% weight): Industry credentials (AWS, CKA, HashiCorp, etc.).
6. Job Role Match (5% weight): Title alignment and overall career trajectory fit.

Return ONLY a JSON object with this schema:
{{
  "ats_score": 76.5,
  "breakdown": {{
    "skills_match": 82.0,
    "experience_match": 75.0,
    "keywords_match": 68.0,
    "projects_match": 78.0,
    "certifications_match": 80.0,
    "job_role_match": 76.0
  }},
  "matching_skills": ["Linux", "AWS", "Docker", "Kubernetes", "Terraform"],
  "missing_skills": ["DevSecOps", "GitHub Actions", "ArgoCD", "AWS EKS"],
  "weak_areas": [
    "Experience section lists generic responsibilities without quantifiable metrics (e.g. % cost reduction, deployment latency reduction).",
    "Missing automated testing and security scanning mentions (SAST/DAST/Trivy)."
  ],
  "strong_areas": [
    "Hands-on multi-cloud architecture and container orchestration.",
    "Strong infrastructure as code foundation with Terraform."
  ],
  "recommended_interview_stages": [
    {{
      "stage_id": 1,
      "title": "Linux Systems & Diagnostics Warrior",
      "reason": "Verify foundational OS triage before advanced tooling"
    }},
    {{
      "stage_id": 2,
      "title": "Cloud Infrastructure & AWS EKS",
      "reason": "Address identified gap in managed Kubernetes architecture"
    }},
    {{
      "stage_id": 3,
      "title": "DevSecOps & Container Security",
      "reason": "Target missing security automation skills required by the JD"
    }}
  ]
}}
"""

RESUME_BULLET_IMPROVEMENT_PROMPT = """
You are a Staff Technical Career Coach. Enhance weak or generic resume bullet points into high-impact, STAR-method (Situation, Task, Action, Result) accomplishments with quantifiable metrics for CloudOps/DevOps/DevSecOps/AI roles.

Candidate Role: {role}
Current Bullet Point:
"{current_bullet}"

Context/Keywords to weave in: {keywords}

Return ONLY a JSON object with this schema:
{{
  "current": "{current_bullet}",
  "improved": "High-impact rewrite with strong action verb, technical precision, and measurable outcome (e.g., automated CI/CD pipeline using Jenkins & Docker, reducing release cycle time by 45% and eliminating manual deployment errors).",
  "impact_metrics_added": ["45% reduction in release cycle time", "Zero downtime deployments"],
  "skills_highlighted": ["CI/CD", "Docker", "Automation"],
  "rationale": "Transformed a passive duty statement into a quantifiable engineering accomplishment."
}}
"""

QUESTION_HINTS_PROMPT = """
You are a supportive technical mentor conducting a mock interview for:
Question: {question_text}
Expected Topics: {expected_topics}

Generate 3 progressive hints that guide the candidate without giving away the full answer immediately:
- Hint Level 1 (Clue): A gentle nudge on where to start looking or the core concept.
- Hint Level 2 (Commands & Tools): Mention specific Linux/Cloud/DevOps commands, tools, or metrics to inspect.
- Hint Level 3 (Deep Guidance): A structural walkthrough of the investigation and remediation steps.

Return ONLY a JSON object with this schema:
{{
  "hint_level_1": "Start by checking the Pod status, exit codes, and recent cluster events.",
  "hint_level_2": "Use `kubectl describe pod <name>` to inspect LastState and `kubectl logs <name> --previous` to check application crash stack traces.",
  "hint_level_3": "Follow the triage flow: Pod events -> OOMKilled vs Application exception -> Liveness probe misconfiguration -> Resource limits adjustment."
}}
"""

STUDY_PLAN_GENERATION_PROMPT = """
You are an expert CloudOps & DevOps Career Coach.
Generate a structured 5-task personalized study plan for a candidate targeting the role of '{target_role}'.

Candidate Profile & Detected Gaps:
- Target Role: {target_role}
- Available Hours Per Week: {available_hours}
- Detected Skill Gaps & Weak Areas: {focus_skills}

Return ONLY a JSON object with this exact schema:
{{
  "tasks": [
    {{
      "title": "Mastery & Troubleshooting: Topic Name",
      "category": "Linux & Systems",
      "skill": "Specific Skill Name",
      "difficulty": "INTERMEDIATE",
      "priority": "HIGH",
      "duration": 60,
      "xp": 75,
      "days_offset": 0,
      "time": "09:00 AM",
      "roadmap_stage": 1,
      "interview_stage": 2
    }}
  ]
}}
"""

