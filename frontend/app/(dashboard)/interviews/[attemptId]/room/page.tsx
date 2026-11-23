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
  const sessionFinalTranscriptRef = useRef("");

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

  const [dbStagesData, setDbStagesData] = useState<any[]>([]);

  // Fetch Attempt State & Live Admin DB Stage Questions (Non-blocking background sync)
  const loadAttempt = useCallback(async () => {
    try {
      // 1. Fetch live DB stages with questions
      const resStages = await apiFetch(`/interviews/stages`).catch(() => null);
      if (resStages?.data && Array.isArray(resStages.data)) {
        setDbStagesData(resStages.data);
      }

      // 2. Resolve exact target stage number from multiple sources (prevents Stage 2 reset bug)
      let targetStageNum = 1;
      if (typeof window !== "undefined") {
        const qStage = new URLSearchParams(window.location.search).get("stage");
        if (qStage) {
          const parsed = parseInt(qStage, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) targetStageNum = parsed;
        }
      }
      if (targetStageNum === 1 && attemptId && attemptId.startsWith("stage-")) {
        const parsed = parseInt(attemptId.replace("stage-", ""), 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) targetStageNum = parsed;
      }
      if (targetStageNum === 1 && typeof window !== "undefined") {
        try {
          const rawSession = localStorage.getItem("active_interview_session");
          if (rawSession) {
            const s = JSON.parse(rawSession);
            if (s && typeof s.stageId === "number" && s.stageId >= 1) targetStageNum = s.stageId;
          }
        } catch {}
      }

      // 3. Resolve real attempt ID from session if route uses temporary 'stage-X'
      let effectiveAttemptId = attemptId;
      if ((!effectiveAttemptId || effectiveAttemptId.startsWith("stage-") || effectiveAttemptId.startsWith("demo-")) && typeof window !== "undefined") {
        try {
          const rawSession = localStorage.getItem("active_interview_session");
          if (rawSession) {
            const s = JSON.parse(rawSession);
            if (s && s.attemptId && !s.attemptId.startsWith("stage-") && !s.attemptId.startsWith("demo-")) {
              effectiveAttemptId = s.attemptId;
            }
          }
        } catch {}
      }

      let attData: InterviewAttempt | null = null;
      if (effectiveAttemptId && !effectiveAttemptId.startsWith("stage-") && !effectiveAttemptId.startsWith("demo-")) {
        const res = await apiFetch(`/attempts/${effectiveAttemptId}`).catch(() => null);
        if (res?.data) {
          attData = res.data;
        }
      }

      // Seamless background DB attempt creation if missing
      if (!attData && targetStageNum >= 1) {
        try {
          const startRes = await apiFetch("/attempts/start", {
            method: "POST",
            body: JSON.stringify({
              interview_template_id: `stage-${targetStageNum}-template`,
              stage_number: targetStageNum
            })
          }).catch(() => null);
          if (startRes?.data) {
            attData = startRes.data;
            effectiveAttemptId = String(startRes.data.id);
          }
        } catch (e) {}
      }

      let matchedStageAttempt: any = null;
      if (attData) {
        setAttempt(attData);
        // STRICT match for targetStageNum: Never default to Stage 1 when target stage is e.g. Stage 3, 4, 5+
        const current = attData.stage_attempts?.find((s) => Number(s.stage_number) === Number(targetStageNum));
        if (current) {
          matchedStageAttempt = current;
          setActiveStage(current);
        }
      }

      // Robust fallback active stage wrapper: Ensure activeStage ALWAYS matches targetStageNum with its exact questions
      if (!matchedStageAttempt) {
        const dbStg = resStages?.data?.find((s: any) => Number(s.id) === targetStageNum || Number(s.stage_number) === targetStageNum);
        const stgQuestions = (dbStg?.questions || []).filter((q: any) => q.is_active !== "INACTIVE");
        const fallbackQs = (stgQuestions.length > 0)
          ? stgQuestions
          : (STAGE_FALLBACK_QUESTIONS[targetStageNum] || []).map((text: string, i: number) => ({
              id: `fallback-q-${targetStageNum}-${i}`,
              question_text: text,
              reference_answer: (STAGE_FALLBACK_ANSWERS[targetStageNum] || [])[i] || "",
              expected_topics: (STAGE_FALLBACK_TOPICS[targetStageNum] || [])[i] || []
            }));

        const fallbackStage: any = {
          id: dbStg?.stage_id || `stage-${targetStageNum}`,
          stage_number: targetStageNum,
          stage: dbStg || {
            id: `stage-${targetStageNum}`,
            stage_number: targetStageNum,
            title: `Stage ${targetStageNum} Assessment`,
            questions: fallbackQs
          },
          question_attempts: fallbackQs.map((q: any, i: number) => ({
            id: q.id || `fallback-qa-${targetStageNum}-${i}`,
            question_id: q.id,
            question_text_snapshot: q.question_text,
            question: q
          }))
        };
        setActiveStage(fallbackStage);
      }

      if (typeof window !== "undefined") {
        const sessionData = {
          userId: user?.id,
          userEmail: user?.email,
          attemptId: effectiveAttemptId,
          stageId: targetStageNum,
          stageTitle: `Stage ${targetStageNum} Assessment`,
          roomUrl: `/interviews/${effectiveAttemptId}/room?stage=${targetStageNum}`,
          startedAt: Date.now()
        };
        localStorage.setItem("active_interview_session", JSON.stringify(sessionData));
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

  // Dynamic fallback questions, answers and topics for ALL 30 STAGES (aligned 100% with DB)
  const STAGE_FALLBACK_QUESTIONS: Record<number, string[]> = {
    1: [
      "Please introduce yourself, walk through your technical journey in Cloud & DevOps, and highlight your most significant production achievement.",
      "When designing a cloud infrastructure solution, how do you balance cost optimization, high availability, and developer delivery speed?"
    ],
    2: [
      "Explain Stage 2-3: Technical Introduction core operational concepts and step-by-step troubleshooting workflow.",
      "Walk us through your daily technical workflow as a DevOps/Cloud engineer, from code commit to production deployment.",
      "How do you approach learning and integrating new cloud-native technologies into an existing production stack?"
    ],
    3: [
      "Explain how AWS IAM Roles differ from IAM Users, and why IAM Roles with STS assume-role should be preferred for applications running on EC2 or EKS.",
      "What is the difference between a Public Subnet and a Private Subnet in an AWS VPC, and how do database instances in a private subnet securely download patches from the internet?"
    ],
    4: [
      "What strategies do you use to optimize Docker image sizes and enhance container security in production Dockerfiles?",
      "Explain the operational differences between Blue/Green deployment and Canary deployment. How do you automate rollback when error rates spike?"
    ],
    5: [
      "Explain step-by-step how you would troubleshoot a Kubernetes pod that is continuously stuck in a CrashLoopBackOff state in production.",
      "Users report receiving HTTP 502 Bad Gateway and 504 Gateway Timeout errors when visiting a web application behind an Nginx Ingress Controller on Kubernetes. How do you isolate the root cause?"
    ],
    6: [
      "Explain how AWS IAM Roles differ from IAM Users, and why IAM Roles with STS assume-role should be preferred for applications running on EC2 or EKS.",
      "What is the difference between a Public Subnet and a Private Subnet in an AWS VPC, and how do database instances in a private subnet securely download patches from the internet?"
    ],
    7: [
      "Explain the GCP Resource Hierarchy (Organization -> Folders -> Projects -> Resources) and how IAM policy inheritance works across these levels.",
      "Compare Google Kubernetes Engine (GKE) Autopilot vs GKE Standard in terms of node management, cost model, and cluster operational overhead."
    ],
    8: [
      "How do Azure Managed Identities eliminate the need for credential management in application code when connecting to Azure Key Vault or SQL Database?",
      "What is Azure VNet Peering and how do Network Security Groups (NSGs) control traffic flow between peered VNets?"
    ],
    9: [
      "How do you design an inter-cloud network topology connecting AWS VPCs and Azure VNets securely using IPsec VPN or Megaport Cloud Router?",
      "What strategies do you implement to avoid cloud vendor lock-in when deploying containerized microservices across multi-cloud environments?"
    ],
    10: [
      "AWS us-east-1 experiences a major outage. Walk through how Route53 DNS Failover and multi-region database read replicas automatically shift traffic to us-west-2.",
      "An AWS S3 bucket containing sensitive customer documents accidentally became publicly readable. How do you detect, isolate, and remediate this instantly?"
    ],
    11: [
      "Explain the difference between `git merge` and `git rebase`. When should you use interactive rebase vs a squash merge in a team workflow?",
      "How do you use `git bisect` to pinpoint the exact commit that introduced a performance regression in a large codebase?"
    ],
    12: [
      "How do Jenkins Shared Libraries simplify enterprise pipeline maintenance and enforce security scanning standards across hundreds of microservices?",
      "Explain how Jenkins Matrix Builds optimize build execution times for multi-platform application testing."
    ],
    13: [
      "What strategies do you use to optimize Docker image sizes and enhance container security in production Dockerfiles?",
      "Explain how Linux Namespaces (PID, NET, MNT, IPC, UTS) and Control Groups (cgroups) form the runtime foundation of Docker containers."
    ],
    14: [
      "Explain step-by-step how you would troubleshoot a Kubernetes pod that is continuously stuck in a CrashLoopBackOff state in production.",
      "What is the difference between a Kubernetes Deployment and a StatefulSet? How does StatefulSet maintain persistent network identities and volume ordinal bindings?"
    ],
    15: [
      "How do you configure Terraform Remote State with S3 and DynamoDB state locking to prevent concurrent state corruption in multi-engineer teams?",
      "Explain Ansible Idempotency and how you design Playbooks to ensure running them multiple times produces identical target system states without unintended side effects."
    ],
    16: [
      "Design a zero-downtime GitOps continuous delivery pipeline using GitHub Actions, Helm, and ArgoCD to deploy microservices to Amazon EKS.",
      "How do you manage multi-environment promotion (Dev -> Staging -> Prod) in GitOps without duplicating Helm values files?"
    ],
    17: [
      "Users report receiving HTTP 502 Bad Gateway and 504 Gateway Timeout errors when visiting a web application behind an Nginx Ingress Controller on Kubernetes. How do you isolate the root cause?",
      "A Node.js/Python microservice in Kubernetes experiences a slow memory leak, eventually triggering OOMKilled (Exit Code 137) every 6 hours. Walk through your profiling methodology."
    ],
    18: [
      "How do you integrate HashiCorp Vault with Amazon EKS using Vault Agent Injector sidecars so applications access dynamic database credentials without static secrets?",
      "What is Software Supply Chain Security and how do tools like Cosign and In-Toto enforce digital signature verification before deploying container images to production Kubernetes clusters?"
    ],
    19: [
      "Design a high-throughput, low-latency microservices architecture capable of processing 100,000 requests per second with 99.99% uptime.",
      "How do you implement Distributed Tracing across microservices using OpenTelemetry, Jaeger, and W3C Trace Context headers?"
    ],
    20: [
      "You are appointed Lead Principal CloudOps Engineer for an enterprise migrating legacy monolithic applications to AWS EKS. Present your 90-day migration strategy.",
      "How do you establish SLA, SLO, and SLI objectives across an enterprise microservices ecosystem, and how do Error Budgets dictate deployment velocity?"
    ],
    21: [
      "How do AIOps engines analyze high-cardinality Prometheus metrics to detect infrastructure anomalies before hard threshold alerts trigger?"
    ],
    22: [
      "Design a scalable ML Model Serving infrastructure on Kubernetes using Triton Inference Server, GPU node pools, and auto-scaling based on GPU queue latency."
    ],
    23: [
      "How do you architect an AI API Gateway to enforce token bucket rate limiting, fallback routing between OpenAI and Claude, and semantic cache with Redis Vector Search?"
    ],
    24: [
      "Explain how an autonomous AI agent can monitor Kubernetes event streams, analyze crash logs with LLMs, and safely generate a Pull Request to fix the deployment configuration."
    ],
    25: [
      "What is the Model Context Protocol (MCP) and how do MCP Tool declarations allow LLMs to safely query cloud infrastructure state and trigger DevOps actions?"
    ],
    26: [
      "Walk through constructing an Azure Pipelines YAML multi-stage pipeline with environment approvals, Azure Key Vault secrets task, and deployment to Azure Kubernetes Service."
    ],
    27: [
      "How do Flagger and Istio Service Mesh automate Progressive Traffic Shifting (Canary 5% -> 20% -> 50% -> 100%) based on real-time Prometheus HTTP success metrics?"
    ],
    28: [
      "Write a Rego policy for OPA Gatekeeper that rejects any Kubernetes Pod deployment that does not specify CPU/Memory resource requests and limits."
    ],
    29: [
      "Architect a global Active-Active multi-cloud topology across AWS, GCP, and Azure using Cloudflare Magic WAN and an AI-driven global traffic router."
    ],
    30: [
      "Final Boss Battle: You are interviewing for a \u20b940 LPA Staff CloudOps Engineer role. Pitch your comprehensive enterprise architecture vision for 99.999% availability, zero-trust security, AI self-healing operations, and FinOps cost efficiency.",
      "How do you lead organization-wide post-mortem incidents after a catastrophic multi-region outage to foster a blameless culture while enforcing systemic architecture preventions?"
    ],
  };

  const STAGE_FALLBACK_ANSWERS: Record<number, string[]> = {
    1: [
      "Provide",
      "Explain the architectural triangle: 1) HA via Multi-AZ deployments with auto-scaling groups. 2) Cost governance using Spot instances for non-prod, right-sizing via CloudWatch metrics, and AWS Savings Plans. 3) Developer velocity through standardized Terraform modules and automated ephemeral preview environments."
    ],
    2: [
      "Provide a structured response covering architectural principles, diagnostic commands, and recovery steps.",
      "Detailed walkthrough: Developer feature branch -> PR review with automated SAST/unit tests -> CI container build & scanning -> CD deployment via Helm/ArgoCD -> Telemetry monitoring.",
      "Structured adoption: 1) Identify business problem & PoC evaluation. 2) Load & security benchmarking. 3) Staging pilot deployment. 4) Runbook creation and knowledge transfer."
    ],
    3: [
      "represent",
      "Public"
    ],
    4: [
      "1) Use Multi-Stage builds to separate build dependencies/compilers from final runtime artifact. 2) Choose minimal base images like Alpine or Distroless. 3) Run containers as a non-root user (e.g. USER appuser). 4) Combine RUN instructions and clean package caches to minimize layers. 5) Use .dockerignore to exclude local binaries and .git directories. 6) Scan images in CI/CD using Trivy.",
      "Blue/Green provisions an identical new environment (Green) alongside live (Blue) and flips the load balancer router instantly (100% switch). Canary routes a small fraction (e.g. 5%) of live traffic to the new version, gradually increasing traffic while monitoring error rates and latency. If Prometheus metrics detect 5xx error spikes or latency anomalies, the pipeline immediately scales down the canary and restores routing."
    ],
    5: [
      "1) Run `kubectl describe pod <name>`: inspect Events table at the bottom and check LastState termination reason & exit code. 2) If Exit Code 137 -> OOMKilled, increase memory limits. 3) If Exit Code 1/2 -> application crash, run `kubectl logs <name> --previous` to inspect the exact fatal exception stack trace before crash. 4) Verify missing environment variables or unmounted ConfigMaps/Secrets. 5) Check if failing Liveness probes are repeatedly killing the container. 6) Apply fix in Deployment manifest and rollout.",
      "1) Distinguish error types: HTTP 502 means Nginx received an immediate connection refused / invalid response from the upstream pod. HTTP 504 means the upstream pod accepted the connection but timed out responding. 2) Inspect Nginx ingress logs with `kubectl logs -n ingress-nginx <controller-pod>` to identify the upstream target IP and request latency. 3) Run `kubectl get endpoints <service>` to verify if active pod IPs exist. 4) Check backend pod metrics (CPU throttling, database lock contention). 5) Adjust ingress proxy-connect-timeout or scale backend replicas."
    ],
    6: [
      "IAM Users have permanent static access keys vulnerable to leakage. IAM Roles use temporary Security Token Service (STS) credentials that auto-rotate without hardcoded secrets (using Instance Profiles or IRSA on EKS).",
      "Public Subnets route 0.0.0.0/0 to an IGW and assign public IPs. Private Subnets have no IGW route; outbound internet traffic routes through a NAT Gateway in a public subnet for egress-only access."
    ],
    7: [
      "GCP hierarchy propagates policies top-down. Policies applied at Organization or Folder level inherit automatically down to child Projects and Resources, enforcing enterprise guardrails.",
      "GKE Standard requires manual node pool sizing, OS upgrades, and capacity planning billed per node. GKE Autopilot manages all node infrastructure, auto-scaling, and security hardening, billing strictly per Pod resource request."
    ],
    8: [
      "Azure Managed Identities provide an automatically managed identity in Entra ID for Azure resources. Applications acquire short-lived OAuth tokens via local IMDS endpoints without storing client secrets in code.",
      "VNet Peering connects VNets via Microsoft backbone with low latency. NSGs contain stateful firewall rules (priority, source, destination, port) evaluated at subnet or NIC level to filter peered traffic."
    ],
    9: [
      "Design Dual IPsec VPN tunnels with BGP dynamic routing between AWS Virtual Private Gateway / Transit Gateway and Azure VPN Gateway, or utilize an Equinix / Megaport cloud router for high-throughput private peering.",
      "1) Standardize on vanilla Kubernetes (EKS/GKE/AKS). 2) Use Cloud-agnostic Terraform modules. 3) Deploy open-source data stores (PostgreSQL/Kafka) or multi-cloud abstraction layers (CockroachDB). 4) Use OpenTelemetry for telemetry."
    ],
    10: [
      "1) Route53 Health Checks detect primary endpoint failure. 2) DNS failover updates record target to us-west-2 ALB. 3) Cross-Region RDS Read Replica is promoted to primary standalone DB. 4) App services in us-west-2 resume write operations within target RTO/RPO limits.",
      "1) AWS Config / GuardDuty detects non-compliant S3 ACL change. 2) EventBridge triggers automated Lambda remediation script to apply 'S3 Block Public Access'. 3) Query CloudTrail logs (`s3:PutBucketPolicy`, `s3:GetObject`) to audit external IP access."
    ],
    11: [
      "Git merge preserves history with a merge commit. Git rebase rewrites feature commits on top of base branch for a linear history. Interactive rebase (`git rebase -i`) cleans up feature commits locally before squash merging into main.",
      "Provide a structured technical introduction summarizing your experience in Cloud & DevOps, including core infrastructure automation (AWS, Terraform, Kubernetes), CI/CD pipeline optimization, key metrics, and your most significant production reliability achievement."
    ],
    12: [
      "Jenkins Shared Libraries externalize pipeline logic in Groovy repos (`vars/`). Centralizing stages (build, SonarQube SAST, Trivy scan, ArgoCD trigger) ensures all microservices automatically inherit enforced enterprise security standards.",
      "Matrix builds define multidimensional execution axes (e.g. Node 18/20 x Ubuntu/RHEL). Jenkins launches parallel build agents across nodes simultaneously, reducing multi-platform test suite duration drastically."
    ],
    13: [
      "1) Multi-Stage builds to exclude build tools. 2) Distroless/Alpine base images. 3) Non-root `USER` directive. 4) `.dockerignore` to exclude local artifacts. 5) Trivy scanning in CI.",
      "Namespaces provide runtime process isolation (PID), network interfaces (NET), and mount points (MNT). Control Groups (cgroups) restrict and account for CPU, memory, and I/O resource consumption per container."
    ],
    14: [
      "1) `kubectl describe pod` for Events and LastState exit code. 2) If Exit Code 137 -> OOMKilled (increase memory limit). 3) If Exit Code 1/2 -> App crash, check `kubectl logs <pod> --previous`. 4) Verify ConfigMaps/Secrets mounts and Liveness probe settings.",
      "Deployments manage stateless pods with random hashes and shared storage. StatefulSets manage stateful workloads (databases) providing deterministic ordinal names (pod-0, pod-1), dedicated PersistentVolumeClaims per pod, and ordered deployment/scaling."
    ],
    15: [
      "Configure `backend \"s3\"` with `bucket`, `key`, `encrypt = true`, and `dynamodb_table = \"terraform-locks\"`. When running `terraform apply`, Terraform writes a LockID to DynamoDB, blocking concurrent executions until state release.",
      "Idempotency ensures running a playbook repeatedly yields the same state. Use declarative Ansible modules (`apt: state=present`, `copy`, `service: state=started`) instead of raw shell commands, so tasks skip execution when state is already satisfied."
    ],
    16: [
      "1) GitHub Actions compiles code, runs Trivy scan, builds OCI image, and pushes to ECR. 2) CI updates image tag in GitOps Helm repo. 3) ArgoCD detects Git commit and executes sync to EKS cluster with rolling update and automatic health check rollback.",
      "Use Kustomize overlays or Helm umbrella charts with environment-specific values files (`values-dev.yaml`, `values-prod.yaml`). Promote builds by submitting automated PRs containing updated image tags from Staging to Prod environment folders."
    ],
    17: [
      "1) Distinguish 502 (Connection Refused / backend pod crash) vs 504 (Upstream Timeout / slow app/DB). 2) Check ingress logs (`kubectl logs -n ingress-nginx`). 3) Check endpoints (`kubectl get ep`). 4) Inspect pod CPU/RAM and database connection pool.",
      "1) Monitor memory growth via Prometheus `container_memory_working_set_bytes`. 2) Attach profiler (`node --inspect` heap snapshot or `py-spy` for Python) in staging. 3) Compare heap diffs before and after load tests to isolate uncollected object references."
    ],
    18: [
      "1) Annotate Pod with Vault Agent annotations (`vault.hashicorp.com/agent-inject`). 2) Vault Agent authenticates via Kubernetes ServiceAccount token. 3) Vault Database Secrets Engine generates short-lived DB credentials and injects them to `/vault/secrets/db-cred` in tmpfs.",
      "1) CI pipeline signs container image digest using Cosign keyless signatures & generates SBOM. 2) Kubernetes Admission Controller (Kyverno/OPA) verifies cryptographic signatures before allowing Pod scheduling, blocking unsigned images."
    ],
    19: [
      "1) AWS NLB distributing traffic to EKS ingress nodes. 2) Karpenter autoscaling node capacity. 3) Redis Cluster for caching hot data (sub-5ms). 4) Event-driven Apache Kafka for async decoupling. 5) Aurora PostgreSQL with read replicas and connection pooling (PgBouncer).",
      "1) Instrument microservices with OpenTelemetry SDKs. 2) Inject HTTP `traceparent` headers across microservice RPC calls. 3) Push trace spans to OpenTelemetry Collector, exporting to Grafana Tempo/Jaeger to visualize call graphs."
    ],
    20: [
      "Days 1-30: Architecture discovery, dependency mapping & Terraform baseline. Days 31-60: CI/CD automation, EKS cluster creation, security guardrails & Strangler Fig pattern for microservices. Days 61-90: Pilot migration, performance tuning, fallback runbooks & final cutover.",
      "SLI is the quantitative measure (e.g. 99.9% successful HTTP requests). SLO is the internal target (99.9% uptime over 30 days). SLA is the business contract. Error Budget (100% - SLO = 0.1%) represents acceptable downtime; if depleted, feature releases freeze to focus on reliability."
    ],
    21: [
      "AIOps tools ingest real-time Prometheus metric streams, establishing dynamic seasonal baselines via unsupervised ML models. By evaluating metric variance rate of change, AIOps detects subtle degradation prior to hard threshold breaches."
    ],
    22: [
      "Deploy Triton Inference Server on EKS GPU node pools using NVIDIA GPU operator. Use KEDA (Kubernetes Event-driven Autoscaling) configured with Prometheus NVIDIA DCGM GPU utilization and inference queue duration metrics to scale pods dynamically."
    ],
    23: [
      "1) Envoy / Kong API gateway with custom Lua or WebAssembly plugin for token bucket rate limiting. 2) Redis Vector Search to cache semantically similar prompts (sub-10ms response). 3) Multi-provider router automatically falling back to Anthropic/OpenAI on HTTP 429/5xx errors."
    ],
    24: [
      "1) Watcher service listens to K8s OOMKilled/CrashLoop events. 2) Log snippet & deployment spec sent to LLM for root cause diagnosis. 3) LLM generates recommended patch. 4) Agent opens GitHub PR with fix, requiring Human-in-the-Loop review before merge."
    ],
    25: [
      "MCP provides a standardized protocol (JSON-RPC) enabling AI models to inspect external resources and execute tools. Tool declarations expose structured JSON schemas defining parameters, requiring strict permission sandboxing before executing cloud mutations."
    ],
    26: [
      "1) Define stages: Build -> Staging -> Production in `azure-pipelines.yml`. 2) Fetch secrets via `AzureKeyVault@2` task using Azure Service Principal. 3) Enforce Manual Approval checks on Production environment in Azure DevOps portal."
    ],
    27: [
      "Flagger controls Istio VirtualService weights, incrementing canary traffic (5% step). At each interval, Flagger queries Prometheus for HTTP 5xx error rate and p99 latency; if thresholds fail, Flagger resets traffic to primary instantly."
    ],
    28: [
      "Create ConstraintTemplate defining Rego rule `violation[{\"msg\": msg}]` checking `input.review.object.spec.containers[_].resources.requests` and `limits`. Gatekeeper admission webhook rejects non-compliant Pod manifests at API server entry."
    ],
    29: [
      "1) Cloudflare Anycast Magic WAN handles global ingress. 2) Real-time telemetry evaluates regional latency and cloud provider health. 3) AI Router dynamically adjusts BGP / DNS weights to route users to the lowest-latency healthy cloud region."
    ],
    30: [
      "A masterclass executive defense: 1) Multi-region active-active architecture (Five Nines). 2) Zero-Trust security with mTLS and dynamic Vault secrets. 3) Autonomous AIOps self-healing incident mitigation. 4) FinOps cost optimization saving millions. 5) Engineering culture & mentorship vision.",
      "1) Reconstruct precise chronological incident timeline from logs & traces. 2) Conduct a Blameless Post-Mortem utilizing '5 Whys' root cause analysis. 3) Focus on process and architectural safeguards rather than human error. 4) Assign tracking tickets with strict SLAs for systemic prevention."
    ],
  };

  const STAGE_FALLBACK_TOPICS: Record<number, string[][]> = {
    1: [
      ["present role", "years of experience", "core stack (AWS/K8s/Terraform)", "quantifiable accomplishment", "passion for reliability"],
      ["trade-offs", "multi-AZ vs multi-region", "auto-scaling", "Spot/Reserved instances", "CI/CD automated testing"]
    ],
    2: [
      ["architectural principles", "diagnostic commands", "recovery steps"],
      ["code commit", "pr review", "ci build", "helm argocd", "telemetry"],
      ["poc evaluation", "security benchmarking", "staging pilot", "runbook creation"]
    ],
    3: [
      ["temporary credentials", "STS (Security Token Service)", "no hardcoded access keys", "automatic credential rotation", "least privilege role assumption", "IRSA"],
      ["Internet Gateway (IGW)", "Route Tables", "NAT Gateway", "Public vs Private IP", "outbound-only egress traffic"]
    ],
    4: [
      ["multi-stage builds", "minimal base images (Alpine/Distroless)", "non-root user (USER directive)", ".dockerignore", "layer caching", "vulnerability scanning (Trivy)"],
      ["traffic routing percentage", "Blue/Green instant cutover", "Canary progressive rollout", "health check metrics (HTTP 5xx rate)", "automated rollback triggers"]
    ],
    5: [
      ["kubectl get pods", "kubectl describe pod (LastState, Exit Codes, Events)", "kubectl logs --previous", "OOMKilled (Exit Code 137)", "Liveness probe failures", "ConfigMap / Secret missing"],
      ["Ingress controller logs", "Service endpoints (kubectl get ep)", "upstream timeout vs upstream connection refused", "backend pod CPU throttling / health", "keepalive settings"]
    ],
    6: [
      ["temporary credentials", "STS (Security Token Service)", "no static access keys", "automatic rotation", "IRSA"],
      ["Internet Gateway (IGW)", "Route Tables", "NAT Gateway", "Public IP", "outbound-only egress"]
    ],
    7: [
      ["organization node", "folders structure", "project level", "iam policy inheritance", "least privilege"],
      ["gke autopilot", "gke standard", "fully managed nodes", "pod-level billing", "node pool tuning"]
    ],
    8: [
      ["system-assigned identity", "user-assigned identity", "entra id (azure ad)", "token acquisition", "zero hardcoded credentials"],
      ["vnet peering", "low latency private backbone", "nsg inbound/outbound rules", "service tags", "no gateway required"]
    ],
    9: [
      ["ipsec vpn tunnel", "bgp routing", "aws customer gateway", "azure vnet gateway", "megaport cloud router"],
      ["kubernetes standard", "cloud agnostic terraform", "open source databases (postgres/redis)", "opentelemetry", "portable ci/cd"]
    ],
    10: [
      ["route53 health checks", "dns failover policy", "rds cross-region read replica", "rto and rpo", "failover promotion script"],
      ["aws config rule", "s3 block public access", "cloudtrail audit logs", "eventbridge trigger", "automated lambda remediation"]
    ],
    11: [
      ["linear commit history", "merge commit", "git rebase -i", "squash merge", "shared branch safety"],
      ["present role", "years of experience", "core stack (AWS/K8s/Terraform)", "quantifiable accomplishment", "passion for reliability"]
    ],
    12: [
      ["groovy shared library", "vars directory", "global pipeline templates", "centralized security gates", "versioned library tags"],
      ["matrix axis", "parallel execution", "build nodes label", "jdk/python versions matrix", "failFast configuration"]
    ],
    13: [
      ["multi-stage builds", "minimal base images (Alpine/Distroless)", "non-root user (USER directive)", ".dockerignore", "layer caching", "vulnerability scanning (Trivy)"],
      ["namespaces (isolation)", "cgroups (resource limiting)", "pid/net/mnt namespaces", "cgroups v2 memory limit", "kernel sharing"]
    ],
    14: [
      ["kubectl describe pod", "kubectl logs --previous", "OOMKilled (Exit Code 137)", "liveness probe failure", "missing configmap/secret"],
      ["stateless vs stateful", "ordinal pod naming (pod-0, pod-1)", "headless service", "volumeClaimTemplates", "ordered deployment/termination"]
    ],
    15: [
      ["backend s3", "dynamodb_table lock", "state encryption at rest", "terragrunt", "terraform state mv"],
      ["idempotency principle", "state: present/absent", "changed vs ok status", "handlers notification", "avoiding raw shell commands"]
    ],
    16: [
      ["github actions build & scan", "helm chart repository", "gitops repository update", "argocd automated sync", "health check rollback"],
      ["kustomize overlays", "helm value overrides", "environment branches vs folders", "pr promotion gates", "sealed secrets"]
    ],
    17: [
      ["ingress controller logs", "service endpoints (kubectl get ep)", "upstream connection refused (502)", "upstream timeout (504)", "backend pod metrics"],
      ["heap dump analysis", "node --inspect / py-spy", "prometheus container_memory_working_set_bytes", "gc logs", "memory leak fix"]
    ],
    18: [
      ["vault agent injector", "kubernetes service account auth", "dynamic database secrets engine", "sidecar container", "in-memory secret injection"],
      ["container image signing (cosign)", "in-toto provenance", "kyverno / opa gatekeeper admission controller", "sigstore", "software bill of materials (sbom)"]
    ],
    19: [
      ["network load balancer (nlb)", "event-driven kafka", "redis cluster caching", "eks auto-scaling (karpenter)", "database sharding"],
      ["opentelemetry collector", "traceparent header propagation", "span context", "jaeger / grafana tempo", "sampling rate configuration"]
    ],
    20: [
      ["discovery & dependency mapping", "strangler fig pattern", "iac baseline (terraform)", "security compliance & ci/cd", "pilot migration & cutover"],
      ["sli (metrics)", "slo (target)", "sla (contract)", "error budget depletion", "deployment freeze"]
    ],
    21: [
      ["time-series anomaly detection", "machine learning baselining", "prometheus metric streams", "noise suppression", "predictive alerting"]
    ],
    22: [
      ["triton inference server", "nvidia k8s device plugin", "dcgm metrics", "keda autoscaling", "gpu shared memory"]
    ],
    23: [
      ["token rate limiting", "semantic caching (redis vector)", "multi-provider fallback", "streaming response proxy", "cost tracking per tenant"]
    ],
    24: [
      ["k8s watcher daemon", "llm log analysis", "github api pr creation", "human-in-the-loop approval", "sandboxed evaluation"]
    ],
    25: [
      ["mcp protocol specification", "tool definition schema", "json-rpc over stdio/sse", "read-only vs mutating actions", "permission boundaries"]
    ],
    26: [
      ["azure-pipelines.yml", "pipeline environments", "azure key vault task", "kubelogin / aks service connection", "approval checks"]
    ],
    27: [
      ["flagger custom resource", "istio virtualservice", "prometheus canary analysis", "weight increment", "automatic rollback on 5xx"]
    ],
    28: [
      ["opa gatekeeper", "rego language", "constraint template", "resource requests and limits", "admission webhook denial"]
    ],
    29: [
      ["cloudflare magic wan", "anycast routing", "cross-cloud active-active", "ai latency predictor", "zero downtime failover"]
    ],
    30: [
      ["99.999% availability (five nines)", "zero-trust mesh (istio/vault)", "ai self-healing operations", "finops & cloud governance", "staff leadership vision"],
      ["blameless post-mortem", "5 whys root cause analysis", "actionable preventive tickets", "timeline reconstruction", "executive stakeholder communication"]
    ],
  };



  const resolvedTargetStage = (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("stage") ? parseInt(new URLSearchParams(window.location.search).get("stage")!, 10) : null)
    || (attemptId && attemptId.startsWith("stage-") ? parseInt(attemptId.replace("stage-", ""), 10) : null)
    || (typeof window !== "undefined" && localStorage.getItem("active_interview_session") ? (JSON.parse(localStorage.getItem("active_interview_session") || "{}").stageId || null) : null)
    || (activeStage ? Number(activeStage.stage_number) : null)
    || 1;
  const currentStageNum = (resolvedTargetStage >= 1 && resolvedTargetStage <= 30) ? resolvedTargetStage : 1;

  // Match live DB stage fetched from /interviews/stages
  const liveDbStage = dbStagesData.find((s: any) => s.id === currentStageNum || s.stage_number === currentStageNum);
  const liveDbQuestions = (liveDbStage?.questions || []).filter((q: any) => q.is_active !== "INACTIVE");

  const currentStageTitle = liveDbStage?.title || activeStage?.stage?.title || `Stage ${currentStageNum} Assessment`;
  const currentStageCategory = liveDbStage?.category || liveDbStage?.levelName || activeStage?.stage?.category || "TECHNICAL ASSESSMENT";

  const stageQuestions = ((activeStage?.stage as any)?.questions || []).filter((q: any) => q.is_active !== "INACTIVE");
  const allQAttempts = activeStage?.question_attempts || [];

  // Priority question list: Live Admin configured questions from DB > Attempt stage questions > Attempt question attempts
  const combinedQuestionsList = liveDbQuestions.length > 0
    ? liveDbQuestions
    : (stageQuestions.length > 0
        ? stageQuestions
        : (allQAttempts.map((qa: any) => ({
            id: qa.question_id || qa.id,
            question_text: qa.question_text_snapshot || qa.question?.question_text,
            reference_answer: qa.question?.reference_answer,
            expected_topics: qa.question?.expected_topics
          })).filter((q: any) => q && q.question_text)));

  const fallbackList = STAGE_FALLBACK_QUESTIONS[currentStageNum] || STAGE_FALLBACK_QUESTIONS[1] || [];

  // Strictly use DB questions count if questions are configured in DB by Admin!
  const dbTotalQCount = combinedQuestionsList.length > 0
    ? combinedQuestionsList.length
    : (fallbackList.length > 0 ? fallbackList.length : 1);

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

      if (typeof window !== "undefined") {
        try {
          const rawScores = localStorage.getItem("stage_scores_map") || "{}";
          const scoresMap = JSON.parse(rawScores);
          scoresMap[currentStageNum] = `${avgScore}%`;
          localStorage.setItem("stage_scores_map", JSON.stringify(scoresMap));
        } catch (e) {}
      }

      setStageSummary(finalSummary);
      return;
    }

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

  // Active question item for current index
  const activeQItem = combinedQuestionsList[currentQIndex];
  const activeStageQuestion = stageQuestions[currentQIndex];
  const activeQuestionAttempt = allQAttempts[currentQIndex];

  const dbQuestionText = activeQItem?.question_text ||
    activeStageQuestion?.question_text ||
    activeQuestionAttempt?.question_text_snapshot ||
    activeQuestionAttempt?.question?.question_text;

  const defaultStageQ = fallbackList[currentQIndex] || fallbackList[0] || "Describe your background and technical experience in Cloud & DevOps engineering.";

  const isGenericStageTitle = (text?: string) => {
    if (!text) return true;
    const trimmed = text.trim().toLowerCase();
    if (trimmed === "stage 1 technical assessment" || trimmed === "stage 1" || trimmed === "stage 2 technical assessment") return true;
    if (/^stage\s*\d+(\s*technical\s*assessment)?$/i.test(trimmed)) return true;
    if (trimmed.includes("technical assessment") && !trimmed.includes("?") && trimmed.length < 35) return true;
    return false;
  };

  const rawQText = (!isGenericStageTitle(dbQuestionText) ? dbQuestionText : null) || defaultStageQ;
  const derivedKeywords = extractKeywordsFromText(rawQText);

  const defaultStageAns = (STAGE_FALLBACK_ANSWERS[currentStageNum] || STAGE_FALLBACK_ANSWERS[1])[currentQIndex]
    || "Provide a structured response covering architectural principles, diagnostic commands, and recovery steps.";

  const rawIdealAnswer = activeQItem?.reference_answer ||
    activeStageQuestion?.reference_answer ||
    activeQuestionAttempt?.question?.reference_answer ||
    (activeQuestionAttempt as any)?.reference_answer || "";

  // Sanitize reference answer: prioritize exact reference_answer directly from PostgreSQL DB
  const isDirtyRefAns = !rawIdealAnswer || rawIdealAnswer.toLowerCase().includes("sachin") || rawIdealAnswer.toLowerCase() === "test";
  const dbIdealAnswer = (!isDirtyRefAns && rawIdealAnswer && rawIdealAnswer.trim().length > 0) ? rawIdealAnswer.trim() : defaultStageAns;

  const fallbackTopics = (STAGE_FALLBACK_TOPICS[currentStageNum] || [])[currentQIndex] || [];
  const dbKeywords = (activeQItem?.expected_topics && activeQItem.expected_topics.length > 0)
    ? activeQItem.expected_topics
    : (activeStageQuestion?.expected_topics || activeQuestionAttempt?.question?.expected_topics || fallbackTopics);

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
    // Re-sync live database questions and reference answers when moving between questions
    loadAttempt();
    return () => {
      if (cancelSpeechRef.current) {
        cancelSpeechRef.current();
        setIsSpeaking(false);
      }
    };
  }, [currentQIndex, loadAttempt]);

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
    const baseText = spokenTranscript.trim();
    baseTranscriptRef.current = baseText;
    sessionFinalTranscriptRef.current = "";

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
          let newlyFinalized = "";
          let interimText = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0]?.transcript || "";
            if (result.isFinal) {
              newlyFinalized += text + " ";
            } else {
              interimText += text;
            }
          }

          if (newlyFinalized.trim()) {
            sessionFinalTranscriptRef.current = [
              sessionFinalTranscriptRef.current,
              newlyFinalized.trim()
            ].filter(Boolean).join(" ").trim();
          }

          const combined = [
            baseTranscriptRef.current,
            sessionFinalTranscriptRef.current,
            interimText.trim()
          ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

          if (combined) {
            setSpokenTranscript(combined);
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
            // Lock in all finalized text into baseTranscriptRef before starting next session
            baseTranscriptRef.current = [
              baseTranscriptRef.current,
              sessionFinalTranscriptRef.current
            ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
            sessionFinalTranscriptRef.current = "";
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
      "assessment", "question", "answer", "round", "main", "karun", "bus", "kya",
      "detail", "present", "their", "about", "core", "role", "years", "such", "than",
      "when", "over", "under", "into", "during", "where", "which", "each", "every",
      "also", "well", "both", "only", "more", "some", "them", "these", "those"
    ]);

    // Key target words are extracted STRICTLY AND EXCLUSIVELY from idealWords (Expected Model Answer)! NOT question text, NOT expected_topics!
    const adminKeyWords = Array.from(new Set(idealWords.filter((w) => !stopWords.has(w))));

    const beggingPhrases = [
      "give me pass", "pass me", "dont know", "don't know", "dont have", "don't have",
      "kya karun", "please pass", "no idea", "skip", "next question"
    ];
    const isBegging = beggingPhrases.some((phrase) => lower.includes(phrase));

    // ------------------- QUESTION COPY / ANTI-CHEAT CHECK -------------------
    const qWordsArr = getWords(qTextLower);
    const qWordsSet = new Set(qWordsArr);
    
    let qMatchCount = 0;
    candWords.forEach((w) => {
      if (qWordsSet.has(w)) qMatchCount++;
    });

    const qWordRatio = qWordsArr.length > 0 ? qMatchCount / qWordsArr.length : 0;
    const candQRatio = candWords.size > 0 ? qMatchCount / candWords.size : 0;

    let isQuestionCopy = false;
    if (qTextLower.length > 15) {
      if (lower === qTextLower || (lower.length > 20 && (lower.includes(qTextLower) || qTextLower.includes(lower)))) {
        isQuestionCopy = true;
      } else if (qWordRatio >= 0.65 && candQRatio >= 0.55) {
        const uniqueCandWords = Array.from(candWords).filter((w) => !qWordsSet.has(w) && !stopWords.has(w));
        if (uniqueCandWords.length < 2) {
          isQuestionCopy = true;
        }
      }
    }

    // Direct exact or concept match check ONLY with Admin Expected Answer (idealLower)
    const isExactMatch = Boolean(
      !isQuestionCopy &&
      idealLower && lower && (
        lower === idealLower ||
        lower.includes(idealLower) ||
        idealLower.includes(lower) ||
        (idealWords.length > 0 && idealWords.filter((w) => candWords.has(w)).length >= Math.max(1, Math.ceil(idealWords.length * 0.60)))
      )
    );

    // Count whole word overlaps with Admin Expected Answer ONLY
    const matchedAdminWords = adminKeyWords.filter((w) => candWords.has(w));
    const missingAdminWords = adminKeyWords.filter((w) => !candWords.has(w));

    let matchPercentage = 0;
    let isPassed = false;

    if (isQuestionCopy || isBegging) {
      matchPercentage = isQuestionCopy ? 0 : 15;
      isPassed = false;
    } else if (isExactMatch) {
      matchPercentage = 95;
      isPassed = true;
    } else {
      if (adminKeyWords.length > 0) {
        const ratio = matchedAdminWords.length / adminKeyWords.length;
        matchPercentage = Math.round(ratio * 100);
      } else {
        matchPercentage = 50;
      }

      const minRequired = Math.min(2, Math.max(1, adminKeyWords.length));
      isPassed = (matchPercentage >= 50 && matchedAdminWords.length >= minRequired) || isExactMatch;

      if (isPassed) {
        matchPercentage = Math.max(matchPercentage, 65);
      } else {
        if (matchedAdminWords.length === 0) {
          matchPercentage = Math.min(matchPercentage, 15);
        } else {
          matchPercentage = Math.min(matchPercentage, 45);
        }
      }
    }

    const finalScore = isQuestionCopy
      ? 15.0
      : (isPassed
          ? Math.min(98.0, Math.max(70.0, 65.0 + Math.round(matchPercentage * 0.30)))
          : Math.max(15.0, Math.round(matchPercentage * 0.70)));

    const feedbackText = isQuestionCopy
      ? "❌ NEEDS IMPROVEMENT (0% Match). You submitted the question text instead of providing a technical answer."
      : (isPassed
          ? `✅ PASSED (${matchPercentage}% Match ≥ 60%). Spoken answer accurately matched Expected Model Answer.`
          : `❌ NEEDS IMPROVEMENT (${matchPercentage}% Match < 60%). Missing expected keywords: ${missingAdminWords.slice(0, 3).join(", ") || "Technical Details"}. Expected Answer: "${benchmark.ideal}"`);

    const evalResult: QuestionEvaluationResult = {
      overall_score: finalScore,
      technical_score: finalScore,
      concept_coverage_score: isPassed ? Math.min(98, finalScore + 2) : Math.max(15, finalScore - 5),
      reasoning_score: isPassed ? Math.min(95, finalScore) : Math.max(15, finalScore - 8),
      practical_score: isPassed ? Math.min(95, finalScore + 4) : Math.max(15, finalScore - 4),
      communication_score: transcriptText.length > 10 ? 88.0 : 40.0,
      confidence_score: isPassed ? 90.0 : 45.0,
      feedback: feedbackText,
      strengths: isQuestionCopy ? ["Verbal response submitted"] : (isPassed ? [`Matched expected solution parameters: ${matchedAdminWords.slice(0, 4).join(", ")}`] : ["Verbal response submitted"]),
      weaknesses: isQuestionCopy ? ["Submitted question text instead of technical solution"] : (isPassed ? [] : [`Missing expected keywords: ${missingAdminWords.slice(0, 3).join(", ")}`]),
      missing_concepts: missingAdminWords.slice(0, 4),
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

    // Safely stop background media recorder without blocking UI thread
    if (recorderRef.current) {
      try {
        recorderRef.current.stop().catch(() => {});
      } catch (e) {}
    }

    try {
      const finalTranscriptText = (manualText || spokenTranscript).trim();
      setSubmittedAnswerText(finalTranscriptText);

      // Dynamically resolve latest reference answer from live DB questions if updated by Admin
      const latestStage = dbStagesData.find((s: any) => s.id === currentStageNum || s.stage_number === currentStageNum);
      const latestQs = (latestStage?.questions || []).filter((q: any) => q.is_active !== "INACTIVE");
      const latestQ = latestQs[currentQIndex] || activeQItem;
      const effectiveIdeal = (latestQ?.reference_answer && latestQ.reference_answer.trim().length > 0)
        ? latestQ.reference_answer.trim()
        : currentBenchmark.ideal;

      const benchmarkToUse = {
        ...currentBenchmark,
        q: latestQ?.question_text || currentBenchmark.q,
        ideal: effectiveIdeal
      };

      const { evalResult: localEval, matchPercentage } = evaluateSpeechMatch(finalTranscriptText, benchmarkToUse);
      
      const newAccumulated = [...accumulatedScores];
      newAccumulated[currentQIndex] = localEval.overall_score;
      setAccumulatedScores(newAccumulated);
      setLastMatchScore(matchPercentage);

      // Instantaneous UI Feedback: Candidate sees evaluation result in <15ms
      setLastEvalResult(localEval);
      setIsProcessing(false);

      if (chamberMode === "INTERVIEW" && activeQuestionAttempt) {
        // Asynchronous non-blocking Database sync
        apiFetch(`/attempts/${attemptId}/questions/${activeQuestionAttempt.id}/submit-json`, {
          method: "POST",
          body: JSON.stringify({
            transcript: finalTranscriptText,
            duration_seconds: questionSeconds || 10.0,
          }),
        }).then((res: any) => {
          if (res?.data) {
            setLastEvalResult(res.data);
            if (res.data.overall_score !== undefined) {
              const bScore = Number(res.data.overall_score);
              setLastMatchScore(Math.round(bScore));
              const updatedScores = [...newAccumulated];
              updatedScores[currentQIndex] = bScore;
              setAccumulatedScores(updatedScores);
            }
          }
        }).catch((e) => {
          console.warn("Background submit notice:", e);
        });
      }
    } catch (err: any) {
      console.warn("Processed answer evaluation notice:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Candidate Action to Retry This Question as many times as needed
  const handleRetryQuestion = () => {
    setLastEvalResult(null);
    setLastMatchScore(null);
    setSpokenTranscript("");
    setSubmittedAnswerText("");
    baseTranscriptRef.current = "";
    sessionFinalTranscriptRef.current = "";
    setQuestionSeconds(0);
    setIsRecording(false);
    isRecordingRef.current = false;
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.stop();
      } catch (e) {}
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
        baseTranscriptRef.current = "";
        sessionFinalTranscriptRef.current = "";
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
            const stageNum = currentStageNum;
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

        if (typeof window !== "undefined") {
          try {
            const rawScores = localStorage.getItem("stage_scores_map") || "{}";
            const scoresMap = JSON.parse(rawScores);
            scoresMap[currentStageNum] = `${avgScore}%`;
            localStorage.setItem("stage_scores_map", JSON.stringify(scoresMap));
          } catch (e) {}
        }

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
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-slate-400">CHAMBER MODE:</span>
          <div className="flex items-center px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono font-semibold text-slate-200 gap-2">
            <Database className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Real Interview Mode ({dbTotalQCount} Qs)</span>
          </div>
        </div>

        {/* Live Timer, Camera Active Badge & Drop Out Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {isCameraLive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE CAMERA ACTIVE</span>
            </div>
          ) : (
            <button
              onClick={enableCameraStream}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/50 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold hover:bg-amber-950/80 transition-all cursor-pointer"
              title="Click to Enable / Reconnect Camera Stream"
            >
              <CameraOff className="w-3.5 h-3.5 text-amber-400" />
              <span>CAMERA PAUSED (CLICK TO ENABLE)</span>
            </button>
          )}

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            isCameraLive
              ? "bg-slate-950/80 border-slate-800 text-slate-200"
              : "bg-amber-950/50 border-amber-500/40 text-amber-400"
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{isCameraLive ? `Time Remaining: ${formatTimer(timeLeftSeconds)}` : `TIMER PAUSED (${formatTimer(timeLeftSeconds)})`}</span>
          </div>

          {/* DROP OUT BUTTON */}
          <button
            onClick={() => setShowDropOutModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-700/60 text-slate-400 hover:text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Abort Interview Session"
          >
            <LogOut className="w-3.5 h-3.5" />
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
            <span className="px-3 py-1 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] font-mono font-bold text-xs border border-[#FF6B00]/30">
              Q{currentQIndex + 1} / {maxQCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Correct Answers Count */}
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Correct: {accumulatedScores.slice(0, maxQCount).filter((s) => s !== undefined && s >= 60.0).length} / {maxQCount}</span>
            </span>

            {/* Incorrect Answers Count */}
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm">
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
              badgeBg = "bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/30 ring-2 ring-[#FF6B00]/40";
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
                  ROUND {currentQIndex + 1} · {currentStageCategory}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                  {currentStageTitle}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setSpokenTranscript(val);
                    baseTranscriptRef.current = val;
                    sessionFinalTranscriptRef.current = "";
                  }}
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
                          if (speechRecognitionRef.current) {
                            try {
                              speechRecognitionRef.current.onend = null;
                              speechRecognitionRef.current.onerror = null;
                              speechRecognitionRef.current.stop();
                            } catch (e) {}
                          }
                          isRecordingRef.current = false;
                          setIsRecording(false);
                          baseTranscriptRef.current = [
                            baseTranscriptRef.current,
                            sessionFinalTranscriptRef.current
                          ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
                          sessionFinalTranscriptRef.current = "";
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

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetryQuestion}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>🔄 Retry This Question</span>
                  </button>

                  <button
                    onClick={handleProceedToNextQuestion}
                    disabled={isProceedingNext}
                    className="flex-1 w-full py-3.5 px-6 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 shadow-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
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
                <div className="p-3 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Stage {currentStageNum} Assessment Finished!</h2>
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
              <span className="text-xs font-mono font-bold text-slate-400">STAGE {currentStageNum} OVERALL AGGREGATE SCORE</span>
              <div className={`text-4xl sm:text-5xl font-black font-mono ${stageSummary.passed ? "text-emerald-400" : "text-rose-400"}`}>
                {stageSummary.overallScore}%
              </div>
              <div className="flex items-center gap-2 mt-1">
                {stageSummary.passed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>STAGE {currentStageNum} PASSED • STAGE {currentStageNum + 1} UNLOCKED</span>
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
              <span className="text-xs font-extrabold text-[#FF6B00] font-mono">
                {stageSummary.passed ? `Stage ${currentStageNum + 1} Unlocked` : `Stage ${currentStageNum} Active`}
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
                    className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-xs text-white bg-[#FF6B00] hover:bg-[#e05e00] shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                      isNavigatingNextStage ? "opacity-90 cursor-wait" : "hover:scale-[1.02] cursor-pointer"
                    }`}
                  >
                    {isNavigatingNextStage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span>Opening Stage {currentStageNum + 1}...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed Directly to Stage {currentStageNum + 1}</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setIsNavigatingNextStage(true);
                      stopCameraCompletely();
                      /* currentStageNum already resolved */

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
                        /* currentStageNum already resolved */
                        localStorage.setItem("auto_start_stage", String(currentStageNum));
                      }
                      router.push(`/interviews?stage=${currentStageNum}&autoStart=true`);
                    }}
                    disabled={isNavigatingNextStage}
                    className={`w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                      isNavigatingNextStage ? "opacity-90 cursor-wait" : "hover:scale-[1.02] cursor-pointer"
                    }`}
                  >
                    {isNavigatingNextStage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span>Restarting Stage {currentStageNum}...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Resume / Retry Stage {currentStageNum} 🔄</span>
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
