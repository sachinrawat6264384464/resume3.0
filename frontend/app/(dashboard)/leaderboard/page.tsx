"use client";

import { useEffect, useState } from "react";
import { 
  Trophy, Flame, Star, Award, ShieldCheck, 
  TrendingUp, Users, ArrowUpRight, Loader2, Sparkles
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { LeaderboardResponse, LeaderboardEntry } from "@/types";
import { useAuthStore } from "@/lib/store";

export default function LeaderboardPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "improved" | "tech">("global");
  const [selectedTech, setSelectedTech] = useState<string>("AWS");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await apiFetch("/leaderboard");
        setData(res.data);
      } catch (e) {
        console.warn("Failed to load leaderboard:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const entriesToDisplay: LeaderboardEntry[] = (() => {
    if (!data) return [];
    if (activeTab === "global") return data.global_ranking || [];
    if (activeTab === "weekly") return data.weekly_sprint || [];
    if (activeTab === "improved") return data.most_improved || [];
    if (activeTab === "tech") return data.technology_leaderboards?.[selectedTech] || data.global_ranking || [];
    return [];
  })();

  return (
    <div className="flex flex-col gap-8 w-full pb-16">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-3 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-400/20 text-amber-100 border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              Cohort Leaderboards
            </span>
            <span className="text-xs text-blue-100 dark:text-slate-400 font-mono font-medium">Real-Time XP & Readiness Ranking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Top Engineering Learners
          </h1>
          <p className="text-sm text-blue-100/90 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
            Gamified rankings celebrating regular practice, technical mastery, and continuous score velocity across Cloud & DevOps tracks.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-cyan-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 w-fit shadow-sm">
        {[
          { id: "global", label: "Global Ranking", icon: Trophy },
          { id: "weekly", label: "Weekly Sprint", icon: Flame },
          { id: "improved", label: "Most Improved", icon: TrendingUp },
          { id: "tech", label: "Technology Tracks", icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? "bg-blue-50 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm border border-blue-100 dark:border-indigo-500/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Technology Sub-Selector if Tech tab selected */}
      {activeTab === "tech" && (
        <div className="flex items-center gap-2 animate-fadeIn">
          {["AWS", "Kubernetes", "Terraform", "Linux"].map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-xs ${
                selectedTech === tech
                  ? "bg-[#232F3E] text-white border border-[#FF9900] shadow-md scale-[1.02]"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard Table / Cards */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex flex-col gap-4 shadow-sm">
        <div className="grid grid-cols-12 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-white/5 px-4">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4 sm:col-span-5">Candidate</div>
          <div className="col-span-3 sm:col-span-2 text-center">XP & Level</div>
          <div className="col-span-2 text-center hidden sm:block">Streak</div>
          <div className="col-span-4 sm:col-span-2 text-right">Readiness</div>
        </div>

        <div className="flex flex-col gap-3">
          {entriesToDisplay.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const isMe = user && (
              user.full_name?.toLowerCase().trim() === entry.candidate_name.toLowerCase().trim() ||
              (user.email && entry.candidate_name.toLowerCase().includes(user.email.split("@")[0].toLowerCase()))
            );
            const rankBadgeColor = rank === 1 ? "text-amber-600 bg-amber-50 border-amber-200 shadow-sm dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-400" : rank === 2 ? "text-slate-600 bg-slate-100 border-slate-300 shadow-sm dark:bg-slate-400/20 dark:border-slate-400/40 dark:text-slate-300" : rank === 3 ? "text-orange-600 bg-orange-50 border-orange-200 shadow-sm dark:bg-amber-700/20 dark:border-amber-700/40 dark:text-amber-600" : "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-white/5";

            return (
              <div
                key={entry.candidate_id || idx}
                className={`grid grid-cols-12 items-center p-4 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                  isMe
                    ? "bg-blue-50/80 border-blue-400 dark:bg-blue-950/40 dark:border-blue-500/60 shadow-md ring-2 ring-blue-500/20"
                    : isTop3
                    ? "bg-slate-50 border-slate-200 hover:border-blue-300 dark:bg-slate-950/80 dark:border-white/10 dark:hover:border-amber-500/30"
                    : "bg-white border-slate-100 hover:bg-slate-50 hover:border-blue-200 dark:bg-slate-950/40 dark:border-white/5 dark:hover:bg-slate-950/70"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${rankBadgeColor}`}>
                    {rank}
                  </span>
                </div>

                {/* Candidate Name & Role */}
                <div className="col-span-4 sm:col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 p-[1px] hidden sm:block shadow-sm">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-extrabold text-blue-700 dark:text-white">
                      {entry.candidate_name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{entry.candidate_name}</h4>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-xs">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">{entry.target_role}</span>
                  </div>
                </div>

                {/* XP & Level */}
                <div className="col-span-3 sm:col-span-2 text-center flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-300 font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                    {entry.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Level {entry.level}</span>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-center hidden sm:flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-500 dark:text-amber-400 font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                    {entry.streak_days} Days
                  </span>
                </div>

                {/* Readiness Target */}
                <div className="col-span-4 sm:col-span-2 text-right flex flex-col items-end gap-0.5">
                  <span className="text-sm font-black text-blue-600 dark:text-cyan-400 font-mono">{entry.readiness_score}%</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{entry.target_salary_band}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
