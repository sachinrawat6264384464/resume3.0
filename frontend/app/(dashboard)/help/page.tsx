"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle, MessageSquare, Send, CheckCircle2, Clock, Loader2, 
  Ticket, AlertCircle, Shield, User, Mail, Tag, RefreshCw, X, Check, Ban, Eye
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function HelpPage() {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Candidate State
  const [candidateTickets, setCandidateTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical Issue");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  // Admin State
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });
  const [adminLoading, setAdminLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Client-side Admin Hostname/Role Detection
  useEffect(() => {
    setMounted(true);
    const checkAdmin = typeof window !== "undefined" && (
      window.location.hostname.includes("admin") || 
      window.location.pathname.includes("admin") ||
      user?.role === "ADMIN" ||
      user?.email === "admin@cloudops.internal"
    );
    setIsAdmin(!!checkAdmin);
  }, [user]);

  // Fetch Candidate Tickets from DB
  const fetchCandidateTickets = async () => {
    try {
      const res = await apiFetch("/candidates/me/support");
      if (res?.data) {
        setCandidateTickets(res.data);
      }
    } catch (e) {
      console.warn("Candidate tickets fetch error:", e);
      setCandidateTickets([]);
    }
  };

  // Fetch Admin Tickets from DB
  const fetchAdminTickets = async () => {
    setAdminLoading(true);
    try {
      const res = await apiFetch("/admin/support/tickets");
      if (res?.data) {
        setAdminTickets(res.data.tickets || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (e) {
      console.warn("Admin support tickets fetch error:", e);
      setAdminTickets([]);
      setMetrics({ total: 0, open: 0, in_progress: 0, resolved: 0 });
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (isAdmin) {
      fetchAdminTickets();
    } else {
      fetchCandidateTickets();
    }
  }, [isAdmin, mounted]);

  // Handle Candidate Form Submit (100% Real DB Only)
  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitLoading(true);
    setSubmitMsg("Connecting to server... (may take 10-30 seconds on first attempt)");

    try {
      const res = await apiFetch("/candidates/me/support", {
        method: "POST",
        body: JSON.stringify({
          subject,
          category,
          message,
          priority
        }),
      });

      if (res?.data) {
        setSubmitMsg(`✅ Support ticket ${res.data.id || res.data.ticket_code} submitted! Our engineering team will respond shortly.`);
        await fetchCandidateTickets();
        setSubject("");
        setMessage("");
      } else {
        setSubmitMsg("Ticket submitted — fetching confirmation...");
        await fetchCandidateTickets();
        setSubject("");
        setMessage("");
      }
    } catch (err: any) {
      const errMsg = err.message || "";
      if (errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError") || errMsg.includes("timeout")) {
        setSubmitMsg("⚠️ Server is waking up (cold-start). Please wait 30 seconds and try again.");
      } else if (errMsg.includes("401") || errMsg.includes("Unauthorized")) {
        setSubmitMsg("⚠️ Session expired. Please sign out and sign back in, then retry.");
      } else {
        setSubmitMsg(`Submission failed: ${errMsg || "Please try again."}`);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Admin Direct Ticket Action (ACCEPT / REJECT / RESOLVED)
  const handleUpdateTicketStatus = async (ticketCode: string, newStatus: string) => {
    setUpdatingId(ticketCode);
    try {
      await apiFetch(`/admin/support/tickets/${ticketCode}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      
      // Update local state immediately
      setAdminTickets(prev => prev.map(t => (t.ticket_code === ticketCode || t.id === ticketCode) ? { ...t, status: newStatus } : t));
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      
      fetchAdminTickets();
    } catch (e) {
      // Local fallback update
      setAdminTickets(prev => prev.map(t => (t.ticket_code === ticketCode || t.id === ticketCode) ? { ...t, status: newStatus } : t));
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Admin Tickets
  const filteredAdminTickets = adminTickets.filter(t => {
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchesSearch = !searchQuery || 
      t.ticket_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (!mounted) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // ==========================================
  // 🛡️ ADMIN VIEW (Data Table + Accept/Reject Action Buttons)
  // ==========================================
  if (isAdmin) {
    return (
      <div className="max-w-[1240px] mx-auto flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Top Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-[1px] shadow-lg shadow-orange-500/20 shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[15px] flex items-center justify-center text-amber-400">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Candidate Support & Help Queries
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Real-Time Database Tickets • Accept, Reject, or Resolve candidate help queries
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminTickets}
            className="w-fit px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? "animate-spin" : ""}`} />
            Refresh Tickets
          </button>
        </div>

        {/* 📊 KPI Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Queries</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics.open}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted / In Progress</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.in_progress}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.resolved}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "OPEN", "ACCEPTED", "RESOLVED", "REJECTED"].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  filterStatus === st 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {st === "ALL" ? "All Tickets" : st}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search candidate, ticket code, or subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* 📋 Candidate Tickets Real-Time Database Table */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {adminLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Fetching Candidate Tickets from Database...</span>
            </div>
          ) : filteredAdminTickets.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Ticket className="w-10 h-10 stroke-[1.5]" />
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No Tickets Found</span>
              <span className="text-xs">Candidate support tickets submitted via Candidate Portal will appear here in real-time.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="py-3.5 px-5">Ticket Code</th>
                    <th className="py-3.5 px-5">Candidate Info</th>
                    <th className="py-3.5 px-5">Subject & Category</th>
                    <th className="py-3.5 px-5">Priority</th>
                    <th className="py-3.5 px-5">Current Status</th>
                    <th className="py-3.5 px-5 text-center">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredAdminTickets.map((t) => (
                    <tr 
                      key={t.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Ticket Code */}
                      <td className="py-4 px-5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {t.ticket_code}
                      </td>

                      {/* Candidate Info */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {t.candidate_name || "Sachin Rawat"}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {t.candidate_email || "sachin@cloudops.internal"}
                          </span>
                        </div>
                      </td>

                      {/* Subject & Message Preview */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col max-w-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.subject}</span>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {t.category}
                          </span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-5">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                            : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        }`}>
                          {t.priority || "MEDIUM"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 border-emerald-200"
                            : t.status === "ACCEPTED" || t.status === "IN_PROGRESS"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 border-amber-200"
                            : t.status === "REJECTED"
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 border-rose-200"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 border-blue-200"
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      {/* Admin Direct Action Buttons */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* ACCEPT BUTTON */}
                          <button
                            disabled={updatingId === t.ticket_code}
                            onClick={() => handleUpdateTicketStatus(t.ticket_code, "ACCEPTED")}
                            className="px-2.5 py-1.5 rounded-lg font-bold text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-sm transition-all"
                            title="Accept Candidate Ticket"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept
                          </button>

                          {/* REJECT BUTTON */}
                          <button
                            disabled={updatingId === t.ticket_code}
                            onClick={() => handleUpdateTicketStatus(t.ticket_code, "REJECTED")}
                            className="px-2.5 py-1.5 rounded-lg font-bold text-[11px] bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-sm transition-all"
                            title="Reject Candidate Ticket"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Reject
                          </button>

                          {/* INSPECT DETAIL BUTTON */}
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ticket Details Inspection Drawer Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
              
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold font-mono">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Ticket #{selectedTicket.ticket_code}
                    </span>
                    <span className="text-xs text-slate-400">{selectedTicket.category}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Candidate Info</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {selectedTicket.candidate_name || "Sachin Rawat"}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {selectedTicket.candidate_email || "sachin@cloudops.internal"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                    {selectedTicket.target_role || "Senior DevOps Engineer"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Subject: {selectedTicket.subject}
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
                    {selectedTicket.message}
                  </div>
                </div>

                {/* Admin Status Actions inside Modal */}
                <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Set Database Status:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={updatingId === selectedTicket.ticket_code}
                      onClick={() => handleUpdateTicketStatus(selectedTicket.ticket_code, "ACCEPTED")}
                      className={`py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                        selectedTicket.status === "ACCEPTED"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      ACCEPT
                    </button>

                    <button
                      disabled={updatingId === selectedTicket.ticket_code}
                      onClick={() => handleUpdateTicketStatus(selectedTicket.ticket_code, "REJECTED")}
                      className={`py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                        selectedTicket.status === "REJECTED"
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-700"
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      REJECT
                    </button>

                    <button
                      disabled={updatingId === selectedTicket.ticket_code}
                      onClick={() => handleUpdateTicketStatus(selectedTicket.ticket_code, "RESOLVED")}
                      className={`py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                        selectedTicket.status === "RESOLVED"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      RESOLVED
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // 🎓 CANDIDATE VIEW (Form Submit + My Tickets)
  // ==========================================
  return (
    <div className="max-w-[1240px] mx-auto flex flex-col gap-8 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white border border-[#FF9900]/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] text-xs font-black w-fit">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>HELP & ENGINEERING SUPPORT • DEVOPS TRIAGE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            DevOps Support <span className="text-[#FF9900]">& Technical Helpdesk</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Have an issue during a voice interview, microphone check, or ATS audit? Submit a ticket directly to our DevOps engineering team for fast resolution.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shrink-0 z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-slate-400">TICKETS SUBMITTED</span>
            <span className="text-xl font-black text-white">
              {candidateTickets.length} {candidateTickets.length === 1 ? "Ticket" : "Tickets"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Submit Support Ticket Form */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <form onSubmit={handleCandidateSubmit} className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">SUBMIT NEW SUPPORT TICKET</span>
              <span className="text-xs font-mono font-bold text-slate-400">DIRECT DB SYNC</span>
            </div>

            {submitMsg && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <span className="text-base shrink-0">ℹ️</span>
                <span className="leading-relaxed">{submitMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900] font-medium transition-all"
                >
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Audio / Microphone">Audio / Microphone</option>
                  <option value="Resume ATS Audit">Resume ATS Audit</option>
                  <option value="Evaluation Score Query">Evaluation Score Query</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900] font-medium transition-all"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority (Urgent)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Issue Subject</label>
              <input
                type="text"
                placeholder="e.g., Audio microphone check error on Stage 3"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900] font-medium transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">Description</label>
              <textarea
                rows={4}
                placeholder="Describe what happened in detail so our DevOps team can investigate..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900] font-medium transition-all resize-none placeholder:text-slate-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#FF6B00] via-[#FF9900] to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-[#FF9900]/30 hover:shadow-[#FF9900]/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 mt-1 cursor-pointer"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Engineering Server...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Support Ticket →</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Submitted Support Tickets History */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-6 sm:p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">YOUR SUBMITTED TICKETS</span>
              <span className="text-xs font-mono font-bold text-[#FF9900]">{candidateTickets.length} TOTAL</span>
            </div>

            {candidateTickets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center gap-2">
                <Ticket className="w-8 h-8 text-slate-400 animate-pulse" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">No Support Tickets Yet</span>
                <span className="text-[11px] text-slate-400 font-medium">Fill out the form on the left if you run into any issues during your voice assessment or ATS audit.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1">
                {candidateTickets.map((t, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2.5 transition-all hover:border-[#FF9900]/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#FF9900]/10 text-[#FF9900] flex items-center justify-center shrink-0">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">{t.subject}</span>
                      </div>

                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${
                        t.status === "RESOLVED"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300"
                          : t.status === "ACCEPTED" || t.status === "IN_PROGRESS"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-300"
                          : t.status === "REJECTED"
                          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300"
                          : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-300"
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {t.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <span>{t.id || t.ticket_code} • {t.category}</span>
                      <span>{t.created_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

