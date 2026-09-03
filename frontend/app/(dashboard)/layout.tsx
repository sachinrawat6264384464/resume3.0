"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

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
  }, [setAuth]);

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-[#050810]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 pb-20">
          <Header />
          {children}
        </main>
      </div>
    </div>
  );
}
