"use client";

import Link from "next/link";
import { 
  FileText, Mic, Sparkles, ArrowRight, ShieldCheck, 
  Terminal, Award, Layers, Zap, CheckCircle2, ChevronRight,
  TrendingUp, Flame, Star, Cpu
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-300">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col gap-16">
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono tracking-wide shadow-lg shadow-indigo-500/5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Multi-Cloud • DevOps • DevSecOps • AI Career OS</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Crack Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
              High-Package Interview.
            </span>
          </h1>

          {/* Subheading & Tagline */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            <span className="font-semibold text-white">No Shortcut. Real Practice. Real Feedback. Real Interview Preparation.</span>
            <br />
            <span className="text-slate-400 text-sm sm:text-base">
              Learn Today. Implement Today. Build Your Career for a Lifetime.
            </span>
          </p>

          <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 80% Stage Gated</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Spoken Voice AI</span>
            <span>•</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Target ₹18–40 LPA</span>
          </div>
        </div>

        {/* 2 Primary Flagship Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Review My Resume */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none" />
            
            <div className="flex flex-col gap-5 z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Option 1
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                  Review My Resume
                  <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Upload your Resume (PDF/DOCX) or paste text against any DevOps Job Description. Get instant 6-factor ATS scoring, missing skill breakdown, and STAR bullet-point rewrites with quantifiable metrics.
                </p>
              </div>

              {/* Feature Pill Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                  ATS Score Breakdown
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                  Missing Skills Detection
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                  STAR Metric Rewriter
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  Auto Journey Recommender
                </span>
              </div>
            </div>

            <div className="pt-8 z-10">
              <Link
                href="/resume-ats"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all"
              >
                <span>Upload & Check ATS Score</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Prepare for My Interview */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />
            
            <div className="flex flex-col gap-5 z-10">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Mic className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Option 2
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                  Prepare for My Interview
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Take voice-powered technical interview challenges. Face 5 core progression stages from Linux Systems to the Production Incident Final Boss with live 5-pillar grading and 3-level progressive hints.
                </p>
              </div>

              {/* Feature Pill Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                  5 Core Challenge Stages
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                  3-Level Progressive Hints
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-white/5">
                  WPM & Confidence Signals
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                  XP & Cohort Leaderboard
                </span>
              </div>
            </div>

            <div className="pt-8 z-10">
              <Link
                href="/dashboard"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 group-hover:shadow-indigo-600/30 transition-all"
              >
                <span>Launch Interview Challenges</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 6-Step Closed Loop System */}
        <div className="flex flex-col gap-8 pt-8">
          <div className="text-center flex flex-col gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">The Continuous Growth Loop</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">How The Platform Transforms Your Career</h3>
            <p className="text-sm text-slate-400">
              Practice → Score → Feedback → Improve → Retry → Level Up
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: "01", title: "Upload", desc: "Resume PDF/DOCX or text analysis", icon: FileText, color: "text-blue-400" },
              { step: "02", title: "Analyze", desc: "ATS 6-factor score & missing skills", icon: Zap, color: "text-cyan-400" },
              { step: "03", title: "Practice", desc: "Spoken AI mock interview rounds", icon: Mic, color: "text-indigo-400" },
              { step: "04", title: "Evaluate", desc: "5-Pillar rubric & speech pacing", icon: Award, color: "text-purple-400" },
              { step: "05", title: "Improve", desc: "STAR rewrites & 30-day roadmap", icon: TrendingUp, color: "text-emerald-400" },
              { step: "06", title: "Crack", desc: "Unlock 40 LPA Final Boss level", icon: Flame, color: "text-amber-400" },
            ].map((item) => (
              <div key={item.step} className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">{item.step}</span>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Cloud & DevOps Tech Stack Coverage */}
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-bold text-white">Targeted High-Growth Niche Domains</h4>
            <p className="text-xs text-slate-400">Curated question banks and rubrics designed specifically for higher CTC tier roles.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["AWS", "Azure", "GCP", "Linux Kernel", "Kubernetes EKS", "Terraform IaC", "DevSecOps (Trivy)", "AIOps & MCP"].map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-slate-300 border border-white/10">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 font-mono">
        <p>CloudOps & DevOps AI Assessment OS • Built for High-Performance Engineering Careers</p>
      </footer>
    </div>
  );
}
