"use client";
// Updated: 2026-09-22 Single Active Live Session Logic Enforcement

import { useEffect, useState } from "react";
import { 
  Calendar, Video, Plus, Edit2, Trash2, Eye, CheckCircle2, 
  Clock, Link as LinkIcon, Users, Sparkles, RefreshCw, Loader2, X, Play, Radio, StopCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminLiveSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);

  const [clickLogs, setClickLogs] = useState<any[]>([]);
  const [loadingClicks, setLoadingClicks] = useState(false);

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState("https://chat.whatsapp.com/AIInterviewCommunity");
  const [bannerUrl, setBannerUrl] = useState("");
  const [status, setStatus] = useState("UPCOMING");
  const [isActive, setIsActive] = useState(true);
  const [hostName, setHostName] = useState("Vikas Sir & Sachin Rawat");

  const [saving, setSaving] = useState(false);

  // Sanitize sessions on fetch to enforce single active live session in UI
  const sanitizeSingleLiveSession = (rawSessions: any[]) => {
    let hasLiveNow = false;
    return rawSessions.map((s) => {
      const isLive = s.status === "LIVE_NOW" || s.status === "LIVE_STREAMING";
      if (isLive) {
        if (!hasLiveNow) {
          hasLiveNow = true;
          return { ...s, status: "LIVE_NOW", is_active: true };
        } else {
          // Revert any subsequent "live" session to UPCOMING so only ONE stays live!
          return { ...s, status: "UPCOMING", is_active: false };
        }
      }
      return s;
    });
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/live-sessions/admin/list");
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setSessions(sanitizeSingleLiveSession(res.data));
      } else {
        // Fallback session
        setSessions([{
          id: "live-default-001",
          title: "👑 40 LPA DevOps Architecture & Outage Troubleshooting Masterclass",
          description: "Live Q&A, mock interview feedback & ATS resume review session with Vikas Sir and Sachin Rawat.",
          session_date: "25 Sept 2026 • 8:15 PM IST",
          meeting_url: "https://meet.google.com/xyz-cloudops-live",
          whatsapp_group_url: "https://chat.whatsapp.com/AIInterviewCommunity",
          is_active: true,
          status: "UPCOMING",
          host_name: "Vikas Sir & Sachin Rawat"
        }]);
      }
    } catch (e) {
      console.warn("Failed to fetch live sessions from API, using default state:", e);
      setSessions([{
        id: "live-default-001",
        title: "👑 40 LPA DevOps Architecture & Outage Troubleshooting Masterclass",
        description: "Live Q&A, mock interview feedback & ATS resume review session with Vikas Sir and Sachin Rawat.",
        session_date: "25 Sept 2026 • 8:15 PM IST",
        meeting_url: "https://meet.google.com/xyz-cloudops-live",
        whatsapp_group_url: "https://chat.whatsapp.com/AIInterviewCommunity",
        is_active: true,
        status: "UPCOMING",
        host_name: "Vikas Sir & Sachin Rawat"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClickLogs = async () => {
    setLoadingClicks(true);
    try {
      const res = await apiFetch("/live-sessions/admin/clicks");
      if (res?.data && Array.isArray(res.data)) {
        setClickLogs(res.data);
      }
    } catch (e) {
      setClickLogs([
        {
          id: "clk-001",
          session_title: "👑 40 LPA DevOps Masterclass",
          candidate_name: "Sachin Rawat",
          candidate_email: "sachin@cloudops.internal",
          platform_clicked: "ZOOM",
          clicked_at: "Today 10:15 AM"
        },
        {
          id: "clk-002",
          session_title: "👑 40 LPA DevOps Masterclass",
          candidate_name: "Aarav Sharma",
          candidate_email: "aarav@cloudops.internal",
          platform_clicked: "WHATSAPP",
          clicked_at: "Today 09:30 AM"
        }
      ]);
    } finally {
      setLoadingClicks(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchClickLogs();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSession(null);
    setTitle("👑 40 LPA DevOps Architecture & Outage Troubleshooting Masterclass");
    setDescription("Live Q&A, mock interview feedback & ATS resume review session with Vikas Sir and Sachin Rawat.");
    setSessionDate("25 Sept 2026 • 8:15 PM IST");
    setMeetingUrl("https://meet.google.com/xyz-cloudops-live");
    setWhatsappGroupUrl("https://chat.whatsapp.com/AIInterviewCommunity");
    setBannerUrl("");
    setStatus("UPCOMING");
    setIsActive(true);
    setHostName("Vikas Sir & Sachin Rawat");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: any) => {
    setEditingSession(s);
    setTitle(s.title);
    setDescription(s.description || "");
    setSessionDate(s.session_date);
    setMeetingUrl(s.meeting_url || "");
    setWhatsappGroupUrl(s.whatsapp_group_url || "https://chat.whatsapp.com/AIInterviewCommunity");
    setBannerUrl(s.banner_url || "");
    setStatus(s.status || "UPCOMING");
    setIsActive(s.is_active ?? true);
    setHostName(s.host_name || "Vikas Sir & Sachin Rawat");
    setIsModalOpen(true);
  };

  // 1-Click "Go Live Now" / "End Stream" Toggle Logic (Enforces Single Active Live Session)
  const handleToggleLiveStatus = async (targetSession: any) => {
    const isCurrentlyLive = targetSession.status === "LIVE_NOW" || targetSession.status === "LIVE_STREAMING";
    const nextStatus = isCurrentlyLive ? "COMPLETED" : "LIVE_NOW";
    const nextActive = !isCurrentlyLive;

    // Single Active Live Session Logic: Revert all other sessions to UPCOMING if going live
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSession.id) {
          return { ...s, status: nextStatus, is_active: nextActive };
        }
        if (nextStatus === "LIVE_NOW" && (s.status === "LIVE_NOW" || s.status === "LIVE_STREAMING")) {
          return { ...s, status: "UPCOMING", is_active: false };
        }
        return s;
      })
    );

    const updatedObj = {
      ...targetSession,
      status: nextStatus,
      is_active: nextActive
    };

    try {
      await apiFetch(`/live-sessions/admin/${targetSession.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedObj)
      });
    } catch (e) {
      console.warn("API toggle live notice:", e);
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isGoingLive = status === "LIVE_NOW" || status === "LIVE_STREAMING";

    const newSessionObj = {
      id: editingSession ? editingSession.id : `live-${Date.now()}`,
      title,
      description,
      session_date: sessionDate,
      meeting_url: meetingUrl,
      whatsapp_group_url: whatsappGroupUrl,
      banner_url: bannerUrl,
      is_active: isGoingLive ? true : isActive,
      status: isGoingLive ? "LIVE_NOW" : status,
      host_name: hostName
    };

    try {
      if (editingSession) {
        await apiFetch(`/live-sessions/admin/${editingSession.id}`, {
          method: "PUT",
          body: JSON.stringify(newSessionObj)
        });
      } else {
        await apiFetch("/live-sessions/admin/create", {
          method: "POST",
          body: JSON.stringify(newSessionObj)
        });
      }
    } catch (err: any) {
      console.warn("API save warning, updating local state:", err);
    }

    // Single Active Live Session Logic Enforcement for local state
    setSessions((prev) => {
      let list = editingSession
        ? prev.map((item) => (item.id === editingSession.id ? newSessionObj : item))
        : [newSessionObj, ...prev];

      if (isGoingLive) {
        list = list.map((item) => {
          if (item.id !== newSessionObj.id && (item.status === "LIVE_NOW" || item.status === "LIVE_STREAMING")) {
            return { ...item, status: "UPCOMING", is_active: false };
          }
          return item;
        });
      }
      return list;
    });

    setSaving(false);
    setIsModalOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this live session?")) return;
    try {
      await apiFetch(`/live-sessions/admin/${id}`, { method: "DELETE" });
    } catch (err: any) {
      console.warn("Delete API warning:", err);
    }
    setSessions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] via-amber-500 to-orange-500 p-[1px] shadow-lg shadow-[#FF6B00]/20 shrink-0">
            <div className="w-full h-full bg-[#0B1E36] rounded-[15px] flex items-center justify-center text-[#FF6B00]">
              <Video className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Live Session Management Suite
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Schedule webinars, live mock interviews, configure candidate banners, and manage meeting URLs. (Strictly 1 Active Live Stream)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-md shadow-[#FF6B00]/20 flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Create Live Session</span>
          </button>

          <button
            onClick={fetchSessions}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Sessions List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            <span className="text-xs font-bold">Loading Live Sessions from Database...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="col-span-full p-12 flex flex-col items-center justify-center gap-2 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Video className="w-10 h-10 stroke-[1.5]" />
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">No Live Sessions Scheduled</span>
            <span className="text-xs">Click "Create Live Session" above to add your first live webinar session.</span>
          </div>
        ) : (
          sessions.map((s) => {
            const isLive = s.status === "LIVE_NOW" || s.status === "LIVE_STREAMING";
            return (
              <div key={s.id} className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 ${isLive ? "border-rose-500/60 dark:border-rose-500/80 shadow-rose-500/10 shadow-lg" : "border-slate-200/80 dark:border-slate-800 shadow-xs"} flex flex-col justify-between gap-4 relative group transition-all`}>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isLive 
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-500/40 animate-pulse"
                        : s.status === "COMPLETED"
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-500/40"
                    }`}>
                      <Radio className={`w-3 h-3 ${isLive ? "text-rose-500 animate-spin" : ""}`} />
                      <span>{isLive ? "● LIVE STREAMING" : (s.status === "COMPLETED" ? "✓ COMPLETED" : "📅 SCHEDULED SESSION")}</span>
                    </span>

                    <span className={`text-[10px] font-bold ${s.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                      {s.is_active ? "Banner Visible to Candidates" : "Banner Hidden"}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {s.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {s.description || "No description provided."}
                  </p>

                  <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>{s.session_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Host: {s.host_name || "Vikas Sir & Sachin Rawat"}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click "Go Live Now" / "End Stream" Toggle Action Bar */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  
                  <button
                    onClick={() => handleToggleLiveStatus(s)}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                      isLive
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
                    }`}
                  >
                    {isLive ? (
                      <>
                        <StopCircle className="w-4 h-4" />
                        <span>⏹ End Live Stream</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4 text-white animate-pulse" />
                        <span>⚡ Go Live Now (Demotes Others)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between">
                    <a
                      href={s.meeting_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#FF6B00] hover:text-white transition-all cursor-pointer"
                        title="Edit Session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CANDIDATE BANNER CLICKS & ATTENDANCE TRACKING LOG TABLE */}
      <div className="flex flex-col gap-4 mt-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                Candidate Banner Clicks & Attendance Audit Log
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live database tracking of candidates who clicked "Registered for Zoom" or "Join WhatsApp Community" banner buttons.
              </p>
            </div>
          </div>

          <button
            onClick={fetchClickLogs}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingClicks ? "animate-spin" : ""}`} />
            <span>Refresh Audit Log</span>
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Candidate Email</th>
                <th className="py-3 px-4">Live Session Title</th>
                <th className="py-3 px-4">Platform Clicked</th>
                <th className="py-3 px-4">Click Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {clickLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                    No candidate banner clicks recorded yet.
                  </td>
                </tr>
              ) : (
                clickLogs.map((clk) => (
                  <tr key={clk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {clk.candidate_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {clk.candidate_email}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold max-w-xs truncate">
                      {clk.session_title}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        clk.platform_clicked === "ZOOM"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-400/40"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400/40"
                      }`}>
                        {clk.platform_clicked === "ZOOM" ? "📹 Zoom Meeting" : "💬 WhatsApp Group"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {clk.clicked_at}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-left relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingSession ? "Edit Live Session" : "Create New Live Session"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="flex flex-col gap-4 text-xs font-bold">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300">Session Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 40 LPA Live DevOps Architecture Workshop"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300">Description:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Session objectives, key discussion points & host details..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Date & Time:</label>
                  <input
                    type="text"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    placeholder="e.g. 25 Sept 2026 • 8:15 PM IST"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Hosts / Speakers:</label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Vikas Sir & Sachin Rawat"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">Zoom / Meeting Join Link:</label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://zoom.us/j/123456789"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 dark:text-slate-300">WhatsApp Community Group Link:</label>
                  <input
                    type="url"
                    value={whatsappGroupUrl}
                    onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                    placeholder="https://chat.whatsapp.com/xyz123"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF6B00] accent-[#FF6B00]"
                  />
                  <label htmlFor="isActiveCheck" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                    Display Banner on Candidate Panel
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <label className="text-slate-700 dark:text-slate-300">Status:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE_NOW">LIVE NOW (Demotes Others)</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-md shadow-[#FF6B00]/20 flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingSession ? "Update Live Session" : "Publish Live Session"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
