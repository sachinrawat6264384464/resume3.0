"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell, Sun, Moon, LogOut, User, Settings, 
  BarChart3, CheckCircle2, Sparkles, Trophy, FileText, ChevronDown, Check, X,
  ShieldCheck, Menu
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiFetch } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: "assessment" | "resume" | "roadmap" | "achievement";
}

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Stage 1 Assessment Active 🏆",
      desc: "CloudOps 5-Stage Voice Interview Stage 1 is ready for evaluation.",
      time: "2m ago",
      read: false,
      type: "assessment"
    },
    {
      id: "notif-2",
      title: "Resume ATS Audit Complete 📄",
      desc: "ATS Compatibility Score is 85% with 12 matching skills extracted.",
      time: "1h ago",
      read: false,
      type: "resume"
    },
    {
      id: "notif-3",
      title: "Weekly Roadmap Target ⚡",
      desc: "AWS Infrastructure & Terraform automation target active.",
      time: "3h ago",
      read: false,
      type: "roadmap"
    }
  ]);

  const [candProfile, setCandProfile] = useState<any>(null);

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
    if (isAuthenticated) fetchProfile();

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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Always use candidate profile name first, then auth store name, then email prefix
  const candidateName = candProfile?.user?.full_name || user?.full_name || user?.email?.split("@")[0] || "Candidate User";
  const candidateEmail = user?.email || "candidate@example.com";
  const candidateRole = (user?.role === "ADMIN") ? "Administrator" : (candProfile?.target_role || "Cloud Engineer");

  return (
    <header className="flex items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6 font-sans">
      
      {/* Left Brand / Assessment OS Badge & Mobile Hamburger Menu */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#FF6B00] lg:hidden shadow-xs cursor-pointer"
          title="Open Menu"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50/80 dark:bg-slate-900 border border-[#FF9900]/30 shadow-xs text-xs font-mono font-bold text-[#FF9900]">
          <ShieldCheck className="w-4 h-4 text-[#FF9900] shrink-0" />
          <span className="tracking-wide text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-none">CLOUDOPS AI ASSESSMENT OS</span>
        </div>
      </div>

      {/* Right Header Action Bar (Enlarged, Professional & Sleek) */}
      <div className="flex items-center gap-3.5 relative">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#FF9900] shadow-sm hover:shadow-md transition-all cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        {/* 🔔 Interactive Notification Center Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#FF9900] shadow-sm hover:shadow-md relative transition-all cursor-pointer"
            title="Notification Center"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#FF9900] text-slate-950 text-[10px] font-black flex items-center justify-center absolute -top-1 -right-1 shadow-lg border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-[#FF9900]" />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-[#FF9900]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-[#FF9900] hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                      notif.read
                        ? "bg-white dark:bg-slate-900 opacity-70 hover:opacity-100"
                        : "bg-amber-50/40 dark:bg-amber-950/20"
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-[#FF9900] shrink-0 mt-0.5">
                      {notif.type === "assessment" && <Trophy className="w-4 h-4" />}
                      {notif.type === "resume" && <FileText className="w-4 h-4" />}
                      {notif.type === "roadmap" && <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {notif.desc}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900] shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
