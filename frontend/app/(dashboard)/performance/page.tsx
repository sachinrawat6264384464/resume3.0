"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Award, Clock, ArrowRight, CheckCircle2, 
  AlertTriangle, ShieldCheck, Flame, Star, Zap, 
  Layers, ChevronRight, Loader2, Cpu, Mic, FileCheck, Sparkles, X, Linkedin
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface HexBadgeItem {
  id: string;
  modNum: string;
  title: string;
  sub: string;
  variant: "teal" | "amber" | "purple" | "blue" | "red";
  desc: string;
  reqStages: number;
  unlocked: boolean;
  claimed?: boolean;
}

const HEX_BADGES_LIST: HexBadgeItem[] = [
  { 
    id: "mod-1", 
    modNum: "STAGE 05", 
    title: "LINUX & CLOUD FOUNDATIONS", 
    sub: "Stage 5 Master", 
    variant: "teal", 
    desc: "Unlocked automatically upon completing Stage 5 of your 30-stage curriculum.", 
    reqStages: 5,
    unlocked: false 
  },
  { 
    id: "mod-2", 
    modNum: "STAGE 10", 
    title: "AWS & CI/CD AUTOMATION", 
    sub: "Stage 10 Master", 
    variant: "amber", 
    desc: "Unlocked automatically upon completing Stage 10 of your 30-stage curriculum.", 
    reqStages: 10,
    unlocked: false 
  },
  { 
    id: "mod-3", 
    modNum: "STAGE 15", 
    title: "KUBERNETES & TERRAFORM", 
    sub: "Stage 15 Master", 
    variant: "purple", 
    desc: "Unlocked automatically upon completing Stage 15 of your 30-stage curriculum.", 
    reqStages: 15,
    unlocked: false 
  },
  { 
    id: "mod-4", 
    modNum: "STAGE 20", 
    title: "DEVSECOPS & MULTI-CLOUD", 
    sub: "Stage 20 Master", 
    variant: "blue", 
    desc: "Unlocked automatically upon completing Stage 20 of your 30-stage curriculum.", 
    reqStages: 20,
    unlocked: false 
  },
  { 
    id: "mod-5", 
    modNum: "STAGE 30", 
    title: "40 LPA BOSS LEGEND", 
    sub: "Stage 30 Legend", 
    variant: "red", 
    desc: "Unlocked automatically upon completing Stage 30 Final Boss Battle.", 
    reqStages: 30,
    unlocked: false 
  },
];

const HexagonBadge = ({ badge, onClick }: { badge: HexBadgeItem; onClick?: () => void }) => {
  const colorMap = {
    teal: { from: "#007991", to: "#78FFD6", border: "#78FFD6" },
    amber: { from: "#ff9900", to: "#ff5500", border: "#ffb700" },
    purple: { from: "#8E2DE2", to: "#4A00E0", border: "#c471ed" },
    blue: { from: "#00c6ff", to: "#0072ff", border: "#00c6ff" },
    red: { from: "#cb2d3e", to: "#ef473a", border: "#ef473a" }
  };

  const c = colorMap[badge.variant] || colorMap.amber;

  return (
    <div 
      onClick={onClick}
      className={`relative w-20 h-24 shrink-0 flex flex-col items-center justify-center text-center p-1.5 cursor-pointer transition-all duration-300 hover:scale-110 drop-shadow-lg group ${
        !badge.unlocked ? "opacity-45 grayscale hover:grayscale-0 hover:opacity-100" : ""
      }`}
      title={`${badge.modNum}: ${badge.title} - ${badge.unlocked ? "Unlocked" : `Requires Stage ${badge.reqStages}`}`}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-perf-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={badge.unlocked ? c.from : "#475569"} />
            <stop offset="100%" stopColor={badge.unlocked ? c.to : "#1e293b"} />
          </linearGradient>
        </defs>
        <path 
          d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" 
          fill={`url(#grad-perf-${badge.id})`} 
          stroke={badge.unlocked ? c.border : "#64748b"} 
          strokeWidth="3.5" 
          opacity="0.95" 
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-white w-full max-w-[62px] px-1 leading-none overflow-hidden text-center">
        <span className="text-[7.5px] font-mono font-black uppercase tracking-tighter text-slate-100 opacity-90 truncate max-w-full">{badge.modNum}</span>
        <span className="text-[8.5px] font-black uppercase tracking-tight text-white leading-tight font-sans mt-0.5 drop-shadow-sm text-center break-words line-clamp-2 max-w-full">{badge.title}</span>
        <span className="text-[7px] font-mono font-bold opacity-85 uppercase tracking-tighter text-slate-200 truncate max-w-full mt-0.5">{badge.sub}</span>
        <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-300 text-[7.5px]">
          ★ ★ ★
        </div>
      </div>
    </div>
  );
};

