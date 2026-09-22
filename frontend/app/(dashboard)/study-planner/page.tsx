"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, Plus, Sparkles, CheckCircle2, 
  Flame, ArrowRight, Check, AlertCircle,
  Trash2, X, RefreshCw, Target, Loader2,
  ChevronDown, ChevronUp, Layers, Search, Code, Cpu, Terminal, ExternalLink
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export const FULL_DEVOPS_ROADMAP = [
  // MODULE 1
  {
    module: 1,
    moduleTitle: "MODULE 1: Cloud & DevOps + AI Foundation",
    moduleBadge: "Multi-Cloud + DevOps + AI",
    color: "from-amber-500 to-orange-500",
    days: [
      {
        day: "Day 1",
        dayNum: 1,
        agenda: "DevOps Introduction & Course Overview",
        brief: "Course Intro: Objectives & outcomes | Community: Meet & connect | Learning Path | RoadMap: Key milestones | DevOps & AWS Intro: Basics & integration | Job Openings: Naukri DevOps opportunities",
        practical: "DevOps Tools Demo: Key tools overview & Visual Studio Setup + Copilot setup",
        reel: "Day 1 Reel",
        tools: ["DevOps", "AWS", "Copilot"],
        techPillar: "Multi Cloud + DevOps with AI fundamentals"
      },
      {
        day: "Day 2",
        dayNum: 2,
        agenda: "Cloud Computing & Virtualization",
        brief: "Before Cloud: Servers & Data Centers | Virtualization & Cloud Computing | Cloud Models: IaaS, PaaS, SaaS | Cloud Concepts & Architecture | Cloud Services & Deployment Models | Physical Infrastructure: Compute, Storage, Database & Networking",
        practical: "DevOps Tools Demo: Big Picture Demo | Run Windows 11 via Docker",
        reel: "Day 2 Reel",
        tools: ["Cloud Computing", "Virtualization", "IaaS", "PaaS", "SaaS", "Docker"],
        techPillar: "Multi Cloud + DevOps with AI fundamentals"
      },
      {
        day: "Day 3",
        dayNum: 3,
        agenda: "DevOps Principles & Practices",
        brief: "DevOps Introduction: What is DevOps? | Why DevOps? | Challenges before DevOps | The Role of a Good DevOps Engineer | DevOps Key Areas: Roles & Responsibilities | Problems & Solutions: Developer & IT Operation Problems",
        practical: "6 C's of DevOps: Culture, Code, CI/CD/CDD/CT/CM/CBB",
        reel: "Day 3 Reel",
        tools: ["DevOps Principles", "CI/CD", "Automation"],
        techPillar: "Multi Cloud + DevOps with AI fundamentals"
      },
      {
        day: "Day 4",
        dayNum: 4,
        agenda: "Foundation of AI + Prompt engineering + Co-Programmer Setup",
        brief: "AI + History of AI, AI vs Deep Learning vs Machine learning vs Gen AI How AI works? | Gen AI vs Agentic AI vs AI Agent AI for DevOps & AI for Cloud Engineer & DevOps Engineer",
        practical: "AI Setup for 10X productivity + RealTime AI Use Cases",
        reel: "Day 4 Reel",
        tools: ["AI", "Prompt Engineering", "Copilot"],
        techPillar: "AI Automation"
      }
    ]
  },
  // MODULE 2
  {
    module: 2,
    moduleTitle: "MODULE 2: LINUX ADMINISTRATION FOR DEVOPS + GCP",
    moduleBadge: "GCP + Linux Jobs: ₹5 to ₹10 LPA",
    color: "from-blue-500 to-cyan-500",
    days: [
      {
        day: "Day 5",
        dayNum: 5,
        agenda: "Linux Overview & GCP Setup",
        brief: "Linux History & Importance | Popularity of Linux | Linux Architecture & Shell | Open Source Tools | GitHub | Filesystem Hierarchy | Basics: 10+ Linux Commands",
        practical: "GCP Account Creation & Setup | Explore GCP Features",
        tools: ["Linux", "GCP", "Shell", "GitHub", "CLI"],
        techPillar: "Google Cloud + AI usecases Non Tech to Tech"
      },
      {
        day: "Day 6",
        dayNum: 6,
        agenda: "Linux VM & User Administration",
        brief: "Users Administration: Normal User & Root User | Creating a Linux VM: VirtualBox, VMware, GCP, AWS | Install MobaXterm on Windows | Top 40+ Linux Commands | VI Editor Tips & Tricks",
        practical: "Create Linux VM on GCP | Explore GCP Instance",
        tools: ["Linux", "VM", "VirtualBox", "MobaXterm", "VI Editor"],
        techPillar: "Google Cloud + AI usecases Non Tech to Tech"
      },
      {
        day: "Day 7",
        dayNum: 7,
        agenda: "Linux System Administration",
        brief: "Change Passwords | Password Policies | Linux Day to Day Activities | Monitor System: top, htop, df, free | Manage Services: systemctl | File Management | System Monitoring | Networking",
        practical: "50+ Linux Commands Practice",
        tools: ["Linux Admin", "systemctl", "Monitoring", "Networking"],
        techPillar: "Google Cloud + AI usecases Non Tech to Tech"
      },
      {
        day: "Day 8",
        dayNum: 8,
        agenda: "Permissions & Software Management",
        brief: "File Permissions: View & Modify | Change Ownership | SSH Key Management: Generate Key Pair | Public & Private Keys | Software Management: YUM/APT | Package Management | Linux Boot Process | HTTP Response Status Codes",
        practical: "SSH Key Generation & Configuration",
        tools: ["Linux Permissions", "SSH", "YUM", "APT", "Package Management"],
        techPillar: "Google Cloud + AI usecases Non Tech to Tech"
      },
      {
        day: "Day 9",
        dayNum: 9,
        agenda: "Linux Real-World Scenarios",
        brief: "H/W & S/W Troubleshooting | Unlimited Q&A Session",
        practical: "Real-World Linux Troubleshooting",
        tools: ["Linux Troubleshooting", "Problem Solving"],
        techPillar: "Google Cloud + AI usecases Non Tech to Tech"
      }
    ]
  },
  // MODULE 3
  {
    module: 3,
    moduleTitle: "MODULE 3: AWS TOP 10 SERVICES + 10+ Practical's",
    moduleBadge: "Top 10 AWS Services + AI Usecases",
    color: "from-emerald-500 to-teal-500",
    days: [
      {
        day: "Day 10",
        dayNum: 10,
        agenda: "AWS Introduction & EC2 Basics",
        brief: "AWS History & Overview | AWS Features: Scalability, Reliability, Security, Cost-effectiveness | AWS Global Infrastructure | AWS Regions | AWS Account Creation | AWS Resources",
        practical: "Launching an EC2 Instance | EC2 Dashboard Walkthrough ✔ Practical 1: EC2 - Creating Windows Server 2025 Instance ✔ Practical 2: EC2 - Configuring Apache/Nginx on Linux with MobaXterm",
        tools: ["AWS", "EC2", "AWS Console", "Cloud Infrastructure"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 12",
        dayNum: 12,
        agenda: "AWS IAM",
        brief: "IAM: Create Users, Groups, Roles, Policies | Benefits of IAM: Improved Security | Reduce Unauthorized Access Risk with IAM user",
        practical: "AWS Account Alias Creation (Corporate Account)",
        tools: ["IAM", "Security", "Users", "Roles", "Policies"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 13",
        dayNum: 13,
        agenda: "EC2 Configuration & Storage",
        brief: "AMI Configuration | Block Storage - EBS Volumes/Snapshots | Snapshot: Point-in-time copy | Security Groups | IP Addressing: Public IP, Private IP, Elastic IP",
        practical: "Configure AMI, EBS Snapshots & Security Group Rules",
        tools: ["EC2", "EBS", "Snapshots", "Security Groups", "Networking"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 14",
        dayNum: 14,
        agenda: "Elastic Load Balancer",
        brief: "Elastic Load Balancer (ELB) | Creation | Distribute Traffic",
        practical: "✔ Practical 3: Create ELB and Configure 2 EC2 Instances for Load Distribution",
        tools: ["ELB", "Load Balancing", "High Availability"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 15",
        dayNum: 15,
        agenda: "Amazon S3 Storage",
        brief: "Amazon S3 Overview | Storage Classes | Real World Storage Mechanisms | S3 Terminology | Creating Buckets | Glacier & Glacier Deep Archive",
        practical: "✔ Practical 4: Configure AWS S3 Bucket - All Storage Classes & Lifecycle Rules • Real-time Banking & IT Logging Scenarios",
        tools: ["S3", "Storage Classes", "Glacier", "Lifecycle Rules"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 16",
        dayNum: 16,
        agenda: "S3 Static Website Hosting",
        brief: "S3 Static Website Hosting | Real Time Examples",
        practical: "✔ Practical 5: Create AWS S3 Static Website (Online Resume) • Optional: Add DNS from Route 53. Understand the Automation of Activity with Terraform",
        tools: ["S3", "Static Hosting", "Route 53", "DNS"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 17",
        dayNum: 17,
        agenda: "AWS Databases & RDS",
        brief: "Basics of Databases | SQL vs. NoSQL | Amazon RDS: PostgreSQL, MySQL, MSSQL | Automatic Backups & Point-in-time Recovery",
        practical: "✔ Practical 6: RDS (PostgreSQL) Database Creation ✔ Practical 7: EC2 SQL Proxy + RDS MySQL Connection via Endpoint 📝 Minor Project 1: Databases for Resume",
        tools: ["RDS", "PostgreSQL", "MySQL", "SQL", "Databases"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 18",
        dayNum: 18,
        agenda: "AWS VPC & Networking",
        brief: "VPC Overview | CIDR Block Calculations | Subnetting | Internet Gateway | Route Tables | AWS Security NACL",
        practical: "📝 Minor Project 2: Networking for Resume",
        tools: ["VPC", "CIDR", "Subnets", "NACL", "Networking"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 19",
        dayNum: 19,
        agenda: "VPC Practicals",
        brief: "VPC Creation | Subnets | Routes | Security Groups | EC2 in Private VPC | VPC Peering",
        practical: "✔ Practical 8: Create VPC/Subnets/Routes/Security Groups + EC2 in Private VPC ✔ Practical 9: Connect 2 Clouds with VPC",
        tools: ["VPC", "Subnets", "Security Groups", "VPC Peering"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 20",
        dayNum: 20,
        agenda: "AWS CloudWatch & Monitoring + Cost Optimization",
        brief: "CloudWatch Overview | SNS Topics | Subscriptions | Alarms | AWS Billing | AWS Support Center",
        practical: "✔ Practical 10: CloudWatch - EC2 CPU Alert + Budget Alarm ₹100",
        tools: ["CloudWatch", "SNS", "Monitoring", "Billing"],
        techPillar: "Top 10 AWS Services"
      },
      {
        day: "Day 21",
        dayNum: 21,
        agenda: "AWS Service Integrations (3+ Experience)",
        brief: "AWS Lambda Cost optimization SNS integration",
        practical: "✔ Practical 11: Integration of 5+ AWS Services",
        tools: ["AWS Lambda", "SNS", "Service Integration"],
        techPillar: "Top 10 AWS Services"
      }
    ]
  },
  // MODULE 4
  {
    module: 4,
    moduleTitle: "MODULE 4: CORE CI/CD - GIT, GITHUB & JENKINS",
    moduleBadge: "Dev Env Work as Developer + AI Prompts",
    color: "from-orange-500 to-amber-600",
    days: [
      {
        day: "Day 22",
        dayNum: 22,
        agenda: "Git & GitHub Learning",
        brief: "Version Control | GIT & GitHub | How Git Works | Source Code Management | Issue Tracking | Local Code Changes | Offline Work & Online Collaboration",
        practical: "✔ Practical 12: Clone Code from GitHub (Git Clone & Git Fork)",
        tools: ["Git", "GitHub", "Version Control", "SCM"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 23",
        dayNum: 23,
        agenda: "Git for Developers + Tricks",
        brief: "Git Installation | GitHub Account Creation | Real World Git Scenarios | Cloning | Branching | Pull Request",
        practical: "✔ Practical 13: Push Code from Local to GitHub (Developer Workflow)",
        tools: ["Git", "Branching", "Pull Requests", "Developer Workflow"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 24",
        dayNum: 24,
        agenda: "Jenkins Introduction & Setup",
        brief: "Continuous Integration | Building, Testing, Deploying | Software Installation: Ubuntu, Windows | Jenkins UI Configuration",
        practical: "✔ Practical 14: Java Code Execution via VS Code ✔ Practical 14: Job 1-4 - Pull Java from Git, Compile, Build, CI-example",
        tools: ["Jenkins", "CI", "Java", "Build Automation"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 25",
        dayNum: 25,
        agenda: "Jenkins Jobs & Maven",
        brief: "Freestyle Jobs | Parameterized Jobs | Jenkins + Maven + GitHub | Pipelines: Declarative/Scripted | Jenkinsfile | Post Actions",
        practical: "✔ Practical 15 Project 1: Java Spring Boot + Maven + CI Pipeline",
        tools: ["Jenkins", "Maven", "Pipelines", "Groovy", "Spring Boot"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 26",
        dayNum: 26,
        agenda: "Jenkins Pipelines",
        brief: "Pipeline Job Creation | Generate Groovy Code Top 10 Jenkins Plugins for Daily Operations Parallel Pipelines",
        practical: "✔ Practical 16: Run Groovy Code - Create Pipeline Job with Stages/Steps",
        tools: ["Jenkins Pipeline", "Groovy", "Stages"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 27",
        dayNum: 27,
        agenda: "GITLAB",
        brief: "GITLAB Setup & Implementations",
        practical: "GITLAB Configuration & CI/CD Pipelines",
        tools: ["GITLAB", "CI/CD", "Optimization"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 28",
        dayNum: 28,
        agenda: "Advanced Jenkins + GITLAB",
        brief: "Creating Jenkins + GITLAB Jobs with Java and Maven | Explore Various Jenkins + GITLAB Jobs | Manage Jenkins + GITLAB",
        practical: "Jenkins & GitLab Integration Jobs Practice",
        tools: ["Jenkins", "GITLAB", "Java", "Maven", "Job Management"],
        techPillar: "Dev Env Work as Developer"
      },
      {
        day: "Day 29",
        dayNum: 29,
        agenda: "Jenkins Master-Slave (3+ Exp)",
        brief: "Master-Slave Architecture | Configure Slave Agents",
        practical: "✔ Practical 17: Jenkins Master-Slave Configuration 📝 Assignment: Configure Slave Agents with Windows & Linux",
        tools: ["Jenkins Master-Slave", "Distributed Builds"],
        techPillar: "Dev Env Work as Developer"
      }
    ]
  },
  // MODULE 5
  {
    module: 5,
    moduleTitle: "MODULE 5: DOCKER & KUBERNETES + GKE + CM (3+ Experienced)",
    moduleBadge: "DevOps RealTime + GKE Google K8s",
    color: "from-indigo-500 to-purple-600",
    days: [
      {
        day: "Day 30",
        dayNum: 30,
        agenda: "Docker Introduction",
        brief: "VM vs Docker | Package & Run Applications in Containers | Docker Hub Account Creation | Docker Overview: Concepts, Commands, Benefits",
        practical: "Docker Hub Setup & Container Execution",
        tools: ["Docker", "Containers", "Virtualization"],
        techPillar: "DevOps Env Work"
      },
      {
        day: "Day 31",
        dayNum: 31,
        agenda: "Docker Installation & Basics + Lifecycle & Dockerfile",
        brief: "Docker Installation (Real-Time) | Docker Architecture | Download Images | Run Containers | Common Docker Commands Docker Lifecycle | Practical Applications | Troubleshooting: Logs, Processes, Network, Storage",
        practical: "✔ Practical 18: Pull & Run Images (Ubuntu, Nginx, CentOS) ✔ Practical 19: Custom Nginx Container with Volume ✔ Practical 20: Create Jenkins Application via Docker ✔ Practical 21: Create Dockerfile, Build Custom Nginx Image, Tag & Push to Docker Hub",
        tools: ["Docker", "Images", "Containers", "Volumes", "Nginx"],
        techPillar: "DevOps Env Work"
      },
      {
        day: "Day 32",
        dayNum: 32,
        agenda: "Docker AI GORDON",
        brief: "Docker AI GORDON installation + Implementation + Realworld USE cases",
        practical: "✔ Practical DOCKER AI GORDAN usecase",
        tools: ["Dockerfile", "Docker Build", "Docker Hub", "Troubleshooting"],
        techPillar: "DevOps Env Work"
      },
      {
        day: "Day 33",
        dayNum: 33,
        agenda: "Kubernetes Introduction",
        brief: "Kubernetes Intro & Features | Orchestrating Containers | Cluster Architecture | Kubectl Commands | Create & Manage Clusters",
        practical: "Kubernetes Cluster Basics Practice",
        tools: ["Kubernetes", "K8s", "Kubectl", "Container Orchestration"],
        techPillar: "DevOps Env Work"
      },
      {
        day: "Day 34",
        dayNum: 34,
        agenda: "Kubernetes Components & GKE",
        brief: "Pods | Deployments | Services | Netflix Case Study | Horizontal Pod Scaling",
        practical: "✔ Practical 22: Kubernetes on Local Machine (Docker) ✔ Practical 23: GKE Creation & Connect via gcloud ✔ Practical 24: POD + Service + ReplicaSet + Deployments on GKE",
        tools: ["Pods", "Deployments", "Services", "GKE", "gcloud"],
        techPillar: "DevOps Env Work"
      },
      {
        day: "Day 35",
        dayNum: 35,
        agenda: "GKE E-commerce Project",
        brief: "3-Node GKE Cluster | E-commerce Microservice Deployment",
        practical: "✔ Practical 24 (Project 2): Deploy Microservice on GKE (1-Click Deployment)",
        tools: ["GKE", "Microservices", "Kubernetes Deployment"],
        techPillar: "DevOps Env Work"
      },
      {
        day: "Day 36",
        dayNum: 36,
        agenda: "Prometheus & Grafana Introduction",
        brief: "Importance of Monitoring | Introduction to Prometheus & Grafana",
        practical: "✔ Practical 28: Create GKE 3-Node Cluster + Deploy Prometheus & Grafana via Helm",
        tools: ["Prometheus", "Grafana", "Helm", "GKE", "Monitoring"],
        techPillar: "OPS Continuous Monitoring"
      },
      {
        day: "Day 37",
        dayNum: 37,
        agenda: "Grafana Dashboards",
        brief: "Grafana Components & Flow | Configure Dashboards | Import & Share Dashboards",
        practical: "✔ Practical 29: Set up Grafana, Configure & Design Dashboards",
        tools: ["Grafana", "Dashboards", "Visualization"],
        techPillar: "OPS Continuous Monitoring"
      }
    ]
  },
  // MODULE 6
  {
    module: 6,
    moduleTitle: "MODULE 6: ANSIBLE & TERRAFORM + AUTOMATION (3+ Experienced) IAC",
    moduleBadge: "IAC Automation + Python & Shell",
    color: "from-rose-500 to-red-600",
    days: [
      {
        day: "Day 38",
        dayNum: 38,
        agenda: "Terraform Introduction",
        brief: "Terraform as IaC | Understand HCL | Why Terraform? | Providers: AWS, GCP, Azure | Init, Plan, Apply",
        practical: "Terraform Infra Setup for IAC",
        tools: ["Terraform", "IaC", "HCL", "AWS", "GCP", "Azure"],
        techPillar: "IAC Automation"
      },
      {
        day: "Day 39",
        dayNum: 39,
        agenda: "Terraform AWS Resources",
        brief: "Create Multiple AWS Resources | Why IaC Required? | EKS Cluster with Terraform",
        practical: "✔ Practical 25: Create AWS Resources with Terraform (IAM User, EC2, S3, etc.)",
        tools: ["Terraform", "AWS", "EC2", "S3", "IAM", "EKS"],
        techPillar: "IAC Automation"
      },
      {
        day: "Day 40",
        dayNum: 40,
        agenda: "Ansible Introduction",
        brief: "Terraform vs Ansible | Configuration Management Tools | Ansible: Playbooks, Roles, Modules, Inventories",
        practical: "Ansible Overview & Playbook Architecture",
        tools: ["Ansible", "Configuration Management", "Playbooks"],
        techPillar: "IAC Automation"
      },
      {
        day: "Day 41",
        dayNum: 41,
        agenda: "Ansible Architecture",
        brief: "Inventory | Playbooks | Master Ansible | Worker Nodes Setup via SSH",
        practical: "Ansible Setup for CM",
        tools: ["Ansible", "Inventory", "SSH", "Worker Nodes"],
        techPillar: "IAC Automation"
      },
      {
        day: "Day 42",
        dayNum: 42,
        agenda: "Ansible Playbooks & Roles",
        brief: "SSH Configuration | Ansible Roles | Infrastructure Setup",
        practical: "✔ Practical 26: Set up Ansible Master & Target Machines, Run Playbooks ✔ Practical 27: Create Ansible Roles via Galaxy",
        tools: ["Ansible Playbooks", "Roles", "Galaxy", "SSH"],
        techPillar: "IAC Automation"
      },
      {
        day: "Day 43",
        dayNum: 43,
        agenda: "Bash Scripting",
        brief: "Bash Introduction | Bash Scripting Basics | Automate Tasks | Multiple Shell Scripts | Multiple Execution Approaches",
        practical: "✔ Practical 31: 5 Basic Bash Scripts for Everyday Use",
        tools: ["Bash", "Shell Scripting", "Linux Automation"],
        techPillar: "Python + Shell Automation"
      },
      {
        day: "Day 44",
        dayNum: 44,
        agenda: "Python for DevOps",
        brief: "Python Introduction | Installation | Libraries/Modules | Main.py & Requirements File",
        practical: "✔ Practical 32: Python Mini-Projects ✔ Practical 33: AWS CLI + boto3 - S3 File Uploads ✔ Practical 34: AWS CLI + boto3 - IAM Operations",
        tools: ["Python", "boto3", "AWS CLI", "Automation"],
        techPillar: "Python + Shell Automation"
      }
    ]
  },
  // MODULE 7
  {
    module: 7,
    moduleTitle: "MODULE 7: Student's Most Demanded Session",
    moduleBadge: "ATS Resume & Advanced Choice Topics",
    color: "from-amber-600 to-yellow-500",
    days: [
      {
        day: "Day 45",
        dayNum: 45,
        agenda: "ATS Resume Preparation",
        brief: "Best Interview Tips & Tricks Resume Update and Daily review till end of the Batch",
        practical: "Daily Resume Review",
        tools: ["ATS", "Naukri Profile Update"],
        techPillar: "ATS Resume Preparation"
      },
      {
        day: "Day 46",
        dayNum: 46,
        agenda: "Students Choice Topics",
        brief: "Based on Group Choice: Splunk | AWS Lambda | YAML | DevSecOps (Trivy/SonarQube) | AWS DevOps | Azure DevOps | Migration | GitHub Actions | Kafka | GITLAB | N8n | AWS BEDrock AI agent | MCP server on K8s",
        practical: "✔ Practical 30: Chosen Topic Implementation",
        tools: ["Splunk", "Lambda", "YAML", "DevSecOps", "GitHub Actions"],
        techPillar: "Advanced Tech Choice"
      }
    ]
  },
  // MODULE 8
  {
    module: 8,
    moduleTitle: "MODULE 8: Azure DevOps & Realtime AI",
    moduleBadge: "Azure Cloud + RealTime AI Agents",
    color: "from-sky-500 to-blue-600",
    days: [
      {
        day: "Day 47",
        dayNum: 47,
        agenda: "Azure Fundamentals + Azure DevOps",
        brief: "Compare Azure vs AWS vs GCP Services | 100% Interview Perspective | Azure DevOps: Board, Repos, Test Plans, Pipelines, Artifacts",
        practical: "✔ Practical 35: Azure DevOps Implementation + YouTube Clone",
        tools: ["Azure", "Azure DevOps", "Multi-Cloud"],
        techPillar: "Azure DevOps 5 Services"
      },
      {
        day: "Day 48",
        dayNum: 48,
        agenda: "Advance Prompt engineering + Co-Programmer Setup",
        brief: "AI + History of AI, AI vs Deep Learning vs Machine learning vs Gen AI How AI works? Gen AI vs Agentic AI vs AI Agent AI for DevOps & AI for Cloud Engineer & DevOps Engineer",
        practical: "AI Setup for 10X productivity + RealTime AI Use Cases",
        tools: ["AI", "Prompt Engineering"],
        techPillar: "AI Co-Programmer"
      },
      {
        day: "Day 49",
        dayNum: 49,
        agenda: "AI + Generative AI + AI Agents + CoPilot Setup As a AI Programmer",
        brief: "Best AI Usecases",
        practical: "✔ Practical 36: RealTime AI Use Cases",
        tools: ["AI", "Generative AI", "Agents"],
        techPillar: "AI Co-Programmer"
      }
    ]
  },
  // MODULE 9
  {
    module: 9,
    moduleTitle: "MODULE 9: 8 RealTime LIVE PROJECTS + ORIENTATION",
    moduleBadge: "Production CI/CD & Microservices Live Projects",
    color: "from-emerald-600 to-green-500",
    days: [
      {
        day: "Day 50",
        dayNum: 50,
        agenda: "RealTime Project 1: CI/CD Pipeline Automation",
        brief: "CI/CD Pipeline for Node JS | GitHub + Jenkins CI + Jenkinsfile + Docker | Deploy to Remote Machine",
        practical: "🚀 Project 1: Complete CI/CD Pipeline Implementation",
        tools: ["Jenkins", "Docker", "CI/CD", "Spring Boot", "GitHub"],
        techPillar: "CI/CD AWS / GCP Live Project"
      }
    ]
  }
];

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState<"all_tasks" | "roadmap">("all_tasks");
  
  const [summary, setSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Roadmap State & Local Storage Persistence
  const [completedRoadmapDays, setCompletedRoadmapDays] = useState<number[]>([]);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Add Task
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("DevOps & Cloud");
  const [skill, setSkill] = useState("AWS VPC & Networking");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [priority, setPriority] = useState("MEDIUM");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);

  // Target role state
  const [targetRole, setTargetRole] = useState("Senior DevOps Engineer");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("completed_devops_roadmap_days");
      if (saved) {
        setCompletedRoadmapDays(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const toggleRoadmapDay = (dayNum: number) => {
    setCompletedRoadmapDays((prev) => {
      let updated: number[];
      if (prev.includes(dayNum)) {
        updated = prev.filter((d) => d !== dayNum);
      } else {
        updated = [...prev, dayNum];
      }
      try {
        localStorage.setItem("completed_devops_roadmap_days", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const fetchPlannerData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, taskRes] = await Promise.all([
        apiFetch("/study-planner/summary").catch(() => null),
        apiFetch("/study-planner/tasks").catch(() => null)
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (taskRes?.data && Array.isArray(taskRes.data)) {
        setTasks(taskRes.data);
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.warn("Study planner fetch notice:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, [activeTab]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setModalError(null);
    try {
      setIsSubmitting(true);
      await apiFetch("/study-planner/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          skill,
          difficulty,
          priority,
          duration_minutes: Number(durationMinutes),
          start_time: startTime,
          scheduled_date: new Date(scheduledDate).toISOString(),
          xp_reward: difficulty === "ADVANCED" ? 100 : difficulty === "INTERMEDIATE" ? 75 : 50
        })
      });
      setIsAddModalOpen(false);
      setTitle("");
      fetchPlannerData();
    } catch (e: any) {
      setModalError(e.message || "Failed to create study task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await apiFetch(`/study-planner/tasks/${taskId}/complete`, { method: "POST" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userProfileUpdated"));
      }
      fetchPlannerData();
    } catch (e) {
      console.warn("Task completion notice:", e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiFetch(`/study-planner/tasks/${taskId}`, { method: "DELETE" });
      fetchPlannerData();
    } catch (e) {
      console.warn("Task deletion notice:", e);
    }
  };

  const handleGenerateAiPlan = async () => {
    setModalError(null);
    try {
      setIsSubmitting(true);
      await apiFetch("/study-planner/generate-ai-plan", {
        method: "POST",
        body: JSON.stringify({
          target_role: targetRole,
          available_weekly_hours: Number(weeklyHours)
        })
      });
      setIsAiModalOpen(false);
      fetchPlannerData();
    } catch (e: any) {
      setModalError(e.message || "Failed to generate AI plan. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total roadmap completion stats
  const totalRoadmapDaysCount = FULL_DEVOPS_ROADMAP.reduce((acc, m) => acc + m.days.length, 0);
  const completedRoadmapCount = completedRoadmapDays.length;
  const roadmapPct = Math.round((completedRoadmapCount / totalRoadmapDaysCount) * 100);

  return (
    <div className="flex flex-col gap-6 w-full pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900/90 dark:from-amber-950/60 dark:via-slate-900 dark:to-slate-900 border-2 border-[#FF9900]/40 shadow-xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF9900]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/20 border border-[#FF9900]/40 text-[#FF9900] text-xs font-black uppercase tracking-wider w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL 50-DAY DEVOPS + CLOUD + AI ROADMAP & PREPARATION HUB</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            DevOps & Cloud AI <span className="text-[#FF9900]">Study Planner</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed">
            Master Multi-Cloud (AWS, GCP, Azure), Docker, Kubernetes GKE, Jenkins CI/CD, Ansible, Terraform IaC, Python Automation, and AI Prompts across Modules 1 to 9.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0 relative z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-3 px-5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-[#FF9900]/25 flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="py-3 px-5 rounded-2xl text-xs font-black text-white bg-slate-900 dark:bg-slate-800 border-2 border-slate-700 hover:border-[#FF9900] shadow-md flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-[#FF9900]" />
            <span>Generate AI Plan</span>
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS (ONLY ALL TASKS & ROADMAP AS REQUESTED) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-4 gap-4">
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab("all_tasks")}
            className={`py-2.5 px-5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
              activeTab === "all_tasks"
                ? "bg-gradient-to-r from-[#FF9900] to-amber-500 text-slate-950 shadow-md shadow-[#FF9900]/25 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>All Tasks & Daily Checklist</span>
            {tasks.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950 text-amber-300 font-mono">
                {tasks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("roadmap")}
            className={`py-2.5 px-5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
              activeTab === "roadmap"
                ? "bg-gradient-to-r from-[#FF9900] to-amber-500 text-slate-950 shadow-md shadow-[#FF9900]/25 scale-[1.02]"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>DevOps & Cloud AI Roadmap</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold font-mono">
              50 DAYS
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "roadmap" && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{completedRoadmapCount} / {totalRoadmapDaysCount} Days Completed ({roadmapPct}%)</span>
            </div>
          )}

          <button
            onClick={fetchPlannerData}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* VIEW 1: ALL TASKS & DAILY CHECKLIST */}
      {activeTab === "all_tasks" && (
        <div className="flex flex-col gap-6">
          
          {/* SUMMARY STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { label: "Total Tasks", val: summary?.todays_tasks_count ?? tasks.length, icon: BookOpen, color: "text-[#FF9900]", bg: "bg-amber-50 dark:bg-amber-950/40" },
              { label: "Completed", val: summary?.completed_tasks_count ?? tasks.filter(t => t.status === "COMPLETED").length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
              { label: "Weekly Hours", val: `${summary?.weekly_study_hours ?? 15}h`, icon: Code, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
              { label: "Study Streak", val: `${summary?.current_streak ?? 1} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
              { label: "Pending", val: summary?.pending_tasks_count ?? tasks.filter(t => t.status !== "COMPLETED").length, icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
              { label: "Completion %", val: `${summary?.weekly_completion_pct ?? 0}%`, icon: Target, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/40" },
            ].map((c, i) => {
              const IconComp = c.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2 justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide truncate">{c.label}</span>
                    <div className={`p-1.5 rounded-xl ${c.bg}`}>
                      <IconComp className={`w-3.5 h-3.5 ${c.color}`} />
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
                    {c.val}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TASKS LIST */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin mb-2" />
              <span className="text-xs font-bold font-mono">Loading study tasks from database...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center rounded-[28px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <h4 className="text-base font-black text-slate-900 dark:text-white uppercase">No custom tasks scheduled</h4>
              <p className="text-xs text-slate-500 max-w-md">
                Click <strong>[+ Add Task]</strong> above to add custom study goals, or switch to <strong>[DevOps & Cloud AI Roadmap]</strong> tab to follow the 50-day structured syllabus!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => {
                const isDone = task.status === "COMPLETED";
                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                      isDone
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#FF9900]/60 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#FF9900] dark:bg-amber-950/60 border border-[#FF9900]/30">
                        {task.category}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                          +{task.xp_reward} XP
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-sm font-black text-slate-900 dark:text-white leading-snug ${isDone ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <span>{task.duration_minutes} min</span>
                      <span>•</span>
                      <span>{task.start_time}</span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{task.skill}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {isDone ? (
                        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="w-full py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-[#FF9900] hover:from-amber-500 hover:to-orange-500 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>Mark Complete (+{task.xp_reward} XP)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: FULL 50-DAY DEVOPS & CLOUD AI ROADMAP */}
      {activeTab === "roadmap" && (
        <div className="flex flex-col gap-8">
          
          {/* ROADMAP CONTROLS & FILTER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Module Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 max-w-full">
              <button
                onClick={() => setSelectedModuleFilter("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedModuleFilter === "ALL"
                    ? "bg-[#FF9900] text-slate-950 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All 9 Modules
              </button>

              {FULL_DEVOPS_ROADMAP.map((mod) => (
                <button
                  key={mod.module}
                  onClick={() => setSelectedModuleFilter(mod.module)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap ${
                    selectedModuleFilter === mod.module
                      ? "bg-[#FF9900] text-slate-950 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  Module {mod.module}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search agenda or tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
              />
            </div>

          </div>

          {/* MODULE SECTIONS LIST */}
          <div className="flex flex-col gap-8">
            {FULL_DEVOPS_ROADMAP
              .filter((mod) => selectedModuleFilter === "ALL" || selectedModuleFilter === mod.module)
              .map((mod) => {
                // Filter days by search query if present
                const filteredDays = mod.days.filter((d) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    d.agenda.toLowerCase().includes(q) ||
                    d.brief.toLowerCase().includes(q) ||
                    d.practical.toLowerCase().includes(q) ||
                    d.tools.some((t) => t.toLowerCase().includes(q))
                  );
                });

                if (filteredDays.length === 0) return null;

                return (
                  <div key={mod.module} className="flex flex-col gap-4">
                    
                    {/* Module Header Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center font-black text-sm text-slate-950 shadow-md shrink-0`}>
                          M{mod.module}
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                            {mod.moduleTitle}
                          </h2>
                          <span className="text-xs text-amber-400 font-bold font-mono">
                            {filteredDays.length} Days Syllabus • {mod.moduleBadge}
                          </span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black bg-white/10 text-slate-300 border border-white/20 uppercase tracking-widest self-start sm:self-auto">
                        {mod.moduleBadge}
                      </span>
                    </div>

                    {/* Module Days Grid */}
                    <div className="grid grid-cols-1 gap-3.5">
                      {filteredDays.map((d) => {
                        const isDone = completedRoadmapDays.includes(d.dayNum);
                        return (
                          <div
                            key={d.dayNum}
                            onClick={() => toggleRoadmapDay(d.dayNum)}
                            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isDone
                                ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/50 shadow-sm"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#FF9900]/60 shadow-xs"
                            }`}
                          >
                            <div className="flex items-start gap-4 min-w-0">
                              
                              {/* Custom Interactive Checkbox */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRoadmapDay(d.dayNum);
                                }}
                                className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                                  isDone
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105"
                                    : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-[#FF9900]"
                                }`}
                              >
                                {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                              </button>

                              <div className="flex flex-col gap-1.5 min-w-0">
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                                    isDone
                                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                                      : "bg-[#FF9900]/15 text-[#FF9900] border border-[#FF9900]/30"
                                  }`}>
                                    {d.day}
                                  </span>

                                  {d.reel && (
                                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                      🎬 {d.reel}
                                    </span>
                                  )}

                                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                                    {d.techPillar}
                                  </span>
                                </div>

                                <h3 className={`text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight ${isDone ? 'line-through opacity-70' : ''}`}>
                                  {d.agenda}
                                </h3>

                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                  {d.brief}
                                </p>

                                {/* Practical Lab Badge */}
                                {d.practical && (
                                  <div className="mt-1 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                                    <Terminal className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" />
                                    <span className="font-semibold">{d.practical}</span>
                                  </div>
                                )}

                                {/* Tools & Tech Pills */}
                                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                  {d.tools.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>

                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                              <span className={`text-xs font-mono font-black ${isDone ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {isDone ? "✓ COMPLETED" : "PENDING"}
                              </span>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* ADD TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-4 relative overflow-hidden">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                <Plus className="w-5 h-5 text-[#FF9900]" />
                Add Custom Study Task
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. AWS VPC Troubleshooting Lab"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
                  >
                    <option value="Linux & Systems">Linux & Systems</option>
                    <option value="Multi-Cloud">Multi-Cloud</option>
                    <option value="Containers & K8s">Containers & K8s</option>
                    <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                    <option value="Site Reliability">Site Reliability</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Skill</label>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900]"
                  >
                    <option value="BEGINNER">Beginner (+50 XP)</option>
                    <option value="INTERMEDIATE">Intermediate (+75 XP)</option>
                    <option value="ADVANCED">Advanced (+100 XP)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF9900]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50 mt-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Task to Database 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI GENERATE PLAN MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF9900]/40 rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden">
            
            <div className="p-3 rounded-2xl bg-[#FF9900]/20 border border-[#FF9900]/40 w-fit mx-auto text-[#FF9900]">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Generate AI Study Plan
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              FastAPI AI Engine will analyze your evaluated interview question scores & missing ATS resume skills from PostgreSQL to generate a 5-task preparation sprint.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{modalError}</span>
              </div>
            )}

            <button
              onClick={handleGenerateAiPlan}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF9900]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "✨ Generate AI Plan Now"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
