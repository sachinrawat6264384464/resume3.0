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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen w-full max-w-full bg-slate-50 dark:bg-[#050810] relative overflow-x-hidden" suppressHydrationWarning>
      <Sidebar 
        isOpenMobile={isMobileSidebarOpen} 
        onCloseMobile={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] w-full max-w-full min-h-screen">
        <main className="flex-1 px-2.5 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-6 pb-20 w-full max-w-full">
          <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)} />
          {children}
        </main>
      </div>
    </div>
  );
}
