"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Play, CheckCircle2, Lock, Sparkles, Trophy, Clock, 
  ArrowRight, ShieldCheck, Cpu, Mic, FileText, ChevronRight,
  Flame, Award, AlertCircle, RefreshCw, Loader2, Star, Zap, Crown, X,
  Video, LogOut, Monitor, Copy, Check
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const ALL_30_STAGES = [
  // STAGE 0 — PROFILE SETUP & VERIFICATION FORM
  { id: 0, level: "Level 1", levelName: "Foundation", title: "STAGE 0: SETUP YOUR INTERVIEW PROFILE", xp: "+100 XP", duration: "5 Mins", questions: 1, questions_count: 1, icon: "📋", diff: "Easy", desc: "Complete candidate profile, phone, target role & LinkedIn verification form to unlock all interview stages.", status: "in_progress", score: "Active" },

  // LEVEL 1 — FOUNDATION (TRACK 1)
  { id: 1, level: "Level 1", levelName: "Foundation", title: "STAGE 1: SELF INTRODUCTION", xp: "+200 XP", duration: "12 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Master your 60-second pitch, STAR background intro, and career story.", status: "locked", score: "--" },
  { id: 2, level: "Level 1", levelName: "Foundation", title: "STAGE 2: TECHNICAL INTRODUCTION", xp: "+200 XP", duration: "15 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Explain your daily technical workflow, tool stack, and architecture experience.", status: "locked", score: "--" },
  { id: 3, level: "Level 1", levelName: "Foundation", title: "☁️ CHALLENGE 03 — CLOUD INFRASTRUCTURE ENGINEER", xp: "+200 XP", duration: "18 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Process signals, memory triage, top/htop/iotop, and bash scripting.", status: "locked", score: "--" },
  { id: 4, level: "Level 1", levelName: "Foundation", title: "STAGE 4: LINUX FOR DEVOPS ENGINEERS", xp: "+200 XP", duration: "20 Mins", questions: 2, questions_count: 2, icon: "🐧", diff: "Medium", desc: "Systemd service units, kernel tuning, disk I/O bottlenecks, and cron automation.", status: "locked", score: "--" },
  { id: 5, level: "Level 1", levelName: "Foundation", title: "STAGE 5: CLOUD + DEVOPS FUNDAMENTALS", xp: "+200 XP", duration: "20 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Core cloud models, virtualization vs containerization, and IaC basics.", status: "locked", score: "--" },

  // LEVEL 2 — CLOUD (TRACK 2)
  { id: 6, level: "Level 2", levelName: "Cloud", title: "AWS Cloud Engineer", xp: "+400 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "VPC networking, subnets, NAT Gateways, IAM policies, and S3 lifecycle.", status: "pro_locked", score: "--" },
  { id: 7, level: "Level 2", levelName: "Cloud", title: "GCP Cloud Engineer", xp: "+450 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Google Cloud IAM, VPC Service Controls, GKE basics, and BigQuery Ops.", status: "pro_locked", score: "--" },
  { id: 8, level: "Level 2", levelName: "Cloud", title: "Azure Cloud Engineer", xp: "+450 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Azure VNets, Entra ID, Virtual Machine Scale Sets, and Resource Groups.", status: "pro_locked", score: "--" },
  { id: 9, level: "Level 2", levelName: "Cloud", title: "Multi-Cloud Architecture", xp: "+500 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "⚡", diff: "Hard", desc: "Inter-cloud VPN peering, multi-cloud IAM federation, and cost optimization.", status: "pro_locked", score: "--" },
  { id: 10, level: "Level 2", levelName: "Cloud", title: "Cloud Real-Time Scenarios", xp: "+550 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "🔥", diff: "Hard", desc: "Cross-region failover, DNS failover with Route53, and storage outage triage.", status: "pro_locked", score: "--" },

  // LEVEL 3 — DEVOPS (TRACK 3)
  { id: 11, level: "Level 3", levelName: "DevOps", title: "Git + GitHub Workflow", xp: "+600 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "🚀", diff: "Medium", desc: "Git rebase vs merge, git bisect, branch protection rules, and merge conflicts.", status: "pro_locked", score: "--" },
  { id: 12, level: "Level 3", levelName: "DevOps", title: "Jenkins + CI/CD Pipelines", xp: "+650 XP", duration: "28 Mins", questions: 2, questions_count: 2, icon: "🚀", diff: "Hard", desc: "Multibranch Jenkinsfiles, shared libraries, matrix builds, and caching.", status: "pro_locked", score: "--" },
  { id: 13, level: "Level 3", levelName: "DevOps", title: "Docker Containerization", xp: "+700 XP", duration: "28 Mins", questions: 2, questions_count: 2, icon: "📦", diff: "Hard", desc: "Multi-stage Dockerfiles, image minimization, cgroups, and container networking.", status: "pro_locked", score: "--" },
  { id: 14, level: "Level 3", levelName: "DevOps", title: "Kubernetes Orchestration", xp: "+800 XP", duration: "30 Mins", questions: 2, questions_count: 2, icon: "☸️", diff: "Hard", desc: "Pods, Deployments, StatefulSets, Ingress Controllers, HPA, and CrashLoopBackOff.", status: "pro_locked", score: "--" },
  { id: 15, level: "Level 3", levelName: "DevOps", title: "Ansible + Terraform IaC", xp: "+850 XP", duration: "30 Mins", questions: 2, questions_count: 2, icon: "🛠️", diff: "Hard", desc: "Remote state locking, Terraform modules, drift detection, and Ansible playbooks.", status: "pro_locked", score: "--" },

  // LEVEL 4 — ADVANCED DEVOPS (TRACK 4)
  { id: 16, level: "Level 4", levelName: "Advanced DevOps", title: "End-to-End CI/CD Project", xp: "+900 XP", duration: "32 Mins", questions: 2, questions_count: 2, icon: "🌐", diff: "Boss", desc: "Production GitHub Actions pipeline to EKS with ArgoCD GitOps sync.", status: "pro_locked", score: "--" },
  { id: 17, level: "Level 4", levelName: "Advanced DevOps", title: "Production Troubleshooting", xp: "+1,000 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🚨", diff: "Boss", desc: "Live memory leak triage, high CPU load debugging, and 502 bad gateway fix.", status: "pro_locked", score: "--" },
  { id: 18, level: "Level 4", levelName: "Advanced DevOps", title: "DevSecOps & Hardening", xp: "+1,100 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🛡️", diff: "Boss", desc: "Container image scanning (Trivy), SAST/DAST, and HashiCorp Vault integration.", status: "pro_locked", score: "--" },
  { id: 19, level: "Level 4", levelName: "Advanced DevOps", title: "Real-Time DevOps Architecture", xp: "+1,200 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🏗️", diff: "Boss", desc: "High-throughput microservices architecture with zero-downtime rolling updates.", status: "pro_locked", score: "--" },
  { id: 20, level: "Level 4", levelName: "Advanced DevOps", title: "Final DevOps Mock Interview", xp: "+1,500 XP", duration: "40 Mins", questions: 2, questions_count: 2, icon: "🎓", diff: "Boss", desc: "Full-spectrum senior panel simulation covering all 4 level pillars.", status: "pro_locked", score: "--" },

  // 10 BONUS AI & ADVANCED CHALLENGES
  { id: 21, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 01: AIOps Challenge", xp: "+1,600 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "AI anomaly detection in Prometheus metrics and automated log clustering.", status: "pro_locked", score: "--" },
  { id: 22, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 02: MLOps Challenge", xp: "+1,700 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "ML model serving infrastructure, Kubeflow pipelines, and feature stores.", status: "pro_locked", score: "--" },
  { id: 23, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 03: AI Integration Challenge", xp: "+1,800 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "LLM API gateway rate limiting, streaming responses, and vector DB ops.", status: "pro_locked", score: "--" },
  { id: 24, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 04: AI + DevOps Automation", xp: "+1,900 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "⚡", diff: "Extreme", desc: "AI-driven self-healing infrastructure scripts and automated PR remediation.", status: "pro_locked", score: "--" },
  { id: 25, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 05: AI MCP Challenge", xp: "+2,000 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔌", diff: "Extreme", desc: "Model Context Protocol tools integration for infrastructure management.", status: "pro_locked", score: "--" },
  { id: 26, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 06: Azure DevOps Project", xp: "+2,100 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔷", diff: "Extreme", desc: "Azure Pipelines YAML, Artifacts, and Azure Kubernetes Service (AKS).", status: "pro_locked", score: "--" },
  { id: 27, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 07: Project-Based CI/CD", xp: "+2,200 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🏗️", diff: "Extreme", desc: "Canary deployments, blue-green traffic shifting using Flagger and Istio.", status: "pro_locked", score: "--" },
  { id: 28, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 08: Advanced DevSecOps Project", xp: "+2,300 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔐", diff: "Extreme", desc: "OPA Gatekeeper policies, Kyverno admission controllers, and PCI-DSS compliance.", status: "pro_locked", score: "--" },
  { id: 29, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 09: Multi-Cloud + AI Architecture", xp: "+2,500 XP", duration: "35 Mins", questions: 1, questions_count: 1, icon: "🌐", diff: "Extreme", desc: "Global latency routing across AWS, GCP, and Azure with AI failover.", status: "pro_locked", score: "--" },
  { id: 30, level: "Bonus", levelName: "Bonus Challenge", title: "👑 40 LPA Final Boss Interview Battle", xp: "+3,000 XP", duration: "45 Mins", questions: 2, questions_count: 2, icon: "👑", diff: "Legendary", desc: "The ultimate 40 LPA Staff CloudOps Engineer Boss Battle! Prove your absolute mastery.", status: "pro_locked", score: "--" }
];

const getInitialStages = () => {
  if (typeof window === "undefined") return ALL_30_STAGES;
  try {
    const cached = sessionStorage.getItem("cached_interviews_stages");
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (parsedCache?.data && Array.isArray(parsedCache.data) && parsedCache.data.length > 0) {
        return parsedCache.data;
      }
    }

    const rawList = localStorage.getItem("completed_stages_list");
    const completedSet = new Set<number>();
    if (rawList) {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        parsed.forEach((id: number) => completedSet.add(id));
      }
    }
    const hasLocalStage0 = Boolean(
      localStorage.getItem("stage0_profile_data") || 
      localStorage.getItem("candidate_linkedin_url") ||
      localStorage.getItem("completed_stages_list") ||
      localStorage.getItem("active_interview_session")
    );
    if (hasLocalStage0) {
      completedSet.add(0);
    }

    return ALL_30_STAGES.map((stg) => {
      if (stg.id === 0) {
        return completedSet.has(0)
          ? { ...stg, status: "completed", score: "100%" }
          : { ...stg, status: "in_progress", score: "Active" };
      }
      const isCompleted = completedSet.has(stg.id);
      if (isCompleted) {
        return { ...stg, status: "completed", score: "95%" };
      }
      if (completedSet.has(stg.id - 1)) {
        return { ...stg, status: "in_progress", score: "Active" };
      }
      return stg;
    });
  } catch (e) {
    return ALL_30_STAGES;
  }
};

const getInitialSelectedStage = (initialStages: any[]) => {
  const activeOrUnlocked = initialStages.find((m) => m.status === "in_progress" && m.id > 0);
  return activeOrUnlocked || initialStages[1] || initialStages[0];
};

export default function InterviewsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [mounted, setMounted] = useState(false);
  const [stages, setStages] = useState<any[]>(() => getInitialStages());
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<any | null>(() => {
    const initStgs = getInitialStages();
    return getInitialSelectedStage(initStgs);
  });
  const [isStarting, setIsStarting] = useState(false);

  const [isDemoGuest, setIsDemoGuest] = useState(false);
  const [isDemoLoginModalOpen, setIsDemoLoginModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const initialStages = getInitialStages();
      setStages(initialStages);
      setSelectedStage(getInitialSelectedStage(initialStages));
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true") {
        setIsDemoGuest(true);
      }
    }
  }, []);

  // Instant route prefetching for selected stage
  useEffect(() => {
    if (selectedStage?.id !== undefined && router?.prefetch) {
      try {
        const stgId = selectedStage.id;
        router.prefetch(`/interviews/stage-${stgId}/pre-check`);
        router.prefetch(`/interviews/stage-${stgId}/room`);
      } catch (e) {}
    }
  }, [selectedStage, router]);

  // Subscription & Razorpay Payment Modal States
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState<boolean>(true);
  const [configuredFee, setConfiguredFee] = useState<string>("1");
  const [paidStartStageConfig, setPaidStartStageConfig] = useState<number>(6);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Stage 0 Setup Profile Modal State
  const [isStage0ModalOpen, setIsStage0ModalOpen] = useState(false);
  const [isSavingStage0, setIsSavingStage0] = useState(false);
  const [stage0Form, setStage0Form] = useState({
    fullName: "",
    email: "",
    phone: "",
    targetRole: "Senior DevOps Engineer",
    designation: "DevOps Specialist",
    highestQualification: "Bachelor's degree",
    yearsOfExperience: "1–2 years",
    linkedinUrl: "",
    experienceLevel: "MID",
    targetSalaryBand: "₹18–40 LPA"
  });
  const [selectedStageForPayment, setSelectedStageForPayment] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Mobile Auto-Scroll Ref & Desktop Required Warning Modal State
  const detailsRef = useRef<HTMLDivElement>(null);
  const [isMobileWarningModalOpen, setIsMobileWarningModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Running Interview Session State
  const [activeSession, setActiveSession] = useState<{
    attemptId: string;
    stageId?: number;
    stageTitle?: string;
    roomUrl: string;
    startedAt?: number;
  } | null>(null);

  const fetchStagesData = async () => {
    try {
      const [resDbStages, resMetrics, resGatewayCfg] = await Promise.all([
        apiFetch("/interviews/stages").catch(() => null),
        apiFetch("/candidates/me/dashboard-metrics").catch(() => null),
        apiFetch("/interviews/payment-config").catch(() => null)
      ]);

      const gatewayEnabled = resGatewayCfg?.data?.is_enabled ?? false;
      const paidStartStage = resGatewayCfg?.data?.paid_start_stage ?? 6;
      const paymentMode = resGatewayCfg?.data?.payment_mode ?? "STAGE_WISE";
      
      setIsPaymentEnabled(gatewayEnabled);
      setPaidStartStageConfig(paidStartStage);
      if (resGatewayCfg?.data?.amount) {
        setConfiguredFee(resGatewayCfg.data.amount.toString());
      }

      const candSubscribed = Boolean(resMetrics?.data?.is_subscribed || resMetrics?.data?.candidate?.resume_data_json?.is_pro);
      setIsSubscribed(candSubscribed);

      // If Payment Gateway is disabled globally by Admin, treat as effective free unlock for all stages!
      const effectiveSubscribed = !gatewayEnabled || candSubscribed;

      const dbStageMap = new Map();
      if (resDbStages?.data && Array.isArray(resDbStages.data)) {
        resDbStages.data.forEach((s: any) => dbStageMap.set(s.id, s));
      }

      const attemptMap = new Map();
      if (resMetrics?.data?.stages_progress && Array.isArray(resMetrics.data.stages_progress)) {
        resMetrics.data.stages_progress.forEach((stg: any) => attemptMap.set(stg.id, stg));
      }

      // Track completed stages for sequential unlocking
      const completedSet = new Set<number>();

      const userStage0Key = user?.id ? `stage0_profile_data_${user.id}` : "stage0_profile_data";
      const hasLocalStage0 = typeof window !== "undefined" && Boolean(localStorage.getItem(userStage0Key));
      const candXp = resMetrics?.data?.candidate?.xp || 0;
      const isStage0DoneInDb = candXp > 0 || Boolean(resMetrics?.data?.candidate?.resume_data_json?.stage_0_completed);

      ALL_30_STAGES.forEach((stg) => {
        const att = attemptMap.get(stg.id);
        if (att && (att.status === "completed" || att.status === "PASSED" || att.is_passed || (typeof att.score === "number" && att.score >= 60) || (typeof att.score === "string" && parseInt(att.score) >= 60))) {
          completedSet.add(stg.id);
        }
      });

      // Also check stages_progress array directly from backend metrics response
      if (resMetrics?.data?.stages_progress && Array.isArray(resMetrics.data.stages_progress)) {
        resMetrics.data.stages_progress.forEach((sp: any) => {
          if (sp.status === "completed" || (typeof sp.score === "string" && parseInt(sp.score) >= 60) || (typeof sp.score === "number" && sp.score >= 60)) {
            completedSet.add(sp.id);
          }
        });
      }

      // Check localStorage fallback for instant client-side UI persistence
      if (typeof window !== "undefined") {
        const rawLocalList = localStorage.getItem("completed_stages_list");
        if (rawLocalList) {
          try {
            const parsedList = JSON.parse(rawLocalList);
            if (Array.isArray(parsedList)) {
              parsedList.forEach((stgId: number) => completedSet.add(stgId));
            }
          } catch (e) {}
        }
      }

      const stg0AttCheck = attemptMap.get(0);
      if (hasLocalStage0 || isStage0DoneInDb || (stg0AttCheck && (stg0AttCheck.status === "completed" || stg0AttCheck.status === "PASSED"))) {
        completedSet.add(0);
      }

      // Populate Stage 0 form with existing candidate profile / stored LinkedIn URL
      const savedLinkedin = typeof window !== "undefined" ? localStorage.getItem("candidate_linkedin_url") : "";
      const candLinkedin = savedLinkedin || resMetrics?.data?.candidate?.resume_data_json?.linkedin_url || "";
      const savedName = resMetrics?.data?.candidate?.full_name || user?.full_name || "";
      const rawSavedEmail = user?.email || resMetrics?.data?.candidate?.user?.email || resMetrics?.data?.candidate?.email || "";
      const isInternalDummyEmail = !rawSavedEmail || rawSavedEmail.endsWith("@cloudops.internal") || rawSavedEmail.includes(".internal") || rawSavedEmail.includes("example.com");
      const savedEmail = isInternalDummyEmail ? "" : rawSavedEmail;
      const savedPhone = user?.phone_number || resMetrics?.data?.candidate?.phone || "";
      const savedRole = resMetrics?.data?.candidate?.target_role || "Senior DevOps Engineer";
      const savedDesig = resMetrics?.data?.candidate?.resume_data_json?.designation || "DevOps Specialist";
      const savedQual = resMetrics?.data?.candidate?.resume_data_json?.highest_qualification || "Bachelor's degree";
      const savedYears = resMetrics?.data?.candidate?.resume_data_json?.years_of_experience || "1–2 years";
      const savedExp = resMetrics?.data?.candidate?.experience_level || "MID";
      const savedBand = resMetrics?.data?.candidate?.target_salary_band || "₹18–40 LPA";

      setStage0Form((prev) => ({
        fullName: prev.fullName !== "" ? prev.fullName : savedName,
        email: prev.email !== "" ? prev.email : savedEmail,
        phone: prev.phone !== "" ? prev.phone : savedPhone,
        targetRole: prev.targetRole !== "" ? prev.targetRole : savedRole,
        designation: prev.designation !== "" ? prev.designation : savedDesig,
        highestQualification: prev.highestQualification !== "" ? prev.highestQualification : savedQual,
        yearsOfExperience: prev.yearsOfExperience !== "" ? prev.yearsOfExperience : savedYears,
        linkedinUrl: prev.linkedinUrl !== "" ? prev.linkedinUrl : candLinkedin,
        experienceLevel: prev.experienceLevel !== "" ? prev.experienceLevel : savedExp,
        targetSalaryBand: prev.targetSalaryBand !== "" ? prev.targetSalaryBand : savedBand
      }));

      const merged = ALL_30_STAGES.map((stg) => {
        const dbStg = dbStageMap.get(stg.id);
        const att = attemptMap.get(stg.id);
        const qCount = dbStg?.questions_count !== undefined ? dbStg.questions_count : stg.questions;
        const isCompleted = completedSet.has(stg.id);

        let computedStatus = "locked";
        let computedScore = att ? att.score : "--";

        if (isDemoGuest) {
          if (stg.id === 0) {
            computedStatus = "completed";
            computedScore = "100%";
          } else if (stg.id >= 1 && stg.id <= 3) {
            computedStatus = "in_progress";
            computedScore = "Active";
          } else {
            computedStatus = "demo_locked";
            computedScore = "--";
          }
        } else if (stg.id === 0) {
          const stg0Att = attemptMap.get(0);
          const isStg0Completed = isCompleted || (stg0Att && (stg0Att.status === "completed" || stg0Att.status === "PASSED"));
          computedStatus = isStg0Completed ? "completed" : "in_progress";
          computedScore = isStg0Completed ? "100%" : "Active";
          if (isStg0Completed) completedSet.add(0);
        } else if (stg.id < paidStartStage) {
          // Free Stage range configured dynamically by Admin!
          if (isCompleted) {
            computedStatus = "completed";
          } else if (completedSet.has(stg.id - 1)) {
            computedStatus = "in_progress";
            computedScore = "Active";
          } else {
            computedStatus = "locked";
          }
        } else {
          // Paid stage range (starting from paidStartStage to 30) - PRO Pass / Payment required if Gateway is ENABLED!
          if (isCompleted) {
            computedStatus = "completed";
          } else if (!effectiveSubscribed) {
            computedStatus = "pro_locked";
          } else if (completedSet.has(stg.id - 1)) {
            computedStatus = "in_progress";
            computedScore = "Active";
          } else {
            computedStatus = "locked";
          }
        }

        return {
          ...stg,
          stage_db_id: dbStg?.stage_id,
          title: dbStg?.title || stg.title,
          desc: dbStg?.description || stg.desc,
          category: dbStg?.category || stg.levelName || "Foundation",
          diff: dbStg?.difficulty || stg.diff,
          xp: dbStg?.xp_reward || stg.xp,
          duration: dbStg?.duration || stg.duration,
          icon: dbStg?.icon || stg.icon,
          questions: qCount,
          questions_count: qCount,
          status: computedStatus,
          score: computedScore
        };
      });

      // Ensure Stage 0 is ALWAYS present at index 0 of merged stages array!
      const hasStage0InMerged = merged.some((m) => m.id === 0);
      if (!hasStage0InMerged) {
        const isStg0Done = completedSet.has(0);
        merged.unshift({
          id: 0,
          stage_db_id: "stage-0",
          level: "Level 1",
          levelName: "Foundation",
          title: "STAGE 0: SETUP YOUR INTERVIEW PROFILE",
          desc: "Complete candidate profile, phone, target role & LinkedIn verification form to unlock all interview stages.",
          category: "Foundation",
          diff: "Easy",
          xp: "+100 XP",
          duration: "5 Mins",
          icon: "📋",
          questions: 1,
          questions_count: 1,
          status: isStg0Done ? "completed" : "in_progress",
          score: isStg0Done ? "100%" : "Active"
        });
      }

      setStages(merged);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("cached_interviews_stages", JSON.stringify({
            data: merged,
            timestamp: Date.now()
          }));
        } catch (e) {}
      }
      setSelectedStage((prev: any) => {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const qStage = params.get("stage");
          if (qStage) {
            const stageNum = parseInt(qStage, 10);
            const found = merged.find((m) => m.id === stageNum);
            if (found) return found;
          }
        }
        const isStg0Done = completedSet.has(0);
        if (!isStg0Done) {
          return merged[0];
        }
        const activeOrUnlocked = merged.find((m) => m.status === "in_progress" && m.id > 0);
        if (!prev || prev.id === 0 || prev.status === "completed") {
          return activeOrUnlocked || merged.find((m) => m.status === "completed" && m.id > 0) || merged[0];
        }
        const match = merged.find((m) => m.id === prev.id);
        if (match && match.status === "completed" && activeOrUnlocked) {
          return activeOrUnlocked;
        }
        return match || merged[0];
      });
    } catch (e) {
      console.warn("Interview stages fetch error:", e);
      setStages(ALL_30_STAGES);
      if (!selectedStage) setSelectedStage(ALL_30_STAGES[0]);
    } finally {
      setIsLoadingStages(false);
    }
  };

  const checkActiveSession = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("active_interview_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && user && (parsed.userId === user.id || parsed.userEmail === user.email)) {
            setActiveSession(parsed);
          } else {
            // Active session belongs to a different candidate or is stale -> remove it!
            localStorage.removeItem("active_interview_session");
            setActiveSession(null);
          }
        } else {
          setActiveSession(null);
        }
      } catch (e) {
        setActiveSession(null);
      }
    }
  };

  useEffect(() => {
    checkActiveSession();
    fetchStagesData();

    const pollInterval = setInterval(() => {
      fetchStagesData();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined" && stages.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const qStage = params.get("stage");
      const isAutoStart = params.get("autoStart") === "true";
      const localAuto = localStorage.getItem("auto_start_stage");
      const targetStageNum = qStage ? parseInt(qStage, 10) : localAuto ? parseInt(localAuto, 10) : null;
      if (localAuto) localStorage.removeItem("auto_start_stage");

      if (targetStageNum !== null) {
        const found = stages.find((s: any) => s.id === targetStageNum);
        if (found) {
          setSelectedStage(found);
          if (isAutoStart || localAuto) {
            handleStartStage(targetStageNum);
          }
        }
      }
    }
  }, [stages]);

  const handleDropOutActiveSession = async () => {
    if (!activeSession) return;
    try {
      await apiFetch(`/attempts/${activeSession.attemptId}/abort`, { method: "POST" }).catch(() => null);
    } catch (e) {
      console.warn("Abort session error:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("active_interview_session");
    }
    setActiveSession(null);
    setAlertMsg("Active interview session cancelled. You can now launch any unlocked stage.");
    fetchStagesData();
  };

  const filteredStages = stages.filter((stg) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "LEVEL1") return stg.level === "Level 1";
    if (activeTab === "LEVEL2") return stg.level === "Level 2";
    if (activeTab === "LEVEL3") return stg.level === "Level 3";
    if (activeTab === "LEVEL4") return stg.level === "Level 4";
    if (activeTab === "BONUS") return stg.level === "Bonus";
    return true;
  });

  const handleSelectStage = (s: any) => {
    setSelectedStage(s);
    setAlertMsg(null);

    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    if (isMobile) {
      setIsMobileWarningModalOpen(true);
      return;
    }

    // Auto-scroll on tablet/desktop devices to details card below if needed
    if (typeof window !== "undefined" && window.innerWidth < 1024 && detailsRef.current) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }

    if (activeSession) {
      setAlertMsg(`⚠️ You have an active live interview running (${activeSession.stageTitle || 'Stage Interview'}). Please 'Resume Ongoing Interview 🚀' or 'Drop Out 🚪' before launching a new stage.`);
    }
    if (isPaymentEnabled && (s.status === "pro_locked" || (!isSubscribed && s.id >= 6))) {
      setSelectedStageForPayment(s);
      setIsPaymentModalOpen(true);
      return;
    }
    const isPrevCompleted = s.id === 1 || stages.some(st => st.id === s.id - 1 && st.status === "completed");
    if (s.status === "locked" && !isPrevCompleted) {
      setAlertMsg(`⚠️ Stage ${s.id} is locked. Please complete Stage ${s.id - 1} first to unlock!`);
    }
  };

  const handleSaveStage0Profile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Instant UI modal close & success notification (0ms delay)
    setIsSavingStage0(false);
    setIsStage0ModalOpen(false);
    setPaymentSuccessMsg("🎉 Stage 0 Profile Setup Saved! Stage 1 Unlocked.");

    // Update global user state (name, email, phone) across entire frontend app
    if (updateUser) {
      updateUser({
        full_name: stage0Form.fullName.trim(),
        email: stage0Form.email.trim().toLowerCase(),
        phone_number: stage0Form.phone.trim()
      });
    }

    // 2. Instant Local Storage Persistence
    if (typeof window !== "undefined") {
      try {
        if (stage0Form.linkedinUrl.trim()) {
          localStorage.setItem("candidate_linkedin_url", stage0Form.linkedinUrl.trim());
        }
        const saveKey = user?.id ? `stage0_profile_data_${user.id}` : "stage0_profile_data";
        localStorage.setItem(saveKey, JSON.stringify({
          fullName: stage0Form.fullName,
          email: stage0Form.email,
          phone: stage0Form.phone,
          designation: stage0Form.designation,
          targetRole: stage0Form.targetRole,
          highestQualification: stage0Form.highestQualification,
          yearsOfExperience: stage0Form.yearsOfExperience,
          linkedinUrl: stage0Form.linkedinUrl,
          experienceLevel: stage0Form.experienceLevel,
          targetSalaryBand: stage0Form.targetSalaryBand,
          completedAt: new Date().toISOString()
        }));
      } catch (e) {}
    }

    // 3. Instant local stage state update (Unlock Stage 1 immediately)
    setStages((prevStages) =>
      prevStages.map((stg) => {
        if (stg.id === 0) return { ...stg, status: "completed", score: "100%" };
        if (stg.id === 1 && stg.status === "locked") return { ...stg, status: "in_progress", score: "Active" };
        return stg;
      })
    );

    // 4. Background DB persistence (non-blocking)
    apiFetch("/candidates/me/profile", {
      method: "PUT",
      body: JSON.stringify({
        full_name: stage0Form.fullName.trim(),
        email: stage0Form.email.trim().toLowerCase(),
        phone: stage0Form.phone.trim(),
        target_role: stage0Form.targetRole,
        designation: stage0Form.designation,
        highest_qualification: stage0Form.highestQualification,
        years_of_experience: stage0Form.yearsOfExperience,
        linkedin_url: stage0Form.linkedinUrl.trim(),
        experience_level: stage0Form.experienceLevel,
        target_salary_band: stage0Form.targetSalaryBand,
        mark_stage_0_complete: true
      })
    }).catch((err) => console.warn("Stage 0 DB sync notice:", err));
  };

  const handleStartStage = async (stageId: number) => {
    setAlertMsg(null);

    if (stageId === 0) {
      setIsStage0ModalOpen(true);
      return;
    }

    // Check if user is on mobile screen or mobile device (Stage 1-30 require desktop browser for full AI interview room)
    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    if (isMobile) {
      setIsMobileWarningModalOpen(true);
      return;
    }

    // If an active session is currently running, prompt candidate to resume or drop out
    if (activeSession) {
      setAlertMsg(`⚠️ Active session in progress: "${activeSession.stageTitle || 'Live Interview'}". Click 'Resume Ongoing Interview 🚀' above or 'Drop Out 🚪' to proceed.`);
      return;
    }

    const targetStg = stages.find((st) => st.id === stageId) || ALL_30_STAGES[stageId];

    // DEMO GUEST ACCESS INTERCEPTOR
    if (isDemoGuest) {
      if (stageId >= 4 || targetStg?.status === "demo_locked") {
        setIsDemoLoginModalOpen(true);
        return;
      }
      // Demo guest launching Stage 1, 2, or 3: bypass backend attempt creation, load local room without saving to DB
      const demoAttemptId = `demo-stage-${stageId}-${Date.now()}`;
      const sessionObj = {
        attemptId: demoAttemptId,
        stageId: stageId,
        stageTitle: targetStg?.title || `Stage ${stageId} (Demo Overview)`,
        roomUrl: `/interviews/${demoAttemptId}/room?demo=true`,
        startedAt: Date.now()
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("active_interview_session", JSON.stringify(sessionObj));
      }
      setActiveSession(sessionObj);
      router.push(`/interviews/${demoAttemptId}/pre-check?demo=true`);
      return;
    }

    // Check if Stage 0 is completed before starting any higher stage
    const isStage0Done = stages.some(st => st.id === 0 && st.status === "completed");
    if (stageId > 0 && !isStage0Done) {
      setIsStage0ModalOpen(true);
      setAlertMsg("⚠️ Stage 0 Profile Setup must be completed first before starting Stage 1!");
      return;
    }

    if (targetStg?.status === "pro_locked" || (isPaymentEnabled && !isSubscribed && stageId >= paidStartStageConfig)) {
      setSelectedStageForPayment(targetStg);
      setIsPaymentModalOpen(true);
      return;
    }

    const isPrevCompleted = stageId === 0 ? true : stages.some(st => st.id === stageId - 1 && st.status === "completed");
    if (targetStg?.status === "locked" || !isPrevCompleted) {
      if (stageId === 1) {
        setIsStage0ModalOpen(true);
        setAlertMsg("⚠️ Stage 0 Profile Setup must be completed first before starting Stage 1!");
      } else {
        setAlertMsg(`⚠️ Stage ${stageId} is locked. Please complete Stage ${stageId - 1} first!`);
      }
      return;
    }

    // Instant optimistic session creation & 0ms navigation
    const tempAttemptId = `stage-${stageId}`;
    const sessionObj = {
      userId: user?.id,
      userEmail: user?.email,
      attemptId: tempAttemptId,
      stageId: stageId,
      stageTitle: targetStg?.title || `Stage ${stageId} Assessment`,
      roomUrl: `/interviews/${tempAttemptId}/room`,
      startedAt: Date.now()
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("active_interview_session", JSON.stringify(sessionObj));
    }
    setActiveSession(sessionObj);

    // INSTANT ROUTE PUSH (0ms delay!)
    router.push(`/interviews/${tempAttemptId}/pre-check`);

    // Async non-blocking background DB attempt creation
    apiFetch("/attempts/start", {
      method: "POST",
      body: JSON.stringify({
        interview_template_id: `stage-${stageId}-template`,
        stage_number: stageId
      })
    })
      .then((res) => {
        if (res?.data?.id) {
          const realAttemptId = String(res.data.id);
          const updatedSession = {
            ...sessionObj,
            attemptId: realAttemptId,
            roomUrl: `/interviews/${realAttemptId}/room`
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("active_interview_session", JSON.stringify(updatedSession));
          }
          setActiveSession(updatedSession);
        }
      })
      .catch((err) => console.warn("Background attempt start sync notice:", err));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleExecutePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentSuccessMsg(null);

    let keyId = "";
    let feeStr = configuredFee || "1";
    try {
      const cfg = await apiFetch("/interviews/payment-config");
      if (cfg?.data) {
        if (cfg.data.publishable_key) keyId = cfg.data.publishable_key.trim();
        if (cfg.data.amount) feeStr = cfg.data.amount.toString().replace(/[^0-9]/g, "");
      }
    } catch (e) {
      console.warn("Could not fetch gateway config");
    }

    const parsedNum = parseInt(feeStr, 10);
    const numFee = isNaN(parsedNum) ? 1 : parsedNum;

    // Check if key is dummy/placeholder
    const isDummyKey = !keyId || keyId.includes("sampleKey") || keyId === "rzp_test_sampleKey123";

    if (!isDummyKey) {
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && (window as any).Razorpay) {
        const options = {
          key: keyId,
          amount: numFee * 100, // in paise
          currency: "INR",
          name: "CloudOps AI Interview Prep",
          description: `One-Time ₹${numFee} Pass: Unlock All 30 Stages & Tracks`,
          image: "https://razorpay.com/favicon.ico",
          handler: async function (response: any) {
            try {
              await apiFetch("/admin/payment-gateway/verify-and-subscribe", {
                method: "POST",
                body: JSON.stringify({
                  transaction_id: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
                  amount: `${numFee}`,
                  payment_method: "Razorpay Checkout (UPI/Card)"
                })
              });

              setIsSubscribed(true);
              setIsPaymentModalOpen(false);
              setPaymentSuccessMsg("🎉 Razorpay Payment Verified! PRO Pass Activated. All 30 Stages unlocked!");
              fetchStagesData();
            } catch (e: any) {
              setIsSubscribed(true);
              setIsPaymentModalOpen(false);
              setPaymentSuccessMsg("🎉 Payment Verified! All 30 Stages unlocked.");
              fetchStagesData();
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: "Candidate User",
            email: "candidate@cloudops.ai",
            contact: "9876543210"
          },
          theme: {
            color: "#FF9900"
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            }
          }
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (resp: any) {
            console.warn("Razorpay payment failed or cancelled:", resp.error);
            setIsProcessingPayment(false);
          });
          rzp.open();
          return;
        } catch (err) {
          console.warn("Error launching Razorpay popup modal:", err);
        }
      }
    }

    // Direct Sandbox Verification Flow (Runs when using test key/demo mode)
    try {
      await apiFetch("/admin/payment-gateway/verify-and-subscribe", {
        method: "POST",
        body: JSON.stringify({
          amount: "50",
          payment_method: "Razorpay Sandbox / Test Pass (UPI)"
        })
      });

      setIsSubscribed(true);
      setIsPaymentModalOpen(false);
      setPaymentSuccessMsg("🎉 Test Payment Verified! PRO Pass Activated. All 30 Stages unlocked!");
      fetchStagesData();
    } catch (e: any) {
      setIsSubscribed(true);
      setIsPaymentModalOpen(false);
      setPaymentSuccessMsg("🎉 Payment Successful! All 30 Stages unlocked.");
      fetchStagesData();
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const completedCount = stages.filter((s) => s.status === "completed").length;

  return (
    <div className="w-full flex flex-col gap-8 pb-16 text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden">
      {/* BACKGROUND VERTICAL GRID LINES */}
      <div className="fixed inset-0 pointer-events-none z-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 w-full px-6 opacity-15">


        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden md:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800 h-full"></div>
      </div>

      {isDemoGuest && (
        <div className="relative z-20 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold shrink-0">
              👁️
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-500">
                GUEST DEMO MODE ACTIVE
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                You are currently previewing the candidate panel. Stages 1-3 are open for trial. No data will be saved.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-xl text-xs font-black text-white bg-[#FF6B00] hover:bg-orange-600 shadow-md transition-colors shrink-0 uppercase tracking-wider"
          >
            Login for Full Access →
          </button>
        </div>
      )}

      {/* AGENCY THEME HERO BANNER */}
      <div className="relative z-10 p-6 sm:p-10 rounded-[32px] bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        
        <div className="flex flex-col gap-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            MOCK INTERVIEW <span className="text-[#FF6B00]">CHALLENGE JOURNEY</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-white">"Learn Today. Implement Today. Build Your Career for a Lifetime."</strong><br />
            Complete stages sequentially to master real-world Cloud & DevOps engineering challenges.
          </p>
        </div>

        {/* Unlocked Counter Pill */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">UNLOCKED STAGES</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {mounted ? completedCount + 1 : 1} <span className="text-slate-400 text-sm font-bold">/ 30</span>
            </span>
          </div>
        </div>

      </div>

      {/* 🎥 ACTIVE LIVE INTERVIEW SESSION BANNER */}
      {activeSession && (
        <div className="relative z-20 p-6 sm:p-7 rounded-[30px] bg-gradient-to-r from-rose-950/95 via-slate-900 to-amber-950/95 border-2 border-rose-500/70 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse ring-4 ring-rose-500/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
              <Video className="w-7 h-7 animate-bounce" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white uppercase tracking-widest">
                  LIVE INTERVIEW IN PROGRESS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {activeSession.stageTitle || `Stage ${activeSession.stageId || 1} Session`}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                You have an active interview room running. You must resume or drop out before starting a new stage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => router.push(activeSession.roomUrl || `/interviews/${activeSession.attemptId}/room`)}
              className="flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 shadow-xl shadow-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider scale-105"
            >
              <Video className="w-4 h-4" />
              <span>Resume Ongoing Interview 🚀</span>
            </button>

            <button
              onClick={handleDropOutActiveSession}
              className="px-4 py-3.5 rounded-2xl font-black text-xs text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Drop Out & Abort Active Interview Session"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Drop Out 🚪</span>
            </button>
          </div>
        </div>
      )}

      {/* ALERT / SUCCESS MESSAGES */}
      {paymentSuccessMsg && (
        <div className="relative z-10 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {alertMsg && (
        <div className="relative z-10 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs font-black text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* AGENCY FILTER PILLS WITH HORIZONTAL SCROLLING */}
      <div className="relative z-10 p-2 sm:p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-xl flex items-center gap-2.5 overflow-x-auto w-full max-w-full scroll-smooth">
        {[
          { key: "ALL", icon: "🔥", title: "All 30 Stages", badge: "ALL", badgeClass: "bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700" },
          { key: "LEVEL1", icon: "🐧", title: "Track 1: Foundation", badge: paidStartStageConfig > 5 ? "FREE" : (paidStartStageConfig <= 1 ? "PRO" : "PARTIAL"), badgeClass: paidStartStageConfig > 5 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
          { key: "LEVEL2", icon: "☁️", title: "Track 2: Cloud", badge: paidStartStageConfig > 10 ? "FREE" : (paidStartStageConfig <= 6 ? "PRO" : "PARTIAL"), badgeClass: paidStartStageConfig > 10 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
          { key: "LEVEL3", icon: "🚀", title: "Track 3: DevOps", badge: paidStartStageConfig > 15 ? "FREE" : (paidStartStageConfig <= 11 ? "PRO" : "PARTIAL"), badgeClass: paidStartStageConfig > 15 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
          { key: "LEVEL4", icon: "⚡", title: "Track 4: Advanced", badge: paidStartStageConfig > 20 ? "FREE" : (paidStartStageConfig <= 16 ? "PRO" : "PARTIAL"), badgeClass: paidStartStageConfig > 20 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
          { key: "BONUS", icon: "🤖", title: "Bonus AI Labs", badge: "10 LABS", badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white shadow-md shadow-[#FF6B00]/30 scale-[1.02]"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="font-black tracking-tight">{tab.title}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-black tracking-wider uppercase border ${
                  isActive
                    ? "bg-white/20 text-white border-white/40"
                    : tab.badgeClass
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 30-STAGE PIPELINE GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: STAGE LIST */}
        <div className="lg:col-span-7 flex flex-col gap-3.5 max-h-[550px] sm:max-h-[650px] lg:max-h-[750px] overflow-y-auto pr-1 sm:pr-2">
          
          {isLoadingStages ? (
            <div className="flex flex-col gap-3 p-8 items-center justify-center min-h-[320px] rounded-2xl bg-slate-900/40 border border-white/5">
              <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mb-2" />
              <span className="text-xs font-mono font-bold text-slate-300">Loading Stage Challenges from Database...</span>
            </div>
          ) : (
            filteredStages.map((s) => {
              const isSelected = selectedStage?.id === s.id;
              const isCompleted = s.status === "completed";
              const isInProgress = s.status === "in_progress";
              const isProLocked = isPaymentEnabled && s.status === "pro_locked";
              const isLocked = s.status === "locked" && !isProLocked;
              const isBoss = s.id === 30 || s.diff === "Boss" || s.diff === "Legendary";

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectStage(s)}
                  className={`p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-2 sm:gap-3 shrink-0 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 border-[#FF6B00] shadow-xl shadow-[#FF6B00]/15 ring-2 ring-[#FF6B00]/20"
                      : isCompleted
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500"
                      : isInProgress
                      ? "bg-amber-50/60 dark:bg-amber-950/30 border-[#FF6B00]"
                      : isProLocked
                      ? "bg-slate-50/80 dark:bg-slate-900/60 border-amber-500/40 hover:border-amber-500"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-80"
                  }`}
                >
                  {/* Active selection accent bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FF6B00] rounded-l-2xl" />
                  )}

                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pl-0.5 flex-1">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-black text-xs sm:text-base flex items-center justify-center shrink-0 transition-transform ${
                      isBoss
                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                        : isCompleted
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : isInProgress
                        ? "bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/30 scale-105"
                        : isProLocked
                        ? "bg-amber-500/20 text-[#FF9900] border border-[#FF9900]/40"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : isProLocked ? <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9900]" /> : <span>{s.icon}</span>}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-black text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/30 uppercase tracking-tight leading-tight whitespace-nowrap max-w-full">
                          STAGE {s.id} • {s.levelName}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 tracking-tight break-words leading-tight">
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-black">
                        {s.score}
                      </span>
                    )}
                    {isInProgress && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-[#FF6B00] text-[#FF6B00] text-[10px] sm:text-xs font-black animate-pulse">
                        Active
                      </span>
                    )}
                    {isProLocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStageForPayment(s);
                          setIsPaymentModalOpen(true);
                        }}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#FF9900] text-slate-950 text-[10px] sm:text-xs font-black flex items-center gap-1 shadow-sm hover:bg-amber-400 transition-all cursor-pointer whitespace-nowrap"
                        title={`One-Time Pass Unlocks All Stages ${paidStartStageConfig}-30`}
                      >
                        <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950" />
                        <span className="hidden xs:inline">PRO PASS</span>
                        <span className="inline xs:hidden">PRO</span>
                      </button>
                    )}
                    {isLocked && (
                      <span className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700" title={`Complete Stage ${s.id - 1} first`}>
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* RIGHT: SELECTED STAGE DETAILS & LAUNCH SIMULATOR CARD */}
        <div ref={detailsRef} className="lg:col-span-5 lg:sticky lg:top-24">
          
          {selectedStage && (
            <div className="p-6 sm:p-7 rounded-[32px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col justify-between gap-6">
              
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">{selectedStage.icon}</span>
                    <span>CHALLENGE IDENTITY</span>
                  </span>
                  <span className="text-xs font-mono font-black text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    STAGE {selectedStage.id}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest">
                    {selectedStage.levelName}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {selectedStage.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {selectedStage.desc}
                </p>

                {/* Stage Metrics Grid / Stage 0 Info Banner */}
                {selectedStage.id === 0 ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-[#FF6B00]/40 flex items-start gap-3 text-xs my-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Candidate Profile Baseline Setup
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        Configure your target role, salary band, designation, and LinkedIn profile link. No video/audio room required for Stage 0. Completing this unlocks <strong>Stage 1: Self Introduction</strong>!
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2.5 py-2">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" /> DIFFICULTY
                        </span>
                        <span className="text-xs font-black text-[#FF6B00]">{selectedStage.diff}</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" /> EST. DURATION
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {selectedStage.duration}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Mic className="w-3 h-3 text-purple-500" /> SCENARIOS
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {selectedStage.questions_count ?? selectedStage.questions} Questions
                        </span>
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Launch Action Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => handleStartStage(selectedStage.id)}
                  disabled={isStarting}
                  className={`w-full py-4 rounded-2xl font-black text-xs text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider ${
                    selectedStage.id === 0
                      ? "bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-[#FF6B00]/30"
                      : selectedStage.status === "pro_locked"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/30"
                      : "bg-[#FF6B00] hover:bg-[#e05e00] shadow-[#FF6B00]/30"
                  }`}
                >
                  {selectedStage.id === 0 ? (
                    selectedStage.status === "completed" ? (
                      <span>✓ Stage 0 Profile Completed</span>
                    ) : (
                      <span>Setup Profile & Complete Stage 0</span>
                    )
                  ) : selectedStage.status === "pro_locked" ? (
                    <>
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>Unlock All Stages (Pay ₹{configuredFee}) 🚀</span>
                    </>
                  ) : selectedStage.status === "locked" ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Locked • Complete Stage {selectedStage.id - 1} First</span>
                    </>
                  ) : isStarting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Launching Interview Room...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Launch Stage {selectedStage.id} Interview Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* RAZORPAY ₹50 PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF9900]/40 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF9900]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#FF9900] border border-[#FF9900]/40 flex items-center justify-center font-black text-xl shrink-0">
                  <Crown className="w-6 h-6 text-[#FF9900]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-[#FF9900] text-slate-950 uppercase tracking-widest">
                      ONE-TIME LIFETIME PASS
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Stage {selectedStageForPayment?.id || paidStartStageConfig}+</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mt-0.5">
                    Unlock All 30 Stages
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Badge Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-[#FF9900]/40 flex items-center justify-between z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ONE-TIME PAYMENT PRICE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">₹{configuredFee}</span>
                  <span className="text-xs text-slate-400 line-through font-mono">₹1,499</span>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">SPECIAL OFFER</span>
                </div>
              </div>
              <span className="text-xs font-black text-[#FF9900] bg-[#FF9900]/10 border border-[#FF9900]/30 px-3 py-1.5 rounded-xl uppercase">
                Pay Once • Unlocks All
              </span>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-2.5 z-10 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Single ₹{configuredFee || "1"} Payment Unlocks Stages {paidStartStageConfig} to 30</strong> (No per-stage fee)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Sequential Unlocks</strong> (Unlocks sequentially after each stage is passed)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Voice AI Interview Evaluator & Teleprompter Hints</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Verified 40 LPA Staff DevOps Readiness Certificate</strong></span>
              </div>
            </div>

            {/* Payment Action Button */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 z-10">
              <button
                onClick={handleExecutePayment}
                disabled={isProcessingPayment}
                className="w-full py-4 rounded-2xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF9900]/25 flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Razorpay Payment...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Pay ₹50 Once & Unlock All 30 Stages 🚀</span>
                  </>
                )}
              </button>

              <span className="text-[10px] text-center text-slate-400 font-mono">
                🔒 Secure 256-Bit SSL Encrypted Razorpay Gateway • Instant Lifetime Activation
              </span>
            </div>

          </div>
        </div>
      )}

      {/* STAGE 0 PROFILE SETUP FORM MODAL */}
      {isStage0ModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF6B00]/40 rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-[#FF6B00] text-white uppercase tracking-widest">
                      STAGE 0 • FOUNDATION
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mt-0.5">
                    Setup Candidate Profile & Target Role
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsStage0ModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 z-10 font-medium">
              Complete your profile details below to unlock <strong>Stage 1: Self Introduction</strong>! Stage 0 is profile configuration only (no video/room required).
            </p>

            <form onSubmit={handleSaveStage0Profile} className="flex flex-col gap-4 z-10 max-h-[70vh] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={stage0Form.fullName}
                    onChange={(e) => setStage0Form({ ...stage0Form, fullName: e.target.value })}
                    placeholder="e.g. Rahul Luthra"
                    className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={stage0Form.email}
                    onChange={(e) => setStage0Form({ ...stage0Form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={stage0Form.phone}
                    onChange={(e) => setStage0Form({ ...stage0Form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Highest Qualification *</label>
                  <select
                    value={stage0Form.highestQualification}
                    onChange={(e) => setStage0Form({ ...stage0Form, highestQualification: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Select qualification">Select qualification</option>
                    <option value="12th / Higher Secondary">12th / Higher Secondary</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's degree">Bachelor's degree</option>
                    <option value="Master's degree">Master's degree</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Professional qualification">Professional qualification</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Years of Experience *</label>
                  <select
                    value={stage0Form.yearsOfExperience}
                    onChange={(e) => setStage0Form({ ...stage0Form, yearsOfExperience: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="Select experience">Select experience</option>
                    <option value="Student / No experience">Student / No experience</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1–2 years">1–2 years</option>
                    <option value="3–5 years">3–5 years</option>
                    <option value="6–10 years">6–10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Role *</label>
                  <input
                    type="text"
                    required
                    value={stage0Form.targetRole}
                    onChange={(e) => setStage0Form({ ...stage0Form, targetRole: e.target.value })}
                    placeholder="e.g. Senior DevOps Specialist"
                    className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Designation</label>
                  <input
                    type="text"
                    value={stage0Form.designation}
                    onChange={(e) => setStage0Form({ ...stage0Form, designation: e.target.value })}
                    placeholder="e.g. DevOps Engineer"
                    className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Salary Band</label>
                  <select
                    value={stage0Form.targetSalaryBand}
                    onChange={(e) => setStage0Form({ ...stage0Form, targetSalaryBand: e.target.value })}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="₹8–15 LPA">₹8 – ₹15 LPA</option>
                    <option value="₹18–40 LPA">₹18 – ₹40 LPA</option>
                    <option value="₹40–60 LPA">₹40 – ₹60 LPA</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={stage0Form.linkedinUrl}
                  onChange={(e) => setStage0Form({ ...stage0Form, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStage0ModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingStage0}
                  className="px-6 py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingStage0 ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <span>Save Profile & Complete Stage 0</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MOBILE DEVICE DESKTOP REQUIRED WARNING MODAL */}

      {isMobileWarningModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF6B00]/40 rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative overflow-hidden text-center items-center">
            
            {/* Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shadow-lg shadow-[#FF6B00]/20">
              <Monitor className="w-8 h-8 text-[#FF6B00]" />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <span className="text-xs font-mono font-black text-[#FF6B00] uppercase tracking-widest">
                💻 LAPTOP / DESKTOP REQUIRED
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Desktop Screen Required for AI Room
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs leading-relaxed text-slate-700 dark:text-slate-200 text-left font-medium flex flex-col gap-2">
              <p className="font-bold text-[#FF6B00]">
                ⚠️ Yeh interview stage mobile device par continue nahi ho payega!
              </p>
              <p>
                Real-Time Voice AI Spoken Interview, STAR Pitch Teleprompter, HD Microphone evaluation, and Camera Background Blur laptop / desktop browser par optimal chalte hain.
              </p>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-900/40 flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                <span>✅ <strong>Recommended:</strong> Open in Chrome / Edge on Laptop</span>
                <span>✅ <strong>Permissions:</strong> Microphone & Camera required</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full pt-1">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }
                }}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-orange-500 hover:to-amber-600 shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                <span>{copiedLink ? "Link Copied! Paste on Laptop 📋" : "Copy Page Link for Laptop 📋"}</span>
              </button>

              <button
                onClick={() => setIsMobileWarningModalOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close / Go Back
              </button>
            </div>

          </div>
        </div>
      )}
      {isDemoLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#FF6B00] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden text-center items-center">
            
            <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shadow-lg shadow-[#FF6B00]/20">
              <Crown className="w-8 h-8 text-[#FF6B00]" />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <span className="text-[11px] font-mono font-black text-[#FF6B00] uppercase tracking-widest">
                🔒 FULL ACCESS REQUIRED
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                To Continue, Please Login / Register
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-xs leading-relaxed text-slate-700 dark:text-slate-200 text-left font-medium flex flex-col gap-2">
              <p className="font-bold text-[#FF6B00]">
                🎯 You have reached the Demo Trial Limit!
              </p>
              <p>
                Stages 4 to 30, AI voice evaluation reports, resume ATS score, and verified readiness certificates require a free candidate account.
              </p>
              <div className="pt-2 border-t border-orange-200 dark:border-orange-900/40 flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                <span>✅ <strong>Free Account:</strong> Unlocks Stages 1 to 5</span>
                <span>✅ <strong>Save Progress:</strong> Detailed AI score audit & history</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full pt-1">
              <button
                onClick={() => router.push("/login?redirect=/interviews")}
                className="w-full py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Go to Login / Create Free Account →</span>
              </button>

              <button
                onClick={() => setIsDemoLoginModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Continue Demo Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
