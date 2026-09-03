import re
import json
from typing import Dict, Any, List
from app.ai.provider import AIProvider
from app.ai.confidence_analyzer import analyze_communication_signals
from app.schemas.evaluation import QuestionEvaluationResult

class MockAIProvider(AIProvider):
    """
    High-fidelity deterministic AI provider for offline testing, CI/CD, and zero-configuration development.
    Performs keyword & concept overlap matching against expected concepts and reference answers.
    """

    async def analyze_job_description(
        self,
        title: str,
        raw_description: str,
        experience_level: str = "MID"
    ) -> Dict[str, Any]:
        text_lower = raw_description.lower()
        skills = []
        technologies = []

        tech_map = {
            "kubernetes": "Kubernetes",
            "docker": "Docker",
            "terraform": "Terraform",
            "aws": "AWS (Amazon Web Services)",
            "gcp": "Google Cloud Platform (GCP)",
            "azure": "Microsoft Azure",
            "linux": "Linux Administration",
            "ci/cd": "CI/CD Pipelines (GitHub Actions / GitLab)",
            "ansible": "Ansible",
            "prometheus": "Prometheus & Grafana",
            "python": "Python Automation",
            "bash": "Shell / Bash Scripting",
            "helm": "Helm Package Manager",
            "iam": "Cloud Security & IAM",
            "networking": "TCP/IP, DNS, VPC & Subnetting"
        }

        for key, name in tech_map.items():
            if key in text_lower:
                technologies.append(name)
                skills.append(name.split()[0])

        if not skills:
            skills = ["Linux", "Cloud Infrastructure", "Docker", "CI/CD", "Terraform", "Monitoring"]
        if not technologies:
            technologies = ["AWS", "Kubernetes", "Docker", "Terraform", "Prometheus", "GitHub Actions"]

        return {
            "title": title or "CloudOps / DevOps Engineer",
            "target_role": "CloudOps Engineer" if "cloud" in (title + raw_description).lower() else "DevOps Engineer",
            "experience_level": experience_level.upper(),
            "skills": list(set(skills))[:8],
            "technologies": list(set(technologies))[:8],
            "responsibilities": [
                "Deploy and maintain scalable cloud infrastructure across multi-AZ environments.",
                "Build, optimize, and maintain automated CI/CD deployment pipelines.",
                "Manage containerized workloads on Kubernetes clusters with high availability.",
                "Implement 24/7 observability, metrics, alerts, and incident response runbooks.",
                "Enforce security best practices, IAM role least privilege, and network hardening."
            ],
            "suggested_stages": [
                {
                    "stage_number": 1,
                    "title": "Cloud & Linux Fundamentals",
                    "category": "Fundamentals",
                    "description": "Assessment of foundational OS, IAM, and cloud primitives."
                },
                {
                    "stage_number": 2,
                    "title": "Containerization & CI/CD",
                    "category": "DevOps",
                    "description": "Docker, Kubernetes orchestration, pipeline automation."
                },
                {
                    "stage_number": 3,
                    "title": "Infrastructure as Code & Observability",
                    "category": "Operations",
                    "description": "Terraform, CloudFormation, metrics, logging, alerting."
                },
                {
                    "stage_number": 4,
                    "title": "Production Troubleshooting Scenario",
                    "category": "Troubleshooting",
                    "description": "Incident response, RCA, and high availability architecture."
                }
            ]
        }

    async def generate_questions(
        self,
        role: str,
        stage_title: str,
        topic: str,
        difficulty: str = "INTERMEDIATE",
        question_type: str = "PRACTICAL",
        count: int = 3
    ) -> List[Dict[str, Any]]:
        questions = []
        defaults = [
            {
                "question_text": f"How do you investigate and resolve a production pod stuck in 'CrashLoopBackOff' state in Kubernetes?",
                "question_type": "TROUBLESHOOTING",
                "difficulty": difficulty,
                "skill_category": "Kubernetes & Troubleshooting",
                "expected_topics": ["kubectl logs", "kubectl describe pod", "exit code 137 / OOMKilled", "liveness/readiness probes", "application crash"],
                "reference_answer": "To investigate CrashLoopBackOff: 1) Run 'kubectl describe pod <name>' to inspect Events and exit codes. 2) Run 'kubectl logs <name> --previous' to view application error logs before crash. 3) Check if Exit Code is 137 (OOMKilled) indicating memory limit breach, or 1/2 for app config errors. 4) Verify readiness/liveness probe misconfigurations and missing ConfigMaps/Secrets.",
                "evaluation_rubric": {"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                "follow_up_question": "What is the difference in behavior between a failing liveness probe vs failing readiness probe?"
            },
            {
                "question_text": f"Explain the principle of least privilege in Cloud IAM and how you apply it when designing service accounts and IAM roles.",
                "question_type": "CONCEPTUAL",
                "difficulty": difficulty,
                "skill_category": "Cloud Security & IAM",
                "expected_topics": ["least privilege", "IAM roles vs users", "temporary credentials / STS", "granular permissions / ARNs", "permission boundaries"],
                "reference_answer": "Least privilege mandates granting only the minimum permissions necessary for a workload to function. For services, use IAM roles with short-lived STS tokens instead of long-lived access keys. Scope down Resource ARNs, use Condition blocks (e.g. source IP or MFA), and enforce Permission Boundaries to prevent privilege escalation.",
                "evaluation_rubric": {"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                "follow_up_question": "How do you detect and revoke unused or over-privileged IAM policies in AWS or GCP?"
            },
            {
                "question_text": f"Describe your strategy for managing Terraform state files securely and preventing race conditions in a team environment.",
                "question_type": "PRACTICAL",
                "difficulty": difficulty,
                "skill_category": "Infrastructure as Code",
                "expected_topics": ["remote backend (S3 / GCS)", "state locking (DynamoDB)", "encryption at rest / in transit", "sensitive values / secrets", "state isolation / workspaces"],
                "reference_answer": "Store state remotely in S3/GCS with server-side encryption (KMS) and versioning enabled. Prevent race conditions by configuring state locking via DynamoDB. Restrict backend access via strict IAM policies, never commit secrets to state, and separate state by environment or micro-workspaces.",
                "evaluation_rubric": {"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                "follow_up_question": "What steps do you take if a Terraform state lock gets permanently stuck due to a crashed CI runner?"
            }
        ]
        return defaults[:count]

    async def evaluate_answer(
        self,
        question_text: str,
        expected_topics: List[str],
        reference_answer: str,
        candidate_transcript: str,
        rubric: Dict[str, Any] = None,
        duration_seconds: float = 0.0
    ) -> QuestionEvaluationResult:
        transcript = (candidate_transcript or "").strip()
        comm_metrics = analyze_communication_signals(transcript, duration_seconds)

        if not transcript or len(transcript.split()) < 3:
            return QuestionEvaluationResult(
                technical_score=20.0,
                concept_coverage_score=15.0,
                reasoning_score=20.0,
                practical_score=20.0,
                communication_score=comm_metrics.structural_clarity_score,
                confidence_score=comm_metrics.confidence_estimate,
                overall_score=22.0,
                strengths=["Attempted to respond"],
                weaknesses=["Answer was too brief or incomplete to assess technical proficiency."],
                missing_concepts=expected_topics,
                feedback="The response was very short. Provide detailed explanations and step-by-step reasoning during technical interviews.",
                recommendations=["Practice articulating complete technical troubleshooting workflows out loud."],
                communication_metrics=comm_metrics
            )

        transcript_lower = transcript.lower()
        matched_topics = []
        missing_topics = []

        for topic in expected_topics:
            # Check keywords
            words = [w for w in re.split(r'[\s/,]+', topic.lower()) if len(w) > 2]
            if any(w in transcript_lower for w in words):
                matched_topics.append(topic)
            else:
                missing_topics.append(topic)

        coverage_ratio = len(matched_topics) / max(len(expected_topics), 1)
        
        # Calculate dynamic scores
        concept_coverage_score = round(min(100.0, max(30.0, coverage_ratio * 90.0 + 10.0)), 1)
        
        # Check reference keywords presence
        ref_words = set(re.findall(r'\b[A-Za-z]{4,}\b', reference_answer.lower()))
        matched_ref_words = [w for w in ref_words if w in transcript_lower]
        ref_ratio = len(matched_ref_words) / max(len(ref_words), 1)
        
        technical_score = round(min(98.0, max(35.0, (coverage_ratio * 55.0) + (ref_ratio * 35.0) + 10.0)), 1)
        reasoning_score = round(min(95.0, max(35.0, technical_score * 0.95 + (5.0 if len(transcript.split()) > 40 else 0.0))), 1)
        practical_score = round(min(95.0, max(30.0, technical_score * 0.92 + (8.0 if "log" in transcript_lower or "command" in transcript_lower or "run" in transcript_lower else 0.0))), 1)
        communication_score = comm_metrics.structural_clarity_score
        confidence_score = comm_metrics.confidence_estimate

        # Standard 5-pillar weights: 40% Tech, 25% Concept, 20% Reasoning, 10% Practical, 5% Communication
        overall = (
            technical_score * 0.40 +
            concept_coverage_score * 0.25 +
            reasoning_score * 0.20 +
            practical_score * 0.10 +
            communication_score * 0.05
        )
        overall_score = round(min(100.0, max(20.0, overall)), 1)

        strengths = []
        if matched_topics:
            strengths.append(f"Demonstrated solid understanding of {', '.join(matched_topics[:2])}.")
        if technical_score >= 80:
            strengths.append("Accurate technical reasoning and structured operational thought process.")
        elif technical_score >= 60:
            strengths.append("Clear familiarity with fundamental concepts.")

        weaknesses = []
        if missing_topics:
            weaknesses.append(f"Omitted key details regarding {', '.join(missing_topics[:2])}.")
        if practical_score < 75:
            weaknesses.append("Could benefit from highlighting concrete operational commands and mitigation steps.")

        recommendations = []
        if missing_topics:
            recommendations.append(f"Review core documentation on {missing_topics[0]}.")
        recommendations.append("Practice explaining failure modes and recovery procedures step-by-step.")

        feedback = f"Good technical effort. You covered {len(matched_topics)} out of {len(expected_topics)} target concepts. "
        if overall_score >= 80:
            feedback += "Strong performance demonstrating production-readiness."
        else:
            feedback += "Deepen your understanding of edge cases and specific operational tools."

        return QuestionEvaluationResult(
            technical_score=technical_score,
            concept_coverage_score=concept_coverage_score,
            reasoning_score=reasoning_score,
            practical_score=practical_score,
            communication_score=communication_score,
            confidence_score=confidence_score,
            overall_score=overall_score,
            strengths=strengths,
            weaknesses=weaknesses,
            missing_concepts=missing_topics,
            feedback=feedback,
            recommendations=recommendations,
            communication_metrics=comm_metrics
        )

    async def generate_feedback_and_plan(
        self,
        role: str,
        stage_scores: List[Dict[str, Any]],
        question_evaluations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        all_missing = []
        for q in question_evaluations:
            all_missing.extend(q.get("missing_concepts", []))

        gaps = list(set(all_missing))[:4]
        if not gaps:
            gaps = ["Kubernetes CNI & Ingress Routing", "State Locking & Terraform Workspaces", "Linux Kernel Out-of-Memory Handling"]

        return {
            "executive_summary": (
                f"The candidate completed the {role} assessment demonstrating foundational competence in core cloud "
                f"architecture and system administration workflows. Performance in foundational stages was steady, with "
                f"targeted opportunities to sharpen hands-on troubleshooting depth in complex failure scenarios."
            ),
            "critical_knowledge_gaps": gaps,
            "strengths": [
                "Strong grasp of core Linux process and filesystem hierarchies",
                "Clear conceptual familiarity with containerization principles and Docker lifecycle",
                "Structured and professional verbal communication throughout the interview"
            ],
            "weaknesses": [
                "Needs more depth in diagnosing advanced Kubernetes network and pod crash states",
                "Could improve clarity on Terraform state locking and distributed race condition prevention",
                "Tendency to provide conceptual answers where specific operational CLI commands were expected"
            ],
            "recommended_topics": [
                {
                    "topic": "Kubernetes Ingress & Service Networking",
                    "why_it_matters": "Essential for designing resilient microservice traffic ingress and troubleshooting 502/504 errors.",
                    "candidate_gap": "Candidate did not articulate differences between ClusterIP, NodePort, and LoadBalancer routing.",
                    "what_to_learn": ["Service mesh concepts", "Ingress Controllers (Nginx / Traefik)", "CoreDNS resolution"],
                    "recommended_docs": ["https://kubernetes.io/docs/concepts/services-networking/"],
                    "practice_exercises": ["Deploy an Nginx Ingress controller and verify routing with curl."]
                },
                {
                    "topic": "Infrastructure as Code State Management",
                    "why_it_matters": "Preventing state corruption and concurrency locks is vital for team-wide DevOps delivery.",
                    "candidate_gap": "Omitted DynamoDB locking backend configuration and state file encryption.",
                    "what_to_learn": ["Terraform Remote Backends", "DynamoDB State Locks", "Terraform import & state mv"],
                    "recommended_docs": ["https://developer.hashicorp.com/terraform/language/state/remote"],
                    "practice_exercises": ["Configure an S3 + DynamoDB remote backend with KMS encryption."]
                }
            ],
            "thirty_day_plan": [
                {
                    "week": 1,
                    "theme": "Linux Diagnostics & Networking Fundamentals",
                    "objectives": ["Master systemd, journalctl, ss, netstat, lsof, and top/htop triage."],
                    "hands_on_labs": ["Diagnose a high CPU/memory process leak and configure cgroup limits."],
                    "documentation_links": ["https://wiki.archlinux.org/title/Systemd"]
                },
                {
                    "week": 2,
                    "theme": "Docker Containerization & Image Optimization",
                    "objectives": ["Multi-stage builds, non-root user security, and vulnerability scanning with Trivy."],
                    "hands_on_labs": ["Optimize a production Python/Node container from 900MB down to 65MB."],
                    "documentation_links": ["https://docs.docker.com/develop/develop-images/dockerfile_best-practices/"]
                },
                {
                    "week": 3,
                    "theme": "Kubernetes Cluster Troubleshooting & Deployments",
                    "objectives": ["Pod lifecycle states, CrashLoopBackOff triage, and ConfigMaps/Secrets."],
                    "hands_on_labs": ["Simulate a broken liveness probe and debug the pod using kubectl logs --previous."],
                    "documentation_links": ["https://kubernetes.io/docs/tasks/debug/debug-application/"]
                },
                {
                    "week": 4,
                    "theme": "CI/CD Automation & Observability",
                    "objectives": ["Build GitHub Actions pipelines with linting, testing, and automated rollouts."],
                    "hands_on_labs": ["Deploy Prometheus and Grafana dashboards for cluster resource alerting."],
                    "documentation_links": ["https://prometheus.io/docs/introduction/overview/"]
                }
            ]
        }

    async def extract_resume_profile(self, resume_text: str) -> Dict[str, Any]:
        text_lower = resume_text.lower()
        skills = []
        tools = []
        cloud = []

        all_tools = {
            "aws": "AWS", "azure": "Azure", "gcp": "GCP",
            "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
            "terraform": "Terraform", "jenkins": "Jenkins", "ansible": "Ansible",
            "git": "Git", "github": "GitHub Actions", "gitlab": "GitLab CI",
            "prometheus": "Prometheus", "grafana": "Grafana", "linux": "Linux",
            "python": "Python", "bash": "Bash", "trivy": "Trivy", "sonarqube": "SonarQube"
        }
        for kw, name in all_tools.items():
            if kw in text_lower:
                if name in ["AWS", "Azure", "GCP"]:
                    cloud.append(name)
                elif name in ["Trivy", "SonarQube"]:
                    tools.append(name)
                else:
                    tools.append(name)
                    skills.append(name)

        if not skills:
            skills = ["Linux", "AWS", "Docker", "CI/CD", "Terraform", "Git"]
        if not cloud:
            cloud = ["AWS"]
        if not tools:
            tools = ["Docker", "Kubernetes", "Terraform", "Jenkins"]

        # Simple regex for name, email, phone
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text)
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_text)
        lines = [l.strip() for l in resume_text.split('\n') if l.strip()]
        candidate_name = lines[0] if lines else "Candidate"
        if len(candidate_name) > 40 or "@" in candidate_name:
            candidate_name = "Cloud & DevOps Candidate"

        return {
            "candidate_name": candidate_name,
            "email": email_match.group(0) if email_match else "candidate@cloudops.internal",
            "phone": phone_match.group(0) if phone_match else "+1 (555) 019-2834",
            "current_designation": "DevOps Engineer" if "devops" in text_lower else "Cloud Operations Engineer",
            "years_of_experience": 3.5,
            "summary": "Experienced Cloud & DevOps Engineer with proven background in automating deployments, containerizing workloads, and maintaining 99.9% uptime on AWS/Kubernetes.",
            "primary_skills": list(set(skills))[:8],
            "cloud_platforms": list(set(cloud)),
            "devops_tools": list(set(tools))[:8],
            "devsecops_tools": ["Trivy", "SonarQube", "Vault"] if "sec" in text_lower else ["Trivy"],
            "ai_skills": ["OpenAI API", "LangChain"] if "ai" in text_lower else ["Python Automation"],
            "certifications": ["AWS Certified Solutions Architect - Associate", "CKA (Certified Kubernetes Administrator)"],
            "education": ["B.S. in Computer Science / Information Technology"],
            "experience": [
                {
                    "company": "CloudTech Solutions",
                    "role": "DevOps Engineer",
                    "duration": "2023 - Present",
                    "bullet_points": [
                        "Maintained AWS cloud infrastructure across 3 VPCs with Terraform IaC.",
                        "Built automated CI/CD pipelines using GitHub Actions, reducing release time by 40%.",
                        "Managed Kubernetes microservices deployment with Helm charts and zero downtime."
                    ]
                }
            ],
            "projects": [
                {
                    "title": "High-Availability Multi-Region Kubernetes Architecture",
                    "description": "Implemented multi-cluster ingress routing, Prometheus monitoring, and automated failover.",
                    "technologies": ["AWS EKS", "Terraform", "Prometheus", "Helm"]
                }
            ]
        }

    async def match_resume_ats(self, job_title: str, job_description: str, resume_profile: Dict[str, Any]) -> Dict[str, Any]:
        skills = [s.lower() for s in resume_profile.get("primary_skills", []) + resume_profile.get("devops_tools", []) + resume_profile.get("cloud_platforms", [])]
        jd_lower = job_description.lower()
        resume_summary = (resume_profile.get("summary", "") + " ".join(resume_profile.get("certifications", []))).lower()

        # 1. Real Skill Overlap Calculation
        matched = []
        missing = []
        expected = ["linux", "aws", "kubernetes", "docker", "terraform", "ci/cd", "devsecops", "prometheus", "python", "ansible", "helm", "grafana", "git", "jenkins", "gcp", "azure"]
        
        for exp in expected:
            if exp in jd_lower:
                if any(exp in s for s in skills) or exp in resume_summary:
                    matched.append(exp.upper() if len(exp) <= 4 else exp.title())
                else:
                    missing.append(exp.upper() if len(exp) <= 4 else exp.title())

        matched_count = len(matched)
        missing_count = len(missing)
        total_jd_expected = max(1, matched_count + missing_count)
        skills_ratio = matched_count / total_jd_expected

        # 2. Dynamic 6-Factor Pillar Calculations based on actual candidate data
        skills_score = round(min(98.0, max(20.0, skills_ratio * 90.0 + 10.0)), 1)
        
        yoe = float(resume_profile.get("years_of_experience", 3.0))
        if "senior" in job_title.lower() or "lead" in job_title.lower():
            exp_score = round(min(95.0, max(30.0, (yoe / 5.0) * 85.0 + 15.0)), 1)
        else:
            exp_score = round(min(95.0, max(40.0, (yoe / 3.0) * 85.0 + 15.0)), 1)

        kw_score = round(min(96.0, max(25.0, skills_ratio * 85.0 + 12.0)), 1)

        projects = resume_profile.get("projects", [])
        proj_score = round(min(95.0, max(30.0, len(projects) * 35.0 + 25.0)), 1)

        certs = resume_profile.get("certifications", [])
        cert_score = round(min(98.0, max(20.0, len(certs) * 40.0 + 20.0)), 1)

        role_score = round(min(95.0, max(35.0, (skills_score * 0.6) + (exp_score * 0.4))), 1)

        ats_overall = round(
            skills_score * 0.35 +
            exp_score * 0.20 +
            kw_score * 0.15 +
            proj_score * 0.12 +
            cert_score * 0.10 +
            role_score * 0.08,
            1
        )

        return {
            "ats_score": ats_overall,
            "breakdown": {
                "skills_match": skills_score,
                "experience_match": exp_score,
                "keywords_match": kw_score,
                "projects_match": proj_score,
                "certifications_match": cert_score,
                "job_role_match": role_score
            },
            "matching_skills": matched if matched else ["Linux", "AWS"],
            "missing_skills": missing if missing else ["DevSecOps"],
            "weak_areas": [
                f"Resume matches {matched_count} out of {total_jd_expected} core JD requirements.",
                "Bullet points could include more quantifiable STAR performance metrics."
            ],
            "strong_areas": [
                f"Demonstrated hands-on experience in {', '.join(matched[:3]) if matched else 'CloudOps'}.",
                "Clear alignment with multi-cloud and containerized infrastructure."
            ],
            "recommended_interview_stages": [
                {"stage_id": 1, "title": "Profile & Career Pitch", "reason": "Validate technical background"},
                {"stage_id": 2, "title": "Linux Systems Warrior", "reason": "Evaluate core OS triage"},
                {"stage_id": 3, "title": "Multi-Cloud Architecture", "reason": "Test cloud architecture knowledge"}
            ]
        }

    async def improve_resume_bullet(self, role: str, current_bullet: str, keywords: str = "") -> Dict[str, Any]:
        lower = current_bullet.lower()
        if "jenkins" in lower or "ci/cd" in lower or "pipeline" in lower:
            improved = f"Automated end-to-end CI/CD pipelines using Jenkins & GitHub Actions, reducing release deployment cycle time by 45% and eliminating manual deployment downtime."
            metrics = ["45% reduction in release cycle time", "Zero downtime deployments"]
            skills = ["CI/CD Automation", "Jenkins", "GitHub Actions"]
        elif "aws" in lower or "cloud" in lower:
            improved = f"Architected and managed resilient AWS infrastructure across multi-AZ VPCs using Terraform IaC, slashing provisioning time from days to under 15 minutes."
            metrics = ["Provisioning reduced from days to 15 mins", "Multi-AZ high availability"]
            skills = ["AWS", "Terraform", "Infrastructure as Code"]
        elif "docker" in lower or "kubernetes" in lower or "k8s" in lower:
            improved = f"Engineered scalable Kubernetes microservice workloads with automated HPA scaling, maintaining 99.99% service availability during traffic surges."
            metrics = ["99.99% service uptime", "Automated horizontal pod autoscaling"]
            skills = ["Kubernetes", "Docker", "Container Orchestration"]
        else:
            improved = f"Streamlined {current_bullet.rstrip('.')}, standardizing infrastructure observability and boosting system reliability by 35% across production clusters."
            metrics = ["35% boost in system reliability", "Automated observability"]
            skills = ["System Reliability", "Production Operations"]

        return {
            "current": current_bullet,
            "improved": improved,
            "impact_metrics_added": metrics,
            "skills_highlighted": skills,
            "rationale": "Transformed passive task description into a high-impact, metrics-driven accomplishment with clear operational outcome."
        }

    async def generate_question_hints(self, question_text: str, expected_topics: List[str]) -> Dict[str, str]:
        q_lower = question_text.lower()
        if "restart" in q_lower or "crash" in q_lower or "pod" in q_lower:
            return {
                "hint_level_1": "Start by checking the Pod status, exit codes, and recent cluster events.",
                "hint_level_2": "Run `kubectl describe pod <name>` to inspect LastState/exit code and `kubectl logs <name> --previous` to see application crash stack traces.",
                "hint_level_3": "Follow the triage flow: Pod events -> OOMKilled vs Application exception -> Liveness probe misconfiguration -> Resource limits adjustment."
            }
        elif "disk" in q_lower or "i/o" in q_lower:
            return {
                "hint_level_1": "Determine whether the bottleneck is CPU wait time or disk device throughput.",
                "hint_level_2": "Use `top` to check '%wa' (I/O wait) and `iotop -o` to identify the active PID causing heavy read/write operations.",
                "hint_level_3": "Run `iostat -xz 1` to inspect %util and disk queue length, then identify open files using `lsof -p <PID>` or `pidstat -d`."
            }
        elif "role" in q_lower or "iam" in q_lower:
            return {
                "hint_level_1": "Focus on the fundamental difference between static long-lived credentials and temporary tokens.",
                "hint_level_2": "Mention AWS STS (Security Token Service), automatic credential rotation, and Instance Metadata Service (IMDS).",
                "hint_level_3": "Explain how IAM Roles eliminate hardcoded access keys and enable least-privilege role assumption on EC2/EKS via IRSA."
            }
        else:
            topics_str = ", ".join(expected_topics[:3]) if expected_topics else "key architectural concepts"
            return {
                "hint_level_1": f"Think about the underlying mechanism and focus on: {topics_str}.",
                "hint_level_2": f"Consider which commands or telemetry metrics you would inspect first to diagnose this in a live environment.",
                "hint_level_3": f"Structure your response with: Problem Context -> Diagnostic Steps -> Solution Implementation -> Long-term Prevention."
            }
