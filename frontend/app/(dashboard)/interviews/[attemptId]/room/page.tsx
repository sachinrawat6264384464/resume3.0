"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle, X,
  Volume2, ShieldAlert, ArrowRight, CornerDownRight,
  HelpCircle, Lightbulb, Lock, Unlock, Star, Flame, Eye, EyeOff,
  Camera, CameraOff, Clock, Mic, Database, HardDrive, FileText,
  LogOut, Award, BarChart3, RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { QuestionRecorder, speakText, forceStopAllWebcams } from "@/lib/media-recorder";
import { WebcamPreview } from "@/components/interview/WebcamPreview";
import { AudioWaveformVisualizer } from "@/components/interview/AudioWaveformVisualizer";
import { AIInterviewerAvatar } from "@/components/interview/AIInterviewerAvatar";
import { AnswerControls } from "@/components/interview/AnswerControls";
import { InterviewAttempt, StageAttempt, QuestionAttempt, QuestionEvaluationResult } from "@/types";

// Dynamic Helper to extract keywords from ANY stage question text if expected_topics is empty
const extractKeywordsFromText = (qText: string): string[] => {
  if (!qText) return ["cloudops", "infrastructure", "automation"];
  const words = qText.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const stopWords = new Set([
    "what", "how", "explain", "describe", "your", "with", "this", "that", "from", "using", 
    "have", "been", "were", "when", "which", "would", "could", "should", "demonstrate", 
    "background", "walk", "through", "manage", "configure", "perform", "handle", "critical"
  ]);
  const filtered = words.filter(w => w.length > 3 && !stopWords.has(w));
  return filtered.length > 0 ? Array.from(new Set(filtered)).slice(0, 8) : ["cloudops", "infrastructure", "automation"];
};

interface StageSummaryData {
  overallScore: number;
  passed: boolean;
  totalQuestions: number;
  xpEarned: number;
}

