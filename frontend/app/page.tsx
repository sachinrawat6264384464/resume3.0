"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Cloud, Mic, Shield, Sparkles, Trophy, ArrowRight, CheckCircle2, 
  Terminal, Server, Cpu, Layers, FileCheck, Map, Star, Users, 
  ChevronRight, Play, Zap, Flame, Award, BarChart3, HelpCircle,
  ExternalLink, Code2, AlertTriangle, ArrowUpRight, Check,
  Home, Flag, Monitor, Globe, Database, Archive, Briefcase, FolderCheck, FileText, User,
  ChevronDown, ChevronUp, Lock, RefreshCw, Layers3, Activity, Target, AlignLeft, Scale, LayoutGrid, Search, ShieldCheck, TrendingUp, Calendar
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeHeroTab, setActiveHeroTab] = useState<"overview" | "practice" | "ats" | "roadmap" | "profile">("overview");

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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FF6B00] selection:text-white overflow-x-hidden transition-colors duration-300">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-[#070b14]/90 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-amber-500 to-orange-400 p-[1.5px] shadow-md shadow-[#FF6B00]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B1E36] rounded-[14px] flex items-center justify-center text-white">
                <Cloud className="w-5 h-5 text-[#FF6B00] fill-[#FF6B00]/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#0B1E36] dark:text-white flex items-center gap-1">
                CloudOps <span className="text-[#FF6B00]">AI</span>
              </span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                AI VOICE INTERVIEW & ATS
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <a href="#features" className="hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors">Features</a>
            <a href="#voice-ai" className="hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors">How It Works</a>
            <a href="#ats" className="hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors">ATS Analyzer</a>
            <a href="#faq" className="hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <ThemeToggle />

            <Link 
              href="/login" 
              className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-[#0B1E36] dark:hover:text-white px-2 py-2 transition-colors"
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

      {/* 2. HERO SECTION */}
      <section className="relative z-10 pt-10 pb-16 lg:pt-16 lg:pb-20 overflow-hidden">
        {/* High-Tech Ambient Cloud Network Background Image Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-40 pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url('/images/hero_bg_cloud_network.png')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#FAFAFA]/70 to-[#FAFAFA] dark:via-[#070b14]/70 dark:to-[#070b14] pointer-events-none" />

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#0B1E36] dark:text-white tracking-tight leading-[1.08] font-sans uppercase">
                LAND YOUR NEXT<br />
                <span className="text-[#FF6B00]">CLOUD ENGINEERING</span><br />
                ROLE.
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-lg">
                Practice real AWS incidents, improve your interview skills, and see exactly what to fix.
              </p>

              {/* Action Pill CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  href="/register"
                  className="py-3.5 px-6 rounded-full font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Free AI Interview</span>
                </Link>

                <a
                  href="#ats"
                  className="py-3.5 px-6 rounded-full font-extrabold text-xs text-[#0B1E36] dark:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>Analyze My Resume</span>
                </a>
              </div>

              {/* 4 Feature Thumbnails below CTAs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-2">
                <div className="flex flex-col gap-1">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/80 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center mb-1">
                    <Mic className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#0B1E36] dark:text-white">AI Voice Interview</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Real-world AWS incident practice</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#0B1E36] dark:text-white">ATS Resume Score</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">See your match score instantly</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#0B1E36] dark:text-white">5-Stage System</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">80%+ score to unlock next stage</span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                    <Map className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-[#0B1E36] dark:text-white">30-Day Roadmap</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Personalized plan to land offers</span>
                </div>
              </div>

            </div>

            {/* Hero Right Column: AWS Architecture Mock Visual with Background Engineer Photo Overlay */}
            <div className="lg:col-span-7 relative">
              
              {/* Background Engineer Photo Overlay matching Screenshot 3 */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-400/20 via-blue-500/10 to-transparent blur-2xl pointer-events-none -z-10" />

              <div className="w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-300/60 dark:shadow-black/60 overflow-hidden flex flex-col md:flex-row min-h-[460px] relative transition-colors duration-300">
                
                {/* Dark Blue Sidebar */}
                <div className="w-full md:w-48 bg-[#0B1E36] p-5 text-white flex flex-col gap-5 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#FF6B00] flex items-center justify-center text-white font-bold">
                      <Cloud className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-black tracking-tight">CloudOps AI</span>
                  </div>

                  <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF6B00] mb-1.5 shadow-md">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                        alt="Rahul Rawat Profile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-xs font-black text-white">Rahul Rawat</span>
                    <span className="text-[10px] text-slate-400 font-medium">Cloud Engineer</span>
                  </div>

                  {/* Interactive Sidebar Navigation Tabs */}
                  <div className="flex flex-col gap-1 text-[11px] font-semibold">
                    <button
                      onClick={() => setActiveHeroTab("overview")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                        activeHeroTab === "overview"
                          ? "bg-white/15 text-white font-bold border border-white/20 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Home className={`w-3.5 h-3.5 ${activeHeroTab === "overview" ? "text-[#FF6B00]" : ""}`} />
                      <span>Overview</span>
                    </button>

                    <button
                      onClick={() => setActiveHeroTab("practice")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                        activeHeroTab === "practice"
                          ? "bg-white/15 text-white font-bold border border-white/20 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Mic className={`w-3.5 h-3.5 ${activeHeroTab === "practice" ? "text-[#FF6B00]" : ""}`} />
                      <span>Interview Practice</span>
                    </button>

                    <button
                      onClick={() => setActiveHeroTab("ats")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                        activeHeroTab === "ats"
                          ? "bg-white/15 text-white font-bold border border-white/20 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <FileText className={`w-3.5 h-3.5 ${activeHeroTab === "ats" ? "text-[#FF6B00]" : ""}`} />
                      <span>ATS Analyzer</span>
                    </button>

                    <button
                      onClick={() => setActiveHeroTab("roadmap")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                        activeHeroTab === "roadmap"
                          ? "bg-white/15 text-white font-bold border border-white/20 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${activeHeroTab === "roadmap" ? "text-[#FF6B00]" : ""}`} />
                      <span>Roadmap</span>
                    </button>

                    <button
                      onClick={() => setActiveHeroTab("profile")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-left ${
                        activeHeroTab === "profile"
                          ? "bg-white/15 text-white font-bold border border-white/20 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <User className={`w-3.5 h-3.5 ${activeHeroTab === "profile" ? "text-[#FF6B00]" : ""}`} />
                      <span>Profile</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Right Content Panel */}
                <div className="flex-1 p-6 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col justify-between gap-6">
                  
                  {activeHeroTab === "overview" && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#FF6B00]">aws</span>
                          <span className="text-xs font-black text-slate-900">AWS Incident Simulation</span>
                        </div>
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          94% Match Score
                        </span>
                      </div>

                      {/* AWS Connected Architecture Flow */}
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-md">
                            <Monitor className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">Client</span>
                        </div>
                        <span className="text-slate-300 font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">Route 53</span>
                        </div>
                        <span className="text-slate-300 font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">ALB</span>
                        </div>
                        <span className="text-slate-300 font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">EC2</span>
                        </div>
                        <span className="text-slate-300 font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                            <Database className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">RDS</span>
                        </div>
                        <span className="text-slate-300 font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                            <Archive className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-600">S3</span>
                        </div>
                      </div>

                      {/* 3 Metric Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                            <Code2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                            Skills
                          </span>
                          <div className="flex flex-col gap-1.5 text-[9px] font-bold text-slate-600">
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
                            <div>
                              <div className="flex justify-between mb-0.5"><span>IAM & Security</span></div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#FF6B00] w-[78%]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                            Experience
                          </span>
                          <div className="flex flex-col gap-1.5 text-[10px]">
                            <div className="flex justify-between font-bold text-slate-700">
                              <span>Cloud Engineer</span>
                              <span className="text-slate-400">3.2 yrs</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-700">
                              <span>DevOps Engineer</span>
                              <span className="text-slate-400">1.8 yrs</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-700">
                              <span>SRE Intern</span>
                              <span className="text-slate-400">0.6 yrs</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-2">
                          <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                            <FolderCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Projects
                          </span>
                          <div className="flex flex-col gap-1.5 text-[9.5px] font-bold text-slate-700">
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-1">Multi Region Web ...</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-1">CI/CD with GitHub ...</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-1">Serverless Data Pip...</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeHeroTab === "practice" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36]">Voice AI Interview Chamber</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#FF6B00]">Stage 3 Active</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0B1E36] text-white flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-mono">PROMPT #3</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            Microphone Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium">
                          &ldquo;Explain how you configure AWS IRSA (IAM Roles for Service Accounts) to grant fine-grained permissions to a Pod running in EKS.&rdquo;
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <div className="flex items-center gap-1">
                            {[12, 24, 18, 32, 14, 28, 20, 16].map((h, idx) => (
                              <div key={idx} className="w-1 bg-[#FF6B00] rounded-full animate-waveform" style={{ height: `${h}px` }} />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Speech Cadence: 142 WPM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeHeroTab === "ats" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36]">ATS Bullet Point STAR Rewriter</span>
                        <span className="text-xs font-bold text-emerald-600">+34% Match Call Rate</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                        <span className="text-[10px] font-black text-rose-600 uppercase">WEAK BULLET:</span>
                        <p className="text-slate-700 italic font-medium mt-1">Managed AWS EC2 instances and set up Docker containers.</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <span className="text-[10px] font-black text-emerald-700 uppercase">QUANTIFIED STAR BULLET:</span>
                        <p className="text-slate-800 font-medium mt-1">Architected multi-stage Docker builds on AWS EKS with Terraform IaC, reducing container size by <strong className="text-emerald-700">62%</strong>.</p>
                      </div>
                    </div>
                  )}

                  {activeHeroTab === "roadmap" && (
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-black text-[#0B1E36]">30-Day Guided Sprint Progress</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] font-bold text-[#FF6B00]">WEEK 1</span>
                          <p className="font-bold text-slate-800">Linux Kernel & Sockets</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] font-bold text-blue-600">WEEK 2</span>
                          <p className="font-bold text-slate-800">AWS VPC & IRSA Binding</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeHeroTab === "profile" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36]">Candidate Matrix Profile</span>
                        <span className="text-xs font-bold text-[#FF6B00]">Level 1 (0 XP)</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">READINESS SCORE</span>
                          <span className="text-2xl font-black text-emerald-400">94.8%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block">TARGET BAND</span>
                          <span className="text-xs font-bold text-amber-300">₹12–18 LPA</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* TRUST BANNER AT BOTTOM OF HERO (Screenshot 1) */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 mt-12">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">
            <span className="text-xs font-black text-[#0B1E36] dark:text-white tracking-wider uppercase">
              TRUSTED BY CLOUD ENGINEERS WORLDWIDE
            </span>

            <div className="flex items-center gap-8 flex-wrap justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-[#FF6B00] font-black">aws</span>
                <span>4.8/5 <span className="text-slate-400 font-medium">(1,200+ reviews)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-black">GCP</span>
                <span>4.7/5 <span className="text-slate-400 font-medium">(950+ reviews)</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-black">★ Trustpilot</span>
                <span>4.6/5 <span className="text-slate-400 font-medium">(800+ reviews)</span></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-800" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" alt="" />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">10,000+ Engineers <span className="text-slate-400 font-medium">are leveling up</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VOICE AI & 5 PILLARS SECTION (Screenshot 2) */}
      <section id="voice-ai" className="py-20 relative z-10 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
        {/* High-Tech Ambient Cloud Network Background Image Overlay for Voice AI */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40 pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url('/images/hero_bg_cloud_network.png')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-50/90 via-slate-50/60 to-slate-50/90 dark:from-[#070b14]/90 dark:via-[#070b14]/60 dark:to-[#070b14]/90 pointer-events-none" />

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          
          <div className="mb-8">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black text-[#FF6B00] bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/50 flex items-center gap-1.5 w-fit">
              <Mic className="w-4 h-4 text-[#FF6B00]" />
              SPEECH & CADENCE ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Description & Weight Cards */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0B1E36] dark:text-white tracking-tight uppercase leading-tight">
                SPOKEN TECHNICAL AUDIO EVALUATED ACROSS<br />
                <span className="text-[#FF6B00]">5 OBJECTIVE PILLARS</span>
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Our Whisper Speech-to-Text STT engine analyzes your spoken answers in real-time. Evaluate your WPM pacing, technical command accuracy, and logical reasoning under realistic interview pressure.
              </p>

              {/* 2 Rubric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">Technical Accuracy</span>
                      <span className="text-lg font-black text-[#0B1E36] dark:text-white">40% <span className="text-xs font-bold text-slate-400">Weight</span></span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#FF6B00] w-[40%]" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Correctness of AWS & Linux commands</span>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2 transition-colors duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">Concept Coverage</span>
                      <span className="text-lg font-black text-[#0B1E36] dark:text-white">25% <span className="text-xs font-bold text-slate-400">Weight</span></span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-blue-600 w-[25%]" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">System internals & architectural edge cases</span>
                </div>
              </div>

            </div>

            {/* Right Dark Audio Stream Chamber Mock */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-2xl flex flex-col gap-6">
                
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
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                    138 WPM (Ideal Cadence)
                  </span>
                </div>

                {/* Animated Audio Waveform Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#FF6B00]">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-widest">|||||||||||||||||||||||||||||||||||||</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">00:42 / 02:00</span>
                </div>

                {/* Transcribed Speech Quote Box */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans relative">
                  <span className="text-lg font-serif text-[#FF6B00] absolute top-2 left-3">&ldquo;</span>
                  <p className="pl-4">
                    To route private EC2 traffic to the internet while keeping subnet isolation, I would deploy a <span className="text-[#FF6B00] font-bold">NAT Gateway</span> in the public subnet and point private route tables to the <span className="text-[#FF6B00] font-bold">NAT GW</span> instance....&rdquo;
                  </p>
                </div>

                {/* 4 Micro Feature Icons below Speech Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center shrink-0">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white">Live STT</span>
                      <span className="text-[9px] text-slate-400">Real-time transcription</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white">Cadence Check</span>
                      <span className="text-[9px] text-slate-400">Pace & clarity analysis</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white">Accuracy Score</span>
                      <span className="text-[9px] text-slate-400">Contextual relevance</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white">Logic Evaluation</span>
                      <span className="text-[9px] text-slate-400">Flow & reasoning</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Strip (Screenshot 2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Real-World Simulation</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Interview-like audio environments</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Data-Driven Feedback</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Actionable insights to improve</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#0B1E36] text-[#FF6B00] flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Score What Matters</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Technical depth, clarity & logic</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. 5-STAGE SYSTEM SECTION (Screenshot 3) */}
      <section id="features" className="py-20 relative z-10 bg-white dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black text-[#FF6B00] bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/50 inline-flex items-center gap-1.5 mb-3">
              🚀 5-STAGE SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] dark:text-white tracking-tight uppercase">
              PRACTICE REAL <span className="text-[#FF6B00]">AWS INCIDENTS</span> & GET AI SCORED
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
              Follow a proven 5-stage system to build real-world chops. Master cloud problem-solving.
            </p>
          </div>

          {/* 5 Horizontal Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: "01", name: "PROFILE PITCH", desc: "Tell us about yourself & your goals", color: "text-[#FF6B00] bg-orange-100/80", icon: FileText },
              { id: "02", name: "LINUX WARRIOR", desc: "Excel in shells, scripts & tools like a pro", color: "text-blue-600 bg-blue-100/80", icon: Terminal },
              { id: "03", name: "MULTI CLOUD", desc: "AWS, GCP & Azure basics & core services", color: "text-emerald-600 bg-emerald-100/80", icon: Cloud },
              { id: "04", name: "CONTAINERS & K8S", desc: "Containerize & orchestrate like a SRE", color: "text-purple-600 bg-purple-100/80", icon: Layers },
              { id: "05", name: "INCIDENT BOSS", desc: "Crack real incidents, root cause & resolve", color: "text-amber-600 bg-amber-100/80", icon: Shield },
            ].map((st, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-[#FF6B00]">STAGE {st.id}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: idx === 0 ? "#FFF3EB" : idx === 1 ? "#EFF6FF" : idx === 2 ? "#ECFDF5" : idx === 3 ? "#F5F3FF" : "#FFFBEB" }}>
                    <st.icon className={`w-7 h-7 ${idx === 0 ? "text-[#FF6B00]" : idx === 1 ? "text-blue-600" : idx === 2 ? "text-emerald-600" : idx === 3 ? "text-purple-600" : "text-amber-600"}`} />
                  </div>

                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white text-center group-hover:text-[#FF6B00] transition-colors uppercase tracking-tight">{st.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2 leading-relaxed font-medium">{st.desc}</p>
                </div>

                <Link href="/login" className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1 text-xs font-extrabold text-[#FF6B00]">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom Strip (Screenshot 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Hands-on Learning</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Real AWS incidents & tools</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">AI-Powered Scoring</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Get instant feedback & improve</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Career-Ready Skills</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Build confidence. Land roles.</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. ATS RESUME ANALYZER & STAR REWRITER SECTION */}
      <section id="ats" className="py-20 relative z-10 bg-gradient-to-b from-white via-orange-50/20 to-white dark:from-[#070b14] dark:via-orange-950/10 dark:to-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Interactive STAR Formula Rewriter Mock Card */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
                
                {/* Header Bar */}
                <div className="bg-[#0B1E36] p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black tracking-tight">STAR Formula Bullet Point Rewriter</span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-amber-300 border border-amber-400/40 bg-amber-400/10 flex items-center gap-1">
                    +34% Interview Call Rate 📈
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col gap-4">
                  
                  {/* BEFORE (WEAK BULLET) */}
                  <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>BEFORE REWRITING (WEAK BULLET)</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic">
                        &ldquo;Managed AWS EC2 instances and set up Docker containers for deployments.&rdquo;
                      </p>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <span className="text-xs font-black">✕</span>
                    </div>
                  </div>

                  {/* AFTER AI STAR OPTIMIZATION */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AFTER AI STAR OPTIMIZATION (QUANTIFIED IMPACT)</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        &ldquo;Architected multi-stage Docker builds on AWS EKS with Terraform IaC, reducing container image size by <strong className="text-emerald-600 dark:text-emerald-400 font-black">62%</strong> and eliminating production deployment downtime.&rdquo;
                      </p>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>

                  {/* IMPACT YOU CAN SEE */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IMPACT YOU CAN SEE</span>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          +62%
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Efficiency Gain</span>
                      </div>

                      <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-3">
                        <span className="text-sm font-black text-purple-600 dark:text-purple-400 flex items-center gap-1 font-mono">
                          <Zap className="w-3.5 h-3.5 text-purple-500" />
                          0
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Deployment Downtime</span>
                      </div>

                      <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-3">
                        <span className="text-sm font-black text-[#FF6B00] flex items-center gap-1 font-mono">
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                          +34%
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Interview Call Rate</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Right Column: Title & 5 Features */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div>
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black text-[#FF6B00] bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/50 inline-flex items-center gap-1.5 mb-3">
                  ⭐ 6-FACTOR ATS RESUME ENGINE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0B1E36] dark:text-white tracking-tight uppercase leading-tight">
                  SCAN YOUR RESUME AGAINST<br />
                  REAL <span className="text-[#FF6B00]">CLOUD ENGINEERING JDS</span>
                </h2>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Uncover missing critical keywords (IRSA, Terraform state locking, Prometheus metrics) and automatically rewrite bullet points with quantified STAR metrics.
              </p>

              <Link
                href="/resume-ats"
                className="w-fit py-3.5 px-7 rounded-2xl font-black text-xs text-white bg-[#0B1E36] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-xl shadow-[#0B1E36]/20 flex items-center gap-2.5 transition-all"
              >
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>Audit Your Resume Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* 5 Feature Icons at bottom right */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center mb-1">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">Keyword Gap Detection</span>
                </div>

                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">AI-Powered Rewriting</span>
                </div>

                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">STAR Metric Scoring</span>
                </div>

                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">ATS Match Optimization</span>
                </div>

                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">Real Impact Insights</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. 30-DAY GUIDED LEARNING SPRINTS ROADMAP SECTION */}
      <section id="roadmap" className="py-20 relative z-10 bg-white dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest block mb-2">
              AUTOMATED AI ROADMAP
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-[#0B1E36] dark:text-white tracking-tight uppercase leading-tight">
              30-DAY GUIDED LEARNING SPRINTS<br />
              TO RESOLVE SKILL GAPS
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium leading-relaxed max-w-2xl mx-auto">
              Based on your interview scores, our system synthesizes a 4-week study plan with direct links to official documentation & hands-on lab challenges.
            </p>
          </div>

          {/* Stepper Timeline Header */}
          <div className="relative max-w-5xl mx-auto mb-10 hidden md:block">
            <div className="absolute top-4 left-10 right-10 h-[1.5px] border-b-2 border-dashed border-slate-200 dark:border-slate-800 z-0" />
            
            <div className="grid grid-cols-4 relative z-10 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-[#FF6B00] text-[#FF6B00] font-black text-xs flex items-center justify-center shadow-xs">
                  1
                </div>
                <span className="text-[10px] font-black font-mono text-[#FF6B00] tracking-widest uppercase">WEEK 1</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </div>
                <span className="text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 tracking-widest uppercase">WEEK 2</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-500 text-purple-600 dark:text-purple-400 font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </div>
                <span className="text-[10px] font-black font-mono text-purple-600 dark:text-purple-400 tracking-widest uppercase">WEEK 3</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-[#FF6B00] text-[#FF6B00] font-black text-xs flex items-center justify-center shadow-xs">
                  4
                </div>
                <span className="text-[10px] font-black font-mono text-[#FF6B00] tracking-widest uppercase">WEEK 4</span>
              </div>
            </div>
          </div>

          {/* 4 Week Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Week 1 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all">
              <div>
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=600" 
                    alt="Linux Kernel Code" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#FF6B00] text-white shadow-md">
                    WEEK 1
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center">
                    <Terminal className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">LINUX KERNEL & NETWORKING</h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    In-depth disk I/O, memory heaps, systemd units & sockets.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a 
                  href="https://access.redhat.com/documentation" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-extrabold text-[#FF6B00] hover:underline pt-3 border-t border-slate-800"
                >
                  <span>Official RHEL & Ubuntu Docs</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Week 2 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all">
              <div>
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600" 
                    alt="AWS Cloud Networking" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-mono font-bold bg-blue-600 text-white shadow-md">
                    WEEK 2
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                    <Cloud className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">AWS VPC, IAM & SECURITY</h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Master subnets, NAT GW, IAM STS & IRSA policy binding.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a 
                  href="https://aws.amazon.com/architecture/well-architected/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-extrabold text-blue-400 hover:underline pt-3 border-t border-slate-800"
                >
                  <span>AWS Well-Architected Guide</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Week 3 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all">
              <div>
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&q=80&w=600" 
                    alt="Kubernetes Containers" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-mono font-bold bg-purple-600 text-white shadow-md">
                    WEEK 3
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">DOCKER & KUBERNETES EKS</h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Multi-stage Docker builds, pod probes & ingress routing.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a 
                  href="https://kubernetes.io/docs/home/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-extrabold text-purple-400 hover:underline pt-3 border-t border-slate-800"
                >
                  <span>CNCF Kubernetes Docs</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Week 4 Card */}
            <div className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all">
              <div>
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600" 
                    alt="Terraform Infrastructure" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#FF6B00] text-white shadow-md">
                    WEEK 4
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center">
                    <Code2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">TERRAFORM IAC & INCIDENTS</h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Remote state locking, module design & outage post mortems.
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <a 
                  href="https://developer.hashicorp.com/terraform/docs" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between text-xs font-extrabold text-[#FF6B00] hover:underline pt-3 border-t border-slate-800"
                >
                  <span>HashiCorp Docs & Runbooks</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Feature Bar (Screenshot Roadmap) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">30 Days Guided Sprints</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Structured 4-week plan to build real-world skills.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#0B1E36] text-[#FF6B00] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Score Based Personalization</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Roadmap adapts to your interview performance.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Official Docs & Labs</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Direct links to trusted docs & hands-on challenges.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-[#0B1E36] dark:text-white">Track Progress & Improve</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Measure learning, close gaps & boost interview score.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section id="faq" className="py-20 relative z-10 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#FF6B00] uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-black text-[#0B1E36] dark:text-white tracking-tight mt-2">
              Got Questions? We&apos;ve Got Answers.
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs transition-colors duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0B1E36] dark:text-white hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-[#FF6B00] shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HIGH-IMPACT PRE-FOOTER CTA BANNER */}
      <section className="py-16 relative z-10 bg-[#0B1E36] text-white border-t border-slate-800 overflow-hidden">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#102A4C] via-[#0B1E36] to-[#102A4C] border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            
            <div className="flex flex-col gap-3 max-w-2xl">
              <span className="px-3.5 py-1 rounded-full text-xs font-black text-[#FF6B00] bg-[#FF6B00]/20 border border-[#FF6B00]/30 w-fit">
                ⚡ READY TO LAND YOUR NEXT CLOUD ROLE?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight">
                PRACTICE REAL AWS INCIDENTS & GET HIRED FASTER
              </h2>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                Join 10,000+ DevOps & SRE engineers mastering technical voice interviews, ATS resume optimization, and 30-day skill roadmaps.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/register"
                className="py-3.5 px-7 rounded-full font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Free AI Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#ats"
                className="py-3.5 px-6 rounded-full font-extrabold text-xs text-white bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>Audit My Resume (ATS)</span>
              </a>
            </div>

            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 7. REDESIGNED CORPORATE SAAS FOOTER */}
      <footer className="bg-[#0B1E36] text-white pt-16 pb-10 border-t border-slate-800 font-sans">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            {/* Column 1: Brand & Status */}
            <div className="lg:col-span-[1.4] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 p-[1.5px] shadow-md">
                  <div className="w-full h-full bg-[#0B1E36] rounded-[13px] flex items-center justify-center text-white">
                    <Cloud className="w-4.5 h-4.5 text-[#FF6B00]" />
                  </div>
                </div>
                <span className="text-lg font-black text-white tracking-tight">
                  CloudOps <span className="text-[#FF6B00]">AI</span> Assessment OS
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                The premier AI-powered voice interview, skill evaluation, and ATS resume operating system engineered for Cloud Operations, SRE & DevOps professionals.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Systems Operational</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                  <span>🔒 SOC2 Type II Certified</span>
                  <span>•</span>
                  <span>🛡️ 256-Bit SSL Encryption</span>
                </div>
              </div>
            </div>

            {/* Column 2: PRODUCT SUITE */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-white uppercase tracking-wider text-[11px]">PRODUCT SUITE</span>
              <a href="#features" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">5-Stage Gated System</a>
              <a href="#voice-ai" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Voice AI Chamber</a>
              <a href="#ats" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">6-Factor ATS Analyzer</a>
              <a href="#roadmap" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">30-Day AI Roadmap</a>
              <Link href="/leaderboard" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Leaderboard & XP</Link>
            </div>

            {/* Column 3: TECH STACKS */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-white uppercase tracking-wider text-[11px]">TECH STACKS</span>
              <span className="text-slate-400 font-medium">AWS EKS & VPC Subnets</span>
              <span className="text-slate-400 font-medium">Kubernetes & Helm</span>
              <span className="text-slate-400 font-medium">HashiCorp Terraform IaC</span>
              <span className="text-slate-400 font-medium">Docker Multi-Stage</span>
              <span className="text-slate-400 font-medium">Prometheus & Grafana</span>
            </div>

            {/* Column 4: RESOURCES & HELP */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-white uppercase tracking-wider text-[11px]">RESOURCES & HELP</span>
              <Link href="/help" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Engineering Help Desk</Link>
              <a href="#faq" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">FAQ & Documentation</a>
              <Link href="/login" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Candidate Login</Link>
              <a href="https://resume3-admin.vercel.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Admin Portal</a>
            </div>

            {/* Column 5: NEWSLETTER & COMMUNITY */}
            <div className="flex flex-col gap-3 text-xs">
              <span className="font-black text-white uppercase tracking-wider text-[11px]">DEVOPS COMMUNITY</span>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Get weekly AWS incident post-mortems & interview questions.
              </p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("Subscribed to DevOps Community Newsletter!"); }} className="flex items-center gap-1.5 mt-1">
                <input
                  type="email"
                  placeholder="Enter work email..."
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-500 text-white font-bold transition-all shrink-0"
                >
                  ➔
                </button>
              </form>

              <div className="flex flex-wrap gap-1 pt-2">
                {["AWS", "K8s", "Terraform", "Linux", "Python", "Go"].map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <span>© 2026 CloudOps AI Assessment OS. Built for Cloud Engineers worldwide.</span>
            
            <div className="flex items-center gap-6 text-[11px] font-medium flex-wrap">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Security Compliance</span>
              <span className="hover:text-white cursor-pointer transition-colors">90-Day Data Retention Policy</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
