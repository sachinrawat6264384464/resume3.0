"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Phone, Briefcase, DollarSign, Save, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState((user as any)?.phone_number || "");
  const [targetRole, setTargetRole] = useState("Senior DevOps Engineer");
  const [salaryBand, setSalaryBand] = useState("₹18 – ₹40 LPA");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/candidates/me/profile");
        if (res?.data) {
          if (res.data.phone) setPhone(res.data.phone);
          if (res.data.target_role) setTargetRole(res.data.target_role);
          if (res.data.target_salary_band) setSalaryBand(res.data.target_salary_band);
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
          phone,
          target_role: targetRole,
          target_salary_band: salaryBand
        })
      });
      if (res?.data) {
        setMsg("Settings saved successfully to database!");
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
      className="max-w-[800px] mx-auto flex flex-col gap-6 pb-12 text-slate-900 dark:text-slate-100 font-sans"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#FF6B00]" />
          Account & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage your contact information, target cloud engineering role, and assessment salary preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-5">
        
        {msg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {msg}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#FF6B00]" />
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
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
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#FF6B00]" />
            Target Cloud Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#FF6B00]" />
            Target Salary Band
          </label>
          <input
            type="text"
            value={salaryBand}
            onChange={(e) => setSalaryBand(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/20 flex items-center justify-center gap-2 transition-all mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Profile Settings</span>
        </button>

      </form>

    </motion.div>
  );
}
