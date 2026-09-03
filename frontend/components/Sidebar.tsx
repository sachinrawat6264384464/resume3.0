"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, CheckSquare, FileText, BarChart3, Trophy, 
  Map, Award, Settings, HelpCircle, LogOut, Cloud, Sparkles
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, setAuth } = useAuthStore();

  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchMetrics = async () => {
        try {
          const res = await apiFetch("/candidates/me/dashboard-metrics");
          if (res?.data) {
            setDbUser(res.data);
          }
        } catch (e) {
          console.warn("Sidebar metrics fetch notice:", e);
        }
      };
      fetchMetrics();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Interview Stages", href: "/interviews", icon: CheckSquare },
    { label: "Resume ATS", href: "/resume-ats", icon: FileText },
    { label: "My Progress", href: "/performance", icon: BarChart3 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Roadmap", href: "/roadmap", icon: Map },
    { label: "Certificates", href: "/certificates", icon: Award },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  // REAL DYNAMIC USER XP & LEVEL (Zero hardcoded numbers)
  const userXp = (user as any)?.xp ?? dbUser?.xp ?? 0;
  const userLevel = (user as any)?.level ?? dbUser?.level ?? 1;

  return (
    <aside className="w-[260px] h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] flex flex-col sticky top-0 left-0 overflow-y-auto shrink-0 z-30">
      
      {/* Brand Header */}
      <div className="p-5 pb-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#FF9900] flex items-center justify-center text-white shadow-md shadow-[#FF9900]/25 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
              CloudOps <span className="text-[#FF9900]">AI</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Assessment OS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#FF9900] via-amber-500 to-orange-400 text-slate-950 shadow-md shadow-[#FF9900]/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Become CloudOps Pro Banner & User Card */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
        
        {/* Pro Upgrade Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-50/80 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-[#FF9900]/30 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 dark:text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9900] shrink-0" />
            <span>Become CloudOps Pro</span>
          </div>
          <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
            Unlock full roadmap, mock interviews, and AI mentorship.
          </p>
          <button className="w-full py-2 rounded-xl text-[11px] font-black text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-sm transition-all mt-0.5">
            Upgrade Now
          </button>
        </div>

        {/* Logged in User Card (100% Dynamic) */}
        {isAuthenticated && user && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.full_name?.charAt(0) || "U"}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.full_name}
                </span>
                <span className="text-[10px] font-medium text-slate-500 truncate">
                  {user.role === "ADMIN" ? "Administrator" : "Cloud Engineer"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded-full bg-[#FF9900] text-slate-950 font-black">
                Level {userLevel}
              </span>
              <span className="text-slate-500 font-mono">
                XP: {userXp.toLocaleString()} / 10,000
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF9900] rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((userXp / 10000) * 100, 100)}%` }} 
              />
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isAuthenticated ? "Sign Out" : "Sign In"}</span>
        </button>

      </div>

    </aside>
  );
}
