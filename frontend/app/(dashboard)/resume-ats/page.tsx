"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, Download, RefreshCw, Check, X, Edit3, 
  Briefcase, Award, Zap, ShieldCheck, Flame, ChevronRight, Loader2,
  Scan, Layers, Cpu, FileCheck, HelpCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore, useATSStore } from "@/lib/store";
import { ResumeATSResponse, BulletImprovementItem } from "@/types";

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
  const [acceptedBullets, setAcceptedBullets] = useState<Record<number, boolean>>({});

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

  const sampleResumeContent = `${user?.full_name || "Candidate User"}
${user?.email || "candidate@cloudops.internal"} | +91 98765 43210 | Bengaluru, India
Target Role: Senior Cloud & DevOps Engineer

SUMMARY
DevOps & Cloud Engineer with experience specializing in AWS, Docker, Kubernetes (EKS), and Terraform. Proven track record in automating deployment pipelines and maintaining infrastructure uptime.

SKILLS
Cloud: AWS (VPC, IAM, EC2, S3, RDS, CloudWatch, EKS)
DevOps: Docker, Kubernetes, Helm, Terraform, Jenkins, GitHub Actions
Monitoring: Prometheus, Grafana
OS & Scripting: Linux (Ubuntu/RHEL), Bash, Python

EXPERIENCE
CloudTech Solutions — DevOps Engineer (2022 - Present)
- Managed AWS infrastructure and deployed application updates across multiple environments.
- Configured Jenkins CI/CD pipelines to build and deploy Docker containers.
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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setProgressPercent(12);
    setCurrentStepIndex(0);

    // Smooth progress animation over 2.5 seconds
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
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
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

  return (
    <div className="max-w-[1350px] mx-auto flex flex-col gap-8 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white border border-[#FF9900]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI RESUME ATS STUDIO • OCR ENHANCED</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Resume ATS <span className="text-[#FF9900]">Score Audit & STAR Rewriter</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Benchmark your resume against target AWS & DevOps job descriptions. Upload PDF, DOCX, or scanned images — our <span className="text-[#FF9900] font-bold">OCR Engine</span> extracts text, scores 6 ATS pillars, and rewrites bullet points with STAR metrics.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shrink-0 z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900]">
            <Scan className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-400">OCR & ATS ENGINE</span>
            <span className="text-xl font-black text-white">6-Factor Audit</span>
          </div>
        </div>

      </div>

      {/* INPUT FORM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* STEP 1: RESUME UPLOAD & OCR SCANNER CARD */}
        <div className="lg:col-span-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF9900]/10 text-[#FF9900] flex items-center justify-center font-black text-xs">
                1
              </div>
              <h2 className="text-base font-black text-[#232F3E] dark:text-white">
                Your Resume (PDF, DOCX, or Scanned Image)
              </h2>
            </div>
            
            <button
              onClick={() => {
                setSelectedFile(null);
                setResumeText(sampleResumeContent);
              }}
              className="text-xs font-bold text-[#FF9900] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Load Template</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-[#FF9900] transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900]">
              <Upload className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for OCR Parsing
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drag & Drop PDF, DOCX, or Image file (.png, .jpg)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Supports Optical Character Recognition (OCR) for scanned documents
                </span>
              </div>
            )}
          </div>

          {/* Resume Raw Text Area */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Or paste resume text below:
              </label>
              {resumeText && (
                <button
                  onClick={() => setResumeText("")}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
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
              className="w-full p-3.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#FF9900]"
            />
          </div>

        </div>

        {/* STEP 2: TARGET ROLE & JOB DESCRIPTION CARD */}
        <div className="lg:col-span-6 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between gap-5">
          
          <div className="flex flex-col gap-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF9900]/10 text-[#FF9900] flex items-center justify-center font-black text-xs">
                  2
                </div>
                <h2 className="text-base font-black text-[#232F3E] dark:text-white">
                  Target Job Role & Benchmark Description
                </h2>
              </div>
            </div>

            {/* Target Role Selector Pills */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      !isCustomRole && jobTitle === item.title
                        ? "bg-[#232F3E] text-white border border-[#FF9900] shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
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
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-1.5 ${
                    isCustomRole
                      ? "bg-[#FF9900] text-slate-950 font-black shadow-md"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-100"
                  }`}
                >
                  <span>✏️ + Custom / Other Role</span>
                </button>
              </div>

              {/* Custom Role Input Box */}
              {isCustomRole && (
                <div className="flex flex-col gap-1 mt-1 animate-fadeIn">
                  <label className="text-[11px] font-bold text-[#FF9900]">
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
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-[#FF9900] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Job Description Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Job Description Requirements:
              </label>
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#FF9900]"
              />
            </div>

          </div>

          {/* Inline Error Banner for Failed Analysis */}
          {analysisError && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold mt-1">
              <span className="text-base shrink-0">⚠️</span>
              <div className="flex flex-col gap-1">
                <span className="font-black">Analysis Failed</span>
                <span className="font-medium leading-relaxed">{analysisError}</span>
                <button
                  onClick={() => { setAnalysisError(null); handleAnalyze(); }}
                  className="mt-1.5 w-fit px-3 py-1.5 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black text-[11px] hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors"
                >
                  🔄 Retry Analysis
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF9900]/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running AI OCR & ATS Benchmark Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI ATS Benchmark Analysis 🚀</span>
              </>
            )}
          </button>

        </div>

      </div>


      {/* STEP 3: ATS AUDIT REPORT DISPLAY (Rendered when atsResult is present) */}
      {atsResult && (
        <div className="flex flex-col gap-8 pt-4 animate-fadeIn">
          
          {/* OVERALL SCORE & 6-FACTOR PILLARS */}
          <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Score Radial Donut */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#232F3E] text-white text-center shadow-lg">
              <span className="text-xs font-mono font-bold text-[#FF9900] uppercase tracking-widest">OVERALL ATS MATCH</span>
              <div className="relative flex items-center justify-center my-2">
                <div className="text-5xl font-black text-white font-mono">{atsResult.ats_score}%</div>
              </div>
              <span className="text-xs font-bold text-slate-300">
                {atsResult.ats_score >= 80 ? "🎯 Excellent Match" : "⚠️ Key Gaps Detected"}
              </span>
            </div>

            {/* 6-Factor Pillar Progress Bars */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Skills Match", val: atsResult.breakdown.skills_match },
                { label: "Experience Alignment", val: atsResult.breakdown.experience_match },
                { label: "Keywords Found", val: atsResult.breakdown.keywords_match },
                { label: "Projects Impact", val: atsResult.breakdown.projects_match },
                { label: "Certifications", val: atsResult.breakdown.certifications_match },
                { label: "Role Fit", val: atsResult.breakdown.job_role_match },
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{p.label}</span>
                    <span className="text-[#FF9900] font-mono">{p.val}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF9900] rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, Number(p.val) || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* MATCHING SKILLS VS MISSING SKILLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matching Skills */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-3">
              <h3 className="text-sm font-black text-emerald-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Matching Skills Found ({atsResult.matching_skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {atsResult.matching_skills.map((sk: any, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-3">
              <h3 className="text-sm font-black text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Missing Critical JD Skills ({atsResult.missing_skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {atsResult.missing_skills.map((sk: any, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* STAR BULLET REWRITER STUDIO */}
          {atsResult.bullet_suggestions && atsResult.bullet_suggestions.length > 0 && (
            <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-6">
              
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF9900]/10 text-[#FF9900] text-xs font-black w-fit">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>STAR METRIC BULLET REWRITER</span>
                </div>
                <h3 className="text-xl font-black text-[#232F3E] dark:text-white mt-1">
                  AI Enhanced STAR Bullet Points
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  We transformed weak resume bullets into high-impact STAR framework statements with quantifiable metrics.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {atsResult.bullet_suggestions.map((item: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                    
                    {/* Before */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">BEFORE (CURRENT BULLET)</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-through">
                        {item.current}
                      </p>
                    </div>

                    {/* After */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">AFTER (STAR METRICS ADDED)</span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                        {item.improved}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-[11px] font-medium text-slate-500 italic">
                        {item.rationale}
                      </span>
                      <button
                        onClick={() => setAcceptedBullets(prev => ({ ...prev, [idx]: true }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                          acceptedBullets[idx]
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#FF9900] hover:text-slate-950"
                        }`}
                      >
                        {acceptedBullets[idx] ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        <span>{acceptedBullets[idx] ? "Accepted" : "Accept Bullet"}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* FULL SCREEN ANIMATED AI PROCESSING MODAL OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-[#FF9900]/40 rounded-[32px] p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-6 text-center text-white relative overflow-hidden">
            
            {/* Glowing background aura */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#FF9900]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={`${progressPercent * 2.64} 264`}
                  strokeLinecap="round"
                  className="text-[#FF9900] transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-white">{progressPercent}%</span>
                <span className="text-[9px] font-bold text-[#FF9900] uppercase tracking-widest">ANALYZING</span>
              </div>
            </div>

            {/* Processing Info */}
            <div className="flex flex-col gap-1 z-10">
              <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9900] animate-pulse" />
                <span>AI ATS Engine Processing...</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Scanning document, benchmarking 6 ATS factors & rewriting STAR bullets.
              </p>
            </div>

            {/* Step-by-Step Progress Checklist */}
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
                        ? "bg-amber-950/60 border-[#FF9900] text-amber-200 ring-1 ring-[#FF9900]/30 shadow-md shadow-[#FF9900]/10"
                        : "bg-slate-800/40 border-slate-800 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isDone ? "bg-emerald-500 text-slate-950" : isCurrent ? "bg-[#FF9900] text-slate-950" : "bg-slate-800 text-slate-500"
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

    </div>
  );
}
