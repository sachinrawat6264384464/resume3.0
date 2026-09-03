import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.job_description import JobDescription
from app.models.interview_template import InterviewTemplate
from app.models.interview_stage import InterviewStage
from app.models.question import Question

async def seed_database():
    # Ensure all tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Organization
        org_stmt = select(Organization).where(Organization.slug == "default")
        res = await db.execute(org_stmt)
        org = res.scalar_one_or_none()
        if not org:
            org = Organization(
                name="CloudOps Academy",
                slug="default",
                description="Default Organization for Internal Assessments"
            )
            db.add(org)
            await db.flush()

        # 2. Admin User
        admin_stmt = select(User).where(User.email == "admin@cloudops.internal")
        res = await db.execute(admin_stmt)
        admin = res.scalar_one_or_none()
        if not admin:
            admin = User(
                organization_id=org.id,
                email="admin@cloudops.internal",
                full_name="Alex Vance (Admin)",
                hashed_password=get_password_hash("Admin@12345"),
                role=UserRole.ADMIN.value,
                is_active=True
            )
            db.add(admin)
            await db.flush()

        # 3. Main Candidate User (Rahul Sharma)
        cand_user_stmt = select(User).where(User.email == "candidate@cloudops.internal")
        res = await db.execute(cand_user_stmt)
        cand_user = res.scalar_one_or_none()
        if not cand_user:
            cand_user = User(
                organization_id=org.id,
                email="candidate@cloudops.internal",
                full_name="Rahul Sharma",
                hashed_password=get_password_hash("Candidate@12345"),
                role=UserRole.CANDIDATE.value,
                is_active=True
            )
            db.add(cand_user)
            await db.flush()

            cand_profile = Candidate(
                user_id=cand_user.id,
                organization_id=org.id,
                student_id="STU-2026-088",
                phone="+91 98765 43210",
                course="Multi-Cloud & DevOps Mastery",
                batch="Cohort 2026-A",
                experience_level="MID",
                target_role="Senior DevOps Engineer",
                notes="Candidate targeting ₹18–25 LPA roles. Strong Linux and AWS foundation.",
                xp=3450,
                level=4,
                streak_days=12,
                readiness_score=84.0,
                target_salary_band="₹18–25 LPA",
                skills_matrix_json={
                    "Linux": 88,
                    "AWS": 84,
                    "Docker": 80,
                    "Kubernetes": 78,
                    "Terraform": 74,
                    "DevSecOps": 62,
                    "AI Automation": 55
                },
                badges_json=["Linux Warrior", "Cloud Explorer", "AWS Ninja", "Kubernetes Warrior"]
            )
            db.add(cand_profile)
            await db.flush()

        # 3b. Sachin Rawat Candidate User
        sachin_user_stmt = select(User).where(User.email == "sachin@cloudops.internal")
        res = await db.execute(sachin_user_stmt)
        sachin_user = res.scalar_one_or_none()
        if not sachin_user:
            sachin_user = User(
                organization_id=org.id,
                email="sachin@cloudops.internal",
                full_name="Sachin Rawat",
                hashed_password=get_password_hash("Sachin@12345"),
                role=UserRole.CANDIDATE.value,
                is_active=True
            )
            db.add(sachin_user)
            await db.flush()

            sachin_profile = Candidate(
                user_id=sachin_user.id,
                organization_id=org.id,
                student_id="STU-2026-099",
                phone="+91 99999 88888",
                course="Multi-Cloud & DevOps Mastery",
                batch="Cohort 2026-A",
                experience_level="MID",
                target_role="Senior DevOps Engineer",
                notes="Sachin Rawat Candidate Profile.",
                xp=4200,
                level=5,
                streak_days=15,
                readiness_score=88.0,
                target_salary_band="₹18–25 LPA",
                skills_matrix_json={"Linux": 90, "AWS": 86, "Docker": 82, "Kubernetes": 80, "Terraform": 78},
                badges_json=["Linux Warrior", "Cloud Explorer", "AWS Ninja", "DevOps Master"]
            )
            db.add(sachin_profile)
            await db.flush()

        # Additional Sample Candidates for Leaderboard
        sample_candidates = [
            ("Priya Patel", "priya@cloudops.internal", "Cloud Architect", 2850, 3, 9, 81.0, "₹18–25 LPA", ["Linux Warrior", "Cloud Explorer", "Terraform Expert"]),
            ("Amit Verma", "amit@cloudops.internal", "DevOps Engineer", 2150, 3, 7, 78.0, "₹12–18 LPA", ["Linux Warrior", "CI/CD Master"]),
            ("Sneha Reddy", "sneha@cloudops.internal", "Site Reliability Engineer", 1850, 2, 5, 75.0, "₹12–18 LPA", ["Linux Warrior", "Cloud Explorer"]),
            ("Karan Malhotra", "karan@cloudops.internal", "DevSecOps Specialist", 4100, 5, 16, 91.0, "₹25–40 LPA", ["Linux Warrior", "Cloud Explorer", "AWS Ninja", "DevSecOps Defender", "CI/CD Master"])
        ]
        for name, email, role, xp, lvl, streak, readiness, band, badges in sample_candidates:
            u_res = await db.execute(select(User).where(User.email == email))
            if not u_res.scalar_one_or_none():
                u = User(
                    organization_id=org.id,
                    email=email,
                    full_name=name,
                    hashed_password=get_password_hash("Password@123"),
                    role=UserRole.CANDIDATE.value,
                    is_active=True
                )
                db.add(u)
                await db.flush()
                c = Candidate(
                    user_id=u.id,
                    organization_id=org.id,
                    student_id=f"STU-{xp}",
                    target_role=role,
                    xp=xp,
                    level=lvl,
                    streak_days=streak,
                    readiness_score=readiness,
                    target_salary_band=band,
                    badges_json=badges,
                    skills_matrix_json={"Linux": 85, "AWS": 80, "Docker": 75, "Kubernetes": 70, "Terraform": 65}
                )
                db.add(c)
                await db.flush()

        # 4. Job Description for CloudOps
        jd_stmt = select(JobDescription).where(JobDescription.title == "Senior DevOps & CloudOps Engineer")
        res = await db.execute(jd_stmt)
        jd = res.scalar_one_or_none()
        if not jd:
            jd = JobDescription(
                organization_id=org.id,
                title="Senior DevOps & CloudOps Engineer",
                raw_description="""
We are seeking an ambitious Senior DevOps & CloudOps Engineer to architect, automate, and safeguard production infrastructure across AWS, Kubernetes, and Terraform.
Responsibilities:
- Maintain 99.99% uptime for cloud infrastructure and microservices.
- Troubleshoot Linux OS, network, and storage issues in production.
- Implement CI/CD automation pipelines using GitHub Actions.
- Manage Terraform infrastructure as code with remote state locking.
- Setup Prometheus metrics, Grafana dashboards, and alert runbooks.
- Handle production incident response, post-mortems, and root cause analysis.
Requirements:
- Strong Linux systems administration (processes, permissions, systemd, networking).
- Practical experience with AWS (VPC, IAM, EC2, S3, RDS, CloudWatch).
- Solid containerization skills with Docker and Kubernetes cluster management.
- Familiarity with Terraform and CI/CD pipelines.
- Excellent communication and calm troubleshooting under pressure.
""",
                skills_json=["Linux Administration", "AWS Architecture", "Kubernetes", "Docker", "Terraform", "CI/CD", "Prometheus & Grafana", "DevSecOps"],
                technologies_json=["AWS", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "Linux (Ubuntu/RHEL)"],
                responsibilities_json=[
                    "Maintain 24/7 cloud infrastructure reliability and high availability",
                    "Troubleshoot production incidents, perform RCA, and execute runbooks",
                    "Automate deployment pipelines and manage IaC state"
                ],
                experience_level="MID",
                target_role="Senior DevOps Engineer",
                created_by=admin.id
            )
            db.add(jd)
            await db.flush()

        # 5. 5 Core Challenge Stages Blueprint
        template_stmt = select(InterviewTemplate).where(InterviewTemplate.title == "Multi-Cloud & DevOps Career Challenge (5 Core Stages)")
        res = await db.execute(template_stmt)
        template = res.scalar_one_or_none()
        if not template:
            template = InterviewTemplate(
                organization_id=org.id,
                job_description_id=jd.id,
                title="Multi-Cloud & DevOps Career Challenge (5 Core Stages)",
                description="Core 5-Stage gamified interview challenge spanning self introduction, Linux systems, AWS multi-cloud, container orchestration, and live production troubleshooting.",
                target_role="Senior DevOps Engineer",
                passing_score=80.0,
                status="ACTIVE",
                created_by=admin.id
            )
            db.add(template)
            await db.flush()

            # --- STAGE 1: Challenge 01 — Introduce Yourself & Technical Profile ---
            stage1 = InterviewStage(
                interview_template_id=template.id,
                stage_number=1,
                title="🏆 Challenge 01 — Introduce Yourself & Profile",
                category="Foundation",
                description="Master your opening impression: career journey, primary technical stack, and high-impact engineering accomplishments.",
                minimum_score=80.0,
                unlock_rule="PASS_PREVIOUS_STAGE"
            )
            db.add(stage1)
            await db.flush()

            q1_1 = Question(
                interview_stage_id=stage1.id,
                order_index=1,
                question_text="Please introduce yourself, walk through your technical journey in Cloud & DevOps, and highlight your most significant production achievement.",
                question_type="CONCEPTUAL",
                difficulty="INTERMEDIATE",
                skill_category="Communication & Profile",
                expected_topics=["present role", "years of experience", "core stack (AWS/K8s/Terraform)", "quantifiable accomplishment", "passion for reliability"],
                reference_answer="A structured 90-second pitch covering: 1) Current role and years of experience. 2) Core expertise in AWS, Linux, Kubernetes, and CI/CD automation. 3) Star project highlight where you reduced deployment times by 40% or eliminated downtime. 4) Why you are enthusiastic about high-scale infrastructure engineering.",
                evaluation_rubric={"technical_accuracy": 20, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 15, "communication_clarity": 20},
                hint_level_1="Use the Present -> Past -> Future structure with one specific quantified metric.",
                hint_level_2="Mention your primary tools (AWS, Docker, Kubernetes, Terraform) and connect them to business value.",
                hint_level_3="Keep it under 2 minutes: State your title, your core technical focus, describe a project where you solved a major bottleneck, and conclude with your career trajectory.",
                is_active="ACTIVE"
            )
            q1_2 = Question(
                interview_stage_id=stage1.id,
                order_index=2,
                question_text="When designing a cloud infrastructure solution, how do you balance cost optimization, high availability, and developer delivery speed?",
                question_type="CONCEPTUAL",
                difficulty="INTERMEDIATE",
                skill_category="Engineering Philosophy",
                expected_topics=["trade-offs", "multi-AZ vs multi-region", "auto-scaling", "Spot/Reserved instances", "CI/CD automated testing"],
                reference_answer="Explain the architectural triangle: 1) HA via Multi-AZ deployments with auto-scaling groups. 2) Cost governance using Spot instances for non-prod, right-sizing via CloudWatch metrics, and AWS Savings Plans. 3) Developer velocity through standardized Terraform modules and automated ephemeral preview environments.",
                evaluation_rubric={"technical_accuracy": 35, "concept_coverage": 25, "reasoning_quality": 25, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Frame your answer around trade-offs and SLA/SLO requirements.",
                hint_level_2="Mention Auto Scaling Groups, Spot instances for dev/staging, and Terraform module reusability.",
                hint_level_3="Structure: Define business SLAs -> Choose appropriate redundancy (Multi-AZ) -> Implement cost controls (Savings Plans/Spot) -> Automate pipelines for developer velocity.",
                is_active="ACTIVE"
            )
            db.add_all([q1_1, q1_2])

            # --- STAGE 2: Challenge 02 — Linux Systems & Diagnostics Warrior ---
            stage2 = InterviewStage(
                interview_template_id=template.id,
                stage_number=2,
                title="🐧 Challenge 02 — Linux Systems Warrior",
                category="Linux Diagnostics",
                description="Deep dive into Linux OS internals, kernel I/O wait, process triage, network socket inspection, and systemd.",
                minimum_score=80.0,
                unlock_rule="PASS_PREVIOUS_STAGE"
            )
            db.add(stage2)
            await db.flush()

            q2_1 = Question(
                interview_stage_id=stage2.id,
                order_index=1,
                question_text="How do you investigate high disk I/O wait and identify which Linux process is causing heavy disk read/write operations?",
                question_type="COMMAND",
                difficulty="INTERMEDIATE",
                skill_category="Linux Diagnostics",
                expected_topics=["iostat", "iotop", "vmstat", "dmesg", "top / htop (wa metric)", "/proc diskstats"],
                reference_answer="First inspect CPU wait time using top or vmstat to confirm I/O wait (wa). Then run 'iotop -o' to isolate the specific PID and process name performing active I/O. Use 'iostat -xz 1' to check disk device utilization percentage (%util) and queue length. Finally use 'lsof -p <PID>' or 'pidstat -d' to identify the specific files being read or written.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Check whether the CPU wait state ('%wa') is elevated before drilling into per-process disk activity.",
                hint_level_2="Use `top` to verify I/O wait, `iotop -o` to spot the offending PID, and `iostat -xz 1` to check disk saturation.",
                hint_level_3="Follow: `top` (%wa) -> `iotop -o` (isolate PID) -> `iostat -xz 1` (%util and await) -> `lsof -p <PID>` / `pidstat -d` (isolate open files).",
                is_active="ACTIVE"
            )
            q2_2 = Question(
                interview_stage_id=stage2.id,
                order_index=2,
                question_text="A critical systemd service failed to start on an Ubuntu server. Walk me through the exact terminal commands and steps you take to troubleshoot and recover it.",
                question_type="TROUBLESHOOTING",
                difficulty="INTERMEDIATE",
                skill_category="Linux Systems",
                expected_topics=["systemctl status", "journalctl -u <service> -xe", "exit code analysis", "configuration syntax check", "permissions / port conflict"],
                reference_answer="1) Run `systemctl status <service>` to check active state and exit code. 2) Inspect logs with `journalctl -u <service> -xe --no-pager` for stack traces. 3) Validate configuration file syntax and file permissions (e.g. ownership under /etc). 4) Check for TCP port conflicts using `ss -tulpn | grep <port>`. 5) Test the executable binary directly as the service user to isolate environment variables. 6) Reload daemon with `systemctl daemon-reload` and restart.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Start with systemctl status and journalctl logs before touching any configuration files.",
                hint_level_2="Run `journalctl -u <service> -xe` to see exact error output, and check port availability with `ss -tulpn`.",
                hint_level_3="Steps: `systemctl status` -> `journalctl -u <service> -xe` -> Validate config syntax & permissions -> Check socket bindings (`ss -tulpn`) -> `systemctl daemon-reload` & restart.",
                is_active="ACTIVE"
            )
            db.add_all([q2_1, q2_2])

            # --- STAGE 3: Challenge 03 — Multi-Cloud & AWS Cloud Engineer ---
            stage3 = InterviewStage(
                interview_template_id=template.id,
                stage_number=3,
                title="☁️ Challenge 03 — Cloud Infrastructure Engineer",
                category="Cloud Architecture",
                description="Assessment of AWS IAM roles vs users, VPC private subnet routing with NAT Gateways, and multi-AZ resilience.",
                minimum_score=80.0,
                unlock_rule="PASS_PREVIOUS_STAGE"
            )
            db.add(stage3)
            await db.flush()

            q3_1 = Question(
                interview_stage_id=stage3.id,
                order_index=1,
                question_text="Explain how AWS IAM Roles differ from IAM Users, and why IAM Roles with STS assume-role should be preferred for applications running on EC2 or EKS.",
                question_type="CONCEPTUAL",
                difficulty="INTERMEDIATE",
                skill_category="Cloud Security & IAM",
                expected_topics=["temporary credentials", "STS (Security Token Service)", "no hardcoded access keys", "automatic credential rotation", "least privilege role assumption", "IRSA"],
                reference_answer="IAM Users represent persistent identities with long-lived credentials (passwords, access key/secret key pairs) which risk leakage. IAM Roles do not have permanent credentials; instead, AWS STS issues temporary, short-lived security tokens that automatically rotate (via Instance Metadata / IRSA on EKS). This prevents credential compromise and enforces principle of least privilege.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Focus on the key security danger of static long-lived credentials vs temporary security tokens.",
                hint_level_2="Mention AWS STS (Security Token Service), automated token rotation, and IAM Roles for Service Accounts (IRSA).",
                hint_level_3="Contrast: IAM User (static keys, high risk) vs IAM Role (temporary STS credentials, automatic rotation, seamless IRSA on Kubernetes).",
                is_active="ACTIVE"
            )
            q3_2 = Question(
                interview_stage_id=stage3.id,
                order_index=2,
                question_text="What is the difference between a Public Subnet and a Private Subnet in an AWS VPC, and how do database instances in a private subnet securely download patches from the internet?",
                question_type="PRACTICAL",
                difficulty="INTERMEDIATE",
                skill_category="VPC Networking",
                expected_topics=["Internet Gateway (IGW)", "Route Tables", "NAT Gateway", "Public vs Private IP", "outbound-only egress traffic"],
                reference_answer="A Public Subnet has a route table entry (0.0.0.0/0) pointing directly to an Internet Gateway (IGW) and assigns public IPs to instances. A Private Subnet does not route directly to an IGW. To download updates, private subnet route tables direct 0.0.0.0/0 traffic to a NAT Gateway located in a public subnet, enabling outbound-only traffic while blocking inbound connections from the internet.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Focus on Route Table entries pointing to an Internet Gateway vs a NAT Gateway.",
                hint_level_2="Instances in a private subnet route outbound 0.0.0.0/0 traffic to a NAT Gateway residing inside a public subnet.",
                hint_level_3="Public Subnet: Direct IGW route table entry + Public IP. Private Subnet: No IGW route, outbound 0.0.0.0/0 goes through NAT Gateway in public subnet for unidirectional egress.",
                is_active="ACTIVE"
            )
            db.add_all([q3_1, q3_2])

            # --- STAGE 4: Challenge 04 — DevOps & Containerization Engineer ---
            stage4 = InterviewStage(
                interview_template_id=template.id,
                stage_number=4,
                title="🚀 Challenge 04 — DevOps & Containers Engineer",
                category="DevOps & CI/CD",
                description="Docker image optimization, Kubernetes Deployments vs StatefulSets, and zero-downtime CI/CD deployment strategies.",
                minimum_score=80.0,
                unlock_rule="PASS_PREVIOUS_STAGE"
            )
            db.add(stage4)
            await db.flush()

            q4_1 = Question(
                interview_stage_id=stage4.id,
                order_index=1,
                question_text="What strategies do you use to optimize Docker image sizes and enhance container security in production Dockerfiles?",
                question_type="PRACTICAL",
                difficulty="INTERMEDIATE",
                skill_category="Docker & Container Security",
                expected_topics=["multi-stage builds", "minimal base images (Alpine/Distroless)", "non-root user (USER directive)", ".dockerignore", "layer caching", "vulnerability scanning (Trivy)"],
                reference_answer="1) Use Multi-Stage builds to separate build dependencies/compilers from final runtime artifact. 2) Choose minimal base images like Alpine or Distroless. 3) Run containers as a non-root user (e.g. USER appuser). 4) Combine RUN instructions and clean package caches to minimize layers. 5) Use .dockerignore to exclude local binaries and .git directories. 6) Scan images in CI/CD using Trivy.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Think about separating the build environment from runtime binaries and removing root privileges.",
                hint_level_2="Mention Multi-Stage builds, Distroless/Alpine base images, non-root USER directives, and `.dockerignore`.",
                hint_level_3="List: 1) Multi-stage builds, 2) Distroless minimal runtime, 3) USER non-root, 4) .dockerignore, 5) Trivy automated vulnerability scanning.",
                is_active="ACTIVE"
            )
            q4_2 = Question(
                interview_stage_id=stage4.id,
                order_index=2,
                question_text="Explain the operational differences between Blue/Green deployment and Canary deployment. How do you automate rollback when error rates spike?",
                question_type="PRACTICAL",
                difficulty="INTERMEDIATE",
                skill_category="CI/CD & Release Engineering",
                expected_topics=["traffic routing percentage", "Blue/Green instant cutover", "Canary progressive rollout", "health check metrics (HTTP 5xx rate)", "automated rollback triggers"],
                reference_answer="Blue/Green provisions an identical new environment (Green) alongside live (Blue) and flips the load balancer router instantly (100% switch). Canary routes a small fraction (e.g. 5%) of live traffic to the new version, gradually increasing traffic while monitoring error rates and latency. If Prometheus metrics detect 5xx error spikes or latency anomalies, the pipeline immediately scales down the canary and restores routing.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Compare the instant 100% router flip of Blue/Green against the incremental traffic percentage of Canary.",
                hint_level_2="Describe how metrics (HTTP 5xx error budget or p99 latency) trigger automated rollbacks via Ingress / Argo Rollouts.",
                hint_level_3="Blue/Green: Two identical envs, 100% instant cutover. Canary: 5% -> 25% -> 100% progressive shift. Rollback: automated metric checks revert traffic instantly if 5xx threshold exceeds SLA.",
                is_active="ACTIVE"
            )
            db.add_all([q4_1, q4_2])

            # --- STAGE 5: Challenge 05 — Production Incident & Troubleshooting Boss ---
            stage5 = InterviewStage(
                interview_template_id=template.id,
                stage_number=5,
                title="🔥 Challenge 05 — Production Troubleshooting Boss",
                category="Live Incident Response",
                description="Final Boss Battle: Real-time triage of CrashLoopBackOff pods, 502/504 Bad Gateway errors, and Terraform state lock concurrency.",
                minimum_score=80.0,
                unlock_rule="PASS_PREVIOUS_STAGE"
            )
            db.add(stage5)
            await db.flush()

            q5_1 = Question(
                interview_stage_id=stage5.id,
                order_index=1,
                question_text="Explain step-by-step how you would troubleshoot a Kubernetes pod that is continuously stuck in a CrashLoopBackOff state in production.",
                question_type="TROUBLESHOOTING",
                difficulty="ADVANCED",
                skill_category="Kubernetes Production Debugging",
                expected_topics=["kubectl get pods", "kubectl describe pod (LastState, Exit Codes, Events)", "kubectl logs --previous", "OOMKilled (Exit Code 137)", "Liveness probe failures", "ConfigMap / Secret missing"],
                reference_answer="1) Run `kubectl describe pod <name>`: inspect Events table at the bottom and check LastState termination reason & exit code. 2) If Exit Code 137 -> OOMKilled, increase memory limits. 3) If Exit Code 1/2 -> application crash, run `kubectl logs <name> --previous` to inspect the exact fatal exception stack trace before crash. 4) Verify missing environment variables or unmounted ConfigMaps/Secrets. 5) Check if failing Liveness probes are repeatedly killing the container. 6) Apply fix in Deployment manifest and rollout.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Start by inspecting the Pod's exit code and recent cluster events.",
                hint_level_2="Use `kubectl describe pod` to check LastState (Exit Code 137 for OOMKilled) and `kubectl logs --previous` for crash stack traces.",
                hint_level_3="Complete triage: `kubectl describe pod` (Events & Exit Code) -> `kubectl logs --previous` -> Check OOMKilled vs App Exception vs Liveness Probe failure -> Fix ConfigMap/Limits -> `kubectl rollout restart`.",
                is_active="ACTIVE"
            )
            q5_2 = Question(
                interview_stage_id=stage5.id,
                order_index=2,
                question_text="Users report receiving HTTP 502 Bad Gateway and 504 Gateway Timeout errors when visiting a web application behind an Nginx Ingress Controller on Kubernetes. How do you isolate the root cause?",
                question_type="SCENARIO",
                difficulty="ADVANCED",
                skill_category="Production Incident Response",
                expected_topics=["Ingress controller logs", "Service endpoints (kubectl get ep)", "upstream timeout vs upstream connection refused", "backend pod CPU throttling / health", "keepalive settings"],
                reference_answer="1) Distinguish error types: HTTP 502 means Nginx received an immediate connection refused / invalid response from the upstream pod. HTTP 504 means the upstream pod accepted the connection but timed out responding. 2) Inspect Nginx ingress logs with `kubectl logs -n ingress-nginx <controller-pod>` to identify the upstream target IP and request latency. 3) Run `kubectl get endpoints <service>` to verify if active pod IPs exist. 4) Check backend pod metrics (CPU throttling, database lock contention). 5) Adjust ingress proxy-connect-timeout or scale backend replicas.",
                evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                hint_level_1="Distinguish the difference between 502 (Connection Refused from backend) and 504 (Gateway Timeout from slow backend).",
                hint_level_2="Inspect Nginx ingress controller access logs and check `kubectl get endpoints <service>` to verify healthy backend targets.",
                hint_level_3="Flow: 502 (upstream pod crashed/refusing socket) vs 504 (slow query/timeout) -> Ingress controller logs -> `kubectl get ep` -> Backend pod metrics & DB queries -> Scale replicas / adjust proxy timeout.",
                is_active="ACTIVE"
            )
            db.add_all([q5_1, q5_2])

        await db.commit()
        print("Database seeded successfully with 5 Core Challenge Stages and Leaderboard profiles!")

if __name__ == "__main__":
    asyncio.run(seed_database())
