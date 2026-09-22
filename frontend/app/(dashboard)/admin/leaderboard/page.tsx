"use client";
// Updated: 2026-09-21 Admin Leaderboard Restored 3D Hexagon Badges without text truncation

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Flame, Star, Award, ShieldCheck, 
  TrendingUp, Users, ArrowUpRight, Loader2, Sparkles,
  Search, Share2, CheckCircle2, Linkedin, ExternalLink, X as XIcon, MessageCircle, Terminal
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CurriculumBadge {
  id: string;
  modNum: string;
  title: string;
  sub: string;
  variant: "teal" | "red" | "amber" | "purple" | "blue";
}

const MODULE_BADGES: CurriculumBadge[] = [
  { id: "mod-1", modNum: "MODULE 01", title: "FOUNDATIONS & AI", sub: "CloudOpsHub", variant: "teal" },
  { id: "mod-2", modNum: "MODULE 02", title: "LINUX", sub: "UBUNTU + GCP", variant: "red" },
  { id: "mod-3", modNum: "MODULE 03", title: "AWS", sub: "SERVICES", variant: "amber" },
  { id: "mod-4", modNum: "MODULE 04", title: "CI/CD", sub: "GIT & JENKINS", variant: "purple" },
  { id: "mod-5", modNum: "MODULE 05", title: "KUBERNETES", sub: "EKS + HELM", variant: "blue" },
];

const HexagonBadge = ({ badge }: { badge: CurriculumBadge }) => {
  const colorMap = {
    teal: {
      from: "#007991", to: "#78FFD6", border: "#78FFD6", text: "text-[#78FFD6]"
    },
    red: {
      from: "#cb2d3e", to: "#ef473a", border: "#ef473a", text: "text-red-200"
    },
    amber: {
      from: "#ff9900", to: "#ff5500", border: "#ffb700", text: "text-amber-200"
    },
    purple: {
      from: "#8E2DE2", to: "#4A00E0", border: "#c471ed", text: "text-purple-200"
    },
    blue: {
      from: "#00c6ff", to: "#0072ff", border: "#00c6ff", text: "text-cyan-200"
    }
  };

  const c = colorMap[badge.variant] || colorMap.amber;

  return (
    <div 
      className="relative w-14 h-16 shrink-0 flex flex-col items-center justify-center text-center p-1 cursor-pointer transition-transform hover:scale-110 drop-shadow-md group"
      title={`${badge.modNum}: ${badge.title} (${badge.sub})`}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-admin-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        </defs>
        <path 
          d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" 
          fill={`url(#grad-admin-${badge.id})`} 
          stroke={c.border} 
          strokeWidth="3.5" 
          opacity="0.95" 
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-white w-full max-w-[44px] px-0.5 leading-none overflow-hidden text-center">
        <span className="text-[6px] font-mono font-black uppercase tracking-tighter text-slate-100 opacity-90 truncate max-w-full">{badge.modNum}</span>
        <span className="text-[7px] font-black uppercase tracking-tight text-white leading-tight font-sans mt-0.5 drop-shadow-sm text-center break-words line-clamp-2 max-w-full">{badge.title}</span>
        <span className="text-[5.5px] font-mono font-bold opacity-85 uppercase tracking-tighter text-slate-200 truncate max-w-full mt-0.5">{badge.sub}</span>
        <div className="flex items-center justify-center gap-0.5 mt-0.5 text-amber-300 text-[6px]">
          ★ ★ ★
        </div>
      </div>
    </div>
  );
};

