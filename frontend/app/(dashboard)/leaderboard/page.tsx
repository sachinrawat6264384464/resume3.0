"use client";
// Updated: 2026-09-21 Leaderboard with 3D Hexagon Badges & LinkedIn Auto-Post

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Flame, Star, Award, ShieldCheck, 
  TrendingUp, Users, ArrowUpRight, Loader2, Sparkles,
  Search, Share2, CheckCircle2, Linkedin, ExternalLink, X as XIcon, MessageCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

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
          <linearGradient id={`grad-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        </defs>
        <path 
          d="M50 0 L100 28.87 L100 86.6 L50 115.47 L0 86.6 L0 28.87 Z" 
          fill={`url(#grad-${badge.id})`} 
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

export default function LeaderboardPage() {
  const user = useAuthStore((state) => state.user);
  
  const [activeTimeframe, setActiveTimeframe] = useState<"weekly" | "all_time">("all_time");
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
      name: "Pooja Tyagi",
      initials: "PT",
      linkedinUrl: "https://www.linkedin.com/in/pooja-tyagi/",
      batch: "Batch 44",
      badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
      extraBadgesCount: 4,
      postsCount: 19,
      pts: 2151,
      badgeCountTotal: 7,
      role: "Senior Cloud & DevOps Engineer",
      readinessScore: 94
    },
    {
      rank: 2,
      name: "Sandip Biswas",
      initials: "SB",
      linkedinUrl: "https://www.linkedin.com/in/sandip-biswas/",
      batch: "Batch 44",
      badges: [MODULE_BADGES[1], MODULE_BADGES[2], MODULE_BADGES[3]],
      extraBadgesCount: 4,
      postsCount: 20,
      pts: 2105,
      badgeCountTotal: 7,
      role: "AWS & Kubernetes Architect",
      readinessScore: 91
    },
    {
      rank: 3,
      name: "Rakesh kumar",
      initials: "RK",
      linkedinUrl: "https://www.linkedin.com/in/rakesh-kumar/",
      batch: "Batch 44",
      badges: [MODULE_BADGES[1], MODULE_BADGES[2], MODULE_BADGES[3]],
      extraBadgesCount: 5,
      postsCount: 20,
      pts: 2104,
      badgeCountTotal: 8,
      role: "Site Reliability Engineer (SRE)",
      readinessScore: 90
    },
    {
      rank: 4,
      name: "Abhishek Chahar",
      initials: "AC",
      linkedinUrl: "https://www.linkedin.com/in/abhishek-chahar/",
      batch: "Batch 44",
      badges: [MODULE_BADGES[1], MODULE_BADGES[2], MODULE_BADGES[3]],
      extraBadgesCount: 2,
      postsCount: 20,
      pts: 2040,
      badgeCountTotal: 5,
      role: "DevOps & CI/CD Automation Specialist",
      readinessScore: 88
    },
    {
      rank: 5,
      name: "Anju Tangadpally",
      initials: "AT",
      linkedinUrl: "https://www.linkedin.com/in/anju-tangadpally/",
      batch: "Batch 44",
      badges: [MODULE_BADGES[1], MODULE_BADGES[2], MODULE_BADGES[4]],
      extraBadgesCount: 2,
      postsCount: 19,
      pts: 2009,
      badgeCountTotal: 5,
      role: "Cloud Infrastructure Specialist",
      readinessScore: 86
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
              batch: "Batch 45",
              badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
              extraBadgesCount: 4,
              postsCount: Math.floor((item.xp || 1000) / 100),
              pts: item.xp || 1500,
              badgeCountTotal: 7,
              role: item.target_role || "CloudOps Specialist",
              readinessScore: item.readiness_score || 85
            };
          });

          // Prepend active user if logged in
          if (user && user.full_name) {
            const myInit = user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
            const myEntry = {
              rank: 1,
              name: `${user.full_name} (YOU)`,
              initials: myInit,
              linkedinUrl: "https://www.linkedin.com/",
              batch: "Batch 45",
              badges: [MODULE_BADGES[0], MODULE_BADGES[1], MODULE_BADGES[2]],
              extraBadgesCount: 4,
              postsCount: 19,
              pts: 2151,
              badgeCountTotal: 7,
              role: "Senior Cloud & DevOps Engineer",
              readinessScore: 95
            };
            setMembers([myEntry, ...formatted.slice(0, 10)]);
          } else {
            setMembers(formatted);
          }
        }
      } catch (e) {
        console.warn("Leaderboard fetch notice:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboardData();
  }, [user]);

  // Handle LinkedIn Auto-Populated Post Redirect
  const handleShareLinkedIn = (member: any) => {
    const pts = member.pts || 2151;
    const rank = member.rank || 1;
    const batch = member.batch || "Batch 45";
    const badgeCount = member.badgeCountTotal || 7;

    const shareText = `🎉 I'm currently ranked #${rank} with ${pts} pts on the @CloudDevOpsHub Leaderboard!\n\nMentored by Vikas Ratnawat in ${batch} (Multi-Cloud & DevOps With AI). Unlocked ${badgeCount}/10 curriculum module badges! 🚀\n\nLeaderboard: ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/leaderboard\n#CloudDevOpsHub #VikasRatnawat #DayOne #Kubernetes #AWS #DevOpsAI`;

    const encodedText = encodeURIComponent(shareText);
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;

    const width = 620;
    const height = 680;
    const left = typeof window !== "undefined" ? (window.innerWidth - width) / 2 : 100;
    const top = typeof window !== "undefined" ? (window.innerHeight - height) / 2 : 100;

    window.open(shareUrl, "LinkedInShareCompose", `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
  };

  // Handle WhatsApp Share Redirect
  const handleShareWhatsApp = (member: any) => {
    const pts = member.pts || 2151;
    const rank = member.rank || 1;
    const shareText = `🎉 I'm currently ranked #${rank} with ${pts} pts on the CloudDevOpsHub Leaderboard! 🚀 Check out my progress here: ${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/leaderboard`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  // Handle X (Twitter) Share Redirect
  const handleShareX = (member: any) => {
    const pts = member.pts || 2151;
    const rank = member.rank || 1;
    const shareText = `🎉 Ranked #${rank} with ${pts} pts on the @CloudDevOpsHub Leaderboard! Unlocked 7 curriculum module badges! 🚀 #CloudDevOpsHub #DevOps`;
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
    <div className="w-full flex flex-col gap-8 pb-16 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      
      {/* TOP COMMUNITY HEADER METRICS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-slate-900/90 p-6 sm:p-8 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
        
        {/* Left Bonus Badges Pill */}
        <div className="md:col-span-6 flex flex-col justify-between gap-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#FF6B00]" />
              COHORT LEADERBOARD & REWARDS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              CloudOps & DevOps Community Leaderboard
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">LinkedIn Contribution</span>
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
              Total Community Points
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

      {/* FILTER & TIMEFRAME CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Left: Timeframe Toggle Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTimeframe("weekly")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTimeframe === "weekly"
                ? "bg-[#0B1E36] text-white shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Weekly Ranking</span>
          </button>

          <button
            onClick={() => setActiveTimeframe("all_time")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTimeframe === "all_time"
                ? "bg-[#0B1E36] text-white shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>All-Time</span>
          </button>
        </div>

        {/* Right: Search & Batch Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search member..."
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

      {/* LEADERBOARD AUDIT TABLE WITH INTERNAL SCROLLING & STICKY HEADER */}
      <div className="w-full rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
        
        <div className="overflow-x-auto max-h-[580px] sm:max-h-[650px] overflow-y-auto scroll-smooth">
          <table className="w-full min-w-[880px] text-left text-xs font-sans border-collapse relative">
            
            <thead className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-4 px-6 bg-slate-50/95 dark:bg-slate-900/95">RANK</th>
                <th className="py-4 px-6 bg-slate-50/95 dark:bg-slate-900/95">MEMBER</th>
                <th className="py-4 px-6 text-center bg-slate-50/95 dark:bg-slate-900/95">BATCH</th>
                <th className="py-4 px-6 text-center bg-slate-50/95 dark:bg-slate-900/95">CURRICULUM BADGES</th>
                <th className="py-4 px-6 text-center bg-slate-50/95 dark:bg-slate-900/95">POSTS</th>
                <th className="py-4 px-6 text-center bg-slate-50/95 dark:bg-slate-900/95">TOTAL PTS</th>
                <th className="py-4 px-6 text-right bg-slate-50/95 dark:bg-slate-900/95">SHARE & VIEW</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-bold">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF6B00] mb-2" />
                    <span>Loading real database leaderboard entries...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No leaderboard members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.rank} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Rank */}
                    <td className="py-4 px-6 font-mono">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black inline-block border ${
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

                    {/* Member Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm uppercase">
                          {m.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {m.name}
                          </span>
                          <a
                            href={m.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {m.batch}
                      </span>
                    </td>

                    {/* Curriculum 3D Hexagon Badges */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {m.badges.map((b: any, bIdx: number) => (
                          <HexagonBadge key={bIdx} badge={b} />
                        ))}
                        {m.extraBadgesCount > 0 && (
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-mono font-black text-xs flex items-center justify-center shadow-xs">
                            +{m.extraBadgesCount}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Posts Count */}
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {m.postsCount}
                      </span>
                    </td>

                    {/* Total Points */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                          {m.pts.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">total pts</span>
                      </div>
                    </td>

                    {/* Share & View Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* LinkedIn Share Button (Triggers LinkedIn Post Compose Modal with Pre-filled Text) */}
                        <button
                          onClick={() => handleShareLinkedIn(m)}
                          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Share Post on LinkedIn (Auto-Populates Post Compose Box)"
                        >
                          <Linkedin className="w-4 h-4 fill-white" />
                        </button>

                        {/* WhatsApp Share Button */}
                        <button
                          onClick={() => handleShareWhatsApp(m)}
                          className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                        </button>

                        {/* X (Twitter) Share Button */}
                        <button
                          onClick={() => handleShareX(m)}
                          className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Share on X (Twitter)"
                        >
                          <XIcon className="w-4 h-4 text-white" />
                        </button>

                        {/* Audit Button */}
                        <button
                          onClick={() => handleOpenAuditModal(m)}
                          className="px-3 py-1.5 rounded-lg bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white text-xs font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider"
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg">
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
                  {selectedCandidateAudit.pts.toLocaleString()} pts
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
                  <span>🎉 +50 PTS Bonus Claimed & Added to Candidate Total!</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimPointsBonus}
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
