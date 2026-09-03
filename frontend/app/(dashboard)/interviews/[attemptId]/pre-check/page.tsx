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
      if (!attemptId || attemptId.startsWith("stage-")) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiFetch(`/attempts/${attemptId}`);
        if (res?.data) {
          setAttempt(res.data);
        }
      } catch (err: any) {
        console.warn("Pre-check attempt load notice:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAttempt();
  }, [attemptId]);

  const handleReadyToStart = (stream: MediaStream) => {
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
