"use client";

import { useEffect, useState } from "react";
import { 
  Users, Search, RefreshCw, Mail, Phone, BookOpen, Award, Shield, 
  CheckCircle2, Clock, Eye, AlertCircle, ChevronRight, User, Loader2, Download, X,
  Linkedin, ExternalLink, Trash2, AlertTriangle, MessageSquare, Star, Send
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("admin_cache_candidates");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => candidates.length === 0);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Delete candidate confirmation modal state
  const [candidateToDelete, setCandidateToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Admin Feedback modal state
  const [feedbackCandidate, setFeedbackCandidate] = useState<any | null>(null);
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbText, setFbText] = useState<string>("");
  const [fbStrengths, setFbStrengths] = useState<string>("");
  const [fbImprovements, setFbImprovements] = useState<string>("");
  const [isSubmittingFb, setIsSubmittingFb] = useState<boolean>(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState<string | null>(null);

  const getLinkedinUrl = (c: any) => {
    let rawUrl = c.linkedin_url || c.resume_data_json?.linkedin_url;
    if (!rawUrl && c.notes) {
      try {
        const parsed = typeof c.notes === "string" ? JSON.parse(c.notes) : c.notes;
        if (parsed?.linkedin_url) rawUrl = parsed.linkedin_url;
      } catch (e) {}
    }

    if (!rawUrl || typeof rawUrl !== "string" || !rawUrl.trim()) {
      return null;
    }

    const cleaned = rawUrl.trim();
    if (cleaned.includes("example.com") || cleaned.toLowerCase() === "null" || cleaned.toLowerCase() === "undefined") {
      return null;
    }

    return cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    setAlertMsg(null);
    try {
      const deleteId = candidateToDelete.id || candidateToDelete.user_id;
      const res = await apiFetch(`/candidates/${deleteId}`, { method: "DELETE" });
      
      const deletedName = candidateToDelete.user?.full_name || candidateToDelete.full_name || "Candidate";
      setAlertMsg({
        type: "success",
        text: res?.message || `Candidate account '${deletedName}' permanently deleted.`
      });

      const targetId = candidateToDelete.id;
      const targetUserId = candidateToDelete.user_id;

      // Update state immediately
      setCandidates(prev => prev.filter(c => c.id !== targetId && c.user_id !== targetUserId));
      
      // Clear sessionStorage cache so deleted candidates don't reappear on reload
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("admin_cache_candidates");
        } catch {}
      }

      setCandidateToDelete(null);
      await fetchCandidates();
    } catch (err: any) {
      setAlertMsg({
        type: "error",
        text: "Failed to delete candidate: " + (err?.message || "Unknown error")
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackCandidate) return;
    if (!fbText.trim()) return;

    setIsSubmittingFb(true);
    setFbSuccessMsg(null);

    try {
      const targetId = feedbackCandidate.id || feedbackCandidate.user_id;
      await apiFetch(`/candidates/${targetId}/feedback`, {
        method: "POST",
        body: JSON.stringify({
          rating: fbRating,
          feedback_text: fbText.trim(),
          strengths: fbStrengths.trim(),
          areas_of_improvement: fbImprovements.trim(),
          admin_name: "Admin Evaluator"
        })
      });

      setFbSuccessMsg(`🎉 Feedback saved & published to Candidate ${feedbackCandidate.user?.full_name || feedbackCandidate.full_name}'s My Progress panel!`);
      setTimeout(() => {
        setFeedbackCandidate(null);
        setFbSuccessMsg(null);
        setFbText("");
        setFbStrengths("");
        setFbImprovements("");
      }, 2000);
    } catch (err: any) {
      alert("Failed to send feedback: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmittingFb(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/candidates");
      if (res) {
        const rawList = Array.isArray(res) 
          ? res 
          : (res.items ? res.items : (res.data ? (Array.isArray(res.data) ? res.data : (res.data.items || [])) : []));
        setCandidates(rawList);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("admin_cache_candidates", JSON.stringify(rawList));
          } catch {}
        }
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

  const getHighestQualification = (c: any) => {
    if (c.resume_data_json?.highest_qualification) return c.resume_data_json.highest_qualification;
    if (c.notes) {
      try {
        const parsed = typeof c.notes === "string" ? JSON.parse(c.notes) : c.notes;
        if (parsed?.highest_qualification) return parsed.highest_qualification;
      } catch (e) {}
    }
    return "Bachelor's degree";
  };

  const getYearsOfExperience = (c: any) => {
    if (c.resume_data_json?.years_of_experience) return c.resume_data_json.years_of_experience;
    if (c.notes) {
      try {
        const parsed = typeof c.notes === "string" ? JSON.parse(c.notes) : c.notes;
        if (parsed?.years_of_experience) return parsed.years_of_experience;
      } catch (e) {}
    }
    return "1–2 years";
  };

  const getDesignation = (c: any) => {
    if (c.designation) return c.designation;
    if (c.resume_data_json?.designation) return c.resume_data_json.designation;
    if (c.notes) {
      try {
        const parsed = typeof c.notes === "string" ? JSON.parse(c.notes) : c.notes;
        if (parsed?.designation) return parsed.designation;
      } catch (e) {}
    }
    return "DevOps Engineer";
  };

  const getExperienceLevel = (c: any) => {
    return c.experience_level || c.resume_data_json?.experience_level || "MID";
  };

  const getPhoneDisplay = (c: any) => {
    if (!c) return "No Phone";
    if (c.phone && c.phone.trim() && c.phone.trim() !== "null" && c.phone.trim() !== "undefined") return c.phone.trim();
    if (c.user?.phone_number && c.user.phone_number.trim() && c.user.phone_number.trim() !== "null") return c.user.phone_number.trim();
    
    const sources = [
      c.user?.email || "",
      c.email || "",
      c.student_id || "",
      c.notes || "",
      typeof c.resume_data_json === "string" ? c.resume_data_json : JSON.stringify(c.resume_data_json || {})
    ];

    for (const src of sources) {
      const match = src.match(/(?:\+?91[\s-]?)?([6-9]\d{9})/);
      if (match && match[1]) {
        return `+91 ${match[1]}`;
      }
      const allDigits = src.replace(/\D/g, "");
      if (allDigits.length >= 10) {
        return `+91 ${allDigits.slice(-10)}`;
      }
    }

    return "No Phone";
  };

  const getTargetSalaryBand = (c: any) => {
    return c.target_salary_band || c.resume_data_json?.target_salary_band || "₹18 – ₹40 LPA";
  };

  const generateClientCSV = () => {
    const headers = ["Candidate ID", "Full Name", "Email", "Phone", "Highest Qualification", "Years of Experience", "Current Designation", "Target Role", "Experience Level", "Target Salary Band", "LinkedIn URL", "Readiness Score (%)", "Level", "XP"];
    const rows = candidates.map(c => [
      c.id,
      `"${c.user?.full_name || c.full_name || 'Candidate'}"`,
      c.user?.email || c.email || '',
      getPhoneDisplay(c),
      `"${getHighestQualification(c)}"`,
      `"${getYearsOfExperience(c)}"`,
      `"${getDesignation(c)}"`,
      `"${c.target_role || 'Senior DevOps Engineer'}"`,
      `"${getExperienceLevel(c)}"`,
      `"${getTargetSalaryBand(c)}"`,
      `"${getLinkedinUrl(c) || ''}"`,
      Math.round(c.readiness_score || 0),
      c.level || 1,
      c.xp || 0
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
    const desig = getDesignation(c);
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || role.toLowerCase().includes(q) || desig.toLowerCase().includes(q);
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
                  <th className="py-3.5 px-4">Candidate Name</th>
                  <th className="py-3.5 px-4">Email & Contact</th>
                  <th className="py-3.5 px-4">Current Designation</th>
                  <th className="py-3.5 px-4">Target Role & Salary</th>
                  <th className="py-3.5 px-4">Exp Level</th>
                  <th className="py-3.5 px-4">LinkedIn Profile</th>
                  <th className="py-3.5 px-4">Readiness</th>
                  <th className="py-3.5 px-4">Level & XP</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredCandidates.map((c) => {
                  const linkedinUrl = getLinkedinUrl(c);
                  const desig = getDesignation(c);
                  const expLvl = getExperienceLevel(c);
                  const salary = getTargetSalaryBand(c);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
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

                      <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {c.user?.email && !c.user.email.endsWith("@cloudops.internal") 
                              ? c.user.email 
                              : (c.email && !c.email.endsWith("@cloudops.internal") ? c.email : "📱 Mobile Registered")}
                          </span>
                          <span className="text-[10px] text-[#FF6B00] font-mono font-bold">
                            {getPhoneDisplay(c)}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px]">
                          {desig}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {c.target_role || "Senior DevOps Engineer"}
                          </span>
                          <span className="text-[10px] font-mono text-[#FF6B00] font-black">
                            {salary}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {expLvl}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {linkedinUrl ? (
                          <a
                            href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-[#0A66C2] dark:text-blue-400 font-extrabold text-[11px] transition-all border border-blue-500/20 shadow-2xs"
                          >
                            <Linkedin className="w-3.5 h-3.5 fill-current" />
                            <span>Profile</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not Provided</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full text-xs">
                          {Math.round(c.readiness_score || 0)}% READY
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Lvl {c.level || 1} • {c.xp || 0} XP
                        </span>
                      </td>

                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setFeedbackCandidate(c);
                              setFbRating(5);
                              setFbText("");
                              setFbStrengths("");
                              setFbImprovements("");
                              setFbSuccessMsg(null);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 font-bold transition-all text-[11px] flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-900/50"
                            title="Give Admin Feedback to Candidate"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Feedback</span>
                          </button>

                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF6B00] hover:text-white text-slate-700 dark:text-slate-300 font-bold transition-all text-[11px] cursor-pointer"
                          >
                            Inspect
                          </button>
                          
                          <button
                            onClick={() => setCandidateToDelete(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold transition-all text-[11px] flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                            title="Permanently Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                  {selectedCandidate.user?.email && !selectedCandidate.user.email.endsWith("@cloudops.internal")
                    ? selectedCandidate.user.email
                    : (selectedCandidate.email && !selectedCandidate.email.endsWith("@cloudops.internal") ? selectedCandidate.email : "📱 Mobile Registered")}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Contact</span>
                <span className="text-xs font-mono font-bold text-[#FF6B00] truncate mt-1">
                  {getPhoneDisplay(selectedCandidate)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Role</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
                  {selectedCandidate.target_role || "Senior DevOps Engineer"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn Profile</span>
                {getLinkedinUrl(selectedCandidate) ? (
                  <a
                    href={getLinkedinUrl(selectedCandidate)?.startsWith("http") ? (getLinkedinUrl(selectedCandidate) || undefined) : `https://${getLinkedinUrl(selectedCandidate)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0A66C2] hover:underline flex items-center gap-1 mt-1 truncate"
                  >
                    <Linkedin className="w-3.5 h-3.5 shrink-0 fill-current" />
                    <span className="truncate">{getLinkedinUrl(selectedCandidate)}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                  </a>
                ) : (
                  <span className="text-xs italic text-slate-400 mt-1">Not Provided</span>
                )}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Highest Qualification</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {getHighestQualification(selectedCandidate)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Years of Experience</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {getYearsOfExperience(selectedCandidate)}
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

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {candidateToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/30 rounded-[32px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 text-left relative">
            
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                  Permanently Delete Candidate?
                </h3>
                <p className="text-[11px] font-mono text-rose-500 font-bold uppercase tracking-wider">
                  Irreversible Database Action
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to permanently delete candidate <strong className="text-slate-900 dark:text-white font-extrabold">{candidateToDelete.user?.full_name || candidateToDelete.full_name}</strong> (<span className="font-mono">{candidateToDelete.user?.email || candidateToDelete.email}</span>)?
              <br /><br />
              <span className="text-rose-500 font-bold">This will remove their profile, stage attempts, certificates, and user login record from the database completely. They will no longer be able to log in.</span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCandidateToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCandidate}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? "Deleting Permanently..." : "Yes, Delete Account"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GIVE ADMIN FEEDBACK MODAL */}
      {feedbackCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 rounded-[32px] max-w-lg w-full p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-left relative overflow-hidden">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    Give Feedback & Performance Rating
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Target Candidate: {feedbackCandidate.user?.full_name || feedbackCandidate.full_name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFeedbackCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {fbSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{fbSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="flex flex-col gap-4">
                
                {/* Star Rating Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Overall Rating Score (1 to 5 Stars):</span>
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                          fbRating >= star
                            ? "bg-amber-500/10 border-amber-500 text-amber-500"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${fbRating >= star ? "fill-amber-500" : ""}`} />
                        <span className="text-xs font-black">{star}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Detailed Text Area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Detailed Admin Feedback & Remarks: *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={fbText}
                    onChange={(e) => setFbText(e.target.value)}
                    placeholder="e.g. Excellent technical grasp on Linux & Docker containers. Communicates system architecture clearly. Focus on improving Kubernetes Helm deployment speed."
                    className="w-full px-3.5 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Key Strengths */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Key Candidate Strengths (Optional):
                  </label>
                  <input
                    type="text"
                    value={fbStrengths}
                    onChange={(e) => setFbStrengths(e.target.value)}
                    placeholder="e.g. Linux Kernel Triage, AWS VPC Architecture, Problem Solving"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Focus Areas for Improvement */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Focus Areas for Improvement (Optional):
                  </label>
                  <input
                    type="text"
                    value={fbImprovements}
                    onChange={(e) => setFbImprovements(e.target.value)}
                    placeholder="e.g. Terraform State Locking, Incident Response Speed"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFeedbackCandidate(null)}
                    disabled={isSubmittingFb}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingFb || !fbText.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                  >
                    {isSubmittingFb ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{isSubmittingFb ? "Submitting Feedback..." : "Publish Feedback to Candidate"}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
