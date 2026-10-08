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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (attemptId && router?.prefetch) {
      try {
        router.prefetch(`/interviews/${attemptId}/room`);
      } catch (e) {}
    }

    async function loadAttempt() {
      if (!attemptId) return;

      try {
        const userStage0Key = "stage0_profile_data";
        const hasLocalStage0 = typeof window !== "undefined" && Boolean(
          localStorage.getItem("stage0_profile_data") ||
          localStorage.getItem("candidate_linkedin_url") ||
          localStorage.getItem("completed_stages_list")
        );

        if (!attemptId.startsWith("stage-") && !attemptId.startsWith("demo-")) {
          const res = await apiFetch(`/attempts/${attemptId}`).catch(() => null);
          if (res?.data) {
            setAttempt(res.data);
            const stgNum = res.data.stage_attempts?.[0]?.stage_number ?? res.data.stage_number ?? 1;
            if (stgNum > 0 && !hasLocalStage0) {
              const resMetrics = await apiFetch("/candidates/me/dashboard-metrics").catch(() => null);
              const cand = resMetrics?.data?.candidate;
              const isStage0Done = Boolean((cand?.xp && cand.xp > 0) || cand?.resume_data_json?.stage_0_completed);
              if (!isStage0Done) {
                router.replace("/interviews?stage=0&locked=true");
                return;
              }
            }
          }
        }
      } catch (err: any) {
        console.warn("Pre-check attempt load notice:", err);
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
