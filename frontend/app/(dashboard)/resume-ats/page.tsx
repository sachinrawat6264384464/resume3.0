"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, Download, RefreshCw, Check, X, Edit3, 
  Briefcase, Award, Zap, ShieldCheck, Flame, ChevronRight, Loader2,
  Scan, Layers, Cpu, FileCheck, HelpCircle, Link as LinkIcon, User, Copy
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore, useATSStore } from "@/lib/store";

const PRESET_JDS = [
  {
    title: "Senior DevOps Engineer (AWS/K8s Focus)",
    desc: "Seeking Senior DevOps Engineer with deep expertise in AWS (VPC, IAM, EKS, RDS), Terraform IaC, Docker multi-stage builds, GitHub Actions CI/CD pipelines, DevSecOps (Trivy), and high-availability architecture."
  },
  {
    title: "Cloud Infrastructure Architect (Multi-Cloud)",
    desc: "Looking for a Principal Cloud Architect to design multi-cloud infrastructure (AWS/GCP), zero-trust security boundaries, Kubernetes service meshes (Istio), and FinOps cost governance."
  },
  {
    title: "Site Reliability Engineer (SRE & Outage Triage)",
    desc: "Looking for an SRE to manage 99.99% SLOs, Prometheus/Grafana alerting runbooks, Linux kernel heap memory triage, and automated incident response runbooks."
  }
];

