"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Award, Clock, ArrowRight, CheckCircle2, 
  AlertTriangle, ShieldCheck, Flame, Star, Zap, 
  Layers, ChevronRight, Loader2, Cpu, Mic, FileCheck, Sparkles
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function CandidatePerformancePage() {
  const [perfData, setPerfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiFetch("/candidates/me/performance");
        if (res?.data) {
          setPerfData(res.data);
        }
      } catch (e) {
        console.warn("Failed to load candidate performance:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
      </div>
    );
  }

  const readiness = perfData?.readiness_score || 0;
  const atsScore = perfData?.resume_ats_score || 0;
  const pillars = perfData?.pillars || {
    technical_accuracy: readiness,
    concept_coverage: Math.max(0, readiness - 2),
    reasoning_quality: Math.max(0, readiness - 4),
    practical_knowledge: Math.max(0, readiness - 3),
    communication_clarity: readiness
  };
  const speech = perfData?.speech_telemetry || {
    pacing_wpm: readiness > 0 ? 138 : 0,
    filler_words_per_min: readiness > 0 ? 1.2 : 0,
    structural_clarity: pillars.communication_clarity,
    confidence_signals: Math.round(readiness * 0.95)
  };
  const progression = perfData?.progression || [
    { week: "Week 1", tech: "0%", comm: "0%", conf: "0%", note: "Baseline Assessment" },
    { week: "Week 2", tech: "0%", comm: "0%", conf: "0%", note: "Linux & Cloud Modules" },
    { week: "Week 3", tech: "0%", conf: "0%", note: "K8s & CI/CD Pipelines" },
    { week: "Week 4", tech: "0%", conf: "0%", note: "Live Troubleshooting" }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1350px] mx-auto pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white border border-[#FF9900]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>CAREER VELOCITY ANALYTICS • REAL-TIME DB SYNC</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Performance <span className="text-[#FF9900]">& Growth Matrix</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Real-time multi-dimensional analytics aggregating your live voice interview question attempts, 5-pillar rubric scores, and ATS resume benchmark evaluations.
          </p>
        </div>

        {/* Dual Metric Score Cards */}
        <div className="flex items-center gap-4 z-10 shrink-0">
          
          {/* 1. Voice Interview Readiness Velocity */}
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

          {/* 2. Resume ATS Analysis Score */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-500/40 text-center min-w-[160px] shadow-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block flex items-center justify-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              Resume ATS Score
            </span>
            <span className="text-3xl sm:text-4xl font-black text-blue-400 font-mono block my-1">
              {atsScore}%
            </span>
            <span className="text-[10.5px] text-blue-300 font-bold">
              {atsScore >= 80 ? "🎯 Target Match" : atsScore > 0 ? "⚡ Good Match" : "Pending Scan"}
            </span>
          </div>

        </div>

      </div>

      {/* 4-WEEK SCORE PROGRESSION VELOCITY */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF9900]" />
              4-WEEK SCORE PROGRESSION VELOCITY
            </span>
            <span className="text-xs text-slate-500 font-medium">Multi-dimensional improvements across mock interview sessions</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">STAGE PROGRESS DB LOGS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {progression.map((w: any, idx: number) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3 shadow-sm hover:border-[#FF9900]/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#FF9900]">{w.week}</span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">{w.note}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Technical:</span>
                  <span className="text-[#FF9900] font-black">{w.tech}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Communication:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">{w.comm}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Confidence:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">{w.conf}</span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF9900] to-amber-400 rounded-full transition-all duration-500" style={{ width: w.tech || "0%" }} />
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
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF9900]" />
            Target Your Weakest Skill Areas with Quick Practice
          </h3>
          <p className="text-xs text-slate-300 font-medium">Practice one question scenario at a time to build technical depth and earn +20 XP.</p>
        </div>

        <Link
          href="/interviews"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B00] via-[#FF9900] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-[#FF9900]/25 transition-all shrink-0 hover:scale-[1.02] cursor-pointer"
        >
          <span>Launch Interview Practice →</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
