import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, text
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.job_description import JobDescription
from app.models.interview_template import InterviewTemplate
from app.models.interview_stage import InterviewStage
from app.models.question import Question
from app.models.payment_gateway import PaymentGatewayConfig, PaymentTransaction

# 31 STAGES DATA (Stage 0 to Stage 30)
STAGES_DATA = [
    # LEVEL 1 — FOUNDATION (0 - 5)
    {
        "stage_number": 0, "title": "Setup Your Interview Profile", "category": "Foundation", "level_name": "Level 1: Foundation",
        "description": "Configure your target role, salary band, and initial baseline skills profile.",
        "questions": [
            {
                "question_text": "Please state your target engineering role, primary technical stack, and career goals for this assessment.",
                "question_type": "CONCEPTUAL", "difficulty": "EASY", "skill_category": "Profile",
                "expected_topics": ["target role", "technical stack", "career goals", "experience level"],
                "reference_answer": "Clear statement of target role (e.g., Senior DevOps / CloudOps Engineer), core skills (AWS, Kubernetes, Terraform, Python), and career growth objectives.",
                "hint_level_1": "State your target role and main technologies.", "hint_level_2": "Connect your background to your target salary band.", "hint_level_3": "Mention 3 core tools you specialize in."
            },
            {
                "question_text": "What is your target salary band and key technical areas you wish to demonstrate during this interview journey?",
                "question_type": "CONCEPTUAL", "difficulty": "EASY", "skill_category": "Profile",
                "expected_topics": ["target salary", "key technical areas", "cloud infrastructure", "automation"],
                "reference_answer": "Specification of target compensation band and focus areas such as AWS architecture, Kubernetes orchestration, and CI/CD pipelines.",
                "hint_level_1": "Provide your target range clearly.", "hint_level_2": "Highlight key engineering strengths.", "hint_level_3": "Mention cloud platforms you have operated."
            }
        ]
    },
    {
        "stage_number": 1, "title": "Self Introduction", "category": "Foundation", "level_name": "Level 1: Foundation",
        "description": "Master your 60-second pitch, STAR background intro, and career story.",
        "questions": [
            {
                "question_text": "Please introduce yourself, walk through your technical journey in Cloud & DevOps, and highlight your most significant production achievement.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Communication & Profile",
                "expected_topics": ["present role", "years of experience", "core stack (AWS/K8s/Terraform)", "quantifiable accomplishment", "passion for reliability"],
                "reference_answer": "A structured pitch covering: 1) Current role & experience. 2) Core expertise in AWS, Linux, Kubernetes, and CI/CD. 3) STAR project highlight with quantified impact. 4) Engineering passion.",
                "hint_level_1": "Use Present -> Past -> Future structure with quantified metrics.", "hint_level_2": "Mention AWS, Docker, Kubernetes, Terraform.", "hint_level_3": "Keep under 2 minutes with specific SLA / cost savings numbers."
            },
            {
                "question_text": "When designing a cloud infrastructure solution, how do you balance cost optimization, high availability, and developer delivery speed?",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Engineering Philosophy",
                "expected_topics": ["trade-offs", "multi-AZ vs multi-region", "auto-scaling", "Spot/Reserved instances", "CI/CD automated testing"],
                "reference_answer": "Explain the architectural balance: HA via Multi-AZ auto-scaling, cost governance via Spot/Reserved instances and right-sizing, and developer velocity via reusable Terraform modules.",
                "hint_level_1": "Frame answer around trade-offs and SLAs.", "hint_level_2": "Mention Auto-scaling, Spot instances, and IaC modules.", "hint_level_3": "Define business SLAs -> Choose redundancy -> Cost controls -> Automate pipelines."
            }
        ]
    },
    {
        "stage_number": 2, "title": "Technical Introduction", "category": "Foundation", "level_name": "Level 1: Foundation",
        "description": "Explain your daily technical workflow, tool stack, and architecture experience.",
        "questions": [
            {
                "question_text": "Walk us through your daily technical workflow as a DevOps/Cloud engineer, from code commit to production deployment.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "DevOps Workflow",
                "expected_topics": ["git branch", "pull request review", "ci/cd pipeline", "automated testing", "container build", "deployment to k8s"],
                "reference_answer": "Detailed walkthrough: Developer feature branch -> PR review with automated SAST/unit tests -> CI container build & scanning -> CD deployment via Helm/ArgoCD -> Telemetry monitoring.",
                "hint_level_1": "Trace code from local git commit to live cluster.", "hint_level_2": "Include automated testing gates and GitOps continuous delivery.", "hint_level_3": "Cover Git PR -> CI build & scan -> ArgoCD release -> Datadog/Prometheus validation."
            },
            {
                "question_text": "How do you approach learning and integrating new cloud-native technologies into an existing production stack?",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Technical Leadership",
                "expected_topics": ["proof of concept", "benchmarking", "security review", "pilot deployment", "documentation and team training"],
                "reference_answer": "Structured adoption: 1) Identify business problem & PoC evaluation. 2) Load & security benchmarking. 3) Staging pilot deployment. 4) Runbook creation and knowledge transfer.",
                "hint_level_1": "Outline a 4-step evaluation process.", "hint_level_2": "Mention PoC benchmarking and security compliance.", "hint_level_3": "Explain PoC -> Staging Pilot -> Runbook & Knowledge Transfer -> Prod Rollout."
            }
        ]
    },
    {
        "stage_number": 3, "title": "Linux for Cloud Engineers", "category": "Linux Diagnostics", "level_name": "Level 1: Foundation",
        "description": "Process signals, memory triage, top/htop/iotop, and bash scripting.",
        "questions": [
            {
                "question_text": "How do you investigate high disk I/O wait and identify which Linux process is causing heavy disk read/write operations?",
                "question_type": "COMMAND", "difficulty": "INTERMEDIATE", "skill_category": "Linux Diagnostics",
                "expected_topics": ["iostat", "iotop", "vmstat", "top / htop", "/proc diskstats"],
                "reference_answer": "1) Check CPU wait time (%wa) with top/vmstat. 2) Run 'iotop -o' to isolate active PID. 3) Use 'iostat -xz 1' to check disk device utilization. 4) Run 'lsof -p <PID>' or 'pidstat -d' to view open files.",
                "hint_level_1": "Verify %wa in top before per-process disk inspection.", "hint_level_2": "Use iotop -o and iostat -xz 1.", "hint_level_3": "Flow: top (%wa) -> iotop -o (PID) -> iostat -xz 1 (%util) -> pidstat -d / lsof."
            },
            {
                "question_text": "Explain the difference between SIGTERM (15) and SIGKILL (9) process signals in Linux, and how applications handle them.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Linux Systems",
                "expected_topics": ["sigterm 15", "sigkill 9", "graceful shutdown", "signal handlers", "kernel termination"],
                "reference_answer": "SIGTERM (15) requests graceful shutdown, allowing the application to close connections and flush files. SIGKILL (9) is handled directly by the kernel and forcefully terminates the process immediately without cleanup.",
                "hint_level_1": "Compare soft request vs instant kernel termination.", "hint_level_2": "Mention signal handlers for SIGTERM.", "hint_level_3": "SIGTERM can be caught and handled for graceful exit; SIGKILL cannot be intercepted."
            }
        ]
    },
    {
        "stage_number": 4, "title": "Linux for DevOps Engineers", "category": "Linux Systems", "level_name": "Level 1: Foundation",
        "description": "Systemd service units, kernel tuning, disk I/O bottlenecks, and cron automation.",
        "questions": [
            {
                "question_text": "A critical systemd service failed to start on an Ubuntu server. Walk me through the exact terminal commands and steps you take to troubleshoot and recover it.",
                "question_type": "TROUBLESHOOTING", "difficulty": "INTERMEDIATE", "skill_category": "Linux Systems",
                "expected_topics": ["systemctl status", "journalctl -u <service> -xe", "exit code analysis", "configuration syntax check", "port conflict"],
                "reference_answer": "1) `systemctl status <service>` for exit code. 2) `journalctl -u <service> -xe --no-pager` for logs. 3) Verify config syntax and permissions. 4) `ss -tulpn | grep <port>` for port conflicts. 5) `systemctl daemon-reload` & restart.",
                "hint_level_1": "Start with systemctl status and journalctl logs.", "hint_level_2": "Check journalctl -u -xe and port conflicts with ss -tulpn.", "hint_level_3": "Steps: status -> journalctl -xe -> config check -> port check -> daemon-reload & restart."
            },
            {
                "question_text": "How do you triage a 'No space left on device' error when `df -h` shows disk space available, but `df -i` shows 100% inode usage?",
                "question_type": "TROUBLESHOOTING", "difficulty": "INTERMEDIATE", "skill_category": "Linux Diagnostics",
                "expected_topics": ["inodes exhaustion", "df -i", "find small files", "unlinked open files (lsof)", "delete temporary files"],
                "reference_answer": "Inode exhaustion happens when millions of tiny files exhaust file table entries. Fix: 1) Verify inodes with `df -i`. 2) Locate directory with excessive files via `find /path -xdev -printf '%h\n' | sort | uniq -c | sort -nr | head -10`. 3) Delete temp/session files. 4) Check for unlinked open deleted files holding inodes using `lsof +L1`.",
                "hint_level_1": "Contrast storage bytes vs file system metadata inode count.", "hint_level_2": "Use `df -i` and find directories with millions of small files.", "hint_level_3": "Check `df -i` -> find high-count directories -> delete temp files -> inspect `lsof +L1`."
            }
        ]
    },
    {
        "stage_number": 5, "title": "Cloud + DevOps Fundamentals", "category": "Cloud Architecture", "level_name": "Level 1: Foundation",
        "description": "Core cloud models, virtualization vs containerization, and IaC basics.",
        "questions": [
            {
                "question_text": "Compare Virtual Machines (hypervisor-based) vs Containers (OS-level virtualization) in terms of architecture, performance, isolation, and resource overhead.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Virtualization",
                "expected_topics": ["hypervisor type 1/2", "shared OS kernel", "cgroups & namespaces", "startup latency", "resource footprint"],
                "reference_answer": "VMs run full guest OS instances on hypervisors (strong isolation, heavy overhead, minutes startup). Containers share the host OS kernel using Linux namespaces & cgroups (lightweight MB footprint, sub-second startup, process isolation).",
                "hint_level_1": "Compare guest OS overhead vs shared kernel namespaces.", "hint_level_2": "Mention Linux cgroups, namespaces, and hypervisors.", "hint_level_3": "VM: Guest OS + Hypervisor (Heavy). Container: Shared Kernel + Namespaces/Cgroups (Lightweight)."
            },
            {
                "question_text": "What are the core principles of Infrastructure as Code (IaC) and why is declarative code preferred over imperative scripts?",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Infrastructure as Code",
                "expected_topics": ["declarative vs imperative", "desired state", "idempotency", "version control", "drift detection"],
                "reference_answer": "Declarative IaC (Terraform) specifies the desired target state; the engine calculates execution steps automatically. Imperative scripts (Bash/AWS CLI) specify step-by-step commands which lack built-in idempotency and state management.",
                "hint_level_1": "Contrast 'What to build' vs 'How to build'.", "hint_level_2": "Explain desired target state and state management.", "hint_level_3": "Declarative: Self-healing, idempotent desired state. Imperative: Step-by-step scripts, prone to drift."
            }
        ]
    },

    # LEVEL 2 — CLOUD (6 - 10)
    {
        "stage_number": 6, "title": "AWS Cloud Engineer", "category": "AWS Architecture", "level_name": "Level 2: Cloud",
        "description": "VPC networking, subnets, NAT Gateways, IAM policies, and S3 lifecycle.",
        "questions": [
            {
                "question_text": "Explain how AWS IAM Roles differ from IAM Users, and why IAM Roles with STS assume-role should be preferred for applications running on EC2 or EKS.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Cloud Security & IAM",
                "expected_topics": ["temporary credentials", "STS (Security Token Service)", "no static access keys", "automatic rotation", "IRSA"],
                "reference_answer": "IAM Users have permanent static access keys vulnerable to leakage. IAM Roles use temporary Security Token Service (STS) credentials that auto-rotate without hardcoded secrets (using Instance Profiles or IRSA on EKS).",
                "hint_level_1": "Focus on static keys vs temporary security tokens.", "hint_level_2": "Mention AWS STS and IRSA.", "hint_level_3": "IAM User = Static keys. IAM Role = Dynamic temporary STS tokens, automated rotation."
            },
            {
                "question_text": "What is the difference between a Public Subnet and a Private Subnet in an AWS VPC, and how do database instances in a private subnet securely download patches from the internet?",
                "question_type": "PRACTICAL", "difficulty": "INTERMEDIATE", "skill_category": "VPC Networking",
                "expected_topics": ["Internet Gateway (IGW)", "Route Tables", "NAT Gateway", "Public IP", "outbound-only egress"],
                "reference_answer": "Public Subnets route 0.0.0.0/0 to an IGW and assign public IPs. Private Subnets have no IGW route; outbound internet traffic routes through a NAT Gateway in a public subnet for egress-only access.",
                "hint_level_1": "Compare Route Table entries to IGW vs NAT Gateway.", "hint_level_2": "Private subnet routes 0.0.0.0/0 to NAT Gateway in public subnet.", "hint_level_3": "Public: Direct IGW. Private: Egress-only outbound via NAT Gateway."
            }
        ]
    },
    {
        "stage_number": 7, "title": "GCP Cloud Engineer", "category": "GCP Infrastructure", "level_name": "Level 2: Cloud",
        "description": "Google Cloud IAM, VPC Service Controls, GKE basics, and BigQuery Ops.",
        "questions": [
            {
                "question_text": "Explain the GCP Resource Hierarchy (Organization -> Folders -> Projects -> Resources) and how IAM policy inheritance works across these levels.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "GCP IAM",
                "expected_topics": ["organization node", "folders structure", "project level", "iam policy inheritance", "least privilege"],
                "reference_answer": "GCP hierarchy propagates policies top-down. Policies applied at Organization or Folder level inherit automatically down to child Projects and Resources, enforcing enterprise guardrails.",
                "hint_level_1": "Follow the top-down inheritance tree.", "hint_level_2": "Org -> Folder -> Project -> Resource IAM inheritance.", "hint_level_3": "Parent policies inherit down to children and cannot be revoked by lower levels."
            },
            {
                "question_text": "Compare Google Kubernetes Engine (GKE) Autopilot vs GKE Standard in terms of node management, cost model, and cluster operational overhead.",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "GCP Kubernetes",
                "expected_topics": ["gke autopilot", "gke standard", "fully managed nodes", "pod-level billing", "node pool tuning"],
                "reference_answer": "GKE Standard requires manual node pool sizing, OS upgrades, and capacity planning billed per node. GKE Autopilot manages all node infrastructure, auto-scaling, and security hardening, billing strictly per Pod resource request.",
                "hint_level_1": "Compare per-node billing vs per-pod resource request billing.", "hint_level_2": "Autopilot manages OS patching and node sizing automatically.", "hint_level_3": "Standard: You manage node pools & pay per VM. Autopilot: Google manages nodes & you pay per Pod request."
            }
        ]
    },
    {
        "stage_number": 8, "title": "Azure Cloud Engineer", "category": "Azure Infrastructure", "level_name": "Level 2: Cloud",
        "description": "Azure VNets, Entra ID, Virtual Machine Scale Sets, and Resource Groups.",
        "questions": [
            {
                "question_text": "How do Azure Managed Identities eliminate the need for credential management in application code when connecting to Azure Key Vault or SQL Database?",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Azure Security",
                "expected_topics": ["system-assigned identity", "user-assigned identity", "entra id (azure ad)", "token acquisition", "zero hardcoded credentials"],
                "reference_answer": "Azure Managed Identities provide an automatically managed identity in Entra ID for Azure resources. Applications acquire short-lived OAuth tokens via local IMDS endpoints without storing client secrets in code.",
                "hint_level_1": "Focus on token acquisition without static secrets.", "hint_level_2": "System-assigned vs User-assigned identity via Entra ID.", "hint_level_3": "App requests token from IMDS -> Azure validates Managed Identity -> Token grants key vault access."
            },
            {
                "question_text": "What is Azure VNet Peering and how do Network Security Groups (NSGs) control traffic flow between peered VNets?",
                "question_type": "PRACTICAL", "difficulty": "INTERMEDIATE", "skill_category": "Azure Networking",
                "expected_topics": ["vnet peering", "low latency private backbone", "nsg inbound/outbound rules", "service tags", "no gateway required"],
                "reference_answer": "VNet Peering connects VNets via Microsoft backbone with low latency. NSGs contain stateful firewall rules (priority, source, destination, port) evaluated at subnet or NIC level to filter peered traffic.",
                "hint_level_1": "VNet Peering uses Microsoft backbone private IPs.", "hint_level_2": "NSG rules evaluate 5-tuple conditions with priority numbers.", "hint_level_3": "Peering links VNets seamlessly; NSGs enforce stateful ingress/egress filtering rules."
            }
        ]
    },
    {
        "stage_number": 9, "title": "Multi-Cloud Architecture", "category": "Multi-Cloud", "level_name": "Level 2: Cloud",
        "description": "Inter-cloud VPN peering, multi-cloud IAM federation, and cost optimization.",
        "questions": [
            {
                "question_text": "How do you design an inter-cloud network topology connecting AWS VPCs and Azure VNets securely using IPsec VPN or Megaport Cloud Router?",
                "question_type": "PRACTICAL", "difficulty": "HARD", "skill_category": "Multi-Cloud Networking",
                "expected_topics": ["ipsec vpn tunnel", "bgp routing", "aws customer gateway", "azure vnet gateway", "megaport cloud router"],
                "reference_answer": "Design Dual IPsec VPN tunnels with BGP dynamic routing between AWS Virtual Private Gateway / Transit Gateway and Azure VPN Gateway, or utilize an Equinix / Megaport cloud router for high-throughput private peering.",
                "hint_level_1": "Describe IPsec tunnels with BGP dynamic routing.", "hint_level_2": "Mention AWS TGW, Azure VPN Gateway, and BGP ASN numbers.", "hint_level_3": "Setup redundant IPsec tunnels -> Configure BGP ASNs -> Enable transit gateway route propagation."
            },
            {
                "question_text": "What strategies do you implement to avoid cloud vendor lock-in when deploying containerized microservices across multi-cloud environments?",
                "question_type": "CONCEPTUAL", "difficulty": "HARD", "skill_category": "Multi-Cloud Strategy",
                "expected_topics": ["kubernetes standard", "cloud agnostic terraform", "open source databases (postgres/redis)", "opentelemetry", "portable ci/cd"],
                "reference_answer": "1) Standardize on vanilla Kubernetes (EKS/GKE/AKS). 2) Use Cloud-agnostic Terraform modules. 3) Deploy open-source data stores (PostgreSQL/Kafka) or multi-cloud abstraction layers (CockroachDB). 4) Use OpenTelemetry for telemetry.",
                "hint_level_1": "Focus on open standards and container abstraction.", "hint_level_2": "Mention CNCF Kubernetes standards and OpenTelemetry.", "hint_level_3": "CNCF Containers + Agnostic IaC (Terraform) + OpenSource DBs = Cloud Independence."
            }
        ]
    },
    {
        "stage_number": 10, "title": "Cloud Real-Time Scenarios", "category": "Incident Response", "level_name": "Level 2: Cloud",
        "description": "Cross-region failover, DNS failover with Route53, and storage outage triage.",
        "questions": [
            {
                "question_text": "AWS us-east-1 experiences a major outage. Walk through how Route53 DNS Failover and multi-region database read replicas automatically shift traffic to us-west-2.",
                "question_type": "SCENARIO", "difficulty": "HARD", "skill_category": "Disaster Recovery",
                "expected_topics": ["route53 health checks", "dns failover policy", "rds cross-region read replica", "rto and rpo", "failover promotion script"],
                "reference_answer": "1) Route53 Health Checks detect primary endpoint failure. 2) DNS failover updates record target to us-west-2 ALB. 3) Cross-Region RDS Read Replica is promoted to primary standalone DB. 4) App services in us-west-2 resume write operations within target RTO/RPO limits.",
                "hint_level_1": "Trace Route53 health checks to DB replica promotion.", "hint_level_2": "Mention RTO/RPO SLA metrics and Route53 DNS TTL.", "hint_level_3": "Route53 alarm triggers -> DNS record fails over -> Promote RDS read replica -> Shift active traffic."
            },
            {
                "question_text": "An AWS S3 bucket containing sensitive customer documents accidentally became publicly readable. How do you detect, isolate, and remediate this instantly?",
                "question_type": "TROUBLESHOOTING", "difficulty": "HARD", "skill_category": "Cloud Security Triage",
                "expected_topics": ["aws config rule", "s3 block public access", "cloudtrail audit logs", "eventbridge trigger", "automated lambda remediation"],
                "reference_answer": "1) AWS Config / GuardDuty detects non-compliant S3 ACL change. 2) EventBridge triggers automated Lambda remediation script to apply 'S3 Block Public Access'. 3) Query CloudTrail logs (`s3:PutBucketPolicy`, `s3:GetObject`) to audit external IP access.",
                "hint_level_1": "Combine AWS Config automated rules with Lambda remediation.", "hint_level_2": "Use EventBridge -> Lambda to force `Block Public Access` and audit via CloudTrail.", "hint_level_3": "Detect via GuardDuty/Config -> Auto-remediate with Lambda (S3 Block Public) -> Audit access via CloudTrail."
            }
        ]
    },

    # LEVEL 3 — DEVOPS (11 - 15)
    {
        "stage_number": 11, "title": "Git + GitHub Workflow", "category": "DevOps Practices", "level_name": "Level 3: DevOps",
        "description": "Git rebase vs merge, git bisect, branch protection rules, and merge conflicts.",
        "questions": [
            {
                "question_text": "Explain the difference between `git merge` and `git rebase`. When should you use interactive rebase vs a squash merge in a team workflow?",
                "question_type": "CONCEPTUAL", "difficulty": "INTERMEDIATE", "skill_category": "Git Mastery",
                "expected_topics": ["linear commit history", "merge commit", "git rebase -i", "squash merge", "shared branch safety"],
                "reference_answer": "Git merge preserves history with a merge commit. Git rebase rewrites feature commits on top of base branch for a linear history. Interactive rebase (`git rebase -i`) cleans up feature commits locally before squash merging into main.",
                "hint_level_1": "Compare linear history vs non-destructive merge commit history.", "hint_level_2": "Never rebase shared public branches.", "hint_level_3": "Use interactive rebase locally to clean commits -> Use squash merge for PR integration."
            },
            {
                "question_text": "How do you use `git bisect` to pinpoint the exact commit that introduced a performance regression in a large codebase?",
                "question_type": "COMMAND", "difficulty": "INTERMEDIATE", "skill_category": "Git Troubleshooting",
                "expected_topics": ["git bisect start", "git bisect good", "git bisect bad", "automated test script", "binary search"],
                "reference_answer": "1) Run `git bisect start`. 2) Mark bad commit (`git bisect bad HEAD`) and known good commit (`git bisect good v1.0`). 3) Git binary searches commits; run test suite at each step (`git bisect run ./test.sh`) to find bad commit.",
                "hint_level_1": "It uses binary search algorithm through commit graph.", "hint_level_2": "Automate evaluation with `git bisect run <script>`.", "hint_level_3": "start -> mark good/bad -> run automated test script -> bisect identifies exact offending commit hash."
            }
        ]
    },
    {
        "stage_number": 12, "title": "Jenkins + CI/CD Pipelines", "category": "CI/CD Engineering", "level_name": "Level 3: DevOps",
        "description": "Multibranch Jenkinsfiles, shared libraries, matrix builds, and caching.",
        "questions": [
            {
                "question_text": "How do Jenkins Shared Libraries simplify enterprise pipeline maintenance and enforce security scanning standards across hundreds of microservices?",
                "question_type": "CONCEPTUAL", "difficulty": "HARD", "skill_category": "Jenkins Engineering",
                "expected_topics": ["groovy shared library", "vars directory", "global pipeline templates", "centralized security gates", "versioned library tags"],
                "reference_answer": "Jenkins Shared Libraries externalize pipeline logic in Groovy repos (`vars/`). Centralizing stages (build, SonarQube SAST, Trivy scan, ArgoCD trigger) ensures all microservices automatically inherit enforced enterprise security standards.",
                "hint_level_1": "Think DRY (Don't Repeat Yourself) for enterprise CI pipelines.", "hint_level_2": "Store Groovy steps in `vars/` and import via `@Library`.", "hint_level_3": "@Library('shared-pipeline-libs') -> Standardized build/scan/deploy steps across all repos."
            },
            {
                "question_text": "Explain how Jenkins Matrix Builds optimize build execution times for multi-platform application testing.",
                "question_type": "PRACTICAL", "difficulty": "HARD", "skill_category": "CI/CD Performance",
                "expected_topics": ["matrix axis", "parallel execution", "build nodes label", "jdk/python versions matrix", "failFast configuration"],
                "reference_answer": "Matrix builds define multidimensional execution axes (e.g. Node 18/20 x Ubuntu/RHEL). Jenkins launches parallel build agents across nodes simultaneously, reducing multi-platform test suite duration drastically.",
                "hint_level_1": "Define execution axes for concurrent build agents.", "hint_level_2": "Run test matrices in parallel with `failFast true`.", "hint_level_3": "Matrix block -> Axis definitions -> Concurrent agent allocation -> Aggregated test results."
            }
        ]
    },
    {
        "stage_number": 13, "title": "Docker Containerization", "category": "Containerization", "level_name": "Level 3: DevOps",
        "description": "Multi-stage Dockerfiles, image minimization, cgroups, and container networking.",
        "questions": [
            {
                "question_text": "What strategies do you use to optimize Docker image sizes and enhance container security in production Dockerfiles?",
                "question_type": "PRACTICAL", "difficulty": "HARD", "skill_category": "Docker & Container Security",
                "expected_topics": ["multi-stage builds", "minimal base images (Alpine/Distroless)", "non-root user (USER directive)", ".dockerignore", "layer caching", "vulnerability scanning (Trivy)"],
                "reference_answer": "1) Multi-Stage builds to exclude build tools. 2) Distroless/Alpine base images. 3) Non-root `USER` directive. 4) `.dockerignore` to exclude local artifacts. 5) Trivy scanning in CI.",
                "hint_level_1": "Separate build environment from runtime binaries.", "hint_level_2": "Use Alpine/Distroless and USER directive.", "hint_level_3": "Multi-stage -> Distroless runtime -> Non-root user -> Trivy automated scanning."
            },
            {
                "question_text": "Explain how Linux Namespaces (PID, NET, MNT, IPC, UTS) and Control Groups (cgroups) form the runtime foundation of Docker containers.",
                "question_type": "CONCEPTUAL", "difficulty": "HARD", "skill_category": "Linux Kernel & Containers",
                "expected_topics": ["namespaces (isolation)", "cgroups (resource limiting)", "pid/net/mnt namespaces", "cgroups v2 memory limit", "kernel sharing"],
                "reference_answer": "Namespaces provide runtime process isolation (PID), network interfaces (NET), and mount points (MNT). Control Groups (cgroups) restrict and account for CPU, memory, and I/O resource consumption per container.",
                "hint_level_1": "Namespaces = What a process can SEE. Cgroups = What a process can USE.", "hint_level_2": "Namespaces isolate; Cgroups enforce CPU/RAM limits.", "hint_level_3": "Namespaces (PID, NET, MNT isolate resources) + Cgroups (limit RAM/CPU quotas) = Container."
            }
        ]
    },
    {
        "stage_number": 14, "title": "Kubernetes Orchestration", "category": "Kubernetes", "level_name": "Level 3: DevOps",
        "description": "Pods, Deployments, StatefulSets, Ingress Controllers, HPA, and CrashLoopBackOff.",
        "questions": [
            {
                "question_text": "Explain step-by-step how you would troubleshoot a Kubernetes pod that is continuously stuck in a CrashLoopBackOff state in production.",
                "question_type": "TROUBLESHOOTING", "difficulty": "HARD", "skill_category": "Kubernetes Debugging",
                "expected_topics": ["kubectl describe pod", "kubectl logs --previous", "OOMKilled (Exit Code 137)", "liveness probe failure", "missing configmap/secret"],
                "reference_answer": "1) `kubectl describe pod` for Events and LastState exit code. 2) If Exit Code 137 -> OOMKilled (increase memory limit). 3) If Exit Code 1/2 -> App crash, check `kubectl logs <pod> --previous`. 4) Verify ConfigMaps/Secrets mounts and Liveness probe settings.",
                "hint_level_1": "Check exit code in describe pod output.", "hint_level_2": "Use `kubectl logs --previous` for app crash traces.", "hint_level_3": "describe pod (Events/Exit code) -> logs --previous -> verify memory limits / ConfigMaps."
            },
            {
                "question_text": "What is the difference between a Kubernetes Deployment and a StatefulSet? How does StatefulSet maintain persistent network identities and volume ordinal bindings?",
                "question_type": "CONCEPTUAL", "difficulty": "HARD", "skill_category": "Kubernetes Architecture",
                "expected_topics": ["stateless vs stateful", "ordinal pod naming (pod-0, pod-1)", "headless service", "volumeClaimTemplates", "ordered deployment/termination"],
                "reference_answer": "Deployments manage stateless pods with random hashes and shared storage. StatefulSets manage stateful workloads (databases) providing deterministic ordinal names (pod-0, pod-1), dedicated PersistentVolumeClaims per pod, and ordered deployment/scaling.",
                "hint_level_1": "Compare random pod hash names vs deterministic ordinal indices (web-0, web-1).", "hint_level_2": "StatefulSets use Headless Service and `volumeClaimTemplates`.", "hint_level_3": "Deployment: Stateless, interchangeable pods. StatefulSet: Ordinal identity (pod-0) + Dedicated PVC per replica."
            }
        ]
    },
    {
        "stage_number": 15, "title": "Ansible + Terraform IaC", "category": "IaC Automation", "level_name": "Level 3: DevOps",
        "description": "Remote state locking, Terraform modules, drift detection, and Ansible playbooks.",
        "questions": [
            {
                "question_text": "How do you configure Terraform Remote State with S3 and DynamoDB state locking to prevent concurrent state corruption in multi-engineer teams?",
                "question_type": "PRACTICAL", "difficulty": "HARD", "skill_category": "Terraform State Management",
                "expected_topics": ["backend s3", "dynamodb_table lock", "state encryption at rest", "terragrunt", "terraform state mv"],
                "reference_answer": "Configure `backend \"s3\"` with `bucket`, `key`, `encrypt = true`, and `dynamodb_table = \"terraform-locks\"`. When running `terraform apply`, Terraform writes a LockID to DynamoDB, blocking concurrent executions until state release.",
                "hint_level_1": "S3 stores `.tfstate`; DynamoDB handles lock acquisition.", "hint_level_2": "DynamoDB uses LockID primary key to prevent race conditions.", "hint_level_3": "Configure backend s3 -> DynamoDB LockID table acquires lock on plan/apply -> prevents state corruption."
            },
            {
                "question_text": "Explain Ansible Idempotency and how you design Playbooks to ensure running them multiple times produces identical target system states without unintended side effects.",
                "question_type": "CONCEPTUAL", "difficulty": "HARD", "skill_category": "Ansible Automation",
                "expected_topics": ["idempotency principle", "state: present/absent", "changed vs ok status", "handlers notification", "avoiding raw shell commands"],
                "reference_answer": "Idempotency ensures running a playbook repeatedly yields the same state. Use declarative Ansible modules (`apt: state=present`, `copy`, `service: state=started`) instead of raw shell commands, so tasks skip execution when state is already satisfied.",
                "hint_level_1": "Declarative modules check current state before modifying.", "hint_level_2": "Avoid `command:` or `shell:` modules when declarative modules exist.", "hint_level_3": "Ansible module inspects system state -> executes only if delta exists -> returns `ok` when state matches."
            }
        ]
    },

    # LEVEL 4 — ADVANCED DEVOPS (16 - 20)
    {
        "stage_number": 16, "title": "End-to-End CI/CD Project", "category": "GitOps & CI/CD", "level_name": "Level 4: Advanced DevOps",
        "description": "Production GitHub Actions pipeline to EKS with ArgoCD GitOps sync.",
        "questions": [
            {
                "question_text": "Design a zero-downtime GitOps continuous delivery pipeline using GitHub Actions, Helm, and ArgoCD to deploy microservices to Amazon EKS.",
                "question_type": "PRACTICAL", "difficulty": "BOSS", "skill_category": "GitOps Architecture",
                "expected_topics": ["github actions build & scan", "helm chart repository", "gitops repository update", "argocd automated sync", "health check rollback"],
                "reference_answer": "1) GitHub Actions compiles code, runs Trivy scan, builds OCI image, and pushes to ECR. 2) CI updates image tag in GitOps Helm repo. 3) ArgoCD detects Git commit and executes sync to EKS cluster with rolling update and automatic health check rollback.",
                "hint_level_1": "Separate Application CI from GitOps Deployment CD repos.", "hint_level_2": "Use ArgoCD to watch GitOps repo and sync to EKS.", "hint_level_3": "CI: App Build/Scan -> Update GitOps repo. CD: ArgoCD syncs GitOps Helm manifest -> EKS deployment."
            },
            {
                "question_text": "How do you manage multi-environment promotion (Dev -> Staging -> Prod) in GitOps without duplicating Helm values files?",
                "question_type": "CONCEPTUAL", "difficulty": "BOSS", "skill_category": "Release Engineering",
                "expected_topics": ["kustomize overlays", "helm value overrides", "environment branches vs folders", "pr promotion gates", "sealed secrets"],
                "reference_answer": "Use Kustomize overlays or Helm umbrella charts with environment-specific values files (`values-dev.yaml`, `values-prod.yaml`). Promote builds by submitting automated PRs containing updated image tags from Staging to Prod environment folders.",
                "hint_level_1": "Use Kustomize base & overlays or environment values files.", "hint_level_2": "Promote via Git Pull Requests across environment directories.", "hint_level_3": "Base manifests -> Environment Overlays (Dev/Staging/Prod) -> PR merge triggers environment sync."
            }
        ]
    },
    {
        "stage_number": 17, "title": "Production Troubleshooting", "category": "Production Triage", "level_name": "Level 4: Advanced DevOps",
        "description": "Live memory leak triage, high CPU load debugging, and 502 bad gateway fix.",
        "questions": [
            {
                "question_text": "Users report receiving HTTP 502 Bad Gateway and 504 Gateway Timeout errors when visiting a web application behind an Nginx Ingress Controller on Kubernetes. How do you isolate the root cause?",
                "question_type": "TROUBLESHOOTING", "difficulty": "BOSS", "skill_category": "Production Incident Response",
                "expected_topics": ["ingress controller logs", "service endpoints (kubectl get ep)", "upstream connection refused (502)", "upstream timeout (504)", "backend pod metrics"],
                "reference_answer": "1) Distinguish 502 (Connection Refused / backend pod crash) vs 504 (Upstream Timeout / slow app/DB). 2) Check ingress logs (`kubectl logs -n ingress-nginx`). 3) Check endpoints (`kubectl get ep`). 4) Inspect pod CPU/RAM and database connection pool.",
                "hint_level_1": "Differentiate 502 (Backend refused socket) vs 504 (Backend timed out).", "hint_level_2": "Check Nginx access logs and `kubectl get ep` endpoints.", "hint_level_3": "502 = App container crashed/port mismatch. 504 = App slow / DB lock. Check ingress logs & pod metrics."
            },
            {
                "question_text": "A Node.js/Python microservice in Kubernetes experiences a slow memory leak, eventually triggering OOMKilled (Exit Code 137) every 6 hours. Walk through your profiling methodology.",
                "question_type": "TROUBLESHOOTING", "difficulty": "BOSS", "skill_category": "Memory Profiling",
                "expected_topics": ["heap dump analysis", "node --inspect / py-spy", "prometheus container_memory_working_set_bytes", "gc logs", "memory leak fix"],
                "reference_answer": "1) Monitor memory growth via Prometheus `container_memory_working_set_bytes`. 2) Attach profiler (`node --inspect` heap snapshot or `py-spy` for Python) in staging. 3) Compare heap diffs before and after load tests to isolate uncollected object references.",
                "hint_level_1": "Track Prometheus working set memory slope over time.", "hint_level_2": "Capture heap snapshots before and after load testing.", "hint_level_3": "Prometheus metrics -> Take Heap Snapshots under load -> Compare retainers in Chrome DevTools / py-spy -> Fix reference leaks."
            }
        ]
    },
    {
        "stage_number": 18, "title": "DevSecOps & Hardening", "category": "Security Engineering", "level_name": "Level 4: Advanced DevOps",
        "description": "Container image scanning (Trivy), SAST/DAST, and HashiCorp Vault integration.",
        "questions": [
            {
                "question_text": "How do you integrate HashiCorp Vault with Amazon EKS using Vault Agent Injector sidecars so applications access dynamic database credentials without static secrets?",
                "question_type": "PRACTICAL", "difficulty": "BOSS", "skill_category": "DevSecOps & Secrets",
                "expected_topics": ["vault agent injector", "kubernetes service account auth", "dynamic database secrets engine", "sidecar container", "in-memory secret injection"],
                "reference_answer": "1) Annotate Pod with Vault Agent annotations (`vault.hashicorp.com/agent-inject`). 2) Vault Agent authenticates via Kubernetes ServiceAccount token. 3) Vault Database Secrets Engine generates short-lived DB credentials and injects them to `/vault/secrets/db-cred` in tmpfs.",
                "hint_level_1": "Use Pod annotations to trigger Vault sidecar injection.", "hint_level_2": "Vault Agent authenticates via K8s SA JWT token.", "hint_level_3": "Pod annotations -> Vault sidecar authenticates SA -> Vault issues dynamic DB credentials to tmpfs memory volume."
            },
            {
                "question_text": "What is Software Supply Chain Security and how do tools like Cosign and In-Toto enforce digital signature verification before deploying container images to production Kubernetes clusters?",
                "question_type": "CONCEPTUAL", "difficulty": "BOSS", "skill_category": "Supply Chain Security",
                "expected_topics": ["container image signing (cosign)", "in-toto provenance", "kyverno / opa gatekeeper admission controller", "sigstore", "software bill of materials (sbom)"],
                "reference_answer": "1) CI pipeline signs container image digest using Cosign keyless signatures & generates SBOM. 2) Kubernetes Admission Controller (Kyverno/OPA) verifies cryptographic signatures before allowing Pod scheduling, blocking unsigned images.",
                "hint_level_1": "Sign image digests in CI and verify signatures at Admission Control.", "hint_level_2": "Use Cosign with Kyverno admission policies.", "hint_level_3": "CI builds & signs digest via Cosign -> Kyverno admission controller blocks unsigned digests from running on cluster."
            }
        ]
    },
    {
        "stage_number": 19, "title": "Real-Time DevOps Architecture", "category": "Cloud Architecture", "level_name": "Level 4: Advanced DevOps",
        "description": "High-throughput microservices architecture with zero-downtime rolling updates.",
        "questions": [
            {
                "question_text": "Design a high-throughput, low-latency microservices architecture capable of processing 100,000 requests per second with 99.99% uptime.",
                "question_type": "SCENARIO", "difficulty": "BOSS", "skill_category": "High Scale Systems",
                "expected_topics": ["network load balancer (nlb)", "event-driven kafka", "redis cluster caching", "eks auto-scaling (karpenter)", "database sharding"],
                "reference_answer": "1) AWS NLB distributing traffic to EKS ingress nodes. 2) Karpenter autoscaling node capacity. 3) Redis Cluster for caching hot data (sub-5ms). 4) Event-driven Apache Kafka for async decoupling. 5) Aurora PostgreSQL with read replicas and connection pooling (PgBouncer).",
                "hint_level_1": "Decouple synchronous API calls with Kafka event streaming.", "hint_level_2": "Combine NLB + Redis caching + Karpenter EKS autoscaling.", "hint_level_3": "NLB -> EKS Ingress -> Redis Cache layer -> Kafka async queue -> Sharded DB Aurora cluster."
            },
            {
                "question_text": "How do you implement Distributed Tracing across microservices using OpenTelemetry, Jaeger, and W3C Trace Context headers?",
                "question_type": "PRACTICAL", "difficulty": "BOSS", "skill_category": "Observability",
                "expected_topics": ["opentelemetry collector", "traceparent header propagation", "span context", "jaeger / grafana tempo", "sampling rate configuration"],
                "reference_answer": "1) Instrument microservices with OpenTelemetry SDKs. 2) Inject HTTP `traceparent` headers across microservice RPC calls. 3) Push trace spans to OpenTelemetry Collector, exporting to Grafana Tempo/Jaeger to visualize call graphs.",
                "hint_level_1": "Propagate traceparent headers across HTTP RPC calls.", "hint_level_2": "Export spans to OpenTelemetry Collector and Tempo/Jaeger.", "hint_level_3": "OTel SDK instruments app -> `traceparent` header passed across services -> OTel Collector aggregates spans -> Tempo visualizes latency."
            }
        ]
    },
    {
        "stage_number": 20, "title": "Final DevOps Mock Interview", "category": "Executive Panel", "level_name": "Level 4: Advanced DevOps",
        "description": "Full-spectrum senior panel simulation covering all 4 level pillars.",
        "questions": [
            {
                "question_text": "You are appointed Lead Principal CloudOps Engineer for an enterprise migrating legacy monolithic applications to AWS EKS. Present your 90-day migration strategy.",
                "question_type": "SCENARIO", "difficulty": "BOSS", "skill_category": "Executive Architecture",
                "expected_topics": ["discovery & dependency mapping", "strangler fig pattern", "iac baseline (terraform)", "security compliance & ci/cd", "pilot migration & cutover"],
                "reference_answer": "Days 1-30: Architecture discovery, dependency mapping & Terraform baseline. Days 31-60: CI/CD automation, EKS cluster creation, security guardrails & Strangler Fig pattern for microservices. Days 61-90: Pilot migration, performance tuning, fallback runbooks & final cutover.",
                "hint_level_1": "Structure into 30-60-90 day milestone phases.", "hint_level_2": "Use Strangler Fig pattern to decouple monolith into microservices.", "hint_level_3": "Phase 1: Discovery & IaC baseline -> Phase 2: CI/CD & Security guardrails -> Phase 3: Strangler Fig migration & Cutover."
            },
            {
                "question_text": "How do you establish SLA, SLO, and SLI objectives across an enterprise microservices ecosystem, and how do Error Budgets dictate deployment velocity?",
                "question_type": "CONCEPTUAL", "difficulty": "BOSS", "skill_category": "SRE Philosophy",
                "expected_topics": ["sli (metrics)", "slo (target)", "sla (contract)", "error budget depletion", "deployment freeze"],
                "reference_answer": "SLI is the quantitative measure (e.g. 99.9% successful HTTP requests). SLO is the internal target (99.9% uptime over 30 days). SLA is the business contract. Error Budget (100% - SLO = 0.1%) represents acceptable downtime; if depleted, feature releases freeze to focus on reliability.",
                "hint_level_1": "SLI = Metric, SLO = Internal Target, SLA = Business Contract.", "hint_level_2": "Depleting Error Budget halts new feature deployments.", "hint_level_3": "SLI (measured latency) -> SLO (target SLA) -> Error Budget (burn rate) -> Freezes deployments when budget is spent."
            }
        ]
    },

    # 10 BONUS AI & ADVANCED CHALLENGES (21 - 30)
    {
        "stage_number": 21, "title": "Bonus 01: AIOps Challenge", "category": "AI Infrastructure", "level_name": "Bonus Challenge",
        "description": "AI anomaly detection in Prometheus metrics and automated log clustering.",
        "questions": [
            {
                "question_text": "How do AIOps engines analyze high-cardinality Prometheus metrics to detect infrastructure anomalies before hard threshold alerts trigger?",
                "question_type": "CONCEPTUAL", "difficulty": "EXTREME", "skill_category": "AIOps",
                "expected_topics": ["time-series anomaly detection", "machine learning baselining", "prometheus metric streams", "noise suppression", "predictive alerting"],
                "reference_answer": "AIOps tools ingest real-time Prometheus metric streams, establishing dynamic seasonal baselines via unsupervised ML models. By evaluating metric variance rate of change, AIOps detects subtle degradation prior to hard threshold breaches.",
                "hint_level_1": "Dynamic ML baselining vs static alert thresholds.", "hint_level_2": "Analyze variance rate of change across metric correlations.", "hint_level_3": "Ingest telemetry stream -> Train ML seasonal baseline -> Detect deviation velocity -> Alert before threshold breach."
            }
        ]
    },
    {
        "stage_number": 22, "title": "Bonus 02: MLOps Challenge", "category": "AI Infrastructure", "level_name": "Bonus Challenge",
        "description": "ML model serving infrastructure, Kubeflow pipelines, and feature stores.",
        "questions": [
            {
                "question_text": "Design a scalable ML Model Serving infrastructure on Kubernetes using Triton Inference Server, GPU node pools, and auto-scaling based on GPU queue latency.",
                "question_type": "PRACTICAL", "difficulty": "EXTREME", "skill_category": "MLOps",
                "expected_topics": ["triton inference server", "nvidia k8s device plugin", "dcgm metrics", "keda autoscaling", "gpu shared memory"],
                "reference_answer": "Deploy Triton Inference Server on EKS GPU node pools using NVIDIA GPU operator. Use KEDA (Kubernetes Event-driven Autoscaling) configured with Prometheus NVIDIA DCGM GPU utilization and inference queue duration metrics to scale pods dynamically.",
                "hint_level_1": "Autoscale GPU pods using KEDA and DCGM metrics.", "hint_level_2": "Deploy Triton server with shared memory IPC.", "hint_level_3": "Triton Server on EKS GPU nodes -> DCGM metrics collected by Prometheus -> KEDA scales pods based on queue latency."
            }
        ]
    },
    {
        "stage_number": 23, "title": "Bonus 03: AI Integration Challenge", "category": "AI Infrastructure", "level_name": "Bonus Challenge",
        "description": "LLM API gateway rate limiting, streaming responses, and vector DB ops.",
        "questions": [
            {
                "question_text": "How do you architect an AI API Gateway to enforce token bucket rate limiting, fallback routing between OpenAI and Claude, and semantic cache with Redis Vector Search?",
                "question_type": "PRACTICAL", "difficulty": "EXTREME", "skill_category": "AI Gateway Architecture",
                "expected_topics": ["token rate limiting", "semantic caching (redis vector)", "multi-provider fallback", "streaming response proxy", "cost tracking per tenant"],
                "reference_answer": "1) Envoy / Kong API gateway with custom Lua or WebAssembly plugin for token bucket rate limiting. 2) Redis Vector Search to cache semantically similar prompts (sub-10ms response). 3) Multi-provider router automatically falling back to Anthropic/OpenAI on HTTP 429/5xx errors.",
                "hint_level_1": "Use Redis Vector Search for prompt semantic caching.", "hint_level_2": "Implement fallback routing when primary LLM returns 429.", "hint_level_3": "Gateway token rate limiter -> Redis semantic cache lookup -> Primary LLM invocation -> Fallback provider on error."
            }
        ]
    },
    {
        "stage_number": 24, "title": "Bonus 04: AI + DevOps Automation", "category": "AI Automation", "level_name": "Bonus Challenge",
        "description": "AI-driven self-healing infrastructure scripts and automated PR remediation.",
        "questions": [
            {
                "question_text": "Explain how an autonomous AI agent can monitor Kubernetes event streams, analyze crash logs with LLMs, and safely generate a Pull Request to fix the deployment configuration.",
                "question_type": "SCENARIO", "difficulty": "EXTREME", "skill_category": "AI DevOps Automation",
                "expected_topics": ["k8s watcher daemon", "llm log analysis", "github api pr creation", "human-in-the-loop approval", "sandboxed evaluation"],
                "reference_answer": "1) Watcher service listens to K8s OOMKilled/CrashLoop events. 2) Log snippet & deployment spec sent to LLM for root cause diagnosis. 3) LLM generates recommended patch. 4) Agent opens GitHub PR with fix, requiring Human-in-the-Loop review before merge.",
                "hint_level_1": "Must enforce Human-in-the-Loop approval for AI PRs.", "hint_level_2": "Watch K8s event stream -> Diagnose via LLM -> Generate Git PR.", "hint_level_3": "Event watcher catches crash -> LLM analyzes logs -> Agent opens PR with fix -> Human approves pipeline merge."
            }
        ]
    },
    {
        "stage_number": 25, "title": "Bonus 05: AI MCP Challenge", "category": "AI Integration", "level_name": "Bonus Challenge",
        "description": "Model Context Protocol tools integration for infrastructure management.",
        "questions": [
            {
                "question_text": "What is the Model Context Protocol (MCP) and how do MCP Tool declarations allow LLMs to safely query cloud infrastructure state and trigger DevOps actions?",
                "question_type": "CONCEPTUAL", "difficulty": "EXTREME", "skill_category": "Model Context Protocol",
                "expected_topics": ["mcp protocol specification", "tool definition schema", "json-rpc over stdio/sse", "read-only vs mutating actions", "permission boundaries"],
                "reference_answer": "MCP provides a standardized protocol (JSON-RPC) enabling AI models to inspect external resources and execute tools. Tool declarations expose structured JSON schemas defining parameters, requiring strict permission sandboxing before executing cloud mutations.",
                "hint_level_1": "MCP standardizes tool calls between AI agents and external tools.", "hint_level_2": "Uses JSON-RPC over stdio or SSE with strict schema validation.", "hint_level_3": "AI Agent -> MCP JSON-RPC call -> Executed sandboxed tool -> Structured JSON response returned to model."
            }
        ]
    },
    {
        "stage_number": 26, "title": "Bonus 06: Azure DevOps Project", "category": "Azure & CI/CD", "level_name": "Bonus Challenge",
        "description": "Azure Pipelines YAML, Artifacts, and Azure Kubernetes Service (AKS).",
        "questions": [
            {
                "question_text": "Walk through constructing an Azure Pipelines YAML multi-stage pipeline with environment approvals, Azure Key Vault secrets task, and deployment to Azure Kubernetes Service.",
                "question_type": "PRACTICAL", "difficulty": "EXTREME", "skill_category": "Azure Pipelines",
                "expected_topics": ["azure-pipelines.yml", "pipeline environments", "azure key vault task", "kubelogin / aks service connection", "approval checks"],
                "reference_answer": "1) Define stages: Build -> Staging -> Production in `azure-pipelines.yml`. 2) Fetch secrets via `AzureKeyVault@2` task using Azure Service Principal. 3) Enforce Manual Approval checks on Production environment in Azure DevOps portal.",
                "hint_level_1": "Use multi-stage YAML pipelines with Environment Approvals.", "hint_level_2": "Fetch secrets with AzureKeyVault task and deploy via AksCompute.", "hint_level_3": "YAML Stages -> KeyVault Task -> Staging Auto Deploy -> Prod Manual Approval Gate -> AKS Deploy."
            }
        ]
    },
    {
        "stage_number": 27, "title": "Bonus 07: Project-Based CI/CD", "category": "Advanced CI/CD", "level_name": "Bonus Challenge",
        "description": "Canary deployments, blue-green traffic shifting using Flagger and Istio.",
        "questions": [
            {
                "question_text": "How do Flagger and Istio Service Mesh automate Progressive Traffic Shifting (Canary 5% -> 20% -> 50% -> 100%) based on real-time Prometheus HTTP success metrics?",
                "question_type": "PRACTICAL", "difficulty": "EXTREME", "skill_category": "Progressive Delivery",
                "expected_topics": ["flagger custom resource", "istio virtualservice", "prometheus canary analysis", "weight increment", "automatic rollback on 5xx"],
                "reference_answer": "Flagger controls Istio VirtualService weights, incrementing canary traffic (5% step). At each interval, Flagger queries Prometheus for HTTP 5xx error rate and p99 latency; if thresholds fail, Flagger resets traffic to primary instantly.",
                "hint_level_1": "Flagger modifies Istio VirtualService traffic weights.", "hint_level_2": "Prometheus metric check dictates next traffic step.", "hint_level_3": "Flagger CRD -> Shifts 5% weight -> Validates Prometheus 5xx metric -> Promotes to 100% or rolls back on error."
            }
        ]
    },
    {
        "stage_number": 28, "title": "Bonus 08: Advanced DevSecOps Project", "category": "Security Engineering", "level_name": "Bonus Challenge",
        "description": "OPA Gatekeeper policies, Kyverno admission controllers, and PCI-DSS compliance.",
        "questions": [
            {
                "question_text": "Write a Rego policy for OPA Gatekeeper that rejects any Kubernetes Pod deployment that does not specify CPU/Memory resource requests and limits.",
                "question_type": "PRACTICAL", "difficulty": "EXTREME", "skill_category": "Policy as Code",
                "expected_topics": ["opa gatekeeper", "rego language", "constraint template", "resource requests and limits", "admission webhook denial"],
                "reference_answer": "Create ConstraintTemplate defining Rego rule `violation[{\"msg\": msg}]` checking `input.review.object.spec.containers[_].resources.requests` and `limits`. Gatekeeper admission webhook rejects non-compliant Pod manifests at API server entry.",
                "hint_level_1": "Check `resources.requests` and `resources.limits` in Rego rule.", "hint_level_2": "Use OPA ConstraintTemplate and Constraint CRD.", "hint_level_3": "Rego policy checks container spec -> Triggers violation if limits missing -> Webhook blocks kubectl apply."
            }
        ]
    },
    {
        "stage_number": 29, "title": "Bonus 09: Multi-Cloud + AI Architecture", "category": "Advanced Architecture", "level_name": "Bonus Challenge",
        "description": "Global latency routing across AWS, GCP, and Azure with AI failover.",
        "questions": [
            {
                "question_text": "Architect a global Active-Active multi-cloud topology across AWS, GCP, and Azure using Cloudflare Magic WAN and an AI-driven global traffic router.",
                "question_type": "SCENARIO", "difficulty": "EXTREME", "skill_category": "Global Infrastructure",
                "expected_topics": ["cloudflare magic wan", "anycast routing", "cross-cloud active-active", "ai latency predictor", "zero downtime failover"],
                "reference_answer": "1) Cloudflare Anycast Magic WAN handles global ingress. 2) Real-time telemetry evaluates regional latency and cloud provider health. 3) AI Router dynamically adjusts BGP / DNS weights to route users to the lowest-latency healthy cloud region.",
                "hint_level_1": "Combine Cloudflare Anycast with dynamic latency health routing.", "hint_level_2": "Active-Active deployments across AWS, GCP, and Azure.", "hint_level_3": "Cloudflare Anycast Ingress -> AI Latency Evaluator -> Dynamic traffic weights -> Multi-cloud active failover."
            }
        ]
    },
    {
        "stage_number": 30, "title": "👑 40 LPA Final Boss Interview Battle", "category": "Legendary Boss Battle", "level_name": "Bonus Challenge",
        "description": "The ultimate 40 LPA Staff CloudOps Engineer Boss Battle! Prove your absolute mastery.",
        "questions": [
            {
                "question_text": "Final Boss Battle: You are interviewing for a ₹40 LPA Staff CloudOps Engineer role. Pitch your comprehensive enterprise architecture vision for 99.999% availability, zero-trust security, AI self-healing operations, and FinOps cost efficiency.",
                "question_type": "SCENARIO", "difficulty": "LEGENDARY", "skill_category": "Staff Engineer Mastery",
                "expected_topics": ["99.999% availability (five nines)", "zero-trust mesh (istio/vault)", "ai self-healing operations", "finops & cloud governance", "staff leadership vision"],
                "reference_answer": "A masterclass executive defense: 1) Multi-region active-active architecture (Five Nines). 2) Zero-Trust security with mTLS and dynamic Vault secrets. 3) Autonomous AIOps self-healing incident mitigation. 4) FinOps cost optimization saving millions. 5) Engineering culture & mentorship vision.",
                "hint_level_1": "Synthesize all 5 pillars: High Availability, Security, AIOps, FinOps, and Leadership.", "hint_level_2": "Quantify SLA/SLO metrics, security zero-trust controls, and FinOps ROI.", "hint_level_3": "Five Nines Active-Active Architecture + Zero-Trust mTLS + AIOps Remediation + FinOps ROI + Staff Technical Vision."
            },
            {
                "question_text": "How do you lead organization-wide post-mortem incidents after a catastrophic multi-region outage to foster a blameless culture while enforcing systemic architecture preventions?",
                "question_type": "CONCEPTUAL", "difficulty": "LEGENDARY", "skill_category": "Engineering Culture & Leadership",
                "expected_topics": ["blameless post-mortem", "5 whys root cause analysis", "actionable preventive tickets", "timeline reconstruction", "executive stakeholder communication"],
                "reference_answer": "1) Reconstruct precise chronological incident timeline from logs & traces. 2) Conduct a Blameless Post-Mortem utilizing '5 Whys' root cause analysis. 3) Focus on process and architectural safeguards rather than human error. 4) Assign tracking tickets with strict SLAs for systemic prevention.",
                "hint_level_1": "Focus on systemic prevention rather than assigning human blame.", "hint_level_2": "Use 5 Whys RCA and assign mandatory architectural remediation tickets.", "hint_level_3": "Timeline reconstruction -> Blameless 5 Whys session -> Systemic prevention tickets with strict SLA -> Executive summary."
            }
        ]
    }
]

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

        # 3. Candidate User (Sachin Rawat)
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
                xp=0,
                level=1,
                streak_days=1,
                readiness_score=0.0,
                target_salary_band="₹18–40 LPA",
                skills_matrix_json={"Linux": 0, "AWS": 0, "Docker": 0, "Kubernetes": 0, "Terraform": 0},
                badges_json=["Registered Engineer"]
            )
            db.add(sachin_profile)
            await db.flush()

        # Purge all non-admin @cloudops.internal dummy candidates
        dummy_res = await db.execute(select(User).where(User.email.like("%@cloudops.internal%")))
        dummy_users = dummy_res.scalars().all()
        for bad_u in dummy_users:
            if bad_u.email == "admin@cloudops.internal":
                continue
            c_res = await db.execute(select(Candidate).where(Candidate.user_id == bad_u.id))
            bad_c = c_res.scalar_one_or_none()
            if bad_c:
                await db.execute(text("DELETE FROM candidate_roadmaps WHERE candidate_id = :cid"), {"cid": bad_c.id})
                await db.execute(text("DELETE FROM candidate_certificates WHERE candidate_id = :cid"), {"cid": bad_c.id})
                await db.execute(text("DELETE FROM support_tickets WHERE candidate_id = :cid"), {"cid": bad_c.id})
                await db.execute(text("DELETE FROM interview_attempts WHERE candidate_id = :cid"), {"cid": bad_c.id})
                await db.execute(text("DELETE FROM candidates WHERE id = :cid"), {"cid": bad_c.id})
            await db.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": bad_u.id})
        await db.commit()

        # 4. Job Description for CloudOps
        jd_stmt = select(JobDescription).where(JobDescription.title == "Senior DevOps & CloudOps Engineer")
        res = await db.execute(jd_stmt)
        jd = res.scalar_one_or_none()
        if not jd:
            jd = JobDescription(
                organization_id=org.id,
                title="Senior DevOps & CloudOps Engineer",
                raw_description="We are seeking a Senior DevOps & CloudOps Engineer to architect, automate, and safeguard production infrastructure across AWS, Kubernetes, and Terraform.",
                skills_json=["Linux Administration", "AWS Architecture", "Kubernetes", "Docker", "Terraform", "CI/CD", "Prometheus & Grafana"],
                technologies_json=["AWS", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "Linux"],
                responsibilities_json=["Maintain 24/7 cloud infrastructure reliability", "Troubleshoot production incidents", "Automate deployment pipelines"],
                experience_level="MID",
                target_role="Senior DevOps Engineer",
                created_by=admin.id
            )
            db.add(jd)
            await db.flush()

        # 5. Master Interview Template containing ALL 31 Stages
        template_stmt = select(InterviewTemplate).where(InterviewTemplate.organization_id == org.id)
        res = await db.execute(template_stmt)
        template = res.scalars().first()
        if not template:
            template = InterviewTemplate(
                organization_id=org.id,
                job_description_id=jd.id,
                title="Multi-Cloud & DevOps Career Challenge (30 Stages)",
                description="Comprehensive 30-Stage gamified interview pipeline covering Linux, Multi-Cloud, DevOps, DevSecOps, AIOps, MLOps, and the 40 LPA Final Boss Battle.",
                target_role="Senior DevOps Engineer",
                passing_score=80.0,
                status="ACTIVE",
                created_by=admin.id
            )
            db.add(template)
            await db.flush()
        else:
            template.title = "Multi-Cloud & DevOps Career Challenge (30 Stages)"
            template.description = "Comprehensive 30-Stage gamified interview pipeline covering Linux, Multi-Cloud, DevOps, DevSecOps, AIOps, MLOps, and the 40 LPA Final Boss Battle."
            await db.flush()

        # Populate/Update ALL 31 Stages and Questions
        for s_info in STAGES_DATA:
            s_num = s_info["stage_number"]
            stage_stmt = select(InterviewStage).where(
                InterviewStage.interview_template_id == template.id,
                InterviewStage.stage_number == s_num
            )
            s_res = await db.execute(stage_stmt)
            stage = s_res.scalar_one_or_none()

            if not stage:
                stage = InterviewStage(
                    interview_template_id=template.id,
                    stage_number=s_num,
                    title=f"Stage {s_num}: {s_info['title']}",
                    category=s_info["category"],
                    description=s_info["description"],
                    minimum_score=80.0,
                    unlock_rule="PASS_PREVIOUS_STAGE"
                )
                db.add(stage)
                await db.flush()

            # Insert Questions for this stage if not already existing
            for q_idx, q_info in enumerate(s_info["questions"], 1):
                q_stmt = select(Question).where(
                    Question.interview_stage_id == stage.id,
                    Question.order_index == q_idx
                )
                q_res = await db.execute(q_stmt)
                q_obj = q_res.scalar_one_or_none()

                if not q_obj:
                    q_obj = Question(
                        interview_stage_id=stage.id,
                        order_index=q_idx,
                        question_text=q_info["question_text"],
                        question_type=q_info.get("question_type", "CONCEPTUAL"),
                        difficulty=q_info.get("difficulty", "INTERMEDIATE"),
                        skill_category=q_info.get("skill_category", s_info["category"]),
                        expected_topics=q_info["expected_topics"],
                        reference_answer=q_info["reference_answer"],
                        hint_level_1=q_info.get("hint_level_1"),
                        hint_level_2=q_info.get("hint_level_2"),
                        hint_level_3=q_info.get("hint_level_3"),
                        evaluation_rubric={"technical_accuracy": 40, "concept_coverage": 25, "reasoning_quality": 20, "practical_knowledge": 10, "communication_clarity": 5},
                        is_active="ACTIVE"
                    )
                    db.add(q_obj)

            await db.flush()

        # Seed Payment Gateway Config
        cfg_res = await db.execute(select(PaymentGatewayConfig))
        if not cfg_res.scalars().first():
            db.add(PaymentGatewayConfig(
                provider_name="razorpay",
                is_enabled=True,
                is_test_mode=True,
                publishable_key="rzp_test_sampleKey123",
                encrypted_secret_key="secret_encrypted_rzp_key",
                currency="INR"
            ))

        # Seed initial real candidate payment transactions in DB if empty
        tx_res = await db.execute(select(PaymentTransaction))
        if not tx_res.scalars().first():
            seed_txs = [
                PaymentTransaction(
                    candidate_id="cand-001",
                    candidate_name="Sachin Rawat",
                    candidate_email="sachin.rawat@cloudops.ai",
                    candidate_phone="+91 98765 43210",
                    provider="razorpay",
                    transaction_id="pay_Pq98127391",
                    order_id="order_Nz837192",
                    amount="₹1,499",
                    currency="INR",
                    status="success",
                    payment_method="UPI / GPay",
                    coupon_code="CLOUDOPS50"
                ),
                PaymentTransaction(
                    candidate_id="cand-002",
                    candidate_name="Vikas Sharma",
                    candidate_email="vikas.sharma@cloudops.ai",
                    candidate_phone="+91 98112 34567",
                    provider="razorpay",
                    transaction_id="pay_Rk39102934",
                    order_id="order_Kj928371",
                    amount="₹2,999",
                    currency="INR",
                    status="success",
                    payment_method="Credit Card",
                    coupon_code="EARLYBIRD"
                ),
                PaymentTransaction(
                    candidate_id="cand-003",
                    candidate_name="Ananya Roy",
                    candidate_email="ananya.roy@devops.org",
                    candidate_phone="+91 97123 45678",
                    provider="razorpay",
                    transaction_id="pay_Mm78192834",
                    order_id="order_Lk293847",
                    amount="₹1,499",
                    currency="INR",
                    status="success",
                    payment_method="Net Banking",
                    coupon_code="-"
                )
            ]
            db.add_all(seed_txs)

        await db.commit()
        print("Database successfully seeded with ALL 31 STAGES, Payment Gateway & Payment Transactions!")

if __name__ == "__main__":
    asyncio.run(seed_database())

