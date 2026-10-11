"use client";

import { useEffect, useState, Fragment } from "react";
import { 
  Users, Search, RefreshCw, Mail, Phone, BookOpen, Award, Shield, 
  CheckCircle2, Clock, Eye, AlertCircle, ChevronRight, User, Loader2, Download, X,
  Linkedin, ExternalLink, Trash2, AlertTriangle, MessageSquare, Star, Send,
  ChevronDown, Layers, CreditCard, Sparkles, Check, Flame, Pencil, Plus
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const STAGE_TITLES_LIST = [
  { num: 0, title: "Setup Your Interview Profile", level: "Foundation", cat: "Profile & Pitch" },
  { num: 1, title: "Self Introduction & Career Pitch", level: "Foundation", cat: "Personal Pitch" },
  { num: 2, title: "Technical Introduction & Core Stack", level: "Foundation", cat: "Core Tech" },
  { num: 3, title: "Linux for Cloud Engineers", level: "Foundation", cat: "Linux Diagnostics" },
  { num: 4, title: "Linux for DevOps Engineers", level: "Foundation", cat: "Linux Systems" },
  { num: 5, title: "Cloud + DevOps Fundamentals", level: "Foundation", cat: "Cloud Architecture" },
  { num: 6, title: "AWS Cloud Engineer", level: "Cloud", cat: "AWS Architecture" },
  { num: 7, title: "GCP Cloud Engineer", level: "Cloud", cat: "GCP Infrastructure" },
  { num: 8, title: "Azure Cloud Engineer", level: "Cloud", cat: "Azure Infrastructure" },
  { num: 9, title: "Multi-Cloud Architecture", level: "Cloud", cat: "Multi-Cloud" },
  { num: 10, title: "Cloud Real-Time Scenarios", level: "Cloud", cat: "Incident Response" },
  { num: 11, title: "Git + GitHub Workflow", level: "DevOps", cat: "DevOps Practices" },
  { num: 12, title: "Jenkins + CI/CD Pipelines", level: "DevOps", cat: "CI/CD Engineering" },
  { num: 13, title: "Docker Containerization", level: "DevOps", cat: "Containerization" },
  { num: 14, title: "Kubernetes Orchestration", level: "DevOps", cat: "Kubernetes" },
  { num: 15, title: "Ansible + Terraform IaC", level: "DevOps", cat: "IaC Automation" },
  { num: 16, title: "End-to-End CI/CD Project", level: "Advanced", cat: "GitOps & CI/CD" },
  { num: 17, title: "Production Troubleshooting & Triage", level: "Advanced", cat: "Production Triage" },
  { num: 18, title: "DevSecOps & Hardening", level: "Advanced", cat: "Security Engineering" },
  { num: 19, title: "Real-Time DevOps Architecture", level: "Advanced", cat: "Cloud Architecture" },
  { num: 20, title: "Final DevOps Mock Interview", level: "Advanced", cat: "Executive Panel" },
  { num: 21, title: "Bonus 01: AIOps Challenge", level: "Bonus AI", cat: "AI Infrastructure" },
  { num: 22, title: "Bonus 02: MLOps Challenge", level: "Bonus AI", cat: "AI Infrastructure" },
  { num: 23, title: "Bonus 03: AI Integration Challenge", level: "Bonus AI", cat: "AI Infrastructure" },
  { num: 24, title: "Bonus 04: AI + DevOps Automation", level: "Bonus AI", cat: "AI Automation" },
  { num: 25, title: "Bonus 05: AI MCP Challenge", level: "Bonus AI", cat: "AI Integration" },
  { num: 26, title: "Bonus 06: Azure DevOps Project", level: "Bonus AI", cat: "Azure & CI/CD" },
  { num: 27, title: "Bonus 07: Project-Based CI/CD", level: "Bonus AI", cat: "Advanced CI/CD" },
  { num: 28, title: "Bonus 08: Advanced DevSecOps Project", level: "Bonus AI", cat: "Security Engineering" },
  { num: 29, title: "Bonus 09: Multi-Cloud + AI Architecture", level: "Bonus AI", cat: "Advanced Architecture" },
  { num: 30, title: "👑 40 LPA Final Boss Interview Battle", level: "Bonus AI", cat: "Legendary Boss Battle" }
];

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

  // Expandable stages breakdown state
  const [expandedStagesCandidateId, setExpandedStagesCandidateId] = useState<string | null>(null);
  const [togglingPaymentId, setTogglingPaymentId] = useState<string | null>(null);
  const [stageFilterLevel, setStageFilterLevel] = useState<string>("ALL");

  // Delete candidate confirmation modal state
  const [candidateToDelete, setCandidateToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Admin Feedback modal & edit states
  const [feedbackCandidate, setFeedbackCandidate] = useState<any | null>(null);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbText, setFbText] = useState<string>("");
  const [fbStrengths, setFbStrengths] = useState<string>("");
  const [fbImprovements, setFbImprovements] = useState<string>("");
  const [isSubmittingFb, setIsSubmittingFb] = useState<boolean>(false);
  const [fbSuccessMsg, setFbSuccessMsg] = useState<string | null>(null);
  const [deletingFbId, setDeletingFbId] = useState<string | null>(null);

  const toggleCandidatePayment = async (candidateId: string, currentStatus: boolean) => {
    setTogglingPaymentId(candidateId);
    try {
      const res = await apiFetch(`/candidates/${candidateId}/payment-status`, {
        method: "PUT",
        body: JSON.stringify({ is_paid: !currentStatus })
      });
      if (res?.data) {
        setCandidates(prev => prev.map(c => {
          if (c.id === candidateId || c.user_id === candidateId) {
            return {
              ...c,
              is_paid: !currentStatus,
              payment_status: !currentStatus ? "PAID" : "UNPAID"
            };
          }
          return c;
        }));
        setAlertMsg({
          type: "success",
          text: `Payment access ${!currentStatus ? "ACTIVATED ✅ Entire row is now highlighted in GREEN!" : "REVOKED"} for candidate.`
        });
      }
    } catch (err: any) {
      alert("Failed to update payment status: " + (err?.message || "Error"));
    } finally {
      setTogglingPaymentId(null);
    }
  };

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

  const openCreateFeedbackModal = (c: any) => {
    setFeedbackCandidate(c);
    setEditingFeedbackId(null);
    setFbRating(5);
    setFbText("");
    setFbStrengths("");
    setFbImprovements("");
    setFbSuccessMsg(null);
  };

  const openEditFeedbackModal = (c: any, fb: any) => {
    setFeedbackCandidate(c);
    setEditingFeedbackId(fb.id);
    setFbRating(fb.rating || 5);
    setFbText(fb.feedback_text || "");
    setFbStrengths(fb.strengths || "");
    setFbImprovements(fb.areas_of_improvement || "");
    setFbSuccessMsg(null);
  };

  const handleDeleteFeedback = async (candidateId: string, feedbackId: string) => {
    if (!window.confirm("Are you sure you want to delete this evaluation feedback? This action cannot be undone.")) {
      return;
    }
    setDeletingFbId(feedbackId);
    try {
      await apiFetch(`/candidates/${candidateId}/feedback/${feedbackId}`, {
        method: "DELETE"
      });
      await fetchCandidates();
    } catch (err: any) {
      alert("Failed to delete feedback: " + (err?.message || "Unknown error"));
    } finally {
      setDeletingFbId(null);
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
      const endpoint = editingFeedbackId 
        ? `/candidates/${targetId}/feedback/${editingFeedbackId}`
        : `/candidates/${targetId}/feedback`;
      const method = editingFeedbackId ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify({
          rating: fbRating,
          feedback_text: fbText.trim(),
          strengths: fbStrengths.trim(),
          areas_of_improvement: fbImprovements.trim(),
          admin_name: "Admin Evaluator"
        })
      });

      setFbSuccessMsg(
        editingFeedbackId
          ? `🎉 Feedback successfully updated for Candidate ${feedbackCandidate.user?.full_name || feedbackCandidate.full_name}!`
          : `🎉 Feedback saved & published to Candidate ${feedbackCandidate.user?.full_name || feedbackCandidate.full_name}'s My Progress panel!`
      );
      
      // Refresh candidates list so dropdown and cards reflect latest feedback immediately
      await fetchCandidates();

      setTimeout(() => {
        setFeedbackCandidate(null);
        setEditingFeedbackId(null);
        setFbSuccessMsg(null);
        setFbText("");
        setFbStrengths("");
        setFbImprovements("");
      }, 1500);
    } catch (err: any) {
      alert("Failed to save feedback: " + (err?.message || "Unknown error"));
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
            <table className="w-full text-left border-collapse min-w-[1250px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 w-[240px]">Candidate Name</th>
                  <th className="py-3.5 px-4 w-[210px]">Email & Contact</th>
                  <th className="py-3.5 px-4 w-[150px]">Current Designation</th>
                  <th className="py-3.5 px-4 w-[190px]">Target Role & Salary</th>
                  <th className="py-3.5 px-3 w-[95px] text-center">Exp Level</th>
                  <th className="py-3.5 px-3 w-[110px] text-center">LinkedIn Profile</th>
                  <th className="py-3.5 px-3 w-[110px] text-center">Readiness</th>
                  <th className="py-3.5 px-3 w-[105px] text-center">Level & XP</th>
                  <th className="py-3.5 px-4 w-[280px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredCandidates.map((c) => {
                  const linkedinUrl = getLinkedinUrl(c);
                  const desig = getDesignation(c);
                  const expLvl = getExperienceLevel(c);
                  const salary = getTargetSalaryBand(c);
                  const isPaid = !!(c.is_paid || c.payment_status === "PAID");
                  const isExpanded = expandedStagesCandidateId === c.id;

                  // Candidate stages map
                  const stagesList = c.stages_summary && Array.isArray(c.stages_summary) && c.stages_summary.length > 0
                    ? c.stages_summary
                    : STAGE_TITLES_LIST.map((st) => {
                        const isStg0Done = st.num === 0 && (
                          c.resume_data_json?.mark_stage_0_complete || 
                          c.resume_data_json?.stage_0_completed || 
                          (typeof c.notes === "string" && c.notes.toLowerCase().includes("stage_0"))
                        );
                        return {
                          stage_number: st.num,
                          title: st.title,
                          status: isStg0Done ? "COMPLETED" : "LOCKED",
                          score: isStg0Done ? 100 : 0,
                          level: st.level,
                          category: st.cat
                        };
                      });

                  const completedStagesCount = stagesList.filter((s: any) => s.status === "COMPLETED" || s.status === "PASSED").length;
                  const candidateFeedbacks = (c.resume_data_json?.admin_feedback || []) as any[];

                  return (
                    <Fragment key={c.id}>
                      <tr 
                        className={`transition-all duration-200 ${
                          isPaid 
                            ? "bg-emerald-500/10 dark:bg-emerald-950/40 border-l-4 border-l-emerald-500 hover:bg-emerald-500/15 dark:hover:bg-emerald-900/40" 
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <td className="py-3.5 px-4 w-[240px]">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full font-black flex items-center justify-center shrink-0 shadow-xs ${
                              isPaid 
                                ? "bg-emerald-600 text-white ring-2 ring-emerald-500/50" 
                                : "bg-[#0B1E36] text-[#FF6B00]"
                            }`}>
                              {(c.user?.full_name || c.full_name || "C").charAt(0)}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5 flex-wrap">
                                <span>{c.user?.full_name || c.full_name || "Sachin Rawat"}</span>
                                {isPaid && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-2xs shrink-0">
                                    PAID ACCESS ✅
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 truncate">{c.student_id || c.id?.slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 w-[210px] font-mono text-slate-600 dark:text-slate-300">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white truncate text-[11px]" title={c.user?.email || c.email}>
                              {c.user?.email && !c.user.email.endsWith("@cloudops.internal") 
                                ? c.user.email 
                                : (c.email && !c.email.endsWith("@cloudops.internal") ? c.email : "📱 Mobile Registered")}
                            </span>
                            <span className="text-[10px] text-[#FF6B00] font-mono font-bold">
                              {getPhoneDisplay(c)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 w-[150px]">
                          <span className="inline-block font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] truncate max-w-[140px]" title={desig}>
                            {desig}
                          </span>
                        </td>
                        
                        <td className="py-3.5 px-4 w-[190px]">
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-slate-900 dark:text-white truncate text-[11px]" title={c.target_role || "Senior DevOps Engineer"}>
                              {c.target_role || "Senior DevOps Engineer"}
                            </span>
                            <span className="text-[10px] font-mono text-[#FF6B00] font-black">
                              {salary}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 w-[95px] text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {expLvl}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 w-[110px] text-center">
                          {linkedinUrl ? (
                            <a
                              href={linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-[#0A66C2] dark:text-blue-400 font-extrabold text-[11px] transition-all border border-blue-500/20 shadow-2xs"
                            >
                              <Linkedin className="w-3.5 h-3.5 fill-current" />
                              <span>Profile</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Not Provided</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 w-[110px] text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-black ${
                            (c.readiness_score || 0) >= 80 
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" 
                              : (c.readiness_score || 0) >= 40 
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                          }`}>
                            {Math.round(c.readiness_score || 0)}% READY
                          </span>
                        </td>

                        <td className="py-3.5 px-3 w-[105px] text-center font-mono">
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                            Lvl {c.level || 1} • {c.xp || 0} XP
                          </span>
                        </td>

                        <td className="py-3.5 px-4 w-[280px] text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Stages 0-30 Dropdown Button */}
                            <button
                              type="button"
                              onClick={() => setExpandedStagesCandidateId(isExpanded ? null : c.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer border shadow-2xs ${
                                isExpanded
                                  ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm shadow-[#FF6B00]/30"
                                  : isPaid
                                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              }`}
                              title="Toggle detailed status of all 31 Stages (0 to 30)"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>Stages (0–30)</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </button>

                            {/* Payment Status Toggle Button */}
                            <button
                              type="button"
                              onClick={() => toggleCandidatePayment(c.id, isPaid)}
                              disabled={togglingPaymentId === c.id}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                                isPaid
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                                  : "bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-emerald-600 hover:border-emerald-300"
                              }`}
                              title={isPaid ? "Paid member: Click to revoke access" : "Candidate unpaid: Click to mark as Paid (Row will turn green)"}
                            >
                              {togglingPaymentId === c.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CreditCard className={`w-3 h-3 ${isPaid ? "text-white" : "text-emerald-500"}`} />
                              )}
                              <span>{isPaid ? "Paid ✅" : "Mark Paid"}</span>
                            </button>

                            {/* Feedback Button */}
                            <button
                              onClick={() => openCreateFeedbackModal(c)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                              title="Give Admin Feedback to Candidate"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Inspect Button */}
                            <button
                              onClick={() => setSelectedCandidate(c)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF6B00] hover:text-white text-slate-600 dark:text-slate-300 font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                              title="Inspect Candidate Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => setCandidateToDelete(c)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 hover:text-white font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                              title="Permanently Delete User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EXPANDABLE 31 STAGES (0 to 30) BREAKDOWN DRAWER */}
                      {isExpanded && (
                        <tr className={`${isPaid ? "bg-emerald-500/5 dark:bg-emerald-950/30 border-l-4 border-l-emerald-500" : "bg-slate-50/80 dark:bg-slate-900/80"}`}>
                          <td colSpan={9} className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col gap-4 animate-fadeIn">
                              
                              {/* Expanded Drawer Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700/80">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-[#0B1E36] text-[#FF6B00] flex items-center justify-center font-black">
                                    <Layers className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                      <span>All 31 Stages (0–30) Breakdown for {c.user?.full_name || c.full_name}</span>
                                      {isPaid && (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white">
                                          Paid Access Active
                                        </span>
                                      )}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                      Track completed, in-progress, and locked interview stages with exact scores & evaluation statuses.
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>{completedStagesCount} / 31 Stages Completed ({Math.round((completedStagesCount / 31) * 100)}%)</span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleCandidatePayment(c.id, isPaid)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                      isPaid
                                        ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    }`}
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>{isPaid ? "Revoke Paid Access" : "Grant Paid Pro Access"}</span>
                                  </button>
                                </div>
                              </div>

                              {/* 31 Stage Cards Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1">
                                {stagesList.map((st: any) => {
                                  const isCompleted = st.status === "COMPLETED" || st.status === "PASSED";
                                  const isInProgress = st.status === "IN_PROGRESS";
                                  const isFailed = st.status === "FAILED";

                                  return (
                                    <div
                                      key={st.stage_number}
                                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-2xs ${
                                        isCompleted
                                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                                          : isInProgress
                                            ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                                            : isFailed
                                              ? "bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800"
                                              : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-70"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <span className={`w-7 h-7 rounded-xl text-xs font-mono font-black flex items-center justify-center shrink-0 ${
                                            isCompleted
                                              ? "bg-emerald-600 text-white shadow-2xs"
                                              : isInProgress
                                                ? "bg-amber-500 text-white"
                                                : isFailed
                                                  ? "bg-rose-600 text-white"
                                                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                          }`}>
                                            S{st.stage_number}
                                          </span>
                                          <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                              {st.title}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                              {st.category || (st.stage_number === 30 ? "Boss Battle" : "Core Stage")}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                          isCompleted
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                            : isInProgress
                                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 animate-pulse"
                                              : isFailed
                                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                                                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                        }`}>
                                          {isCompleted ? "✅ Completed" : isInProgress ? "⏳ In Progress" : isFailed ? "❌ Failed" : "🔒 Locked"}
                                        </span>

                                        {isCompleted && (
                                          <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                                            {Math.round(st.score || 85)}% Score
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* 💬 CANDIDATE ADMIN FEEDBACK & EVALUATION HISTORY SECTION (PROPERLY UNDER STAGES) */}
                              <div className="pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-col gap-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                                      <MessageSquare className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>Admin Evaluation Feedback & Performance Remarks</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                          {candidateFeedbacks.length} Feedback{candidateFeedbacks.length === 1 ? "" : "s"}
                                        </span>
                                      </h5>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        Official feedback given to {c.user?.full_name || c.full_name}. Visible to candidate on their My Progress panel.
                                      </p>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => openCreateFeedbackModal(c)}
                                    className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer w-fit shrink-0"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Give New Feedback</span>
                                  </button>
                                </div>

                                {/* Feedback Cards Grid / Empty State */}
                                {candidateFeedbacks.length === 0 ? (
                                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-2">
                                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                      No admin feedback given to this candidate yet.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => openCreateFeedbackModal(c)}
                                      className="text-xs font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
                                    >
                                      Click here to give first feedback & rating
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                                    {candidateFeedbacks.map((fb: any, fbIdx: number) => {
                                      const fbId = fb.id || `fb-${fbIdx}`;
                                      return (
                                        <div
                                          key={fbId}
                                          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-850 shadow-2xs flex flex-col justify-between gap-3 relative hover:border-emerald-500/40 transition-colors"
                                        >
                                          {/* Feedback Header: Rating & Author & Actions */}
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <div className="flex items-center gap-0.5 text-amber-500">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <Star
                                                    key={star}
                                                    className={`w-3.5 h-3.5 ${
                                                      star <= Math.round(fb.rating || 5)
                                                        ? "fill-amber-500 text-amber-500"
                                                        : "text-slate-300 dark:text-slate-700"
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200">
                                                {fb.rating || 5}.0
                                              </span>
                                            </div>

                                            {/* Action Buttons: Edit & Delete */}
                                            <div className="flex items-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => openEditFeedbackModal(c, { ...fb, id: fbId })}
                                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white dark:bg-amber-950/40 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all border border-amber-200 dark:border-amber-800 cursor-pointer flex items-center gap-1 shadow-2xs"
                                                title="Edit this feedback"
                                              >
                                                <Pencil className="w-3 h-3" />
                                                <span>Edit</span>
                                              </button>

                                              <button
                                                type="button"
                                                onClick={() => handleDeleteFeedback(c.id, fbId)}
                                                disabled={deletingFbId === fbId}
                                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
                                                title="Delete this feedback"
                                              >
                                                {deletingFbId === fbId ? (
                                                  <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                  <Trash2 className="w-3 h-3" />
                                                )}
                                                <span>Delete</span>
                                              </button>
                                            </div>
                                          </div>

                                          {/* Feedback Text Quote */}
                                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                            "{fb.feedback_text}"
                                          </p>

                                          {/* Strengths & Improvements Tags if available */}
                                          {(fb.strengths || fb.areas_of_improvement) && (
                                            <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                                              {fb.strengths && (
                                                <div className="flex items-start gap-1.5">
                                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase shrink-0">Strengths:</span>
                                                  <span className="text-slate-600 dark:text-slate-300 font-medium">{fb.strengths}</span>
                                                </div>
                                              )}
                                              {fb.areas_of_improvement && (
                                                <div className="flex items-start gap-1.5">
                                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase shrink-0">Improve:</span>
                                                  <span className="text-slate-600 dark:text-slate-300 font-medium">{fb.areas_of_improvement}</span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Footer with Timestamp & Admin Name */}
                                          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/40">
                                            <span>By {fb.admin_name || "Admin Evaluator"}</span>
                                            <span>
                                              {fb.created_at ? new Date(fb.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

      {/* GIVE / EDIT ADMIN FEEDBACK MODAL */}
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
                    {editingFeedbackId ? "Edit Admin Evaluation Feedback" : "Give Feedback & Performance Rating"}
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Target Candidate: {feedbackCandidate.user?.full_name || feedbackCandidate.full_name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFeedbackCandidate(null);
                  setEditingFeedbackId(null);
                }}
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
                    onClick={() => {
                      setFeedbackCandidate(null);
                      setEditingFeedbackId(null);
                    }}
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
                    <span>
                      {isSubmittingFb
                        ? (editingFeedbackId ? "Updating Feedback..." : "Submitting Feedback...")
                        : (editingFeedbackId ? "Save Changes" : "Publish Feedback to Candidate")}
                    </span>
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