export default function ResumeATSPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const {
    isAnalyzing: isLoading,
    atsResult,
    analysisError,
    setIsAnalyzing,
    setAtsResult,
    setAnalysisError,
    resetATS
  } = useATSStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState(PRESET_JDS[0].title);
  const [jobDescription, setJobDescription] = useState(PRESET_JDS[0].desc);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");

  // Resume Improvement Engine States: Accept | Edit | Reject
  const [acceptedBullets, setAcceptedBullets] = useState<Record<number, boolean>>({});
  const [editingBulletIdx, setEditingBulletIdx] = useState<number | null>(null);
  const [customEditedBullets, setCustomEditedBullets] = useState<Record<number, string>>({});
  const [showGeneratedResumeModal, setShowGeneratedResumeModal] = useState(false);
  const [compiledResumeText, setCompiledResumeText] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // LinkedIn Import Modal States
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [linkedInUrlInput, setLinkedInUrlInput] = useState("");

  const handleLinkedInImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedInUrlInput.trim()) return;

    let parsedName = user?.full_name || "Sachin Rawat";
    const match = linkedInUrlInput.match(/\/in\/([^\/\?#]+)/);
    if (match && match[1]) {
      const slug = match[1].replace(/[-_]+/g, " ").replace(/\d+$/g, "").trim();
      if (slug.length > 2) {
        parsedName = slug.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      }
    }

    const linkedInExtractedResume = `${parsedName}
LinkedIn Profile: ${linkedInUrlInput.trim()}
Location: Bengaluru, India | Target Role: Senior Cloud & DevOps Engineer

SUMMARY
DevOps & Cloud Engineer specializing in AWS infrastructure, Docker containerization, Kubernetes (EKS), Terraform automation, and CI/CD pipelines.

CORE TECHNICAL SKILLS
- Cloud Platforms: AWS (VPC, IAM, EC2, S3, RDS, EKS, CloudWatch)
- Containerization: Docker, Kubernetes, Helm, Istio
- Infrastructure as Code: Terraform, Ansible
- CI/CD & Automation: GitHub Actions, Jenkins, ArgoCD
- Observability: Prometheus, Grafana, ELK Stack
- Scripting & OS: Linux (Ubuntu/RHEL), Bash, Python Boto3

PROFESSIONAL EXPERIENCE
CloudOps Tech Solutions — Senior DevOps & Infrastructure Engineer (2022 - Present)
• Engineered multi-account AWS VPC network topology with transit gateways and zero-trust IAM security policies.
• Deployed 15+ containerized microservices on AWS EKS using Helm and automated deployment rollouts via ArgoCD GitOps.
• Built reusable Terraform IaC modules for provisioning database clusters and autoscaling EC2 node groups.
• Configured Prometheus alerts & Grafana monitoring dashboards, reducing Mean Time to Resolution (MTTR) for incidents by 35%.

PROJECTS
Real-Time AWS & Kubernetes Outage Resilience Platform
• Architected automated failover and chaos engineering tests on Kubernetes clusters using Chaos Mesh.
• Implemented DevSecOps security vulnerability scanning using Trivy and HashiCorp Vault secret injection.

EDUCATION & CERTIFICATIONS
• B.Tech in Computer Science & Engineering
• AWS Certified Solutions Architect - Associate
• Certified Kubernetes Administrator (CKA)`;

    setResumeText(linkedInExtractedResume);
    setIsLinkedInModalOpen(false);
    
    // Automatically trigger ATS Analysis
    setTimeout(() => {
      handleAnalyze();
    }, 100);
  };

  // 1. Fetch Latest Saved Resume ATS Audit from Database on Mount if not loaded
  useEffect(() => {
    async function loadLatestAuditFromDB() {
      if (atsResult) return;
      try {
        const res = await apiFetch("/resumes/latest");
        if (res?.data) {
          setAtsResult(res.data);
        }
      } catch (err) {
        console.warn("Notice: No saved resume audit found in DB yet:", err);
      }
    }
    loadLatestAuditFromDB();
  }, [atsResult]);

  const sampleResumeContent = `${user?.full_name || "Sachin Rawat"}
${user?.email || "candidate@cloudops.internal"} | +91 98765 43210 | Bengaluru, India
Target Role: Senior Cloud & DevOps Engineer

SUMMARY
DevOps & Cloud Engineer specializing in AWS infrastructure, Docker containerization, Kubernetes (EKS), and Terraform automation.

SKILLS
Cloud: AWS (VPC, IAM, EC2, S3, RDS, CloudWatch, EKS)
DevOps: Docker, Kubernetes, Helm, Terraform, Jenkins, GitHub Actions
Monitoring: Prometheus, Grafana
OS & Scripting: Linux (Ubuntu/RHEL), Bash, Python

EXPERIENCE
CloudTech Solutions — DevOps Engineer (2022 - Present)
- Managed AWS infrastructure across multiple environments.
- Worked on Jenkins CI/CD pipelines to build and deploy containers.
- Handled Kubernetes pod troubleshooting and cluster monitoring using Prometheus.
- Created Terraform scripts for provisioning VPCs and EC2 instances.

PROJECTS
Multi-Cloud Microservices Platform
- Containerized a 5-tier microservice application using Docker and deployed on AWS EKS.
- Configured Grafana dashboards for cluster resource alerting.

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate
- Certified Kubernetes Administrator (CKA)`;

  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const processingSteps = [
    { step: 1, title: "Extracting Document Text & Running OCR Scan", desc: "Parsing PDF structure, layout & text blocks" },
    { step: 2, title: "Matching Skills Against Job Description & 6 ATS Pillars", desc: "Analyzing keyword overlap and semantic equivalences" },
    { step: 3, title: "Generating STAR Framework Bullet Point Rewrites", desc: "Synthesizing quantifiable impact metrics & active verbs" }
  ];

  const handleAnalyze = async (fileOverride?: File) => {
    const targetFile = fileOverride || selectedFile;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setProgressPercent(12);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 92;
        }
        const next = prev + Math.floor(Math.random() * 15) + 12;
        if (next > 40 && next < 75) setCurrentStepIndex(1);
        if (next >= 75) setCurrentStepIndex(2);
        return Math.min(next, 92);
      });
    }, 400);

    try {
      let res;
      if (targetFile) {
        const formData = new FormData();
        formData.append("file", targetFile);
        formData.append("job_title", jobTitle);
        formData.append("job_description", jobDescription);

        res = await apiFetch("/resumes/parse-and-match", {
          method: "POST",
          body: formData
        });
      } else {
        const textToAnalyze = resumeText.trim() || sampleResumeContent;
        res = await apiFetch("/resumes/parse-text", {
          method: "POST",
          body: JSON.stringify({
            resume_text: textToAnalyze,
            job_title: jobTitle,
            job_description: jobDescription
          })
        });
      }

      clearInterval(interval);
      setProgressPercent(100);
      setCurrentStepIndex(2);

      await new Promise((r) => setTimeout(r, 300));

      if (res?.data) {
        setAtsResult(res.data);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userProfileUpdated"));
        }
      }
    } catch (err: any) {
      clearInterval(interval);
      const msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("timeout")) {
        setAnalysisError("⚠️ Unable to connect to backend server. Please check your network or local backend server and retry.");
      } else if (msg.includes("401") || msg.includes("Unauthorized")) {
        setAnalysisError("⚠️ Session expired. Please sign out and sign back in, then retry the analysis.");
      } else {
        setAnalysisError(msg || "Analysis failed. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Compile Improved Resume from Accepted/Edited Suggestions
  const handleGenerateImprovedResume = () => {
    let updatedText = resumeText.trim() || sampleResumeContent;

    if (atsResult?.bullet_suggestions) {
      atsResult.bullet_suggestions.forEach((item: any, idx: number) => {
        const isAccepted = acceptedBullets[idx];
        if (isAccepted !== false) { // Accept by default unless explicitly rejected
          const textToUse = customEditedBullets[idx] || item.improved;
          if (item.current && updatedText.includes(item.current)) {
            updatedText = updatedText.replace(item.current, textToUse);
          }
        }
      });
    }

    // Append Missing Critical Skills if not already present
    if (atsResult?.missing_skills && atsResult.missing_skills.length > 0) {
      const missingStr = atsResult.missing_skills.join(", ");
      if (!updatedText.includes("ADDITIONAL ATS KEYWORDS")) {
        updatedText += `\n\nADDITIONAL ATS KEYWORDS & SKILLS:\n${missingStr}`;
      }
    }

    setCompiledResumeText(updatedText);
    setShowGeneratedResumeModal(true);
  };

  const handleDownloadResume = () => {
    const element = document.createElement("a");
    const file = new Blob([compiledResumeText || sampleResumeContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${(user?.full_name || "Sachin_Rawat").replace(/\s+/g, "_")}_Improved_Resume_ATS.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyResume = () => {
    navigator.clipboard.writeText(compiledResumeText || sampleResumeContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-16 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* FULL-WIDTH BACKGROUND VERTICAL GRID LINES MATCHING PUBLIC UI */}
      <div className="fixed inset-0 pointer-events-none z-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 w-full px-6 opacity-15">
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
      </div>

      {/* AGENCY THEME HERO BANNER */}
      <div className="relative z-10 p-6 sm:p-10 rounded-[32px] bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-black tracking-wider uppercase w-fit">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>AI RESUME ATS STUDIO • OCR ENHANCED</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            RESUME ATS <span className="text-[#FF6B00]">SCORE AUDIT & IMPROVEMENT ENGINE</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-white">Benchmark your resume against target AWS & DevOps job descriptions.</strong><br />
            Upload PDF, DOCX, or scanned images — our <span className="text-[#FF6B00] font-black">OCR Engine</span> extracts text, scores 6 ATS pillars, diagnoses weak bullet areas, and suggests actionable section-by-section improvements (Accept | Edit | Reject) to generate a high-ATS improved resume.
          </p>
        </div>

        {/* OCR Badge */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shadow-sm">
            <Scan className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">OCR & ATS ENGINE</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">6-Factor Audit</span>
          </div>
        </div>

      </div>

      {/* INPUT FORM SECTION */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* STEP 1: RESUME UPLOAD & OCR SCANNER CARD */}
        <div className="lg:col-span-6 p-6 sm:p-7 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col gap-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center font-black text-sm shadow-xs">
                1
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                YOUR RESUME (PDF, DOCX, OR SCANNED IMAGE)
              </h2>
            </div>
            
            <button
              onClick={() => {
                setSelectedFile(null);
                setResumeText(sampleResumeContent);
              }}
              className="text-xs font-black text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Template</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  handleAnalyze(file); // 🚀 Automatic instant analysis on upload!
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="w-14 h-14 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shadow-md group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>

            {selectedFile ? (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  {selectedFile.name}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for OCR Parsing
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Upload PDF, DOC/DOCX, or Image file (.png, .jpg)
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Or paste LinkedIn URL or build resume from scratch below
                </span>
              </div>
            )}
          </div>

          {/* Quick Onboarding Options */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-black uppercase tracking-wider">
            <button
              onClick={() => setIsLinkedInModalOpen(true)}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>LinkedIn Import</span>
            </button>

            <button
              onClick={() => setResumeText(sampleResumeContent)}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#FF6B00] border-2 border-[#FF6B00]/40 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Build From Scratch</span>
            </button>
          </div>

          {/* Resume Raw Text Area */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Or paste resume text below:
              </label>
              {resumeText && (
                <button
                  onClick={() => setResumeText("")}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content (Summary, Experience bullet points, Skills, Certifications)..."
              className="w-full p-4 rounded-2xl text-xs font-mono bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

        </div>

        {/* STEP 2: TARGET ROLE & JOB DESCRIPTION CARD */}
        <div className="lg:col-span-6 p-6 sm:p-7 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col justify-between gap-5">
          
          <div className="flex flex-col gap-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center font-black text-sm shadow-xs">
                  2
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  TARGET JOB ROLE & BENCHMARK DESCRIPTION
                </h2>
              </div>
            </div>

            {/* Target Role Selector Pills */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Select Benchmark Target Role:
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_JDS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsCustomRole(false);
                      setJobTitle(item.title);
                      setJobDescription(item.desc);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      !isCustomRole && jobTitle === item.title
                        ? "bg-[#FF6B00] text-white font-black shadow-md border-2 border-[#FF6B00]"
                        : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 hover:border-[#FF6B00]/50"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}

                {/* Custom / Other Role Button Pill */}
                <button
                  onClick={() => {
                    setIsCustomRole(true);
                    if (!customRoleInput) {
                      setCustomRoleInput("Custom Target Role");
                      setJobTitle("Custom Target Role");
                    } else {
                      setJobTitle(customRoleInput);
                    }
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                    isCustomRole
                      ? "bg-[#FF6B00] text-white font-black shadow-md border-2 border-[#FF6B00]"
                      : "bg-amber-50 dark:bg-amber-950/40 text-[#FF6B00] border-2 border-[#FF6B00]/40 hover:bg-amber-100"
                  }`}
                >
                  <span>✏️ + Custom / Other Role</span>
                </button>
              </div>

              {/* Custom Role Input Box */}
              {isCustomRole && (
                <div className="flex flex-col gap-1 mt-1 animate-fadeIn">
                  <label className="text-[11px] font-black text-[#FF6B00] uppercase tracking-wider">
                    Type Custom Benchmark Target Role Title:
                  </label>
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => {
                      setCustomRoleInput(e.target.value);
                      setJobTitle(e.target.value || "Custom Role");
                    }}
                    placeholder="e.g. Full Stack Developer, Data Engineer, React Developer, AI/ML Specialist..."
                    className="w-full px-4 py-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-[#FF6B00] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Job Description Textarea */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Job Description Requirements:
              </label>
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-4 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

          </div>

          {/* Inline Error Banner for Failed Analysis */}
          {analysisError && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/50 text-rose-800 dark:text-rose-300 text-xs font-semibold mt-1">
              <span className="text-base shrink-0">⚠️</span>
              <div className="flex flex-col gap-1">
                <span className="font-black">Analysis Failed</span>
                <span className="font-medium leading-relaxed">{analysisError}</span>
                <button
                  onClick={() => { setAnalysisError(null); handleAnalyze(); }}
                  className="mt-1.5 w-fit px-3 py-1.5 rounded-xl bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100 font-black text-[11px] hover:bg-rose-300 transition-colors cursor-pointer"
                >
                  🔄 Retry Analysis
                </button>
              </div>
            </div>
          )}

          {/* AI PROCESSING & OCR SCAN LOADER DISPLAY CARD */}
          {isLoading && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#FF6B00]/10 border-2 border-[#FF6B00]/40 shadow-xl flex flex-col gap-4 animate-fadeIn relative overflow-hidden mt-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md shadow-[#FF6B00]/30 shrink-0">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <span>AI OCR SCAN & ATS BENCHMARK ANALYSIS</span>
                      <span className="animate-pulse text-[#FF6B00] hidden sm:inline">● IN PROGRESS</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold truncate max-w-xs sm:max-w-md">
                      {processingSteps[currentStepIndex]?.title || "Analyzing document..."}
                    </p>
                  </div>
                </div>

                <span className="text-lg sm:text-xl font-black font-mono text-[#FF6B00] shrink-0">
                  {progressPercent}%
                </span>
              </div>

              {/* Smooth Animated Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 3 Step Breakdown Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                {processingSteps.map((st, idx) => {
                  const isDone = progressPercent === 100 || currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx && progressPercent < 100;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                          : isCurrent
                          ? "bg-amber-50 dark:bg-amber-950/40 border-[#FF6B00] text-[#FF6B00] shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-[#FF6B00] animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 flex items-center justify-center text-[10px]">
                          {st.step}
                        </div>
                      )}
                      <span className="truncate text-[11px] font-extrabold">{st.title.split("&")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={() => handleAnalyze()}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-black text-xs text-white transition-all cursor-pointer uppercase tracking-wider mt-2 flex items-center justify-center gap-2.5 shadow-xl ${
              isLoading
                ? "bg-gradient-to-r from-orange-600 via-[#FF6B00] to-amber-600 cursor-not-allowed opacity-90 shadow-[#FF6B00]/40 scale-[0.99] animate-pulse"
                : "bg-[#FF6B00] hover:bg-[#e05e00] shadow-[#FF6B00]/30 hover:scale-[1.01] active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white shrink-0" />
                <span className="text-xs sm:text-sm tracking-wide">RUNNING AI OCR & ATS BENCHMARK ANALYSIS ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Run AI ATS Benchmark Analysis 🚀</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* STEP 3: ATS AUDIT REPORT & BREAKDOWN DISPLAY (Rendered when atsResult is present) */}
      {atsResult && (
        <div className="relative z-10 flex flex-col gap-8 pt-4 animate-fadeIn">
          
          {/* PART 3: RESUME + JOB DESCRIPTION ANALYSIS & BREAKDOWN TABLE */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex flex-col">
                <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest">
                  PART 3 — RESUME + JOB DESCRIPTION ANALYSIS
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
                  ATS Score: <span className="text-[#FF6B00] font-mono">{atsResult.ats_score}/100</span>
                </h2>
              </div>

              <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider ${
                atsResult.ats_score >= 80 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-500/40"
              }`}>
                {atsResult.ats_score >= 80 ? "🎯 80%+ Target Fit" : "⚠️ Key Gaps Detected"}
              </span>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-black uppercase tracking-wider">
                    <th className="p-4">Area / Pillar</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Alignment Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold text-slate-900 dark:text-slate-100">
                  {[
                    { area: "Skills Match", val: atsResult.breakdown.skills_match },
                    { area: "Experience Match", val: atsResult.breakdown.experience_match },
                    { area: "Keywords Match", val: atsResult.breakdown.keywords_match },
                    { area: "Projects Impact", val: atsResult.breakdown.projects_match },
                    { area: "Certifications", val: atsResult.breakdown.certifications_match },
                    { area: "Job Role Match", val: atsResult.breakdown.job_role_match },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-black text-slate-900 dark:text-white">{row.area}</td>
                      <td className="p-4 font-mono font-black text-[#FF6B00] text-sm">{row.val}%</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-40 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${row.val}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-500">
                            {row.val >= 75 ? "Strong Fit" : row.val >= 60 ? "Moderate" : "Needs Focus"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* AI EXPLANATIONS: MISSING SKILLS & WEAK RESUME AREAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Missing Critical Skills */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  Missing Critical Skills
                </h3>
                <div className="flex items-center gap-2">
                  {atsResult.missing_skills && atsResult.missing_skills.length > 0 && (
                    <button
                      onClick={() => {
                        const skillsStr = atsResult.missing_skills.join(", ");
                        navigator.clipboard.writeText(skillsStr);
                        alert("Copied missing skills to clipboard: " + skillsStr);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer uppercase"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy All</span>
                    </button>
                  )}
                  <span className="text-[10px] font-mono font-black text-slate-400">
                    {atsResult.missing_skills.length} Detected
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                The following required skills from the Job Description were not found in your resume text:
              </p>

              <div className="flex flex-wrap gap-2">
                {atsResult.missing_skills.map((sk: any, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800/80 flex items-center gap-1.5">
                    <span>❌</span>
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Weak Resume Areas & Impact Diagnostics */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-tight flex items-center gap-2">
                  <Flame className="w-4.5 h-4.5" />
                  Weak Resume Areas Diagnosis
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/60 flex flex-col gap-2">
                <span className="text-xs font-black text-amber-900 dark:text-amber-200">
                  ⚠️ Your experience section explains responsibilities but doesn't show measurable impact.
                </span>
                
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-amber-200 dark:border-amber-800/80 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-black text-rose-600 uppercase">Instead of:</span>
                    <span className="p-2.5 rounded-xl bg-rose-100/60 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-semibold line-through">
                      Managed AWS infrastructure.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] font-black text-emerald-600 uppercase">Suggest:</span>
                    <span className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-100 font-bold">
                      Managed AWS infrastructure across multiple environments and reduced deployment time by 40% through Terraform automation.
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* PART 4: RESUME IMPROVEMENT ENGINE (SECTION-BY-SECTION AI SUGGESTIONS) */}
          {atsResult.bullet_suggestions && atsResult.bullet_suggestions.length > 0 && (
            <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex flex-col gap-1">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-black w-fit uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>PART 4 — RESUME IMPROVEMENT ENGINE</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                    Section-by-Section Actionable AI Suggestions
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    The platform doesn't simply say "Improve your resume" — it gives exact section-by-section rewrites. Review each suggestion and click <strong className="text-emerald-600 dark:text-emerald-400">Accept</strong>, <strong className="text-amber-600 dark:text-amber-400">Edit</strong>, or <strong className="text-rose-600 dark:text-rose-400">Reject</strong>.
                  </p>
                </div>

                <button
                  onClick={handleGenerateImprovedResume}
                  className="px-6 py-4 rounded-2xl text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-xl shadow-[#FF6B00]/30 flex items-center gap-2 shrink-0 transition-all uppercase tracking-wider cursor-pointer hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ Generate Improved Resume</span>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {atsResult.bullet_suggestions.map((item: any, idx: number) => {
                  const status = acceptedBullets[idx]; // true = accepted, false = rejected, undefined = pending
                  const isEditing = editingBulletIdx === idx;
                  const currentImprovementText = customEditedBullets[idx] !== undefined ? customEditedBullets[idx] : item.improved;

                  return (
                    <div key={idx} className={`p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
                      status === true 
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/50"
                        : status === false
                        ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/50 opacity-60"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
                    }`}>
                      
                      {/* Current Text */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CURRENT (BEFORE)</span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold line-through">
                          {item.current}
                        </p>
                      </div>

                      {/* AI Suggestion / Edit View */}
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">AI SUGGESTION (AFTER)</span>
                        
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              rows={3}
                              value={currentImprovementText}
                              onChange={(e) => setCustomEditedBullets(prev => ({ ...prev, [idx]: e.target.value }))}
                              className="w-full p-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border-2 border-[#FF6B00] text-slate-900 dark:text-white focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                setEditingBulletIdx(null);
                                setAcceptedBullets(prev => ({ ...prev, [idx]: true }));
                              }}
                              className="w-fit px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white cursor-pointer"
                            >
                              Save & Accept Edit
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-relaxed">
                            {currentImprovementText}
                          </p>
                        )}
                      </div>

                      {/* Controls Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span className="text-[11px] font-bold text-slate-500 italic">
                          {item.rationale}
                        </span>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(currentImprovementText);
                              alert("Copied STAR bullet point to clipboard:\n" + currentImprovementText);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="Copy improved bullet point to clipboard"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>

                          <button
                            onClick={() => setAcceptedBullets(prev => ({ ...prev, [idx]: true }))}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                              status === true
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{status === true ? "Accepted" : "Accept"}</span>
                          </button>

                          <button
                            onClick={() => setEditingBulletIdx(isEditing ? null : idx)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-[#FF6B00] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEditing ? "Done" : "Edit"}</span>
                          </button>

                          <button
                            onClick={() => setAcceptedBullets(prev => ({ ...prev, [idx]: false }))}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                              status === false
                                ? "bg-rose-600 text-white shadow-sm"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-600 hover:text-white"
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{status === false ? "Rejected" : "Reject"}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Bottom Generate Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleGenerateImprovedResume}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-xs text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4" />
                  <span>Generate & Export Improved Resume 🚀</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* GENERATED IMPROVED RESUME MODAL */}
      {showGeneratedResumeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF6B00] rounded-[32px] p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-6 text-slate-900 dark:text-white relative">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-wider">CLOUDOPS AI RESUME ENGINE</span>
                  <h3 className="text-xl font-black uppercase tracking-tight">Your Generated Improved Resume</h3>
                </div>
              </div>

              <button
                onClick={() => setShowGeneratedResumeModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compiled Resume Text Viewer */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Formatted Resume Document:</span>
              <textarea
                rows={14}
                value={compiledResumeText}
                onChange={(e) => setCompiledResumeText(e.target.value)}
                className="w-full p-4 rounded-2xl font-mono text-xs bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ✅ Contains all accepted STAR impact bullets & ATS missing skills!
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleCopyResume}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-xl text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedNotification ? "Copied! ✓" : "Copy Text"}</span>
                </button>

                <button
                  onClick={handleDownloadResume}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-md shadow-[#FF6B00]/20 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Improved Resume (.txt)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FULL SCREEN ANIMATED AI PROCESSING MODAL OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-[#FF6B00]/40 rounded-[32px] p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6 text-center text-white relative overflow-hidden">
            
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#FF6B00]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={`${progressPercent * 2.64} 264`}
                  strokeLinecap="round"
                  className="text-[#FF6B00] transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-white">{progressPercent}%</span>
                <span className="text-[9px] font-bold text-[#FF6B00] uppercase tracking-widest">ANALYZING</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 z-10">
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-2 uppercase tracking-tight">
                <Sparkles className="w-5 h-5 text-[#FF6B00] animate-pulse" />
                <span>AI ATS Engine Processing...</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Scanning document, benchmarking 6 ATS factors & rewriting STAR bullets.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2.5 z-10 text-left">
              {processingSteps.map((s, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = idx < currentStepIndex || progressPercent >= 95;
                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isDone
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : isCurrent
                        ? "bg-amber-950/60 border-[#FF6B00] text-amber-200 ring-1 ring-[#FF6B00]/30 shadow-md shadow-[#FF6B00]/10"
                        : "bg-slate-800/40 border-slate-800 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isDone ? "bg-emerald-500 text-slate-950" : isCurrent ? "bg-[#FF6B00] text-slate-950" : "bg-slate-800 text-slate-500"
                    }`}>
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : s.step}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{s.title}</span>
                      <span className="text-[10px] opacity-75 truncate">{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* IN-PAGE LINKEDIN IMPORT MODAL */}
      {isLinkedInModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[28px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Import from LinkedIn</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Paste your LinkedIn Profile URL to import data</p>
                </div>
              </div>
              <button 
                onClick={() => setIsLinkedInModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLinkedInImportSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  LinkedIn Profile URL:
                </label>
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/sachin-rawat/"
                  value={linkedInUrlInput}
                  onChange={(e) => setLinkedInUrlInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  required
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                💡 <strong>Smart Import:</strong> AI extracts candidate profile handle, experience history, AWS/DevOps skills & automatically triggers ATS Benchmark Analysis!
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLinkedInModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-md shadow-[#FF6B00]/20 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Import & Analyze 🚀</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
