"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, CheckSquare, FileText, BarChart3, Trophy, 
  Map, Award, Settings, HelpCircle, LogOut, Cloud, Sparkles,
  Users, CreditCard, Mail, HardDrive, Shield, Loader2, X,
  Calendar, Bell
} from "lucide-react";
import { useAuthStore, useATSStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isAnalyzing = useATSStore((s) => s.isAnalyzing);
  const [mounted, setMounted] = useState(false);

  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("cached_user_profile");
        if (cached) setDbUser(JSON.parse(cached));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProfile = async () => {
        try {
          // Fetch candidate profile for XP, level and name specific to logged-in user
          const res = await apiFetch("/candidates/me/profile");
          if (res?.data) {
            setDbUser(res.data);
            if (typeof window !== "undefined") {
              localStorage.setItem("cached_user_profile", JSON.stringify(res.data));
            }
          }
        } catch (e) {
          console.warn("Sidebar profile fetch notice:", e);
        }
      };
      fetchProfile();

      const handleProfileUpdate = () => {
        fetchProfile();
      };

      if (typeof window !== "undefined") {
        window.addEventListener("userProfileUpdated", handleProfileUpdate);
      }
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("userProfileUpdated", handleProfileUpdate);
        }
      };
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    onCloseMobile?.();
    router.push("/login");
  };

  const isAdminMode = mounted && (
    process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true" ||
    (typeof window !== "undefined" && window.location.hostname.includes("admin")) ||
    user?.role === "ADMIN"
  );

  const candidateNavItems = [
    { label: "Candidate Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Interview Stages", href: "/interviews", icon: CheckSquare },
    { label: "Resume ATS Audit", href: "/resume-ats", icon: FileText },
    { label: "Study Planner", href: "/study-planner", icon: Calendar },
    { label: "Smart Reminders", href: "/reminders", icon: Bell },
    { label: "My Progress & Matrix", href: "/performance", icon: BarChart3 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Career Roadmap", href: "/roadmap", icon: Map },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  const adminNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users & Candidates", href: "/admin/candidates", icon: Users },
    { label: "Assessments & Blueprints", href: "/admin/templates", icon: CheckSquare },
    { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "AI Model & Scoring", href: "/admin/scoring", icon: Sparkles },
    { label: "Support Tickets", href: "/help", icon: HelpCircle },
    { label: "System Settings", href: "/settings", icon: Settings },
  ];

  const navItems = isAdminMode ? adminNavItems : candidateNavItems;

  const userXp = dbUser?.xp ?? (user as any)?.xp ?? 0;
  const userLevel = dbUser?.level ?? (user as any)?.level ?? 1;
  // Show the real logged-in candidate name from profile, fallback to auth store
  const displayName = dbUser?.user?.full_name || user?.full_name || user?.email?.split("@")[0] || "Candidate";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        w-[260px] h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] 
        flex flex-col overflow-y-auto shrink-0 z-50 font-sans transition-transform duration-300
        fixed lg:sticky top-0 left-0
        ${isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Brand Header */}
        <div className="p-5 pb-3 flex items-center justify-between">
          <Link prefetch={false} href="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] via-amber-500 to-orange-400 p-[1.5px] shadow-md shadow-[#FF6B00]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B1E36] rounded-[10px] flex items-center justify-center text-white">
                <Cloud className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00]/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-[#0B1E36] dark:text-white leading-none">
                CloudOps <span className="text-[#FF6B00]">AI</span>
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest mt-1.5 px-2 py-0.5 rounded-full w-max ${
                isAdminMode 
                  ? 'bg-[#0B1E36] text-white border border-[#FF6B00]/40'
                  : 'bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] border border-[#FF6B00]/30'
              }`}>
                {isAdminMode ? "ADMIN PANEL PORTAL" : "CANDIDATE PORTAL"}
              </span>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link prefetch={false}
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 text-white shadow-md shadow-[#FF6B00]/20 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 dark:hover:bg-[#FF6B00]/10"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      {/* Bottom Section */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
        
        {mounted && isAnalyzing && (
          <Link prefetch={false}
            href="/resume-ats"
            className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-[#FF9900] shadow-md flex items-center gap-2.5 animate-pulse text-xs font-bold text-amber-900 dark:text-amber-200 hover:scale-[1.02] transition-all"
          >
            <Loader2 className="w-4 h-4 text-[#FF9900] animate-spin shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black leading-tight text-[#FF9900]">AI Analysis Active</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Running in background...</span>
            </div>
          </Link>
        )}

        {isAdminMode ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5 shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-[#0B1E36] text-[#FF6B00] flex items-center justify-center shadow-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SYSTEM STATUS</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">All Systems Operational</span>
            <div className="w-full h-1 bg-emerald-500 rounded-full mt-0.5" />
            <span className="text-[9px] font-mono text-slate-400 mt-0.5">Last checked: 2 mins ago</span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-orange-50/80 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-[#FF6B00]/30 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
              <span>Become CloudOps Pro</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Unlock full roadmap, mock interviews, and AI mentorship.
            </p>
            <button className="w-full py-2 rounded-xl text-[11px] font-black text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-sm transition-all mt-0.5">
              Upgrade Now
            </button>
          </div>
        )}

        {/* Logged in User Card */}
        {mounted && isAuthenticated && user && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                {user.avatar_url ? (
                  <img loading="lazy" decoding="async" src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName?.charAt(0)?.toUpperCase() || "C"}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
                <span className="text-[10px] font-medium text-slate-500 truncate">
                  {(user.role === "ADMIN" || isAdminMode) ? "Administrator" : (dbUser?.target_role || "Cloud Engineer")}
                </span>
              </div>
            </div>

            {(user.role === "ADMIN" || isAdminMode) ? (
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 tracking-tight">
                  Full Administrator Access
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-full bg-[#FF6B00] text-white font-black">
                    Level {userLevel}
                  </span>
                  <span className="text-slate-500 font-mono">
                    XP: {userXp.toLocaleString()} / 10,000
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF6B00] rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((userXp / 10000) * 100, 100)}%` }} 
                  />
                </div>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{mounted && isAuthenticated ? "Sign Out" : "Sign In"}</span>
        </button>

      </div>

    </aside>
    </>
  );
}
