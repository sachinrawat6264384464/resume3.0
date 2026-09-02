"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Cloud, Lock, Mail, Shield, User as UserIcon, 
  ArrowRight, Sparkles, Loader2, CheckCircle2 
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("candidate@cloudops.internal");
  const [password, setPassword] = useState("Candidate@12345");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(res.user, res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: "CANDIDATE" | "ADMIN") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/mock-login", {
        method: "POST",
        body: JSON.stringify({
          role,
          email: role === "ADMIN" ? "admin@cloudops.internal" : "candidate@cloudops.internal",
          name: role === "ADMIN" ? "Alex Vance (Admin)" : "Sarah Jenkins (Student)"
        }),
      });
      setAuth(res.user, res.access_token);
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-xl shadow-indigo-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Cloud className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CloudOps AI Assessment OS</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Intelligent verbal interview chamber, 5-pillar skill rubrics, and automated 30-day learning roadmap.
          </p>
        </div>

        {/* Quick Demo Switcher Card */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo One-Click Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("CANDIDATE")}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all flex flex-col justify-between group"
            >
              <span className="text-[10px] font-mono text-indigo-400 uppercase">Student / Candidate</span>
              <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">Sarah Jenkins →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin("ADMIN")}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all flex flex-col justify-between group"
            >
              <span className="text-[10px] font-mono text-purple-400 uppercase">Administrator</span>
              <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">Alex Vance →</span>
            </button>
          </div>
        </div>

        {/* Sign-in Form */}
        <form onSubmit={handleLogin} className="p-6 rounded-3xl glass-panel-glow border border-white/10 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white">Sign In with Credentials</h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                placeholder="name@cloudops.internal"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
