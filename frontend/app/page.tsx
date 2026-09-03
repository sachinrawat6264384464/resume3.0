"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Cloud, Mic, Shield, Sparkles, Trophy, ArrowRight, CheckCircle2, 
  Terminal, Server, Cpu, Layers, FileCheck, Map, Star, Users, 
  ChevronRight, Play, Zap, Flame, Award, BarChart3, HelpCircle,
  ExternalLink, Code2, AlertTriangle, ArrowUpRight, Check,
  Home, Flag, Monitor, Globe, Database, Archive, Briefcase, FolderCheck, FileText,
  ChevronDown, ChevronUp, Lock, RefreshCw, Layers3, Activity, CheckSquare
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true") {
      window.location.href = "/login?admin=true";
    }
  }, []);

  const faqs = [
    {
      q: "How does the strict 80% stage gate progression system work?",
      a: "Candidates start at Stage 1 (Profile & Pitch). Every stage is scored by our AI engine across 5 weighted pillars. You must score 80% or higher to automatically unlock the next stage up to Stage 5 (Production Incident Boss Battle)."
    },
    {
      q: "How does the Voice AI Chamber evaluate my spoken answers?",
      a: "Our speech processing pipeline transcribes your spoken answers using Whisper STT, measures your speech cadence (Words Per Minute WPM), and evaluates technical accuracy, concept depth, and problem-solving reasoning using advanced LLM rubrics."
    },
    {
      q: "What is the 6-Factor ATS Resume Bullet Point Rewriter?",
      a: "Our ATS engine analyzes your resume against target DevOps & CloudOps Job Descriptions, identifies missing keywords (e.g., IRSA, Terraform state locking), and automatically rewrites weak bullets using the STAR (Situation, Task, Action, Result) formula with quantified metrics."
    },
    {
      q: "Can hiring administrators override locked stages for candidates?",
      a: "Yes! Administrators have access to a dedicated Admin Intelligence Suite (`resume3-admin.vercel.app`) where they can review WebRTC video/audio recordings, grant manual stage overrides, and manage support tickets."
    },
    {
      q: "How long are candidate video and audio interview recordings retained?",
      a: "Recordings are safely stored in Cloudinary CDN storage and automatically purged after 90 days by our idempotent background Retention Cleaner while retaining permanent evaluation logs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-[#FF6B00] selection:text-white overflow-x-hidden">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-amber-500 to-orange-400 p-[1.5px] shadow-md shadow-[#FF6B00]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B1E36] rounded-[14px] flex items-center justify-center text-white">
                <Cloud className="w-5 h-5 text-[#FF6B00] fill-[#FF6B00]/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#0B1E36] flex items-center gap-1">
                CloudOps <span className="text-[#FF6B00]">AI</span>
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                AI VOICE INTERVIEW & ATS
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold text-slate-700">
            <a href="#features" className="hover:text-[#FF6B00] transition-colors">5-Stage System</a>
            <a href="#voice-ai" className="hover:text-[#FF6B00] transition-colors">Voice AI Chamber</a>
            <a href="#ats" className="hover:text-[#FF6B00] transition-colors">ATS Analyzer</a>
            <a href="#leaderboard" className="hover:text-[#FF6B00] transition-colors">Leaderboard</a>
            <a href="#roadmap" className="hover:text-[#FF6B00] transition-colors">Roadmap</a>
            <a href="#faq" className="hover:text-[#FF6B00] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link 
              href="/login" 
              className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-[#0B1E36] dark:hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>

            <Link 
              href="/register" 
              className="text-xs font-black text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 px-5 py-3 rounded-full shadow-lg shadow-[#FF6B00]/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <h1 className="text-5xl sm:text-6xl lg:text-[62px] font-black text-[#0B1E36] tracking-tight leading-[1.06] font-sans uppercase">
                LAND YOUR NEXT<br />
                <span className="text-[#FF6B00]">CLOUD ENGINEERING</span> ROLE.
              </h1>

              <p className="text-base text-slate-600 leading-relaxed font-medium max-w-lg">
                Practice real AWS incidents, improve your interview skills, and see exactly what to fix.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="py-3.5 px-7 rounded-full font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2.5 hover:scale-[1.02] transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Free AI Interview</span>
                </Link>

                <a
                  href="#ats"
                  className="py-3.5 px-6 rounded-2xl font-extrabold text-xs text-[#0B1E36] bg-white border border-slate-300 hover:border-[#FF6B00] flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>Analyze My Resume</span>
                </a>
              </div>

              {/* 3 Feature Badges */}
              <div className="grid grid-cols-3 gap-3 pt-8 border-t border-slate-200/80 mt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#0B1E36]">AI Voice Interview</span>
                    <span className="text-[11px] text-slate-500 font-medium">Real AWS incident practice</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#0B1E36]">ATS Resume Score</span>
                    <span className="text-[11px] text-slate-500 font-medium">See your match score</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0 mt-0.5">
                    <Map className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#0B1E36]">30-Day Roadmap</span>
                    <span className="text-[11px] text-slate-500 font-medium">Personalized plan to land offers</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Visual Mock */}
            <div className="lg:col-span-7 relative">
              <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-300/60 overflow-hidden flex flex-col md:flex-row min-h-[440px]">
                
                {/* Dark Blue Sidebar */}
                <div className="w-full md:w-52 bg-[#0B1E36] p-5 text-white flex flex-col gap-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white">
                      <Cloud className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-black tracking-tight">CloudOps AI</span>
                  </div>

                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#FF6B00] mb-2 shadow-md">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                        alt="Rahul Rawat Profile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-xs font-black text-white">Rahul Rawat</span>
                    <span className="text-[10px] text-slate-400 font-medium">Cloud Engineer</span>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs font-semibold">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 text-white font-bold">
                      <Home className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Overview</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <Mic className="w-3.5 h-3.5" />
                      <span>Interview Practice</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      <span>ATS Analyzer</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <Flag className="w-3.5 h-3.5" />
                      <span>Roadmap</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 p-6 bg-slate-50/60 flex flex-col justify-between gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#FF6B00]">aws</span>
                      <span className="text-sm font-black text-slate-900">AWS Incident Simulation</span>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      94% Match Score
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between relative overflow-x-auto gap-2">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">Client</span>
                    </div>
                    <span className="text-slate-300 font-bold">➔</span>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                        <Globe className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">Route 53</span>
                    </div>
                    <span className="text-slate-300 font-bold">➔</span>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Layers className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">ALB</span>
                    </div>
                    <span className="text-slate-300 font-bold">➔</span>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">EC2</span>
                    </div>
                    <span className="text-slate-300 font-bold">➔</span>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Database className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">RDS</span>
                    </div>
                    <span className="text-slate-300 font-bold">➔</span>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <Archive className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">S3</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                        Skills
                      </span>
                      <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-600">
                        <div>
                          <div className="flex justify-between mb-0.5"><span>AWS Services</span></div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF6B00] w-[90%]" />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-0.5"><span>Networking</span></div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF6B00] w-[84%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                        Experience
                      </span>
                      <div className="flex flex-col gap-1 text-[10px]">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Cloud Engineer</span>
                          <span className="text-slate-400">3.2 yrs</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>DevOps Engineer</span>
                          <span className="text-slate-400">1.8 yrs</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                        <FolderCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Projects
                      </span>
                      <div className="flex flex-col gap-1 text-[10px]">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="truncate">Multi-Region App</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span className="truncate">CI/CD Pipeline</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TECH MARQUEE */}
      <section className="py-6 bg-white border-y border-slate-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-3">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            ENTERPRISE CLOUD ECOSYSTEM & INTERVIEW BLUEPRINTS
          </span>
        </div>

        <div className="flex overflow-hidden space-x-8 select-none">
          <div className="flex space-x-8 animate-marquee whitespace-nowrap items-center shrink-0">
            {[
              { name: "AWS Services", code: "EKS / IAM / VPC", color: "#FF6B00" },
              { name: "Google Cloud", code: "GKE / BigQuery", color: "#4285F4" },
              { name: "Azure Cloud", code: "AKS / Azure DevOps", color: "#0089D6" },
              { name: "Docker", code: "Containers / Compose", color: "#0db7ed" },
              { name: "Kubernetes", code: "K8s Helm & Ingress", color: "#326ce5" },
              { name: "Terraform", code: "IaC State Locking", color: "#844FBA" },
            ].map((tech, i) => (
              <div key={i} className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tech.color }} />
                <span className="text-xs font-black text-[#0B1E36]">{tech.name}</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{tech.code}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: 5-STAGE ASSESSMENT SYSTEM */}
      <section id="features" className="py-20 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              5-STAGE GATED SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] tracking-tight mt-2">
              Practice Real AWS Incidents & Get AI Scored
            </h2>
            <p className="text-sm text-slate-600 mt-3 font-medium leading-relaxed">
              Every stage requires an 80%+ score to unlock the next challenge. Master real production troubleshooting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: "01", name: "Profile Pitch", desc: "90-sec intro & resume walkthrough.", score: "Min 80%" },
              { id: "02", name: "Linux Warrior", desc: "Kernel, sockets, systemd & disk triage.", score: "Min 80%" },
              { id: "03", name: "Multi-Cloud", desc: "VPC, IAM STS, IRSA & ALB routing.", score: "Min 80%" },
              { id: "04", name: "Containers & K8s", desc: "Docker multi-stage & EKS manifests.", score: "Min 80%" },
              { id: "05", name: "Incident Boss", desc: "CrashLoopBackOff & 502 outage triage.", score: "Final Boss" },
            ].map((st, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">Stage {st.id}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {st.score}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0B1E36] group-hover:text-[#FF6B00] transition-colors">{st.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{st.desc}</p>
                </div>

                <Link href="/login" className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#FF6B00]">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 2: VOICE AI EVALUATION CHAMBER */}
      <section id="voice-ai" className="py-20 relative z-10 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
                SPEECH & CADENCE ENGINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] tracking-tight">
                Spoken Technical Audio Evaluated Across 5 Objective Pillars
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Our Whisper Speech-to-Text STT engine analyzes your spoken answers in real-time. Evaluate your WPM pacing, technical command accuracy, and logical reasoning under realistic interview pressure.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400">Technical Accuracy</span>
                  <span className="text-xl font-black text-[#0B1E36]">40% Weight</span>
                  <span className="text-[11px] text-slate-500">Correctness of AWS & Linux commands</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400">Concept Coverage</span>
                  <span className="text-xl font-black text-[#0B1E36]">25% Weight</span>
                  <span className="text-[11px] text-slate-500">System internals & architectural edge cases</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00]">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-300">Live Voice Stream Capture</span>
                      <span className="text-sm font-black text-white">Stage 3: AWS VPC Route Troubleshooting</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                    138 WPM (Ideal Cadence)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FF6B00]">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-mono font-bold">||||||||||||||||||||||||||||||||||||</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">00:42 / 02:00</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-[#FF6B00] font-bold">"</span>To route private EC2 traffic to the internet while keeping subnet isolation, I would deploy a NAT Gateway in the public subnet and point private route tables to the NAT GW instance...<span className="text-[#FF6B00] font-bold">"</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: ATS RESUME AUDIT & STAR REWRITER */}
      <section id="ats" className="py-20 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0B1E36] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FF6B00]" />
                    STAR Formula Bullet Point Rewriter
                  </span>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-orange-100 text-[#FF6B00]">
                    +34% Interview Call Rate
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex flex-col gap-1 text-xs">
                  <span className="font-extrabold text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Before Rewriting (Weak Bullet):
                  </span>
                  <p className="text-rose-900 font-mono">"Managed AWS EC2 instances and set up Docker containers for deployments."</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-1 text-xs">
                  <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    After AI STAR Optimization (Quantified Impact):
                  </span>
                  <p className="text-emerald-950 font-mono font-bold">
                    "Architected multi-stage Docker builds on AWS EKS with Terraform IaC, reducing container image size by 62% and eliminating production deployment downtime."
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
                6-FACTOR ATS RESUME ENGINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] tracking-tight">
                Scan Your Resume Against Real Cloud Engineering JDs
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Uncover missing critical keywords (IRSA, Terraform state locking, Prometheus metrics) and automatically rewrite bullet points with quantified STAR metrics.
              </p>

              <Link
                href="/login"
                className="w-fit py-3.5 px-6 rounded-full font-black text-xs text-white bg-[#0B1E36] hover:bg-slate-800 shadow-md flex items-center gap-2 transition-all mt-2"
              >
                <span>Audit Your Resume Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF6B00]" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: 30-DAY PERSONALIZED LEARNING ROADMAP */}
      <section id="roadmap" className="py-20 relative z-10 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              AUTOMATED AI ROADMAP
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] tracking-tight mt-2">
              30-Day Guided Learning Sprints to Resolve Skill Gaps
            </h2>
            <p className="text-sm text-slate-600 mt-3 font-medium leading-relaxed">
              Based on your interview scores, our system synthesizes a 4-week study plan with direct links to official documentation & hands-on lab challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { week: "Week 1", title: "Linux Kernel & Networking", desc: "Triage disk wait, memory heaps, systemd units & sockets.", docs: "Official RHEL & Ubuntu Docs" },
              { week: "Week 2", title: "AWS VPC, IAM & Security", desc: "Master subnets, NAT GW, IAM STS & IRSA policy binding.", docs: "AWS Well-Architected Guide" },
              { week: "Week 3", title: "Docker & Kubernetes EKS", desc: "Multi-stage Docker builds, pod probes & ingress routing.", docs: "CNCF Kubernetes Docs" },
              { week: "Week 4", title: "Terraform IaC & Incidents", desc: "Remote state locking, module design & outage post-mortems.", docs: "HashiCorp Docs & Runbooks" },
            ].map((wk, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider">{wk.week}</span>
                  <h3 className="text-base font-black text-[#0B1E36]">{wk.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{wk.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>{wk.docs}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: FAQ ACCORDION */}
      <section id="faq" className="py-20 relative z-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] tracking-tight mt-2">
              Everything You Need to Know About the Assessment OS
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-black text-sm text-[#0B1E36] flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#FF6B00] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 6: HIGH-IMPACT CTA BANNER */}
      <section className="py-16 relative z-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 lg:p-14 rounded-3xl bg-gradient-to-r from-[#0B1E36] via-[#102A4C] to-[#0B1E36] text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-800">
            <div className="flex flex-col gap-3 text-center lg:text-left">
              <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
                READY TO BECOME PRODUCTION READY?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Start Your Free Voice AI Assessment Today
              </h2>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Test your skills across AWS, Kubernetes, Terraform & Linux. Instant AI scoring & 30-day learning roadmap.
              </p>
            </div>

            <Link
              href="/register"
              className="py-4 px-8 rounded-full font-black text-sm text-slate-950 bg-gradient-to-r from-[#FF6B00] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF6B00]/30 flex items-center gap-3 shrink-0 hover:scale-105 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 7: FULL CORPORATE MULTI-COLUMN SAAS FOOTER */}
      <footer className="bg-[#0B1E36] text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
            
            {/* Column 1: Brand */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-bold shadow-md">
                  <Cloud className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-tight">CloudOps AI Assessment OS</span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
                The premier AI-powered voice interview, skill evaluation, and ATS resume operating system engineered for Cloud Operations, SRE & DevOps professionals.
              </p>
              <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-400 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational
                </span>
              </div>
            </div>

            {/* Column 2: Product Modules */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Product Suite</span>
              <a href="#features" className="text-slate-400 hover:text-[#FF6B00] transition-colors">5-Stage Gated System</a>
              <a href="#voice-ai" className="text-slate-400 hover:text-[#FF6B00] transition-colors">Voice AI Chamber</a>
              <a href="#ats" className="text-slate-400 hover:text-[#FF6B00] transition-colors">6-Factor ATS Analyzer</a>
              <a href="#roadmap" className="text-slate-400 hover:text-[#FF6B00] transition-colors">30-Day AI Roadmap</a>
              <Link href="/login" className="text-slate-400 hover:text-[#FF6B00] transition-colors">Leaderboard & XP</Link>
            </div>

            {/* Column 3: Tech Stacks */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Tech Stacks</span>
              <span className="text-slate-400">AWS EKS & VPC Subnets</span>
              <span className="text-slate-400">Kubernetes & Helm</span>
              <span className="text-slate-400">HashiCorp Terraform IaC</span>
              <span className="text-slate-400">Docker Multi-Stage</span>
              <span className="text-slate-400">Prometheus & Grafana</span>
            </div>

            {/* Column 4: Support & Admin */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-slate-200 uppercase tracking-wider text-[11px]">Resources & Help</span>
              <Link href="/help" className="text-slate-400 hover:text-[#FF6B00] transition-colors">Engineering Help Desk</Link>
              <a href="#faq" className="text-slate-400 hover:text-[#FF6B00] transition-colors">FAQ & Documentation</a>
              <Link href="/login" className="text-slate-400 hover:text-[#FF6B00] transition-colors">Candidate Login</Link>
              <Link href="/login?admin=true" className="text-slate-400 hover:text-[#FF6B00] transition-colors">Admin Portal</Link>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
            <span>© 2026 CloudOps AI Assessment OS. Built for Cloud Engineers worldwide.</span>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Compliance</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
