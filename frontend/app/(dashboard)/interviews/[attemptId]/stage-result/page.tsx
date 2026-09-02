"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, XCircle, ArrowRight, BookOpen, 
  RotateCcw, Sparkles, Trophy, Loader2, Shield 
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { InterviewAttempt, StageAttempt } from "@/types";

export default function StageResultPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [completedStage, setCompletedStage] = useState<StageAttempt | null>(null);
  const [nextStage, setNextStage] = useState<StageAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await apiFetch(`/attempts/${attemptId}`);
        const att: InterviewAttempt = res.data;
        setAttempt(att);

        // Find the most recently completed stage
        const passedOrFailed = att.stage_attempts.filter(
          (s) => s.status === "PASSED" || s.status === "FAILED"
        );
        const last = passedOrFailed[passedOrFailed.length - 1] || att.stage_attempts[0];
        setCompletedStage(last);

        // Find next stage if available
        const next = att.stage_attempts.find((s) => s.stage_number === last.stage_number + 1);
        setNextStage(next || null);

        // Trigger confetti if passed
        if (last.status === "PASSED" || (last.score || 0) >= 80) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err: any) {
        console.warn("Failed to load stage result:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const score = completedStage?.score || 0;
  const isPassed = completedStage?.status === "PASSED" || score >= 80;
  const isAllComplete = attempt?.status === "COMPLETED" || !nextStage;

  return (
    <div className="flex-1 flex items-center justify-center py-6">
      <div className="w-full max-w-2xl p-8 rounded-3xl glass-panel-glow border border-white/10 flex flex-col items-center text-center gap-6 relative overflow-hidden">
        {/* Glow background */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isPassed ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`} />

        {/* Icon & Status */}
        <div className="relative">
          <div className={`w-20 h-20 rounded-full p-[2px] ${
            isPassed ? 'bg-gradient-to-tr from-emerald-400 to-cyan-400' : 'bg-gradient-to-tr from-rose-500 to-amber-500'
          }`}>
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              {isPassed ? (
                <Trophy className="w-9 h-9 text-emerald-400 animate-bounce" />
              ) : (
                <XCircle className="w-9 h-9 text-rose-400" />
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold ${
              isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}>
              {isPassed ? "STAGE PASSED (≥ 80%)" : "NEEDS IMPROVEMENT (< 80%)"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {completedStage?.stage?.title || `Stage ${completedStage?.stage_number}`} Completed
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {isPassed
              ? "Congratulations! You have satisfied the technical competency threshold for this stage."
              : "You scored below the 80% passing threshold for this stage. Review your technical feedback and recommended study syllabus."}
          </p>
        </div>

        {/* Score Gauge Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 w-full max-w-sm flex items-center justify-around">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Stage Score</span>
            <span className={`text-4xl font-black font-mono ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {score}%
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Passing Threshold</span>
            <span className="text-4xl font-black text-slate-200 font-mono">
              80%
            </span>
          </div>
        </div>

        {/* Question Score Breakdown */}
        {completedStage?.question_attempts && completedStage.question_attempts.length > 0 && (
          <div className="w-full flex flex-col gap-2 text-left">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Question Scores:
            </span>
            <div className="flex flex-col gap-1.5">
              {completedStage.question_attempts.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <span className="text-slate-300 truncate max-w-md">
                    {idx + 1}. {q.question_text_snapshot}
                  </span>
                  <span className={`font-mono font-bold ${
                    (q.overall_score || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {q.overall_score || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
          {isPassed && nextStage ? (
            <Link
              href={`/interviews/${attemptId}/room`}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <span>Advance to Stage {nextStage.stage_number}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/results/${attemptId}`}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Comprehensive 30-Day Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            href="/dashboard"
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-semibold text-xs text-slate-300 glass-panel hover:bg-white/10 border border-white/10"
          >
            Candidate Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
