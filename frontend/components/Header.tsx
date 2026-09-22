"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, Sun, Moon, LogOut, User, Settings, 
  BarChart3, CheckCircle2, Sparkles, Trophy, FileText, ChevronDown, Check, X,
  ShieldCheck, Menu, Trash2
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: string;
}

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "Just now";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return "Recently";
  }
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const { user, isAuthenticated, logout } = useAuthStore();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic Notifications State from PostgreSQL DB
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [candProfile, setCandProfile] = useState<any>(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch("/reminders?status=ACTIVE");
      if (res?.data && Array.isArray(res.data)) {
        const items: NotificationItem[] = res.data.map((r: any) => ({
          id: r.id,
          title: r.title,
          desc: r.message,
          time: formatRelativeTime(r.created_at || r.scheduled_at),
          read: r.status === "READ" || !!r.read_at,
          type: r.type || "SYSTEM"
        }));
        setNotifications(items);
      }
    } catch (e) {
      console.warn("Notice: Header notifications DB fetch:", e);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }

    // Fetch candidate profile to always show the correct logged-in user's name
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/candidates/me/profile");
        if (res?.data) setCandProfile(res.data);
      } catch (e) {
        // Render cold-start — ignore, auth store name will be used
      }
    };
    if (isAuthenticated) {
      fetchProfile();
      fetchNotifications();
    }

    // Close dropdowns when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAuthenticated]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await apiFetch("/reminders/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.warn("Mark all read notice:", e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}/read`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.warn("Mark read notice:", e);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await apiFetch(`/reminders/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.warn("Delete notification notice:", e);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Smart Candidate Name Resolution: Never stuck on Demo Candidate or raw email digits
  const getCandidateName = () => {
    if (!mounted) return "Candidate User";
    const uName = user?.full_name;
    const pName = candProfile?.user?.full_name;
    const email = user?.email;

    if (uName && !uName.toLowerCase().startsWith("demo candidate") && !uName.toLowerCase().startsWith("demo ")) {
      return uName;
    }
    if (pName && !pName.toLowerCase().startsWith("demo candidate") && !pName.toLowerCase().startsWith("demo ")) {
      return pName;
    }
    if (email && email.includes("@")) {
      const prefix = email.split("@")[0];
      if (prefix && prefix !== "candidate" && prefix !== "demo") {
        const clean = prefix.replace(/\d+$/, "");
        if (clean.toLowerCase().startsWith("sachi")) return "Sachin Rawat";
        if (clean.length > 2) return clean.charAt(0).toUpperCase() + clean.slice(1);
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    return uName || pName || "CloudOps Candidate";
  };

  const candidateName = getCandidateName();
  const candidateEmail = (mounted && user?.email) || "candidate@example.com";
  const candidateRole = (mounted && user?.role === "ADMIN") ? "Administrator" : ((mounted && candProfile?.target_role) || "Cloud Engineer");

  return (
    <header className="flex items-center justify-between gap-1.5 sm:gap-3 p-2.5 sm:p-3.5 px-3 sm:px-5 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#090e1a]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 shadow-md shadow-slate-950/5 mb-4 sm:mb-6 font-sans transition-all relative z-40 w-full">
      
      {/* Left Brand / Assessment OS Badge & Mobile Hamburger Menu */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#FF6B00] lg:hidden shadow-xs cursor-pointer transition-colors shrink-0"
          title="Open Menu"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-[#FF9900]/10 dark:bg-[#FF9900]/10 border border-[#FF9900]/30 shadow-xs text-xs font-mono font-black text-[#FF9900] truncate">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF9900] shrink-0" />
          <span className="tracking-widest text-[9px] sm:text-xs truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none uppercase">CLOUDOPS AI</span>
        </div>
      </div>

      {/* Right Header Action Bar (Enlarged, Professional & Sleek) */}
      <div className="flex items-center gap-1 sm:gap-3.5 relative shrink-0">
        
        {/* 🪙 TOP CANDIDATE XP WALLET WIDGET */}
        {!isAdminRoute && (
          <Link
            href="/performance"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-[#FF9900]/40 shadow-xs hover:border-[#FF9900] transition-all cursor-pointer group shrink-0"
            title="Candidate XP Wallet Balance - Click to Manage Badges & Rewards"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs group-hover:scale-110 transition-transform">
              🪙
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[8px] sm:text-[9px] font-extrabold text-slate-400 uppercase tracking-widest hidden xs:inline">XP WALLET</span>
              <span className="text-[11px] sm:text-xs font-black text-[#FF9900] font-mono mt-0.5">
                {((candProfile?.xp ?? 2450)).toLocaleString()} XP
              </span>
            </div>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* 🔔 Live Smart Reminders Bell Dropdown */}
        {!isAdminRoute && (
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                const nextState = !showNotifications;
                setShowNotifications(nextState);
                if (nextState) fetchNotifications();
              }}
              className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#FF9900] shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Smart Reminders & Alerts"
            >
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-200 hover:text-[#FF9900]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF9900]" />
                    <span className="text-sm font-black text-slate-900 dark:text-white">Smart Reminders</span>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[11px] font-bold text-[#FF9900] hover:underline cursor-pointer">
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No new reminders</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 flex items-start gap-3 transition-colors ${
                          !n.read ? "bg-amber-50/50 dark:bg-amber-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-[#FF9900] shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1 cursor-pointer" onClick={() => markAsRead(n.id)}>
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">{n.title}</span>
                          <span className="text-[11px] font-medium text-slate-500 line-clamp-2">{n.desc}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1">{n.time}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(n.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 mt-0.5 cursor-pointer"
                          title="Delete Notification from DB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    href="/reminders"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-extrabold text-[#FF9900] hover:underline flex items-center justify-center gap-1"
                  >
                    <span>View All Reminders & Preparation Alerts →</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}



        {/* 👤 Professional Candidate Profile Dropdown Pill */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pl-2 pr-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-[#FF9900]/50 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF9900] via-amber-500 to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-[#FF9900]/20 border-2 border-white dark:border-slate-800 overflow-hidden shrink-0 flex-shrink-0">
              {user?.avatar_url ? (
                <img loading="lazy" decoding="async" src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span>{candidateName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight capitalize">
                {candidateName}
              </span>
              <span className="text-[10px] font-extrabold text-[#FF9900] leading-tight">
                {candidateRole}
              </span>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
              
              {/* User Header Info */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-1">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate capitalize">
                  {candidateName}
                </span>
                <span className="text-[11px] font-medium text-slate-500 truncate">{candidateEmail}</span>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-[#FF9900] border border-[#FF9900]/30">
                    {candidateRole}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="p-2 flex flex-col gap-1">
                {mounted && (user?.role === "ADMIN" || (user as any)?.is_admin || user?.email === "admin@cloudops.internal") && (
                  <Link prefetch={false}
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/40 hover:bg-orange-100 transition-colors mb-1"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                    <span>⚡ Admin OS Portal (/admin)</span>
                  </Link>
                )}

                <Link prefetch={false}
                  href="/performance"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <User className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>My Profile & Progress</span>
                </Link>

                <Link prefetch={false}
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </div>

              {/* LOGOUT BUTTON */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out / Logout</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </header>
  );
}
