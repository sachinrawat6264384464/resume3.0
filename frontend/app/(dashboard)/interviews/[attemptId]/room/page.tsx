"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Loader2, Sparkles, CheckCircle2, AlertTriangle, 
  Volume2, ShieldAlert, ArrowRight, CornerDownRight,
  HelpCircle, Lightbulb, Lock, Unlock, Star, Flame, Eye, EyeOff
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { QuestionRecorder, speakText } from "@/lib/media-recorder";
import { WebcamPreview } from "@/components/interview/WebcamPreview";
import { AudioWaveformVisualizer } from "@/components/interview/AudioWaveformVisualizer";
import { AIInterviewerAvatar } from "@/components/interview/AIInterviewerAvatar";
import { StageProgressTracker } from "@/components/interview/StageProgressTracker";
import { AnswerControls } from "@/components/interview/AnswerControls";
import { InterviewAttempt, StageAttempt, QuestionAttempt, QuestionEvaluationResult, QuestionHints } from "@/types";

export default function InterviewRoomPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [activeStage, setActiveStage] = useState<StageAttempt | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Chamber Mode: Practice vs Real Interview
  const [chamberMode, setChamberMode] = useState<"PRACTICE" | "INTERVIEW">("PRACTICE");
  const [hintLevelUnlocked, setHintLevelUnlocked] = useState<number>(0);
  const [hintsData, setHintsData] = useState<QuestionHints | null>(null);
  const [isHintsLoading, setIsHintsLoading] = useState(false);
  const [showHintDrawer, setShowHintDrawer] = useState(false);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const [lastEvalResult, setLastEvalResult] = useState<QuestionEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const recorderRef = useRef<QuestionRecorder | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // 1. Fetch Attempt State
  const loadAttempt = useCallback(async () => {
    try {
      const res = await apiFetch(`/attempts/${attemptId}`);
      const att: InterviewAttempt = res.data;
      setAttempt(att);

      // Find current active stage (first IN_PROGRESS stage, or first stage)
      const current = att.stage_attempts.find((s) => s.status === "IN_PROGRESS") || att.stage_attempts[0];
      setActiveStage(current);

      // Find first uncompleted question in active stage
      const qAttempts = current?.question_attempts || [];
      const firstPendingIdx = qAttempts.findIndex((q) => q.status === "PENDING" || !q.overall_score);
      setCurrentQIndex(firstPendingIdx >= 0 ? firstPendingIdx : 0);
    } catch (err: any) {
      alert(err.message || "Failed to load interview attempt");
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadAttempt();
  }, [loadAttempt]);

  // 2. Initialize Camera & Mic Stream
  useEffect(() => {
    let localStream: MediaStream | null = null;
    async function setupStream() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        localStream = s;
        setStream(s);
      } catch (e) {
        console.warn("Unable to capture media stream in room:", e);
      }
    }
    setupStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 3. Interview Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (isRecording) {
        setQuestionSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  // 4. Play Question Voice Audio when question changes
  const activeQuestionAttempt = activeStage?.question_attempts?.[currentQIndex];
  const questionText = activeQuestionAttempt?.question_text_snapshot || "Prepare your answer.";

  const playVoice = useCallback(() => {
    if (!questionText) return;
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
    }
    cancelSpeechRef.current = speakText(
      questionText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [questionText]);

  // Load Hints for active question
  useEffect(() => {
    setHintLevelUnlocked(0);
    setHintsData(null);

    async function fetchHints() {
      if (!activeQuestionAttempt?.question_id) return;
      setIsHintsLoading(true);
      try {
        const res = await apiFetch(`/questions/${activeQuestionAttempt.question_id}/hints`);
        setHintsData(res.data);
      } catch (e) {
        console.warn("Failed to fetch hints:", e);
      } finally {
        setIsHintsLoading(false);
      }
    }

    if (activeQuestionAttempt && !isLoading) {
      playVoice();
      fetchHints();
    }
    return () => {
      if (cancelSpeechRef.current) cancelSpeechRef.current();
    };
  }, [activeQuestionAttempt?.id, isLoading, playVoice]);

  // 5. Start Recording
  const handleStartRecording = () => {
    if (!stream) {
      alert("Camera/Microphone stream not active. Check device permissions.");
      return;
    }
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      setIsSpeaking(false);
    }

    setQuestionSeconds(0);
    setLastEvalResult(null);

    const rec = new QuestionRecorder();
    rec.start(stream);
    recorderRef.current = rec;
    setIsRecording(true);
  };

  // 6. Finish Answer & Submit for 5-Pillar AI Evaluation
  const handleFinishAnswer = async (manualText?: string) => {
    if (!activeQuestionAttempt) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      let recordedBlob: Blob | null = null;
      if (recorderRef.current) {
        recordedBlob = await recorderRef.current.stop();
      }

      let evalData: QuestionEvaluationResult;

      if (recordedBlob && recordedBlob.size > 0 && !manualText) {
        const formData = new FormData();
        formData.append("recording_file", recordedBlob, `q_att_${activeQuestionAttempt.id}.webm`);
        formData.append("duration_seconds", questionSeconds.toString());

        const res = await apiFetch(`/attempts/${attemptId}/questions/${activeQuestionAttempt.id}/submit-recording`, {
          method: "POST",
          body: formData,
        });
        evalData = res.data;
      } else {
        const res = await apiFetch(`/attempts/${attemptId}/questions/${activeQuestionAttempt.id}/submit-json`, {
          method: "POST",
          body: JSON.stringify({
            transcript: manualText || "Detailed answer explaining troubleshooting steps.",
            duration_seconds: questionSeconds || 30.0,
          }),
        });
        evalData = res.data;
      }

      setLastEvalResult(evalData);
      setXpToast("+10 XP Earned!");
      setTimeout(() => setXpToast(null), 3000);

      // Advance question or complete stage
      const qList = activeStage?.question_attempts || [];
      const nextIdx = currentQIndex + 1;

      setTimeout(async () => {
        if (nextIdx < qList.length) {
          setCurrentQIndex(nextIdx);
          setLastEvalResult(null);
          setIsProcessing(false);
        } else {
          // All questions in stage completed -> evaluate stage gate
          if (activeStage) {
            await apiFetch(`/attempts/${attemptId}/stages/${activeStage.id}/evaluate-and-advance`, {
              method: "POST",
            });
            router.push(`/interviews/${attemptId}/stage-result`);
          }
        }
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Failed to process answer evaluation");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const qAttempts = activeStage?.question_attempts || [];
  const currentQNumber = currentQIndex + 1;
  const totalQCount = qAttempts.length || 3;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-16">
      {/* Top Stage Tracker Bar */}
      {attempt && (
        <StageProgressTracker
          stages={attempt.stage_attempts || []}
          currentStageNumber={activeStage?.stage_number || 1}
          currentQuestionIndex={currentQIndex}
          totalQuestionsInStage={totalQCount}
          elapsedSeconds={elapsedSeconds}
        />
      )}

      {/* Mode Switcher & Hints Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Chamber Mode:</span>
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-white/5">
            <button
              onClick={() => setChamberMode("PRACTICE")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                chamberMode === "PRACTICE"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎯 Practice Mode
            </button>
            <button
              onClick={() => {
                setChamberMode("INTERVIEW");
                setShowHintDrawer(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                chamberMode === "INTERVIEW"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎥 Real Interview Mode
            </button>
          </div>
        </div>

        {/* Practice Mode Hint Trigger */}
        <div className="flex items-center gap-3">
          {chamberMode === "PRACTICE" ? (
            <button
              onClick={() => setShowHintDrawer(!showHintDrawer)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>💡 Need Help? (3 Hints Available)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Strict Pressure Mode (Hints Disabled)</span>
            </div>
          )}

          {/* XP Toast Notification */}
          {xpToast && (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold animate-bounce flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {xpToast}
            </span>
          )}
        </div>
      </div>

      {/* 3-Level Progressive Hint Drawer (If open) */}
      {showHintDrawer && chamberMode === "PRACTICE" && (
        <div className="p-6 rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-mono">Progressive Technical Hints</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Unlock gradually to build problem-solving intuition
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hint Level 1 */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">Level 1: Strategic Clue</span>
                  {hintLevelUnlocked >= 1 ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                </div>
                {hintLevelUnlocked >= 1 ? (
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {hintsData?.hint_level_1 || "Start by inspecting the Pod status, exit codes, and recent cluster events."}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">Click unlock for a gentle nudge on where to begin.</p>
                )}
              </div>

              {hintLevelUnlocked < 1 && (
                <button
                  onClick={() => setHintLevelUnlocked(1)}
                  className="w-full py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono"
                >
                  Unlock Clue 1
                </button>
              )}
            </div>

            {/* Hint Level 2 */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
              hintLevelUnlocked >= 1 ? "bg-slate-950/70 border-white/10" : "bg-slate-950/30 border-white/5 opacity-50"
            }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">Level 2: Commands & Tools</span>
                  {hintLevelUnlocked >= 2 ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                </div>
                {hintLevelUnlocked >= 2 ? (
                  <p className="text-xs text-cyan-200 leading-relaxed font-mono">
                    {hintsData?.hint_level_2 || "Run `kubectl describe pod` to inspect LastState and `kubectl logs --previous`."}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">Requires Level 1 unlock.</p>
                )}
              </div>

              {hintLevelUnlocked === 1 && (
                <button
                  onClick={() => setHintLevelUnlocked(2)}
                  className="w-full py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono"
                >
                  Unlock Commands 2
                </button>
              )}
            </div>

            {/* Hint Level 3 */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
              hintLevelUnlocked >= 2 ? "bg-slate-950/70 border-white/10" : "bg-slate-950/30 border-white/5 opacity-50"
            }`}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-300">Level 3: Deep Solution</span>
                  {hintLevelUnlocked >= 3 ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                </div>
                {hintLevelUnlocked >= 3 ? (
                  <p className="text-xs text-indigo-200 leading-relaxed font-sans">
                    {hintsData?.hint_level_3 || "Follow triage: Events -> OOMKilled vs App error -> Liveness probe -> Fix limits & rollout."}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">Requires Level 2 unlock.</p>
                )}
              </div>

              {hintLevelUnlocked === 2 && (
                <button
                  onClick={() => setHintLevelUnlocked(3)}
                  className="w-full py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono"
                >
                  Unlock Solution 3
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chamber Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Avatar & Question */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <AIInterviewerAvatar
            isSpeaking={isSpeaking}
            questionText={questionText}
            stageTitle={activeStage?.stage?.title || `Stage ${activeStage?.stage_number || 1}`}
            category={activeStage?.stage?.category || "Cloud & DevOps"}
            onReplayAudio={playVoice}
          />

          {/* Instant Evaluation Feedback Badge */}
          {lastEvalResult && (
            <div className="p-5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 backdrop-blur-md flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Answer Evaluated (+10 XP)</span>
                  <p className="text-[11px] text-indigo-200">{lastEvalResult.feedback}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Overall Score</span>
                <span className={`text-lg font-black font-mono ${lastEvalResult.overall_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {lastEvalResult.overall_score}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Webcam Stream, Mic Meter & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <WebcamPreview
            stream={stream}
            isActive={!!stream}
            isRecording={isRecording}
          />

          <AudioWaveformVisualizer
            stream={stream}
            isActive={!!stream}
          />

          <AnswerControls
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStartRecording={handleStartRecording}
            onFinishAnswer={handleFinishAnswer}
          />
        </div>
      </div>
    </div>
  );
}
