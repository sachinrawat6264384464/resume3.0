"use client";

import { useEffect, useState } from "react";
import { 
  Bell, Plus, Trash2, RefreshCw, AlertCircle, AlertTriangle, Sparkles, 
  Send, Users, CheckCircle2, ShieldCheck, Loader2, Search, Filter,
  Megaphone, Clock, Tag
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface AdminReminder {
  id: string;
  candidate_id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  due_at?: string;
  created_by?: string;
}

export default function AdminRemindersPage() {
  const [reminders, setReminders] = useState<AdminReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Broadcast Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("SYSTEM");
  const [priority, setPriority] = useState("HIGH");
  const [targetAudience, setTargetAudience] = useState("ALL");
  const [sending, setSending] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete Confirmation Modal State
  const [reminderToDelete, setReminderToDelete] = useState<AdminReminder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/reminders/admin/all");
      if (res?.data && Array.isArray(res.data)) {
        setReminders(res.data);
      } else {
        setReminders([]);
      }
    } catch (err: any) {
      console.warn("Failed to fetch admin reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setAlertMsg(null);
    try {
      const res = await apiFetch("/reminders/broadcast", {
        method: "POST",
        body: JSON.stringify({
          title,
          message,
          type,
          priority,
          target_candidate_id: targetAudience
        })
      });

      setAlertMsg({
        type: "success",
        text: res?.message || "Smart Reminder broadcasted to candidates database successfully!"
      });
      setIsModalOpen(false);
      setTitle("");
      setMessage("");
      fetchReminders();
    } catch (err: any) {
      setAlertMsg({
        type: "error",
        text: err.message || "Failed to broadcast smart reminder."
      });
    } finally {
      setSending(false);
    }
  };

  const confirmDeleteReminder = async () => {
    if (!reminderToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/reminders/admin/${reminderToDelete.id}`, { method: "DELETE" });
      setAlertMsg({
        type: "success",
        text: `Smart reminder "${reminderToDelete.title}" deleted successfully.`
      });
      setReminderToDelete(null);
      fetchReminders();
    } catch (err: any) {
      setAlertMsg({
        type: "error",
        text: "Failed to delete reminder: " + (err?.message || "Unknown error")
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch = 
      (rem.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rem.message || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rem.type || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || rem.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const activeCount = reminders.filter((r) => r.status === "ACTIVE").length;
  const highPriorityCount = reminders.filter((r) => r.priority === "HIGH").length;

  return (
    <div className="w-full flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] via-amber-500 to-orange-500 p-[1px] shadow-lg shadow-[#FF6B00]/20 shrink-0">
            <div className="w-full h-full bg-[#0B1E36] rounded-[15px] flex items-center justify-center text-[#FF6B00]">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Smart Reminders & Candidate Announcements
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Create, schedule, and broadcast real-time smart preparation alerts directly to all candidates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 flex items-center gap-2 transition-all shadow-md shadow-[#FF6B00]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Broadcast Reminder
          </button>
          
          <button
            onClick={fetchReminders}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
          alertMsg.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#FF6B00]/10 to-amber-500/10 border border-[#FF6B00]/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Total Broadcasts</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{reminders.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">Persisted in PostgreSQL</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#FF6B00]/20 text-[#FF6B00]">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Reminders</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{activeCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Visible to candidates</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 border border-rose-500/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">High Priority Alerts</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{highPriorityCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Urgent preparation alerts</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Reminders Table & Audit Feed */}
      <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#FF6B00]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Active Smart Reminders Stream
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live broadcast stream of all system & admin smart reminders delivered to candidate dashboards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, message, type..."
                className="pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00] w-64"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {["all", "SYSTEM", "STUDY", "INTERVIEW", "STREAK"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    typeFilter === t
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Target Candidate ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No smart reminders found in database matching your filters.
                  </td>
                </tr>
              ) : (
                filteredReminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          {rem.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {rem.message}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800 uppercase">
                        {rem.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        rem.priority === "HIGH"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : rem.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}>
                        {rem.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {rem.candidate_id ? `cand-${rem.candidate_id.slice(0, 8)}` : "ALL Candidates"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        rem.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        {rem.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] font-mono text-slate-500">
                      {rem.created_at ? new Date(rem.created_at).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : "Just now"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setReminderToDelete(rem)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Broadcast Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#FF6B00]" />
                Broadcast Smart Reminder / Announcement
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Live Webinar: 40 LPA DevOps Architecture & Outages"
                  className="px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description / Details *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write clear instructions for candidates..."
                  className="px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="SYSTEM">System / Webinar</option>
                    <option value="STUDY">Study Task</option>
                    <option value="INTERVIEW">Interview Practice</option>
                    <option value="STREAK">Streak Warning</option>
                    <option value="AI_RECOMMENDATION">AI Target</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="HIGH">🔴 High Priority</option>
                    <option value="MEDIUM">🟡 Medium Priority</option>
                    <option value="LOW">🔵 Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF6B00] hover:bg-orange-600 flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF6B00]/25 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Broadcast to Candidates DB
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Reminder Custom In-Page Confirmation Modal */}
      {reminderToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-rose-500/30 dark:border-rose-900/50 p-6 shadow-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Permanently Delete Reminder?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">"{reminderToDelete.title}"</span> from candidate records?
              </p>
              <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mt-1 bg-rose-500/10 py-1 px-3 rounded-full self-center">
                This action cannot be undone.
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 w-full mt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setReminderToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteReminder}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/25 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