export default function AdminLeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "improved" | "tech">("global");
  const [selectedTech, setSelectedTech] = useState<string>("AWS");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Candidate Audit Modal State
  const [selectedCandidateAudit, setSelectedCandidateAudit] = useState<any | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [claimedBonus, setClaimedBonus] = useState(false);

  // Leaderboard Members List
  const [members, setMembers] = useState<any[]>([
    {
      rank: 1,
      name: "Sachin Rawat",
      initials: "SR",
      linkedinUrl: "https://www.linkedin.com/in/sachin-rawat/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 42,
      pts: 4200,
      badgeCountTotal: 7,
      role: "Senior DevOps Engineer",
      readinessScore: 88,
      salaryBand: "₹25–40 LPA",
      streak: 15
    },
    {
      rank: 2,
      name: "Neha Nair",
      initials: "NN",
      linkedinUrl: "https://www.linkedin.com/in/neha-nair/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 16,
      pts: 1600,
      badgeCountTotal: 7,
      role: "Multi-Cloud Architect",
      readinessScore: 94,
      salaryBand: "₹25–40 LPA",
      streak: 20
    },
    {
      rank: 3,
      name: "Aarav Sharma",
      initials: "AS",
      linkedinUrl: "https://www.linkedin.com/in/aarav-sharma/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 14,
      pts: 1450,
      badgeCountTotal: 6,
      role: "Senior DevOps Engineer",
      readinessScore: 92.5,
      salaryBand: "₹25–40 LPA",
      streak: 1
    },
    {
      rank: 4,
      name: "Ananya Verma",
      initials: "AV",
      linkedinUrl: "https://www.linkedin.com/in/ananya-verma/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[4]],
      extraBadgesCount: 4,
      postsCount: 13,
      pts: 1300,
      badgeCountTotal: 5,
      role: "Site Reliability Engineer",
      readinessScore: 90,
      salaryBand: "₹25–40 LPA",
      streak: 15
    },
    {
      rank: 5,
      name: "Rohan Gupta",
      initials: "RG",
      linkedinUrl: "https://www.linkedin.com/in/rohan-gupta/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 9,
      pts: 950,
      badgeCountTotal: 4,
      role: "Kubernetes & SRE Specialist",
      readinessScore: 84,
      salaryBand: "₹18–25 LPA",
      streak: 6
    },
    {
      rank: 6,
      name: "Vikram Singh",
      initials: "VS",
      linkedinUrl: "https://www.linkedin.com/in/vikram-singh/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 6,
      pts: 650,
      badgeCountTotal: 4,
      role: "Cloud Infrastructure Engineer",
      readinessScore: 79.5,
      salaryBand: "₹12–18 LPA",
      streak: 4
    },
    {
      rank: 7,
      name: "Kabir Mehta",
      initials: "KM",
      linkedinUrl: "https://www.linkedin.com/in/kabir-mehta/",
      batch: "Batch 45",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 5,
      pts: 580,
      badgeCountTotal: 3,
      role: "Platform Engineer",
      readinessScore: 75,
      salaryBand: "₹12–18 LPA",
      streak: 2
    }
  ]);

  useEffect(() => {
    async function loadLeaderboardData() {
      try {
        const res: any = await apiFetch("/leaderboard");
        const list = res?.data?.global_ranking || res?.global_ranking;

        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((item: any, idx: number) => {
            const nameStr = item.candidate_name || "Candidate User";
            const init = nameStr.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            return {
              rank: idx + 1,
              name: nameStr,
              initials: init,
              linkedinUrl: `https://www.linkedin.com/in/${nameStr.toLowerCase().replace(/\s+/g, "-")}`,
              batch: item.batch || "Batch 45",
              badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
              extraBadgesCount: 4,
              postsCount: Math.floor((item.xp || 1000) / 100),
              pts: item.xp || 1500,
              badgeCountTotal: 7,
              role: item.target_role || "CloudOps Specialist",
              readinessScore: item.readiness_score || 85,
              salaryBand: item.target_salary_band || "₹18–40 LPA",
              streak: item.streak_days || 5
            };
          });
          setMembers(formatted);
        }
      } catch (e) {
        console.warn("Admin Leaderboard live sync notice:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboardData();
  }, []);

  // Handle Social Sharing Redirects
  const handleShareLinkedIn = (member: any) => {
    const pts = member.pts || 2151;
    const rank = member.rank || 1;
    const batch = member.batch || "Batch 45";
    const badgeCount = member.badgeCountTotal || 7;

    const shareText = `🎉 Candidate ${member.name} is currently ranked #${rank} with ${pts} pts on the @CloudOps AI Assessment OS Leaderboard!\n\nCohort: ${batch}. Unlocked ${badgeCount}/10 curriculum module badges! 🚀\n\n#CloudOpsAI #DevOps #Kubernetes #AWS #SRE`;
    const encodedText = encodeURIComponent(shareText);
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;

    const width = 620;
    const height = 680;
    const left = typeof window !== "undefined" ? (window.innerWidth - width) / 2 : 100;
    const top = typeof window !== "undefined" ? (window.innerHeight - height) / 2 : 100;

    window.open(shareUrl, "LinkedInShareCompose", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
  };

  const handleShareWhatsApp = (member: any) => {
    const pts = member.pts || 2151;
    const rank = member.rank || 1;
    const shareText = `🎉 Candidate ${member.name} is ranked #${rank} with ${pts} pts on the CloudOps Leaderboard! 🚀`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleShareX = (member: any) => {
    const pts = member.pts || 2151;
    const rank = member.rank || 1;
    const shareText = `🎉 Candidate ${member.name} is ranked #${rank} with ${pts} pts on @CloudOps AI Leaderboard! 🚀 #CloudOps #DevOps`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleOpenAuditModal = (member: any) => {
    setSelectedCandidateAudit(member);
    setIsAuditModalOpen(true);
    setClaimedBonus(false);
  };

  const handleClaimPointsBonus = () => {
    setClaimedBonus(true);
    if (selectedCandidateAudit) {
      selectedCandidateAudit.pts += 50;
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatchFilter === "all" || m.batch.toLowerCase() === selectedBatchFilter.toLowerCase();
    return matchesSearch && matchesBatch;
  });

  const totalPoints = members.reduce((acc, m) => acc + (m.pts || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full pb-16 font-sans text-slate-900 dark:text-slate-100"
    >
      {/* Header Banner - Admin OS Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF6B00] uppercase tracking-wider mb-1 font-black">
            <Terminal className="w-4 h-4" />
            <span>ADMIN COHORT SCOREBOARD & RANKINGS OVERSIGHT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            CANDIDATE LEADERBOARD & XP STANDINGS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor real-time candidate score rankings, weekly velocity sprints, skill readiness percentages, and target salary bands across all registered cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/40 text-xs font-mono font-black text-[#FF6B00] flex items-center gap-2 shadow-sm">
            <Trophy className="w-4 h-4 text-[#FF6B00]" />
            <span>{members.length} Ranked Candidates</span>
          </div>
        </div>
      </div>

      {/* TOP COMMUNITY HEADER METRICS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 shadow-xl">
        
        {/* Left Bonus Badges Pill */}
        <div className="md:col-span-6 flex flex-col justify-between gap-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#FF6B00]" />
              ADMIN REWARDS & AUDIT OVERVIEW
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              CloudOps & DevOps Cohort Audit
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">LinkedIn Share Bonus</span>
              <span className="text-xs font-black text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-1 rounded-full font-mono">+50 pts</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Quality Bonus</span>
              <span className="text-xs font-black text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-1 rounded-full font-mono">Up to +45 pts</span>
            </div>
          </div>
        </div>

        {/* Right Community Stats */}
        <div className="md:col-span-6 grid grid-cols-2 gap-4 items-center">
          
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-1 text-center justify-center">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {(totalPoints || 70957).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Cohort Points
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-1 text-center justify-center">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              52
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Certified Module Experts
            </span>
          </div>

        </div>

      </div>

      {/* FILTER & TABS CONTROLS BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Left: Tab Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto">
          {[
            { id: "global", label: "Global Ranking", icon: Trophy },
            { id: "weekly", label: "Weekly Sprint", icon: Flame },
            { id: "improved", label: "Most Improved", icon: TrendingUp },
            { id: "tech", label: "Technology Tracks", icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Search & Batch Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-4 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
          >
            <option value="all">All Batches (40 - 50)</option>
            <option value="batch 44">Batch 44</option>
            <option value="batch 45">Batch 45</option>
          </select>

        </div>

      </div>

      {/* Technology Track Selector */}
      {activeTab === "tech" && (
        <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
          {["AWS", "Kubernetes", "Terraform", "DevOps", "AI"].map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedTech === tech
                  ? "bg-[#0B1E36] text-white border border-[#FF6B00] shadow-md"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {/* LEADERBOARD AUDIT TABLE WITH RESPONSIVE HORIZONTAL SCROLL & PADDING */}
      <div className="w-full rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
        
        <div className="w-full overflow-x-auto max-h-[580px] sm:max-h-[650px] overflow-y-auto scroll-smooth">
          <table className="w-full min-w-[1100px] text-left text-xs font-sans border-collapse relative">
            
            <thead className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-4 pl-6 pr-3 bg-slate-50/95 dark:bg-slate-900/95 text-center w-16">RANK</th>
                <th className="py-4 px-3 bg-slate-50/95 dark:bg-slate-900/95 min-w-[190px]">CANDIDATE NAME & ROLE</th>
                <th className="py-4 px-3 text-center bg-slate-50/95 dark:bg-slate-900/95">BATCH</th>
                <th className="py-4 px-4 text-center bg-slate-50/95 dark:bg-slate-900/95 min-w-[240px]">CURRICULUM BADGES</th>
                <th className="py-4 px-3 text-center bg-slate-50/95 dark:bg-slate-900/95">POSTS</th>
                <th className="py-4 px-3 text-center bg-slate-50/95 dark:bg-slate-900/95">TOTAL PTS / XP</th>
                <th className="py-4 px-3 text-center bg-slate-50/95 dark:bg-slate-900/95">READINESS SCORE</th>
                <th className="py-4 pr-6 pl-3 text-right bg-slate-50/95 dark:bg-slate-900/95 min-w-[180px]">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF6B00] mb-2" />
                    <span>Loading real database leaderboard entries...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                    No leaderboard candidates found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.rank} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Rank */}
                    <td className="py-4 pl-6 pr-3 font-mono text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black inline-block border ${
                        m.rank === 1
                          ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                          : m.rank === 2
                          ? "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                          : m.rank === 3
                          ? "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700"
                      }`}>
                        #{m.rank}
                      </span>
                    </td>

                    {/* Candidate Name & Role */}
                    <td className="py-4 px-3 min-w-[190px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm uppercase">
                          {m.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {m.name}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                            {m.role}
                          </span>
                          <a
                            href={m.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block whitespace-nowrap">
                        {m.batch}
                      </span>
                    </td>

                    {/* Curriculum 3D Hexagon Badges */}
                    <td className="py-4 px-4 min-w-[240px]">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        {m.badges.map((b: any, bIdx: number) => (
                          <HexagonBadge key={bIdx} badge={b} />
                        ))}
                        {m.extraBadgesCount > 0 && (
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-mono font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                            +{m.extraBadgesCount}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Posts Count */}
                    <td className="py-4 px-3 text-center">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {m.postsCount}
                      </span>
                    </td>

                    {/* Total Points / XP */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white">
                          {m.pts.toLocaleString()} XP
                        </span>
                        <span className="text-[10px] text-amber-500 font-mono flex items-center gap-0.5 font-bold">
                          <Flame className="w-3 h-3 fill-amber-500" />
                          {m.streak} Days Streak
                        </span>
                      </div>
                    </td>

                    {/* Readiness Score */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs sm:text-sm font-black text-[#FF6B00] font-mono">
                          {m.readinessScore}%
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/80 whitespace-nowrap">
                          {m.salaryBand}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-3 text-right whitespace-nowrap min-w-[180px]">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* LinkedIn Share Button */}
                        <button
                          onClick={() => handleShareLinkedIn(m)}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Share Candidate on LinkedIn"
                        >
                          <Linkedin className="w-3.5 h-3.5 fill-white" />
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          onClick={() => handleShareWhatsApp(m)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        </button>

                        {/* X (Twitter) Share Button */}
                        <button
                          onClick={() => handleShareX(m)}
                          className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Share on X (Twitter)"
                        >
                          <XIcon className="w-3.5 h-3.5 text-white" />
                        </button>

                        {/* Audit Button */}
                        <button
                          onClick={() => handleOpenAuditModal(m)}
                          className="px-3 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white text-[11px] font-black transition-all cursor-pointer shadow-md uppercase tracking-wider ml-1 border border-orange-400/40"
                        >
                          Audit
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>

      {/* CANDIDATE AUDIT & POINT CLAIM MODAL */}
      {isAuditModalOpen && selectedCandidateAudit && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 text-white flex items-center justify-center font-black text-lg">
                  {selectedCandidateAudit.initials}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedCandidateAudit.name}
                  </h3>
                  <span className="text-xs font-bold text-[#FF6B00]">
                    {selectedCandidateAudit.role} • {selectedCandidateAudit.batch}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">TOTAL POINTS</span>
                <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
                  {selectedCandidateAudit.pts.toLocaleString()} XP
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-0.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">READINESS SCORE</span>
                <span className="text-xl font-mono font-black text-emerald-500">
                  {selectedCandidateAudit.readinessScore}%
                </span>
              </div>
            </div>

            {/* Unlocked Badges */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Unlocked Curriculum Badges ({selectedCandidateAudit.badgeCountTotal}/10):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {selectedCandidateAudit.badges.map((b: any, idx: number) => (
                  <HexagonBadge key={idx} badge={b} />
                ))}
              </div>
            </div>

            {/* Claim +50 Points Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              {claimedBonus ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>🎉 +50 PTS Bonus Awarded & Added to Candidate Total!</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimPointsBonus}
                  className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Award +50 Points Bonus 🚀</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </motion.div>
  );
}
