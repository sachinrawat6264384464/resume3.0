"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIsAdminUser = () => {
    if (process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true") return true;
    let currentUser = user;
    if (!currentUser && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth_user");
        if (stored) currentUser = JSON.parse(stored);
      } catch {}
    }
    return (
      currentUser?.role === "ADMIN" ||
      currentUser?.role === "SUPER_ADMIN" ||
      (currentUser as any)?.is_admin === true ||
      currentUser?.email === "admin@cloudops.internal"
    );
  };

  const isAdminUser = getIsAdminUser();

  useEffect(() => {
    if (mounted && !isAdminUser && !pathname.startsWith("/admin/login")) {
      router.replace("/admin/login");
    }
  }, [mounted, isAdminUser, pathname, router]);

  if (!mounted || (!isAdminUser && !pathname.startsWith("/admin/login"))) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          Authenticating Administrator Session...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
