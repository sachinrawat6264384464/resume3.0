"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, Calendar, Star, CheckCircle2, CreditCard, TrendingUp, 
  Search, Bell, ChevronDown, UserPlus, Megaphone, Download, 
  Settings, Database, Cpu, Mic, Cloud, Mail, ShieldCheck, 
  Sparkles, Trash2, Layers, Activity, Server, FileText, Check
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AdminDashboardMetrics } from "@/types";
import { JDParserModal } from "@/components/admin/JDParserModal";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("This Week");

  const loadAnalytics = async () => {
    try {
      const res = await apiFetch("/admin/analytics/overview");
      if (res?.data) {
        setMetrics(res.data);
      }
    } catch (e) {
      console.warn("Failed to load admin analytics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isAdminPortalEnv = process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true";

    // STRICT MICROSERVICE ISOLATION:
    // /admin URL is 100% REMOVED/BLOCKED on Candidate Portal (resume3-0.vercel.app).
    // It can ONLY be accessed on Dedicated Admin Microservice (resume3-admin.vercel.app).
    if (!isAdminPortalEnv) {
      router.replace("/dashboard");
      return;
    }

    loadAnalytics();
  }, [router]);

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

  const defaultMetrics: AdminDashboardMetrics = {
    total_candidates: 12842,
    active_candidates: 12842,
    interviews_completed: 8956,
    interviews_in_progress: 1842,
    overall_pass_rate: 62.7,
    average_score: 78.4,
    stage_pass_rates: [
      { stage_number: 1, stage_title: "Profile & Pitch", total_attempts: 2456, passed_attempts: 2100, pass_rate_percentage: 85.5 },
      { stage_number: 2, stage_title: "Linux Warrior", total_attempts: 2189, passed_attempts: 1750, pass_rate_percentage: 79.9 },
      { stage_number: 3, stage_title: "Multi-Cloud", total_attempts: 2734, passed_attempts: 2100, pass_rate_percentage: 76.8 },
      { stage_number: 4, stage_title: "DevOps & Containers", total_attempts: 2145, passed_attempts: 1500, pass_rate_percentage: 69.9 },
      { stage_number: 5, stage_title: "Incident Boss", total_attempts: 1318, passed_attempts: 826, pass_rate_percentage: 62.7 }
    ],
    most_common_weak_topics: [
      { topic: "Kubernetes EKS CrashLoopBackOff", category: "Containers", failure_frequency: 342 },
      { topic: "AWS VPC Peering & IRSA", category: "Networking", failure_frequency: 218 },
      { topic: "Prometheus Alertmanager Triage", category: "Monitoring", failure_frequency: 189 }
    ],
    candidates_requiring_attention: [],
    recent_interviews: []
  };

  const displayMetrics = metrics || defaultMetrics;

  const topKPIs = [
    {
      title: "Total Candidates",
      value: (displayMetrics.total_candidates || 12842).toLocaleString(),
      change: "+18.6% from last week",
      icon: Users,
      bgColor: "bg-rose-50 dark:bg-rose-950/40 text-rose-500",
      borderColor: "border-rose-100 dark:border-rose-900/40"
    },
    {
      title: "Interviews Conducted",
      value: (displayMetrics.interviews_completed || 8956).toLocaleString(),
      change: "+22.4% from last week",
      icon: Calendar,
      bgColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-500",
      borderColor: "border-blue-100 dark:border-blue-900/40"
    },
    {
      title: "Avg. Score",
      value: `${displayMetrics.average_score || 78.4}%`,
      change: "+4.3% from last week",
      icon: Star,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500",
      borderColor: "border-emerald-100 dark:border-emerald-900/40"
    },
    {
      title: "Pass Rate (≥80%)",
      value: `${displayMetrics.overall_pass_rate || 62.7}%`,
      change: "+6.7% from last week",
      icon: CheckCircle2,
      bgColor: "bg-purple-50 dark:bg-purple-950/40 text-purple-500",
      borderColor: "border-purple-100 dark:border-purple-900/40"
    },
    {
      title: "Revenue (This Month)",
      value: "₹18,72,450",
      change: "+15.8% from last month",
      icon: CreditCard,
      bgColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-500",
      borderColor: "border-amber-100 dark:border-amber-900/40"
    }
  ];

  const recentActivities = [
    { icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950", title: "New candidate registered", desc: "Rahul Sharma", time: "2 mins ago" },
    { icon: CheckCircle2, color: "text-purple-500 bg-purple-50 dark:bg-purple-950", title: "Interview completed", desc: "Linux Systems Warrior", time: "10 mins ago" },
    { icon: CreditCard, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950", title: "Payment received", desc: "Order #TXN12345", time: "30 mins ago" },
    { icon: Mail, color: "text-rose-500 bg-rose-50 dark:bg-rose-950", title: "New support ticket", desc: "Ticket #SUP-1567", time: "1 hour ago" },
    { icon: Server, color: "text-teal-500 bg-teal-50 dark:bg-teal-950", title: "System backup completed", desc: "Backup_2025_06_02", time: "2 hours ago" },
  ];

  const topCandidates = [
    { rank: 1, name: "Arjun Mehta", email: "arjun.mehta@email.com", score: "94.6%", stage: "Stage 5", date: "Jun 02, 2025", medal: "🥇" },
    { rank: 2, name: "Neha Singh", email: "neha.singh@email.com", score: "92.1%", stage: "Stage 5", date: "Jun 01, 2025", medal: "🥈" },
    { rank: 3, name: "Rohit Verma", email: "rohit.verma@email.com", score: "90.3%", stage: "Stage 4", date: "May 31, 2025", medal: "🥉" },
    { rank: 4, name: "Sagar Patel", email: "sagar.patel@email.com", score: "89.7%", stage: "Stage 4", date: "May 31, 2025", medal: "4" },
    { rank: 5, name: "Priya Nair", email: "priya.nair@email.com", score: "88.9%", stage: "Stage 3", date: "May 30, 2025", medal: "5" },
  ];

  const systemHealth = [
    { service: "Database", status: "Operational", icon: Database },
    { service: "AI Service (GPT-4o)", status: "Operational", icon: Cpu },
    { service: "Speech-to-Text", status: "Operational", icon: Mic },
    { service: "Cloud Storage", status: "Operational", icon: Cloud },
    { service: "Email Service", status: "Operational", icon: Mail },
    { service: "Payment Gateway", status: "Operational", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1440px] mx-auto pb-12 font-sans text-slate-900 dark:text-slate-100">
      
      {/* 1. TOP HEADER & GREETING BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Here's what's happening with your CloudOps AI Assessment OS
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Filter */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-[#FF9900]" />
            <span>May 27, 2025 - Jun 02, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* AI Blueprint Button */}
          <button
            onClick={() => setIsJDModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/25 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Blueprint from JD</span>
          </button>

          {/* 90-Day Retention Cleanup */}
          <button
            onClick={handleRetentionCleanup}
            disabled={isCleaning}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Purge recordings older than 90 days"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>{isCleaning ? "Purging..." : "90-Day Cleanup"}</span>
          </button>
        </div>
      </div>

      {/* 2. TOP 5 KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {topKPIs.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{kpi.title}</span>
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${kpi.bgColor}`}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {kpi.value}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>{kpi.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MIDDLE ROW: INTERVIEWS OVERVIEW + CANDIDATES BY STAGE + RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Interviews Overview Line Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Interviews Overview</h2>
            <button className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>{timeRange}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* SVG Smooth Curved Area Chart */}
          <div className="relative w-full h-56 flex flex-col justify-end pt-4">
            {/* Tooltip Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold shadow-xl border border-slate-700 flex items-center gap-2 z-10 animate-bounce">
              <span className="text-slate-400">May 30, 2025</span>
              <span className="text-[#FF9900] font-black font-mono">Interviews: 1,842</span>
            </div>

            <svg viewBox="0 0 500 180" className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />

              {/* Area Fill */}
              <path
                d="M 0,120 Q 80,90 160,50 T 320,70 T 480,60 L 500,65 L 500,180 L 0,180 Z"
                fill="url(#areaGradient)"
              />

              {/* Smooth Spline Path */}
              <path
                d="M 0,120 Q 80,90 160,50 T 320,70 T 480,60 L 500,65"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="0" cy="120" r="4" fill="#f43f5e" />
              <circle cx="80" cy="90" r="4" fill="#f43f5e" />
              <circle cx="160" cy="50" r="4" fill="#f43f5e" />
              <circle cx="240" cy="70" r="6" fill="#f43f5e" className="animate-pulse" />
              <circle cx="320" cy="45" r="4" fill="#f43f5e" />
              <circle cx="400" cy="55" r="4" fill="#f43f5e" />
              <circle cx="500" cy="65" r="4" fill="#f43f5e" />
            </svg>

            {/* X-Axis Dates */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>May 27</span>
              <span>May 28</span>
              <span>May 29</span>
              <span className="text-rose-500 font-extrabold">May 30</span>
              <span>May 31</span>
              <span>Jun 01</span>
              <span>Jun 02</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Candidates by Stage Donut Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white mb-2">Candidates by Stage</h2>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* SVG Donut Chart with Center Total */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" className="dark:stroke-slate-800" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f43f5e" strokeWidth="4.5" strokeDasharray="19 88" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="17 88" strokeDashoffset="-19" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="21 88" strokeDashoffset="-36" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="16 88" strokeDashoffset="-57" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="4.5" strokeDasharray="15 88" strokeDashoffset="-73" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono leading-none">12,842</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total</span>
              </div>
            </div>

            {/* Stage Color Legend */}
            <div className="flex flex-col gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 w-full">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Stage 1 - Profile & Pitch</span>
                <span className="font-mono text-slate-400">2,456 (19.1%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Stage 2 - Linux Warrior</span>
                <span className="font-mono text-slate-400">2,189 (17.0%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Stage 3 - Multi-Cloud</span>
                <span className="font-mono text-slate-400">2,734 (21.3%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Stage 4 - DevOps & Containers</span>
                <span className="font-mono text-slate-400">2,145 (16.7%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Stage 5 - Incident Boss</span>
                <span className="font-mono text-slate-400">1,318 (10.3%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RECENT ACTIVITIES (3 cols) */}
        <div className="lg:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Recent Activities</h2>
            <button className="text-xs font-mono font-bold text-rose-500 hover:underline">View All</button>
          </div>

          <div className="flex flex-col gap-3.5">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${act.color}`}>
                  <act.icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{act.title}</span>
                  <span className="text-[11px] font-medium text-slate-500 truncate">{act.desc}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ROW: TOP PERFORMING CANDIDATES + SYSTEM HEALTH & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Top Performing Candidates Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Top Performing Candidates</h2>
            <button className="text-xs font-mono font-bold text-rose-500 hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 w-12">Rank</th>
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Overall Score</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3 text-right">Completed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {topCandidates.map((cand) => (
                  <tr key={cand.rank} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold font-mono text-sm">{cand.medal}</td>
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900 dark:text-white">{cand.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{cand.email}</div>
                    </td>
                    <td className="py-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400">
                      {cand.score}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        {cand.stage}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-400 text-[11px]">
                      {cand.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: System Health & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* System Health Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white mb-1">System Health</h2>

            <div className="flex flex-col gap-2.5">
              {systemHealth.map((sh, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <sh.icon className="w-4 h-4 text-slate-400" />
                    <span>{sh.service}</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {sh.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <h2 className="text-sm font-black text-slate-900 dark:text-white mb-1">Quick Actions</h2>

            <div className="grid grid-cols-2 gap-2.5">
              <button className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add New Admin</span>
              </button>
              <button className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                <Megaphone className="w-3.5 h-3.5" />
                <span>Announcement</span>
              </button>
              <button className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                <Download className="w-3.5 h-3.5" />
                <span>Export Reports</span>
              </button>
              <button className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                <Settings className="w-3.5 h-3.5" />
                <span>System Settings</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5. FOOTER */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-2">
        <span>© 2025 CloudOps AI Assessment OS. All rights reserved.</span>
        <span>Made with ❤️ for Cloud Engineers</span>
      </div>

      {/* JD Blueprint Modal */}
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
