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
        <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Candidates", value: metrics.total_candidates, icon: Users, color: "text-[#FF9900]" },
    { label: "Cohort Pass Rate", value: `${metrics.overall_pass_rate}%`, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Average Score", value: `${metrics.average_score}%`, icon: TrendingUp, color: "text-amber-500" },
    { label: "Completed Sessions", value: metrics.interviews_completed, icon: Layers, color: "text-purple-500" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full py-2">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF9900] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-[#FF9900]" />
            <span>Admin Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Cohort Assessment & Skill Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time candidate readiness, stage pass rates, and knowledge gap heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsJDModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-[#FF9900]/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Blueprint from JD</span>
          </button>

          <button
            onClick={handleRetentionCleanup}
            disabled={isCleaning}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Purge recordings older than 90 days"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>{isCleaning ? "Purging..." : "90-Day Cleanup"}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{k.value}</span>
          </div>
        ))}
      </div>

      {/* Grid: Stage Pass Rate Analytics + Common Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Pass Rates */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Stage-by-Stage Pass Rates (80% Bar)</h2>
            <span className="text-[11px] font-mono font-bold text-[#FF9900]">Strict Gate Enforced</span>
          </div>

          <div className="flex flex-col gap-4">
            {metrics.stage_pass_rates.map((stg) => (
              <div key={stg.stage_number} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                    Stage {stg.stage_number}: {stg.stage_title}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">{stg.passed_attempts}/{stg.total_attempts} passed</span>
                    <span className={`font-bold ${stg.pass_rate_percentage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {stg.pass_rate_percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      stg.pass_rate_percentage >= 80 ? 'from-[#FF9900] to-emerald-500' : 'from-[#FF9900] to-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, stg.pass_rate_percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Common Knowledge Gaps Heatmap */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Top Cohort Knowledge Gaps</h2>
            <span className="text-[11px] font-mono font-bold text-rose-500">Needs Training</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {metrics.most_common_weak_topics.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{t.topic}</span>
                  <span className="text-[10px] font-mono text-slate-400">{t.category}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  {t.failure_frequency} misses
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Interviews & Candidate Review Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">Recent Assessment Attempts & Audits</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inspect spoken transcripts, video recordings, and apply administrative score overrides.</p>
          </div>
          <Link
            href="/admin/templates"
            className="text-xs text-[#FF9900] hover:underline font-mono font-bold"
          >
            Manage Templates →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                <th className="pb-3">Candidate</th>
                <th className="pb-3">Blueprint</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Decision</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {metrics.recent_interviews.map((item) => (
                <tr key={item.attempt_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{item.candidate_name}</div>
                    <div className="text-[11px] text-slate-400">{item.candidate_email}</div>
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{item.template_title}</td>
                  <td className="py-3 font-mono font-bold">
                    <span className={
                      (item.overall_score || 0) >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }>
                      {item.overall_score !== null ? `${item.overall_score}%` : "In Progress"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.decision === "PASS"
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-[#FF9900] border border-[#FF9900]/30'
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
                      className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-[#FF9900] border border-[#FF9900]/30 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
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
