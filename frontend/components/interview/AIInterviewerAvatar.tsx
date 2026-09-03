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
    <div className="flex flex-col items-center text-center p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
      
      {/* Background soft glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF9900]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated Avatar Core */}
      <div className="relative mb-6">
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full bg-[#FF9900]/30 animate-ping opacity-75" />
            <div className="absolute -inset-3 rounded-full border border-[#FF9900]/40 animate-pulse" />
          </>
        )}

        <div className={`w-24 h-24 rounded-full p-[2.5px] transition-all duration-500 ${
          isSpeaking
            ? "bg-gradient-to-tr from-[#FF9900] via-amber-400 to-orange-500 shadow-2xl shadow-[#FF9900]/40 scale-105"
            : "bg-[#232F3E] shadow-lg"
        }`}>
          <div className="w-full h-full rounded-full bg-[#232F3E] flex items-center justify-center relative">
            <Bot className={`w-10 h-10 transition-colors duration-300 ${isSpeaking ? 'text-[#FF9900]' : 'text-white'}`} />
            {isSpeaking && (
              <span className="absolute bottom-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9900] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9900]"></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/30">
          {stageTitle}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#232F3E] text-white">
          {category}
        </span>
      </div>

      {/* Voice prompt / status */}
      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {isSpeaking ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#FF9900] animate-pulse" />
              <span className="text-slate-900 dark:text-white font-bold">AI Interviewer Speaking...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Ready for your answer</span>
            </>
          )}
        </div>

        {onReplayAudio && (
          <button
            onClick={onReplayAudio}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#FF9900] transition-colors"
            title="Replay question audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Question prompt typography */}
      <h2 className="text-xl sm:text-2xl font-black text-[#232F3E] dark:text-white leading-relaxed max-w-2xl">
        &ldquo;{questionText}&rdquo;
      </h2>

    </div>
  );
}
