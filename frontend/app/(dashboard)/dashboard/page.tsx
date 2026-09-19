"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Flame, Zap, Moon, Sun, ArrowRight, Play, Upload, Award, 
  CheckCircle2, Lock, Clock, Calendar, Search, Bell, Sparkles,
  ChevronRight, BarChart2, ShieldCheck, Check, Laptop, Trophy,
  FileText, Cpu, Compass, Settings, HelpCircle, Layers
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const cachedM = localStorage.getItem("cached_dash_metrics");
        if (cachedM) setDbMetrics(JSON.parse(cachedM));
        const cachedP = localStorage.getItem("cached_user_profile");
        if (cachedP) setCandProfile(JSON.parse(cachedP));
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Fetch Real DB Data directly from backend
    const fetchUserData = async () => {
      try {
        const [userRes, profileRes, metricsRes, resumeRes] = await Promise.all([
          apiFetch("/auth/me").catch(() => null),
          apiFetch("/candidates/me/profile").catch(() => null),
          apiFetch("/candidates/me/dashboard-metrics").catch(() => null),
          apiFetch("/resumes/latest").catch(() => null)
        ]);

        if (userRes?.data) {
          const token = localStorage.getItem("auth_token") || "";
          setAuth(userRes.data, token);
        }
        if (profileRes?.data) {
          setCandProfile(profileRes.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("cached_user_profile", JSON.stringify(profileRes.data));
          }
        }
        if (metricsRes?.data) {
          let mergedMetrics = { ...metricsRes.data };
          if (resumeRes?.data) {
            const audit = resumeRes.data;
            const matchingCount = (audit.matching_skills || []).length;
            const missingCount = (audit.missing_skills || []).length;
            const totalCount = Math.max(matchingCount + missingCount, 1);
            const kwVal = Math.round(audit.breakdown?.keywords_match ?? (audit.ats_score * 0.95));

            mergedMetrics.resume_ats = {
              score: audit.ats_score,
              matched_jd: audit.job_title || profileRes?.data?.target_role || "Senior DevOps Engineer",
              skills_matched: `${matchingCount} / ${totalCount}`,
              keywords_found: `${kwVal}%`,
              ats_score: `${Math.round(audit.ats_score)} / 100`
            };
            if (audit.matching_skills && audit.matching_skills.length > 0) {
              mergedMetrics.top_skills = audit.matching_skills;
            }
          }
          setDbMetrics(mergedMetrics);
          if (typeof window !== "undefined") {
            localStorage.setItem("cached_dash_metrics", JSON.stringify(mergedMetrics));
          }
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

  // Smart Candidate Name Resolution: Never stuck on Demo Candidate or raw email digits
  const getCandidateName = () => {
    if (!mounted) return "Candidate";
    const uName = user?.full_name;
    const pName = candProfile?.user?.full_name;
    const email = user?.email;

    if (uName && !uName.toLowerCase().startsWith("demo candidate") && !uName.toLowerCase().startsWith("demo ")) {
      return uName;
    }
    if (pName && !pName.toLowerCase().startsWith("demo candidate") && !pName.toLowerCase().startsWith("demo ")) {
      return pName;
    }
    if (email && email.includes("@")) {
      const prefix = email.split("@")[0];
      if (prefix && prefix !== "candidate" && prefix !== "demo") {
        const clean = prefix.replace(/\d+$/, "");
        if (clean.toLowerCase().startsWith("sachi")) return "Sachin Rawat";
        if (clean.length > 2) return clean.charAt(0).toUpperCase() + clean.slice(1);
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    return uName || pName || "CloudOps Candidate";
  };

  const candidateName = getCandidateName();
  const userXp = candProfile?.xp ?? activeMetrics?.xp ?? (user as any)?.xp ?? 0;
  const userLevel = candProfile?.level ?? activeMetrics?.level ?? (user as any)?.level ?? 1;
  const userStreak = activeMetrics?.streak_days ?? candProfile?.streak_days ?? (user as any)?.streak_days ?? 1;
  const readiness = Math.round(activeMetrics?.readiness_score ?? candProfile?.readiness_score ?? 0);
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
    <div className="flex flex-col gap-6 w-full pb-12 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Dynamic CSS for Outlined Agency Typography */}
      <style jsx global>{`
        .hollow-stroke {
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.88);
          color: transparent;
        }
        html.light .hollow-stroke {
          -webkit-text-stroke: 2px rgba(15, 23, 42, 0.9);
          color: transparent;
        }
      `}</style>

      {/* FULL-WIDTH BACKGROUND VERTICAL GRID LINES MATCHING PUBLIC UI */}
      <div className="fixed inset-0 pointer-events-none z-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 w-full px-6 opacity-15">
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
      </div>

      {/* TOP WELCOME TITLE (AGENCY THEME) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex flex-col gap-1">
          <h1 suppressHydrationWarning className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
            WELCOME BACK, <span className="text-[#FF6B00] font-black">{mounted ? candidateName.split(' ')[0] : "Candidate"}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
            Learn Today. Implement Today. Build Your Career for a Lifetime.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-[#FF9900]/30 text-xs font-bold text-[#FF9900]">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{userStreak} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-500/30 text-xs font-bold text-purple-600 dark:text-purple-400">
            <Trophy className="w-4 h-4 text-purple-500" />
            <span>{userXp.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* ROW 1: YOUR READINESS SCORE */}
      <div className="w-full">
        
        {/* Your Readiness Score Widget */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF9900]" />
              YOUR READINESS SCORE
            </span>
            {readiness >= 80 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Production Ready
              </span>
            ) : readiness > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-[#FF9900] dark:bg-amber-950/50 border border-[#FF9900]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
                AI Evaluated
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                Evaluation Pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 my-1">
            {/* 5-Segment Donut Chart */}
            <div className="relative w-[90px] h-[90px] shrink-0 flex items-center justify-center">
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
                    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="9" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                    {pillars.map((p, i) => {
                      const dash = ((p.val || 0) / total) * circumference;
                      const gap = circumference - dash;
                      const seg = (
                        <circle
                          key={i}
                          cx="50" cy="50" r="38"
                          stroke={p.color}
                          strokeWidth="9"
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
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{readiness}%</span>
                <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest text-center leading-tight mt-0.5">
                  {readiness >= 80 ? "Top 5% Fit" : readiness > 0 ? "Scored" : "Pending"}
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
                    <span className="text-slate-600 dark:text-slate-400 font-bold truncate">{item.name}</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white ml-1 shrink-0">{item.val ?? 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-[#FF9900]/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-xs group"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#FF9900] group-hover:scale-110 transition-transform" />
            <span>View 5-Pillar Rubric Matrix →</span>
          </Link>

        </div>

      </div>

      {/* CORE STUDENT DASHBOARD: 3 PRIMARY QUESTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Question 1: Where am I? */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                01. Current Position
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Stage {userLevel} / 30</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Where am I?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Targeting <span className="font-bold text-slate-900 dark:text-white">{resumeAts.matched_jd || "Senior DevOps Engineer"}</span> ({targetSalaryBand}).
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Readiness Progress:</span>
              <span className="font-mono font-black text-[#FF9900]">{readiness}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF9900] to-amber-400 rounded-full" style={{ width: `${Math.max(readiness, 5)}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
              <span>ATS Score: <strong className="text-slate-900 dark:text-white">{Math.round(resumeAts.score)}%</strong></span>
              <span>Streak: <strong className="text-orange-500">{userStreak} 🔥</strong></span>
            </div>
          </div>

          <Link prefetch={false} href="/interviews" className="w-full py-2 rounded-xl text-xs font-bold text-center text-[#FF9900] bg-amber-50 dark:bg-amber-950/40 border border-[#FF9900]/30 hover:bg-amber-100 transition-colors">
            Jump to Active Stage →
          </Link>
        </div>

        {/* Question 2: How good am I? */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                02. 5-Factor Assessment
              </span>
              <span className="text-xs font-mono font-bold text-emerald-500">Level {userLevel}</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">How good am I?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Skill heat map based on real AI interviews & project audits:
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/30 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                🟢 AWS & Infrastructure
              </span>
              <span className="font-mono text-emerald-600">Strong (88%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-500/30 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                🟠 Terraform & CI/CD
              </span>
              <span className="font-mono text-amber-600">Moderate (68%)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-500/30 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                🔴 DevSecOps & Incident Response
              </span>
              <span className="font-mono text-rose-600">Needs Focus (45%)</span>
            </div>
          </div>

          <Link prefetch={false} href="/performance" className="w-full py-2 rounded-xl text-xs font-bold text-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
            View 5-Dimension Radar Matrix →
          </Link>
        </div>

        {/* Question 3: What should I improve? */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                03. Action Items
              </span>
              <span className="text-xs font-mono font-bold text-purple-500">3 Priority Tasks</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">What should I improve?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Recommended actions to unlock ₹25+ LPA offer letters:
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-medium">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Accept STAR formula suggestions on 3 resume experience bullets.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-medium">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Attempt Stage 5: Live Production Outage Simulation challenge.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs font-medium">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Practice Kubernetes IRSA & Security Scenarios in Teleprompter mode.</span>
            </div>
          </div>

          <Link prefetch={false} href="/study-planner" className="w-full py-2 rounded-xl text-xs font-bold text-center text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 hover:bg-purple-100 transition-colors">
            Open Study Planner →
          </Link>
        </div>
      </div>

      {/* ROW 2: 20 CORE STAGES + 10 BONUS CHALLENGES GRID */}
      <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FF9900]" />
              20 Core Stages + 10 Bonus Challenges (30 Total)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              From Beginner Baby-Steps to 👑 40 LPA Final Boss Battle. Practice with AI Hints or Teleprompter Mode!
            </p>
          </div>
          <Link prefetch={false} href="/interviews" className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-sm shrink-0">
            View All Stages Studio →
          </Link>
        </div>

        {/* 20 Core + 10 Bonus Stages Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 1, title: "Career Pitch & Intro", cat: "Core", diff: "Easy", status: "completed", score: "92%" },
            { id: 2, title: "Linux Systems & CLI", cat: "Core", diff: "Medium", status: "in_progress", score: "Active" },
            { id: 3, title: "AWS IAM & VPC Networking", cat: "Core", diff: "Medium", status: "locked", score: "--" },
            { id: 4, title: "Docker & Containerization", cat: "Core", diff: "Medium", status: "locked", score: "--" },
            { id: 5, title: "Kubernetes Pods & Deployments", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 6, title: "Terraform IaC State & Modules", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 7, title: "CI/CD Pipelines & GitHub Actions", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 8, title: "Prometheus & Grafana Monitoring", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 9, title: "DevSecOps & HashiCorp Vault", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 10, title: "System Design: Microservices", cat: "Core", diff: "Boss", status: "locked", score: "--" },
            { id: 11, title: "Multi-Cloud: AWS vs Azure", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 12, title: "GitOps & ArgoCD Sync", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 13, title: "Service Mesh: Istio Security", cat: "Core", diff: "Boss", status: "locked", score: "--" },
            { id: 14, title: "Database Migration & Backup", cat: "Core", diff: "Medium", status: "locked", score: "--" },
            { id: 15, title: "Serverless AWS Lambda Architect", cat: "Core", diff: "Medium", status: "locked", score: "--" },
            { id: 16, title: "Kafka Event Streaming Ops", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 17, title: "Cost Optimization & FinOps", cat: "Core", diff: "Medium", status: "locked", score: "--" },
            { id: 18, title: "Disaster Recovery & Failover", cat: "Core", diff: "Hard", status: "locked", score: "--" },
            { id: 19, title: "Python Boto3 & Scripting", cat: "Core", diff: "Medium", status: "locked", score: "--" },
            { id: 20, title: "Production Incident War Room", cat: "Core", diff: "Boss", status: "locked", score: "--" },
            { id: 21, title: "Bonus: Zero-Downtime Migration", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 22, title: "Bonus: Chaos Engineering Sim", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 23, title: "Bonus: AI LLM Infra Scaling", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 24, title: "Bonus: Multi-Region Kubernetes", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 25, title: "Bonus: Hardened Linux Security", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 26, title: "Bonus: PCI-DSS Compliance Ops", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 27, title: "Bonus: Observability at Scale", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 28, title: "Bonus: FinOps Cost Cutting Challenge", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 29, title: "Bonus: Real-Time DDoS Mitigation", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
            { id: 30, title: "👑 40 LPA Final Boss Battle", cat: "Final Boss", diff: "Legendary", status: "locked", score: "--" }
          ].slice(0, 10).map((stg) => {
            const isDone = stg.status === "completed";
            const isAct = stg.status === "in_progress";
            return (
              <div 
                key={stg.id}
                onClick={() => router.push(`/interviews/${stg.id}/room`)}
                className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                  isDone 
                    ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/60"
                    : isAct
                    ? "bg-amber-50 dark:bg-amber-950/40 border-[#FF9900] ring-1 ring-[#FF9900]"
                    : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black font-mono text-slate-400">Stage {stg.id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    stg.cat === "Final Boss" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {stg.cat}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                  {stg.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-slate-200/50 dark:border-slate-800">
                  <span className={isDone ? "text-emerald-600 font-bold" : isAct ? "text-[#FF9900] font-black" : "text-slate-400"}>
                    {isDone ? "Score: " + stg.score : isAct ? "Active Stage" : "Locked"}
                  </span>
                  <span className="text-[#FF9900] font-bold">Start →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 3: UPCOMING INTERVIEW + ATS SCORE + TOP SKILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* AI Resume ATS Audit Studio Widget */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-3">
          
          <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF9900]" />
              AI Resume ATS Audit
            </span>
            {resumeAts.score > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-500/30">
                Audited
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-[#FF9900] dark:bg-amber-950/50 border border-[#FF9900]/30">
                Pending Scan
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 my-1">
            {/* ATS Score Ring */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={`${Math.round(resumeAts.score) * 2.51} 251`} 
                  strokeLinecap="round" 
                  className={resumeAts.score >= 75 ? "text-emerald-500" : resumeAts.score > 0 ? "text-[#FF9900]" : "text-slate-300 dark:text-slate-700"} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-slate-900 dark:text-white">{Math.round(resumeAts.score)}%</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">
                  {resumeAts.score >= 80 ? "Target Fit" : resumeAts.score > 0 ? "Good Match" : "Not Audited"}
                </span>
              </div>
            </div>

            {/* Clean Stats Grid */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {(() => {
                const parts = (resumeAts.skills_matched || "0 / 0").split("/").map((s: string) => parseInt(s.trim()) || 0);
                const matchedCount = parts[0] || 0;
                const kwVal = parseInt(resumeAts.keywords_found) || 0;

                return (
                  <div className="flex flex-col gap-1.5 text-[11px] font-medium">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 font-bold truncate">Target JD:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[110px]" title={resumeAts.matched_jd}>
                        {resumeAts.matched_jd}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 font-bold">Skills Found:</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {matchedCount > 0 ? `${matchedCount} Detected` : "Pending Scan"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 font-bold">Keywords Match:</span>
                      <span className="font-bold font-mono text-[#FF9900]">
                        {kwVal > 0 ? `${kwVal}% Aligned` : "0% Match"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <Link prefetch={false}
            href="/resume-ats"
            className="w-full py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-[#FF9900] to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Scan & Upgrade ATS Resume →</span>
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

      {/* ROW 4: STREAK & XP WIDGET */}
      <div className="grid grid-cols-1 gap-5">
        
        {/* Streak & XP Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Streak & XP</span>
          </div>

          <div className="flex items-center gap-8 my-1">
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
          <div className="h-8 w-48 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-1 flex items-end justify-between gap-1 border border-slate-200/50 dark:border-slate-800">
            {[20, 35, 50, 40, 65, 80, 100].map((val, i) => (
              <div key={i} className="flex-1 bg-[#FF9900] rounded-t" style={{ height: `${userXp > 0 ? val : 10}%` }} />
            ))}
          </div>

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
