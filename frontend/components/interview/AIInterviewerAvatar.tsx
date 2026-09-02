"use client";

import { Volume2, VolumeX, Sparkles, Bot } from "lucide-react";

interface AIInterviewerAvatarProps {
  isSpeaking: boolean;
  questionText: string;
  stageTitle: string;
  category: string;
  onReplayAudio?: () => void;
}

export function AIInterviewerAvatar({
  isSpeaking,
  questionText,
  stageTitle,
  category,
  onReplayAudio
}: AIInterviewerAvatarProps) {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-3xl glass-panel-glow border border-indigo-500/30 relative overflow-hidden">
      {/* Background gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Avatar Core */}
      <div className="relative mb-6">
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping opacity-75" />
            <div className="absolute -inset-3 rounded-full border border-indigo-400/40 animate-pulse-glow" />
            <div className="absolute -inset-6 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '10s' }} />
          </>
        )}

        <div className={`w-24 h-24 rounded-full p-[2px] transition-all duration-500 ${
          isSpeaking
            ? "bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/50 scale-105"
            : "bg-slate-800 shadow-lg"
        }`}>
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center relative">
            <Bot className={`w-10 h-10 transition-colors duration-300 ${isSpeaking ? 'text-cyan-400' : 'text-indigo-400'}`} />
            {isSpeaking && (
              <span className="absolute bottom-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          {stageTitle}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          {category}
        </span>
      </div>

      {/* Voice prompt / status */}
      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
          {isSpeaking ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-cyan-300">AI Interviewer Speaking...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ready for your answer</span>
            </>
          )}
        </div>

        {onReplayAudio && (
          <button
            onClick={onReplayAudio}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Replay question audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question prompt typography */}
      <h2 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed max-w-2xl">
        &ldquo;{questionText}&rdquo;
      </h2>
    </div>
  );
}
