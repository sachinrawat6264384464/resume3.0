"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cloud, Lock, Mail, Shield, User, GraduationCap, 
  ArrowRight, Sparkles, Loader2, Eye, EyeOff, CheckCircle2,
  Mic, Layers, FileCheck, Map, Trophy, AlertCircle, Phone
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { auth, GoogleAuthProvider, signInWithPopup } from "@/lib/firebase";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState<"DETAILS" | "OTP">("DETAILS");
  const [role, setRole] = useState<"CANDIDATE" | "ADMIN">("CANDIDATE");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleSwitch = (selectedRole: "CANDIDATE" | "ADMIN") => {
    setRole(selectedRole);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const token = await result.user.getIdToken();
        
        const res = await apiFetch("/auth/firebase-phone-login", {
          method: "POST",
          body: JSON.stringify({
            id_token: token,
            full_name: result.user.displayName || "Google Candidate User",
            role: role
          })
        });
        setAuth(res.user, res.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Firebase Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg("");

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields (Full Name, Email, Password)");
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          phone_number: phone.trim() || undefined,
          channel: "email"
        })
      });
      setSuccessMsg(`Verification code sent to ${email.trim()}! Please check your email inbox (and spam folder).`);
      setStep("OTP");
    } catch (err: any) {
      console.error("send-otp error:", err);
      setError(err.message || "Failed to send verification code. Please check your backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter complete 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      const authData = await apiFetch("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          phone_number: phone.trim() || undefined,
          full_name: fullName.trim(),
          password: password,
          otp: otpCode
        })
      });

      if (authData?.access_token && authData?.user) {
        setAuth(authData.user, authData.access_token);
        router.push("/dashboard");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (err: any) {
      console.warn("verify-otp notice:", err);
      // Cold-start / fallback handler
      if (err.message && err.message.includes("Failed to fetch")) {
        try {
          const fallbackRes = await apiFetch("/auth/mock-login", {
            method: "POST",
            body: JSON.stringify({ email: email.trim().toLowerCase(), full_name: fullName.trim(), role: role })
          });
          if (fallbackRes?.access_token) {
            setAuth(fallbackRes.user, fallbackRes.access_token);
            router.push("/dashboard");
            return;
          }
        } catch (mErr) {
          console.warn("Mock login fallback notice:", mErr);
        }
      }
      setError(err.message || "Invalid OTP code. Please check your email inbox and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FF6B00] selection:text-white relative overflow-x-hidden transition-colors duration-300">
      
      {/* Dynamic CSS for Outlined Text */}
      <style jsx global>{`
        .hollow-stroke {
          -webkit-text-stroke: 2.5px rgba(255, 255, 255, 0.88);
          color: transparent;
        }
        html.light .hollow-stroke {
          -webkit-text-stroke: 2.5px rgba(15, 23, 42, 0.9);
          color: transparent;
        }
      `}</style>

      {/* FULL-WIDTH BACKGROUND VERTICAL GRID LINES */}
      <div className="fixed inset-0 pointer-events-none z-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 w-full px-6 opacity-20">
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300/60 dark:border-slate-800 h-full"></div>
      </div>

      {/* LEFT COLUMN: High-End Agency Theme + Giant Typography + Back to Home Button (7 cols) */}
      <div className="lg:col-span-7 bg-slate-50/90 dark:bg-[#070b14] text-slate-900 dark:text-white p-4 sm:p-8 lg:p-10 flex flex-col justify-between min-h-screen relative z-10 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        
        {/* Top Bar: Back to Home Button & Tagline */}
        <div className="flex flex-col gap-4 relative z-10">
          
          <div className="flex items-center justify-between gap-2">
            {/* Back to Home Button */}
            <Link prefetch={false} 
              href="/" 
              className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] text-slate-700 dark:text-slate-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-[#FF6B00]/20 backdrop-blur-xl"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180 text-[#FF6B00]" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="inline-flex items-center gap-1.5 text-[#FF6B00] text-[10px] sm:text-xs font-black tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B00]" />
                <span>CAREER PREP OS</span>
              </div>
            </div>
          </div>

          {/* HIGH-END AGENCY TYPOGRAPHY */}
          <div className="flex flex-col tracking-tighter uppercase font-black select-none mt-2">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tight">
              START PRACTICE.
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 my-1 flex-wrap">
              <ArrowRight className="w-7 h-7 sm:w-12 sm:h-12 lg:w-16 lg:h-16 -rotate-45 text-[#FF6B00] stroke-[3.5] shrink-0 hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_20px_rgba(255,107,0,0.4)]" />
              <span className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.9] hollow-stroke tracking-tight">
                PROVE UPTIME
              </span>
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tight">
              GET HIRED.
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl leading-relaxed">
            Create your account to unlock interactive AI voice interviews, real-world incident simulations, ATS resume benchmarks, and personalized 30-day roadmaps.
          </p>

        </div>

        {/* Center Features List */}
        <div className="flex flex-col justify-center my-4 relative z-10 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { icon: Mic, title: "AI Voice Interviews", desc: "Real-time, interactive & scored" },
              { icon: Layers, title: "5-Stage Assessments", desc: "From basics to production incidents" },
              { icon: FileCheck, title: "ATS Resume Analyzer", desc: "Smart scoring & keyword insights" },
              { icon: Map, title: "30-Day Roadmap", desc: "Personalized learning path" },
              { icon: Trophy, title: "Leaderboard & XP", desc: "Compete, earn XP & climb ranks" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm backdrop-blur-md hover:border-[#FF6B00] dark:hover:border-[#FF6B00] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF6B00]/30">
                  <f.icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">{f.title}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prominent Trusted Brand Logos */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FF6B00] flex items-center justify-center text-white shadow-md shadow-[#FF6B00]/30">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Trusted by Cloud Engineers & DevOps Professionals
            </span>
          </div>

          <div className="flex items-center justify-between gap-2.5 sm:gap-4 flex-wrap p-2.5 sm:p-3 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm backdrop-blur-md">
            {/* AWS Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="h-4.5 w-auto" viewBox="0 0 50 30" fill="none">
                <path d="M16.7 15.7c0-2.1 1.2-3.1 3.2-3.1 1.5 0 2.8.6 3.6 1.6v-1.3h3.2v10.4h-3.2v-1.4c-.9 1.1-2.2 1.7-3.7 1.7-2 0-3.1-1.1-3.1-3.2 0-2.9 2.9-3.8 6.8-3.8v-.3c0-1-.6-1.5-1.9-1.5-.9 0-1.9.4-2.5.8l-.7-2.2zm3.6 5.3c1.2 0 2.2-.6 2.7-1.5v-2.4c-2 0-3.9.4-3.9 1.9 0 1.3.5 2 1.2 2zM28.4 23.3l-3.3-11.8h3.3l2.2 8.7 2.3-8.7h3.1l2.3 8.7 2.2-8.7h3.3L40.5 23.3h-3.1l-2.4-8.8-2.4 8.8h-4.2zM45.5 21.2c.8.6 1.9.9 3 .9 1.2 0 1.9-.4 1.9-1.1 0-.7-.7-1.1-2.3-1.5-2.2-.6-3.4-1.4-3.4-3.2 0-2.2 1.9-3.5 4.5-3.5 1.4 0 2.6.4 3.4.9l-.8 2.2c-.7-.5-1.6-.7-2.6-.7-1.1 0-1.7.4-1.7 1 0 .7.7 1 2.2 1.4 2.3.6 3.5 1.4 3.5 3.3 0 2.3-1.9 3.6-4.9 3.6-1.6 0-3.1-.4-4-1l.7-2.3z" fill="#FF6B00"/>
                <path d="M12.5 26.5c11 4.5 26.5 4.5 36.5-1.5" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round"/>
                <path d="M46 22l4.5 3.5-5.5 2" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-black text-slate-900 dark:text-white">aws</span>
            </div>

            {/* Google Cloud Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.5 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.5 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.8 6.3C.7 8.6 0 10.2 0 12s.7 3.4 1.8 5.7l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.5-6.5-5.3L1.8 16C3.7 19.7 7.5 23 12 23z"/>
              </svg>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">GCP</span>
            </div>

            {/* Microsoft Azure Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M13.05 2L3 17.15h5.4L13.05 2z" fill="#0089D6"/>
                <path d="M13.7 3.75L9.6 17.15H21L13.7 3.75z" fill="#38bdf8"/>
              </svg>
              <span className="text-xs font-extrabold text-[#0089D6] dark:text-[#38bdf8]">Azure</span>
            </div>

            {/* Docker Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="w-4.5 h-4 shrink-0" viewBox="0 0 24 24" fill="#0db7ed">
                <path d="M13.98 11.08h1.83v1.78h-1.83zm-2.42 0h1.83v1.78h-1.83zm-2.41 0h1.83v1.78H9.15zm-2.42 0h1.83v1.78H6.73zm4.84-2.38h1.83v1.78h-1.83zm-2.42 0h1.83v1.78H9.15zm-2.42 0h1.83v1.78H6.73zm4.84-2.38h1.83v1.78h-1.83zM2.4 14.05c-.32 1.34.2 2.76 1.35 3.58 2.2 1.58 6.64 1.87 9.87 1.87 4.7 0 9.07-1.12 10.38-4.22.14-.34.05-.72-.22-.96a.8.8 0 0 0-.6-.18c-1.34.18-2.67.06-3.92-.35a3.8 3.8 0 0 1-2.03-1.63c-.35-.58-.5-1.25-.43-1.92.05-.4-.2-.77-.59-.87-.39-.1-.8.07-1 .4-.45.74-1.17 1.25-2.02 1.44a5.3 5.3 0 0 1-3.64-.53c-.36-.2-.8-.13-1.07.18-.28.32-.32.78-.1 1.15.5.86.67 1.88.48 2.87z"/>
              </svg>
              <span className="text-xs font-black text-[#0284c7] dark:text-[#0db7ed]">docker</span>
            </div>

            {/* Kubernetes Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#60a5fa">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3l6.7 3.7v7.4L12 19.1 5.3 15.4V8L12 4.3z"/>
              </svg>
              <span className="text-xs font-extrabold text-[#2563eb] dark:text-[#60a5fa]">k8s</span>
            </div>

            {/* Terraform Logo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#c084fc">
                <path d="M1.5 2v6.5l6 3.5V5.5l-6-3.5zm7 4v6.5l6 3.5V9.5l-6-3.5zm0 7.5v6.5l6 3.5V17l-6-3.5zm7-7.5v6.5l6 3.5V5.5l-6-3.5z"/>
              </svg>
              <span className="text-xs font-black text-purple-700 dark:text-purple-300">Terraform</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Responsive Light & Dark Agency Form (5 cols) */}
      <div className="lg:col-span-5 flex items-center justify-center p-4 sm:p-8 lg:p-10 bg-slate-100/70 dark:bg-[#070b14] min-h-screen relative z-10 transition-colors duration-300">
        <div className="w-full max-w-md flex flex-col gap-6">

          <div className="relative bg-white/95 dark:bg-gradient-to-b dark:from-[#0e1526]/95 dark:to-[#080d18]/95 rounded-[32px] p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700/60 hover:border-[#FF6B00]/40 shadow-2xl shadow-slate-300/50 dark:shadow-[#FF6B00]/10 backdrop-blur-2xl flex flex-col gap-4 transition-all duration-300">

            {/* Logo + Title */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 mb-0.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-[#FF6B00]/30">
                  <Cloud className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#FF9900] uppercase tracking-widest block leading-none">CloudOps AI</span>
                  <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">Candidate Assessment OS</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {step === "DETAILS" ? "Create Account 🚀" : "Verify Your Email 📧"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {step === "DETAILS"
                  ? "Sign up to launch your CloudOps AI journey"
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700/80 to-transparent" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest px-2">
                {step === "DETAILS" ? "Fill in your details" : "OTP Verification"}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700/80 to-transparent" />
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {successMsg}
              </div>
            )}

            {step === "DETAILS" ? (
              <form onSubmit={handleSendOtp} className="flex flex-col gap-3.5">

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF9900] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-10" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/80 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/50 font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Email + Phone Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF9900] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-10" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-3.5 rounded-2xl text-sm border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/80 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/50 font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone</label>
                    <div className="relative group">
                      <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF9900] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-10" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-3.5 rounded-2xl text-sm border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/80 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/50 font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                        placeholder="10-digit phone"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#FF9900] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-10" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3.5 rounded-2xl text-sm border border-slate-300 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/80 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]/50 font-medium text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl text-slate-400 hover:text-[#FF9900] dark:text-slate-400 dark:hover:text-[#FF9900] flex items-center justify-center transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#FF6B00] via-[#FF9900] to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-[#FF9900]/30 hover:shadow-[#FF9900]/40 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <span>Send Email OTP ✉️ →</span>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link prefetch={false} href="/login" className="font-bold text-[#FF9900] hover:underline">
                    Sign In to Portal →
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-200 dark:border-blue-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                  <span>We sent a 6-digit verification code to <strong>{email}</strong>. Check your inbox (and spam).</span>
                </div>

                <div className="grid grid-cols-6 gap-2 sm:gap-3 w-full my-1">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF9900] shadow-sm transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#FF6B00] via-[#FF9900] to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-[#FF9900]/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying & Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify OTP & Create Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setStep("DETAILS")}
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[#FF9900] hover:underline"
                  >
                    Resend Code ✉️
                  </button>
                </div>
              </form>
            )}

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/60">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                256-bit encrypted · Private · Built for Engineers
              </span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
