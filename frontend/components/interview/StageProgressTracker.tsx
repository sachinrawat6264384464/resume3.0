"use client";

import { CheckCircle2, Lock, PlayCircle, Clock } from "lucide-react";
import { StageAttempt } from "@/types";

interface StageProgressTrackerProps {
  stages: StageAttempt[];
  currentStageNumber: number;
  currentQuestionIndex: number;
  totalQuestionsInStage: number;
  elapsedSeconds: number;
}

export function StageProgressTracker({
  stages,
  currentStageNumber,
  currentQuestionIndex,
  totalQuestionsInStage,
  elapsedSeconds,
}: StageProgressTrackerProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl glass-panel border border-white/10 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
            Interview Stages
          </span>
          <span className="text-xs text-indigo-400 font-medium">
            Stage {currentStageNumber} of {stages.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Stage Breadcrumb Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stages.map((stage) => {
          const isCurrent = stage.stage_number === currentStageNumber;
          const isPassed = stage.status === "PASSED";
          const isLocked = stage.status === "LOCKED";
          const isFailed = stage.status === "FAILED";

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                isCurrent
                  ? "bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                  : isPassed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : isFailed
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-slate-900/50 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                  Stage {stage.stage_number}
                </span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isLocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                {isCurrent && <PlayCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
              </div>

              <div className="font-medium text-xs text-white truncate">
                {stage.title || `Stage ${stage.stage_number}`}
              </div>

              {stage.score !== undefined && stage.score !== null && (
                <div className="text-[11px] font-mono mt-1 text-slate-300">
                  Score: <span className={stage.score >= 80 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{stage.score}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Question progress bar in current stage */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Question {currentQuestionIndex + 1} of {totalQuestionsInStage}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / totalQuestionsInStage) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestionsInStage) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
