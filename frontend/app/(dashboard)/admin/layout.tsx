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

  const isAdminUser = 
    process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true" ||
    user?.role === "ADMIN" || 
    user?.role === "SUPER_ADMIN" || 
    (user as any)?.is_admin === true || 
    user?.email === "admin@cloudops.internal";

  useEffect(() => {
    if (mounted && !isAdminUser && !pathname.startsWith("/admin/login")) {
      router.replace("/admin/login");
    }
  }, [mounted, isAdminUser, pathname, router]);

  if (!mounted || (!isAdminUser && !pathname.startsWith("/admin/login"))) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
