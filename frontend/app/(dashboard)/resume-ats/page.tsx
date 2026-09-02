"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, 
  ArrowRight, Download, RefreshCw, Check, X, Edit3, 
  Briefcase, Award, Zap, ShieldCheck, Flame, ChevronRight, Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ResumeATSResponse, BulletImprovementItem } from "@/types";

const SAMPLE_DEVOPS_RESUME = `Rahul Sharma
rahul.sharma@example.com | +91 98765 43210 | Bengaluru, India
LinkedIn: linkedin.com/in/rahul-devops | GitHub: github.com/rahul-cloud

SUMMARY
DevOps & Cloud Engineer with 4 years of experience specializing in AWS, Docker, Kubernetes, and Terraform. Proven track record in automating deployment pipelines and maintaining infrastructure uptime.

SKILLS
Cloud: AWS (VPC, IAM, EC2, S3, RDS, CloudWatch, EKS)
DevOps: Docker, Kubernetes, Helm, Terraform, Jenkins, GitHub Actions
Monitoring: Prometheus, Grafana
OS & Scripting: Linux (Ubuntu/RHEL), Bash, Python

EXPERIENCE
CloudTech Solutions — DevOps Engineer (2022 - Present)
- Managed AWS infrastructure and deployed application updates across multiple environments.
- Worked on Jenkins CI/CD pipelines to build and deploy Docker containers.
- Handled Kubernetes pod troubleshooting and cluster monitoring using Prometheus.
- Created Terraform scripts for provisioning VPCs and EC2 instances.

PROJECTS
Multi-Cloud Microservices Platform
- Containerized a 5-tier microservice application using Docker and deployed on AWS EKS.
- Configured Grafana dashboards for cluster resource alerting.

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate
- Certified Kubernetes Administrator (CKA)`;

const PRESET_JDS = [
  {
    title: "Senior DevOps Engineer (₹18–25 LPA)",
    desc: "Seeking Senior DevOps Engineer with deep expertise in AWS, Kubernetes (EKS), Terraform IaC, GitHub Actions, DevSecOps (Trivy), and high-availability architecture."
  },
  {
    title: "Cloud Infrastructure Architect (₹25–40 LPA)",
    desc: "Looking for a Principal/Lead Cloud Architect to design multi-cloud infrastructure (AWS/GCP), zero-trust security, Kubernetes service meshes (Istio), and FinOps cost governance."
  },
  {
    title: "Site Reliability Engineer (SRE) (₹15–22 LPA)",
    desc: "Looking for an SRE to manage 99.99% SLOs, Prometheus/Grafana alerting, Linux kernel triage, and automated incident response runbooks."
  }
];

