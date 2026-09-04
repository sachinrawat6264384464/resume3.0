"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, Clock, Plus, Sparkles, CheckCircle2, 
  Flame, Award, ArrowRight, Check, Play, AlertCircle, BarChart2,
  Trash2, Edit, X, RefreshCw, BookOpen, Filter, Target, Cpu, Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function StudyPlannerPage() {
  const [activeTab, setActiveTab] = useState<"today" | "weekly" | "calendar" | "goals">("today");
  
  const [summary, setSummary] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Add Task
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("DevOps & Cloud");
  const [skill, setSkill] = useState("AWS VPC & Networking");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [priority, setPriority] = useState("MEDIUM");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);

  // Form states for Goals
  const [targetRole, setTargetRole] = useState("Senior DevOps Engineer");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [targetScore, setTargetScore] = useState(85);

  const fetchPlannerData = async () => {
    try {
      setIsLoading(true);
      const [sumRes, taskRes, weekRes, goalRes] = await Promise.all([
        apiFetch("/study-planner/summary").catch(() => null),
        apiFetch(`/study-planner/tasks${activeTab === 'today' ? '?view_mode=today' : activeTab === 'weekly' ? '?view_mode=this_week' : ''}`).catch(() => null),
        apiFetch("/study-planner/weekly-summary").catch(() => null),
        apiFetch("/study-planner/goals").catch(() => null)
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (taskRes?.data) setTasks(taskRes.data);
      if (weekRes?.data) setWeeklyData(weekRes.data);
      if (goalRes?.data) {
        setGoals(goalRes.data);
        setTargetRole(goalRes.data.target_role || "Senior DevOps Engineer");
        setWeeklyHours(goalRes.data.weekly_hours || 15);
        setTargetScore(goalRes.data.target_score || 85);
      }
    } catch (e) {
      console.warn("Study planner fetch notice:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, [activeTab]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setIsSubmitting(true);
      await apiFetch("/study-planner/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          category,
          skill,
          difficulty,
          priority,
          duration_minutes: Number(durationMinutes),
          start_time: startTime,
          scheduled_date: new Date(scheduledDate).toISOString(),
          xp_reward: difficulty === "ADVANCED" ? 100 : difficulty === "INTERMEDIATE" ? 75 : 50
        })
      });
      setIsAddModalOpen(false);
      setTitle("");
      fetchPlannerData();
    } catch (e) {
      alert("Failed to create study task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await apiFetch(`/study-planner/tasks/${taskId}/complete`, { method: "POST" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userProfileUpdated"));
      }
      fetchPlannerData();
    } catch (e) {
      console.warn("Task completion notice:", e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiFetch(`/study-planner/tasks/${taskId}`, { method: "DELETE" });
      fetchPlannerData();
    } catch (e) {
      console.warn("Task deletion notice:", e);
    }
  };

  const handleGenerateAiPlan = async () => {
    try {
      setIsSubmitting(true);
      await apiFetch("/study-planner/generate-ai-plan", {
        method: "POST",
        body: JSON.stringify({
          target_role: targetRole,
          available_weekly_hours: Number(weeklyHours)
        })
      });
      setIsAiModalOpen(false);
      fetchPlannerData();
    } catch (e) {
      alert("Failed to generate AI plan. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await apiFetch("/study-planner/goals", {
        method: "PUT",
        body: JSON.stringify({
          target_role: targetRole,
          weekly_hours: Number(weeklyHours),
          target_score: Number(targetScore)
        })
      });
      fetchPlannerData();
    } catch (e) {
      alert("Failed to save goals.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-[#FF9900]/30 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>100% DATABASE PERSISTED STUDY ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Study Planner & Preparation Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Personalized preparation roadmap targeting your target role, interview weak skills, and ATS resume gaps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-black text-slate-900 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-black text-white bg-slate-900 dark:bg-slate-800 border border-slate-700 hover:border-[#FF9900] shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#FF9900]" />
            <span>Generate AI Plan</span>
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS (DB BACKED) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: "Today's Tasks", val: summary?.todays_tasks_count ?? 0, icon: BookOpen, color: "text-[#FF9900]", bg: "bg-amber-50 dark:bg-amber-950/40" },
          { label: "Completed", val: summary?.completed_tasks_count ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Weekly Hours", val: `${summary?.weekly_study_hours ?? 0}h`, icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Study Streak", val: `${summary?.current_streak ?? 1} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
          { label: "Pending", val: summary?.pending_tasks_count ?? 0, icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
          { label: "Completion %", val: `${summary?.weekly_completion_pct ?? 0}%`, icon: Target, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/40" },
        ].map((c, i) => {
          const IconComp = c.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2 justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide truncate">{c.label}</span>
                <div className={`p-1.5 rounded-xl ${c.bg}`}>
                  <IconComp className={`w-3.5 h-3.5 ${c.color}`} />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
                {c.val}
              </span>
            </div>
          );
        })}
      </div>

      {/* VIEW SWITCHER TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: "today", label: "Today" },
            { id: "weekly", label: "This Week" },
            { id: "calendar", label: "Calendar" },
            { id: "goals", label: "Study Goals" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 sm:px-5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchPlannerData}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* MAIN VIEW CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin mb-2" />
          <span className="text-xs font-bold">Loading study tasks from PostgreSQL...</span>
        </div>
      ) : activeTab === "goals" ? (
        /* GOALS VIEW */
        <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto w-full">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FF9900]" />
            Configure Candidate Preparation Goals
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Stored permanently in PostgreSQL to optimize your study recommendations.
          </p>

          <form onSubmit={handleSaveGoals} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF9900]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Weekly Study Hours</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF9900]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Score (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-[#FF9900]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center justify-center gap-2 mt-2 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Preparation Goals"}
            </button>
          </form>
        </div>
      ) : activeTab === "weekly" ? (
        /* WEEKLY ANALYTICS VIEW */
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-[#FF9900] uppercase tracking-wider">WEEKLY PROGRESSION ANALYTICS</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {weeklyData?.completed_hours || 0}h Completed of {weeklyData?.planned_hours || 0}h Planned
              </h3>
              <p className="text-xs text-slate-500 font-medium">Dynamically calculated from real task completions</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-emerald-500 font-mono">{weeklyData?.completion_pct || 0}%</span>
                <span className="text-[10px] font-bold text-slate-400">Weekly Target</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-orange-500 font-mono">{weeklyData?.streak_days || 1}</span>
                <span className="text-[10px] font-bold text-slate-400">Active Streak</span>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(weeklyData?.tasks_per_day || []).map((d: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-between text-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">{d.day}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{d.completed_hours}h</span>
                <span className="text-[10px] text-slate-500 font-medium">{d.tasks_count} tasks</span>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF9900] rounded-full"
                    style={{ width: `${d.planned_hours > 0 ? Math.min((d.completed_hours / d.planned_hours) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "calendar" ? (
        /* CALENDAR VIEW */
        <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Monthly Preparation Calendar</h3>
            <span className="text-xs font-bold text-[#FF9900]">{tasks.length} Database Tasks Scheduled</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-[#FF9900]">{new Date(t.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="font-bold text-slate-500">{t.start_time}</span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{t.title}</h4>
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">{t.skill}</span>
                  <span className={`font-mono font-bold ${t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TODAY & TASKS LIST VIEW */
        <div className="flex flex-col gap-4">
          {tasks.length === 0 ? (
            <div className="p-12 text-center rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">No tasks scheduled for this view</h4>
              <p className="text-xs text-slate-500 max-w-sm">Click [+ Add Task] to create custom tasks or use [✨ Generate AI Plan] to auto-generate from missing skills.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => {
                const isDone = task.status === "COMPLETED";
                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                      isDone
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#FF9900]/60 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-[#FF9900] dark:bg-amber-950/60 border border-[#FF9900]/30">
                        {task.category}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                          +{task.xp_reward} XP
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className={`text-sm font-black text-slate-900 dark:text-white leading-snug ${isDone ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {task.duration_minutes} min
                      </span>
                      <span>•</span>
                      <span>{task.start_time}</span>
                      <span>•</span>
                      <span className="text-slate-700 dark:text-slate-300">{task.skill}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {isDone ? (
                        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#FF9900] hover:from-amber-500 hover:to-orange-500 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Complete (+{task.xp_reward} XP)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF9900]" />
                Add Study Task (PostgreSQL Persisted)
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. AWS VPC Troubleshooting Lab"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Linux & Systems">Linux & Systems</option>
                    <option value="Multi-Cloud">Multi-Cloud</option>
                    <option value="Containers & K8s">Containers & K8s</option>
                    <option value="DevOps & CI/CD">DevOps & CI/CD</option>
                    <option value="Site Reliability">Site Reliability</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Skill</label>
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="BEGINNER">Beginner (+50 XP)</option>
                    <option value="INTERMEDIATE">Intermediate (+75 XP)</option>
                    <option value="ADVANCED">Advanced (+100 XP)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Save Task to Database"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI GENERATE PLAN MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-950/60 w-fit mx-auto text-[#FF9900]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Generate AI Study Plan</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              FastAPI AI Engine will analyze your evaluated voice interview question scores & missing ATS resume skills from PostgreSQL to generate a 5-task preparation sprint.
            </p>

            <button
              onClick={handleGenerateAiPlan}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "✨ Generate & Persist AI Plan"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
