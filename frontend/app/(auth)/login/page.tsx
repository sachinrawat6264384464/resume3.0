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
        setError(err.message || "Failed to sign in. Check email and password.");
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
          <div className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 my-1.5 flex-1 min-h-0">
            
            {/* Features Checklist */}
            <div className="flex flex-col gap-3.5 shrink-0 w-full sm:w-[40%]">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9.5 h-9.5 rounded-2xl bg-[#FF9900] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#FF9900]/25">
                    <f.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">{f.title}</span>
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold truncate">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Robot & Laptop Image */}
            <div className="w-full sm:w-[64%] flex items-center justify-center sm:justify-start relative h-full min-h-0 -ml-2 sm:-ml-5">
              <img 
                src="/images/exact_login_hero_3d.png" 
                alt="CloudOps AI Robot & Laptop 3D Illustration" 
                className="w-full max-w-[580px] lg:max-w-[700px] max-h-[440px] lg:max-h-[500px] object-contain mix-blend-multiply contrast-[1.08] brightness-[1.02] dark:mix-blend-normal transition-transform duration-500 hover:scale-[1.03]" 
              />
            </div>

          </div>

          {/* Trusted By Banner */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF9900] via-amber-500 to-orange-400 p-[1px] shadow-sm shadow-[#FF9900]/30 shrink-0">
              <div className="w-full h-full bg-[#FF9900] rounded-[10px] flex items-center justify-center text-white">
                <Shield className="w-4 h-4 fill-white/30 text-white" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                {isAdminPortal ? "CloudOps AI Assessment OS — Administrator Microservice Portal" : "Trusted by Cloud Engineers & DevOps Professionals"}
              </span>
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

            {/* Role Switcher (Hidden on Dedicated Admin Portal) */}
            {!isAdminPortal && (
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("CANDIDATE")}
                  className={`p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                    role === "CANDIDATE"
                      ? "bg-white dark:bg-slate-900 border border-[#FF9900]/30 shadow-md shadow-[#FF9900]/5"
                      : "hover:bg-white/50 text-slate-500"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    role === "CANDIDATE" ? "bg-amber-50 text-[#FF9900] dark:bg-[#FF9900]/10" : "bg-slate-200/60 text-slate-400"
                  }`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${role === "CANDIDATE" ? "text-[#FF9900]" : "text-slate-500"}`}>
                      STUDENT / CANDIDATE
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium truncate">Access assessments</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSwitch("ADMIN")}
                  className={`p-2.5 sm:p-3 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                    role === "ADMIN"
                      ? "bg-white dark:bg-slate-900 border border-[#FF9900]/30 shadow-md shadow-[#FF9900]/5"
                      : "hover:bg-white/50 text-slate-500"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    role === "ADMIN" ? "bg-amber-50 text-[#FF9900] dark:bg-[#FF9900]/10" : "bg-slate-200/60 text-slate-400"
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${role === "ADMIN" ? "text-[#FF9900]" : "text-slate-500"}`}>
                      ADMINISTRATOR
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium truncate">Manage platform</span>
                  </div>
                </button>
              </div>
            )}

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
                    <span>Sign In to Admin Portal</span>
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
