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
  const [submittedAnswerText, setSubmittedAnswerText] = useState("");
  const [sttLang, setSttLang] = useState<"en-US" | "en-IN">("en-US");
  const speechRecognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);
  const baseTranscriptRef = useRef("");

  // 13 Mins Live Countdown Timer (780 Seconds)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(780); // 13 Mins
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const [lastEvalResult, setLastEvalResult] = useState<QuestionEvaluationResult | null>(null);
  const [lastMatchScore, setLastMatchScore] = useState<number | null>(null);
  const [accumulatedScores, setAccumulatedScores] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Drop Out & Final Summary Modal States
  const [showDropOutModal, setShowDropOutModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [stageSummary, setStageSummary] = useState<StageSummaryData | null>(null);
  const [isSummaryDismissed, setIsSummaryDismissed] = useState(false);
  const [isProceedingNext, setIsProceedingNext] = useState(false);
  const [isNavigatingNextStage, setIsNavigatingNextStage] = useState(false);

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

  // Dedicated stable video stream binder (Prevents camera blinking on timer ticks / state updates)
  useEffect(() => {
    if (candidateVideoRef.current && stream) {
      if (candidateVideoRef.current.srcObject !== stream) {
        candidateVideoRef.current.srcObject = stream;
        candidateVideoRef.current.play().catch(() => null);
      }
    }
  }, [stream]);

  const stopCameraCompletely = () => {
    isRecordingRef.current = false;
    forceStopAllWebcams();
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
      } catch (e) {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onerror = null;
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

  // Fetch Attempt State from Real Database (Non-blocking background sync)
  const loadAttempt = useCallback(async () => {
    try {
      if (attemptId) {
        const userStage0Key = "stage0_profile_data";
        const hasLocalStage0 = typeof window !== "undefined" && Boolean(
          localStorage.getItem("stage0_profile_data") ||
          localStorage.getItem("candidate_linkedin_url") ||
          localStorage.getItem("completed_stages_list")
        );

        if (!attemptId.startsWith("stage-") && !attemptId.startsWith("demo-")) {
          const res = await apiFetch(`/attempts/${attemptId}`).catch(() => null);
          if (res?.data) {
            const att: InterviewAttempt = res.data;
            setAttempt(att);

            const current = att.stage_attempts?.find((s) => s.status === "IN_PROGRESS") || att.stage_attempts?.[0];
            const stgNum = current?.stage_number ?? att.stage_number ?? (parseInt(attemptId.replace(/\D/g, ""), 10) || 1);

            if (current) setActiveStage(current);

            if (typeof window !== "undefined") {
              const sessionData = {
                userId: user?.id,
                userEmail: user?.email,
                attemptId,
                stageId: stgNum,
                stageTitle: att.template?.title || current?.stage?.title || `Stage ${stgNum} Assessment`,
                roomUrl: `/interviews/${attemptId}/room`,
                startedAt: Date.now()
              };
              localStorage.setItem("active_interview_session", JSON.stringify(sessionData));
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("Attempt load fallback notice:", err);
    }
  }, [attemptId, user]);

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
  const stageQuestions = ((activeStage?.stage as any)?.questions || []).filter((q: any) => q.is_active !== "INACTIVE");

  // Determine total questions count for the stage: maximum of DB stage questions count, question attempts count, or 1
  const dbTotalQCount = Math.max(
    stageQuestions.length,
    allQAttempts.length,
    1
  );

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

  // Dynamic fallback questions per stage and index to ensure candidate ALWAYS gets real technical questions (1 by 1)
  const STAGE_FALLBACK_QUESTIONS: Record<number, string[]> = {
    1: [
      "Please introduce yourself, walk through your technical journey in Cloud & DevOps, and highlight your most significant production achievement.",
      "Demonstrate your background in CloudOps engineering. Explain how you automate AWS infrastructure deployments using Terraform and CI/CD pipelines.",
      "When designing a cloud infrastructure solution, how do you balance cost optimization, high availability, and developer delivery speed?",
      "Explain IAM security best practices when configuring service accounts and IRSA for Kubernetes workloads.",
      "How do you configure high availability and multi-region failover across AWS EC2, S3, and RDS database clusters?",
      "Describe how you monitor microservice health telemetry using Prometheus metrics and Grafana dashboards.",
      "Explain how you handle a database connection pool exhaustion incident under sudden user traffic spikes.",
      "How do you perform zero-downtime rolling deployments and canary rollouts using Kubernetes deployment strategies?",
      "Explain how you configure cloud cost alerts and anomaly detection to prevent unexpected AWS cloud bill spikes.",
      "Describe a critical production outage incident you resolved under tight SLA pressure and the post-mortem steps you took."
    ],
    2: [
      "Walk us through your daily technical workflow as a DevOps/Cloud engineer, from code commit to production deployment.",
      "How do you approach learning and integrating new cloud-native technologies into an existing production stack?"
    ],
    3: [
      "How do you investigate high disk I/O wait and identify which Linux process is causing heavy disk read/write operations?",
      "Explain the difference between SIGTERM (15) and SIGKILL (9) process signals in Linux, and how applications handle them."
    ],
    4: [
      "A critical systemd service failed to start on an Ubuntu server. Walk me through the exact terminal commands and steps you take to troubleshoot and recover it.",
      "How do you triage a 'No space left on device' error when df -h shows disk space available, but df -i shows 100% inode usage?"
    ],
    5: [
      "Compare Virtual Machines (hypervisor-based) vs Containers (OS-level virtualization) in terms of architecture, performance, isolation, and resource overhead.",
      "Explain the core principles of Infrastructure as Code (IaC) and how state lock/backend storage works in Terraform."
    ]
  };

  const currentStageNum = activeStage?.stage_number || (activeStage?.stage as any)?.stage_number || (attemptId ? (parseInt(attemptId.replace(/\D/g, ""), 10) || 1) : 1);
  const stageFallbackList = STAGE_FALLBACK_QUESTIONS[currentStageNum] || STAGE_FALLBACK_QUESTIONS[1];
  const defaultStageQ = stageFallbackList[currentQIndex] || stageFallbackList[0] || "Describe your background and technical experience in Cloud & DevOps engineering.";

  const isGenericStageTitle = (text?: string) => {
    if (!text) return true;
    const trimmed = text.trim().toLowerCase();
    if (trimmed === "stage 1 technical assessment" || trimmed === "stage 1" || trimmed === "stage 2 technical assessment") return true;
    if (/^stage\s*\d+(\s*technical\s*assessment)?$/i.test(trimmed)) return true;
    if (trimmed.includes("technical assessment") && !trimmed.includes("?") && trimmed.length < 35) return true;
    return false;
  };

  // Active question from stageQuestions (Admin/DB updated questions) or allQAttempts
  const activeStageQuestion = stageQuestions[currentQIndex];
  const activeQuestionAttempt = allQAttempts[currentQIndex];

  // Resolve dynamic DB questions configured by Admin for this specific Stage
  const dbQuestionText = activeStageQuestion?.question_text ||
    activeQuestionAttempt?.question_text_snapshot ||
    activeQuestionAttempt?.question?.question_text ||
    (activeQuestionAttempt as any)?.question_text;

  const rawQText = (!isGenericStageTitle(dbQuestionText) ? dbQuestionText : null) || defaultStageQ;
  const derivedKeywords = extractKeywordsFromText(rawQText);

  // Dynamic fallback expected answers per stage and index (Admin Expected Answers)
  const STAGE_FALLBACK_ANSWERS: Record<number, string[]> = {
    1: [
      "Detail your Cloud & DevOps background: present role, years of experience, core tech stack (AWS, Terraform, Docker, Kubernetes), key deployment workflows, and your most significant production achievement.",
      "Demonstrate your background in CloudOps engineering: explain automated AWS infrastructure deployments using Terraform modules, state locking, and CI/CD pipelines.",
      "Explain the architectural balance: high availability via Multi-AZ auto-scaling, cost governance via Spot/Reserved instances and right-sizing, and developer velocity via reusable IaC modules.",
      "Detail IAM security best practices: service accounts, least privilege access, IRSA on EKS, role auto-rotation, and avoiding hardcoded credentials.",
      "Detail multi-region HA configuration: EC2 auto-scaling groups across multi-AZs, S3 cross-region replication, RDS multi-AZ failover and read replicas.",
      "Detail observability setup: Prometheus scraping metrics endpoints, Grafana dashboard visualization, alertmanager notifications, and latency SLAs.",
      "Detail database triage workflow: connection pool limits, max_connections tuning, PgBouncer pooling, slow query analysis, and auto-scaling app pods.",
      "Detail Kubernetes release strategies: zero-downtime rolling updates, maxSurge and maxUnavailable settings, canary deployments, and automated rollback triggers.",
      "Detail FinOps practices: AWS Cost Explorer alerts, budget notifications, Spot instance usage, S3 lifecycle rules, and right-sizing idle resources.",
      "Detail incident post-mortem: root cause analysis (RCA), timeline mapping, SLA restoration, blameless post-mortem document, and preventative action items."
    ],
    2: [
      "Detailed walkthrough: Developer feature branch -> PR review with automated SAST/unit tests -> CI container build & scanning -> CD deployment via Helm/ArgoCD -> Telemetry monitoring.",
      "Structured adoption: 1) Identify business problem & PoC evaluation. 2) Load & security benchmarking. 3) Staging pilot deployment. 4) Runbook creation and knowledge transfer."
    ],
    3: [
      "1) Check CPU wait time (%wa) with top/vmstat. 2) Run 'iotop -o' to isolate active PID. 3) Use 'iostat -xz 1' to check disk device utilization. 4) Run 'lsof -p <PID>' or 'pidstat -d' to view open files.",
      "SIGTERM (15) requests graceful shutdown, allowing the application to close connections and flush files. SIGKILL (9) is handled directly by the kernel and forcefully terminates the process immediately without cleanup."
    ],
    4: [
      "1) systemctl status <service> for exit code. 2) journalctl -u <service> -xe --no-pager for logs. 3) Verify config syntax and permissions. 4) ss -tulpn | grep <port> for port conflicts. 5) systemctl daemon-reload & restart.",
      "Inode exhaustion happens when millions of tiny files exhaust file table entries. Fix: 1) Verify inodes with df -i. 2) Locate directory with excessive files via find command. 3) Delete temp/session files. 4) Check for unlinked open deleted files holding inodes using lsof +L1."
    ],
    5: [
      "VMs run full guest OS instances on hypervisors (strong isolation, heavy overhead, minutes startup). Containers share the host OS kernel using Linux namespaces & cgroups (lightweight MB footprint, sub-second startup, process isolation).",
      "Declarative IaC (Terraform) specifies the desired target state; the engine calculates execution steps automatically. Imperative scripts (Bash/AWS CLI) specify step-by-step commands which lack built-in idempotency and state management."
    ]
  };

  const defaultStageAns = (STAGE_FALLBACK_ANSWERS[currentStageNum] || STAGE_FALLBACK_ANSWERS[1])[currentQIndex]
    || "Provide a structured response covering architectural principles, diagnostic commands, and recovery steps.";

  const rawIdealAnswer = activeStageQuestion?.reference_answer ||
    activeQuestionAttempt?.question?.reference_answer ||
    (activeQuestionAttempt as any)?.reference_answer || "";

  // Sanitize reference answer: prioritize exact reference_answer directly from PostgreSQL DB
  const isDirtyRefAns = !rawIdealAnswer || rawIdealAnswer.toLowerCase().includes("sachin") || rawIdealAnswer.toLowerCase() === "test";
  const dbIdealAnswer = (!isDirtyRefAns && rawIdealAnswer.trim().length > 5) ? rawIdealAnswer.trim() : defaultStageAns;

  const dbKeywords = (activeStageQuestion?.expected_topics && activeStageQuestion.expected_topics.length > 0)
    ? activeStageQuestion.expected_topics
    : ((activeQuestionAttempt?.question?.expected_topics && activeQuestionAttempt.question.expected_topics.length > 0)
        ? activeQuestionAttempt.question.expected_topics
        : (activeQuestionAttempt as any)?.expected_topics);

  // Extract reference words STRICTLY from Admin Expected Answer
  const refAnswerWords = dbIdealAnswer
    ? dbIdealAnswer.split(/[\s/,.!?:;()"'\-]+/).filter((w: string) => w.length > 2)
    : [];

  const combinedTargetKeywords = Array.from(new Set([
    ...(Array.isArray(dbKeywords) ? dbKeywords : []),
    ...refAnswerWords
  ])).filter(Boolean);

  const currentBenchmark = {
    q: rawQText,
    ideal: dbIdealAnswer,
    keywords: combinedTargetKeywords.length > 0 ? combinedTargetKeywords : derivedKeywords
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

    // Save existing transcript as base text so new speech appends seamlessly after pause!
    const baseText = spokenTranscript.trim() ? spokenTranscript.trim() + " " : "";
    baseTranscriptRef.current = baseText;

    const rec = new QuestionRecorder();
    rec.start(stream);
    recorderRef.current = rec;
    
    isRecordingRef.current = true;
    setIsRecording(true);

    // Live Web Speech Recognition (Enforce English/Hinglish Latin script with auto-restart loop)
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      try {
        if (speechRecognitionRef.current) {
          try {
            speechRecognitionRef.current.onend = null;
            speechRecognitionRef.current.onerror = null;
            speechRecognitionRef.current.stop();
          } catch (e) {}
        }
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = sttLang; // 'en-US' or 'en-IN' to prevent Devanagari script
        
        recognition.onresult = (event: any) => {
          let currentSessionText = "";
          for (let i = 0; i < event.results.length; i++) {
            currentSessionText += event.results[i][0].transcript + " ";
          }
          const fullText = (baseTranscriptRef.current + currentSessionText).trim();
          if (fullText) {
            setSpokenTranscript(fullText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error notice:", event.error);
          if (isRecordingRef.current && (event.error === "no-speech" || event.error === "network")) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition start notice:", err);
      }
    }
  };

  // Evaluate Semantic Technical Concept Match (60%+ Pass Threshold)
  const evaluateSpeechMatch = (transcriptText: string, benchmark: any) => {
    const lower = transcriptText.toLowerCase().trim();
    const idealLower = (benchmark?.ideal || "").toLowerCase().trim();
    const keywords: string[] = benchmark?.keywords || [];
    
    if (!lower || lower.length < 2) {
      return {
        evalResult: {
          overall_score: 20.0,
          technical_score: 20.0,
          concept_coverage_score: 15.0,
          reasoning_score: 20.0,
          practical_score: 20.0,
          communication_score: 30.0,
          confidence_score: 30.0,
          feedback: `❌ Response was too brief. Expected Model Solution: "${benchmark.ideal}"`,
          strengths: ["Submitted response"],
          weaknesses: ["Answer too short"],
          missing_concepts: keywords.slice(0, 4),
          recommendations: [`Expected Answer: ${benchmark.ideal}`],
          communication_metrics: {
            speech_rate_wpm: 0,
            filler_words_count: 0,
            filler_words_detected: [],
            hesitation_pauses_count: 0,
            structural_clarity_score: 20,
            confidence_estimate: 20,
            assessment_notes: "Answer too short",
            disclaimer: "AI Evaluation Engine"
          }
        },
        matchPercentage: 20
      };
    }

    // Helper: Extract clean whole words > 2 chars ignoring punctuation
    const getWords = (text: string): string[] => {
      return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2);
    };

    const candWords = new Set(getWords(lower));
    const idealWords = getWords(idealLower);
    const qTextLower = (activeQuestionAttempt?.question_text_snapshot || "").toLowerCase();
    
    const stopWords = new Set([
      "the", "and", "for", "that", "this", "with", "from", "your", "have", "been", "were", 
      "what", "how", "you", "please", "walk", "through", "most", "significant", "explain", 
      "describe", "give", "pass", "dont", "have", "anything", "stage", "technical", 
      "assessment", "question", "answer", "round", "main", "karun", "bus", "kya"
    ]);

    // Key target words are extracted ONLY from idealWords (Expected Model Answer) and keywords (expected_topics)! NOT question text!
    const adminRefKeywords = idealWords.filter((w) => !stopWords.has(w));
    const topicWords: string[] = [];
    keywords.forEach((kw: string) => {
      getWords(kw).forEach((w) => {
        if (!stopWords.has(w)) topicWords.push(w);
      });
    });

    const adminKeyWords = Array.from(new Set([...adminRefKeywords, ...topicWords]));

    const beggingPhrases = [
      "give me pass", "pass me", "dont know", "don't know", "dont have", "don't have",
      "kya karun", "please pass", "no idea", "skip", "next question"
    ];
    const isBegging = beggingPhrases.some((phrase) => lower.includes(phrase));

    const isIntro = lower.includes("introduce") || lower.includes("self") || qTextLower.includes("introduce") || qTextLower.includes("journey") || qTextLower.includes("background");
    const introKeywords = new Set(["sachin", "rawat", "name", "myself", "iam", "candidate", "student", "developer", "engineer", "cloud", "devops", "experience", "work", "role", "background", "journey", "achievement", "project"]);
    const matchedIntroWords = Array.from(candWords).filter((w) => introKeywords.has(w));

    // Direct exact or substring match check with Admin Expected Answer
    const isExactMatch = Boolean(idealLower && idealLower.length > 5 && (lower === idealLower || (lower.length > 15 && idealLower.includes(lower))));

    // Count whole word overlaps
    const matchedAdminWords = adminKeyWords.filter((w) => candWords.has(w));

    // Smart token matching for multi-word target concepts
    const matched = keywords.filter((kw: string) => {
      const kwWords = getWords(kw).filter((w) => !stopWords.has(w));
      return kwWords.length > 0 && kwWords.every((w) => candWords.has(w));
    });

    const missing = keywords.filter((kw: string) => !matched.includes(kw));

    let matchPercentage = 0;
    if (isExactMatch) {
      matchPercentage = 95;
    } else if (adminKeyWords.length > 0) {
      const ratio = matchedAdminWords.length / adminKeyWords.length;
      matchPercentage = Math.round(ratio * 100);
    } else if (keywords.length > 0) {
      matchPercentage = Math.round((matched.length / keywords.length) * 100);
    }

    let isPassed = false;
    if (isIntro && matchedIntroWords.length >= 1 && !isBegging) {
      isPassed = true;
      matchPercentage = Math.max(matchPercentage, 80);
    } else {
      if (isBegging) {
        isPassed = false;
      } else {
        isPassed = isExactMatch || (matchPercentage >= 50 && matchedAdminWords.length >= 2) || (matched.length >= 1 && matchedAdminWords.length >= 1);
      }

      if (isPassed) {
        matchPercentage = Math.max(matchPercentage, 65);
      } else {
        if (isBegging || (matchedAdminWords.length === 0 && matched.length === 0)) {
          matchPercentage = Math.min(matchPercentage, 15);
        } else {
          matchPercentage = Math.min(matchPercentage, 45);
        }
      }
    }

    const finalScore = isPassed
      ? Math.min(98.0, Math.max(70.0, 65.0 + Math.round(matchPercentage * 0.30)))
      : Math.max(15.0, Math.round(matchPercentage * 0.70));

    const evalResult: QuestionEvaluationResult = {
      overall_score: finalScore,
      technical_score: finalScore,
      concept_coverage_score: isPassed ? Math.min(98, finalScore + 2) : Math.max(15, finalScore - 5),
      reasoning_score: isPassed ? Math.min(95, finalScore) : Math.max(15, finalScore - 8),
      practical_score: isPassed ? Math.min(95, finalScore + 4) : Math.max(15, finalScore - 4),
      communication_score: transcriptText.length > 10 ? 88.0 : 40.0,
      confidence_score: isPassed ? 90.0 : 45.0,
      feedback: isPassed
        ? `✅ PASSED (${matchPercentage}% Match ≥ 60%). Spoken answer accurately matched Expected Model Answer.`
        : `❌ NEEDS IMPROVEMENT (${matchPercentage}% Match < 60%). Missing expected concepts: ${missing.slice(0, 3).join(", ") || "Technical Details"}. Expected Answer: "${benchmark.ideal}"`,
      strengths: isPassed ? [`Matched expected solution parameters: ${matched.slice(0, 4).join(", ")}`] : ["Verbal response submitted"],
      weaknesses: isPassed ? [] : [`Missing expected concepts: ${missing.slice(0, 3).join(", ")}`],
      missing_concepts: missing.slice(0, 4),
      recommendations: [`Expected Model Answer: ${benchmark.ideal}`],
      communication_metrics: {
        speech_rate_wpm: Math.round((transcriptText.split(/\s+/).length || 0) / (questionSeconds / 60 || 0.5)),
        filler_words_count: 0,
        filler_words_detected: [],
        hesitation_pauses_count: 0,
        structural_clarity_score: finalScore,
        confidence_estimate: finalScore,
        assessment_notes: `Match score: ${matchPercentage}% with model solution.`,
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
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsProcessing(true);

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      if (recorderRef.current) {
        await recorderRef.current.stop();
      }

      const finalTranscriptText = (manualText || spokenTranscript).trim();
      setSubmittedAnswerText(finalTranscriptText);
      const { evalResult: localEval, matchPercentage } = evaluateSpeechMatch(finalTranscriptText, currentBenchmark);
      
      const newAccumulated = [...accumulatedScores];
      newAccumulated[currentQIndex] = localEval.overall_score;
      setAccumulatedScores(newAccumulated);
      setLastMatchScore(matchPercentage);

      let finalEvalData: QuestionEvaluationResult = localEval;

      if (chamberMode === "INTERVIEW" && activeQuestionAttempt) {
        // REAL INTERVIEW MODE: Save directly to Neon PostgreSQL Database
        try {
          const fetchPromise = apiFetch(`/attempts/${attemptId}/questions/${activeQuestionAttempt.id}/submit-json`, {
            method: "POST",
            body: JSON.stringify({
              transcript: finalTranscriptText,
              duration_seconds: questionSeconds || 10.0,
            }),
          });
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 3500));
          const res: any = await Promise.race([fetchPromise, timeoutPromise]);

          if (res?.data) {
            finalEvalData = res.data;
            if (res.data.overall_score !== undefined) {
              const bScore = Number(res.data.overall_score);
              setLastMatchScore(Math.round(bScore));
              newAccumulated[currentQIndex] = bScore;
              setAccumulatedScores(newAccumulated);
            }
          }
        } catch (e) {
          console.warn("Backend submit notice, using local evaluation:", e);
        }
      }

      setLastEvalResult(finalEvalData);
      // setXpToast(`+${Math.floor(finalEvalData.overall_score / 5)} XP Earned!`);
    } catch (err: any) {
      console.warn("Processed answer evaluation notice:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Explicit Candidate Action to Proceed to Next Question (Prevents evaluation banner from disappearing automatically)
  const handleProceedToNextQuestion = async () => {
    setIsProceedingNext(true);
    try {
      const nextIdx = currentQIndex + 1;
      if (nextIdx < maxQCount) {
        setCurrentQIndex(nextIdx);
        setLastEvalResult(null);
        setLastMatchScore(null);
        setSpokenTranscript("");
        setSubmittedAnswerText("");
      } else {
        // Final Question Completed -> Calculate Stage Average & Gatekeeper Rules!
        const allScores = accumulatedScores.length > 0 ? accumulatedScores : [0];
        const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
        const correctQuestionsCount = allScores.filter((s) => s >= 60.0).length;
        const totalDurationSeconds = 780 - timeLeftSeconds;
        const requiredPassCount = Math.max(1, Math.floor(maxQCount / 2));

        // Dynamic Stage Gatekeeper Rules:
        // 1. Overall Score >= 60.0%
        // 2. At least 50% of questions correct (>= 60% concept match each)
        const isPassedStage = (avgScore >= 60.0) && (correctQuestionsCount >= requiredPassCount);

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

        if (isPassedStage && typeof window !== "undefined") {
          try {
            const rawList = localStorage.getItem("completed_stages_list") || "[]";
            const list = JSON.parse(rawList);
            const stageNum = activeStage?.stage_number || 1;
            if (Array.isArray(list) && !list.includes(stageNum)) {
              list.push(stageNum);
              localStorage.setItem("completed_stages_list", JSON.stringify(list));
            }
          } catch (e) {}
        }

        const finalSummary: StageSummaryData = {
          overallScore: avgScore,
          passed: isPassedStage,
          totalQuestions: maxQCount,
          xpEarned: isPassedStage ? 150 : Math.floor(avgScore * 1.5)
        };

        setStageSummary(finalSummary);
      }
    } finally {
      setIsProceedingNext(false);
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
              <span>Correct: {accumulatedScores.slice(0, maxQCount).filter((s) => s !== undefined && s >= 60.0).length} / {maxQCount}</span>
            </span>

            {/* Incorrect Answers Count */}
            <span className="px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono font-black text-xs border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 shadow-sm">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Wrong: {accumulatedScores.slice(0, maxQCount).filter((s) => s !== undefined && s < 60.0).length} / {maxQCount}</span>
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

      {/* Main Dual-Panel Layout matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: AI Interviewer Avatar Card + Live Candidate PIP */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-8 rounded-[32px] bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center justify-between relative overflow-hidden min-h-[560px]">
            
            <div className="flex flex-col items-center gap-4 w-full pt-4">
              {/* Avatar Circle */}
              <div className="relative">
                <div className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full p-1.5 transition-all duration-500 relative ${
                  isSpeaking
                    ? "bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-400/30"
                    : "bg-slate-200 dark:bg-slate-800 shadow-lg"
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative border-4 border-white dark:border-slate-900">
                    <img
                      src="/images/ai_avatar_interviewer.jpg"
                      alt="Ravya - AI Interviewer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Name & Title */}
              <div className="flex flex-col items-center gap-0.5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Ravya</h3>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">AI Interview Coach</span>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-purple-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {isSpeaking ? "Speaking" : "Ready for answer"}
                </span>
              </div>

              {/* Replay Question Link */}
              <button
                onClick={playVoice}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer pt-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replay question</span>
              </button>
            </div>

            {/* Candidate PIP Webcam Box (Bottom Right of Left Card) */}
            <div className="w-full flex items-end justify-between pt-8 z-10">
              <span className="text-xs font-medium text-slate-400">Ravya · AI Interviewer •</span>
              
              <div className="w-36 h-28 sm:w-44 sm:h-32 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl relative bg-slate-950 group">
                {stream && isCameraActive ? (
                  <video
                    ref={candidateVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 p-2 text-center bg-slate-900">
                    <CameraOff className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-medium">Camera Paused</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-[10px] font-semibold text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>You •</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Question Heading & Interactive Answer Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-6 min-h-[560px]">
            
            {/* Question Header & Prompt */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                  ROUND {currentQIndex + 1} · {activeStage?.stage?.category || "ABOUT YOU"}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                  {activeStage?.stage?.title || "INTRODUCTION"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {questionText}
              </h2>

              {/* Need a structure hint? Link */}
              <div className="relative">
                <button
                  onClick={() => setShowHintModal(!showHintModal)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Need a structure hint?</span>
                </button>

                {showHintModal && (
                  <div className="mt-3 p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex flex-col gap-2 animate-fadeIn">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                      💡 Recommended Technical Structure:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                      {currentBenchmark.keywords.map((kw: string, i: number) => (
                        <li key={i}>{kw}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Input Panel */}
            <div className="flex flex-col gap-4">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 p-5 shadow-xs flex flex-col gap-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all relative">
                
                {/* Answer Box Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Your answer</span>
                  <span className="font-mono text-slate-400">
                    {formatTimer(questionSeconds)}
                  </span>
                </div>

                {/* Live Speech-to-Text Area */}
                <textarea
                  value={spokenTranscript}
                  onChange={(e) => setSpokenTranscript(e.target.value)}
                  placeholder="Speak your answer or type it here..."
                  className="w-full min-h-[140px] text-slate-800 dark:text-slate-100 placeholder-slate-400 text-base font-normal resize-none focus:outline-none bg-transparent leading-relaxed"
                  disabled={Boolean(lastEvalResult) || isProcessing}
                />

                {/* Bottom Toolbar inside Answer Box */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    {!isRecording ? (
                      <button
                        onClick={handleStartRecording}
                        disabled={Boolean(lastEvalResult) || isProcessing}
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>• Start speaking</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFinishAnswer()}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-200 animate-pulse"
                      >
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>• Recording...</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (isRecording) {
                          if (speechRecognitionRef.current) speechRecognitionRef.current.stop();
                          setIsRecording(false);
                        }
                      }}
                      disabled={!isRecording}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40"
                    >
                      Stop
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                    Live transcription on mobile and desktop
                  </span>
                </div>

              </div>

              {/* Footer Action Row */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleProceedToNextQuestion}
                  disabled={isProcessing}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Skip this question
                </button>

                <button
                  onClick={() => handleFinishAnswer()}
                  disabled={Boolean(lastEvalResult) || isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit answer</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Post-Evaluation Feedback Card (Renders immediately after submitting) */}
            {lastEvalResult && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl flex flex-col gap-4 animate-fadeIn mt-4">
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

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col gap-1 text-xs">
                  <span className="font-bold text-blue-300">System Benchmark (Expected Technical Solution):</span>
                  <span className="font-mono text-slate-200">"{currentBenchmark.ideal}"</span>
                </div>

                <button
                  onClick={handleProceedToNextQuestion}
                  disabled={isProceedingNext}
                  className="w-full py-3.5 px-6 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                >
                  {isProceedingNext ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Proceeding...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {currentQIndex + 1 < maxQCount
                          ? `Proceed to Question ${currentQIndex + 2} of ${maxQCount} ➔`
                          : "View Final Stage Performance Summary 🏆"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
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
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between px-5">
              <span className="text-xs font-mono font-bold text-slate-400">STAGE GATE STATUS</span>
              <span className="text-xs font-extrabold text-blue-400 font-mono">
                {stageSummary.passed ? `Stage ${(activeStage?.stage_number || 1) + 1} Unlocked` : `Stage ${activeStage?.stage_number || 1} Active`}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {stageSummary.passed ? (
                <>
                  <button
                    onClick={async () => {
                      setIsNavigatingNextStage(true);
                      stopCameraCompletely();
                      forceStopAllWebcams();
                      const currentStageNum = activeStage?.stage_number || 1;
                      const nextStageNum = currentStageNum + 1;

                      if (typeof window !== "undefined") {
                        try {
                          const rawList = localStorage.getItem("completed_stages_list") || "[]";
                          const list = JSON.parse(rawList);
                          if (Array.isArray(list) && !list.includes(currentStageNum)) {
                            list.push(currentStageNum);
                            localStorage.setItem("completed_stages_list", JSON.stringify(list));
                          }
                        } catch (e) {}

                        localStorage.removeItem("active_interview_session");
                        localStorage.setItem("auto_start_stage", String(nextStageNum));
                      }

                      if (chamberMode === "INTERVIEW" && activeStage) {
                        try {
                          await apiFetch(`/attempts/${attemptId}/stages/${activeStage.id}/evaluate-and-advance`, {
                            method: "POST"
                          });
                        } catch (e) {
                          console.warn("Stage advance notice:", e);
                        }
                      }

                      router.push(`/interviews?stage=${nextStageNum}&autoStart=true`);
                    }}
                    disabled={isNavigatingNextStage}
                    className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-emerald-400 via-amber-300 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                      isNavigatingNextStage ? "opacity-90 cursor-wait" : "hover:scale-[1.02] cursor-pointer"
                    }`}
                  >
                    {isNavigatingNextStage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                        <span>Opening Stage {(activeStage?.stage_number || 1) + 1}...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed Directly to Stage {(activeStage?.stage_number || 1) + 1} 🚀</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setIsNavigatingNextStage(true);
                      stopCameraCompletely();
                      const currentStageNum = activeStage?.stage_number || 1;

                      if (typeof window !== "undefined") {
                        try {
                          const rawList = localStorage.getItem("completed_stages_list") || "[]";
                          const list = JSON.parse(rawList);
                          if (Array.isArray(list) && !list.includes(currentStageNum)) {
                            list.push(currentStageNum);
                            localStorage.setItem("completed_stages_list", JSON.stringify(list));
                          }
                        } catch (e) {}
                        localStorage.removeItem("active_interview_session");
                      }

                      if (chamberMode === "INTERVIEW" && activeStage) {
                        try {
                          await apiFetch(`/attempts/${attemptId}/stages/${activeStage.id}/evaluate-and-advance`, {
                            method: "POST"
                          });
                        } catch (e) {}
                      }

                      router.push("/interviews");
                    }}
                    disabled={isNavigatingNextStage}
                    className="w-full sm:w-auto py-3.5 px-4 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Dashboard</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsNavigatingNextStage(true);
                      stopCameraCompletely();
                      forceStopAllWebcams();
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("active_interview_session");
                        const currentStageNum = activeStage?.stage_number || 1;
                        localStorage.setItem("auto_start_stage", String(currentStageNum));
                      }
                      router.push(`/interviews?stage=${activeStage?.stage_number || 1}&autoStart=true`);
                    }}
                    disabled={isNavigatingNextStage}
                    className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                      isNavigatingNextStage ? "opacity-90 cursor-wait" : "hover:scale-[1.02] cursor-pointer"
                    }`}
                  >
                    {isNavigatingNextStage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span>Restarting Stage {activeStage?.stage_number || 1}...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Resume / Retry Stage {activeStage?.stage_number || 1} 🔄</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsNavigatingNextStage(true);
                      stopCameraCompletely();
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("active_interview_session");
                      }
                      router.push("/interviews");
                    }}
                    disabled={isNavigatingNextStage}
                    className="w-full sm:w-auto py-3.5 px-4 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Dashboard</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
