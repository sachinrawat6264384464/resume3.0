"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Bell, CheckCircle2, Clock, Plus, Filter, Sparkles, 
  Trash2, X, RefreshCw, AlertCircle, Play, ArrowRight, Check,
  Flame, Award, Layers, ShieldCheck, Loader2, Moon
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function SmartRemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [snoozeModalReminderId, setSnoozeModalReminderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Custom Reminder
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [remType, setRemType] = useState("STUDY");
  const [priority, setPriority] = useState("MEDIUM");

  const fetchRemindersData = async () => {
    try {
      setIsLoading(true);
      const [remRes, sumRes] = await Promise.all([
        apiFetch(`/reminders${activeFilter !== 'ALL' ? `?rem_type=${activeFilter}` : ''}`).catch(() => null),
        apiFetch("/reminders/summary").catch(() => null)
      ]);

      if (remRes?.data) setReminders(remRes.data);
      if (sumRes?.data) setSummary(sumRes.data);
    } catch (e) {
      console.warn("Reminders fetch notice:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRemindersData();
  }, [activeFilter]);

  // Error message state (UI inline alert, no native browser popup)
  const [modalError, setModalError] = useState<string | null>(null);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setModalError(null);
    try {
      setIsSubmitting(true);
      await apiFetch("/reminders", {
        method: "POST",
        body: JSON.stringify({
          title,
          message,
          type: remType,
          priority
        })
      });
      setIsAddModalOpen(false);
      setTitle("");
      setMessage("");
      fetchRemindersData();
    } catch (e: any) {
      setModalError(e.message || "Failed to create reminder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}/read`, { method: "POST" });
      fetchRemindersData();
    } catch (e) {
      console.warn("Mark read notice:", e);
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}/complete`, { method: "POST" });
      fetchRemindersData();
    } catch (e) {
      console.warn("Complete reminder notice:", e);
    }
  };

  const handleSnooze = async (minutes: number) => {
    if (!snoozeModalReminderId) return;
    setModalError(null);
    try {
      setIsSubmitting(true);
      await apiFetch(`/reminders/${snoozeModalReminderId}/snooze`, {
        method: "POST",
        body: JSON.stringify({ snooze_minutes: minutes })
      });
      setSnoozeModalReminderId(null);
      fetchRemindersData();
    } catch (e: any) {
      setModalError(e.message || "Failed to snooze reminder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}`, { method: "DELETE" });
      fetchRemindersData();
    } catch (e) {
      console.warn("Dismiss reminder notice:", e);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-[28px] bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-[#FF9900]/30 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>REAL-TIME DATABASE SMART REMINDER ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Smart Reminders & Preparation Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Stay on track with automated alerts for study tasks, streak risks, interview re-attempts, and AI recommendations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-2.5 px-4 rounded-xl text-xs font-black text-slate-900 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center gap-1.5 transition-all self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Reminder</span>
        </button>
      </div>

      {/* SUMMARY CARDS (DB BACKED) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: "Active", val: summary?.active_count ?? 0, icon: Bell, color: "text-[#FF9900]", bg: "bg-amber-50 dark:bg-amber-950/40" },
          { label: "Due Today", val: summary?.due_today_count ?? 0, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
          { label: "Upcoming", val: summary?.upcoming_count ?? 0, icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
          { label: "Snoozed", val: summary?.snoozed_count ?? 0, icon: Moon, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
          { label: "Completed", val: summary?.completed_count ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
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

      {/* FILTER TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "ALL", label: "All Reminders" },
            { id: "STUDY", label: "Study" },
            { id: "INTERVIEW", label: "Interview" },
            { id: "STREAK", label: "Streak" },
            { id: "AI_RECOMMENDATION", label: "AI Target" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`py-2 px-3.5 rounded-xl text-xs font-black transition-all ${
                activeFilter === tab.id
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchRemindersData}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* REMINDERS LIST */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-8 h-8 text-[#FF9900] animate-spin mb-2" />
          <span className="text-xs font-bold">Loading reminders from PostgreSQL...</span>
        </div>
      ) : reminders.length === 0 ? (
        <div className="p-12 text-center rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          <h4 className="text-sm font-black text-slate-900 dark:text-white">No active reminders found</h4>
          <p className="text-xs text-slate-500 max-w-sm">System automatically creates reminders when study tasks or interview re-attempts are pending.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => {
            const isCompleted = rem.status === "COMPLETED";
            const isSnoozed = rem.status === "SNOOZED";

            return (
              <div
                key={rem.id}
                onClick={() => rem.status === "ACTIVE" && handleMarkRead(rem.id)}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                  isCompleted
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30"
                    : isSnoozed
                    ? "bg-purple-50/40 dark:bg-purple-950/20 border-purple-500/30"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#FF9900]/60 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      rem.type === 'STREAK'
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 border border-orange-500/30'
                        : rem.type === 'AI_RECOMMENDATION'
                        ? 'bg-amber-100 text-[#FF9900] dark:bg-amber-950 dark:text-amber-400 border border-[#FF9900]/30'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-blue-500/30'
                    }`}>
                      {rem.type}
                    </span>

                    {rem.priority === "HIGH" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isSnoozed && (
                      <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                        Snoozed
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDismiss(rem.id); }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Dismiss Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-black text-slate-900 dark:text-white leading-snug ${isCompleted ? 'line-through opacity-70' : ''}`}>
                    {rem.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                    {rem.message}
                  </p>
                </div>

                {/* ACTION TRIGGER BUTTONS */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2">
                    {rem.related_entity_type === 'study_task' ? (
                      <Link prefetch={false}
                        href="/study-planner"
                        className="py-1.5 px-3 rounded-xl font-bold text-[11px] bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1 shadow-xs transition-all"
                      >
                        <span>View Study Plan →</span>
                      </Link>
                    ) : rem.related_entity_type === 'interview' ? (
                      <Link prefetch={false}
                        href="/interviews"
                        className="py-1.5 px-3 rounded-xl font-bold text-[11px] bg-[#FF9900] text-slate-950 hover:bg-amber-400 flex items-center gap-1 shadow-xs transition-all"
                      >
                        <Play className="w-3 h-3 fill-slate-950 text-slate-950" />
                        <span>Start Stage Practice</span>
                      </Link>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSnoozeModalReminderId(rem.id); }}
                          className="py-1.5 px-3 rounded-xl font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-950 transition-colors flex items-center gap-1"
                        >
                          <Moon className="w-3 h-3 text-purple-500" />
                          <span>Snooze</span>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleCompleteReminder(rem.id); }}
                          className="py-1.5 px-3 rounded-xl font-bold text-[11px] bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SNOOZE MODAL */}
      {snoozeModalReminderId && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-950/60 w-fit mx-auto text-purple-500">
              <Moon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Snooze Reminder</h3>
            <p className="text-xs text-slate-500 font-medium">Select snooze duration. Updates `snoozed_until` in PostgreSQL.</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "10 Minutes", mins: 10 },
                { label: "30 Minutes", mins: 30 },
                { label: "1 Hour", mins: 60 },
                { label: "Tomorrow", mins: 1440 },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSnooze(opt.mins)}
                  disabled={isSubmitting}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSnoozeModalReminderId(null)}
              className="text-xs font-bold text-slate-400 hover:underline mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* CREATE REMINDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF9900]" />
                Create Custom Reminder
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="flex flex-col gap-3">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{modalError}</span>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Kubernetes Cluster Lab"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Message</label>
                <textarea
                  placeholder="Describe your preparation target..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                  <select
                    value={remType}
                    onChange={(e) => setRemType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="STUDY">Study</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="ROADMAP">Roadmap</option>
                    <option value="STREAK">Streak</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] to-amber-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Reminder to Database"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