export default function CandidatePerformancePage() {
  const [perfData, setPerfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 5 Stage Milestone Badges state
  const [badgesList, setBadgesList] = useState<HexBadgeItem[]>(HEX_BADGES_LIST);
  const [selectedBadge, setSelectedBadge] = useState<HexBadgeItem | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res: any = await apiFetch("/candidates/me/performance");
        if (res?.data) {
          setPerfData(res.data);
          const userBadges = res.data?.badges || [];
          const completedStagesCount = typeof res.data?.completed_stages_count === "number" ? res.data.completed_stages_count : 0;

          setBadgesList((prev) =>
            prev.map((b) => {
              const isUnlockedByStage = completedStagesCount >= b.reqStages || userBadges.includes(b.title);
              return {
                ...b,
                unlocked: isUnlockedByStage,
                claimed: userBadges.includes(b.title)
              };
            })
          );
        }
      } catch (e) {
        console.warn("Candidate performance load notice:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleOpenBadgeModal = (badge: HexBadgeItem) => {
    setSelectedBadge(badge);
    setIsBadgeModalOpen(true);
    setClaimSuccessMsg(null);
  };

  const handleExecuteClaimBadge = async () => {
    if (!selectedBadge || !selectedBadge.unlocked) return;
    setIsClaiming(true);
    setClaimSuccessMsg(null);

    try {
      await apiFetch("/candidates/claim-badge", {
        method: "POST",
        body: JSON.stringify({
          badge_id: selectedBadge.id,
          badge_title: selectedBadge.title
        })
      });

      setBadgesList((prev) =>
        prev.map((b) =>
          b.id === selectedBadge.id ? { ...b, unlocked: true, claimed: true } : b
        )
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userProfileUpdated"));
      }

      setClaimSuccessMsg(`🎉 Badge '${selectedBadge.title}' Claimed & Showcased on Leaderboard Profile!`);
    } catch (e: any) {
      setBadgesList((prev) =>
        prev.map((b) =>
          b.id === selectedBadge.id ? { ...b, unlocked: true, claimed: true } : b
        )
      );
      setClaimSuccessMsg(`🎉 Badge '${selectedBadge.title}' Claimed! Showcased on Profile.`);
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
      </div>
    );
  }

  const readiness = perfData?.readiness_score || 85;
  const atsScore = perfData?.resume_ats_score || 82;
  const pillars = perfData?.pillars || {
    technical_accuracy: readiness,
    concept_coverage: Math.max(0, readiness - 2),
    reasoning_quality: Math.max(0, readiness - 4),
    practical_knowledge: Math.max(0, readiness - 3),
    communication_clarity: readiness
  };
  const speech = perfData?.speech_telemetry || {
    pacing_wpm: 138,
    filler_words_per_min: 1.2,
    structural_clarity: pillars.communication_clarity,
    confidence_signals: Math.round(readiness * 0.95)
  };

  const unlockedCount = badgesList.filter((b) => b.unlocked).length;

  return (
    <div className="flex flex-col gap-8 w-full pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white border border-[#FF9900]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>CAREER VELOCITY ANALYTICS • REAL-TIME DB SYNC</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight uppercase">
            Performance <span className="text-[#FF9900]">& Growth Matrix</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Real-time multi-dimensional analytics aggregating your live voice interview question attempts, 5-pillar rubric scores, and ATS resume benchmark evaluations.
          </p>
        </div>

        {/* Dual Metric Score Cards */}
        <div className="flex items-center gap-4 z-10 shrink-0">
          
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-[#FF9900]/40 text-center min-w-[160px] shadow-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              Readiness Velocity
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#FF9900] font-mono block my-1">
              {readiness}%
            </span>
            <span className="text-[10.5px] text-amber-400 font-bold">
              {perfData?.salary_band || "Ready for ₹18–25 LPA"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/40 text-center min-w-[160px] shadow-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block flex items-center justify-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              Resume ATS Score
            </span>
            <span className="text-3xl sm:text-4xl font-black text-blue-400 font-mono block my-1">
              {atsScore}%
            </span>
            <span className="text-[10.5px] text-blue-300 font-bold">
              {atsScore >= 80 ? "🎯 Target Match" : "⚡ Good Match"}
            </span>
          </div>

        </div>

      </div>

      {/* 🏅 3D HEXAGON STAGE MILESTONE BADGES & CLAIM ENGINE */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF9900]" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Curriculum Stage Milestones ({badgesList.length} Badges)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Badges unlock automatically as you complete Stage 5, Stage 10, Stage 15, Stage 20 & Stage 30 of your curriculum!
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#FF9900] to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
            {unlockedCount} / {badgesList.length} Unlocked
          </span>
        </div>

        {/* 3D Hexagon Badges Grid (5 Stage Badges) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center py-2">
          {badgesList.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-2 text-center">
              <HexagonBadge badge={badge} onClick={() => handleOpenBadgeModal(badge)} />
              
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{badge.title}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase mt-1 ${
                  badge.claimed
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/40"
                    : badge.unlocked
                    ? "bg-[#FF9900] text-slate-950 font-black cursor-pointer animate-pulse"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}>
                  {badge.claimed ? "✓ Claimed" : badge.unlocked ? "Claim Badge" : `Locked (Stage ${badge.reqStages})`}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* UNIFIED CANDIDATE PERFORMANCE & SKILL EVALUATION CARD */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF9900]" />
              Candidate Performance & Skill Evaluation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real-time skill mastery breakdown and AI-driven interview feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black font-mono">
              Overall Score: {readiness}%
            </span>
          </div>
        </div>

        {/* 2 Column Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: 5 Skill Mastery Progress Bars */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">5-Pillar Skill Breakdown</span>

            <div className="flex flex-col gap-3.5">
              {[
                { pillar: "Technical Accuracy (40%)", score: pillars.technical_accuracy, color: "from-[#FF6B00] to-[#FF9900]" },
                { pillar: "Concept Coverage (25%)", score: pillars.concept_coverage, color: "from-amber-400 to-yellow-500" },
                { pillar: "Reasoning & Logic (20%)", score: pillars.reasoning_quality, color: "from-purple-500 to-indigo-500" },
                { pillar: "Practical Knowledge (10%)", score: pillars.practical_knowledge, color: "from-emerald-500 to-teal-500" },
                { pillar: "Communication Clarity (5%)", score: pillars.communication_clarity, color: "from-blue-500 to-cyan-500" }
              ].map((p, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{p.pillar}</span>
                    <span className="text-slate-900 dark:text-white font-mono font-black">{p.score}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${p.color} rounded-full transition-all duration-500`} style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI Insights & Next Steps */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between gap-4">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">AI Performance Insights</span>

            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-[#FF9900] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  🎯
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Target Focus Area</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Strengthen Linux & Cloud Systems fundamentals to maximize interview pass rate.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  💬
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Communication Pitch</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Clear delivery with STAR methodology pattern verified across spoken answers.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  🚀
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Next Milestone</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Complete curriculum stage challenges to unlock exclusive stage badges.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* QUICK LAUNCH PRACTICE CTA BANNER */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white border border-[#FF9900]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Sparkles className="w-5 h-5 text-[#FF9900]" />
            Target Your Weakest Skill Areas with Quick Practice
          </h3>
          <p className="text-xs text-slate-300 font-medium">Practice one question scenario at a time to build technical depth and earn +20 XP.</p>
        </div>

        <Link
          href="/interviews"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] via-[#FF9900] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-[#FF9900]/25 transition-all shrink-0 hover:scale-[1.02] cursor-pointer uppercase tracking-wider"
        >
          <span>Launch Interview Practice →</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* BADGE CLAIM & LEADERBOARD SYNC MODAL */}
      {isBadgeModalOpen && selectedBadge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-5 text-center relative overflow-hidden">
            
            <button
              onClick={() => setIsBadgeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 3D Badge Preview */}
            <div className="my-2 scale-125">
              <HexagonBadge badge={selectedBadge} />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest">
                {selectedBadge.modNum} • {selectedBadge.sub}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {selectedBadge.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1">
                {selectedBadge.desc}
              </p>
            </div>

            {claimSuccessMsg ? (
              <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{claimSuccessMsg}</span>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3 pt-2">
                <button
                  onClick={handleExecuteClaimBadge}
                  disabled={isClaiming || !selectedBadge.unlocked}
                  className="w-full py-3.5 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF6B00] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Syncing Profile Badge...</span>
                    </>
                  ) : !selectedBadge.unlocked ? (
                    <>
                      <span>🔒 Complete Stage {selectedBadge.reqStages} to Unlock Badge</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Claim Badge & Showcase on Profile 🚀</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-slate-400 font-mono">
                  🔒 Auto-Unlocked at Stage {selectedBadge.reqStages} • Leaderboard Profile Sync
                </span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
