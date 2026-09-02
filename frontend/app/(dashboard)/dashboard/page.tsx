"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cloud, Play, CheckCircle2, AlertTriangle, 
  Clock, ArrowRight, BookOpen, Layers, Award, Loader2, Sparkles,
  Flame, Star, ShieldCheck, Zap, TrendingUp, Trophy, FileText, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { InterviewTemplate, Candidate } from "@/types";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  // Profile Modal & OTP verification state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [salaryBandInput, setSalaryBandInput] = useState("₹18–25 LPA");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const tRes = await apiFetch("/interviews/templates");
        setTemplates(tRes.data || []);

        const cRes = await apiFetch(`/candidates/me/profile`);
        if (cRes.data) {
          setCandidateProfile(cRes.data);
          setPhoneInput(cRes.data.phone || "+91 98765 43210");
          setTargetRoleInput(cRes.data.target_role || "Senior DevOps Engineer");
          setSalaryBandInput(cRes.data.target_salary_band || "₹18–25 LPA");
        }
      } catch (e) {
        console.warn("Failed to fetch dashboard data:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await apiFetch("/candidates/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          phone: phoneInput,
          target_role: targetRoleInput,
          target_salary_band: salaryBandInput
        })
      });
      setCandidateProfile(res.data);
      alert("Profile updated successfully!");
      setIsProfileModalOpen(false);
    } catch (e: any) {
      alert("Failed to update profile: " + (e.message || "Error"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length < 4) {
      alert("Please enter a 4-6 digit OTP");
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await apiFetch("/candidates/me/verify-otp", {
        method: "POST"
      });
      setCandidateProfile(res.data);
      alert("🎉 Mobile verified! +50 XP and 'Verified Candidate' badge awarded!");
      setOtpSent(false);
      setIsProfileModalOpen(false);
    } catch (e: any) {
      alert("Failed to verify OTP: " + (e.message || "Error"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartInterview = async (templateId: string) => {
    setStartingId(templateId);
    try {
      const res = await apiFetch("/attempts/start", {
        method: "POST",
        body: JSON.stringify({ interview_template_id: templateId }),
      });
      const attemptId = res.data.id;
      router.push(`/interviews/${attemptId}/pre-check`);
    } catch (err: any) {
      alert(err.message || "Failed to start interview attempt");
      setStartingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const activeTemplate = templates[0];
  const readiness = candidateProfile?.readiness_score || 84;
  const xp = candidateProfile?.xp || 3450;
  const level = candidateProfile?.level || 4;
  const streak = candidateProfile?.streak_days || 12;
  const targetBand = candidateProfile?.target_salary_band || "₹18–25 LPA";
  const badges = candidateProfile?.badges_json || ["Linux Warrior", "Cloud Explorer", "AWS Ninja", "Kubernetes Warrior"];
  const isVerified = badges.includes("Verified Candidate");

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Gamified Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-indigo-500/20 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-3 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Level {level} Cloud Engineer
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {streak} Day Streak
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-cyan-400" />
              {xp.toLocaleString()} XP
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || "Rahul Sharma"}! 👋
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Your journey to crack high-package DevOps & CloudOps roles. Pass each challenge stage with <strong className="text-cyan-300">≥ 80% score</strong> to unlock the 40 LPA Final Boss interview.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Target Role & Verify Mobile</span>
            </button>
            {isVerified ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Candidate
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Phone Unverified (+50 XP)
              </span>
            )}
          </div>
        </div>

        {/* Readiness Target Metric */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 text-center sm:text-right min-w-[200px] flex flex-col gap-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Interview Readiness</span>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span className="text-3xl font-black text-cyan-400 font-mono">{readiness}%</span>
              <span className="text-xs text-slate-400 font-mono">Ready</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden my-1">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: `${readiness}%` }} />
            </div>
            <span className="text-[11px] font-mono text-emerald-300 font-semibold block">Target: {targetBand}</span>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Recommended Next Challenge & Skills Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Next Challenge Banner */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Recommended Next Step
              </span>
              <span className="text-xs text-slate-400 font-mono">Stage 04 / 05</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                🚀 Challenge 04 — DevOps & Containerization Engineer
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Tackle Docker multi-stage build optimization, Kubernetes StatefulSets vs Deployments, and zero-downtime Blue/Green release architectures.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Passing: <strong className="text-cyan-300">80%</strong></span>
              <span>Reward: <strong className="text-amber-300">+300 XP</strong></span>
              <span>Mode: <strong className="text-indigo-300">Practice & Voice</strong></span>
            </div>

            {activeTemplate && (
              <button
                onClick={() => handleStartInterview(activeTemplate.id)}
                disabled={startingId === activeTemplate.id}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {startingId === activeTemplate.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching Chamber...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch Challenge 04</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Skills Mastery Matrix */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Skills Mastery Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">Real-time performance across technical domains</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { skill: "Linux Systems", score: 88, color: "bg-emerald-400" },
              { skill: "AWS Cloud", score: 84, color: "bg-cyan-400" },
              { skill: "Docker & K8s", score: 78, color: "bg-indigo-400" },
              { skill: "Terraform IaC", score: 74, color: "bg-purple-400" },
              { skill: "DevSecOps", score: 62, color: "bg-amber-400" },
              { skill: "AI Automation", score: 55, color: "bg-rose-400" }
            ].map((s) => (
              <div key={s.skill} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{s.skill}</span>
                  <span className="text-white font-bold">{s.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Improve:</span>
            <span className="text-rose-300 font-medium">🔴 DevSecOps & AI</span>
          </div>
        </div>
      </div>

      {/* 5 Core Challenge Stages Progression Map */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">5 Core Career Challenge Stages</h2>
            <p className="text-xs text-slate-400">Progression ladder from Foundation to the Production Incident Final Boss</p>
          </div>
          <Link
            href="/resume-ats"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Check Resume Match</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              num: 1,
              title: "Introduce Yourself",
              tag: "Profile",
              score: 86,
              status: "PASSED",
              badge: "Linux Warrior",
              icon: "🏆",
              desc: "Personal pitch & technical stack overview."
            },
            {
              num: 2,
              title: "Linux Warrior",
              tag: "Diagnostics",
              score: 84,
              status: "PASSED",
              badge: "Cloud Explorer",
              icon: "🐧",
              desc: "I/O wait, systemd triage, and socket binding."
            },
            {
              num: 3,
              title: "Cloud Infrastructure",
              tag: "AWS & IAM",
              score: 82,
              status: "PASSED",
              badge: "AWS Ninja",
              icon: "☁️",
              desc: "IAM Roles/STS, VPC routing, and NAT Gateways."
            },
            {
              num: 4,
              title: "DevOps & Containers",
              tag: "CI/CD & K8s",
              score: null,
              status: "IN_PROGRESS",
              badge: "Kubernetes Warrior",
              icon: "🚀",
              desc: "Multi-stage Docker, StatefulSets, Canary rollouts."
            },
            {
              num: 5,
              title: "Troubleshooting Boss",
              tag: "Incident Response",
              score: null,
              status: "LOCKED",
              badge: "40 LPA Challenger",
              icon: "🔥",
              desc: "Final Boss: CrashLoopBackOff & 502/504 errors."
            }
          ].map((stage) => {
            const isPassed = stage.status === "PASSED";
            const isInProgress = stage.status === "IN_PROGRESS";
            const isLocked = stage.status === "LOCKED";

            return (
              <div
                key={stage.num}
                className={`p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                  isPassed
                    ? "bg-slate-900/80 border-emerald-500/30"
                    : isInProgress
                    ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                    : "bg-slate-950/40 border-white/5 opacity-60"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{stage.icon}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isPassed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : isInProgress
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {stage.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">Challenge 0{stage.num}</span>
                    <h4 className="font-bold text-white text-sm leading-tight">{stage.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{stage.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  {isPassed ? (
                    <>
                      <span className="text-emerald-400 font-bold">{stage.score}% Score</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </>
                  ) : isInProgress ? (
                    <>
                      <span className="text-cyan-300 font-bold">Active Round</span>
                      <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500">Requires Stage 04</span>
                      <span className="text-slate-500">🔒</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earned Badges & Trophy Cabinet */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Your Badges & Achievements ({badges.length})
          </h3>
          <Link href="/leaderboard" className="text-xs text-indigo-400 hover:text-indigo-300 font-mono transition-colors">
            View Global Leaderboard →
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {badges.map((b) => (
            <div key={b} className="px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-medium text-slate-200">{b}</span>
            </div>
          ))}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/40 border border-white/5 flex items-center gap-2 opacity-50">
            <span className="text-slate-500">🔒</span>
            <span className="text-xs font-mono text-slate-500">40 LPA Final Boss Challenger</span>
          </div>
        </div>
      </div>

      {/* Profile Settings & OTP Verification Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Candidate Profile & Verification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize your career targets and verify your contact details</p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Target Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-400">Target Role Title:</label>
                <input
                  type="text"
                  value={targetRoleInput}
                  onChange={(e) => setTargetRoleInput(e.target.value)}
                  placeholder="e.g. Senior DevOps Engineer / CloudOps Architect"
                  className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Target Salary Band */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-slate-400">Target Salary CTC Band:</label>
                <div className="grid grid-cols-3 gap-2">
                  {["₹12–18 LPA", "₹18–25 LPA", "₹25–40 LPA"].map((band) => (
                    <button
                      key={band}
                      onClick={() => setSalaryBandInput(band)}
                      className={`p-2 rounded-xl text-xs font-mono transition-all border ${
                        salaryBandInput === band
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                          : "bg-slate-950 text-slate-400 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      {band}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone & OTP Verification */}
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-950/80 border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 font-bold">Mobile Phone Verification (+50 XP):</label>
                  {isVerified ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">Unverified</span>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+91 98765 43210"
                    disabled={isVerified}
                    className="flex-1 rounded-xl bg-slate-900 border border-white/10 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                  />
                  {!isVerified && !otpSent && (
                    <button
                      onClick={() => setOtpSent(true)}
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono shrink-0 transition-colors"
                    >
                      Send OTP
                    </button>
                  )}
                </div>

                {!isVerified && otpSent && (
                  <div className="flex gap-2 pt-2 animate-fadeIn">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP (e.g. 552140)"
                      className="flex-1 rounded-xl bg-slate-900 border border-amber-500/40 p-2.5 text-xs text-amber-200 font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      disabled={isSavingProfile}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs font-mono shrink-0 transition-all"
                    >
                      Verify (+50 XP)
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
