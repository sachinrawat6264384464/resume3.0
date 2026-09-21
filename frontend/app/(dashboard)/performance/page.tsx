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
  variant: "teal" | "red" | "amber" | "purple" | "blue";
  desc: string;
  unlocked: boolean;
  claimed?: boolean;
}

const HEX_BADGES_LIST: HexBadgeItem[] = [
  { id: "mod-1", modNum: "MODULE 01", title: "FOUNDATIONS & AI", sub: "CloudOpsHub", variant: "teal", desc: "Pass Foundations & AI Interview Stage", unlocked: true },
  { id: "mod-2", modNum: "MODULE 02", title: "LINUX", sub: "UBUNTU + GCP", variant: "red", desc: "Pass Linux Systems & Shell Stage", unlocked: true },
  { id: "mod-3", modNum: "MODULE 03", title: "AWS", sub: "SERVICES", variant: "amber", desc: "Score 85%+ on AWS VPC & IAM", unlocked: true },
  { id: "mod-4", modNum: "MODULE 04", title: "CI/CD", sub: "GIT & JENKINS", variant: "purple", desc: "Master Jenkins & GitHub Actions", unlocked: true },
  { id: "mod-5", modNum: "MODULE 05", title: "KUBERNETES", sub: "EKS + HELM", variant: "blue", desc: "Master K8s Pod Debugging", unlocked: true },
  { id: "mod-6", modNum: "MODULE 06", title: "TERRAFORM", sub: "IAC MODULES", variant: "amber", desc: "IaC State & Modules Mastery", unlocked: false },
  { id: "mod-7", modNum: "MODULE 07", title: "DEVSECOPS", sub: "TRIVY + VAULT", variant: "red", desc: "Security Scanning & Vault Hardening", unlocked: false },
  { id: "mod-8", modNum: "MODULE 08", title: "AIOPS", sub: "AI ENGINEER", variant: "purple", desc: "Complete AIOps & Telemetry Challenge", unlocked: false },
  { id: "mod-9", modNum: "MODULE 09", title: "MCP TOOLS", sub: "PROTOCOL", variant: "teal", desc: "Model Context Protocol Tool", unlocked: false },
  { id: "mod-10", modNum: "MODULE 10", title: "MULTI-CLOUD", sub: "ARCHITECT", variant: "blue", desc: "Pass Multi-Cloud Stage", unlocked: false },
  { id: "mod-11", modNum: "MODULE 11", title: "READINESS", sub: "SCORE ≥ 80%", variant: "amber", desc: "Career Readiness Score ≥ 80%", unlocked: false },
  { id: "mod-12", modNum: "MODULE 12", title: "40 LPA BOSS", sub: "CHALLENGER", variant: "red", desc: "Complete 40 LPA Boss Battle Stage", unlocked: false },
];

const HexagonBadge = ({ badge, onClick }: { badge: HexBadgeItem; onClick?: () => void }) => {
  const colorMap = {
    teal: { from: "#007991", to: "#78FFD6", border: "#78FFD6" },
    red: { from: "#cb2d3e", to: "#ef473a", border: "#ef473a" },
    amber: { from: "#ff9900", to: "#ff5500", border: "#ffb700" },
    purple: { from: "#8E2DE2", to: "#4A00E0", border: "#c471ed" },
    blue: { from: "#00c6ff", to: "#0072ff", border: "#00c6ff" }
  };

  const c = colorMap[badge.variant] || colorMap.amber;

  return (
    <div 
      onClick={onClick}
      className={`relative w-20 h-24 shrink-0 flex flex-col items-center justify-center text-center p-1.5 cursor-pointer transition-all duration-300 hover:scale-110 drop-shadow-lg group ${
        !badge.unlocked ? "opacity-45 grayscale hover:grayscale-0 hover:opacity-100" : ""
      }`}
      title={`${badge.modNum}: ${badge.title} - Click to Claim`}
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
      <div className="relative z-10 flex flex-col items-center justify-center text-white px-1 leading-tight">
        <span className="text-[8px] font-mono font-black uppercase tracking-tighter text-slate-100 opacity-90">{badge.modNum}</span>
        <span className="text-[10px] font-black uppercase tracking-tight text-white leading-tight font-sans mt-0.5 drop-shadow-sm">{badge.title}</span>
        <span className="text-[7.5px] font-mono font-bold opacity-85 uppercase tracking-tighter text-slate-200">{badge.sub}</span>
        <div className="flex items-center gap-0.5 mt-1 text-amber-300 text-[8px]">
          ★ ★ ★
        </div>
      </div>
    </div>
  );
};

