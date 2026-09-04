"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Flame, Zap, Moon, Sun, ArrowRight, Play, Upload, Award, 
  CheckCircle2, Lock, Clock, Calendar, Search, Bell, Sparkles,
  ChevronRight, BarChart2, ShieldCheck, Check, Laptop, Trophy,
  FileText, Cpu, Compass
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dbMetrics, setDbMetrics] = useState<any>(null);
  const [candProfile, setCandProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Always fetch fresh real data from backend — no stale localStorage cache
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cached_dash_metrics");
    }

    // Fetch Real DB Data directly from backend
    const fetchUserData = async () => {
      try {
        const [userRes, profileRes, metricsRes] = await Promise.all([
          apiFetch("/auth/me").catch(() => null),
          apiFetch("/candidates/me/profile").catch(() => null),
          apiFetch("/candidates/me/dashboard-metrics").catch(() => null)
        ]);

        if (userRes?.data) {
          const token = localStorage.getItem("auth_token") || "";
          setAuth(userRes.data, token);
        }
        if (profileRes?.data) {
          setCandProfile(profileRes.data);
        }
        if (metricsRes?.data) {
          setDbMetrics(metricsRes.data);
        }
      } catch (e) {
        console.warn("Dashboard fetch notice:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();

    const handleProfileUpdate = () => {
      fetchUserData();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("userProfileUpdated", handleProfileUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("userProfileUpdated", handleProfileUpdate);
      }
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof document !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Default initial candidate metrics for clean un-attempted state
  const defaultCandidateMetrics = {
    readiness_score: candProfile?.readiness_score || (user as any)?.readiness_score || 0.0,
    xp: candProfile?.xp || (user as any)?.xp || 0,
    level: candProfile?.level || (user as any)?.level || 1,
    streak_days: candProfile?.streak_days || (user as any)?.streak_days || 1,
    readiness_breakdown: {
      technical: 0,
      problem_solving: 0,
      communication: 0,
      system_design: 0,
      devops_mindset: 0
    },
    stages_progress: [
      { id: 1, name: "Profile & Career Pitch", score: "0%", status: "in_progress" },
      { id: 2, name: "Linux Systems Warrior", score: "--", status: "locked" },
      { id: 3, name: "Multi-Cloud Architecture", score: "--", status: "locked" },
      { id: 4, name: "DevOps & Containers", score: "--", status: "locked" },
      { id: 5, name: "Production Incident Boss Battle", score: "--", status: "locked" }
    ],
    resume_ats: {
      score: 0,
      matched_jd: candProfile?.target_role || (user as any)?.target_role || "Senior DevOps Engineer",
      skills_matched: "0 / 24",
      keywords_found: "0%",
      ats_score: "0 / 100"
    },
    top_skills: ["Linux Admin", "AWS IAM & VPC", "Docker Containers", "Kubernetes EKS", "Terraform IaC"]
  };

  const activeMetrics = dbMetrics || defaultCandidateMetrics;

  // Real Candidate Data from DB
  const candidateName = candProfile?.user?.full_name || user?.full_name || (user?.email ? user.email.split('@')[0] : "Candidate User");
  const userXp = candProfile?.xp ?? activeMetrics?.xp ?? (user as any)?.xp ?? 0;
  const userLevel = candProfile?.level ?? activeMetrics?.level ?? (user as any)?.level ?? 1;
  const userStreak = candProfile?.streak_days ?? activeMetrics?.streak_days ?? (user as any)?.streak_days ?? 1;
  const readiness = Math.round(candProfile?.readiness_score ?? activeMetrics?.readiness_score ?? 0);
  const targetSalaryBand = candProfile?.target_salary_band || dbMetrics?.target_salary_band || "₹18 – ₹40 LPA";
  const readinessBreakdown = activeMetrics?.readiness_breakdown || defaultCandidateMetrics.readiness_breakdown;
  const stagesProgress = activeMetrics?.stages_progress || defaultCandidateMetrics.stages_progress;
  const resumeAts = activeMetrics?.resume_ats || defaultCandidateMetrics.resume_ats;
  const topSkills = activeMetrics?.top_skills || defaultCandidateMetrics.top_skills;
  const upcomingInterview = activeMetrics?.upcoming_interview || {
    title: "Stage 3: Multi-Cloud Architecture",
    subtitle: "AWS VPC, IAM, IRSA, Networking",
    date: "Today",
    time: "10:00 AM"
  };
  const leaderboardData = activeMetrics?.leaderboard || [];

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-12 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* TOP WELCOME TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {candidateName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Continue your CloudOps AI journey and become production ready.
          </p>
        </div>
      </div>

      {/* ROW 1: HERO BANNER + YOUR READINESS SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Hero Banner Card */}
        <div className="lg:col-span-8 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-[24px] border border-amber-200/80 dark:border-[#FF9900]/30 p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="flex flex-col gap-3.5 z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              AI-Powered Interviews.<br />
              <span className="text-[#FF9900]">Real-World Ready.</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              5-Stage Voice Interviews, AI Scoring, ATS Resume Analyzer & Career OS for Cloud Engineers.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Link prefetch={false} 
                href="/interviews"
                className="py-2.5 px-5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/25 flex items-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Continue Interview</span>
              </Link>

              <Link prefetch={false} 
                href="/resume-ats"
                className="py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-amber-50 flex items-center gap-2 shadow-sm transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-[#FF9900]" />
                <span>Upload Resume</span>
              </Link>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-[#FF9900]/30 text-[#FF9900] text-[11px] font-extrabold w-fit mt-1">
              <Sparkles className="w-3 h-3 text-[#FF9900]" />
              <span>Target Salary: {dbMetrics?.target_salary_band || "₹18 – ₹40 LPA"}</span>
            </div>
          </div>

          {/* 3D Visual Illustration */}
          <div className="w-full sm:w-[240px] shrink-0 z-10 flex justify-center">
            <img loading="eager" fetchPriority="high" decoding="async" width={220} height={170}
              src="/images/hero_cloud_ai_3d.webp" 
              alt="3D DevOps Cloud Graphic" 
              className="w-full max-w-[220px] max-h-[170px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" 
            />
          </div>

        </div>

        {/* Your Readiness Score Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Readiness Score
            </h3>
            <span className="text-[10px] font-extrabold text-[#FF9900] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-[#FF9900]/30">
              Live
            </span>
          </div>

          <div className="flex items-center gap-4 my-3">
            {/* 5-Segment Donut Chart */}
            <div className="relative w-[88px] h-[88px] shrink-0 flex items-center justify-center">
              {(() => {
                const pillars = [
                  { val: readinessBreakdown.technical,       color: "#FF9900" },
                  { val: readinessBreakdown.problem_solving, color: "#8b5cf6" },
                  { val: readinessBreakdown.communication,   color: "#10b981" },
                  { val: readinessBreakdown.system_design,   color: "#f59e0b" },
                  { val: readinessBreakdown.devops_mindset,  color: "#ef4444" },
                ];
                const total = pillars.reduce((s, p) => s + (p.val || 0), 0) || 1;
                const circumference = 2 * Math.PI * 38;
                let offset = 0;
                return (
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                    {pillars.map((p, i) => {
                      const dash = ((p.val || 0) / total) * circumference;
                      const gap = circumference - dash;
                      const seg = (
                        <circle
                          key={i}
                          cx="50" cy="50" r="38"
                          stroke={p.color}
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={`${Math.max(0, dash - 2)} ${gap + 2}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                        />
                      );
                      offset += dash;
                      return seg;
                    })}
                  </svg>
                );
              })()}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{readiness}%</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight mt-0.5">
                  Ready
                </span>
              </div>
            </div>

            {/* Breakdown with mini bars */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {[
                { name: "Technical",       val: readinessBreakdown.technical,       color: "bg-[#FF9900]" },
                { name: "Problem Solving", val: readinessBreakdown.problem_solving, color: "bg-violet-500" },
                { name: "Communication",   val: readinessBreakdown.communication,   color: "bg-emerald-500" },
                { name: "System Design",   val: readinessBreakdown.system_design,   color: "bg-amber-500" },
                { name: "DevOps Mindset",  val: readinessBreakdown.devops_mindset,  color: "bg-red-500" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold truncate">{item.name}</span>
                    <span className="font-black text-slate-900 dark:text-white ml-1 shrink-0">{item.val ?? 0}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                      style={{ width: `${Math.min(100, item.val ?? 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link prefetch={false}
            href="/performance"
            className="w-full py-2 rounded-xl text-xs font-bold text-[#FF9900] bg-amber-50 dark:bg-amber-950/40 border border-[#FF9900]/30 hover:bg-amber-100 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>View Full Report</span>
          </Link>

        </div>

      </div>

      {/* ROW 2: 5-STAGE INTERVIEW PROGRESS ROW */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              5-Stage Interview Progress
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Click any unlocked stage to attempt or re-attempt anytime for higher XP & readiness score!
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-400 shrink-0 hidden sm:inline">
            Score 80%+ to unlock next stage
          </span>
        </div>

        {/* 5 Stages Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stagesProgress.map((s: any) => {
            const isCompleted = s.status === "completed";
            const isInProgress = s.status === "in_progress";
            const isLocked = s.status === "locked";

            const handleCardClick = () => {
              if (isLocked) return;
              const targetUrl = s.attempt_id ? `/interviews/${s.attempt_id}/room` : `/interviews/1/room`;
              router.push(targetUrl);
            };

            return (
              <div
                key={s.id}
                onClick={handleCardClick}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all relative overflow-hidden ${
                  isCompleted
                    ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/80 shadow-sm hover:border-emerald-600 hover:shadow-md cursor-pointer"
                    : isInProgress
                    ? "bg-amber-50/90 dark:bg-amber-950/40 border-[#FF9900] ring-2 ring-[#FF9900]/20 shadow-md hover:border-orange-500 hover:shadow-lg cursor-pointer"
                    : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/80 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : isInProgress
                      ? "bg-[#FF9900] text-slate-950 shadow-md shadow-[#FF9900]/20"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  
                  {s.score && s.score !== "--" && (
                    <span className={`px-2 py-0.5 rounded-lg font-mono font-extrabold text-[10.5px] ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                        : "bg-amber-100 text-[#FF9900] dark:bg-amber-900/60"
                    }`}>
                      Score: {s.score}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">{s.name}</h4>
                  {s.subtitle && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{s.subtitle}</p>
                  )}
                </div>

                <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-bold ${
                  isCompleted
                    ? "border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                    : isInProgress
                    ? "border-amber-200/60 dark:border-amber-800/60 text-[#FF9900]"
                    : "border-slate-200/60 dark:border-slate-800/60 text-slate-400"
                }`}>
                  {isCompleted && (
                    <>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Completed</span>
                      </div>
                      <span className="font-extrabold underline text-emerald-800 dark:text-emerald-200">
                        Re-attempt 🔄
                      </span>
                    </>
                  )}
                  {isInProgress && (
                    <>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#FF9900] shrink-0 animate-pulse" />
                        <span>Active Stage</span>
                      </div>
                      <span className="font-extrabold text-[#FF9900]">
                        Start →
                      </span>
                    </>
                  )}
                  {isLocked && (
                    <>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Locked</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ROW 3: UPCOMING INTERVIEW + ATS SCORE + TOP SKILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Resume ATS Score Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
            <FileText className="w-4 h-4 text-[#FF9900]" />
            <span>Resume ATS Score</span>
          </div>

          <div className="flex items-center gap-4 my-1">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${Math.round(resumeAts.score) * 2.51} 251`} strokeLinecap="round" className="text-[#FF9900]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">{Math.round(resumeAts.score)}%</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                  {resumeAts.score > 0 ? "Good Match" : "Not Analyzed"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 truncate">Matched JD: {resumeAts.matched_jd}</span>
              
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Skills Matched</span>
                  <span className="font-mono font-bold text-emerald-600">{resumeAts.skills_matched}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(resumeAts.score)}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <span>Keywords Found</span>
                  <span className="font-mono font-bold text-[#FF9900]">{resumeAts.keywords_found}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF9900] rounded-full" style={{ width: `${Math.round(resumeAts.score * 0.95)}%` }} />
                </div>
              </div>
            </div>
          </div>

          <Link prefetch={false}
            href="/resume-ats"
            className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>Improve Resume</span>
          </Link>

        </div>

        {/* Top Skills Detected Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF9900]" />
              Top Skills Detected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 my-1">
            {topSkills.length > 0 ? (
              topSkills.map((skill: string, i: number) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#FF9900] bg-amber-50 dark:bg-amber-950/50 border border-[#FF9900]/30"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 font-medium">Complete Stage 1 to detect skills</span>
            )}
          </div>

          <Link prefetch={false}
            href="/performance"
            className="text-xs font-bold text-[#FF9900] hover:underline flex items-center justify-end gap-1 mt-1"
          >
            <span>View All Skills</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

        </div>

        {/* Upcoming Interview Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF9900]" />
              Upcoming Interview
            </span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="flex flex-col gap-1 my-1">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{upcomingInterview.title}</h4>
            <p className="text-[11px] text-slate-500 font-medium">{upcomingInterview.subtitle}</p>
            
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF9900]" />
                {upcomingInterview.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF9900]" />
                {upcomingInterview.time}
              </span>
            </div>
          </div>

          <Link prefetch={false}
            href="/interviews"
            className="w-full py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Start Mock Interview</span>
          </Link>

        </div>

      </div>

      {/* ROW 4: 30-DAY ROADMAP + STREAK & XP + LEADERBOARD + PRACTICE BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* AI Career Roadmap (30 Days) Widget */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FF9900]" />
              AI Career Roadmap (30 Days)
            </span>
          </div>

          <div className="flex flex-col gap-2 my-1">
            {(dbMetrics?.roadmap || [
              { week: "Week 1", title: "Linux & Shell Deep Dive", done: true },
              { week: "Week 2", title: "AWS Core Services & VPC", done: false },
              { week: "Week 3", title: "Kubernetes Advanced & Helm", done: false },
              { week: "Week 4", title: "DevOps Projects & SRE Outages", done: false }
            ]).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-bold">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono text-slate-400">{item.week}</span>
                  <span className="text-slate-900 dark:text-white">{item.title}</span>
                </div>
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                )}
              </div>
            ))}
          </div>

          <Link prefetch={false}
            href="/roadmap"
            className="text-xs font-bold text-[#FF9900] hover:underline flex items-center justify-end gap-1"
          >
            <span>View Full Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

        </div>

        {/* Streak & XP Widget */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Streak & XP</span>
          </div>

          <div className="flex items-center justify-around my-1">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{userStreak}</span>
              <span className="text-[10px] font-bold text-slate-400">Day Streak</span>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{userXp.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400">Total XP</span>
            </div>
          </div>

          {/* Mini Sparkline Visualization */}
          <div className="h-8 w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1 flex items-end justify-between gap-1 border border-slate-200/50 dark:border-slate-800">
            {[20, 35, 50, 40, 65, 80, 100].map((val, i) => (
              <div key={i} className="flex-1 bg-[#FF9900] rounded-t" style={{ height: `${userXp > 0 ? val : 10}%` }} />
            ))}
          </div>

        </div>

        {/* Global Leaderboard (Top 3) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Global Leaderboard (Top 3)
            </span>
          </div>

          <div className="flex flex-col gap-2 my-1">
            {leaderboardData.length > 0 ? (
              leaderboardData.map((item: any) => (
                <div key={item.rank} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full ${
                      item.rank === 1 ? "bg-amber-400 text-slate-950" : item.rank === 2 ? "bg-slate-300 text-slate-900" : "bg-amber-700 text-white"
                    } font-black text-[10px] flex items-center justify-center shrink-0`}>
                      {item.rank}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {item.name} {item.is_me ? "(You)" : ""}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">{item.role}</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] shrink-0">{item.xp}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 font-medium">No candidate rankings yet</span>
            )}
          </div>

          <Link prefetch={false}
            href="/leaderboard"
            className="text-xs font-bold text-[#FF9900] hover:underline flex items-center justify-end gap-1"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

        </div>

      </div>

      {/* PRACTICE BANNER */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-white dark:from-slate-900 dark:to-slate-900 rounded-[24px] border border-amber-200/60 dark:border-[#FF9900]/30 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Practice more. Get better. Become production ready.
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            Test your incident troubleshooting against real-world AWS & Kubernetes outages.
          </p>
        </div>

        <Link prefetch={false}
          href="/interviews"
          className="py-2.5 px-5 rounded-xl font-bold text-xs text-[#FF9900] bg-white dark:bg-slate-900 border border-[#FF9900]/30 hover:bg-amber-50 shadow-sm flex items-center gap-1.5 transition-all shrink-0"
        >
          <span>Start Practice Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
