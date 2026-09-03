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
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);

  const handleSubmitText = () => {
    if (!manualText.trim()) return;
    onFinishAnswer(manualText.trim());
    setManualText("");
    setPasteWarning(null);
  };

  const handleBlockPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setPasteWarning("🚫 Copy-pasting is disabled for interview integrity. Please type your response manually.");
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPasteWarning("🚫 Drag-and-drop text is disabled for proctoring integrity.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
      e.preventDefault();
      setPasteWarning("🚫 Copy-pasting (Ctrl+V) is disabled. Please type your technical response manually.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      {/* Primary Action Buttons */}
      <div className="flex items-center justify-center gap-4 w-full">
        {!isRecording ? (
          <button
            onClick={onStartRecording}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 shadow-xl shadow-[#FF9900]/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center animate-pulse">
              <Mic className="w-4 h-4 text-slate-950" />
            </div>
            <span>Start Verbal Answer 🎙️</span>
          </button>
        ) : (
          <button
            onClick={() => onFinishAnswer()}
            disabled={isProcessing}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 shadow-xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
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

      {/* Optional Accessibility / Text Backup Input (Protected with Anti-Paste Proctoring) */}
      {showTextInput && (
        <div className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800 dark:text-slate-200">Manual Text Answer (Optional Fallback)</span>
            <span className="font-mono text-[10px] text-rose-500 font-bold">🔒 Anti-Paste Protected</span>
          </div>

          {pasteWarning && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between animate-fadeIn">
              <span>{pasteWarning}</span>
              <button onClick={() => setPasteWarning(null)} className="text-xs font-black hover:opacity-80">✕</button>
            </div>
          )}

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            onPaste={handleBlockPaste}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onDrop={handleBlockDrop}
            onKeyDown={handleKeyDown}
            placeholder="Type your technical response here manually (Copy-Pasting disabled for interview integrity)..."
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#FF9900]"
          />

          <button
            onClick={handleSubmitText}
            disabled={!manualText.trim() || isProcessing}
            className="self-end px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#FF9900] hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Text Answer</span>
          </button>
        </div>
      )}
    </div>
  );
}
