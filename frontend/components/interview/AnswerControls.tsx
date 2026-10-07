"use client";

import { useState } from "react";
import { Mic, Square, Loader2, Send, Sparkles, MessageSquare } from "lucide-react";

interface AnswerControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  isDisabled?: boolean;
  onStartRecording: () => void;
  onFinishAnswer: (optionalText?: string) => void;
}

export function AnswerControls({
  isRecording,
  isProcessing,
  isDisabled = false,
  onStartRecording,
  onFinishAnswer
}: AnswerControlsProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState("");

  const handleSubmitText = () => {
    if (!manualText.trim() || isDisabled || isProcessing) return;
    onFinishAnswer(manualText.trim());
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-4 w-full">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={isProcessing || isDisabled}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 shadow-xl shadow-[#FF9900]/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center animate-pulse">
              <Mic className="w-4 h-4 text-slate-950" />
            </div>
            <span>{isDisabled ? "Answer Submitted ✓" : "Start Verbal Answer 🎙️"}</span>
          </button>
        ) : (
          <button
            onClick={() => onFinishAnswer(manualText.trim() || undefined)}
            disabled={isProcessing || isDisabled}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Square className="w-4 h-4 fill-white text-white" />
            </div>
            <span>Finish & Submit Answer 🛑</span>
          </button>
        )}

        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
          title="Toggle Text Input Fallback"
        >
          <MessageSquare className="w-5 h-5 text-[#FF9900]" />
        </button>
      </div>

      {/* Processing Animation */}
      {isProcessing && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#232F3E] text-white border border-[#FF9900]/30 shadow-lg">
          <Loader2 className="w-5 h-5 text-[#FF9900] animate-spin" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">AI Analyzing Spoken Technical Answer</span>
            <span className="text-[11px] text-slate-300">Evaluating technical accuracy, concepts & communication pacing...</span>
          </div>
        </div>
      )}

      {/* Evaluated Notice when question is complete */}
      {isDisabled && !isProcessing && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <span>✅ Question Evaluated. Click "Proceed to Next Question" below to continue.</span>
        </div>
      )}

      {/* Optional Accessibility / Text Backup Input */}
      {showTextInput && (
        <div className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800 dark:text-slate-200">Manual Text Answer (Optional Fallback)</span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✨ Copy-Paste Enabled</span>
          </div>

          <textarea
            value={manualText}
            disabled={isDisabled || isProcessing}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type or paste your technical response here..."
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#FF9900] disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleSubmitText}
            disabled={!manualText.trim() || isProcessing || isDisabled}
            className="self-end px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#FF9900] hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center gap-1.5 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Text Answer</span>
          </button>
        </div>
      )}
    </div>
  );
}
