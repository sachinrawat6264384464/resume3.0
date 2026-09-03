"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { 
  Cloud, Terminal, Shield, User as UserIcon, 
  LogOut, LayoutDashboard, FileText, CheckCircle2, ChevronRight, TrendingUp
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const isDashboardRoute = [
    '/dashboard', '/admin', '/resume-ats', '/performance', 
    '/practice', '/leaderboard', '/interviews', '/roadmap', '/certificates', '/mock', '/achievements', '/settings', '/help'
  ].some(route => pathname?.startsWith(route));

  const isLegalRoute = ['/privacy', '/terms', '/security', '/retention'].some(route => pathname?.startsWith(route));

  if (pathname === "/" || pathname === "/login" || pathname === "/register" || isDashboardRoute || isLegalRoute) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#FF9900] text-white shadow-lg shadow-[#FF9900]/25 group-hover:scale-105 transition-transform duration-300">
            <Cloud className="w-5 h-5 fill-white/20" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1 font-black text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              CloudOps
              <span className="text-[#FF9900] font-extrabold ml-0.5">AI</span>
            </div>
          </div>
        </Link>

        {/* Navigation links */}
        {isAuthenticated ? (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/dashboard"
                  ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              Candidate Hub
            </Link>

            <Link
              href="/resume-ats"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/resume-ats"
                  ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Resume ATS
            </Link>

            <Link
              href="/practice"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/practice"
                  ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Quick Practice
            </Link>

            <Link
              href="/performance"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/performance"
                  ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Performance
            </Link>

            <Link
              href="/leaderboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                pathname === "/leaderboard"
                  ? "bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Leaderboard
            </Link>

            {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
              <>
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    pathname === "/admin"
                      ? "bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-blue-200 dark:border-indigo-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Shield className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                  Admin Analytics
                </Link>
                <Link
                  href="/admin/templates"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    pathname?.startsWith("/admin/templates")
                      ? "bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-blue-200 dark:border-indigo-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Terminal className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  Blueprints & JDs
                </Link>
              </>
            ) : null}
          </nav>
        ) : (
          /* Public Menu */
          <nav className="hidden md:flex items-center gap-3 lg:gap-6">
            <Link href="#features" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              How it Works
            </Link>
            <Link href="/leaderboard" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Leaderboard
            </Link>
            <Link href="#pricing" className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Pricing
            </Link>
          </nav>
        )}

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.full_name}</span>
                <span className="text-[11px] font-mono text-blue-600 dark:text-cyan-400 uppercase tracking-wider font-bold">{user.role}</span>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-indigo-600 p-[1px] shadow-sm">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                  {user.full_name.charAt(0)}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 rounded-xl transition-all shadow-md shadow-[#FF9900]/25 flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>Get Started <span className="hidden sm:inline">Free</span></span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
