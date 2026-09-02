"use client";

import { useState } from "react";
import { Mic, Square, Loader2, Send, Sparkles, MessageSquare } from "lucide-react";

interface AnswerControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onFinishAnswer: (optionalText?: string) => void;
}

export function AnswerControls({
  isRecording,
  isProcessing,
  onStartRecording,
  onFinishAnswer
}: AnswerControlsProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [manualText, setManualText] = useState("");

  const handleSubmitText = () => {
    if (!manualText.trim()) return;
    onFinishAnswer(manualText.trim());
    setManualText("");
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-4 w-full">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span>Start Verbal Answer</span>
          </button>
        ) : (
          <button
            onClick={() => onFinishAnswer()}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Square className="w-4 h-4 fill-white text-white" />
            </div>
            <span>Finish Answer & Submit</span>
          </button>
        )}

        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="p-4 rounded-2xl glass-panel hover:bg-white/10 text-slate-300 transition-colors border border-white/10"
          title="Toggle Text Input Fallback"
        >
          <MessageSquare className="w-5 h-5 text-cyan-400" />
        </button>
      </div>

      {/* Processing Animation */}
      {isProcessing && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 backdrop-blur-md">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">AI Analyzing Spoken Technical Answer</span>
            <span className="text-[11px] text-indigo-300">Evaluating technical accuracy, concepts & communication pacing...</span>
          </div>
        </div>
      )}

      {/* Optional Accessibility / Text Backup Input */}
      {showTextInput && (
        <div className="w-full flex flex-col gap-2 p-4 rounded-2xl glass-panel border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Manual Text Answer (Optional Fallback)</span>
            <span className="font-mono text-[10px]">Speech-to-Text Recommended</span>
          </div>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type your technical response here if microphone is unavailable..."
            rows={3}
            className="w-full p-3 rounded-xl glass-input text-sm resize-none"
          />
          <button
            onClick={handleSubmitText}
            disabled={!manualText.trim() || isProcessing}
            className="self-end px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Text Answer</span>
          </button>
        </div>
      )}
    </div>
  );
}
