"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Flame, Star, Award, ShieldCheck, 
  TrendingUp, Users, ArrowUpRight, Loader2, Sparkles, Terminal, Search
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { LeaderboardResponse, LeaderboardEntry } from "@/types";

export default function AdminLeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "improved" | "tech">("global");
  const [selectedTech, setSelectedTech] = useState<string>("AWS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res: any = await apiFetch("/leaderboard");
        const payload = res?.data || (res?.global_ranking ? res : null);
        if (payload) {
          setData(payload);
        }
      } catch (e) {
        console.warn("Admin Leaderboard live sync notice:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const entriesToDisplay: LeaderboardEntry[] = (() => {
    if (!data) return [];
    let list: LeaderboardEntry[] = [];
    if (activeTab === "global") list = data.global_ranking || [];
    else if (activeTab === "weekly") list = data.weekly_sprint || data.global_ranking || [];
    else if (activeTab === "improved") list = data.most_improved || data.global_ranking || [];
    else if (activeTab === "tech") list = data.technology_leaderboards?.[selectedTech] || data.global_ranking || [];
    else list = data.global_ranking || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(e => 
        e.candidate_name.toLowerCase().includes(q) || 
        e.target_role?.toLowerCase().includes(q)
      );
    }
    return list;
  })();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 w-full pb-16 font-sans text-slate-900 dark:text-slate-100"
    >
      {/* Header Banner - Admin OS Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FF6B00] uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>ADMIN COHORT SCOREBOARD & RANKINGS OVERSIGHT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Candidate Leaderboard & XP Standings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Monitor real-time candidate score rankings, weekly velocity sprints, skill readiness percentages, and target salary bands across all registered cohorts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/30 text-xs font-mono font-black text-[#FF6B00] flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>{entriesToDisplay.length} Ranked Candidates</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full md:w-auto shadow-xs">
          {[
            { id: "global", label: "Global Ranking", icon: Trophy },
            { id: "weekly", label: "Weekly Sprint", icon: Flame },
            { id: "improved", label: "Most Improved", icon: TrendingUp },
            { id: "tech", label: "Technology Tracks", icon: Star },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search candidate or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
          />
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

      {/* Leaderboard Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-xs">
        <div className="grid grid-cols-12 text-[11px] uppercase tracking-wider font-black text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800 px-4">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4 sm:col-span-5">Candidate Name & Target Role</div>
          <div className="col-span-3 sm:col-span-2 text-center">XP & Level</div>
          <div className="col-span-2 text-center hidden sm:block">Practice Streak</div>
          <div className="col-span-4 sm:col-span-2 text-right">Readiness Score</div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6">
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            ))
          ) : entriesToDisplay.length > 0 ? (
            entriesToDisplay.map((entry, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const rankBadgeColor = 
                rank === 1 ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-400 font-black" :
                rank === 2 ? "text-slate-600 bg-slate-100 border-slate-300 dark:bg-slate-400/20 dark:border-slate-400/40 dark:text-slate-300 font-bold" :
                rank === 3 ? "text-orange-600 bg-orange-50 border-orange-200 dark:bg-amber-700/20 dark:border-amber-700/40 dark:text-amber-600 font-bold" :
                "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";

              return (
                <div
                  key={entry.candidate_id || idx}
                  className={`grid grid-cols-12 items-center p-4 rounded-2xl border transition-all ${
                    isTop3
                      ? "bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700"
                      : "bg-white border-slate-100 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border ${rankBadgeColor}`}>
                      {rank}
                    </span>
                  </div>

                  {/* Candidate Name & Role */}
                  <div className="col-span-4 sm:col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0B1E36] p-[1px] hidden sm:block shrink-0">
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-black text-[#FF6B00]">
                        {entry.candidate_name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{entry.candidate_name}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">{entry.target_role || "Cloud Engineer"}</span>
                    </div>
                  </div>

                  {/* XP & Level */}
                  <div className="col-span-3 sm:col-span-2 text-center flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {entry.xp?.toLocaleString() || 0} XP
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level {entry.level || 1}</span>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 text-center hidden sm:flex flex-col items-center">
                    <span className="text-xs font-bold text-amber-500 font-mono flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {entry.streak_days || 1} Days
                    </span>
                  </div>

                  {/* Readiness Score */}
                  <div className="col-span-4 sm:col-span-2 text-right flex flex-col items-end gap-0.5">
                    <span className="text-sm font-black text-[#FF6B00] font-mono">{entry.readiness_score || 0}%</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {entry.target_salary_band || "₹18–40 LPA"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-bold text-slate-400">
              No candidate rankings recorded yet in database
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
