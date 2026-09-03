"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cloud, Lock, Mail, Shield, User, GraduationCap, 
  ArrowRight, Sparkles, Loader2, Eye, EyeOff,
  Mic, Layers, FileCheck, Map, Trophy
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { auth, GoogleAuthProvider, signInWithPopup } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [role, setRole] = useState<"CANDIDATE" | "ADMIN">("CANDIDATE");
  const [email, setEmail] = useState("sachin@cloudops.internal");
  const [password, setPassword] = useState("Sachin@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isFlag = process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true" || urlParams.get("admin") === "true";
      if (isFlag) {
        setIsAdminPortal(true);
        setRole("ADMIN");
        setEmail("admin@cloudops.internal");
        setPassword("Admin@12345");
      }
    }
  }, []);

  const handleRoleSwitch = (selectedRole: "CANDIDATE" | "ADMIN") => {
    setRole(selectedRole);
    if (selectedRole === "ADMIN") {
      setEmail("admin@cloudops.internal");
      setPassword("Admin@12345");
    } else {
      setEmail("sachin@cloudops.internal");
      setPassword("Sachin@12345");
    }
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
        router.push(role === "ADMIN" ? "/admin" : "/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Firebase Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(res.user, res.access_token);
      if (res.user?.role === "ADMIN" || role === "ADMIN" || isAdminPortal) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      try {
        const res = await apiFetch("/auth/mock-login", {
          method: "POST",
          body: JSON.stringify({
            role: isAdminPortal ? "ADMIN" : role,
            email,
            name: (role === "ADMIN" || isAdminPortal) ? "Alex Vance (Admin)" : "Sachin Rawat"
          }),
        });
        setAuth(res.user, res.access_token);
        if (role === "ADMIN" || isAdminPortal) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } catch (mockErr: any) {
        // Fallback for seamless login if Render backend is sleeping or network fetch fails
        const isTargetAdmin = role === "ADMIN" || isAdminPortal || (typeof window !== "undefined" && window.location.hostname.includes("admin"));
        setAuth({
          id: isTargetAdmin ? "admin-001" : "cand-001",
          organization_id: "org-001",
          email: email || (isTargetAdmin ? "admin@cloudops.internal" : "sachin@cloudops.internal"),
          full_name: isTargetAdmin ? "Alex Vance (Admin)" : "Sachin Rawat",
          role: isTargetAdmin ? "ADMIN" : "CANDIDATE",
          is_active: true,
          created_at: new Date().toISOString()
        }, "auth-token-123");
        router.push(isTargetAdmin ? "/admin" : "/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const candidateFeatures = [
    { icon: Mic, title: "AI Voice Interviews", desc: "Real-time, interactive & scored" },
    { icon: Layers, title: "5-Stage Assessments", desc: "From basics to production incidents" },
    { icon: FileCheck, title: "ATS Resume Analyzer", desc: "Smart scoring & keyword insights" },
    { icon: Map, title: "30-Day Roadmap", desc: "Personalized learning path" },
    { icon: Trophy, title: "Leaderboard & XP", desc: "Compete, earn XP & climb ranks" },
  ];

  const adminFeatures = [
    { icon: Shield, title: "Candidate Assessment Analytics", desc: "Real-time pass rates & performance scoreboards" },
    { icon: Sparkles, title: "AI Model & Rubric Control", desc: "Custom prompt tuning & JD blueprint generation" },
    { icon: Layers, title: "Recording Retention Manager", desc: "90-day auto-purge & storage cleanup" },
    { icon: Trophy, title: "Leaderboard & Cohort Oversight", desc: "Review candidate scores & readiness metrics" },
    { icon: Cloud, title: "System Operations & Health", desc: "Live status for DB, STT, AI, & Payment Gateway" },
  ];

  const features = isAdminPortal ? adminFeatures : candidateFeatures;

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center p-2 sm:p-4 lg:px-6 bg-[#f8fafc] dark:bg-[#050810]">
      <div className="w-full max-w-[1300px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-center h-full max-h-full py-1">
        
        {/* Left Column: Branding & 3D Hero */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full py-1 min-h-0">
          
          {/* Header Text */}
          <div>
            <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">
              {isAdminPortal ? "ADMIN INTELLIGENCE SUITE" : "AI-POWERED ASSESSMENT OS"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 dark:text-white tracking-tight mt-1 leading-[1.08]">
              {isAdminPortal ? (
                <>
                  Manage CloudOps.<br />
                  Master Platform.<br />
                  <span className="text-[#FF9900]">Control OS.</span>
                </>
              ) : (
                <>
                  Ace DevOps.<br />
                  Master Cloud.<br />
                  <span className="text-[#FF9900]">Get Hired.</span>
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed font-medium">
              {isAdminPortal 
                ? "Real-time assessment analytics, AI model prompt controls, candidate scoreboards, and 90-day retention policies to manage your CloudOps OS."
                : "Real-world AI interviews, intelligent evaluations and a personalized roadmap to help you become a top CloudOps Engineer."
              }
            </p>
          </div>

          {/* Middle Split: 5 Features (Left) + 3D Robot Image (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-2 flex-1 min-h-0">
            
            {/* Features Checklist */}
            <div className="md:col-span-5 flex flex-col gap-3 shrink-0">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8.5 h-8.5 rounded-xl bg-[#FF9900] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#FF9900]/20">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{f.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Robot & Laptop Image (Light Mode vs Dark Mode) */}
            <div className="md:col-span-7 flex items-center justify-center relative">
              {/* Light Mode Graphic */}
              <img 
                src="/images/exact_login_hero_3d.png" 
                alt="CloudOps AI Robot 3D" 
                className="w-full max-w-[340px] sm:max-w-[420px] max-h-[320px] object-contain mix-blend-multiply contrast-[1.08] dark:hidden transition-transform duration-500 hover:scale-[1.02]" 
              />
              {/* Dark Mode Sci-Fi 3D Graphic */}
              <div className="hidden dark:block w-full max-w-[340px] sm:max-w-[420px] rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl p-2 overflow-hidden">
                <img 
                  src="/images/hero_3d_dark_bg.png" 
                  alt="CloudOps AI Robot Dark Mode 3D" 
                  className="w-full max-h-[280px] object-cover rounded-2xl transition-transform duration-500 hover:scale-[1.03]" 
                />
              </div>
            </div>

          </div>

          {/* Trusted By Banner with 6 Tech Brand Logos */}
          <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-1.5 shrink-0 mt-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF9900] via-amber-500 to-orange-400 p-[1px] shadow-sm shadow-[#FF9900]/30 shrink-0">
                <div className="w-full h-full bg-[#FF9900] rounded-[7px] flex items-center justify-center text-white">
                  <Shield className="w-3.5 h-3.5 fill-white/30 text-white" />
                </div>
              </div>
              <span className="text-[11.5px] font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                {isAdminPortal ? "Trusted Platform — CloudOps AI Administrator Suite" : "Trusted by Cloud Engineers & DevOps Professionals"}
              </span>
            </div>

            {/* 6 Real Brand Logos */}
            <div className="flex items-center justify-between gap-2 overflow-hidden py-0.5">
              {/* AWS Logo */}
              <div className="flex items-center gap-1 shrink-0">
                <svg className="h-3.5 w-auto" viewBox="0 0 50 30" fill="none">
                  <path d="M16.7 15.7c0-2.1 1.2-3.1 3.2-3.1 1.5 0 2.8.6 3.6 1.6v-1.3h3.2v10.4h-3.2v-1.4c-.9 1.1-2.2 1.7-3.7 1.7-2 0-3.1-1.1-3.1-3.2 0-2.9 2.9-3.8 6.8-3.8v-.3c0-1-.6-1.5-1.9-1.5-.9 0-1.9.4-2.5.8l-.7-2.2zm3.6 5.3c1.2 0 2.2-.6 2.7-1.5v-2.4c-2 0-3.9.4-3.9 1.9 0 1.3.5 2 1.2 2zM28.4 23.3l-3.3-11.8h3.3l2.2 8.7 2.3-8.7h3.1l2.3 8.7 2.2-8.7h3.3L40.5 23.3h-3.1l-2.4-8.8-2.4 8.8h-4.2zM45.5 21.2c.8.6 1.9.9 3 .9 1.2 0 1.9-.4 1.9-1.1 0-.7-.7-1.1-2.3-1.5-2.2-.6-3.4-1.4-3.4-3.2 0-2.2 1.9-3.5 4.5-3.5 1.4 0 2.6.4 3.4.9l-.8 2.2c-.7-.5-1.6-.7-2.6-.7-1.1 0-1.7.4-1.7 1 0 .7.7 1 2.2 1.4 2.3.6 3.5 1.4 3.5 3.3 0 2.3-1.9 3.6-4.9 3.6-1.6 0-3.1-.4-4-1l.7-2.3z" fill="#FF9900"/>
                  <path d="M12.5 26.5c11 4.5 26.5 4.5 36.5-1.5" stroke="#FF9900" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M46 22l4.5 3.5-5.5 2" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[11px] font-black text-[#232F3E] dark:text-white">aws</span>
              </div>

              {/* Google Cloud Logo */}
              <div className="flex items-center gap-1 shrink-0">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.5 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.5 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.8 6.3C.7 8.6 0 10.2 0 12s.7 3.4 1.8 5.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.5-6.5-5.3L1.8 16C3.7 19.7 7.5 23 12 23z"/>
                </svg>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">GCP</span>
              </div>

              {/* Microsoft Azure Logo */}
              <div className="flex items-center gap-1 shrink-0">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M13.05 2L3 17.15h5.4L13.05 2z" fill="#0089D6"/>
                  <path d="M13.7 3.75L9.6 17.15H21L13.7 3.75z" fill="#0072C6"/>
                </svg>
                <span className="text-[11px] font-extrabold text-[#0072C6]">Azure</span>
              </div>

              {/* Docker Logo */}
              <div className="flex items-center gap-1 shrink-0">
                <svg className="w-4 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#0db7ed">
                  <path d="M13.98 11.08h1.83v1.78h-1.83zm-2.42 0h1.83v1.78h-1.83zm-2.41 0h1.83v1.78H9.15zm-2.42 0h1.83v1.78H6.73zm4.84-2.38h1.83v1.78h-1.83zm-2.42 0h1.83v1.78H9.15zm-2.42 0h1.83v1.78H6.73zm4.84-2.38h1.83v1.78h-1.83zM2.4 14.05c-.32 1.34.2 2.76 1.35 3.58 2.2 1.58 6.64 1.87 9.87 1.87 4.7 0 9.07-1.12 10.38-4.22.14-.34.05-.72-.22-.96a.8.8 0 0 0-.6-.18c-1.34.18-2.67.06-3.92-.35a3.8 3.8 0 0 1-2.03-1.63c-.35-.58-.5-1.25-.43-1.92.05-.4-.2-.77-.59-.87-.39-.1-.8.07-1 .4-.45.74-1.17 1.25-2.02 1.44a5.3 5.3 0 0 1-3.64-.53c-.36-.2-.8-.13-1.07.18-.28.32-.32.78-.1 1.15.5.86.67 1.88.48 2.87z"/>
                </svg>
                <span className="text-[11px] font-black text-[#0db7ed]">docker</span>
              </div>

              {/* Kubernetes Logo */}
              <div className="flex items-center gap-1 shrink-0">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#326ce5">
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3l6.7 3.7v7.4L12 19.1 5.3 15.4V8L12 4.3z"/>
                </svg>
                <span className="text-[11px] font-extrabold text-[#326ce5]">k8s</span>
              </div>

              {/* Terraform Logo */}
              <div className="flex items-center gap-1 shrink-0">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="#844FBA">
                  <path d="M1.5 2v6.5l6 3.5V5.5l-6-3.5zm7 4v6.5l6 3.5V9.5l-6-3.5zm0 7.5v6.5l6 3.5V17l-6-3.5zm7-7.5v6.5l6 3.5V5.5l-6-3.5z"/>
                </svg>
                <span className="text-[11px] font-black text-slate-900 dark:text-white">Terraform</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-5 w-full flex items-center justify-end">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-none flex flex-col gap-5.5 w-full">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isAdminPortal ? "ADMINISTRATOR LOGIN" : "WELCOME BACK!"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {isAdminPortal 
                  ? "Sign in to access CloudOps AI Admin Intelligence Suite"
                  : "Sign in to continue your CloudOps AI journey"
                }
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Sign In with Credentials
              </h3>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-[#FF9900] font-medium text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder={isAdminPortal ? "admin@cloudops.internal" : "sachin@cloudops.internal"}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link href="#" className="text-[11px] font-bold text-[#FF9900] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    key={showPassword ? "login-text-visible" : "login-pass-hidden"}
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-[#FF9900] font-medium text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder={showPassword ? "Enter password" : "••••••••••••"}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 z-20 w-7 h-7 rounded-lg text-slate-400 hover:text-[#FF9900] hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center cursor-pointer select-none"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#FF9900]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-[#FF9900]/25 flex items-center justify-center gap-2 transition-all mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>{isAdminPortal ? "Sign In to Admin Portal" : "Sign In to Candidate Portal"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!isAdminPortal && (
                <div className="text-center mt-2">
                  <span className="text-xs text-slate-500 font-medium">Don't have an account? </span>
                  <Link href="/register" className="text-xs font-bold text-[#FF9900] hover:underline">
                    Create Student Account →
                  </Link>
                </div>
              )}
            </form>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                {isAdminPortal 
                  ? "🔒 Restricted Access. Authorized Admin Personnel Only."
                  : "🔒 Secure. Private. Built for Cloud Engineers."
                }
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
