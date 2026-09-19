"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Play, CheckCircle2, Lock, Sparkles, Trophy, Clock, 
  ArrowRight, ShieldCheck, Cpu, Mic, FileText, ChevronRight,
  Flame, Award, AlertCircle, RefreshCw, Loader2, Star, Zap, Crown
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const ALL_30_STAGES = [
  // LEVEL 1 — FOUNDATION
  { id: 0, level: "Level 1", levelName: "Foundation", title: "Setup Your Interview Profile", xp: "+100 XP", duration: "10 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Configure your target role, salary band, and initial baseline skills profile." },
  { id: 1, level: "Level 1", levelName: "Foundation", title: "Self Introduction", xp: "+150 XP", duration: "12 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Master your 60-second pitch, STAR background intro, and career story." },
  { id: 2, level: "Level 1", levelName: "Foundation", title: "Technical Introduction", xp: "+200 XP", duration: "15 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Explain your daily technical workflow, tool stack, and architecture experience." },
  { id: 3, level: "Level 1", levelName: "Foundation", title: "Linux for Cloud Engineers", xp: "+250 XP", duration: "18 Mins", questions: 2, questions_count: 2, icon: "🐧", diff: "Medium", desc: "Process signals, memory triage, top/htop/iotop, and bash scripting." },
  { id: 4, level: "Level 1", levelName: "Foundation", title: "Linux for DevOps Engineers", xp: "+300 XP", duration: "20 Mins", questions: 2, questions_count: 2, icon: "🐧", diff: "Medium", desc: "Systemd service units, kernel tuning, disk I/O bottlenecks, and cron automation." },
  { id: 5, level: "Level 1", levelName: "Foundation", title: "Cloud + DevOps Fundamentals", xp: "+350 XP", duration: "20 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Core cloud models, virtualization vs containerization, and IaC basics." },

  // LEVEL 2 — CLOUD
  { id: 6, level: "Level 2", levelName: "Cloud", title: "AWS Cloud Engineer", xp: "+400 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "VPC networking, subnets, NAT Gateways, IAM policies, and S3 lifecycle." },
  { id: 7, level: "Level 2", levelName: "Cloud", title: "GCP Cloud Engineer", xp: "+450 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Google Cloud IAM, VPC Service Controls, GKE basics, and BigQuery Ops." },
  { id: 8, level: "Level 2", levelName: "Cloud", title: "Azure Cloud Engineer", xp: "+450 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Azure VNets, Entra ID, Virtual Machine Scale Sets, and Resource Groups." },
  { id: 9, level: "Level 2", levelName: "Cloud", title: "Multi-Cloud Architecture", xp: "+500 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "⚡", diff: "Hard", desc: "Inter-cloud VPN peering, multi-cloud IAM federation, and cost optimization." },
  { id: 10, level: "Level 2", levelName: "Cloud", title: "Cloud Real-Time Scenarios", xp: "+550 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "🔥", diff: "Hard", desc: "Cross-region failover, DNS failover with Route53, and storage outage triage." },

  // LEVEL 3 — DEVOPS
  { id: 11, level: "Level 3", levelName: "DevOps", title: "Git + GitHub Workflow", xp: "+600 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "🚀", diff: "Medium", desc: "Git rebase vs merge, git bisect, branch protection rules, and merge conflicts." },
  { id: 12, level: "Level 3", levelName: "DevOps", title: "Jenkins + CI/CD Pipelines", xp: "+650 XP", duration: "28 Mins", questions: 2, questions_count: 2, icon: "🚀", diff: "Hard", desc: "Multibranch Jenkinsfiles, shared libraries, matrix builds, and caching." },
  { id: 13, level: "Level 3", levelName: "DevOps", title: "Docker Containerization", xp: "+700 XP", duration: "28 Mins", questions: 2, questions_count: 2, icon: "📦", diff: "Hard", desc: "Multi-stage Dockerfiles, image minimization, cgroups, and container networking." },
  { id: 14, level: "Level 3", levelName: "DevOps", title: "Kubernetes Orchestration", xp: "+800 XP", duration: "30 Mins", questions: 2, questions_count: 2, icon: "☸️", diff: "Hard", desc: "Pods, Deployments, StatefulSets, Ingress Controllers, HPA, and CrashLoopBackOff." },
  { id: 15, level: "Level 3", levelName: "DevOps", title: "Ansible + Terraform IaC", xp: "+850 XP", duration: "30 Mins", questions: 2, questions_count: 2, icon: "🛠️", diff: "Hard", desc: "Remote state locking, Terraform modules, drift detection, and Ansible playbooks." },

  // LEVEL 4 — ADVANCED DEVOPS
  { id: 16, level: "Level 4", levelName: "Advanced DevOps", title: "End-to-End CI/CD Project", xp: "+900 XP", duration: "32 Mins", questions: 2, questions_count: 2, icon: "🌐", diff: "Boss", desc: "Production GitHub Actions pipeline to EKS with ArgoCD GitOps sync." },
  { id: 17, level: "Level 4", levelName: "Advanced DevOps", title: "Production Troubleshooting", xp: "+1,000 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🚨", diff: "Boss", desc: "Live memory leak triage, high CPU load debugging, and 502 bad gateway fix." },
  { id: 18, level: "Level 4", levelName: "Advanced DevOps", title: "DevSecOps & Hardening", xp: "+1,100 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🛡️", diff: "Boss", desc: "Container image scanning (Trivy), SAST/DAST, and HashiCorp Vault integration." },
  { id: 19, level: "Level 4", levelName: "Advanced DevOps", title: "Real-Time DevOps Architecture", xp: "+1,200 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🏗️", diff: "Boss", desc: "High-throughput microservices architecture with zero-downtime rolling updates." },
  { id: 20, level: "Level 4", levelName: "Advanced DevOps", title: "Final DevOps Mock Interview", xp: "+1,500 XP", duration: "40 Mins", questions: 2, questions_count: 2, icon: "🎓", diff: "Boss", desc: "Full-spectrum senior panel simulation covering all 4 level pillars." },

  // 10 BONUS AI & ADVANCED CHALLENGES
  { id: 21, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 01: AIOps Challenge", xp: "+1,600 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "AI anomaly detection in Prometheus metrics and automated log clustering." },
  { id: 22, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 02: MLOps Challenge", xp: "+1,700 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "ML model serving infrastructure, Kubeflow pipelines, and feature stores." },
  { id: 23, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 03: AI Integration Challenge", xp: "+1,800 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "LLM API gateway rate limiting, streaming responses, and vector DB ops." },
  { id: 24, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 04: AI + DevOps Automation", xp: "+1,900 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "⚡", diff: "Extreme", desc: "AI-driven self-healing infrastructure scripts and automated PR remediation." },
  { id: 25, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 05: AI MCP Challenge", xp: "+2,000 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔌", diff: "Extreme", desc: "Model Context Protocol tools integration for infrastructure management." },
  { id: 26, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 06: Azure DevOps Project", xp: "+2,100 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔷", diff: "Extreme", desc: "Azure Pipelines YAML, Artifacts, and Azure Kubernetes Service (AKS)." },
  { id: 27, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 07: Project-Based CI/CD", xp: "+2,200 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🏗️", diff: "Extreme", desc: "Canary deployments, blue-green traffic shifting using Flagger and Istio." },
  { id: 28, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 08: Advanced DevSecOps Project", xp: "+2,300 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔐", diff: "Extreme", desc: "OPA Gatekeeper policies, Kyverno admission controllers, and PCI-DSS compliance." },
  { id: 29, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 09: Multi-Cloud + AI Architecture", xp: "+2,500 XP", duration: "35 Mins", questions: 1, questions_count: 1, icon: "🌐", diff: "Extreme", desc: "Global latency routing across AWS, GCP, and Azure with AI failover." },
  { id: 30, level: "Bonus", levelName: "Bonus Challenge", title: "👑 40 LPA Final Boss Interview Battle", xp: "+3,000 XP", duration: "45 Mins", questions: 2, questions_count: 2, icon: "👑", diff: "Legendary", desc: "The ultimate 40 LPA Staff CloudOps Engineer Boss Battle! Prove your absolute mastery." }
];

export default function InterviewsPage() {
  const router = useRouter();
  const [stages, setStages] = useState<any[]>(ALL_30_STAGES);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<any | null>(ALL_30_STAGES[0]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const [resDbStages, resMetrics] = await Promise.all([
          apiFetch("/interviews/stages"),
          apiFetch("/candidates/me/dashboard-metrics")
        ]);

        const dbStageMap = new Map();
        if (resDbStages?.data && Array.isArray(resDbStages.data)) {
          resDbStages.data.forEach((s: any) => dbStageMap.set(s.id, s));
        }

        const attemptMap = new Map();
        if (resMetrics?.data?.stages_progress && Array.isArray(resMetrics.data.stages_progress)) {
          resMetrics.data.stages_progress.forEach((stg: any) => attemptMap.set(stg.id, stg));
        }

        const merged = ALL_30_STAGES.map((stg) => {
          const dbStg = dbStageMap.get(stg.id);
          const att = attemptMap.get(stg.id);
          const qCount = dbStg?.questions_count !== undefined ? dbStg.questions_count : stg.questions;
          return {
            ...stg,
            stage_db_id: dbStg?.stage_id,
            title: dbStg?.title || stg.title,
            desc: dbStg?.description || stg.desc,
            category: dbStg?.category || stg.levelName || "Foundation",
            diff: dbStg?.difficulty || stg.diff,
            xp: dbStg?.xp_reward || stg.xp,
            duration: dbStg?.duration || stg.duration,
            icon: dbStg?.icon || stg.icon,
            questions: qCount,
            questions_count: qCount,
            status: att ? att.status : (stg.id <= 1 ? "in_progress" : "locked"),
            score: att ? att.score : (stg.id <= 1 ? "Active" : "--")
          };
        });


        setStages(merged);
        setSelectedStage((prev: any) => {
          if (!prev) return merged[0];
          const match = merged.find((m) => m.id === prev.id);
          return match || merged[0];
        });
      } catch (e) {
        console.warn("Interview stages fetch error:", e);
      }
    };
    fetchStages();
  }, []);

  const filteredStages = stages.filter((stg) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "LEVEL1") return stg.level === "Level 1";
    if (activeTab === "LEVEL2") return stg.level === "Level 2";
    if (activeTab === "LEVEL3") return stg.level === "Level 3";
    if (activeTab === "LEVEL4") return stg.level === "Level 4";
    if (activeTab === "BONUS") return stg.level === "Bonus";
    return true;
  });

  const handleStartStage = async (stageId: number) => {
    setIsStarting(true);
    try {
      const res = await apiFetch("/attempts/start", {
        method: "POST",
        body: JSON.stringify({
          interview_template_id: `stage-${stageId}-template`
        })
      });
      if (res?.data?.id) {
        router.push(`/interviews/${res.data.id}/pre-check`);
      } else {
        router.push(`/interviews/${stageId}/pre-check`);
      }
    } catch (e) {
      router.push(`/interviews/${stageId}/pre-check`);
    } finally {
      setIsStarting(false);
    }
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;

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
            <span>20 CORE STAGES + 10 BONUS AI CHALLENGES</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            MOCK INTERVIEW <span className="text-[#FF6B00]">CHALLENGE JOURNEY</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-white">"Learn Today. Implement Today. Build Your Career for a Lifetime."</strong><br />
            Progress from Level 1 Foundation to Level 4 Advanced DevOps, then unlock 10 Bonus AI Challenges ending with the 👑 <span className="text-[#FF6B00] font-black">40 LPA Final Boss Battle</span>.
          </p>
        </div>

        {/* Unlocked Counter Pill */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">UNLOCKED STAGES</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {completedCount + 1} <span className="text-slate-400 text-sm font-bold">/ 30</span>
            </span>
          </div>
        </div>

      </div>

      {/* AGENCY FILTER PILLS */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "ALL", label: "All 30 Stages" },
          { key: "LEVEL1", label: "Level 1: Foundation (0-5)" },
          { key: "LEVEL2", label: "Level 2: Cloud (6-10)" },
          { key: "LEVEL3", label: "Level 3: DevOps (11-15)" },
          { key: "LEVEL4", label: "Level 4: Advanced (16-20)" },
          { key: "BONUS", label: "🤖 10 Bonus AI Challenges" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/30 scale-105"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 hover:border-[#FF6B00]/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 30-STAGE PIPELINE GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: STAGE LIST */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 max-h-[550px] sm:max-h-[650px] lg:max-h-[750px] overflow-y-auto pr-1 sm:pr-2">
          
          {filteredStages.map((s) => {
            const isSelected = selectedStage?.id === s.id;
            const isCompleted = s.status === "completed";
            const isInProgress = s.status === "in_progress";
            const isLocked = s.status === "locked";
            const isBoss = s.id === 30 || s.diff === "Boss" || s.diff === "Legendary";

            return (
              <div
                key={s.id}
                onClick={() => setSelectedStage(s)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 shrink-0 ${
                  isSelected
                    ? "bg-white dark:bg-slate-900 border-[#FF6B00] shadow-xl shadow-[#FF6B00]/15 ring-2 ring-[#FF6B00]/20"
                    : isCompleted
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500"
                    : isInProgress
                    ? "bg-amber-50/60 dark:bg-amber-950/30 border-[#FF6B00]"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Active selection accent bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF6B00] rounded-l-2xl" />
                )}

                <div className="flex items-center gap-3.5 min-w-0 pl-1">
                  <div className={`w-11 h-11 rounded-xl font-black text-base flex items-center justify-center shrink-0 transition-transform ${
                    isBoss
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : isInProgress
                      ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30 scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span>{s.icon}</span>}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/30 uppercase">
                        STAGE {s.id} • {s.levelName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300/60 dark:border-amber-700/60">
                        {s.xp}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate mt-1 tracking-tight">
                      {s.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCompleted && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                      {s.score}
                    </span>
                  )}
                  {isInProgress && (
                    <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-[#FF6B00] text-[#FF6B00] text-xs font-black animate-pulse">
                      Active
                    </span>
                  )}
                  {isLocked && (
                    <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        {/* RIGHT: SELECTED STAGE DETAILS & LAUNCH SIMULATOR CARD */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          
          {selectedStage && (
            <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col justify-between gap-6">
              
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">{selectedStage.icon}</span>
                    <span>CHALLENGE IDENTITY</span>
                  </span>
                  <span className="text-xs font-mono font-black text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    STAGE {selectedStage.id}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest">
                    {selectedStage.levelName}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {selectedStage.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedStage.desc}
                </p>

                {/* Stage Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 py-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" /> DIFFICULTY
                    </span>
                    <span className="text-xs font-black text-[#FF6B00]">{selectedStage.diff}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-emerald-500" /> XP REWARD
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedStage.xp}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" /> EST. DURATION
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {selectedStage.duration}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mic className="w-3 h-3 text-purple-500" /> SCENARIOS
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {selectedStage.questions_count ?? selectedStage.questions} Questions
                    </span>
                  </div>
                </div>

                {/* STAR Tip Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800/60 dark:to-slate-900/60 border border-[#FF6B00]/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div className="flex flex-col text-xs">
                    <span className="font-black text-slate-900 dark:text-white">STAR Pitch Formula + 3-Level Hints</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Practice with Teleprompter or AI hints before evaluating.
                    </span>
                  </div>
                </div>

              </div>

              {/* Launch Action Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => handleStartStage(selectedStage.id)}
                  disabled={isStarting}
                  className="w-full py-4 rounded-2xl font-black text-xs text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-lg shadow-[#FF6B00]/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Launching Interview Room...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Launch Stage {selectedStage.id} Interview Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
