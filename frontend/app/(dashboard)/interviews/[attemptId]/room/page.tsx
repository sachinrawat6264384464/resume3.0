"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Loader2, Sparkles, CheckCircle2, AlertTriangle, XCircle,
  Volume2, ShieldAlert, ArrowRight, CornerDownRight,
  HelpCircle, Lightbulb, Lock, Unlock, Star, Flame, Eye, EyeOff,
  Camera, CameraOff, Clock, Mic, Database, HardDrive, FileText,
  LogOut, Award, BarChart3, RefreshCw
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { QuestionRecorder, speakText, forceStopAllWebcams } from "@/lib/media-recorder";
import { WebcamPreview } from "@/components/interview/WebcamPreview";
import { AudioWaveformVisualizer } from "@/components/interview/AudioWaveformVisualizer";
import { AIInterviewerAvatar } from "@/components/interview/AIInterviewerAvatar";
import { AnswerControls } from "@/components/interview/AnswerControls";
import { InterviewAttempt, StageAttempt, QuestionAttempt, QuestionEvaluationResult } from "@/types";

// 10 Official Stage 1 Benchmark Questions & 2-Line Model Answers
const STAGE_1_BENCHMARKS = [
  {
    q: "Demonstrate your background in CloudOps engineering. Explain how you automate AWS infrastructure deployments using Terraform and CI/CD pipelines.",
    ideal: "I write modular Terraform HCL code for AWS VPC, EC2, and IAM with S3 remote state. I automate deployments using GitHub Actions pipelines running terraform plan and terraform apply.",
    keywords: ["terraform", "aws", "vpc", "ci/cd", "pipeline", "s3", "github actions", "deploy"]
  },
  {
    q: "Walk us through your Linux system troubleshooting methodology when a production server exhibits high memory utilization or kernel panic errors.",
    ideal: "I check memory usage using top and free -m to identify leaking processes, then inspect dmesg and journalctl for kernel panic stack traces before restarting or scaling daemon services.",
    keywords: ["top", "free", "memory", "journalctl", "dmesg", "kernel panic", "process", "linux", "triage"]
  },
  {
    q: "How do you configure high availability and multi-region failover across AWS EC2, S3, and RDS database clusters?",
    ideal: "I deploy EC2 Auto Scaling Groups across Multi-AZs behind an ALB, with S3 Cross-Region Replication and RDS Aurora Global Databases for automated multi-region failover.",
    keywords: ["multi-az", "auto scaling", "alb", "load balancer", "s3 replication", "rds", "aurora", "failover", "aws"]
  },
  {
    q: "Explain IAM security best practices when configuring service accounts and IRSA for Kubernetes workloads.",
    ideal: "I enforce zero-trust principle of least privilege using IAM Roles for Service Accounts (IRSA) with OIDC on EKS. Pods assume temporary scoped AWS IAM credentials without static secret keys.",
    keywords: ["irsa", "iam", "oidc", "eks", "kubernetes", "least privilege", "service account", "zero-trust"]
  },
  {
    q: "How do you manage secrets and environment variables securely in Docker containerized microservice deployments?",
    ideal: "I fetch secrets at runtime from AWS Secrets Manager or HashiCorp Vault into container memory, mounting Kubernetes Secret objects as temporary in-memory volume files rather than baking them into Docker images.",
    keywords: ["secrets manager", "vault", "docker", "kubernetes secrets", "environment variables", "security", "microservices"]
  },
  {
    q: "Describe how you monitor microservice health telemetry using Prometheus metrics and Grafana dashboards.",
    ideal: "I configure Prometheus to scrape /metrics endpoints from microservices and Node Exporters. I build Grafana dashboard panels for CPU, RAM, and HTTP latency, setting Alertmanager triggers for threshold breaches.",
    keywords: ["prometheus", "grafana", "metrics", "alertmanager", "monitoring", "telemetry", "latency"]
  },
  {
    q: "Explain how you handle a database connection pool exhaustion incident under sudden user traffic spikes.",
    ideal: "I configure connection pooling proxies like PgBouncer and optimize database connection limits. Upstream, I introduce Redis caching to offload read queries from the primary RDS instance.",
    keywords: ["connection pool", "pgbouncer", "rds", "redis", "caching", "traffic spike", "timeout"]
  },
  {
    q: "How do you perform zero-downtime rolling deployments and canary rollouts using Kubernetes deployment strategies?",
    ideal: "I use Kubernetes Deployment rolling updates with MaxSurge and MaxUnavailable parameters alongside readiness probes. For canary releases, I shift traffic gradually using Argo Rollouts or Istio service mesh.",
    keywords: ["rolling update", "canary", "kubernetes", "argo rollouts", "istio", "readiness probe", "zero-downtime"]
  },
  {
    q: "Explain how you configure cloud cost alerts and anomaly detection to prevent unexpected AWS cloud bill spikes.",
    ideal: "I set up AWS Budgets with SNS notifications for threshold alerts. I enable AWS Cost Anomaly Detection to catch unattached EBS volumes or runaway EC2 instances automatically.",
    keywords: ["aws budgets", "sns", "cost anomaly detection", "finops", "ebs", "ec2", "cost"]
  },
  {
    q: "Describe a critical production outage incident you resolved under tight SLA pressure and the post-mortem steps you took.",
    ideal: "During a 502 Bad Gateway outage caused by pod OOMKills, I temporarily scaled pod memory limits to restore service within 6 minutes, followed by a root cause analysis and automated alert tuning.",
    keywords: ["502 bad gateway", "oomkill", "outage", "root cause analysis", "post-mortem", "sla", "autoscaling"]
  }
];

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

  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [activeStage, setActiveStage] = useState<StageAttempt | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Chamber Mode: Practice (3 Qs, No DB Save) vs Real Interview (10 Qs, DB Save)
  const [chamberMode, setChamberMode] = useState<"PRACTICE" | "INTERVIEW">("PRACTICE");
  const [showHintDrawer, setShowHintDrawer] = useState(false);

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
      streamRef.current = s;
      setStream(s);
      setIsCameraActive(true);
    } catch (e) {
      console.warn("Unable to capture media stream in room:", e);
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
        }
      }
    } catch (err: any) {
      console.warn("Attempt load fallback notice:", err);
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

  // Question Attempts Slicing (3 for Practice, 10 for Real Interview)
  const maxQCount = chamberMode === "PRACTICE" ? 3 : 10;

  // 13-Minute Countdown Timer with Automatic Expiration & Score Aggregation
  useEffect(() => {
    if (timeLeftSeconds <= 0 && !stageSummary && !isProcessing) {
      // 🚨 TIME EXPIRED! Stop recording, stop camera hardware, calculate scores for answered questions & show final summary!
      stopCameraCompletely();
      forceStopAllWebcams();

      const allScores = accumulatedScores.length > 0 ? accumulatedScores : [0];
      const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      const correctQuestionsCount = allScores.filter((s) => s >= 60.0).length;
      const isPassedStage = (avgScore >= 80.0) && (correctQuestionsCount >= 8);

      const finalSummary: StageSummaryData = {
        overallScore: avgScore,
        passed: isPassedStage,
        totalQuestions: maxQCount,
        xpEarned: isPassedStage ? 150 : Math.floor(avgScore * 1.5)
      };

      setStageSummary(finalSummary);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      if (isRecording) {
        setQuestionSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeftSeconds, isRecording, stageSummary, isProcessing, accumulatedScores, maxQCount]);

  const allQAttempts = activeStage?.question_attempts || [];
  const activeQuestionAttempt = allQAttempts[currentQIndex];

  const currentBenchmark = STAGE_1_BENCHMARKS[currentQIndex % STAGE_1_BENCHMARKS.length];
  const questionText = currentBenchmark.q;

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

  useEffect(() => {
    if (!isLoading) {
      playVoice();
    }
    return () => {
      if (cancelSpeechRef.current) cancelSpeechRef.current();
    };
  }, [currentQIndex, isLoading, playVoice]);

  // Start Recording + Live Web Speech-to-Text Recognition
  const handleStartRecording = () => {
    if (!stream) {
      enableCameraStream();
      alert("Requesting Camera & Microphone permissions. Please allow access and click Start Verbal Answer again.");
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
  const evaluateSpeechMatch = (transcriptText: string, benchmark: typeof STAGE_1_BENCHMARKS[0]) => {
    const lower = transcriptText.toLowerCase();
    const matched = benchmark.keywords.filter((kw) => lower.includes(kw.toLowerCase()));
    const missing = benchmark.keywords.filter((kw) => !lower.includes(kw.toLowerCase()));
    const matchPercentage = Math.round((matched.length / benchmark.keywords.length) * 100);

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

      const nextIdx = currentQIndex + 1;

      setTimeout(async () => {
        if (nextIdx < maxQCount) {
          setCurrentQIndex(nextIdx);
          setLastEvalResult(null);
          setLastMatchScore(null);
          setSpokenTranscript("");
          setIsProcessing(false);
        } else {
          // Final 10th Question Completed -> Calculate Stage Average & Strict Gatekeeper Math Rules!
          const avgScore = Math.round(newAccumulated.reduce((a, b) => a + b, 0) / newAccumulated.length);
          const correctQuestionsCount = newAccumulated.filter((s) => s >= 60.0).length;
          const totalDurationSeconds = 780 - timeLeftSeconds;

          // Strict Stage 1 Mathematical Gatekeeper Rules:
          // 1. Overall Score >= 80.0%
          // 2. At least 8/10 Questions Correct (>= 60% concept match each)
          // 3. Time Duration <= 13 Minutes (780 Seconds)
          const isPassedStage = (avgScore >= 80.0) && (correctQuestionsCount >= 8) && (totalDurationSeconds <= 780);

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
          setIsProcessing(false);
        }
      }, 1200);
    } catch (err: any) {
      console.warn("Processed answer evaluation notice:", err);
      setIsProcessing(false);
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
        
        {/* Chamber Mode Switcher (Index Preserved on Click) */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-400">CHAMBER MODE:</span>
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                setChamberMode("PRACTICE");
                setLastEvalResult(null);
                setLastMatchScore(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chamberMode === "PRACTICE"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎯 Practice Mode (3 Qs)
            </button>
            <button
              onClick={() => {
                setChamberMode("INTERVIEW");
                setShowHintDrawer(false);
                setLastEvalResult(null);
                setLastMatchScore(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chamberMode === "INTERVIEW"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎥 Real Interview Mode (10 Qs)
            </button>
          </div>
        </div>

        {/* Live Timer, Camera Active Badge & Drop Out Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>LIVE CAMERA ACTIVE</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time Remaining: {formatTimer(timeLeftSeconds)}</span>
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

      {/* Mode Banner Indicator */}
      <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm ${
        chamberMode === "PRACTICE"
          ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300"
          : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300"
      }`}>
        <div className="flex items-center gap-2">
          {chamberMode === "PRACTICE" ? (
            <>
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>🎯 PRACTICE MODE ACTIVE: 3 Sample Questions • AI Feedback & Model Answer Active • No Data Saved to DB</span>
            </>
          ) : (
            <>
              <Database className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>🎥 REAL INTERVIEW MODE ACTIVE: 10 Stage 1 Questions • 60%+ Semantic Match Threshold • Saved to PostgreSQL DB</span>
            </>
          )}
        </div>
        <span className="font-mono text-[11px] bg-white/60 dark:bg-slate-900/60 px-2.5 py-0.5 rounded-md border font-bold">
          {chamberMode === "PRACTICE" ? "PRACTICE RUN (3 Qs)" : "NEON DB SAVING (10 Qs)"}
        </span>
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

      {/* Benchmark Ideal Model Answer Drawer for Practice Mode */}
      {chamberMode === "PRACTICE" && showHintDrawer && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <Lightbulb className="w-4 h-4" />
            <span>2-Line Benchmark Ideal Model Solution:</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 font-mono text-xs text-amber-200 leading-relaxed">
            "{currentBenchmark.ideal}"
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-bold text-amber-400">Target Concept Keywords (Need ≥ 60% match):</span>
            <span className="font-mono text-slate-200">{currentBenchmark.keywords.join(", ")}</span>
          </div>
        </div>
      )}

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
                  <h2 className="text-xl font-black text-white">Stage 1 Assessment Finished!</h2>
                  <span className="text-xs text-slate-400 font-mono">10 / 10 Technical Questions Evaluated</span>
                </div>
              </div>
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
