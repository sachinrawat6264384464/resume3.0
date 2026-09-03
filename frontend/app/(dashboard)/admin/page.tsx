"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, CheckCircle2, TrendingUp, AlertTriangle, 
  Trash2, Plus, Terminal, Eye, Layers, Loader2, Sparkles, Shield
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AdminDashboardMetrics } from "@/types";
import { JDParserModal } from "@/components/admin/JDParserModal";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);

  const loadAnalytics = async () => {
    try {
      const res = await apiFetch("/admin/analytics/overview");
      setMetrics(res.data);
    } catch (e) {
      console.warn("Failed to load admin analytics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRetentionCleanup = async () => {
    if (!confirm("Run 90-day recording retention cleanup? This will permanently purge recordings older than 90 days.")) return;
    setIsCleaning(true);
    try {
      const res = await apiFetch("/admin/recordings/trigger-cleanup", { method: "POST" });
      alert(`Retention cleanup complete: ${res.data.purged_count} expired recordings purged (${(res.data.freed_bytes / 1024 / 1024).toFixed(2)} MB freed).`);
    } catch (err: any) {
      alert(err.message || "Retention cleanup failed");
    } finally {
      setIsCleaning(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Candidates", value: metrics.total_candidates, icon: Users, color: "text-indigo-400" },
    { label: "Cohort Pass Rate", value: `${metrics.overall_pass_rate}%`, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Average Score", value: `${metrics.average_score}%`, icon: TrendingUp, color: "text-cyan-400" },
    { label: "Completed Sessions", value: metrics.interviews_completed, icon: Layers, color: "text-purple-400" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full w-full py-2">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Admin Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cohort Assessment & Skill Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time candidate readiness, stage pass rates, and knowledge gap heatmaps.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsJDModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Blueprint from JD</span>
          </button>

          <button
            onClick={handleRetentionCleanup}
            disabled={isCleaning}
            className="px-3.5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-xs text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
            title="Purge recordings older than 90 days"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{isCleaning ? "Purging..." : "90-Day Cleanup"}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <div key={idx} className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Grid: Stage Pass Rate Analytics + Common Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Pass Rates */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Stage-by-Stage Pass Rates (80% Bar)</h2>
            <span className="text-[11px] font-mono text-slate-400">Strict Gate Enforced</span>
          </div>

          <div className="flex flex-col gap-4">
            {metrics.stage_pass_rates.map((stg) => (
              <div key={stg.stage_number} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 truncate max-w-xs">
                    Stage {stg.stage_number}: {stg.stage_title}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">{stg.passed_attempts}/{stg.total_attempts} passed</span>
                    <span className={`font-bold ${stg.pass_rate_percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {stg.pass_rate_percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      stg.pass_rate_percentage >= 80 ? 'from-indigo-500 to-emerald-400' : 'from-indigo-500 to-amber-400'
                    }`}
                    style={{ width: `${Math.min(100, stg.pass_rate_percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Common Knowledge Gaps Heatmap */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Cohort Knowledge Gaps</h2>
            <span className="text-[11px] font-mono text-rose-400">Needs Training</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {metrics.most_common_weak_topics.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-white block">{t.topic}</span>
                  <span className="text-[10px] font-mono text-slate-400">{t.category}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {t.failure_frequency} misses
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Interviews & Candidate Review Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Assessment Attempts & Audits</h2>
            <p className="text-xs text-slate-400">Inspect spoken transcripts, video recordings, and apply administrative score overrides.</p>
          </div>
          <Link
            href="/admin/templates"
            className="text-xs text-cyan-400 hover:underline font-mono"
          >
            Manage Templates →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Blueprint</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Decision</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {metrics.recent_interviews.map((item) => (
                <tr key={item.attempt_id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-white">{item.candidate_name}</div>
                    <div className="text-[11px] text-slate-400">{item.candidate_email}</div>
                  </td>
                  <td className="py-3 text-slate-300">{item.template_title}</td>
                  <td className="py-3 font-mono font-bold">
                    <span className={
                      (item.overall_score || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                    }>
                      {item.overall_score !== null ? `${item.overall_score}%` : "In Progress"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      item.decision === "PASS"
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.decision || item.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/reviews/${item.attempt_id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Audit Review</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JD Ingestion Modal */}
      <JDParserModal
        isOpen={isJDModalOpen}
        onClose={() => setIsJDModalOpen(false)}
        onSuccess={() => {
          loadAnalytics();
          alert("Interview blueprint successfully generated from Job Description!");
        }}
      />
    </div>
  );
}