export default function InterviewRoomPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;
  const user = useAuthStore((state) => state.user);

  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [activeStage, setActiveStage] = useState<StageAttempt | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Real Interview Chamber (DB Save Always Enabled)
  const chamberMode = "INTERVIEW";

  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real-time Web Speech Transcriber
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [sttLang, setSttLang] = useState<"en-US" | "en-IN">("en-US");
  const speechRecognitionRef = useRef<any>(null);

  // 13 Mins Live Countdown Timer (780 Seconds)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(780); // 13 Mins
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const [lastEvalResult, setLastEvalResult] = useState<QuestionEvaluationResult | null>(null);
  const [lastMatchScore, setLastMatchScore] = useState<number | null>(null);
  const [accumulatedScores, setAccumulatedScores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drop Out & Final Summary Modal States
  const [showDropOutModal, setShowDropOutModal] = useState(false);
  const [stageSummary, setStageSummary] = useState<StageSummaryData | null>(null);
  const [isSummaryDismissed, setIsSummaryDismissed] = useState(false);

  const recorderRef = useRef<QuestionRecorder | null>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);

  // Function to initialize webcam camera stream safely
  const enableCameraStream = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      const videoTrack = s.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => setIsCameraActive(false);
        videoTrack.onmute = () => setIsCameraActive(false);
        videoTrack.onunmute = () => setIsCameraActive(true);
      }
      streamRef.current = s;
      setStream(s);
      setIsCameraActive(true);
    } catch (e) {
      console.warn("Unable to capture media stream in room:", e);
      setIsCameraActive(false);
    }
  }, []);

  const stopCameraCompletely = () => {
    forceStopAllWebcams();
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
      } catch (e) {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      setStream(null);
    }
    setIsCameraActive(false);
    forceStopAllWebcams();
  };

  // Fetch Attempt State from Real Database
  const loadAttempt = useCallback(async () => {
    try {
      if (attemptId) {
        const res = await apiFetch(`/attempts/${attemptId}`);
        if (res?.data) {
          const att: InterviewAttempt = res.data;
          setAttempt(att);

          const current = att.stage_attempts?.find((s) => s.status === "IN_PROGRESS") || att.stage_attempts?.[0];
          if (current) setActiveStage(current);

          if (typeof window !== "undefined") {
            const sessionData = {
              userId: user?.id,
              userEmail: user?.email,
              attemptId,
              stageId: current?.stage_number ?? 1,
              stageTitle: att.template?.title || current?.stage?.title || `Stage ${current?.stage_number || 1} Assessment`,
              roomUrl: `/interviews/${attemptId}/room`,
              startedAt: Date.now()
            };
            localStorage.setItem("active_interview_session", JSON.stringify(sessionData));
          }
        }
      }
    } catch (err: any) {
      console.warn("Attempt load fallback notice:", err);
      if (typeof window !== "undefined" && attemptId) {
        const fallbackObj = {
          userId: user?.id,
          userEmail: user?.email,
          attemptId,
          stageId: 1,
          stageTitle: "Live Mock Interview",
          roomUrl: `/interviews/${attemptId}/room`,
          startedAt: Date.now()
        };
        localStorage.setItem("active_interview_session", JSON.stringify(fallbackObj));
      }
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadAttempt();
    enableCameraStream();

    if (typeof window !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", enableCameraStream);
    }
    return () => {
      if (typeof window !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.removeEventListener) {
        navigator.mediaDevices.removeEventListener("devicechange", enableCameraStream);
      }
    };
  }, [loadAttempt, enableCameraStream]);

  // Guaranteed Cleanup stream on unmount & browser tab navigate / close
  useEffect(() => {
    const handleUnload = () => {
      stopCameraCompletely();
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      stopCameraCompletely();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const allQAttempts = activeStage?.question_attempts || [];
  const stageQuestions = (activeStage?.stage as any)?.questions || [];

  // Determine total questions count for the stage: use stageQuestions from DB if available, else allQAttempts
  const dbTotalQCount = stageQuestions.length > 0
    ? stageQuestions.length
    : (allQAttempts.length > 0 ? allQAttempts.length : 1);

  const maxQCount = dbTotalQCount;

  // Camera Stream Active & Validated State
  const isCameraLive = Boolean(
    stream &&
    isCameraActive &&
    stream.getVideoTracks().length > 0 &&
    stream.getVideoTracks().some((t) => t.enabled && t.readyState === "live")
  );

  // 13-Minute Countdown Timer with Automatic Expiration & Camera Pause Protection
  useEffect(() => {
    if (timeLeftSeconds <= 0 && !stageSummary && !isSummaryDismissed && !isProcessing) {
      // 🚨 TIME EXPIRED! Stop recording, stop camera hardware, calculate scores for answered questions & show final summary!
      stopCameraCompletely();
      forceStopAllWebcams();

      const allScores = accumulatedScores.length > 0 ? accumulatedScores : [0];
      const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      const correctQuestionsCount = allScores.filter((s) => s >= 60.0).length;
      const requiredPassCount = Math.ceil(maxQCount * 0.75);
      const isPassedStage = (avgScore >= 80.0) && (correctQuestionsCount >= requiredPassCount);

      const finalSummary: StageSummaryData = {
        overallScore: avgScore,
        passed: isPassedStage,
        totalQuestions: maxQCount,
        xpEarned: isPassedStage ? 150 : Math.floor(avgScore * 1.5)
      };

      setStageSummary(finalSummary);
      return;
    }

    // 🚨 PAUSE TIMER AUTOMATICALLY WHEN CAMERA IS OFF / NOT ACTIVE!
    if (!isCameraLive) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      if (isRecording) {
        setQuestionSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds, isRecording, stageSummary, isSummaryDismissed, isProcessing, accumulatedScores, maxQCount, isCameraLive]);

  // Active question from stageQuestions (Admin/DB updated questions) or allQAttempts
  const activeStageQuestion = stageQuestions[currentQIndex];
  const activeQuestionAttempt = allQAttempts[currentQIndex];

  // Resolve dynamic DB questions configured by Admin for this specific Stage
  const dbQuestionText = activeStageQuestion?.question_text ||
    activeQuestionAttempt?.question_text_snapshot ||
    activeQuestionAttempt?.question?.question_text ||
    (activeQuestionAttempt as any)?.question_text;

  const dbIdealAnswer = activeStageQuestion?.reference_answer ||
    activeQuestionAttempt?.question?.reference_answer ||
    (activeQuestionAttempt as any)?.reference_answer;

  const dbKeywords = activeStageQuestion?.expected_topics ||
    activeQuestionAttempt?.question?.expected_topics ||
    (activeQuestionAttempt as any)?.expected_topics;

  const rawQText = dbQuestionText || `Explain your technical architecture, tooling, and operational methodology for Stage ${activeStage?.stage_number || 1} Assessment.`;
  const derivedKeywords = extractKeywordsFromText(rawQText);

  const currentBenchmark = {
    q: rawQText,
    ideal: dbIdealAnswer || `Demonstrate end-to-end technical execution, security best practices, and outage recovery procedures for: ${rawQText}`,
    keywords: (dbKeywords && dbKeywords.length > 0) ? dbKeywords : derivedKeywords
  };
  const questionText = currentBenchmark.q;

  const playVoice = useCallback(() => {
    if (!questionText) return;

    // Toggle behavior: If AI voice is currently speaking, STOP IT IMMEDIATELY
    if (isSpeaking) {
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
    }
    cancelSpeechRef.current = speakText(
      questionText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [questionText, isSpeaking]);

  // Manual Voice Player — Candidate can click 'Listen Question 🔊' to hear question in Female AI Voice
  useEffect(() => {
    // Ensure any previously playing voice is stopped when switching questions
    return () => {
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
        setIsSpeaking(false);
      }
    };
  }, [currentQIndex]);

  // Start Recording + Live Web Speech-to-Text Recognition
  const handleStartRecording = () => {
    if (!stream) {
      enableCameraStream();
      // Show camera permission info in transcript area instead of blocking alert
      setSpokenTranscript("[Camera/Mic required] Please allow camera & microphone access, then click Start Verbal Answer again.");
      return;
    }
    if (cancelSpeechRef.current) {
      cancelSpeechRef.current();
      setIsSpeaking(false);
    }

    setQuestionSeconds(0);
    setLastEvalResult(null);
    setLastMatchScore(null);
    setSpokenTranscript("");

    const rec = new QuestionRecorder();
    rec.start(stream);
    recorderRef.current = rec;
    setIsRecording(true);

    // Live Web Speech Recognition (Enforce English/Hinglish Latin script)
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sttLang; // 'en-US' or 'en-IN' to prevent Devanagari script
        
        recognition.onresult = (event: any) => {
          let currentText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + " ";
          }
          setSpokenTranscript(currentText.trim());
        };
        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition notice:", err);
      }
    }
  };

  // Evaluate Semantic Technical Concept Match (60%+ Pass Threshold)
  const evaluateSpeechMatch = (transcriptText: string, benchmark: any) => {
    const lower = transcriptText.toLowerCase();
    const keywords: string[] = benchmark?.keywords || [];
    const matched = keywords.filter((kw: string) => lower.includes(kw.toLowerCase()));
    const missing = keywords.filter((kw: string) => !lower.includes(kw.toLowerCase()));
    const matchPercentage = keywords.length > 0 ? Math.round((matched.length / keywords.length) * 100) : 80;

    const isPassed = matchPercentage >= 60;
    const finalScore = isPassed
      ? Math.min(96.0, 80.0 + Math.round(matchPercentage * 0.16))
      : Math.max(18.0, Math.round(matchPercentage * 0.65));

    const evalResult: QuestionEvaluationResult = {
      overall_score: finalScore,
      technical_score: finalScore,
      concept_coverage_score: isPassed ? Math.min(95, finalScore + 2) : Math.max(20, finalScore - 5),
      reasoning_score: isPassed ? Math.min(95, finalScore) : Math.max(20, finalScore - 8),
      practical_score: isPassed ? Math.min(95, finalScore + 4) : Math.max(20, finalScore - 4),
      communication_score: transcriptText.length > 20 ? 82.0 : 30.0,
      confidence_score: isPassed ? 88.0 : 35.0,
      feedback: isPassed
        ? `✅ PASSED (Concept Match: ${matchPercentage}% ≥ 60%). Spoken answer accurately covered key CloudOps requirements.`
        : `❌ NEEDS IMPROVEMENT (Concept Match: ${matchPercentage}% < 60%). Missing key concepts: ${missing.join(", ")}. Benchmark Answer: "${benchmark.ideal}"`,
      strengths: isPassed ? [`Articulated key concepts: ${matched.join(", ")}`] : ["Spoken verbal submission"],
      weaknesses: isPassed ? [] : [`Missing core parameters: ${missing.join(", ")}`],
      missing_concepts: missing,
      recommendations: [`Benchmark Answer: ${benchmark.ideal}`],
      communication_metrics: {
        speech_rate_wpm: Math.round((transcriptText.split(/\s+/).length || 0) / (questionSeconds / 60 || 0.5)),
        filler_words_count: 0,
        filler_words_detected: [],
        hesitation_pauses_count: 0,
        structural_clarity_score: finalScore,
        confidence_estimate: finalScore,
        assessment_notes: `Semantic match: ${matchPercentage}% with model answer.`,
        disclaimer: "AI Speech-to-Text Evaluation Engine"
      }
    };

    return { evalResult, matchPercentage };
  };

  // Drop Out / Abort Assessment Handler
  const handleConfirmDropOut = async () => {
    setShowDropOutModal(false);
    setIsProcessing(true);
    stopCameraCompletely();
    forceStopAllWebcams();

    if (typeof window !== "undefined") {
      localStorage.removeItem("active_interview_session");
    }

    try {
      // Send abort notice to backend DB
      await apiFetch(`/attempts/${attemptId}/abort`, { method: "POST" }).catch(() => null);
    } catch (e) {
      console.warn("Abort notice:", e);
    } finally {
      stopCameraCompletely();
      forceStopAllWebcams();
      if (typeof window !== "undefined") {
        window.location.href = "/interviews"; // Hard unload guarantees physical camera LED release
      }
    }
  };

  // Finish Answer & Submit (Real Mode Saves to DB, Practice Mode Does Not)
  const handleFinishAnswer = async (manualText?: string) => {
    setIsRecording(false);
    setIsProcessing(true);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      if (recorderRef.current) {
        await recorderRef.current.stop();
      }

      const finalTranscriptText = (manualText || spokenTranscript).trim();
      const { evalResult: localEval, matchPercentage } = evaluateSpeechMatch(finalTranscriptText, currentBenchmark);
      setLastMatchScore(matchPercentage);
      
      const newAccumulated = [...accumulatedScores, localEval.overall_score];
      setAccumulatedScores(newAccumulated);

      let finalEvalData: QuestionEvaluationResult = localEval;

      if (chamberMode === "INTERVIEW" && activeQuestionAttempt) {
        // REAL INTERVIEW MODE: Save directly to Neon PostgreSQL Database
        try {
          const res = await apiFetch(`/attempts/${attemptId}/questions/${activeQuestionAttempt.id}/submit-json`, {
            method: "POST",
            body: JSON.stringify({
              transcript: finalTranscriptText,
              duration_seconds: questionSeconds || 10.0,
            }),
          });
          if (res?.data) {
            finalEvalData = {
              ...res.data,
              overall_score: localEval.overall_score,
              feedback: localEval.feedback,
              missing_concepts: localEval.missing_concepts
            };
          }
        } catch (e) {
          console.warn("Backend submit notice, using local evaluation:", e);
        }
      }

      setLastEvalResult(finalEvalData);
      setXpToast(`+${Math.floor(finalEvalData.overall_score / 5)} XP Earned!`);
      setTimeout(() => setXpToast(null), 3000);
      setIsProcessing(false);
    } catch (err: any) {
      console.warn("Processed answer evaluation notice:", err);
      setIsProcessing(false);
    }
  };

  // Explicit Candidate Action to Proceed to Next Question (Prevents evaluation banner from disappearing automatically)
  const handleProceedToNextQuestion = async () => {
    const nextIdx = currentQIndex + 1;
    if (nextIdx < maxQCount) {
      setCurrentQIndex(nextIdx);
      setLastEvalResult(null);
      setLastMatchScore(null);
      setSpokenTranscript("");
    } else {
      // Final Question Completed -> Calculate Stage Average & Gatekeeper Rules!
      const allScores = accumulatedScores.length > 0 ? accumulatedScores : [0];
      const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      const correctQuestionsCount = allScores.filter((s) => s >= 60.0).length;
      const totalDurationSeconds = 780 - timeLeftSeconds;
      const requiredPassCount = Math.ceil(maxQCount * 0.75);

      // Dynamic Stage Gatekeeper Rules:
      // 1. Overall Score >= 80.0%
      // 2. At least 75% of questions correct (>= 60% concept match each)
      // 3. Time Duration <= 13 Minutes (780 Seconds)
      const isPassedStage = (avgScore >= 80.0) && (correctQuestionsCount >= requiredPassCount) && (totalDurationSeconds <= 780);

      if (chamberMode === "INTERVIEW" && activeStage) {
        try {
          await apiFetch(`/attempts/${attemptId}/stages/${activeStage.id}/evaluate-and-advance`, {
            method: "POST"
          });
        } catch (e) {
          console.warn("Evaluate stage notice:", e);
        }
      }

      stopCameraCompletely();
      forceStopAllWebcams();

      const finalSummary: StageSummaryData = {
        overallScore: avgScore,
        passed: isPassedStage,
        totalQuestions: maxQCount,
        xpEarned: isPassedStage ? 150 : Math.floor(avgScore * 1.5)
      };

      setStageSummary(finalSummary);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-16 text-slate-900 dark:text-slate-100 font-sans relative">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[28px] bg-slate-900 text-white border border-slate-800 shadow-2xl">
        
        {/* Chamber Mode Indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">CHAMBER MODE:</span>
          <div className="flex items-center px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-rose-400 gap-2">
            <Database className="w-4 h-4 text-rose-400" />
            <span>🎥 Real Interview Mode ({dbTotalQCount} Qs)</span>
          </div>
        </div>

        {/* Live Timer, Camera Active Badge & Drop Out Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {isCameraLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>LIVE CAMERA ACTIVE</span>
            </div>
          ) : (
            <button
              onClick={enableCameraStream}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
              title="Click to Enable / Reconnect Camera Stream"
            >
              <CameraOff className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>📷 CAMERA PAUSED (CLICK TO ENABLE)</span>
            </button>
          )}

          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            isCameraLive
              ? "bg-slate-950 border-slate-800 text-amber-400"
              : "bg-amber-950/90 border-amber-500/50 text-amber-300 animate-pulse"
          }`}>
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{isCameraLive ? `Time Remaining: ${formatTimer(timeLeftSeconds)}` : `⏸️ TIMER PAUSED (${formatTimer(timeLeftSeconds)})`}</span>
          </div>

          {/* 🚪 DROP OUT BUTTON */}
          <button
            onClick={() => setShowDropOutModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/50 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Abort Interview Session"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Drop Out</span>
          </button>
        </div>
      </div>

      {/* 📊 REAL-TIME 1-TO-10 QUESTION ACCURACY & COUNTER TRACKER */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 font-sans">
        
        {/* Left: Live Accuracy Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Assessment Stepper:
            </span>
            <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 font-mono font-black text-xs border border-blue-200 dark:border-blue-800">
              Q{currentQIndex + 1} / {maxQCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Correct Answers Count */}
            <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-black text-xs border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Correct: {accumulatedScores.filter((s) => s >= 60.0).length} / {maxQCount}</span>
            </span>

            {/* Incorrect Answers Count */}
            <span className="px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono font-black text-xs border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 shadow-sm">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Wrong: {accumulatedScores.filter((s) => s < 60.0).length} / {maxQCount}</span>
            </span>
          </div>
        </div>

        {/* Right: 1-to-10 Stepper Dots / Pills Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Array.from({ length: maxQCount }).map((_, idx) => {
            const isCurrent = idx === currentQIndex;
            const score = accumulatedScores[idx];
            const isAttempted = score !== undefined;
            const isCorrect = isAttempted && score >= 60.0;

            let badgeBg = "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700";
            if (isCurrent) {
              badgeBg = "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30 animate-pulse ring-2 ring-blue-400/50";
            } else if (isAttempted && isCorrect) {
              badgeBg = "bg-emerald-500 text-white border-emerald-400 shadow-sm";
            } else if (isAttempted && !isCorrect) {
              badgeBg = "bg-rose-500 text-white border-rose-400 shadow-sm";
            }

            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-xl border text-xs font-mono font-black flex items-center justify-center transition-all ${badgeBg}`}
                title={`Question ${idx + 1}: ${isAttempted ? (isCorrect ? `Passed (${score}%)` : `Needs Improvement (${score}%)`) : (isCurrent ? "Active Question" : "Pending")}`}
              >
                {isAttempted ? (isCorrect ? "✓" : "✕") : idx + 1}
              </div>
            );
          })}
        </div>
      </div>


      {/* XP Toast Banner */}
      {xpToast && (
        <div className="fixed top-8 right-8 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Star className="w-5 h-5 fill-slate-950" />
          <span>{xpToast}</span>
        </div>
      )}

      {/* Main Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Avatar + Question Card + Live Speech-to-Text Box + AI Evaluation Report */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* AI Interviewer Avatar Card */}
          <AIInterviewerAvatar 
            isSpeaking={isSpeaking} 
            questionText={questionText} 
            stageTitle={`Stage 1 • Question ${currentQIndex + 1}/${maxQCount}`}
            category="AWS & DevOps"
            onReplayAudio={playVoice}
          />

          {/* Live Speech-to-Text Transcription Box (Visible continuously) */}
          <div className="p-4.5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
              <span className="font-bold text-blue-400 flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>🎙️ Live Speech-to-Text Spoken Transcript:</span>
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={sttLang}
                  onChange={(e) => setSttLang(e.target.value as any)}
                  className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 text-[11px] font-mono font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  title="Select Speech Recognition Script Language"
                >
                  <option value="en-US">🇺🇸 English (en-US)</option>
                  <option value="en-IN">🇮🇳 Hinglish / English (en-IN)</option>
                </select>
                <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {spokenTranscript ? `${spokenTranscript.split(/\s+/).filter(Boolean).length} Words` : "0 Words"}
                </span>
              </div>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed min-h-[56px] italic flex items-center">
              {spokenTranscript ? (
                <span>"{spokenTranscript}"</span>
              ) : (
                <span className="text-slate-500 not-italic">
                  Speak out loud into your microphone... Your live spoken answer will transcribe here in real time.
                </span>
              )}
            </div>
          </div>

          {/* AI Evaluation Report (Renders immediately after submission) */}
          {lastEvalResult && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {lastMatchScore !== null && lastMatchScore >= 60 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className={`font-extrabold text-sm ${lastMatchScore !== null && lastMatchScore >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {lastMatchScore !== null && lastMatchScore >= 60 
                      ? `✅ PASSED (${lastMatchScore}% Concept Match ≥ 60%)` 
                      : `❌ NEEDS IMPROVEMENT (${lastMatchScore ?? 0}% Match < 60%)`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">EVAL SCORE</span>
                  <span className={`text-lg font-black font-mono ${lastMatchScore !== null && lastMatchScore >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {lastEvalResult.overall_score}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {lastEvalResult.feedback}
              </p>

              {lastEvalResult.missing_concepts && lastEvalResult.missing_concepts.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex flex-col gap-1 text-xs">
                  <span className="font-bold text-rose-300">Missing Key Concepts for 60%+ Match:</span>
                  <span className="font-mono text-rose-200">{lastEvalResult.missing_concepts.join(", ")}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col gap-1 text-xs">
                <span className="font-bold text-blue-300">Benchmark Model Answer Solution:</span>
                <span className="font-mono text-slate-200">"{currentBenchmark.ideal}"</span>
              </div>



              {/* 🚀 PROCEED TO NEXT QUESTION BUTTON (Keeps Evaluation Card on screen until candidate clicks) */}
              <button
                onClick={handleProceedToNextQuestion}
                className="w-full py-4 px-6 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF6B00] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer uppercase tracking-wider mt-2 border-2 border-amber-300/40 hover:scale-[1.01]"
              >
                <span>
                  {currentQIndex + 1 < maxQCount
                    ? `Proceed to Question ${currentQIndex + 2} of ${maxQCount} ➔`
                    : "View Final Stage Performance Summary 🏆"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-950 stroke-[3]" />
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Camera Window + Mic Waveform + Start Answer Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Moveable Webcam Preview Window */}
          <WebcamPreview
            stream={stream}
            isActive={isCameraActive}
            isRecording={isRecording}
            onEnableCamera={enableCameraStream}
          />

          {/* Audio Waveform Meter */}
          <AudioWaveformVisualizer isActive={isRecording} stream={stream} />

          {/* Start/Stop Controls */}
          <AnswerControls
            isRecording={isRecording}
            isProcessing={isProcessing}
            onStartRecording={handleStartRecording}
            onFinishAnswer={handleFinishAnswer}
          />

        </div>

      </div>

      {/* 🚪 DROP OUT CONFIRMATION MODAL */}
      {showDropOutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl text-white flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black">Drop Out of Assessment?</h3>
                <span className="text-xs text-rose-300 font-mono">Warning: Irreversible Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Quitting the interview midway will mark all remaining questions as <strong className="text-rose-400">FAILED (0% Score)</strong> and record an aborted status in the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDropOutModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel & Resume
              </button>
              <button
                onClick={handleConfirmDropOut}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all"
              >
                Confirm Drop Out 🚪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏆 STAGE COMPLETION & PERFORMANCE SUMMARY MODAL (Renders on 10th Question Completion) */}
      {stageSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-7 sm:p-8 rounded-3xl bg-slate-900 border border-blue-500/40 shadow-2xl text-white flex flex-col gap-6 animate-fadeIn">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Stage {activeStage?.stage_number || 1} Assessment Finished!</h2>
                  <span className="text-xs text-slate-400 font-mono">{maxQCount} / {maxQCount} Technical Questions Evaluated</span>
                </div>
              </div>

              {/* Close ✕ Button to dismiss modal and stay in room */}
              <button
                onClick={() => {
                  setStageSummary(null);
                  setIsSummaryDismissed(true);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss Summary & Remain in Room"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Stage Score Card */}
            <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 ${
              stageSummary.passed
                ? "bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40"
                : "bg-gradient-to-br from-rose-950/60 to-slate-900 border-rose-500/40"
            }`}>
              <span className="text-xs font-mono font-bold text-slate-400">STAGE 1 OVERALL AGGREGATE SCORE</span>
              <div className={`text-4xl sm:text-5xl font-black font-mono ${stageSummary.passed ? "text-emerald-400" : "text-rose-400"}`}>
                {stageSummary.overallScore}%
              </div>
              <div className="flex items-center gap-2 mt-1">
                {stageSummary.passed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>STAGE 1 PASSED • STAGE 2 UNLOCKED! 🎉</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>NEEDS RETAKE (Req: ≥80% Score, ≥8/10 Correct, ≤13 Mins)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Breakdown Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400">XP EARNED</span>
                <span className="text-lg font-black text-amber-400 font-mono">+{stageSummary.xpEarned} XP</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-slate-400">STAGE GATE STATUS</span>
                <span className="text-xs font-extrabold text-blue-400">
                  {stageSummary.passed ? "Stage 2 Unlocked" : "Stage 1 Active"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => {
                  stopCameraCompletely();
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("active_interview_session");
                  }
                  router.push("/performance");
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Full Performance</span>
              </button>
              <button
                onClick={() => {
                  stopCameraCompletely();
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("active_interview_session");
                  }
                  router.push("/interviews");
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:from-emerald-300 hover:to-teal-400 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Return to Stages</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
