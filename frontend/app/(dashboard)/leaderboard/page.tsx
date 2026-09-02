"use client";

import { useEffect, useState } from "react";
import { 
  Trophy, Flame, Star, Award, ShieldCheck, 
  TrendingUp, Users, ArrowUpRight, Loader2, Sparkles
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { LeaderboardResponse, LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-glow border border-amber-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Cohort Leaderboards
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time XP & Readiness Ranking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Top Engineering Learners
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Gamified rankings celebrating regular practice, technical mastery, and continuous score velocity across Cloud & DevOps tracks.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 w-fit">
        {[
          { id: "global", label: "Global Ranking", icon: Trophy },
          { id: "weekly", label: "Weekly Sprint", icon: Flame },
          { id: "improved", label: "Most Improved", icon: TrendingUp },
          { id: "tech", label: "Technology Tracks", icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-white border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Technology Sub-Selector if Tech tab selected */}
      {activeTab === "tech" && (
        <div className="flex items-center gap-2">
          {["AWS", "Kubernetes", "Terraform", "Linux"].map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                selectedTech === tech
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900 border border-white/5 text-slate-400 hover:bg-white/5"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard Table / Cards */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col gap-4">
        <div className="grid grid-cols-12 text-xs font-mono text-slate-400 pb-3 border-b border-white/5 px-4">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4 sm:col-span-5">Candidate</div>
          <div className="col-span-3 sm:col-span-2 text-center">XP & Level</div>
          <div className="col-span-2 text-center hidden sm:block">Streak</div>
          <div className="col-span-4 sm:col-span-2 text-right">Readiness</div>
        </div>

        <div className="flex flex-col gap-2">
          {entriesToDisplay.map((entry, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            const rankBadgeColor = rank === 1 ? "text-amber-400 bg-amber-500/20 border-amber-500/40" : rank === 2 ? "text-slate-300 bg-slate-400/20 border-slate-400/40" : rank === 3 ? "text-amber-600 bg-amber-700/20 border-amber-700/40" : "text-slate-500 bg-slate-800 border-white/5";

            return (
              <div
                key={entry.candidate_id || idx}
                className={`grid grid-cols-12 items-center p-4 rounded-2xl border transition-all ${
                  isTop3
                    ? "bg-slate-950/80 border-white/10 hover:border-amber-500/30"
                    : "bg-slate-950/40 border-white/5 hover:bg-slate-950/70"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-[1px] hidden sm:block">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                      {entry.candidate_name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{entry.candidate_name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono block">{entry.target_role}</span>
                  </div>
                </div>

                {/* XP & Level */}
                <div className="col-span-3 sm:col-span-2 text-center flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {entry.xp.toLocaleString()} XP
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Level {entry.level}</span>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-center hidden sm:flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {entry.streak_days} Days
                  </span>
                </div>

                {/* Readiness Target */}
                <div className="col-span-4 sm:col-span-2 text-right flex flex-col items-end">
                  <span className="text-sm font-black text-cyan-400 font-mono">{entry.readiness_score}%</span>
                  <span className="text-[10px] font-mono text-slate-400">{entry.target_salary_band}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
