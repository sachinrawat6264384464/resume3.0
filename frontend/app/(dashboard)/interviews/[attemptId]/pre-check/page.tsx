"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DeviceCheckModal } from "@/components/interview/DeviceCheckModal";
import { apiFetch } from "@/lib/api";
import { InterviewAttempt } from "@/types";
import { Loader2 } from "lucide-react";

export default function PreCheckPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAttempt() {
      if (!attemptId) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify Stage 0 Profile Setup status before allowing camera lobby access
        const resMetrics = await apiFetch("/candidates/me/dashboard-metrics").catch(() => null);
        const cand = resMetrics?.data?.candidate;
        const userStage0Key = cand?.user_id ? `stage0_profile_data_${cand.user_id}` : "stage0_profile_data";
        const hasLocalStage0 = typeof window !== "undefined" && Boolean(localStorage.getItem(userStage0Key));
        const isStage0Done = Boolean(
          hasLocalStage0 || 
          (cand?.xp && cand.xp > 0) || 
          cand?.resume_data_json?.stage_0_completed
        );

        if (!attemptId.startsWith("stage-") && !attemptId.startsWith("demo-")) {
          const res = await apiFetch(`/attempts/${attemptId}`);
          if (res?.data) {
            setAttempt(res.data);
            const stgNum = res.data.stage_attempts?.[0]?.stage_number ?? res.data.stage_number ?? 1;
            if (stgNum > 0 && !isStage0Done) {
              router.replace("/interviews?stage=0&locked=true");
              return;
            }
          }
        } else {
          const matchedNum = parseInt(attemptId.replace(/\D/g, ""), 10) || 1;
          if (matchedNum > 0 && !isStage0Done) {
            router.replace("/interviews?stage=0&locked=true");
            return;
          }
        }
      } catch (err: any) {
        console.warn("Pre-check attempt load notice:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId, router]);

  const handleReadyToStart = (stream: MediaStream | null) => {
    // Media stream ready -> proceed to live room
    router.push(`/interviews/${attemptId}/room`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-4">
      <DeviceCheckModal
        onReadyToStart={handleReadyToStart}
        targetRole={attempt?.template?.target_role || "CloudOps Engineer"}
        templateTitle={attempt?.template?.title || "Technical Assessment"}
      />
    </div>
  );
}
