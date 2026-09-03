"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Play, CheckCircle2, Lock, Sparkles, Trophy, Clock, 
  ArrowRight, ShieldCheck, Cpu, Mic, FileText, ChevronRight,
  Flame, Award, AlertCircle, RefreshCw, Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const DEFAULT_5_STAGES = [
  { id: 1, name: "Profile & Career Pitch", score: "0%", status: "in_progress" },
  { id: 2, name: "Linux Systems Warrior", score: "--", status: "locked" },
  { id: 3, name: "Multi-Cloud Architecture", score: "--", status: "locked" },
  { id: 4, name: "DevOps & Containers", score: "--", status: "locked" },
  { id: 5, name: "Production Incident Boss Battle", score: "--", status: "locked" }
];

export default function InterviewsPage() {
  const router = useRouter();
  const [stages, setStages] = useState<any[]>(DEFAULT_5_STAGES);
  const [selectedStage, setSelectedStage] = useState<any | null>(DEFAULT_5_STAGES[0]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await apiFetch("/candidates/me/dashboard-metrics");
        if (res?.data?.stages_progress && res.data.stages_progress.length > 0) {
          setStages(res.data.stages_progress);
          setSelectedStage(res.data.stages_progress[0]);
        }
      } catch (e) {
        console.warn("Interview stages fetch error:", e);
      }
    };
    fetchStages();
  }, []);

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
        router.push(`/interviews/stage-${stageId}/pre-check`);
      }
    } catch (e) {
      router.push(`/interviews/stage-${stageId}/pre-check`);
    } finally {
      setIsStarting(false);
    }
  };

  const stageDetails = [
    {
      id: 1,
      xp: "+150 XP",
      gate: "Stage 1 Gate",
      passing: "80%+ Threshold (Min 8/10 Correct)",
      duration: "13 Mins",
      questions: 10,
      topics: ["Career Pitch", "Terraform & AWS", "Linux System Triage", "Kubernetes Security"],
      description: "Demonstrate your background, CloudOps engineering pitch, and core AWS/DevOps technical concepts in 13 minutes."
    },
    {
      id: 2,
      xp: "+250 XP",
      gate: "Stage 2 Gate",
      passing: "80% Threshold",
      duration: "20 Mins",
      questions: 5,
      topics: ["Linux Heap Debugging", "Shell Scripting", "Systemd Services", "Process Signals"],
      description: "Troubleshoot production Linux memory leaks, kernel panic logs, systemd service crashes, and bash scripting."
    },
    {
      id: 3,
      xp: "+400 XP",
      gate: "Stage 3 Gate",
      passing: "80% Threshold",
      duration: "25 Mins",
      questions: 5,
      topics: ["AWS VPC Peering", "IAM & IRSA", "Multi-Region Failover", "Cloud Cost FinOps"],
      description: "Architect secure multi-account AWS cloud network, IAM security boundaries, and high-availability disaster recovery."
    },
    {
      id: 4,
      xp: "+600 XP",
      gate: "Stage 4 Gate",
      passing: "80% Threshold",
      duration: "30 Mins",
      questions: 6,
      topics: ["Kubernetes EKS", "CrashLoopBackOff", "Docker Multi-stage", "Terraform HCL"],
      description: "Resolve OOMKilled Kubernetes pod crashes, Helm chart deployments, and Terraform HCL state lock conflicts."
    },
    {
      id: 5,
      xp: "+1,000 XP",
      gate: "Final Boss Gate",
      passing: "80% Threshold",
      duration: "35 Mins",
      questions: 6,
      topics: ["Live Outage Triage", "Prometheus Metrics", "Grafana Alerting", "Executive Brief"],
      description: "Senior SRE Incident Boss Battle: Triage live simulated production cloud outage under high pressure."
    }
  ];

  return (
    <div className="max-w-[1350px] mx-auto flex flex-col gap-8 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white border border-[#FF9900]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>5-STAGE GATEKEEPER ASSESSMENT PIPELINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Voice AI Interview <span className="text-[#FF9900]">Stage Progression</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Each stage evaluates your spoken technical responses against real-world CloudOps incident benchmarks. Score <span className="text-[#FF9900] font-bold">80%+</span> to unlock the next level and earn verified badges.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shrink-0 z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900]">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-400">UNLOCKED STAGES</span>
            <span className="text-xl font-black text-white">
              {stages.filter(s => s.status === "completed").length + 1} / 5 Stages
            </span>
          </div>
        </div>

      </div>

      {/* 5-STAGE PIPELINE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: 5 CONNECTED STAGE STEPPER PIPELINE */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Assessment Stages</span>
            <span className="text-xs font-mono font-bold text-[#FF9900]">Sequential 80%+ Rule</span>
          </div>

          <div className="flex flex-col gap-3 relative">
            
            {stages.map((s, idx) => {
              const detail = stageDetails[idx] || stageDetails[0];
              const isSelected = selectedStage?.id === s.id;
              const isCompleted = s.status === "completed";
              const isInProgress = s.status === "in_progress";
              const isLocked = s.status === "locked";

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedStage(s)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-3 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-[#FF9900] shadow-xl shadow-[#FF9900]/10 ring-2 ring-[#FF9900]/20"
                      : isCompleted
                      ? "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      : isInProgress
                      ? "bg-white dark:bg-slate-900 border-blue-400 hover:border-[#FF9900]"
                      : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    
                    <div className="flex items-center gap-3.5">
                      {/* Stage Number Icon */}
                      <div className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-transform ${
                        isCompleted
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : isInProgress
                          ? "bg-[#FF9900] text-slate-950 shadow-md shadow-[#FF9900]/20 scale-105"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `0${s.id}`}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#FF9900] uppercase">
                            Stage {s.id} • {detail.gate}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            {detail.xp}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">{s.name}</h3>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 text-xs font-bold">
                          <span>Passed {s.score}</span>
                        </div>
                      )}

                      {isInProgress && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 text-xs font-bold animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Active (Attempt Now)</span>
                        </div>
                      )}

                      {isLocked && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Locked</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

          </div>

        </div>

        {/* RIGHT: SELECTED STAGE DETAILS & LAUNCH SIMULATOR CARD */}
        <div className="lg:col-span-5 sticky top-24">
          
          {selectedStage && (
            <div className="p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between gap-6">
              
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">STAGE DETAILED AUDIT</span>
                  <span className="text-xs font-mono font-bold text-slate-500">STAGE 0{selectedStage.id}</span>
                </div>

                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                  {selectedStage.name}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {stageDetails[selectedStage.id - 1]?.description}
                </p>

                {/* Stage Metrics */}
                <div className="grid grid-cols-2 gap-2 py-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">PASSING GATE</span>
                    <span className="text-xs font-black text-[#FF9900]">80%+ Threshold</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">XP REWARD</span>
                    <span className="text-xs font-black text-emerald-600 font-mono">
                      {stageDetails[selectedStage.id - 1]?.xp}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">EST. DURATION</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {stageDetails[selectedStage.id - 1]?.duration}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">SCENARIO QUESTIONS</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                      {stageDetails[selectedStage.id - 1]?.questions} Scenarios
                    </span>
                  </div>
                </div>

                {/* Tested Skill Topics */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Skill Domains Evaluated:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {stageDetails[selectedStage.id - 1]?.topics.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#232F3E] dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Launch Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                {selectedStage.status === "completed" ? (
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                      <span>Stage Passed! Score: {selectedStage.score}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <Link
                      href={`/interviews/stage-${selectedStage.id}`}
                      className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center gap-2 transition-all text-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-attempt Stage for Higher Score</span>
                    </Link>
                  </div>
                ) : selectedStage.status === "in_progress" ? (
                  <button
                    onClick={() => handleStartStage(selectedStage.id)}
                    disabled={isStarting}
                    className="w-full py-4 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-[#FF9900]/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Launching Camera & Mic Room...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Start Stage {selectedStage.id} Voice AI Interview</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
                      <Lock className="w-4 h-4" />
                      <span>Stage {selectedStage.id} Locked</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Complete Stage {selectedStage.id - 1} with an 80%+ score to unlock this gate.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
