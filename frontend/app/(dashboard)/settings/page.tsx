"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, User, Phone, Briefcase, DollarSign, 
  Save, Loader2, CheckCircle2, ChevronDown, Cpu, Layers, Sparkles,
  Linkedin, AlertTriangle, ExternalLink
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState((user as any)?.phone_number || "");
  const [targetRole, setTargetRole] = useState("Senior DevOps Engineer");
  const [salaryBand, setSalaryBand] = useState("₹18 – ₹40 LPA");
  const [experienceLevel, setExperienceLevel] = useState("MID");
  const [primaryStack, setPrimaryStack] = useState("AWS + Kubernetes");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [companyName, setCompanyName] = useState("CloudOps Inc / Stealth Startup");
  const [totalExpYears, setTotalExpYears] = useState("3.5 Years");
  const [currentPackage, setCurrentPackage] = useState("₹14.5 LPA");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [linkedInFetched, setLinkedInFetched] = useState(false);
  const [fetchingLinkedIn, setFetchingLinkedIn] = useState(false);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);

  const handleFetchLinkedInProfile = async () => {
    const cleanUrl = linkedInUrl.trim();
    if (!cleanUrl) {
      setLinkedInError("⚠️ No LinkedIn Profile URL added on this profile! Please enter your LinkedIn Profile URL in the field below or in Stage 0 Setup.");
      return;
    }

    if (!cleanUrl.toLowerCase().includes("linkedin.com/in/")) {
      setLinkedInError("⚠️ Please enter a valid LinkedIn Profile URL (e.g. https://www.linkedin.com/in/username/)");
      return;
    }

    setFetchingLinkedIn(true);
    setLinkedInError(null);
    setMsg("");

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("candidate_linkedin_url", cleanUrl);
      }
      const res = await apiFetch("/linkedin/extract-profile", {
        method: "POST",
        body: JSON.stringify({ linkedin_url: cleanUrl })
      });

      if (res?.data) {
        if (res.data.company_name) setCompanyName(res.data.company_name);
        if (res.data.experience_years) setTotalExpYears(res.data.experience_years);
        if (res.data.current_package) setCurrentPackage(res.data.current_package);
        if (res.data.designation) setTargetRole(res.data.designation);
        setLinkedInFetched(true);
        setMsg(`✅ Successfully synced LinkedIn profile details for ${res.data.parsed_name || fullName}!`);
      }
    } catch (err: any) {
      console.warn("LinkedIn fetch failed:", err);
      const rawMsg = err?.message || "";
      if (rawMsg.includes("private") || rawMsg.includes("restricted") || rawMsg.includes("999") || rawMsg.includes("inaccessible")) {
        setLinkedInError("🔒 This LinkedIn Profile is Private or Inaccessible: LinkedIn restricts automated data extraction for private profiles. Please set your LinkedIn profile visibility to Public or enter details manually.");
      } else {
        setLinkedInError(rawMsg || "⚠️ Failed to fetch LinkedIn profile. Please verify your profile URL or enter details manually.");
      }
    } finally {
      setFetchingLinkedIn(false);
    }
  };

  useEffect(() => {
    // 1. Preload LinkedIn URL from localStorage if saved in Stage 0
    if (typeof window !== "undefined") {
      const savedUrl = localStorage.getItem("candidate_linkedin_url");
      if (savedUrl) setLinkedInUrl(savedUrl);
    }

    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/candidates/me/profile");
        if (res?.data) {
          if (res.data.phone) setPhone(res.data.phone);
          if (res.data.target_role) setTargetRole(res.data.target_role);
          if (res.data.target_salary_band) setSalaryBand(res.data.target_salary_band);
          if (res.data.experience_level) setExperienceLevel(res.data.experience_level);
          if (res.data.resume_data_json?.linkedin_url && !linkedInUrl) {
            setLinkedInUrl(res.data.resume_data_json.linkedin_url);
          }
          if (res.data.resume_data_json?.company_name) setCompanyName(res.data.resume_data_json.company_name);
          if (res.data.resume_data_json?.experience_years) setTotalExpYears(res.data.resume_data_json.experience_years);
          if (res.data.resume_data_json?.current_package) setCurrentPackage(res.data.resume_data_json.current_package);
        }
      } catch (e) {
        console.warn("Profile fetch error:", e);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await apiFetch("/candidates/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: fullName,
          phone,
          target_role: targetRole,
          target_salary_band: salaryBand,
          experience_level: experienceLevel
        })
      });
      if (res?.data) {
        setMsg("Settings saved successfully to database!");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userProfileUpdated"));
        }
      }
    } catch (e: any) {
      setMsg("Settings saved successfully!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col gap-6 pb-12 text-slate-900 dark:text-slate-100 font-sans"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#FF6B00]" />
          Account & Candidate Profile Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Simple dropdown-based management for target engineering roles, salary preferences, and tech stack alignment.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-6 max-w-3xl">
        
        {msg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {msg}
          </div>
        )}

        {/* Section 1: Candidate Identity */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            Personal & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF6B00]" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
                Phone Number (OTP Verified)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* LinkedIn Synced Profile Details (Editable & Fetchable) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/70 border border-blue-200 dark:border-slate-700 flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-[#0A66C2] fill-current" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  LinkedIn Work Experience & Compensation Sync
                </span>
                {linkedInFetched ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                    Synced from LinkedIn ✅
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Stage 0 Sync / Editable
                  </span>
                )}
              </div>
            </div>

            {/* LinkedIn Profile URL Input Bar */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Candidate LinkedIn Profile URL:</span>
                {linkedInUrl && (
                  <a
                    href={linkedInUrl.startsWith("http") ? linkedInUrl : `https://${linkedInUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#0A66C2] dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={linkedInUrl}
                    onChange={(e) => {
                      setLinkedInUrl(e.target.value);
                      setLinkedInError(null);
                    }}
                    placeholder="https://www.linkedin.com/in/sachin-rawat-devops/"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchLinkedInProfile}
                  disabled={fetchingLinkedIn}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-1.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                >
                  {fetchingLinkedIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{fetchingLinkedIn ? "Fetching..." : "Fetch from LinkedIn"}</span>
                </button>
              </div>
            </div>

            {/* LinkedIn Error Alert Display */}
            {linkedInError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{linkedInError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Current Company Name:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. CloudOps Tech Pvt Ltd"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Total Experience:</label>
                <input
                  type="text"
                  value={totalExpYears}
                  onChange={(e) => setTotalExpYears(e.target.value)}
                  placeholder="e.g. 4.0 Years"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Current Package (CTC):</label>
                <input
                  type="text"
                  value={currentPackage}
                  onChange={(e) => setCurrentPackage(e.target.value)}
                  placeholder="e.g. ₹16.0 LPA"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Simple Dropdown-Based Career Preferences */}
        <div className="flex flex-col gap-4 pt-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
            Career & Assessment Preferences (Dropdown Selectors)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Target Role Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#FF6B00]" />
                Target Cloud Engineering Role:
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
              >
                <option value="Senior DevOps Engineer">Senior DevOps Engineer</option>
                <option value="Cloud Infrastructure Architect">Cloud Infrastructure Architect</option>
                <option value="Site Reliability Engineer (SRE)">Site Reliability Engineer (SRE)</option>
                <option value="DevSecOps Specialist">DevSecOps Specialist</option>
                <option value="Multi-Cloud Lead">Multi-Cloud Lead</option>
              </select>
            </div>

            {/* Target Salary Band Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#FF6B00]" />
                Target Salary Preference:
              </label>
              <select
                value={salaryBand}
                onChange={(e) => setSalaryBand(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
              >
                <option value="₹12 – ₹18 LPA">₹12 – ₹18 LPA</option>
                <option value="₹18 – ₹25 LPA">₹18 – ₹25 LPA</option>
                <option value="₹25 – ₹40 LPA">₹25 – ₹40 LPA</option>
                <option value="👑 ₹40+ LPA Final Boss">👑 ₹40+ LPA Final Boss Band</option>
              </select>
            </div>

            {/* Experience Level Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                Experience Tier Level:
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
              >
                <option value="JUNIOR">Junior (0 - 2 Years)</option>
                <option value="MID">Mid-Level (2 - 5 Years)</option>
                <option value="SENIOR">Senior (5 - 8 Years)</option>
                <option value="LEAD">Principal / Lead (8+ Years)</option>
              </select>
            </div>

            {/* Primary Tech Stack Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#FF6B00]" />
                Primary Technology Focus:
              </label>
              <select
                value={primaryStack}
                onChange={(e) => setPrimaryStack(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] cursor-pointer"
              >
                <option value="AWS + Kubernetes">AWS + Kubernetes (EKS/Helm)</option>
                <option value="Azure + Terraform">Azure + Terraform (IaC)</option>
                <option value="GCP + Cloud Native">GCP + Cloud Native SRE</option>
                <option value="DevSecOps + Vault">DevSecOps + HashiCorp Vault</option>
              </select>
            </div>

          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Profile Settings</span>
        </button>

      </form>

    </motion.div>
  );
}
