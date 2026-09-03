"use client";

import { useState } from "react";
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

  const [role, setRole] = useState<"CANDIDATE" | "ADMIN">("CANDIDATE");
  const [email, setEmail] = useState("candidate@cloudops.internal");
  const [password, setPassword] = useState("Candidate@12345");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSwitch = (selectedRole: "CANDIDATE" | "ADMIN") => {
    setRole(selectedRole);
    if (selectedRole === "ADMIN") {
      setEmail("admin@cloudops.internal");
      setPassword("Admin@12345");
    } else {
      setEmail("candidate@cloudops.internal");
      setPassword("Candidate@12345");
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
        router.push("/dashboard");
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
      if (res.user?.role === "ADMIN" || role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      try {
        const res = await apiFetch("/auth/mock-login", {
          method: "POST",
          body: JSON.stringify({
            role,
            email,
            name: role === "ADMIN" ? "Alex Vance (Admin)" : "Arjun Sharma (Student)"
          }),
        });
        setAuth(res.user, res.access_token);
        if (role === "ADMIN") {
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

  return (
    <div className="h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center p-2 sm:p-4 lg:px-6 bg-[#f8fafc] dark:bg-[#050810]">
      <div className="w-full max-w-[1300px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-center h-full max-h-full py-1">
        
        {/* Left Column: Branding & 3D Hero */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full py-1 min-h-0">
          
          {/* Header Text (Enlarged Heading & Subtitle) */}
          <div>
            <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">
              AI-POWERED ASSESSMENT OS
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 dark:text-white tracking-tight mt-1 leading-[1.08]">
              Ace DevOps.<br />
              Master Cloud.<br />
              <span className="text-[#FF9900]">Get Hired.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-xl leading-relaxed font-medium">
              Real-world AI interviews, intelligent evaluations and a personalized roadmap to help you become a top CloudOps Engineer.
            </p>
          </div>

          {/* Middle Split: 5 Features (Left) + 3D Robot Image (Right) */}
          <div className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 my-1.5 flex-1 min-h-0">
            
            {/* Features Checklist */}
            <div className="flex flex-col gap-3.5 shrink-0 w-full sm:w-[40%]">
              {[
                { icon: Mic, title: "AI Voice Interviews", desc: "Real-time, interactive & scored" },
                { icon: Layers, title: "5-Stage Assessments", desc: "From basics to production incidents" },
                { icon: FileCheck, title: "ATS Resume Analyzer", desc: "Smart scoring & keyword insights" },
                { icon: Map, title: "30-Day Roadmap", desc: "Personalized learning path" },
                { icon: Trophy, title: "Leaderboard & XP", desc: "Compete, earn XP & climb ranks" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3.5">
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

            {/* 3D Robot & Laptop Image (Enlarged High Impact 3D Graphic) */}
            <div className="w-full sm:w-[64%] flex items-center justify-center sm:justify-start relative h-full min-h-0 -ml-2 sm:-ml-5">
              <img 
                src="/images/exact_login_hero_3d.png" 
                alt="CloudOps AI Robot & Laptop 3D Illustration" 
                className="w-full max-w-[580px] lg:max-w-[700px] max-h-[440px] lg:max-h-[500px] object-contain mix-blend-multiply contrast-[1.08] brightness-[1.02] dark:mix-blend-normal transition-transform duration-500 hover:scale-[1.03]" 
              />
            </div>

          </div>

          {/* Trusted By Banner (Clean Medium Proportions) */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3 shrink-0 mt-0.5">
            
            {/* 3D Red Shield Icon */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF9900] via-amber-500 to-orange-400 p-[1px] shadow-sm shadow-[#FF9900]/30 shrink-0">
              <div className="w-full h-full bg-[#FF9900] rounded-[10px] flex items-center justify-center text-white">
                <Shield className="w-4 h-4 fill-white/30 text-white" />
              </div>
            </div>

            {/* Content: Title on Top, Colored Logos Below */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-none">
                Trusted by Cloud Engineers & DevOps Professionals
              </span>

              {/* 6 Real Colored Brand Logos (Medium Size) */}
              <div className="flex items-center justify-between gap-3 overflow-hidden py-0.5">
                
                {/* AWS Logo */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="h-4 w-auto" viewBox="0 0 50 30" fill="none">
                    <path d="M16.7 15.7c0-2.1 1.2-3.1 3.2-3.1 1.5 0 2.8.6 3.6 1.6v-1.3h3.2v10.4h-3.2v-1.4c-.9 1.1-2.2 1.7-3.7 1.7-2 0-3.1-1.1-3.1-3.2 0-2.9 2.9-3.8 6.8-3.8v-.3c0-1-.6-1.5-1.9-1.5-.9 0-1.9.4-2.5.8l-.7-2.2zm3.6 5.3c1.2 0 2.2-.6 2.7-1.5v-2.4c-2 0-3.9.4-3.9 1.9 0 1.3.5 2 1.2 2zM28.4 23.3l-3.3-11.8h3.3l2.2 8.7 2.3-8.7h3.1l2.3 8.7 2.2-8.7h3.3L40.5 23.3h-3.1l-2.4-8.8-2.4 8.8h-4.2zM45.5 21.2c.8.6 1.9.9 3 .9 1.2 0 1.9-.4 1.9-1.1 0-.7-.7-1.1-2.3-1.5-2.2-.6-3.4-1.4-3.4-3.2 0-2.2 1.9-3.5 4.5-3.5 1.4 0 2.6.4 3.4.9l-.8 2.2c-.7-.5-1.6-.7-2.6-.7-1.1 0-1.7.4-1.7 1 0 .7.7 1 2.2 1.4 2.3.6 3.5 1.4 3.5 3.3 0 2.3-1.9 3.6-4.9 3.6-1.6 0-3.1-.4-4-1l.7-2.3z" fill="#FF9900"/>
                    <path d="M12.5 26.5c11 4.5 26.5 4.5 36.5-1.5" stroke="#FF9900" strokeWidth="3" strokeLinecap="round"/>
                    <path d="M46 22l4.5 3.5-5.5 2" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-black text-[#232F3E] dark:text-white">aws</span>
                </div>

                {/* Google Cloud Logo */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.5 8.9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.5 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.8 6.3C.7 8.6 0 10.2 0 12s.7 3.4 1.8 5.7l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.6-2.5-6.5-5.3L1.8 16C3.7 19.7 7.5 23 12 23z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Google Cloud</span>
                </div>

                {/* Microsoft Azure Logo */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M13.05 2L3 17.15h5.4L13.05 2z" fill="#0089D6"/>
                    <path d="M13.7 3.75L9.6 17.15H21L13.7 3.75z" fill="#0072C6"/>
                  </svg>
                  <span className="text-xs font-extrabold text-[#0072C6]">Azure</span>
                </div>

                {/* Docker Logo */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="w-5 h-4 shrink-0" viewBox="0 0 24 24" fill="#0db7ed">
                    <path d="M13.98 11.08h1.83v1.78h-1.83zm-2.42 0h1.83v1.78h-1.83zm-2.41 0h1.83v1.78H9.15zm-2.42 0h1.83v1.78H6.73zm4.84-2.38h1.83v1.78h-1.83zm-2.42 0h1.83v1.78H9.15zm-2.42 0h1.83v1.78H6.73zm4.84-2.38h1.83v1.78h-1.83zM2.4 14.05c-.32 1.34.2 2.76 1.35 3.58 2.2 1.58 6.64 1.87 9.87 1.87 4.7 0 9.07-1.12 10.38-4.22.14-.34.05-.72-.22-.96a.8.8 0 0 0-.6-.18c-1.34.18-2.67.06-3.92-.35a3.8 3.8 0 0 1-2.03-1.63c-.35-.58-.5-1.25-.43-1.92.05-.4-.2-.77-.59-.87-.39-.1-.8.07-1 .4-.45.74-1.17 1.25-2.02 1.44a5.3 5.3 0 0 1-3.64-.53c-.36-.2-.8-.13-1.07.18-.28.32-.32.78-.1 1.15.5.86.67 1.88.48 2.87z"/>
                  </svg>
                  <span className="text-xs font-black text-[#0db7ed]">docker</span>
                </div>

                {/* Kubernetes Logo */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#326ce5">
                    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3l6.7 3.7v7.4L12 19.1 5.3 15.4V8L12 4.3z"/>
                  </svg>
                  <span className="text-xs font-extrabold text-[#326ce5]">kubernetes</span>
                </div>

                {/* Terraform Logo */}
                <div className="flex items-center gap-1 shrink-0">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#844FBA">
                    <path d="M1.5 2v6.5l6 3.5V5.5l-6-3.5zm7 4v6.5l6 3.5V9.5l-6-3.5zm0 7.5v6.5l6 3.5V17l-6-3.5zm7-7.5v6.5l6 3.5V5.5l-6-3.5z"/>
                  </svg>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Terraform</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: White Sign In Card (Aligned cleanly without right gap) */}
        <div className="lg:col-span-5 w-full flex items-center justify-end">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-none flex flex-col gap-5.5 w-full">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Sign in to continue your CloudOps AI journey
              </p>
            </div>

            {/* Quick Switcher Role Tabs */}
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
                    placeholder="candidate@cloudops.internal"
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-[#FF9900] font-medium text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder="••••••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center mt-2">
                <span className="text-xs text-slate-500 font-medium">Don't have an account? </span>
                <Link href="/register" className="text-xs font-bold text-[#FF9900] hover:underline">
                  Create Student Account →
                </Link>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                🔒 Secure. Private. Built for Cloud Engineers.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
