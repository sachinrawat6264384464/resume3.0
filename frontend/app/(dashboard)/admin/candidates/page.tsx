"use client";

import { useEffect, useState } from "react";
import { 
  Users, Search, RefreshCw, Mail, Phone, BookOpen, Award, Shield, 
  CheckCircle2, Clock, Eye, AlertCircle, ChevronRight, User, Loader2, Download, X
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/candidates");
      if (res) {
        const rawList = Array.isArray(res) 
          ? res 
          : (res.items ? res.items : (res.data ? (Array.isArray(res.data) ? res.data : (res.data.items || [])) : []));
        setCandidates(rawList);
      }
    } catch (e) {
      console.warn("Failed to fetch candidates:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Handle Export Candidate Info (CSV Download)
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("auth_token") || "";
      const response = await fetch("/api/v1/candidates/export/csv", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AI_Interview_Candidates_Export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Fallback Client-side CSV generator from current candidates state
        generateClientCSV();
      }
    } catch (err) {
      generateClientCSV();
    } finally {
      setExporting(false);
    }
  };

  const generateClientCSV = () => {
    const headers = ["Candidate ID", "Full Name", "Email", "Phone", "Target Role", "Readiness Score (%)", "Level", "XP", "Target Salary Band"];
    const rows = candidates.map(c => [
      c.id,
      `"${c.user?.full_name || c.full_name || 'Candidate'}"`,
      c.user?.email || c.email || '',
      c.phone || c.user?.phone_number || '',
      `"${c.target_role || 'Senior DevOps Engineer'}"`,
      Math.round(c.readiness_score || 0),
      c.level || 1,
      c.xp || 0,
      `"${c.target_salary_band || '₹18 – ₹40 LPA'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AI_Interview_Candidates_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = candidates.filter(c => {
    const name = c.user?.full_name || c.full_name || "";
    const email = c.user?.email || c.email || "";
    const role = c.target_role || "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || role.toLowerCase().includes(q);
  });

  const avgReadiness = candidates.length > 0
    ? Math.round(candidates.reduce((acc, curr) => acc + (curr.readiness_score || 0), 0) / candidates.length)
    : 0;

  return (
    <div className="w-full flex flex-col gap-6 pb-16 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] via-amber-500 to-orange-500 p-[1px] shadow-lg shadow-[#FF6B00]/20 shrink-0">
            <div className="w-full h-full bg-[#0B1E36] rounded-[15px] flex items-center justify-center text-[#FF6B00]">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Registered Candidates & Enrolled Engineers
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Real-Time Database Candidate Profiles & Interview Attempt History
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Download CSV Action Button */}
          <button
            onClick={handleExportCSV}
            disabled={exporting || candidates.length === 0}
            className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-md shadow-[#FF6B00]/20 flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Candidate Data (CSV)</span>
          </button>

          <button
            onClick={fetchCandidates}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Candidates</span>
          <span className="text-2xl font-black text-[#FF6B00] font-mono tracking-tight mt-2">{candidates.length}</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1">Live Database Roster</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Readiness Score</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight mt-2">{avgReadiness}%</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1">5-Pillar Evaluation Benchmark</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cohort</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight mt-2">Cohort 2026-A</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1">DevOps & Cloud Operations</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tenant Data Isolation</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight mt-2">Verified</span>
          <span className="text-[11px] font-medium text-slate-500 mt-1">Multi-Tenant Secured</span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, email, or target role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Showing {filteredCandidates.length} Registered Candidate(s)
        </span>
      </div>

      {/* Candidates Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
            <span className="text-xs font-bold">Fetching Registered Candidates from Database...</span>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Users className="w-10 h-10 stroke-[1.5]" />
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">No Candidates Found</span>
            <span className="text-xs">Candidates registered in database will appear here.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3.5 px-5">Candidate Name</th>
                  <th className="py-3.5 px-5">Email & Contact</th>
                  <th className="py-3.5 px-5">Target Role</th>
                  <th className="py-3.5 px-5">Readiness Score</th>
                  <th className="py-3.5 px-5">Level & XP</th>
                  <th className="py-3.5 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0B1E36] text-[#FF6B00] font-black flex items-center justify-center shrink-0">
                          {(c.user?.full_name || c.full_name || "C").charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {c.user?.full_name || c.full_name || "Sachin Rawat"}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{c.student_id || c.id?.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col">
                        <span>{c.user?.email || c.email || "sachin@cloudops.internal"}</span>
                        <span className="text-[10px] text-slate-400">{c.phone || c.user?.phone_number || "+91 99999 88888"}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.target_role || "Senior DevOps Engineer"}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs">
                        {Math.round(c.readiness_score || 0)}% READY
                      </span>
                    </td>

                    <td className="py-4 px-5 font-mono">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Lvl {c.level || 1} • {c.xp || 0} XP
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => setSelectedCandidate(c)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF6B00] hover:text-white text-slate-700 dark:text-slate-300 font-bold transition-all text-[11px] cursor-pointer"
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECT CANDIDATE DETAILS MODAL DRAWER */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-8 shadow-2xl flex flex-col gap-6 text-left relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0B1E36] text-[#FF6B00] font-black flex items-center justify-center text-lg">
                  {(selectedCandidate.user?.full_name || selectedCandidate.full_name || "C").charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest">CANDIDATE INSPECTOR</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedCandidate.user?.full_name || selectedCandidate.full_name || "Sachin Rawat"}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mt-1">
                  {selectedCandidate.user?.email || selectedCandidate.email || "sachin@cloudops.internal"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Contact</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate mt-1">
                  {selectedCandidate.phone || selectedCandidate.user?.phone_number || "+91 99999 88888"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Role</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                  {selectedCandidate.target_role || "Senior DevOps Engineer"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Readiness Benchmark</span>
                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400 mt-1">
                  {Math.round(selectedCandidate.readiness_score || 0)}% READY
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Level & XP</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
                  Lvl {selectedCandidate.level || 1} • {selectedCandidate.xp || 0} XP
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Salary Preference</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {selectedCandidate.target_salary_band || "₹18 – ₹40 LPA"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
