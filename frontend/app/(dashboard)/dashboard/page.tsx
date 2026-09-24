"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Flame, Zap, Moon, Sun, ArrowRight, Play, Upload, Award, 
  CheckCircle2, Lock, Clock, Calendar, Search, Bell, Sparkles,
  ChevronRight, BarChart2, ShieldCheck, Check, Laptop, Trophy,
  FileText, Cpu, Compass, Settings, HelpCircle, Layers, Video, Share2, Loader2, Send, MessageSquare,
  Linkedin, MessageCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

function parseSessionDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parsedDirect = new Date(dateStr);
  if (!isNaN(parsedDirect.getTime())) return parsedDirect;

  try {
    const cleaned = dateStr.replace(/[•]/g, " ").replace(/\s+/g, " ").trim();
    const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2];
      const year = parseInt(match[3], 10);
      let hours = match[4] ? parseInt(match[4], 10) : 0;
      const mins = match[5] ? parseInt(match[5], 10) : 0;
      const ampm = match[6] ? match[6].toUpperCase() : null;

      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;

      const monthsMap: Record<string, number> = {
        jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
        apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
        aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9,
        nov: 10, november: 10, dec: 11, december: 11
      };
      const mIndex = monthsMap[monthStr.toLowerCase()] ?? 0;
      return new Date(year, mIndex, day, hours, mins);
    }
  } catch (e) {}

  return new Date(0);
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { user, setAuth } = useAuthStore();
  
  const defaultLiveSession = {
    id: "live-default-001",
    title: "👑 40 LPA DevOps Architecture & Outage Troubleshooting Masterclass",
    description: "Live Q&A, mock interview feedback & ATS resume review session with Vikas Sir and Sachin Rawat.",
    session_date: "25 Sept 2026 • 8:15 PM IST",
    meeting_url: "https://meet.google.com/xyz-cloudops-live",
    whatsapp_group_url: "https://chat.whatsapp.com/AIInterviewCommunity",
    banner_url: "/banner-live.png",
    status: "UPCOMING",
    host_name: "Vikas Sir & Sachin Rawat"
  };

  const [dbMetrics, setDbMetrics] = useState<any>(null);
  const [candProfile, setCandProfile] = useState<any>(null);
  const [allLiveSessions, setAllLiveSessions] = useState<any[]>([]);
  const [activeLiveSession, setActiveLiveSession] = useState<any | null>(defaultLiveSession);
  const [selectedGroupTab, setSelectedGroupTab] = useState<string>("ALL");

  // Helper to evaluate currently active session from array sorted by date/time
  const evaluateCurrentActiveSession = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) {
      setActiveLiveSession(null);
      return;
    }

    // 1. Session explicitly marked LIVE_NOW or LIVE_STREAMING takes highest priority
    const liveNow = sessions.find(s => s.status === "LIVE_NOW" || s.status === "LIVE_STREAMING");
    if (liveNow) {
      setActiveLiveSession(liveNow);
      return;
    }

    const now = Date.now();
    const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hour session window

    // 2. Filter sessions whose end time (scheduled time + duration) is in the future
    const upcomingOrCurrent = sessions.filter(s => {
      if (s.status === "COMPLETED") return false;
      const sTime = parseSessionDate(s.session_date).getTime();
      if (sTime === 0) return true; // fallback if date couldn't be parsed
      return (sTime + SESSION_DURATION_MS) > now;
    });

    if (upcomingOrCurrent.length > 0) {
      // Pick the immediate next upcoming session
      setActiveLiveSession(upcomingOrCurrent[0]);
    } else {
      // Array empty or all sessions have finished
      setActiveLiveSession(null);
    }
  };

  const processSessions = (rawItems: any[]) => {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      setAllLiveSessions([]);
      setActiveLiveSession(null);
      return;
    }

    // Sort chronologically by session_date (earliest first)
    const sorted = [...rawItems].sort((a, b) => {
      const isLiveA = a.status === "LIVE_NOW" || a.status === "LIVE_STREAMING";
      const isLiveB = b.status === "LIVE_NOW" || b.status === "LIVE_STREAMING";
      if (isLiveA) return -1;
      if (isLiveB) return 1;

      const dtA = parseSessionDate(a.session_date).getTime();
      const dtB = parseSessionDate(b.session_date).getTime();
      return dtA - dtB;
    });

    setAllLiveSessions(sorted);
    evaluateCurrentActiveSession(sorted);
  };

  // LinkedIn Post Creator State
  const [linkedInText, setLinkedInText] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("https://www.linkedin.com/in/sachin-rawat");
  const [linkedInShareUrl, setLinkedInShareUrl] = useState<string | null>(null);
  const [isPublishingLinkedIn, setIsPublishingLinkedIn] = useState(false);
  const [linkedInSuccessMsg, setLinkedInSuccessMsg] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    if (!activeLiveSession) return;

    const targetDate = parseSessionDate(activeLiveSession.session_date);
    const targetMs = targetDate.getTime();

    const updateCountdown = () => {
      const now = Date.now();

      // Check if session date has passed (more than 2 hours ago)
      if (targetMs > 0 && (now - targetMs > 2 * 60 * 60 * 1000) && activeLiveSession.status !== "LIVE_NOW") {
        evaluateCurrentActiveSession(allLiveSessions);
        return;
      }

      const diff = Math.max(0, targetMs - now);
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0")
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeLiveSession, allLiveSessions]);

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
    // 1. Fetch Active Live Sessions immediately & sort chronologically
    apiFetch("/live-sessions/active")
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          processSessions(res.data);
        } else {
          processSessions([defaultLiveSession]);
        }
      })
      .catch(() => {
        processSessions([defaultLiveSession]);
      });

    // 2. Fetch Real User DB Metrics & Profile data
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

  // Default initial candidate metrics
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
  const resumeAts = activeMetrics?.resume_ats || defaultCandidateMetrics.resume_ats;
  const topSkills = activeMetrics?.top_skills || defaultCandidateMetrics.top_skills;
  const upcomingInterview = activeMetrics?.upcoming_interview || {
    title: "Stage 3: Multi-Cloud Architecture",
    subtitle: "AWS VPC, IAM, IRSA, Networking",
    date: "Today",
    time: "10:00 AM"
  };

  // Group-Wise 30 Stage Categories
  const stageGroups = [
    {
      groupId: "TRACK_1",
      groupTitle: "Track 1: Profile & Resume Pitch",
      description: "Foundational self-presentation & resume alignment",
      stages: [
        { id: 1, title: "Career Pitch & Intro", cat: "Core", diff: "Easy", status: "in_progress", score: "Active" },
        { id: 2, title: "Resume ATS Gap Matcher", cat: "Core", diff: "Easy", status: "locked", score: "--" },
        { id: 3, title: "STAR Formula Experience Pitch", cat: "Core", diff: "Medium", status: "locked", score: "--" },
        { id: 4, title: "Technical Behavioral Q&A", cat: "Core", diff: "Medium", status: "locked", score: "--" },
        { id: 5, title: "Soft Skills & Leadership Pitch", cat: "Core", diff: "Medium", status: "locked", score: "--" }
      ]
    },
    {
      groupId: "TRACK_2",
      groupTitle: "Track 2: Linux & Cloud Systems Fundamentals",
      description: "CLI, OS Kernel, Networking & AWS Cloud Basics",
      stages: [
        { id: 6, title: "Linux Systems & CLI Commands", cat: "Core", diff: "Medium", status: "locked", score: "--" },
        { id: 7, title: "Linux Heap & Disk I/O Triage", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 8, title: "AWS IAM & Security Boundaries", cat: "Core", diff: "Medium", status: "locked", score: "--" },
        { id: 9, title: "AWS VPC & Subnet Networking", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 10, title: "AWS EC2 & S3 Storage Ops", cat: "Core", diff: "Medium", status: "locked", score: "--" }
      ]
    },
    {
      groupId: "TRACK_3",
      groupTitle: "Track 3: Multi-Cloud Architecture & Containers",
      description: "Docker multi-stage, Kubernetes EKS & Helm",
      stages: [
        { id: 11, title: "Docker & Containerization", cat: "Core", diff: "Medium", status: "locked", score: "--" },
        { id: 12, title: "Kubernetes Pods & Deployments", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 13, title: "Kubernetes EKS IRSA & RBAC", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 14, title: "Terraform IaC State & Modules", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 15, title: "Multi-Cloud: AWS vs Azure Architect", cat: "Core", diff: "Boss", status: "locked", score: "--" }
      ]
    },
    {
      groupId: "TRACK_4",
      groupTitle: "Track 4: DevOps Pipelines & Observability",
      description: "GitHub Actions, ArgoCD GitOps, Prometheus & Grafana",
      stages: [
        { id: 16, title: "CI/CD GitHub Actions & Jenkins", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 17, title: "GitOps & ArgoCD Automated Sync", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 18, title: "Prometheus & Grafana Alerting", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 19, title: "DevSecOps & Trivy Vulnerability Scan", cat: "Core", diff: "Hard", status: "locked", score: "--" },
        { id: 20, title: "Service Mesh: Istio Security Rules", cat: "Core", diff: "Boss", status: "locked", score: "--" }
      ]
    },
    {
      groupId: "TRACK_5",
      groupTitle: "Track 5: Incident War Room & Final Boss Battles",
      description: "Live Outages, Zero-Downtime Migration & 40 LPA Final Boss",
      stages: [
        { id: 21, title: "Production Outage War Room", cat: "Core", diff: "Boss", status: "locked", score: "--" },
        { id: 22, title: "Bonus: Zero-Downtime DB Migration", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 23, title: "Bonus: Chaos Engineering Mesh Sim", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 24, title: "Bonus: AI LLM Infra Scaling Ops", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 25, title: "Bonus: Real-Time DDoS Mitigation", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 26, title: "Bonus: Hardened Kernel Security", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 27, title: "Bonus: PCI-DSS Compliance Audit", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 28, title: "Bonus: Observability at 10M RPM Scale", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 29, title: "Bonus: FinOps Cost Cutting Challenge", cat: "Bonus", diff: "Extreme", status: "locked", score: "--" },
        { id: 30, title: "👑 40 LPA Final Boss Battle", cat: "Final Boss", diff: "Legendary", status: "locked", score: "--" }
      ]
    }
  ];

  // Auto-fill LinkedIn Post Template
  const generateLinkedInTemplate = () => {
    const text = `🚀 Proud to share my progress on CloudOps AI Candidate Preparation OS!

🎯 Target Role: ${candProfile?.target_role || "Senior DevOps Engineer"}
📊 Readiness Benchmark Score: ${readiness}%
🔥 Current Streak: ${userStreak} Days | XP Earned: ${userXp} XP

Currently mastering 30 Voice AI Interview Challenges, AWS VPC/EKS Security, Terraform IaC, and Production Outage Simulations.

Learn Today. Implement Today. Build Your Career for a Lifetime.

#DevOps #CloudEngineering #AWS #Kubernetes #CareerGrowth #CloudOpsAI`;
    setLinkedInText(text);
  };

  const handlePublishLinkedIn = async () => {
    if (!linkedInText.trim()) {
      generateLinkedInTemplate();
      return;
    }
    setIsPublishingLinkedIn(true);
    setLinkedInSuccessMsg(null);
    try {
      const res = await apiFetch("/linkedin/publish-post", {
        method: "POST",
        body: JSON.stringify({
          content: linkedInText,
          target_role: candProfile?.target_role || "Senior DevOps Engineer",
          readiness_score: readiness
        })
      });
      setLinkedInSuccessMsg(res?.message || "Post published successfully to LinkedIn!");
    } catch (err: any) {
      setLinkedInSuccessMsg("Post prepared! Ready for official LinkedIn authorization & publishing.");
    } finally {
      setIsPublishingLinkedIn(false);
    }
  };

  // Candidate Audit & Social Share Handlers
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [claimedAuditBonus, setClaimedAuditBonus] = useState(false);

  const handleShareLinkedIn = () => {
    const pts = userXp || 2151;
    const shareText = `🎉 I'm currently advancing on the @CloudDevOpsHub Candidate Portal with ${pts} XP!\n\nTarget Role: ${candProfile?.target_role || "Senior DevOps Engineer"}\nReadiness Benchmark: ${readiness}%\nStreak: ${userStreak} Days 🔥\n\nMentored by Vikas Ratnawat (Multi-Cloud & DevOps With AI). 🚀\n\nCandidate Portal: ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}\n#CloudDevOpsHub #VikasRatnawat #DayOne #Kubernetes #AWS #DevOpsAI`;

    const encodedText = encodeURIComponent(shareText);
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;

    const width = 620;
    const height = 680;
    const left = typeof window !== "undefined" ? (window.innerWidth - width) / 2 : 100;
    const top = typeof window !== "undefined" ? (window.innerHeight - height) / 2 : 100;

    window.open(shareUrl, "LinkedInShareCompose", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
  };

  const handleShareWhatsApp = () => {
    const pts = userXp || 2151;
    const shareText = `🎉 I'm advancing on the CloudDevOpsHub Candidate Portal with ${pts} XP & ${readiness}% Readiness Score! 🚀 Check out my progress here: ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleShareX = () => {
    const pts = userXp || 2151;
    const shareText = `🎉 Advancing on @CloudDevOpsHub Candidate Portal with ${pts} XP & ${readiness}% Readiness Score! 🚀 #CloudDevOpsHub #DevOps`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleOpenAuditModal = () => {
    setIsAuditModalOpen(true);
    setClaimedAuditBonus(false);
  };

  const handleClaimAuditPointsBonus = async () => {
    try {
      await apiFetch("/candidates/claim-badge", {
        method: "POST",
        body: JSON.stringify({
          badge_id: "dashboard_audit_bonus",
          badge_title: "LinkedIn Share Candidate Audit Bonus"
        })
      });
      setClaimedAuditBonus(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userProfileUpdated"));
      }
    } catch (e) {
      setClaimedAuditBonus(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userProfileUpdated"));
      }
    }
  };

  const mappedStageGroups = stageGroups.map((group) => ({
    ...group,
    stages: group.stages.map((stg) => {
      const match = dbMetrics?.stages_progress?.find((sp: any) => sp.id === stg.id);
      if (match) {
        return {
          ...stg,
          status: match.status || stg.status,
          score: match.score || stg.score
        };
      }
      return stg;
    })
  }));

  const visibleGroups = selectedGroupTab === "ALL" 
    ? mappedStageGroups 
    : mappedStageGroups.filter(g => g.groupId === selectedGroupTab);

  return (
    <div className="flex flex-col gap-6 w-full pb-12 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* Dynamic CSS */}
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

      {/* BACKGROUND VERTICAL GRID LINES */}
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

      {/* TOP WELCOME TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex flex-col gap-1">
          <h1 suppressHydrationWarning className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
            WELCOME BACK, <span className="text-[#FF6B00] font-black">{mounted ? candidateName.split(' ')[0] : "Candidate"}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
            Learn Today. Implement Today. Build Your Career for a Lifetime.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap self-start md:self-auto">
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

      {/* HERO EVENT CARD WITH LIVE COUNTDOWN CLOCK OR COMING SOON FALLBACK */}
      {activeLiveSession ? (
        <div className="relative z-10 p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#070D18] border-2 border-[#FF6B00]/40 shadow-2xl shadow-[#FF6B00]/15 overflow-hidden flex flex-col gap-6 text-white backdrop-blur-xl">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Live Beacon Badge & Event Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-md ${
                activeLiveSession.status === "LIVE_NOW" || activeLiveSession.status === "LIVE_STREAMING"
                  ? "bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 text-white shadow-rose-600/30"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-amber-500/30"
              }`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                {activeLiveSession.status === "LIVE_NOW" || activeLiveSession.status === "LIVE_STREAMING" ? "● LIVE STREAMING NOW" : "UPCOMING LIVE MASTERCLASS"}
              </span>

              <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-black bg-white/10 text-amber-300 border border-amber-400/30">
                📅 {activeLiveSession.session_date}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 text-[11px] font-black">
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Host: {activeLiveSession.host_name || "Vikas Sir & Sachin Rawat"}</span>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="flex flex-col gap-2 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-snug drop-shadow-md">
              {activeLiveSession.title || "👑 40 LPA DevOps Architecture & Outage Masterclass"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed max-w-3xl">
              {activeLiveSession.description || "Live Q&A, mock interview feedback & ATS resume review session with Vikas Sir and Sachin Rawat."}
            </p>
          </div>

          {/* COUNTDOWN CLOCK & DIRECT ACTION BUTTONS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 pt-2 border-t border-white/10">
            
            {/* Countdown Timer Block (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-2">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                EVENT STARTS IN (LIVE COUNTDOWN):
              </span>
              
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{countdown.days}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">DAYS</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{countdown.hours}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">HOURS</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight">{countdown.minutes}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">MINS</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FF6B00]/25 border border-[#FF6B00]/50 backdrop-blur-md">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#FF6B00] tracking-tight">{countdown.seconds}</span>
                  <span className="text-[9px] font-black text-orange-300 uppercase tracking-wider">SECS</span>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons Block (6 cols) */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3">
              
              {/* Zoom Button */}
              <button
                type="button"
                onClick={() => {
                  const url = activeLiveSession.meeting_url || "https://meet.google.com/xyz-cloudops-live";
                  try {
                    apiFetch("/live-sessions/track-click", {
                      method: "POST",
                      body: JSON.stringify({
                        live_session_id: activeLiveSession?.id || "live-default-001",
                        session_title: activeLiveSession?.title || "👑 40 LPA DevOps Architecture Masterclass",
                        candidate_name: candidateName,
                        candidate_email: (user as any)?.email || "candidate@cloudops.internal",
                        platform_clicked: "ZOOM"
                      })
                    }).catch(() => {});
                  } catch {}
                  if (typeof window !== "undefined") window.open(url, "_blank");
                }}
                className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-blue-900/40 border border-blue-400/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase group"
              >
                <Video className="w-5 h-5 text-white" />
                <span>Zoom Live Room</span>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* WhatsApp Button */}
              <button
                type="button"
                onClick={() => {
                  const url = activeLiveSession.whatsapp_group_url || "https://chat.whatsapp.com/LOxsACQwbGgAudjaC3qhOJ";
                  try {
                    apiFetch("/live-sessions/track-click", {
                      method: "POST",
                      body: JSON.stringify({
                        live_session_id: activeLiveSession?.id || "live-default-001",
                        session_title: activeLiveSession?.title || "👑 40 LPA DevOps Architecture Masterclass",
                        candidate_name: candidateName,
                        candidate_email: (user as any)?.email || "candidate@cloudops.internal",
                        platform_clicked: "WHATSAPP"
                      })
                    }).catch(() => {});
                  } catch {}
                  if (typeof window !== "undefined") window.open(url, "_blank");
                }}
                className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-900/40 border border-emerald-400/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase group"
              >
                <MessageSquare className="w-5 h-5 text-white fill-white/20" />
                <span>WhatsApp Group</span>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10 text-[10.5px] font-black text-slate-400 uppercase tracking-widest relative z-10 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              PRACTICE • EXPERT FEEDBACK • GET PLACED
            </span>
            <span className="text-[#FF6B00] font-mono font-black">
              LIVE INTERACTIVE MOCK SESSIONS & ATS RESUME REVIEWS
            </span>
          </div>

        </div>
      ) : (
        /* UPCOMING SESSION COMING SOON FALLBACK BANNER */
        <div className="relative z-10 p-6 sm:p-8 rounded-[32px] bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#070D18] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col gap-6 text-white backdrop-blur-xl">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag & Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-500/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
                </span>
                SCHEDULE UPDATE
              </span>

              <span className="px-3.5 py-1 rounded-full text-[11px] font-mono font-black bg-white/10 text-amber-300 border border-amber-400/30">
                ⏳ UPCOMING SESSIONS
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 text-[11px] font-black">
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Host: Vikas Sir & Sachin Rawat</span>
            </div>
          </div>

          {/* Main Heading & Message */}
          <div className="flex flex-col gap-2 relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-snug drop-shadow-md flex items-center gap-3">
              <span>🚀 UPCOMING SESSION COMING SOON</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold leading-relaxed max-w-3xl">
              All previous live masterclasses & mock sessions are completed! New live webinars, ATS resume reviews, and 40 LPA DevOps architectural workshops will be scheduled soon. Join our WhatsApp community for instant alerts!
            </p>
          </div>

          {/* Action Buttons & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10 pt-2 border-t border-white/10">
            
            <div className="lg:col-span-6 flex items-center gap-3 text-xs text-amber-400 font-bold">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <span>Stay ahead! Practice AI interview stages below while next live session schedule is being published.</span>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.open("https://chat.whatsapp.com/LOxsACQwbGgAudjaC3qhOJ", "_blank");
                }}
                className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-900/40 border border-emerald-400/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase group"
              >
                <MessageSquare className="w-5 h-5 text-white fill-white/20" />
                <span>Join WhatsApp Group</span>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10 text-[10.5px] font-black text-slate-400 uppercase tracking-widest relative z-10 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              PRACTICE • EXPERT FEEDBACK • GET PLACED
            </span>
            <span className="text-[#FF6B00] font-mono font-black">
              SCHEDULE UPDATED AUTOMATICALLY IN REAL-TIME
            </span>
          </div>

        </div>
      )}



      {/* GROUP-WISE STAGE MANAGEMENT (REQUIREMENT 8 INTEGRATION) */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-5 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 uppercase">
              <Trophy className="w-5 h-5 text-[#FF9900]" />
              Group-Wise Stage Management (30 Total Stages)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Organized into 5 Assessment Tracks: Fundamentals, Multi-Cloud, DevOps Pipelines, Incident Ops & Boss Battles.
            </p>
          </div>

          {/* Group Track Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "All Tracks" },
              { id: "TRACK_1", label: "Track 1" },
              { id: "TRACK_2", label: "Track 2" },
              { id: "TRACK_3", label: "Track 3" },
              { id: "TRACK_4", label: "Track 4" },
              { id: "TRACK_5", label: "Track 5" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedGroupTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedGroupTab === tab.id
                    ? "bg-[#FF6B00] text-white font-black shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Group Tracks Display */}
        <div className="flex flex-col gap-8">
          {visibleGroups.map((group) => (
            <div key={group.groupId} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {group.groupTitle}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{group.description}</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#FF6B00]">
                  {group.stages.length} Stages
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {group.stages.map((stg) => {
                  const isDone = stg.status === "completed";
                  const isAct = stg.status === "in_progress";
                  return (
                    <div 
                      key={stg.id}
                      onClick={() => router.push(`/interviews/${stg.id}/room`)}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
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
          ))}
        </div>

      </div>



      {/* CANDIDATE AUDIT & POINT CLAIM MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                  {candidateName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CD"}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {candidateName} (YOU)
                  </h3>
                  <span className="text-xs font-bold text-[#FF6B00]">
                    {candProfile?.target_role || "Senior DevOps Engineer"} • Batch 45
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer font-black text-lg"
              >
                ✕
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">TOTAL XP COINS</span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
                  🪙 {userXp.toLocaleString()} XP
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">READINESS BENCHMARK</span>
                <span className="text-xl font-mono font-black text-emerald-500">
                  {readiness}%
                </span>
              </div>
            </div>

            {/* Additional Audit Details */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Resume ATS Match Score:</span>
                <span className="font-mono font-black text-[#FF6B00]">{resumeAts.score || 85}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Target Salary Band:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{targetSalaryBand}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Current Daily Streak:</span>
                <span className="font-mono font-bold text-amber-500">🔥 {userStreak} Days</span>
              </div>
            </div>

            {/* Top Verified Skills */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Top Verified Technical Skills:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(topSkills && topSkills.length > 0 ? topSkills : ["Linux Admin", "AWS VPC", "Docker", "Kubernetes", "Terraform"]).map((sk: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Claim +50 Points Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              {claimedAuditBonus ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>🎉 +50 PTS Bonus Claimed & Added to Wallet Balance!</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimAuditPointsBonus}
                  className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Claim +50 Points LinkedIn Share Bonus 🚀</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
