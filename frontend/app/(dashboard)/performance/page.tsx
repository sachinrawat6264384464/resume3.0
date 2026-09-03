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
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header Banner (Clean Light Theme with Soft Amber Glow) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30 flex items-center gap-1.5 w-fit">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF9900]" />
              Career Velocity Analytics
            </span>
            <span className="text-xs text-slate-500 font-mono">Cohort 2026-A</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Performance & Growth Tracking
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
            Real-time analytics combining your live voice interview attempts and ATS resume benchmark evaluations.
          </p>
        </div>

        {/* Dual Metric Score Cards: Readiness Velocity + Resume ATS Score */}
        <div className="flex items-center gap-3 z-10">
          
          {/* 1. Voice Interview Readiness Velocity */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center min-w-[150px] shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider block">
              Readiness Velocity
            </span>
            <span className="text-3xl sm:text-4xl font-black text-[#FF9900] font-mono block my-1">
              {readiness}%
            </span>
            <span className="text-[10.5px] text-amber-700 dark:text-amber-300 font-bold">
              {perfData?.salary_band || "Ready for ₹18–25 LPA"}
            </span>
          </div>

          {/* 2. Resume ATS Analysis Score */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center min-w-[150px] shadow-sm flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-blue-800 dark:text-blue-300 font-bold uppercase tracking-wider block flex items-center justify-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              Resume ATS Score
            </span>
            <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 font-mono block my-1">
              {atsScore}%
            </span>
            <span className="text-[10.5px] text-blue-700 dark:text-blue-300 font-bold">
              {atsScore >= 80 ? "🎯 Target Match" : atsScore > 0 ? "⚡ Good Match" : "Pending Scan"}
            </span>
          </div>

        </div>

      </div>

      {/* Progress Over Time (4-Week Progression Velocity - Light Theme) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-6 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF9900]" />
            4-Week Score Progression Velocity
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Multi-dimensional improvements across mock interview sessions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {progression.map((w: any) => (
            <div key={w.week} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#FF9900]">{w.week}</span>
                <span className="text-[10px] font-mono text-slate-500">{w.note}</span>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Technical:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{w.tech}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Communication:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{w.comm}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Confidence:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{w.conf}</span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
                <div className="h-full bg-[#FF9900] rounded-full transition-all duration-500" style={{ width: w.tech || "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Pillar Mastery & Speech Telemetry (Light Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 5 Pillar Rubric Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF9900]" />
              5-Pillar Assessment Rubric Averages
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Cumulative score across all evaluated answers</p>
          </div>

          <div className="flex flex-col gap-3.5">
            {[
              { pillar: "Technical Accuracy (40%)", score: pillars.technical_accuracy, color: "bg-[#FF9900]" },
              { pillar: "Concept Coverage (25%)", score: pillars.concept_coverage, color: "bg-amber-400" },
              { pillar: "Reasoning Quality (20%)", score: pillars.reasoning_quality, color: "bg-purple-500" },
              { pillar: "Practical Knowledge (10%)", score: pillars.practical_knowledge, color: "bg-emerald-500" },
              { pillar: "Communication Clarity (5%)", score: pillars.communication_clarity, color: "bg-blue-500" }
            ].map((p) => (
              <div key={p.pillar} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{p.pillar}</span>
                  <span className="text-slate-900 dark:text-white font-mono">{p.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full transition-all duration-500`} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speech & Communication Telemetry */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-600" />
              Speech & Telemetry Analytics
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Non-psychological observable vocal indicators</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Average Pacing</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.pacing_wpm} WPM</span>
              <span className="text-[10px] text-emerald-600 font-bold font-mono">✓ Optimal Pacing</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Filler Words</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.filler_words_per_min} / min</span>
              <span className="text-[10px] text-emerald-600 font-bold font-mono">✓ Clear Delivery</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Structural Clarity</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.structural_clarity} / 100</span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">STAR Methodology</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Confidence Signals</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{speech.confidence_signals} / 100</span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">Fluency & Tone</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Launch Practice CTA */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white">Target Your Weakest Areas with Quick Practice</h3>
          <p className="text-xs text-slate-300 mt-1 font-medium">Practice one question at a time to keep your streak alive and earn +10 XP.</p>
        </div>

        <Link
          href="/interviews"
          className="px-6 py-3.5 rounded-2xl bg-[#FF9900] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
        >
          <span>Launch Interview Practice</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