export default function ResumeATSPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState(SAMPLE_DEVOPS_RESUME);
  const [jobTitle, setJobTitle] = useState(PRESET_JDS[0].title);
  const [jobDescription, setJobDescription] = useState(PRESET_JDS[0].desc);
  
  const [isLoading, setIsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<ResumeATSResponse | null>(null);
  const [acceptedBullets, setAcceptedBullets] = useState<Record<number, boolean>>({});

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("job_title", jobTitle);
        formData.append("job_description", jobDescription);

        // Native fetch for multipart
        const token = localStorage.getItem("auth_token");
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const raw = await fetch("http://localhost:8000/api/v1/resumes/parse-and-match", {
          method: "POST",
          headers,
          body: formData
        });
        res = await raw.json();
      } else {
        res = await apiFetch("/resumes/parse-text", {
          method: "POST",
          body: JSON.stringify({
            resume_text: resumeText,
            job_title: jobTitle,
            job_description: jobDescription
          })
        });
      }

      if (res.data) {
        setAtsResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || "Failed to analyze resume.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAcceptBullet = (idx: number) => {
    setAcceptedBullets((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleExportResume = () => {
    if (!atsResult) return;
    let exportContent = `# ${atsResult.candidate_profile.candidate_name}\n\n`;
    exportContent += `**Role**: ${atsResult.candidate_profile.current_designation}\n`;
    exportContent += `**Email**: ${atsResult.candidate_profile.email || "N/A"} | **Phone**: ${atsResult.candidate_profile.phone || "N/A"}\n\n`;
    exportContent += `### Professional Summary\n${atsResult.candidate_profile.summary}\n\n`;
    exportContent += `### Core Skills & Tools\n${atsResult.candidate_profile.primary_skills.join(", ")}, ${atsResult.candidate_profile.devops_tools.join(", ")}\n\n`;
    exportContent += `### High-Impact Experience\n`;
    
    atsResult.bullet_suggestions.forEach((b, idx) => {
      const textToUse = acceptedBullets[idx] ? b.improved : b.current;
      exportContent += `- ${textToUse}\n`;
    });

    const blob = new Blob([exportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${atsResult.candidate_profile.candidate_name.replace(/\s+/g, "_")}_Improved_Resume.md`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-cyan-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AI Resume ATS Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">Multi-Cloud & DevOps Edition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Review & Improve Your Resume
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Benchmark your resume against target Job Descriptions. Uncover ATS score bottlenecks, generate metrics-driven STAR bullet points, and bridge gaps with recommended mock challenges.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Input Stage (Upload & JD Selector) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Resume Upload / Text Area */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              1. Your Resume (PDF / DOCX or Text)
            </h2>
            <button
              onClick={() => setResumeText(SAMPLE_DEVOPS_RESUME)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
            >
              Load Sample Resume
            </button>
          </div>

          {/* File Drag-and-Drop */}
          <div className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col items-center justify-center gap-2 bg-slate-950/40 transition-colors">
            <Upload className="w-6 h-6 text-slate-400" />
            <div className="text-xs text-slate-300">
              {selectedFile ? (
                <span className="text-cyan-300 font-mono font-medium">{selectedFile.name}</span>
              ) : (
                <span>Drag & drop PDF / DOCX or click to browse</span>
              )}
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-mono">Or paste resume text below:</label>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste plain text resume here..."
              className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>
        </div>

        {/* Step 2: Target Job Description */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                2. Target Job Role & Description
              </h2>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-mono">Select a Target Benchmark Role:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_JDS.map((preset) => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      setJobTitle(preset.title);
                      setJobDescription(preset.desc);
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs font-mono transition-all border ${
                      jobTitle === preset.title
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                        : "bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5"
                    }`}
                  >
                    {preset.title.split(" (")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-mono">Job Description:</label>
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description..."
                className="w-full rounded-xl bg-slate-950/70 border border-white/10 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing ATS Match & Generating Rewrites...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Run AI ATS Benchmark Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {atsResult && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          {/* Top Score Card & Breakdown */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Main Score Circular Badge */}
            <div className="flex flex-col items-center text-center gap-2 min-w-[200px]">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Overall ATS Match</span>
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[3px] shadow-xl shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white font-mono">{Math.round(atsResult.ats_score)}%</span>
                  <span className="text-[10px] text-cyan-300 font-mono uppercase">ATS Compatible</span>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-300">
                {atsResult.ats_score >= 80 ? "🔥 Excellent Fit" : "⚠️ Needs Improvement"}
              </span>
            </div>

            {/* 6 Dimension Breakdown */}
            <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Skills Match", val: atsResult.breakdown.skills_match, color: "bg-cyan-400" },
                { label: "Experience Match", val: atsResult.breakdown.experience_match, color: "bg-indigo-400" },
                { label: "Keywords Match", val: atsResult.breakdown.keywords_match, color: "bg-purple-400" },
                { label: "Projects Match", val: atsResult.breakdown.projects_match, color: "bg-emerald-400" },
                { label: "Certifications", val: atsResult.breakdown.certifications_match, color: "bg-amber-400" },
                { label: "Role Trajectory", val: atsResult.breakdown.job_role_match, color: "bg-blue-400" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">{item.label}</span>
                    <span className="font-bold text-white font-mono">{item.val}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Match Matrix & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                You Already Have ({atsResult.matching_skills.length} matching skills)
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {atsResult.matching_skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                You Should Improve / Add ({atsResult.missing_skills.length} missing skills)
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {atsResult.missing_skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bullet Improvement Engine (Accept / Edit / Reject) */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Resume Improvement Studio (STAR Method)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Replace passive responsibility statements with quantified, high-impact accomplishments.
                </p>
              </div>

              <button
                onClick={handleExportResume}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-colors self-start"
              >
                <Download className="w-4 h-4" />
                Download Improved Resume
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {atsResult.bullet_suggestions.map((bullet, idx) => {
                const isAccepted = acceptedBullets[idx];
                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${
                      isAccepted
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-slate-950/70 border-white/5"
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Current Bullet */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-mono uppercase text-slate-500">Current Resume Bullet:</span>
                        <p className="text-xs text-slate-400 italic">"{bullet.current}"</p>
                      </div>

                      {/* AI Suggestion */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase text-cyan-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Improved (STAR Framework):
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {bullet.skills_highlighted.join(" • ")}
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          value={bullet.improved}
                          onChange={(e) => {
                            const newText = e.target.value;
                            setAtsResult((prev) => {
                              if (!prev) return prev;
                              const updated = [...prev.bullet_suggestions];
                              updated[idx] = { ...updated[idx], improved: newText };
                              return { ...prev, bullet_suggestions: updated };
                            });
                          }}
                          className="w-full rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed"
                        />

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {bullet.impact_metrics_added.map((m, mIdx) => (
                            <span key={mIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              ⭐ {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Copy, Tone Options, Accept */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">AI Tone:</span>
                        {["More Metrics", "More Technical", "Shorter"].map((tone) => (
                          <button
                            key={tone}
                            onClick={async () => {
                              try {
                                const res = await apiFetch("/resumes/improve-bullet", {
                                  method: "POST",
                                  body: JSON.stringify({
                                    bullet_text: bullet.current,
                                    target_role: jobTitle,
                                    skills_focus: bullet.skills_highlighted
                                  })
                                });
                                if (res.data) {
                                  setAtsResult((prev) => {
                                    if (!prev) return prev;
                                    const updated = [...prev.bullet_suggestions];
                                    updated[idx] = {
                                      ...updated[idx],
                                      improved: res.data.improved,
                                      impact_metrics_added: res.data.impact_metrics_added
                                    };
                                    return { ...prev, bullet_suggestions: updated };
                                  });
                                }
                              } catch (e: any) {
                                alert("Failed to regenerate bullet: " + e.message);
                              }
                            }}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/5 text-[10px] font-mono text-slate-300 transition-colors"
                          >
                            ↻ {tone}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bullet.improved);
                            alert("Copied improved bullet to clipboard!");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-white/10 transition-colors"
                        >
                          📋 Copy
                        </button>

                        <button
                          onClick={() => toggleAcceptBullet(idx)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                            isAccepted
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isAccepted ? "Accepted" : "Accept Suggestion"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Interview Journey Bridge */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Step 2 Connect
                </span>
                <span className="text-xs text-slate-400 font-mono">Personalized Interview Challenge</span>
              </div>
              <h3 className="text-xl font-bold text-white">Ready to bridge your {atsResult.missing_skills.length} missing skill gaps?</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                We've mapped your exact resume gaps directly into our 5-stage interview challenge sequence. Practice with voice AI to level up.
              </p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all shrink-0"
            >
              <span>Start Recommended Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
