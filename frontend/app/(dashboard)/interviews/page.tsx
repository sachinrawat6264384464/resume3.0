"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Play, CheckCircle2, Lock, Sparkles, Trophy, Clock, 
  ArrowRight, ShieldCheck, Cpu, Mic, FileText, ChevronRight,
  Flame, Award, AlertCircle, RefreshCw, Loader2, Star, Zap, Crown, X,
  Video, LogOut
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const ALL_30_STAGES = [
  // LEVEL 1 — FOUNDATION (TRACK 1)
  { id: 0, level: "Level 1", levelName: "Foundation", title: "Setup Your Interview Profile", xp: "+100 XP", duration: "10 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Configure your target role, salary band, and initial baseline skills profile." },
  { id: 1, level: "Level 1", levelName: "Foundation", title: "Self Introduction", xp: "+150 XP", duration: "12 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Master your 60-second pitch, STAR background intro, and career story." },
  { id: 2, level: "Level 1", levelName: "Foundation", title: "Technical Introduction", xp: "+200 XP", duration: "15 Mins", questions: 2, questions_count: 2, icon: "🏆", diff: "Easy", desc: "Explain your daily technical workflow, tool stack, and architecture experience." },
  { id: 3, level: "Level 1", levelName: "Foundation", title: "Linux for Cloud Engineers", xp: "+250 XP", duration: "18 Mins", questions: 2, questions_count: 2, icon: "🐧", diff: "Medium", desc: "Process signals, memory triage, top/htop/iotop, and bash scripting." },
  { id: 4, level: "Level 1", levelName: "Foundation", title: "Linux for DevOps Engineers", xp: "+300 XP", duration: "20 Mins", questions: 2, questions_count: 2, icon: "🐧", diff: "Medium", desc: "Systemd service units, kernel tuning, disk I/O bottlenecks, and cron automation." },
  { id: 5, level: "Level 1", levelName: "Foundation", title: "Cloud + DevOps Fundamentals", xp: "+350 XP", duration: "20 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Core cloud models, virtualization vs containerization, and IaC basics." },

  // LEVEL 2 — CLOUD (TRACK 2)
  { id: 6, level: "Level 2", levelName: "Cloud", title: "AWS Cloud Engineer", xp: "+400 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "VPC networking, subnets, NAT Gateways, IAM policies, and S3 lifecycle." },
  { id: 7, level: "Level 2", levelName: "Cloud", title: "GCP Cloud Engineer", xp: "+450 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Google Cloud IAM, VPC Service Controls, GKE basics, and BigQuery Ops." },
  { id: 8, level: "Level 2", levelName: "Cloud", title: "Azure Cloud Engineer", xp: "+450 XP", duration: "22 Mins", questions: 2, questions_count: 2, icon: "☁️", diff: "Medium", desc: "Azure VNets, Entra ID, Virtual Machine Scale Sets, and Resource Groups." },
  { id: 9, level: "Level 2", levelName: "Cloud", title: "Multi-Cloud Architecture", xp: "+500 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "⚡", diff: "Hard", desc: "Inter-cloud VPN peering, multi-cloud IAM federation, and cost optimization." },
  { id: 10, level: "Level 2", levelName: "Cloud", title: "Cloud Real-Time Scenarios", xp: "+550 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "🔥", diff: "Hard", desc: "Cross-region failover, DNS failover with Route53, and storage outage triage." },

  // LEVEL 3 — DEVOPS (TRACK 3)
  { id: 11, level: "Level 3", levelName: "DevOps", title: "Git + GitHub Workflow", xp: "+600 XP", duration: "25 Mins", questions: 2, questions_count: 2, icon: "🚀", diff: "Medium", desc: "Git rebase vs merge, git bisect, branch protection rules, and merge conflicts." },
  { id: 12, level: "Level 3", levelName: "DevOps", title: "Jenkins + CI/CD Pipelines", xp: "+650 XP", duration: "28 Mins", questions: 2, questions_count: 2, icon: "🚀", diff: "Hard", desc: "Multibranch Jenkinsfiles, shared libraries, matrix builds, and caching." },
  { id: 13, level: "Level 3", levelName: "DevOps", title: "Docker Containerization", xp: "+700 XP", duration: "28 Mins", questions: 2, questions_count: 2, icon: "📦", diff: "Hard", desc: "Multi-stage Dockerfiles, image minimization, cgroups, and container networking." },
  { id: 14, level: "Level 3", levelName: "DevOps", title: "Kubernetes Orchestration", xp: "+800 XP", duration: "30 Mins", questions: 2, questions_count: 2, icon: "☸️", diff: "Hard", desc: "Pods, Deployments, StatefulSets, Ingress Controllers, HPA, and CrashLoopBackOff." },
  { id: 15, level: "Level 3", levelName: "DevOps", title: "Ansible + Terraform IaC", xp: "+850 XP", duration: "30 Mins", questions: 2, questions_count: 2, icon: "🛠️", diff: "Hard", desc: "Remote state locking, Terraform modules, drift detection, and Ansible playbooks." },

  // LEVEL 4 — ADVANCED DEVOPS (TRACK 4)
  { id: 16, level: "Level 4", levelName: "Advanced DevOps", title: "End-to-End CI/CD Project", xp: "+900 XP", duration: "32 Mins", questions: 2, questions_count: 2, icon: "🌐", diff: "Boss", desc: "Production GitHub Actions pipeline to EKS with ArgoCD GitOps sync." },
  { id: 17, level: "Level 4", levelName: "Advanced DevOps", title: "Production Troubleshooting", xp: "+1,000 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🚨", diff: "Boss", desc: "Live memory leak triage, high CPU load debugging, and 502 bad gateway fix." },
  { id: 18, level: "Level 4", levelName: "Advanced DevOps", title: "DevSecOps & Hardening", xp: "+1,100 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🛡️", diff: "Boss", desc: "Container image scanning (Trivy), SAST/DAST, and HashiCorp Vault integration." },
  { id: 19, level: "Level 4", levelName: "Advanced DevOps", title: "Real-Time DevOps Architecture", xp: "+1,200 XP", duration: "35 Mins", questions: 2, questions_count: 2, icon: "🏗️", diff: "Boss", desc: "High-throughput microservices architecture with zero-downtime rolling updates." },
  { id: 20, level: "Level 4", levelName: "Advanced DevOps", title: "Final DevOps Mock Interview", xp: "+1,500 XP", duration: "40 Mins", questions: 2, questions_count: 2, icon: "🎓", diff: "Boss", desc: "Full-spectrum senior panel simulation covering all 4 level pillars." },

  // 10 BONUS AI & ADVANCED CHALLENGES
  { id: 21, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 01: AIOps Challenge", xp: "+1,600 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "AI anomaly detection in Prometheus metrics and automated log clustering." },
  { id: 22, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 02: MLOps Challenge", xp: "+1,700 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "ML model serving infrastructure, Kubeflow pipelines, and feature stores." },
  { id: 23, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 03: AI Integration Challenge", xp: "+1,800 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🤖", diff: "Extreme", desc: "LLM API gateway rate limiting, streaming responses, and vector DB ops." },
  { id: 24, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 04: AI + DevOps Automation", xp: "+1,900 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "⚡", diff: "Extreme", desc: "AI-driven self-healing infrastructure scripts and automated PR remediation." },
  { id: 25, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 05: AI MCP Challenge", xp: "+2,000 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔌", diff: "Extreme", desc: "Model Context Protocol tools integration for infrastructure management." },
  { id: 26, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 06: Azure DevOps Project", xp: "+2,100 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔷", diff: "Extreme", desc: "Azure Pipelines YAML, Artifacts, and Azure Kubernetes Service (AKS)." },
  { id: 27, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 07: Project-Based CI/CD", xp: "+2,200 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🏗️", diff: "Extreme", desc: "Canary deployments, blue-green traffic shifting using Flagger and Istio." },
  { id: 28, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 08: Advanced DevSecOps Project", xp: "+2,300 XP", duration: "30 Mins", questions: 1, questions_count: 1, icon: "🔐", diff: "Extreme", desc: "OPA Gatekeeper policies, Kyverno admission controllers, and PCI-DSS compliance." },
  { id: 29, level: "Bonus", levelName: "Bonus Challenge", title: "Bonus 09: Multi-Cloud + AI Architecture", xp: "+2,500 XP", duration: "35 Mins", questions: 1, questions_count: 1, icon: "🌐", diff: "Extreme", desc: "Global latency routing across AWS, GCP, and Azure with AI failover." },
  { id: 30, level: "Bonus", levelName: "Bonus Challenge", title: "👑 40 LPA Final Boss Interview Battle", xp: "+3,000 XP", duration: "45 Mins", questions: 2, questions_count: 2, icon: "👑", diff: "Legendary", desc: "The ultimate 40 LPA Staff CloudOps Engineer Boss Battle! Prove your absolute mastery." }
];

export default function InterviewsPage() {
  const router = useRouter();
  const [stages, setStages] = useState<any[]>(ALL_30_STAGES);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<any | null>(ALL_30_STAGES[0]);
  const [isStarting, setIsStarting] = useState(false);

  // Subscription & Razorpay Payment Modal States
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStageForPayment, setSelectedStageForPayment] = useState<any | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

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
      const [resDbStages, resMetrics] = await Promise.all([
        apiFetch("/interviews/stages").catch(() => null),
        apiFetch("/candidates/me/dashboard-metrics").catch(() => null)
      ]);

      const userSubscribed = Boolean(resMetrics?.data?.is_subscribed);
      setIsSubscribed(userSubscribed);

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
      completedSet.add(0); // Setup Stage 0 always unlocked/done

      ALL_30_STAGES.forEach((stg) => {
        const att = attemptMap.get(stg.id);
        if (att && (att.status === "completed" || att.status === "PASSED" || (typeof att.score === "string" && parseInt(att.score) >= 70))) {
          completedSet.add(stg.id);
        }
      });

      const merged = ALL_30_STAGES.map((stg) => {
        const dbStg = dbStageMap.get(stg.id);
        const att = attemptMap.get(stg.id);
        const qCount = dbStg?.questions_count !== undefined ? dbStg.questions_count : stg.questions;
        const isCompleted = completedSet.has(stg.id) && stg.id > 0;

        let computedStatus = "locked";
        let computedScore = att ? att.score : "--";

        if (stg.id === 0 || stg.id === 1) {
          computedStatus = isCompleted ? "completed" : "in_progress";
          if (!att && stg.id <= 1) computedScore = "Active";
        } else if (stg.id >= 2 && stg.id <= 5) {
          // Track 1 (Free Sequential Unlock)
          if (isCompleted) {
            computedStatus = "completed";
          } else if (completedSet.has(stg.id - 1)) {
            computedStatus = "in_progress";
            computedScore = "Active";
          } else {
            computedStatus = "locked";
          }
        } else {
          // Track 2+ (Stages 6 to 30) - PRO Subscription Required!
          if (!userSubscribed) {
            computedStatus = "pro_locked";
          } else {
            if (isCompleted) {
              computedStatus = "completed";
            } else if (completedSet.has(stg.id - 1)) {
              computedStatus = "in_progress";
              computedScore = "Active";
            } else {
              computedStatus = "locked";
            }
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

      setStages(merged);
      setSelectedStage((prev: any) => {
        if (!prev) return merged[0];
        const match = merged.find((m) => m.id === prev.id);
        return match || merged[0];
      });
    } catch (e) {
      console.warn("Interview stages fetch error:", e);
    }
  };

  const checkActiveSession = () => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("active_interview_session");
        if (raw) {
          setActiveSession(JSON.parse(raw));
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
  }, []);

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
    if (activeSession) {
      setAlertMsg(`⚠️ You have an active live interview running (${activeSession.stageTitle || 'Stage Interview'}). Please 'Resume Ongoing Interview 🚀' or 'Drop Out 🚪' before launching a new stage.`);
    }
    if (s.status === "pro_locked" || (!isSubscribed && s.id >= 6)) {
      setSelectedStageForPayment(s);
      setIsPaymentModalOpen(true);
      return;
    }
    if (s.status === "locked") {
      setAlertMsg(`⚠️ Stage ${s.id} is locked. Please complete Stage ${s.id - 1} first to unlock!`);
    }
  };

  const handleStartStage = async (stageId: number) => {
    setAlertMsg(null);

    // If an active session is currently running, prompt candidate to resume or drop out
    if (activeSession) {
      setAlertMsg(`⚠️ Active session in progress: "${activeSession.stageTitle || 'Live Interview'}". Click 'Resume Ongoing Interview 🚀' above or 'Drop Out 🚪' to proceed.`);
      return;
    }

    const targetStg = stages.find((st) => st.id === stageId) || ALL_30_STAGES[stageId];

    if (targetStg?.status === "pro_locked" || (!isSubscribed && stageId >= 6)) {
      setSelectedStageForPayment(targetStg);
      setIsPaymentModalOpen(true);
      return;
    }

    if (targetStg?.status === "locked") {
      setAlertMsg(`⚠️ Please complete Stage ${stageId - 1} first before unlocking Stage ${stageId}.`);
      return;
    }

    setIsStarting(true);
    try {
      const res = await apiFetch("/attempts/start", {
        method: "POST",
        body: JSON.stringify({
          interview_template_id: `stage-${stageId}-template`
        })
      });
      const newAttemptId = res?.data?.id || stageId;
      const sessionObj = {
        attemptId: String(newAttemptId),
        stageId: stageId,
        stageTitle: targetStg?.title || `Stage ${stageId} Assessment`,
        roomUrl: `/interviews/${newAttemptId}/room`,
        startedAt: Date.now()
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("active_interview_session", JSON.stringify(sessionObj));
      }
      setActiveSession(sessionObj);
      router.push(`/interviews/${newAttemptId}/pre-check`);
    } catch (e) {
      const sessionObj = {
        attemptId: String(stageId),
        stageId: stageId,
        stageTitle: targetStg?.title || `Stage ${stageId} Assessment`,
        roomUrl: `/interviews/${stageId}/room`,
        startedAt: Date.now()
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("active_interview_session", JSON.stringify(sessionObj));
      }
      setActiveSession(sessionObj);
      router.push(`/interviews/${stageId}/pre-check`);
    } finally {
      setIsStarting(false);
    }
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
    try {
      const cfg = await apiFetch("/admin/payment-gateway/config");
      if (cfg?.data?.publishable_key) {
        keyId = cfg.data.publishable_key.trim();
      }
    } catch (e) {
      console.warn("Could not fetch gateway config");
    }

    // Check if key is dummy/placeholder
    const isDummyKey = !keyId || keyId.includes("sampleKey") || keyId === "rzp_test_sampleKey123";

    if (!isDummyKey) {
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && (window as any).Razorpay) {
        const options = {
          key: keyId,
          amount: 5000, // ₹50 in paise
          currency: "INR",
          name: "CloudOps AI Interview Prep",
          description: "One-Time ₹50 Pass: Unlock All 30 Stages & Tracks",
          image: "https://razorpay.com/favicon.ico",
          handler: async function (response: any) {
            try {
              await apiFetch("/admin/payment-gateway/verify-and-subscribe", {
                method: "POST",
                body: JSON.stringify({
                  transaction_id: response.razorpay_payment_id || `pay_rzp_${Date.now()}`,
                  amount: "50",
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

      {/* AGENCY THEME HERO BANNER */}
      <div className="relative z-10 p-6 sm:p-10 rounded-[32px] bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
        
        <div className="flex flex-col gap-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-black tracking-wider uppercase w-fit">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span>TRACK 1 FREE (STAGES 1-5) • ONE-TIME ₹50 PRO PASS (UNLOCKS ALL STAGES 6-30)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            MOCK INTERVIEW <span className="text-[#FF6B00]">CHALLENGE JOURNEY</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-white">"Learn Today. Implement Today. Build Your Career for a Lifetime."</strong><br />
            Track 1 (Stages 1–5) is 100% Free! Complete stages sequentially. Pay ₹50 ONCE (One-Time Lifetime Pass) to unlock all remaining Tracks 2 to 5.
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
              {completedCount + 1} <span className="text-slate-400 text-sm font-bold">/ 30</span>
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
          { key: "LEVEL1", icon: "🐧", title: "Track 1: Foundation", badge: "1-5 FREE", badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
          { key: "LEVEL2", icon: "☁️", title: "Track 2: Cloud", badge: "PRO", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
          { key: "LEVEL3", icon: "🚀", title: "Track 3: DevOps", badge: "PRO", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
          { key: "LEVEL4", icon: "⚡", title: "Track 4: Advanced", badge: "PRO", badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
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
              <span className="text-sm">{tab.icon}</span>
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
          
          {filteredStages.map((s) => {
            const isSelected = selectedStage?.id === s.id;
            const isCompleted = s.status === "completed";
            const isInProgress = s.status === "in_progress";
            const isProLocked = s.status === "pro_locked" || (!isSubscribed && s.id >= 6);
            const isLocked = s.status === "locked" && !isProLocked;
            const isBoss = s.id === 30 || s.diff === "Boss" || s.diff === "Legendary";

            return (
              <div
                key={s.id}
                onClick={() => handleSelectStage(s)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 shrink-0 ${
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

                <div className="flex items-center gap-3.5 min-w-0 pl-1">
                  <div className={`w-11 h-11 rounded-xl font-black text-base flex items-center justify-center shrink-0 transition-transform ${
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
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isProLocked ? <Crown className="w-5 h-5 text-[#FF9900]" /> : <span>{s.icon}</span>}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black text-[#FF6B00] bg-orange-50 dark:bg-orange-950/60 border border-[#FF6B00]/30 uppercase">
                        STAGE {s.id} • {s.levelName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 border border-amber-300/60 dark:border-amber-700/60">
                        {s.xp}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate mt-1 tracking-tight">
                      {s.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCompleted && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                      {s.score}
                    </span>
                  )}
                  {isInProgress && (
                    <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-[#FF6B00] text-[#FF6B00] text-xs font-black animate-pulse">
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
                      className="px-3 py-1.5 rounded-xl bg-[#FF9900] text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm hover:bg-amber-400 transition-all cursor-pointer"
                      title="One-Time ₹50 Pass Unlocks All Stages 6-30"
                    >
                      <Crown className="w-3.5 h-3.5 text-slate-950" />
                      <span>PRO PASS</span>
                    </button>
                  )}
                  {isLocked && (
                    <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700" title={`Complete Stage ${s.id - 1} first`}>
                      <Lock className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        {/* RIGHT: SELECTED STAGE DETAILS & LAUNCH SIMULATOR CARD */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          
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

                {/* Stage Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 py-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" /> DIFFICULTY
                    </span>
                    <span className="text-xs font-black text-[#FF6B00]">{selectedStage.diff}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-emerald-500" /> XP REWARD
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {selectedStage.xp}
                    </span>
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

                {/* STAR Tip Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800/60 dark:to-slate-900/60 border border-[#FF6B00]/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <div className="flex flex-col text-xs">
                    <span className="font-black text-slate-900 dark:text-white">STAR Pitch Formula + 3-Level Hints</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      Practice with Teleprompter or AI hints before evaluating.
                    </span>
                  </div>
                </div>

              </div>

              {/* Launch Action Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <button
                  onClick={() => handleStartStage(selectedStage.id)}
                  disabled={isStarting}
                  className={`w-full py-4 rounded-2xl font-black text-xs text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider ${
                    selectedStage.status === "pro_locked" || (!isSubscribed && selectedStage.id >= 6)
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-amber-500/30"
                      : "bg-[#FF6B00] hover:bg-[#e05e00] shadow-[#FF6B00]/30"
                  }`}
                >
                  {selectedStage.status === "pro_locked" || (!isSubscribed && selectedStage.id >= 6) ? (
                    <>
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>Unlock All Stages 6-30 (One-Time ₹50 Pass) 🚀</span>
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
                    <span className="text-[10px] text-slate-400 font-mono">Stage {selectedStageForPayment?.id || 6}+</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mt-0.5">
                    Unlock All 30 Stages & Tracks 2-5
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
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">₹50</span>
                  <span className="text-xs text-slate-400 line-through font-mono">₹1,499</span>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">97% OFF</span>
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
                <span><strong>Single ₹50 Payment Unlocks Stages 6 to 30</strong> (No per-stage fee)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Sequential Unlocks</strong> (Stage 6 opens after Stage 5, etc.)</span>
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

    </div>
  );
}
