"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Cloud, Mic, Shield, Sparkles, Trophy, ArrowRight, CheckCircle2, 
  Terminal, Server, Cpu, Layers, FileCheck, Map, Star, Users, 
  ChevronRight, Play, Zap, Flame, Award, BarChart3, HelpCircle,
  ExternalLink, Code2, AlertTriangle, ArrowUpRight, Check,
  Home, Flag, Monitor, Globe, Database, Archive, Briefcase, FolderCheck, FileText, User,
  ChevronDown, ChevronUp, Lock, RefreshCw, Layers3, Activity, Target, AlignLeft, Scale, LayoutGrid, Search, ShieldCheck, TrendingUp, Calendar, MessageSquare
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
          <Link prefetch={false} href="/" className="flex items-center gap-3 group">
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

            <Link prefetch={false} 
              href="/login" 
              className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-[#0B1E36] dark:hover:text-white px-2 py-2 transition-colors"
            >
              Sign In
            </Link>

            <Link prefetch={false} 
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
      <section className="relative z-10 pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        {/* High-Tech Engineer Server Room Background Image with Fade from Left to Right */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-right bg-no-repeat opacity-95 dark:opacity-80 pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url('/images/hero_engineer_datacenter.webp')` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/90 via-45% to-transparent dark:from-[#070b14] dark:via-[#070b14]/90 dark:via-45% dark:to-transparent pointer-events-none" />

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#0B1E36] dark:text-white tracking-tight leading-[1.05] font-sans uppercase">
                LAND YOUR NEXT<br />
                <span className="text-[#FF6B00]">CLOUD ENGINEERING</span><br />
                ROLE.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-lg">
                Practice real AWS incidents, improve your interview skills, and see exactly what to fix.
              </p>

              {/* Action Pill CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link prefetch={false}
                  href="/register"
                  className="py-4 px-7 rounded-full font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Free AI Interview</span>
                </Link>

                <a
                  href="#ats"
                  className="py-4 px-7 rounded-full font-extrabold text-xs text-[#0B1E36] dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] flex items-center justify-center gap-2.5 shadow-xs hover:scale-[1.02] transition-all"
                >
                  <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>Analyze My Resume</span>
                </a>
              </div>

              {/* 4 Feature Real 3D Image Cards below CTAs (Prominent Large Size) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-7 border-t border-slate-200/80 dark:border-slate-800 mt-2">
                
                {/* 1. AI Voice Interview */}
                <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 group-hover:shadow-xl transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_voice_mic.webp" 
                      alt="AI Voice Interview Studio Mic" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">AI Voice Interview</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Real-world AWS incident practice</span>
                </div>

                {/* 2. ATS Resume Score */}
                <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 group-hover:shadow-xl transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_ats_score.webp" 
                      alt="ATS Resume Analytics Laptop" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">ATS Resume Score</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">See your match score instantly</span>
                </div>

                {/* 3. 5-Stage System */}
                <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 group-hover:shadow-xl transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_5stage_aws.webp" 
                      alt="AWS 3D Cloud Badge" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">5-Stage System</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">80%+ score to unlock next stage</span>
                </div>

                {/* 4. 30-Day Roadmap */}
                <div className="flex flex-col gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-[#0B1E36] to-[#102A4C] p-1.5 group-hover:scale-105 group-hover:shadow-xl group-hover:border-[#FF6B00] transition-all shrink-0 flex items-center justify-center">
                    <img loading="lazy" decoding="async" 
                      src="/images/roadmap_aws_light_3d-removebg-preview.webp" 
                      alt="3D AWS Cloud Architecture Skill Roadmap" 
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">30-Day Roadmap</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Personalized plan to land offers</span>
                </div>

              </div>

            </div>

            {/* Hero Right Column: AWS Architecture Mock Visual with Background Engineer Photo Overlay */}
            <div className="lg:col-span-7 relative">
              
              {/* Floating ambient glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-400/20 via-blue-500/15 to-amber-500/10 blur-2xl pointer-events-none -z-10" />

              <div className="w-full rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-400/30 dark:shadow-black/70 overflow-hidden flex flex-col md:flex-row min-h-[470px] relative transition-colors duration-300">
                
                {/* Dark Blue Sidebar */}
                <div className="w-full md:w-52 bg-[#0B1E36] p-5 text-white flex flex-col justify-between shrink-0">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#FF6B00] flex items-center justify-center text-white font-bold shadow-md shadow-[#FF6B00]/30">
                        <Cloud className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black tracking-tight text-white">CloudOps AI</span>
                    </div>

                    <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-[#FF6B00] mb-2 shadow-md">
                        <img loading="lazy" decoding="async" 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                          alt="Rahul Rawat Profile" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-xs font-black text-white">Rahul Rawat</span>
                      <span className="text-[10px] text-slate-300 font-semibold">Cloud Engineer</span>
                    </div>

                    {/* Interactive Sidebar Navigation Tabs */}
                    <div className="flex flex-col gap-1.5 text-[11px] font-semibold">
                      <button
                        onClick={() => setActiveHeroTab("overview")}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-left ${
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

                </div>

                {/* Dynamic Right Content Panel */}
                <div className="flex-1 p-6 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col justify-between gap-5">
                  
                  {activeHeroTab === "overview" && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black text-[#FF6B00] bg-orange-500/10 border border-[#FF6B00]/30 uppercase">AWS</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">AWS Incident Simulation OS</span>
                        </div>
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          94% Match Score
                        </span>
                      </div>

                      {/* AWS Connected Architecture Flow */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md border border-slate-700">
                            <Monitor className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Client</span>
                        </div>
                        <span className="text-[#FF6B00] font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Route 53</span>
                        </div>
                        <span className="text-[#FF6B00] font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">ALB</span>
                        </div>
                        <span className="text-[#FF6B00] font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                            <Cpu className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">EC2</span>
                        </div>
                        <span className="text-[#FF6B00] font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                            <Database className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">RDS</span>
                        </div>
                        <span className="text-[#FF6B00] font-bold text-xs">➔</span>

                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <Archive className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">S3</span>
                        </div>
                      </div>

                      {/* 3 Metric Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Code2 className="w-4 h-4 text-[#FF6B00]" />
                            Skills
                          </span>
                          <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            <div>
                              <div className="flex justify-between mb-1"><span>AWS Services</span></div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 w-[90%]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1"><span>Networking</span></div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 w-[84%]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1"><span>IAM & Security</span></div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 w-[78%]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            Experience
                          </span>
                          <div className="flex flex-col gap-2 text-[10.5px]">
                            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                              <span>Cloud Engineer</span>
                              <span className="text-slate-400 font-mono">3.2 yrs</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                              <span>DevOps Engineer</span>
                              <span className="text-slate-400 font-mono">1.8 yrs</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                              <span>SRE Intern</span>
                              <span className="text-slate-400 font-mono">0.6 yrs</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <FolderCheck className="w-4 h-4 text-emerald-500" />
                            Projects
                          </span>
                          <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-1">Multi-Region Web App</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-1">CI/CD with GitHub Actions</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="truncate pr-1">Serverless Data Pipeline</span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeHeroTab === "practice" && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36] dark:text-white">Voice AI Interview Chamber</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-[#FF6B00] border border-amber-300">Stage 3 Active</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0B1E36] text-white flex flex-col gap-3.5 shadow-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#FF6B00] font-mono font-bold">PROMPT #3 (VPC MESH)</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Microphone Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium leading-relaxed">
                          &ldquo;Explain how you configure AWS IRSA (IAM Roles for Service Accounts) to grant fine-grained permissions to a Pod running in EKS.&rdquo;
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <div className="flex items-center gap-1 text-[#FF6B00]">
                            <Activity className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-mono font-bold tracking-widest text-[#FF6B00]">|||||||||||||||||||</span>
                          </div>
                          <span className="text-[11px] text-emerald-400 font-mono font-bold">Cadence: 142 WPM (Ideal)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeHeroTab === "ats" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36] dark:text-white">ATS Bullet Point STAR Rewriter</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+34% Interview Call Rate</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs flex flex-col gap-1">
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase">WEAK UNQUANTIFIED BULLET:</span>
                        <p className="text-slate-700 dark:text-slate-300 italic font-medium">&ldquo;Managed AWS EC2 instances and set up Docker containers for deployments.&rdquo;</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs flex flex-col gap-1">
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase">QUANTIFIED STAR BULLET:</span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">&ldquo;Architected multi-stage Docker builds on AWS EKS with Terraform IaC, reducing container image size by <strong className="text-emerald-700 dark:text-emerald-400 font-black">62%</strong> and zero downtime.&rdquo;</p>
                      </div>
                    </div>
                  )}

                  {activeHeroTab === "roadmap" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36] dark:text-white">30-Day Guided Sprint Progress</span>
                        <span className="text-xs font-mono font-bold text-[#FF6B00]">Day 14 of 30</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1 shadow-xs">
                          <span className="text-[10px] font-black text-[#FF6B00]">WEEK 1 (COMPLETED)</span>
                          <p className="font-extrabold text-slate-800 dark:text-white">Linux Kernel & Sockets</p>
                          <span className="text-[10px] text-emerald-500 font-bold">100% Mastered ✓</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-1 shadow-xs">
                          <span className="text-[10px] font-black text-blue-500">WEEK 2 (IN PROGRESS)</span>
                          <p className="font-extrabold text-slate-800 dark:text-white">AWS VPC & IRSA Binding</p>
                          <span className="text-[10px] text-blue-500 font-bold">Stage 3 Gate Unlocked 🔓</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeHeroTab === "profile" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B1E36] dark:text-white">Candidate Matrix Profile</span>
                        <span className="text-xs font-black text-[#FF6B00] bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-full border border-orange-300">Level 5 (1,850 XP)</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0B1E36] text-white flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">READINESS SCORE</span>
                          <span className="text-2xl font-black text-emerald-400 font-mono">94.8%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">TARGET SALARY BAND</span>
                          <span className="text-xs font-extrabold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">₹12–18 LPA</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>

          </div>
        </div>

        {/* TRUST BANNER AT BOTTOM OF HERO (Identical to Screenshot) */}
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 mt-12">
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/50 flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300">
            <span className="text-xs font-black text-[#0B1E36] dark:text-white tracking-wider uppercase shrink-0">
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

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img loading="lazy" decoding="async" className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="User 1" />
                <img loading="lazy" decoding="async" className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="User 2" />
                <img loading="lazy" decoding="async" className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" alt="User 3" />
                <img loading="lazy" decoding="async" className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="User 4" />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white">10,000+ Engineers <span className="text-slate-400 font-medium block text-[10px]">are leveling up</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VOICE AI & 5 PILLARS SECTION (Screenshot 2) */}
      <section id="voice-ai" className="py-20 relative z-10 bg-slate-50 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
        {/* High-Tech Ambient Cloud Network Background Image Overlay for Voice AI */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40 pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url('/images/hero_bg_cloud_network.webp')` }}
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

            {/* Right Column: 3D Voice AI Studio Chamber Showcase Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[32px] bg-gradient-to-b from-[#0B1E36] via-[#102A4C] to-[#0B1E36] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 group">
                
                {/* Header Bar */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 p-[1.5px] shadow-md">
                      <div className="w-full h-full bg-[#0B1E36] rounded-[13px] flex items-center justify-center text-white">
                        <Mic className="w-5 h-5 text-[#FF6B00]" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-black text-white tracking-tight">Voice AI Interview Chamber</h3>
                      <span className="text-xs text-slate-400 font-medium">Whisper STT & Real-Time Cadence Scoring</span>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    138 WPM (Ideal)
                  </span>
                </div>

                {/* 3D Microphone Image Showcase Body */}
                <div className="p-6 sm:p-8 flex flex-col gap-6 relative z-10">
                  
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/80 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_voice_chamber_3d.webp" 
                      alt="Voice AI Microphone Chamber 3D Render" 
                      className="w-full h-60 sm:h-64 object-cover"
                    />

                    {/* Floating Floating Badges over Image */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-[#0B1E36]/90 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-white flex items-center gap-2 shadow-lg">
                      <Activity className="w-3.5 h-3.5 text-[#FF6B00] animate-pulse" />
                      <span>Live Speech-to-Text Active</span>
                    </div>

                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-[#FF6B00] text-white text-[11px] font-black flex items-center gap-1.5 shadow-xl">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Stage 3 Gated Pass</span>
                    </div>
                  </div>

                  {/* Transcribed Speech Quote Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 leading-relaxed font-sans relative">
                    <span className="text-lg font-serif text-[#FF6B00] absolute top-2 left-3">&ldquo;</span>
                    <p className="pl-4">
                      To route private EC2 traffic to the internet while keeping subnet isolation, I would deploy a <span className="text-[#FF6B00] font-bold">NAT Gateway</span> in the public subnet and point private route tables to the <span className="text-[#FF6B00] font-bold">NAT GW</span> instance....&rdquo;
                    </p>
                  </div>

                  {/* 4 Micro Feature Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 text-[#FF6B00] flex items-center justify-center shrink-0">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Live STT</span>
                        <span className="text-[9px] text-slate-400">Real-time transcribing</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Cadence Check</span>
                        <span className="text-[9px] text-slate-400">WPM & clarity</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Accuracy Score</span>
                        <span className="text-[9px] text-slate-400">Contextual depth</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white">Logic Eval</span>
                        <span className="text-[9px] text-slate-400">Flow & reasoning</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Bottom Feature Strip (Unified Card matching Screenshot 100%) */}
          <div className="mt-12 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/60 p-6 sm:p-8 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 gap-6 md:gap-0">
              
              {/* Item 1 */}
              <div className="flex items-center gap-4 md:px-6 first:pl-0">
                <div className="w-14 h-14 rounded-full bg-orange-100/80 dark:bg-orange-950/50 text-[#FF6B00] flex items-center justify-center shrink-0 shadow-xs">
                  <Target className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Real-World <span className="text-[#FF6B00]">Simulation</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Interview-like spoken audio environments.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                <div className="w-14 h-14 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Data-Driven <span className="text-amber-600 dark:text-amber-400">Feedback</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Actionable insights to improve speech & logic.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0 last:pr-0">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-[#0B1E36] dark:text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Score <span className="text-[#FF6B00]">What Matters</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Technical depth, speech clarity & reasoning.
                  </p>
                </div>
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

          {/* 5 Horizontal Stage Cards (With 3D Photo Thumbnails) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: "01", name: "PROFILE PITCH", desc: "Tell us about yourself & your goals", img: "/images/thumb_voice_mic.webp" },
              { id: "02", name: "LINUX WARRIOR", desc: "Excel in shells, scripts & tools like a pro", img: "/images/card_linux_kernel.webp" },
              { id: "03", name: "MULTI CLOUD", desc: "AWS, GCP & Azure basics & core services", img: "/images/thumb_5stage_aws.webp" },
              { id: "04", name: "CONTAINERS & K8S", desc: "Containerize & orchestrate like a SRE", img: "/images/card_docker_k8s.webp" },
              { id: "05", name: "INCIDENT BOSS", desc: "Crack real incidents, root cause & resolve", img: "/images/thumb_boss_battle.webp" },
            ].map((st, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40, x: idx % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-md hover:shadow-xl hover:shadow-[#FF6B00]/10 transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-[#FF6B00]">STAGE {st.id}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  {/* 3D Thumbnail Render */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-all shrink-0 mx-auto my-3">
                    <img loading="lazy" decoding="async" 
                      src={st.img} 
                      alt={st.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white text-center group-hover:text-[#FF6B00] transition-colors uppercase tracking-tight leading-snug">{st.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1.5 leading-relaxed font-medium">{st.desc}</p>
                </div>

                <Link prefetch={false} href="/login" className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-xs font-extrabold text-[#FF6B00] group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom Feature Strip (Unified Card matching Screenshot 100%) */}
          <div className="mt-12 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/60 p-6 sm:p-8 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 gap-6 md:gap-0">
              
              {/* Item 1 */}
              <div className="flex items-center gap-4 md:px-6 first:pl-0">
                <div className="w-14 h-14 rounded-full bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Hands-on <span className="text-emerald-600 dark:text-emerald-400">Learning</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Real AWS incidents & interactive tools.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                <div className="w-14 h-14 rounded-full bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    AI-Powered <span className="text-blue-600 dark:text-blue-400">Scoring</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Get instant rubric feedback & improve fast.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0 last:pr-0">
                <div className="w-14 h-14 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-[#FF6B00] flex items-center justify-center shrink-0 shadow-xs">
                  <Trophy className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Career-Ready <span className="text-[#FF6B00]">Skills</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Build confidence and land top cloud offers.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. ATS RESUME ANALYZER & STAR REWRITER SECTION */}
      <section id="ats" className="py-20 relative z-10 bg-gradient-to-b from-white via-orange-50/20 to-white dark:from-[#070b14] dark:via-orange-950/10 dark:to-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: 3D ATS Resume Scanner Showcase Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[32px] bg-gradient-to-b from-[#0B1E36] via-[#102A4C] to-[#0B1E36] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 group">
                
                {/* Header Bar */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 p-[1.5px] shadow-md">
                      <div className="w-full h-full bg-[#0B1E36] rounded-[13px] flex items-center justify-center text-white">
                        <FileCheck className="w-5 h-5 text-[#FF6B00]" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-sm font-black text-white tracking-tight">AI ATS Resume Analyzer OS</h3>
                      <span className="text-xs text-slate-400 font-medium">6-Factor Scanner & Real-Time Parser</span>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    94% ATS Match
                  </span>
                </div>

                {/* 3D Laptop Image Showcase Body */}
                <div className="p-6 sm:p-8 flex flex-col gap-6 relative z-10">
                  
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/80 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                    <img loading="lazy" decoding="async" 
                      src="/images/ats_resume_laptop_3d.webp" 
                      alt="ATS Resume Scanner 3D Render" 
                      className="w-full h-64 sm:h-72 object-cover"
                    />

                    {/* Floating Floating Badges over Image */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-[#0B1E36]/90 backdrop-blur-md border border-slate-700 text-[11px] font-bold text-white flex items-center gap-2 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>STAR Formula Optimized</span>
                    </div>

                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-[#FF6B00] text-white text-[11px] font-black flex items-center gap-1.5 shadow-xl">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+34% Interview Call Rate</span>
                    </div>
                  </div>

                  {/* 3 Metrics Bottom Bar */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-emerald-400 font-mono flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        94/100
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">ATS Score</span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-3">
                      <span className="text-sm font-black text-purple-400 font-mono flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-purple-400" />
                        100%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">Parseability</span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-3">
                      <span className="text-sm font-black text-[#FF6B00] font-mono flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#FF6B00]" />
                        +34%
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">Callback Rate</span>
                    </div>
                  </div>

                </div>

                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
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

              <Link prefetch={false}
                href="/resume-ats"
                className="w-fit py-3.5 px-7 rounded-2xl font-black text-xs text-white bg-[#0B1E36] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 shadow-xl shadow-[#0B1E36]/20 flex items-center gap-2.5 transition-all"
              >
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>Audit Your Resume Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* 4 Feature 3D Image Cards below ATS CTAs matching Hero Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-7 border-t border-slate-200/80 dark:border-slate-800">
                
                {/* 1. Keyword Gap Detection */}
                <div className="flex flex-col items-center text-center gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_ats_keyword.webp" 
                      alt="Keyword Gap Detection" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">Keyword Gap Detection</span>
                </div>

                {/* 2. AI-Powered Rewriting */}
                <div className="flex flex-col items-center text-center gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_ats_rewrite.webp" 
                      alt="AI-Powered Rewriting" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">AI-Powered Rewriting</span>
                </div>

                {/* 3. STAR Metric Scoring */}
                <div className="flex flex-col items-center text-center gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_ats_star.webp" 
                      alt="STAR Metric Scoring" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">STAR Metric Scoring</span>
                </div>

                {/* 4. ATS Match Optimization */}
                <div className="flex flex-col items-center text-center gap-2 group cursor-pointer">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] overflow-hidden shadow-lg shadow-slate-200/60 dark:shadow-black/60 border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-all shrink-0">
                    <img loading="lazy" decoding="async" 
                      src="/images/thumb_ats_match.webp" 
                      alt="ATS Match Optimization" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <span className="text-sm font-black text-[#0B1E36] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">ATS Match Optimization</span>
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
            <motion.div 
              initial={{ opacity: 0, x: -60, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer"
            >
              <div>
                <div className="h-48 relative bg-slate-950 overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/card_linux_kernel.webp" 
                    alt="Linux Kernel & Networking" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-[#FF6B00] text-white shadow-md uppercase">
                    WEEK 1
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center shadow-xs">
                    <Terminal className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight uppercase">LINUX KERNEL & NETWORKING</h3>
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
                  className="flex items-center justify-between text-xs font-extrabold text-[#FF6B00] hover:underline pt-3 border-t border-slate-800/80"
                >
                  <span>Official RHEL & Ubuntu Docs</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Week 2 Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800/90 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-blue-500 transition-all cursor-pointer"
            >
              <div>
                <div className="h-48 relative bg-slate-950 overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/card_aws_vpc.webp" 
                    alt="AWS VPC IAM & Security" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-blue-600 text-white shadow-md uppercase">
                    WEEK 2
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-xs">
                    <Cloud className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight uppercase">AWS VPC, IAM & SECURITY</h3>
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
                  className="flex items-center justify-between text-xs font-extrabold text-blue-400 hover:underline pt-3 border-t border-slate-800/80"
                >
                  <span>AWS Well-Architected Guide</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Week 3 Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800/90 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-purple-500 transition-all cursor-pointer"
            >
              <div>
                <div className="h-48 relative bg-slate-950 overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/card_docker_k8s.webp" 
                    alt="Docker & Kubernetes EKS" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-purple-600 text-white shadow-md uppercase">
                    WEEK 3
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shadow-xs">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight uppercase">DOCKER & KUBERNETES EKS</h3>
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
                  className="flex items-center justify-between text-xs font-extrabold text-purple-400 hover:underline pt-3 border-t border-slate-800/80"
                >
                  <span>CNCF Kubernetes Docs</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Week 4 Card */}
            <motion.div 
              initial={{ opacity: 0, x: 60, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-3xl bg-[#0B1E36] text-white border border-slate-800/90 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-[#FF6B00] transition-all cursor-pointer"
            >
              <div>
                <div className="h-48 relative bg-slate-950 overflow-hidden">
                  <img loading="lazy" decoding="async" 
                    src="/images/card_terraform_iac.webp" 
                    alt="Terraform IaC & Incidents" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-[#FF6B00] text-white shadow-md uppercase">
                    WEEK 4
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center shadow-xs">
                    <Code2 className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight uppercase">TERRAFORM IAC & INCIDENTS</h3>
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
                  className="flex items-center justify-between text-xs font-extrabold text-[#FF6B00] hover:underline pt-3 border-t border-slate-800/80"
                >
                  <span>HashiCorp Docs & Runbooks</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

          </div>

          {/* Bottom Feature Bar (Unified Card matching Screenshot 100%) */}
          <div className="mt-12 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/60 p-6 sm:p-8 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 gap-6 md:gap-0">
              
              {/* Item 1 */}
              <div className="flex items-center gap-4 md:px-6 first:pl-0 last:pr-0">
                <div className="w-14 h-14 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-[#FF6B00] flex items-center justify-center shrink-0 shadow-xs">
                  <Calendar className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    30 Days <span className="text-[#FF6B00]">Guided Sprints</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Structured 4-week plan to build real-world skills.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                <div className="w-14 h-14 rounded-full bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Score Based <span className="text-blue-600 dark:text-blue-400">Personalization</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Roadmap adapts to your interview performance.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                <div className="w-14 h-14 rounded-full bg-purple-100/80 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Official Docs <span className="text-purple-600 dark:text-purple-400">& Labs</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Direct links to trusted docs & hands-on challenges.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                <div className="w-14 h-14 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-[#FF6B00] flex items-center justify-center shrink-0 shadow-xs">
                  <TrendingUp className="w-6 h-6 text-[#FF6B00]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-[#0B1E36] dark:text-white tracking-tight leading-snug">
                    Track Progress <span className="text-[#FF6B00]">& Improve</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    Measure learning, close gaps & boost interview score.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. FAQ SECTION (Redesigned 2-Column Split Layout) */}
      <section id="faq" className="py-20 lg:py-28 relative z-10 bg-slate-50/70 dark:bg-[#070b14] border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Heading & Support Box */}
            <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black text-[#FF6B00] bg-orange-500/10 border border-orange-500/20 w-fit">
                <HelpCircle className="w-4 h-4 text-[#FF6B00]" />
                <span className="uppercase tracking-widest">FREQUENTLY ASKED QUESTIONS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B1E36] dark:text-white tracking-tight leading-tight uppercase font-sans">
                Got Questions?<br />
                <span className="text-[#FF6B00]">We&apos;ve Got Answers.</span>
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Everything you need to know about our strict 80% stage gate progression system, Voice AI interview evaluation engine, and 6-factor ATS Resume Bullet Point Rewriter.
              </p>

              {/* Support Card Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1E36] via-[#0E2440] to-[#102A4C] text-white border border-slate-800/90 shadow-2xl flex flex-col gap-4 mt-2 relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center justify-center shrink-0 shadow-xs">
                    <MessageSquare className="w-6 h-6 text-[#FF6B00]" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-black text-white">Have a specific question?</h4>
                    <span className="text-xs text-slate-300 font-medium">Candidate support team is active 24/7</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium relative z-10">
                  Can&apos;t find what you&apos;re looking for? Submit a ticket directly to our technical admin team for rapid response.
                </p>

                <Link prefetch={false}
                  href="/login"
                  className="w-full py-3.5 px-5 rounded-2xl font-black text-xs text-center text-white bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-[#FF6B00]/20 transition-all flex items-center justify-center gap-2 relative z-10"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Contact Support Team</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FF6B00]/10 rounded-full blur-2xl pointer-events-none" />
              </div>
            </div>

            {/* Right Column: Glassmorphic Interactive Accordion List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl transition-all duration-300 border overflow-hidden ${
                      isOpen
                        ? "bg-white dark:bg-slate-900 border-[#FF6B00]/50 shadow-xl shadow-orange-500/5 ring-1 ring-[#FF6B00]/20"
                        : "bg-white/80 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 font-black text-base text-[#0B1E36] dark:text-white group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? "bg-[#FF6B00] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/40 group-hover:text-[#FF6B00]"
                        }`}>
                          0{idx + 1}
                        </span>
                        <span className="group-hover:text-[#FF6B00] transition-colors leading-snug">
                          {faq.q}
                        </span>
                      </div>

                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen ? "bg-orange-100 dark:bg-orange-950/60 text-[#FF6B00] rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-[#FF6B00]"
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-4 pl-16">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 6. UNIFIED HIGH-IMPACT FOOTER WITH INTEGRATED PRE-FOOTER CTA CARD */}
      <footer className="bg-[#050C17] text-white pt-12 pb-10 border-t border-slate-800/80 font-sans relative overflow-hidden z-10 transition-colors duration-300">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-14">
          
          {/* Top Integrated Pre-Footer CTA Card */}
          <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-r from-[#0B1E36] via-[#102A4C] to-[#0B1E36] border border-slate-700/80 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
            
            <div className="flex flex-col gap-3 max-w-2xl text-left relative z-10">
              <span className="px-3.5 py-1 rounded-full text-xs font-black text-[#FF6B00] bg-[#FF6B00]/15 border border-[#FF6B00]/30 w-fit">
                ⚡ READY TO LAND YOUR NEXT CLOUD ROLE?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight uppercase leading-tight font-sans">
                PRACTICE REAL AWS INCIDENTS & GET HIRED FASTER
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Join 10,000+ DevOps & SRE engineers mastering technical voice interviews, ATS resume optimization, and 30-day skill roadmaps.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
              <Link prefetch={false}
                href="/register"
                className="w-full sm:w-auto py-4 px-8 rounded-full font-black text-xs text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Free AI Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link prefetch={false}
                href="/resume-ats"
                className="w-full sm:w-auto py-4 px-7 rounded-full font-extrabold text-xs text-white bg-white/10 border border-white/20 hover:bg-white/20 flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-[#FF6B00]" />
                <span>Audit My Resume (ATS)</span>
              </Link>
            </div>

            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            {/* Column 1: Brand & Operational Status */}
            <div className="lg:col-span-[1.4] flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-amber-500 p-[1.5px] shadow-md">
                  <div className="w-full h-full bg-[#050C17] rounded-[13px] flex items-center justify-center text-white">
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

              <div className="flex flex-col gap-2 pt-1">
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
              <Link prefetch={false} href="/leaderboard" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Leaderboard & XP</Link>
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
              <Link prefetch={false} href="/help" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Engineering Help Desk</Link>
              <a href="#faq" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">FAQ & Documentation</a>
              <Link prefetch={false} href="/login" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Candidate Login</Link>
              <a href="https://resume3-admin.vercel.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#FF6B00] transition-colors font-medium">Admin Portal</a>
            </div>

            {/* Column 5: DEVOPS COMMUNITY */}
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
                  className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-500 text-white font-bold transition-all shrink-0"
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

          {/* Bottom Legal Bar */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <span>© 2026 CloudOps AI Assessment OS. Built for Cloud Engineers worldwide.</span>
            
            <div className="flex items-center gap-6 text-[11px] font-medium flex-wrap">
              <Link prefetch={false} href="/privacy" className="hover:text-[#FF6B00] transition-colors">Privacy Policy</Link>
              <Link prefetch={false} href="/terms" className="hover:text-[#FF6B00] transition-colors">Terms of Service</Link>
              <Link prefetch={false} href="/security" className="hover:text-[#FF6B00] transition-colors">Security Compliance</Link>
              <Link prefetch={false} href="/retention" className="hover:text-[#FF6B00] transition-colors">90-Day Data Retention Policy</Link>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