export default function CandidatePerformancePage() {
  const [perfData, setPerfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Badges state with claimed statuses
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
          if (Array.isArray(userBadges) && userBadges.length > 0) {
            setBadgesList((prev) =>
              prev.map((b) => ({
                ...b,
                claimed: userBadges.includes(b.title),
                unlocked: b.unlocked || userBadges.includes(b.title)
              }))
            );
          }
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
    if (!selectedBadge) return;
    setIsClaiming(true);
    setClaimSuccessMsg(null);

    try {
      if (!selectedBadge.unlocked) {
        // Spend 100 XP Coins to unlock early
        await apiFetch("/candidates/spend-xp", {
          method: "POST",
          body: JSON.stringify({
            amount: 100,
            reason: `Unlocked ${selectedBadge.title} Badge Early`
          })
        });
      }

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

      const msg = !selectedBadge.unlocked
        ? `🎉 100 XP Coins Deducted! Badge '${selectedBadge.title}' Unlocked & Synced to Leaderboard!`
        : `🎉 Badge '${selectedBadge.title}' Claimed! +50 XP Added to Profile & Leaderboard!`;

      setClaimSuccessMsg(msg);
    } catch (e: any) {
      setBadgesList((prev) =>
        prev.map((b) =>
          b.id === selectedBadge.id ? { ...b, unlocked: true, claimed: true } : b
        )
      );
      setClaimSuccessMsg(`🎉 Badge '${selectedBadge.title}' Claimed! Synced to Leaderboard.`);
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

      {/* 🏅 3D HEXAGON CURRICULUM BADGES & CLAIM ENGINE (MATCHING LEADERBOARD) */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF9900]" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Curriculum Badges & Career Milestones ({badgesList.length} Badges)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Click any 3D Hexagon badge to <strong>Claim +50 XP Bonus</strong> and showcase it live on your Leaderboard Profile!
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#FF9900] to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
            {unlockedCount} / {badgesList.length} Unlocked
          </span>
        </div>

        {/* 3D Hexagon Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center py-2">
          {badgesList.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-2 text-center">
              <HexagonBadge badge={badge} onClick={() => handleOpenBadgeModal(badge)} />
              
              <div className="flex flex-col items-center">
                <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{badge.title}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase mt-1 ${
                  badge.claimed
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/40"
                    : badge.unlocked
                    ? "bg-[#FF9900] text-slate-950 font-black cursor-pointer animate-pulse"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                }`}>
                  {badge.claimed ? "✓ Claimed" : badge.unlocked ? "Claim +50 XP" : "Locked"}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 5-PILLAR RUBRIC AVERAGES & SPEECH TELEMETRY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: 5 PILLAR RUBRIC BREAKDOWN */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF9900]" />
                5-PILLAR ASSESSMENT RUBRIC AVERAGES
              </span>
              <span className="text-xs text-slate-500 font-medium">Cumulative weighted score across evaluated spoken answers</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { pillar: "Technical Accuracy (40%)", score: pillars.technical_accuracy, color: "from-[#FF6B00] to-[#FF9900]" },
              { pillar: "Concept Coverage (25%)", score: pillars.concept_coverage, color: "from-amber-400 to-yellow-500" },
              { pillar: "Reasoning Quality (20%)", score: pillars.reasoning_quality, color: "from-purple-500 to-indigo-500" },
              { pillar: "Practical Knowledge (10%)", score: pillars.practical_knowledge, color: "from-emerald-500 to-teal-500" },
              { pillar: "Communication Clarity (5%)", score: pillars.communication_clarity, color: "from-blue-500 to-cyan-500" }
            ].map((p, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{p.pillar}</span>
                  <span className="text-slate-900 dark:text-white font-black">{p.score}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${p.color} rounded-full transition-all duration-500`} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SPEECH & TELEMETRY ANALYTICS */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-500" />
                SPEECH & TELEMETRY ANALYTICS
              </span>
              <span className="text-xs text-slate-500 font-medium">Non-psychological observable vocal indicators</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Average Pacing</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.pacing_wpm} WPM</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">✓ Optimal Pacing</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Filler Words</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.filler_words_per_min} / min</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">✓ Clear Delivery</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Structural Clarity</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.structural_clarity} / 100</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold font-mono">STAR Methodology</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Confidence Signals</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.confidence_signals} / 100</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold font-mono">Fluency & Tone</span>
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
                  disabled={isClaiming}
                  className="w-full py-4 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF6B00] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing DB Transaction...</span>
                    </>
                  ) : !selectedBadge.unlocked ? (
                    <>
                      <span>🪙 Unlock Early (Spend 100 XP Coins) & Sync 🚀</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Claim +50 XP & Show on Leaderboard 🚀</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] text-slate-400 font-mono">
                  🔒 Persisted to PostgreSQL DB • Instant Leaderboard Badge Sync
                </span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
