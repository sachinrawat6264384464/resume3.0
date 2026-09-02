"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Video, CheckCircle2, AlertTriangle, 
  ArrowLeft, Edit3, Save, X, Play, Loader2, BookOpen, Clock, FileText 
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminAttemptReviewPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Override Modal state
  const [overrideStageId, setOverrideStageId] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState("PASSED");
  const [overrideScore, setOverrideScore] = useState("85");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  const loadReport = async () => {
    try {
      const res = await apiFetch(`/reports/${attemptId}/admin`);
      setReport(res.data);
    } catch (e: any) {
      alert(e.message || "Failed to load audit report");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      loadReport();
    }
  }, [attemptId]);

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStageId || !overrideReason.trim()) return;

    setIsSubmittingOverride(true);
    try {
      await apiFetch(`/admin/stages/${overrideStageId}/override`, {
        method: "POST",
        body: JSON.stringify({
          new_status: overrideStatus,
          override_score: parseFloat(overrideScore) || 80.0,
          override_reason: overrideReason
        })
      });
      alert("Stage decision override applied successfully!");
      setOverrideStageId(null);
      loadReport();
    } catch (err: any) {
      alert(err.message || "Failed to apply override");
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  if (isLoading || !report) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const isPassed = report.decision === "PASS" || (report.overall_score || 0) >= 80;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full py-2">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Analytics</span>
        </Link>
        <span className="text-xs font-mono text-cyan-400">Attempt ID: {attemptId}</span>
      </div>

      {/* Hero Card */}
      <div className="p-6 rounded-3xl glass-panel-glow border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300">
              {report.target_role}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
              isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {report.decision || "IN_PROGRESS"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{report.candidate_name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{report.candidate_email} • Student ID: {report.student_id || "STU-2026"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center min-w-[140px]">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Candidate Score</span>
          <span className={`text-4xl font-black font-mono ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {report.overall_score}%
          </span>
        </div>
      </div>

      {/* Stage Breakdown and Override Actions */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-white">Stage Attempts & Administrative Overrides</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.stages?.map((stg: any) => (
            <div
              key={stg.stage_number}
              className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-indigo-300">
                    Stage {stg.stage_number}: {stg.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    stg.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {stg.status} ({stg.score}%)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{stg.questions_count} technical questions assessed.</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Min Bar: 80%</span>
                <button
                  onClick={() => {
                    setOverrideStageId(stg.stage_number.toString());
                    setOverrideScore(stg.score?.toString() || "85");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Manual Override</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Transcripts & Spoken Answer Logs */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Full Verbal Transcripts & AI Rubric Audit</h2>
          <span className="text-xs font-mono text-slate-400">{report.full_transcript_log?.length || 0} Questions</span>
        </div>

        <div className="flex flex-col gap-4">
          {report.full_transcript_log?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Stage {item.stage} • Q: &ldquo;{item.question}&rdquo;
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300">
                  Overall: {item.scores?.overall}%
                </span>
              </div>

              {/* Spoken transcript */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-slate-300 font-mono leading-relaxed">
                <strong className="text-cyan-400 block text-[10px] uppercase mb-1">Candidate Spoken Transcript:</strong>
                &ldquo;{item.transcript || "No verbal transcript recorded."}&rdquo;
              </div>

              {/* 5-pillar scores breakdown */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400 block text-[9px]">Tech Accuracy</span>
                  <span className="text-slate-200 font-bold">{item.scores?.technical}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400 block text-[9px]">Concept Coverage</span>
                  <span className="text-slate-200 font-bold">{item.scores?.concept}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400 block text-[9px]">Reasoning</span>
                  <span className="text-slate-200 font-bold">{item.scores?.reasoning}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400 block text-[9px]">Practical Depth</span>
                  <span className="text-slate-200 font-bold">{item.scores?.practical}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400 block text-[9px]">Communication</span>
                  <span className="text-slate-200 font-bold">{item.scores?.communication}%</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <span className="text-slate-400 block text-[9px]">Confidence</span>
                  <span className="text-slate-200 font-bold">{item.scores?.confidence}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Override Modal */}
      {overrideStageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel-glow border border-white/10 flex flex-col gap-4 relative">
            <button
              onClick={() => setOverrideStageId(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4" />
                <span>Administrative Override</span>
              </div>
              <h3 className="text-lg font-bold text-white">Override Stage Decision</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manually adjust stage score, pass/fail status, and unlock subsequent stages.</p>
            </div>

            <form onSubmit={handleApplyOverride} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Stage Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs bg-slate-900"
                >
                  <option value="PASSED">PASSED (Unlock Next Stage)</option>
                  <option value="FAILED">FAILED (Keep Next Stage Locked)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Adjusted Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Override Audit Reason</label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why this manual score override is being granted for the compliance audit log..."
                  className="w-full p-2.5 rounded-xl glass-input text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideStageId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride || !overrideReason.trim()}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmittingOverride ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Apply Override</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
