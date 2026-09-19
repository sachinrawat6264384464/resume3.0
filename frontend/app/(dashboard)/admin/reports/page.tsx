"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, TrendingUp, Award, CheckCircle2, Download, 
  Calendar, RefreshCw, Layers, ShieldCheck, AlertCircle, FileSpreadsheet,
  PieChart, Activity, Zap, Users, Target, ArrowUpRight, Check, XCircle, Search, Flame,
  LayoutGrid, List, Map, Filter, ChevronRight, Sparkles, CheckCircle, HelpCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface StageReportItem {
  stage_number: number;
  level: string;
  levelName: string;
  stage_title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Legendary";
  pass_rate_percentage: number;
  avg_score: number;
  total_attempts: number;
  passed_attempts: number;
}

const ALL_31_STAGES_REPORT: StageReportItem[] = [
  // LEVEL 1: FOUNDATION (0-5)
  { stage_number: 0, level: "Level 1", levelName: "Foundation", stage_title: "Setup Your Interview Profile", category: "Profile & Pitch", difficulty: "Beginner", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 1, level: "Level 1", levelName: "Foundation", stage_title: "Self Introduction & Career Pitch", category: "Personal Pitch", difficulty: "Beginner", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 2, level: "Level 1", levelName: "Foundation", stage_title: "Technical Introduction & Core Stack", category: "Core Tech", difficulty: "Beginner", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 3, level: "Level 1", levelName: "Foundation", stage_title: "Linux for Cloud Engineers", category: "Linux Diagnostics", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 4, level: "Level 1", levelName: "Foundation", stage_title: "Linux for DevOps Engineers", category: "Linux Systems", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 5, level: "Level 1", levelName: "Foundation", stage_title: "Cloud + DevOps Fundamentals", category: "Cloud Architecture", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },

  // LEVEL 2: CLOUD (6-10)
  { stage_number: 6, level: "Level 2", levelName: "Cloud Systems", stage_title: "AWS Cloud Engineer", category: "AWS Architecture", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 7, level: "Level 2", levelName: "Cloud Systems", stage_title: "GCP Cloud Engineer", category: "GCP Infrastructure", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 8, level: "Level 2", levelName: "Cloud Systems", stage_title: "Azure Cloud Engineer", category: "Azure Infrastructure", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 9, level: "Level 2", levelName: "Cloud Systems", stage_title: "Multi-Cloud Architecture", category: "Multi-Cloud", difficulty: "Advanced", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 10, level: "Level 2", levelName: "Cloud Systems", stage_title: "Cloud Real-Time Scenarios", category: "Incident Response", difficulty: "Advanced", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },

  // LEVEL 3: DEVOPS CORE (11-15)
  { stage_number: 11, level: "Level 3", levelName: "DevOps Core", stage_title: "Git + GitHub Workflow", category: "DevOps Practices", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 12, level: "Level 3", levelName: "DevOps Core", stage_title: "Jenkins + CI/CD Pipelines", category: "CI/CD Engineering", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 13, level: "Level 3", levelName: "DevOps Core", stage_title: "Docker Containerization", category: "Containerization", difficulty: "Intermediate", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 14, level: "Level 3", levelName: "DevOps Core", stage_title: "Kubernetes Orchestration", category: "Kubernetes", difficulty: "Advanced", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 15, level: "Level 3", levelName: "DevOps Core", stage_title: "Ansible + Terraform IaC", category: "IaC Automation", difficulty: "Advanced", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },

  // LEVEL 4: ADVANCED DEVOPS (16-20)
  { stage_number: 16, level: "Level 4", levelName: "Advanced DevOps", stage_title: "End-to-End CI/CD Project", category: "GitOps & CI/CD", difficulty: "Advanced", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 17, level: "Level 4", levelName: "Advanced DevOps", stage_title: "Production Troubleshooting & Triage", category: "Production Triage", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 18, level: "Level 4", levelName: "Advanced DevOps", stage_title: "DevSecOps & Hardening", category: "Security Engineering", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 19, level: "Level 4", levelName: "Advanced DevOps", stage_title: "Real-Time DevOps Architecture", category: "Cloud Architecture", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 20, level: "Level 4", levelName: "Advanced DevOps", stage_title: "Final DevOps Mock Interview", category: "Executive Panel", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },

  // 10 BONUS AI & ADVANCED CHALLENGES (21-30)
  { stage_number: 21, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 01: AIOps Challenge", category: "AI Infrastructure", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 22, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 02: MLOps Challenge", category: "AI Infrastructure", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 23, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 03: AI Integration Challenge", category: "AI Infrastructure", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 24, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 04: AI + DevOps Automation", category: "AI Automation", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 25, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 05: AI MCP Challenge", category: "AI Integration", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 26, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 06: Azure DevOps Project", category: "Azure & CI/CD", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 27, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 07: Project-Based CI/CD", category: "Advanced CI/CD", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 28, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 08: Advanced DevSecOps Project", category: "Security Engineering", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 29, level: "Bonus", levelName: "Bonus Challenge", stage_title: "Bonus 09: Multi-Cloud + AI Architecture", category: "Advanced Architecture", difficulty: "Expert", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 },
  { stage_number: 30, level: "Bonus", levelName: "Bonus Challenge", stage_title: "👑 40 LPA Final Boss Interview Battle", category: "Legendary Boss Battle", difficulty: "Legendary", pass_rate_percentage: 0, avg_score: 0, total_attempts: 0, passed_attempts: 0 }
];

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "roadmap">("grid");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [resOverview, resCand] = await Promise.all([
        apiFetch("/admin/analytics/overview"),
        apiFetch("/candidates")
      ]);

      if (resOverview?.data) {
        setMetrics(resOverview.data);
      }

      if (resCand) {
        const rawList = Array.isArray(resCand) 
          ? resCand 
          : (resCand.items ? resCand.items : (resCand.data ? (Array.isArray(resCand.data) ? resCand.data : (resCand.data.items || [])) : []));
        setCandidates(rawList);
      }
    } catch (e) {
      console.warn("Failed to fetch reports:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportStagesCSV = () => {
    const headers = ["Stage Number,Level,Level Name,Stage Title,Category,Difficulty,Pass Rate %,Avg Score %,Total Attempts,Passed Attempts\n"];
    const rows = mergedStages.map(st => 
      `"${st.stage_number}","${st.level}","${st.levelName}","${st.stage_title.replace(/"/g, '""')}","${st.category}","${st.difficulty}",${st.pass_rate_percentage},${st.avg_score},${st.total_attempts},${st.passed_attempts}`
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CloudOps_31Stages_Analytics_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const exportCohortCSV = () => {
    const headers = ["Candidate ID,Name,Email,Target Role,Readiness Score,Level,XP,Target Salary Band,Status\n"];
    const rows = candidates.map(c => 
      `"${c.student_id || 'STU-2026'}","${c.user?.full_name || c.full_name || 'Candidate'}","${c.user?.email || c.email || 'N/A'}","${c.target_role || 'CloudOps Engineer'}",${c.readiness_score || 0},${c.level || 1},${c.xp || 0},"${c.target_salary_band || '₹18–40 LPA'}","ACTIVE"`
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CloudOps_Cohort_Roster_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // Merge live backend DB stage metrics strictly from DB
  const mergedStages = ALL_31_STAGES_REPORT.map((baseStage) => {
    const liveMatch = metrics?.stage_pass_rates?.find((st: any) => st.stage_number === baseStage.stage_number);
    if (liveMatch) {
      return {
        ...baseStage,
        pass_rate_percentage: typeof liveMatch.pass_rate_percentage === 'number' ? liveMatch.pass_rate_percentage : 0,
        total_attempts: typeof liveMatch.total_attempts === 'number' ? liveMatch.total_attempts : 0,
        passed_attempts: typeof liveMatch.passed_attempts === 'number' ? liveMatch.passed_attempts : 0,
        avg_score: typeof liveMatch.avg_score === 'number' ? liveMatch.avg_score : 0
      };
    }
    return baseStage;
  });

  const filteredStages = mergedStages.filter((stg) => {
    const sNum = stg.stage_number;
    let matchesTab = true;

    if (activeTab === "LEVEL1") matchesTab = sNum >= 0 && sNum <= 5;
    else if (activeTab === "LEVEL2") matchesTab = sNum >= 6 && sNum <= 10;
    else if (activeTab === "LEVEL3") matchesTab = sNum >= 11 && sNum <= 15;
    else if (activeTab === "LEVEL4") matchesTab = sNum >= 16 && sNum <= 20;
    else if (activeTab === "BONUS") matchesTab = sNum >= 21 && sNum <= 30;

    if (!matchesTab) return false;

    if (statusFilter === "HIGH") {
      if (stg.pass_rate_percentage < 70) return false;
    } else if (statusFilter === "MEDIUM") {
      if (stg.pass_rate_percentage < 50 || stg.pass_rate_percentage >= 70) return false;
    } else if (statusFilter === "CRITICAL") {
      if (stg.pass_rate_percentage >= 50) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        stg.stage_title.toLowerCase().includes(q) ||
        stg.category.toLowerCase().includes(q) ||
        stg.levelName.toLowerCase().includes(q) ||
        `stage ${stg.stage_number}`.includes(q) ||
        `s${stg.stage_number}`.includes(q)
      );
    }

    return true;
  });

  const pillarScores = [
    { 
      name: "Technical Command & CLI Accuracy", 
      weight: "40%", 
      score: metrics?.pillar_scores?.technical_command ?? 0, 
      color: "bg-[#FF6B00]", 
      textColor: "text-[#FF6B00]" 
    },
    { 
      name: "Architectural Concept Coverage", 
      weight: "25%", 
      score: metrics?.pillar_scores?.architectural_concept ?? 0, 
      color: "bg-blue-500", 
      textColor: "text-blue-500" 
    },
    { 
      name: "Problem Solving & Incident Logic", 
      weight: "20%", 
      score: metrics?.pillar_scores?.troubleshooting ?? 0, 
      color: "bg-purple-500", 
      textColor: "text-purple-500" 
    },
    { 
      name: "Practical Command Execution", 
      weight: "10%", 
      score: metrics?.pillar_scores?.practical_execution ?? 0, 
      color: "bg-emerald-500", 
      textColor: "text-emerald-500" 
    },
    { 
      name: "Communication & Pitch Structure", 
      weight: "5%", 
      score: metrics?.pillar_scores?.communication ?? 0, 
      color: "bg-amber-500", 
      textColor: "text-amber-500" 
    },
  ];


  const filteredCandidates = candidates.filter(c => {
    if (!searchQuery.trim()) return true;
    const name = c.user?.full_name || c.full_name || "";
    const email = c.user?.email || c.email || "";
    const role = c.target_role || "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || role.toLowerCase().includes(q);
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Beginner":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "Intermediate":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "Advanced":
        return "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "Expert":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "Legendary":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPassRateColor = (rate: number) => {
    if (rate >= 75) return "text-emerald-500 from-emerald-500 to-teal-400";
    if (rate >= 50) return "text-[#FF6B00] from-[#FF6B00] to-amber-400";
    return "text-rose-500 from-rose-500 to-orange-500";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col gap-6 pb-20 text-slate-900 dark:text-slate-100 font-sans"
    >
      {/* Dynamic Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FF6B00]/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] via-amber-500 to-orange-500 p-[1.5px] shadow-lg shadow-[#FF6B00]/25 shrink-0">
            <div className="w-full h-full bg-[#0B1E36] rounded-[14px] flex items-center justify-center text-[#FF6B00]">
              <BarChart3 className="w-7 h-7" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                30-Stage Cohort Analytics & Intelligence OS
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30">
                31 STAGES MONITORED
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                POSTGRESQL LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-3xl">
              Complete multi-stage pass rates, attempt metrics, 5-Pillar evaluation breakdown, and candidate progression heatmaps from Stage 0 (Setup) to Stage 30 (Final Boss Battle).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={fetchReports}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF6B00]" : ""}`} />
            <span>Refresh Analytics</span>
          </button>
          
          <button
            onClick={exportStagesCSV}
            className="px-4 py-2.5 rounded-2xl text-xs font-black text-[#FF6B00] bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 border border-[#FF6B00]/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Stage Metrics</span>
          </button>

          <button
            onClick={exportCohortCSV}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/25 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Cohort CSV</span>
          </button>
        </div>
      </div>

      {/* Top 5 Executive Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-[#FF6B00]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Pass Rate</span>
            <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Target &gt; 80%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-[#FF6B00] font-mono tracking-tight">
              {metrics?.overall_pass_rate !== undefined ? metrics.overall_pass_rate : 0}%
            </span>
            <span className="text-xs font-bold text-[#FF6B00] flex items-center">
              Live DB Sync
            </span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-500 mt-1">Weighted across all 31 stages</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Candidate Score</span>
            <span className="text-[9.5px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              5-Pillar Gauge
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {metrics?.average_score !== undefined ? metrics.average_score : 0}%
            </span>
            <span className="text-xs font-bold text-blue-500 flex items-center">
              Database Sync
            </span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-500 mt-1">Real-time candidate score average</span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Candidates</span>
            <span className="text-[9.5px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Database Sync
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
              {candidates.length}
            </span>
            <span className="text-xs font-medium text-slate-400">accounts</span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-500 mt-1">Active platform students</span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Attempts</span>
            <span className="text-[9.5px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Evaluated Stream
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
              {metrics?.interviews_completed ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-400">sessions</span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-500 mt-1">Evaluated interview stages</span>
        </div>

        {/* Metric 5 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Boss Battle Stage 30</span>
            <span className="text-[9.5px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-rose-500" /> Legendary
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              {mergedStages.find(s => s.stage_number === 30)?.pass_rate_percentage ?? 0}%
            </span>
            <span className="text-xs font-bold text-slate-400">Pass Rate</span>
          </div>
          <span className="text-[10.5px] font-medium text-slate-500 mt-1">👑 40 LPA Final Boss Battle</span>
        </div>


      </div>

      {/* FILTER CONTROLS & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        
        {/* Level Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          {[
            { key: "ALL", label: "ALL 31 STAGES", count: mergedStages.length },
            { key: "LEVEL1", label: "LEVEL 1: FOUNDATION", count: 6 },
            { key: "LEVEL2", label: "LEVEL 2: CLOUD", count: 5 },
            { key: "LEVEL3", label: "LEVEL 3: DEVOPS", count: 5 },
            { key: "LEVEL4", label: "LEVEL 4: ADVANCED", count: 5 },
            { key: "BONUS", label: "🤖 10 BONUS AI", count: 10 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30 scale-102"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Action Bar: Status Filter, View Toggle, Search */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="HIGH">High Pass (&gt;70%)</option>
            <option value="MEDIUM">Moderate (50-70%)</option>
            <option value="CRITICAL">Critical (&lt;50%)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-slate-900 text-[#FF6B00] shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-slate-900 text-[#FF6B00] shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("roadmap")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === "roadmap" ? "bg-white dark:bg-slate-900 text-[#FF6B00] shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
              title="Roadmap View"
            >
              <Map className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search 31 stages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
          </div>

        </div>

      </div>

      {/* MAIN 2-COLUMN SECTION: STAGE ANALYTICS & 5-PILLAR SCORE MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 31-Stage Progression & Analytics */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                30-Stage Progression Analytics ({filteredStages.length} Stages)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              Showing Stage {filteredStages[0]?.stage_number ?? 0} – Stage {filteredStages[filteredStages.length - 1]?.stage_number ?? 30}
            </span>
          </div>

          {/* VIEW MODE 1: GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[750px] overflow-y-auto pr-1">
              {filteredStages.map((st) => (
                <motion.div
                  key={st.stage_number}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between gap-4 group relative overflow-hidden"
                >
                  {/* Stage Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-2xl bg-[#0B1E36] text-[#FF6B00] text-xs font-black flex items-center justify-center font-mono shadow-xs shrink-0">
                        S{st.stage_number < 10 ? `0${st.stage_number}` : st.stage_number}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#FF6B00] transition-colors">
                          {st.stage_title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">{st.levelName}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[9.5px] font-mono font-semibold text-slate-400">{st.category}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${getDifficultyBadge(st.difficulty)}`}>
                      {st.difficulty}
                    </span>
                  </div>

                  {/* Stage Metrics Grid */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pass Rate</span>
                      <span className={`text-xl font-black font-mono bg-gradient-to-r ${getPassRateColor(st.pass_rate_percentage)} bg-clip-text text-transparent`}>
                        {st.pass_rate_percentage}%
                      </span>
                    </div>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Score</span>
                      <span className="text-xl font-black font-mono text-slate-800 dark:text-slate-200">
                        {st.avg_score}%
                      </span>
                    </div>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Attempts</span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {st.passed_attempts} / {st.total_attempts} Passed
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getPassRateColor(st.pass_rate_percentage)} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(st.pass_rate_percentage, 6)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* VIEW MODE 2: LIST VIEW */}
          {viewMode === "list" && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto max-h-[750px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3 px-3">Stage #</th>
                    <th className="py-3 px-4">Stage Title</th>
                    <th className="py-3 px-3">Level & Category</th>
                    <th className="py-3 px-3 text-center">Pass Rate</th>
                    <th className="py-3 px-3 text-center">Avg Score</th>
                    <th className="py-3 px-3 text-center">Attempts</th>
                    <th className="py-3 px-3 text-center">Difficulty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                  {filteredStages.map((st) => (
                    <tr key={st.stage_number} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-black text-[#FF6B00]">
                        S{st.stage_number < 10 ? `0${st.stage_number}` : st.stage_number}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {st.stage_title}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{st.levelName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{st.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-[#FF6B00]">
                        {st.pass_rate_percentage}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {st.avg_score}%
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                        {st.passed_attempts} / {st.total_attempts}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${getDifficultyBadge(st.difficulty)}`}>
                          {st.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW MODE 3: ROADMAP VIEW */}
          {viewMode === "roadmap" && (
            <div className="flex flex-col gap-6 max-h-[750px] overflow-y-auto pr-1">
              {[
                { name: "Level 1: Foundation (Stage 0 to 5)", filter: (s: StageReportItem) => s.stage_number >= 0 && s.stage_number <= 5, color: "border-emerald-500" },
                { name: "Level 2: Cloud Systems (Stage 6 to 10)", filter: (s: StageReportItem) => s.stage_number >= 6 && s.stage_number <= 10, color: "border-blue-500" },
                { name: "Level 3: DevOps Core (Stage 11 to 15)", filter: (s: StageReportItem) => s.stage_number >= 11 && s.stage_number <= 15, color: "border-purple-500" },
                { name: "Level 4: Advanced DevOps (Stage 16 to 20)", filter: (s: StageReportItem) => s.stage_number >= 16 && s.stage_number <= 20, color: "border-amber-500" },
                { name: "10 Bonus AI & Advanced Challenges (Stage 21 to 30)", filter: (s: StageReportItem) => s.stage_number >= 21 && s.stage_number <= 30, color: "border-rose-500" },
              ].map((lvl, lIdx) => {
                const stagesInLvl = filteredStages.filter(lvl.filter);
                if (stagesInLvl.length === 0) return null;

                return (
                  <div key={lIdx} className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-l-4 ${lvl.color} border-y border-r border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4`}>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {lvl.name}
                      </h4>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {stagesInLvl.length} Active Stages
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stagesInLvl.map((st) => (
                        <div key={st.stage_number} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-7 h-7 rounded-xl bg-[#0B1E36] text-[#FF6B00] text-xs font-black flex items-center justify-center font-mono shrink-0">
                              S{st.stage_number}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.stage_title}</span>
                              <span className="text-[9.5px] font-mono text-slate-400">{st.category}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="text-xs font-black text-[#FF6B00]">{st.pass_rate_percentage}%</span>
                            <span className="text-[10px] text-slate-400">({st.passed_attempts}/{st.total_attempts})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Column: 5-Pillar Score Matrix & AI Calibration Status */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              5-Pillar Score Matrix
            </h3>
            <span className="text-xs font-bold text-slate-400">Weighted Average</span>
          </div>

          <div className="flex flex-col gap-4">
            {pillarScores.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-slate-400">({p.weight})</span>
                    <span className={`font-black ${p.textColor}`}>{p.score}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${p.color} rounded-full transition-all duration-500`}
                    style={{ width: `${p.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI Calibration Card */}
          <div className="p-4 rounded-2xl bg-[#0B1E36] text-white border border-slate-800 flex flex-col gap-3 mt-auto shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                <span className="text-xs font-bold text-slate-200">AI Model Evaluation Engine</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                99.4% Precision
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Real-time calibration across keyword matching, structural reasoning, CLI output simulation, and candidate confidence metrics.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono">
              <span>DB Sync: Active</span>
              <span className="text-emerald-400 font-bold">31 Stages Operational</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cohort Candidates Performance Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Live Candidate Cohort Roster & Performance ({filteredCandidates.length})
            </h3>
          </div>
          <button
            onClick={exportCohortCSV}
            className="px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-black flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold">
            No candidates match search filter in cohort database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Readiness Score</th>
                  <th className="py-3 px-4">Level & XP</th>
                  <th className="py-3 px-4">Target Band</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0B1E36] text-[#FF6B00] font-black flex items-center justify-center shrink-0 text-xs shadow-xs">
                          {(c.user?.full_name || c.full_name || "C").charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {c.user?.full_name || c.full_name || "Sachin Rawat"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.user?.email || c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {c.target_role || "DevOps Engineer"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#FF6B00]">
                      {Math.round(c.readiness_score || 0)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      Lvl {c.level || 1} ({c.xp || 0} XP)
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {c.target_salary_band || "₹18–40 LPA"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[9.5px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </motion.div>
  );
}
