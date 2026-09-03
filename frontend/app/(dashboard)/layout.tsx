"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Restore session from localStorage if present
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser && storedUser.trim() && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === "object") {
          setAuth(parsed, storedToken);
        }
      } catch (err) {
        console.warn("Corrupt auth_user in localStorage, clearing auth cache:", err);
        localStorage.removeItem("auth_user");
      }
    }
    setMounted(true);
  }, [setAuth]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#050810]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
