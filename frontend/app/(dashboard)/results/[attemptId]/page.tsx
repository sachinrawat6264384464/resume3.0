"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, CheckCircle2, AlertTriangle, BookOpen, 
  Calendar, Award, ArrowLeft, Download, Share2, 
  Sparkles, Loader2, Layers, Cpu 
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ScoreRadarChart } from "@/components/reports/ScoreRadarChart";
import { LearningRoadmap } from "@/components/reports/LearningRoadmap";
import { CandidateReport } from "@/types";

export default function CandidateResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [report, setReport] = useState<CandidateReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await apiFetch(`/reports/${attemptId}/candidate`);
        setReport(res.data);
      } catch (err: any) {
        alert(err.message || "Failed to load candidate report");
      } finally {
        setIsLoading(false);
      }
    }

    if (attemptId) {
      loadReport();
    }
  }, [attemptId]);

  if (isLoading || !report) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isPassed = report.decision === "PASS" || report.overall_score >= 80;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-4">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Hub</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-xl glass-panel hover:bg-white/10 text-xs text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Assessment PDF</span>
        </button>
      </div>

      {/* Hero Performance Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-indigo-500/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
              isPassed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {isPassed ? "ASSESSMENT PASSED (≥ 80%)" : "NEEDS IMPROVEMENT (< 80%)"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(report.interview_date).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {report.candidate_name} • {report.target_role}
          </h1>

          <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
            {report.executive_summary}
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-center min-w-[160px] z-10">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Overall Score</span>
          <span className={`text-5xl font-black font-mono block my-1 ${
            isPassed ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {report.overall_score}%
          </span>
          <span className="text-[10px] font-mono text-cyan-400">
            {isPassed ? "Ready for Production" : "Study Recommended"}
          </span>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 5-Pillar Score Cards */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">5-Pillar Technical & Verbal Breakdown</h2>
        <ScoreRadarChart report={report} />
      </div>

      {/* Strengths & Knowledge Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="flex flex-col gap-2">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Growth Areas</span>
          </div>
          <ul className="flex flex-col gap-2">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Knowledge Gaps */}
        <div className="p-5 rounded-2xl glass-panel border border-rose-500/20 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <Cpu className="w-4 h-4" />
            <span>Identified Concept Gaps</span>
          </div>
          <ul className="flex flex-col gap-2">
            {report.critical_knowledge_gaps.map((gap, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stage Breakdown Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
        <h3 className="text-base font-semibold text-white">Stage-by-Stage Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono">
                <th className="pb-3">Stage</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Questions</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report.stages.map((stg) => (
                <tr key={stg.stage_number} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium text-white">Stage {stg.stage_number}: {stg.title}</td>
                  <td className="py-3 text-slate-400">{stg.category}</td>
                  <td className="py-3 font-mono text-slate-300">{stg.questions_count} questions</td>
                  <td className="py-3 font-mono font-bold">
                    <span className={stg.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                      {stg.score}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      stg.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {stg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30-Day Personalized Improvement Roadmap */}
      <LearningRoadmap plan={report.thirty_day_plan} />
    </div>
  );
}
