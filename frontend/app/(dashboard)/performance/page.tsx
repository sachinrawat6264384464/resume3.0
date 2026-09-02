"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Award, Clock, ArrowRight, CheckCircle2, 
  AlertTriangle, ShieldCheck, Flame, Star, Zap, 
  Layers, ChevronRight, Loader2, Cpu, Mic
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Candidate, InterviewAttempt } from "@/types";

export default function CandidatePerformancePage() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cRes = await apiFetch("/candidates");
        if (cRes.items && cRes.items.length > 0) {
          setCandidate(cRes.items[0]);
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
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const readiness = candidate?.readiness_score || 84;
  const xp = candidate?.xp || 3450;
  const level = candidate?.level || 4;
  const streak = candidate?.streak_days || 12;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16">
      {/* Performance Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Career Velocity Analytics
            </span>
            <span className="text-xs text-slate-400 font-mono">Cohort 2026-A</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Performance & Growth Tracking
          </h1>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            🚀 You improved your technical accuracy score by <strong className="text-emerald-300">+32%</strong> over the last 4 weeks. Keep practicing to unlock the 40 LPA Final Boss challenge.
          </p>
        </div>

        {/* Growth Metric Badge */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-center md:text-right min-w-[180px] z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Readiness Velocity</span>
          <span className="text-4xl font-black text-emerald-400 font-mono block my-1">84%</span>
          <span className="text-[11px] text-emerald-300 font-mono">Ready for ₹18–25 LPA</span>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Progress Over Time (Week 1 to Week 4) */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            4-Week Score Progression Velocity
          </h2>
          <p className="text-xs text-slate-400 mt-1">Multi-dimensional improvements across mock interview sessions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { week: "Week 1", tech: "52%", comm: "61%", conf: "48%", note: "Baseline Assessment" },
            { week: "Week 2", tech: "64%", comm: "68%", conf: "58%", note: "Linux & Cloud Modules" },
            { week: "Week 3", tech: "76%", comm: "74%", conf: "68%", note: "K8s & CI/CD Pipelines" },
            { week: "Week 4", tech: "84%", comm: "81%", conf: "78%", note: "Live Troubleshooting" },
          ].map((w, idx) => (
            <div key={w.week} className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-300">{w.week}</span>
                <span className="text-[10px] font-mono text-slate-500">{w.note}</span>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Technical:</span>
                  <span className="text-cyan-300 font-bold">{w.tech}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Communication:</span>
                  <span className="text-indigo-300 font-bold">{w.comm}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-emerald-300 font-bold">{w.conf}</span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: w.tech }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Pillar Mastery & Speech Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5 Pillar Rubric Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              5-Pillar Assessment Rubric Averages
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cumulative score across all evaluated answers</p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { pillar: "Technical Accuracy (40%)", score: 85, color: "bg-cyan-400" },
              { pillar: "Concept Coverage (25%)", score: 82, color: "bg-indigo-400" },
              { pillar: "Reasoning Quality (20%)", score: 79, color: "bg-purple-400" },
              { pillar: "Practical Knowledge (10%)", score: 88, color: "bg-emerald-400" },
              { pillar: "Communication Clarity (5%)", score: 81, color: "bg-amber-400" }
            ].map((p) => (
              <div key={p.pillar} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{p.pillar}</span>
                  <span className="text-white font-bold">{p.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speech & Communication Telemetry */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              Speech & Telemetry Analytics
            </h3>
            <p className="text-xs text-slate-400 mt-1">Non-psychological observable vocal indicators</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Average Pacing</span>
              <span className="text-2xl font-bold text-cyan-400 font-mono">138 WPM</span>
              <span className="text-[10px] text-emerald-300 font-mono">✓ Optimal (130-160 WPM)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Filler Words</span>
              <span className="text-2xl font-bold text-indigo-400 font-mono">1.2 / min</span>
              <span className="text-[10px] text-emerald-300 font-mono">✓ 65% reduction</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Structural Clarity</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">82 / 100</span>
              <span className="text-[10px] text-slate-400 font-mono">STAR Methodology</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Confidence Signals</span>
              <span className="text-2xl font-bold text-amber-400 font-mono">78 / 100</span>
              <span className="text-[10px] text-slate-400 font-mono">Fluency & Tone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launch Practice CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white">Target Your Weakest Areas with Quick Practice</h3>
          <p className="text-xs text-slate-300 mt-1">Practice one question at a time to keep your streak alive and earn +10 XP.</p>
        </div>

        <Link
          href="/practice"
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all shrink-0"
        >
          <span>Launch Quick Practice</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
