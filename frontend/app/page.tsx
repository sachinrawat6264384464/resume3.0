"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cloud, Mic, Shield, Sparkles, Trophy, ArrowRight, CheckCircle2, 
  Terminal, Server, Cpu, Layers, FileCheck, Map, Star, Users, 
  ChevronRight, Play, Zap, Flame, Award, BarChart3, HelpCircle,
  ExternalLink, Code2, AlertTriangle, ArrowUpRight, Check
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#FF9900] selection:text-white overflow-x-hidden">
      
      {/* Soft AWS Light Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF9900]/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 w-[650px] h-[650px] bg-amber-500/10 rounded-full blur-[180px]" />
      </div>

      {/* Top Banner Announcement - AWS Orange Theme */}
      <div className="relative z-50 bg-gradient-to-r from-[#232F3E] via-[#1c2532] to-[#232F3E] text-white text-[11px] font-bold py-2.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-md border-b border-[#FF9900]/30">
        <span className="px-2 py-0.5 rounded-full bg-[#FF9900] text-slate-950 text-[10px] uppercase font-black tracking-widest">
          AWS 3.0 ARCHITECTURE
        </span>
        <span>Voice AI Incident Simulator & 6-Factor ATS Bullet Audit are Live!</span>
        <Link href="/register" className="text-[#FF9900] hover:underline font-extrabold flex items-center gap-1">
          Try Free Demo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo with AWS Orange Theme */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9900] via-amber-500 to-orange-400 p-[1.5px] shadow-lg shadow-[#FF9900]/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#232F3E] rounded-[14px] flex items-center justify-center text-white">
                <Cloud className="w-5 h-5 text-[#FF9900] fill-[#FF9900]/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-[#232F3E] flex items-center gap-1">
                CloudOps <span className="text-[#FF9900]">AI</span>
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">AWS Assessment OS</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-700">
            <a href="#features" className="hover:text-[#FF9900] transition-colors">Platform Features</a>
            <a href="#stages" className="hover:text-[#FF9900] transition-colors">5-Stage System</a>
            <a href="#ats" className="hover:text-[#FF9900] transition-colors">ATS Analyzer</a>
            <a href="#leaderboard" className="hover:text-[#FF9900] transition-colors">Leaderboard</a>
            <a href="#faqs" className="hover:text-[#FF9900] transition-colors">FAQs</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/20 text-[#232F3E] text-[11px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse" />
              <span>1,420 Live AWS AI Interviews Today</span>
            </div>

            <Link 
              href="/login" 
              className="text-xs font-extrabold text-slate-700 hover:text-[#232F3E] px-3.5 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>

            <Link 
              href="/register" 
              className="text-xs font-black text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 px-5 py-2.5 rounded-xl shadow-lg shadow-[#FF9900]/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Start Free AI Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* HERO SECTION WITH AWS LIGHT 3D VISUAL */}
      <section className="relative z-10 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headline & Call-To-Action */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#232F3E] text-xs font-black w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
                <span>VOICE AI • AWS CLOUD INCIDENTS • 5-PILLAR EVALUATION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.08] text-[#232F3E]">
                The AI–Powered OS for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9900] via-amber-600 to-orange-600">Cloud Engineers</span> to Land ₹18–40 LPA Roles.
              </h1>

              <p className="text-base text-slate-600 leading-relaxed font-medium max-w-xl">
                Simulate live AI voice interviews, troubleshoot real-world production AWS outages, audit your resume with 6-factor ATS intelligence, and master AWS, Kubernetes, Terraform & Linux.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="py-4 px-8 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF9900]/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Free AI Voice Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#ats"
                  className="py-4 px-7 rounded-2xl font-extrabold text-sm text-[#232F3E] bg-white border border-slate-300 hover:border-[#FF9900] hover:bg-slate-50 flex items-center justify-center gap-2.5 shadow-sm transition-all"
                >
                  <FileCheck className="w-4 h-4 text-[#FF9900]" />
                  <span>Analyze Resume (ATS)</span>
                </a>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
                {[
                  { icon: Mic, title: "Voice AI Interview", desc: "Real-time audio evaluation" },
                  { icon: Trophy, title: "5-Stage System", desc: "80%+ score to unlock" },
                  { icon: FileCheck, title: "ATS Scorecard", desc: "6-factor STAR bullet audit" },
                  { icon: Map, title: "30-Day Roadmap", desc: "AI skill gap resolution" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#232F3E]">
                      <item.icon className="w-3.5 h-3.5 text-[#FF9900]" />
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{item.desc}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: AWS 3D Visual Only (Full Size 6-Column Width) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              
              {/* Main Full-Size Hero Visual Card */}
              <div className="w-full relative group">
                
                {/* 3D Main Hero Image with HD Quality & Curved Edges */}
                <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-200/80 bg-white">
                  <img
                    src="/images/hero_cloudops_main.png"
                    alt="AWS CloudOps AI 3D Voice Interview Visualizer"
                    className="w-full h-auto max-h-[460px] object-contain object-center transform group-hover:scale-[1.01] transition-transform duration-500"
                  />
                  
                  {/* Floating Badges Overlay */}
                  <div className="absolute top-4 left-4 px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md flex items-center gap-2 text-white shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900] animate-ping" />
                    <span className="text-[11px] font-black tracking-wide">STAGE 3: AWS EKS INCIDENT</span>
                  </div>

                  <div className="absolute top-4 right-4 px-3.5 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5 text-emerald-400 shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-black">94% MATCH SCORE</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ENTERPRISE CLOUD ECOSYSTEM MARQUEE */}
      <section className="py-8 bg-white border-y border-slate-200 relative overflow-hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 text-center mb-4">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            EVALUATING TECH STACKS DEMANDED BY TOP CLOUD ENGINEERING TEAMS
          </span>
        </div>

        <div className="flex overflow-hidden space-x-12 select-none">
          <div className="flex space-x-12 animate-marquee whitespace-nowrap items-center shrink-0">
            {[
              { name: "Amazon Web Services", code: "AWS EKS / IAM / VPC", color: "#FF9900" },
              { name: "Google Cloud Platform", code: "GCP GKE / BigQuery", color: "#4285F4" },
              { name: "Microsoft Azure", code: "Azure AKS / DevOps", color: "#0089D6" },
              { name: "Docker Containers", code: "Docker Engine / Compose", color: "#0db7ed" },
              { name: "Kubernetes", code: "K8s Architecture & Ingress", color: "#326ce5" },
              { name: "HashiCorp Terraform", code: "IaC & HCL Modules", color: "#844FBA" },
              { name: "Prometheus & Grafana", code: "Metrics & Incident Alerting", color: "#E6522C" },
              { name: "Linux System Admin", code: "Systemd / Kernel / Shell", color: "#F59E0B" },
            ].map((tech, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 shadow-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tech.color }} />
                <span className="text-xs font-black text-[#232F3E]">{tech.name}</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">{tech.code}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-PILLAR EVALUATION MATRIX SECTION */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">
              Comprehensive Assessment Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#232F3E] tracking-tight mt-2">
              The 5-Pillar CloudOps Skill Evaluation
            </h2>
            <p className="text-sm text-slate-600 mt-3 font-medium leading-relaxed">
              Generic coding platforms don't test production readiness. Our AI evaluates you across the 5 core pillars hiring managers actually grade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                pillar: "Pillar 01",
                title: "Cloud Architecture",
                desc: "AWS VPC, IAM security policies, multi-region failover, & cloud cost optimization.",
                tech: ["AWS", "Azure", "GCP"],
                score: "94%"
              },
              {
                pillar: "Pillar 02",
                title: "Containers & K8s",
                desc: "Pod scheduling, Helm charts, ingress controllers & CrashLoop troubleshooting.",
                tech: ["Docker", "Kubernetes", "Helm"],
                score: "88%"
              },
              {
                pillar: "Pillar 03",
                title: "Infrastructure as Code",
                desc: "Terraform HCL state management, modular architecture & Ansible playbooks.",
                tech: ["Terraform", "Ansible"],
                score: "92%"
              },
              {
                pillar: "Pillar 04",
                title: "CI/CD Automation",
                desc: "GitHub Actions, Jenkins pipelines, zero-downtime blue/green deployments.",
                tech: ["GitHub", "Jenkins", "ArgoCD"],
                score: "90%"
              },
              {
                pillar: "Pillar 05",
                title: "SRE & Incident Ops",
                desc: "Linux memory heap debugging, Prometheus metrics & emergency incident triage.",
                tech: ["Linux", "Grafana", "Prometheus"],
                score: "86%"
              },
            ].map((p, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#FF9900] shadow-sm hover:shadow-xl hover:shadow-[#FF9900]/10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-[#FF9900] uppercase tracking-widest">{p.pillar}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Avg {p.score}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#232F3E] group-hover:text-[#FF9900] transition-colors">{p.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{p.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                  {p.tech.map((t, i) => (
                    <span key={i} className="text-[10px] font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5-STAGE GATEKEEPER ASSESSMENT ROADMAP */}
      <section id="stages" className="py-20 bg-white border-y border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: AWS Light 3D Visual */}
            <div className="lg:col-span-5">
              <div className="rounded-[32px] bg-slate-50 p-3 border border-slate-200 shadow-xl overflow-hidden relative group">
                <img 
                  src="/images/roadmap_aws_light_3d.png" 
                  alt="5-Stage AWS Career Roadmap 3D Visual" 
                  className="w-full h-[380px] object-cover rounded-[24px] transform group-hover:scale-105 transition-transform duration-700" 
                />
                
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md mt-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#232F3E] mb-1">
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      5-Stage Unlocking Rules
                    </span>
                    <span className="text-[#FF9900] font-mono">80%+ PASS SCORE</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Each stage requires an 80%+ score on voice technical accuracy, incident resolution & architecture design to unlock the next level.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: 5 Stages List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              <div>
                <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">GATEKEEPER PIPELINE</span>
                <h2 className="text-3xl font-black text-[#232F3E] tracking-tight mt-1">The 5-Stage Assessment Workflow</h2>
              </div>

              {[
                { stage: "Stage 1", name: "Core Fundamentals & Linux Shell", pass: "Basic Gate", xp: "+150 XP" },
                { stage: "Stage 2", name: "Containerization & K8s Deployments", pass: "Intermediate Gate", xp: "+250 XP" },
                { stage: "Stage 3", name: "Multi-Cloud Infrastructure & Security", pass: "Advanced Gate", xp: "+400 XP" },
                { stage: "Stage 4", name: "Production Incident & Outage Triage", pass: "Senior SRE Gate", xp: "+600 XP" },
                { stage: "Stage 5", name: "Executive Architecture Review", pass: "Architect Level", xp: "+1,000 XP" },
              ].map((s, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#FF9900] hover:bg-white flex items-center justify-between gap-4 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#232F3E] font-black text-xs flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono font-bold text-[#FF9900] uppercase">{s.stage} • {s.pass}</span>
                      <span className="text-sm font-black text-[#232F3E] truncate">{s.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {s.xp}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>

      {/* ATS RESUME ANALYZER & STAR BULLET REWRITER SECTION */}
      <section id="ats" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Text & Features */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              <div>
                <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">6-FACTOR RESUME AUDIT</span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#232F3E] tracking-tight mt-1">
                  Transform Your Resume to Pass Top Tech ATS Filters
                </h2>
                <p className="text-sm text-slate-600 mt-3 font-medium leading-relaxed">
                  92% of CloudOps resumes are rejected by ATS bots due to generic bullet points. Our AI audits your resume against 6 key factors and rewrites bullet points into high-impact STAR metrics.
                </p>
              </div>

              {/* 6 Audit Factors */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Cloud Keyword Coverage",
                  "STAR Metric Quantification",
                  "Action Verb Impact",
                  "Formatting & Readability",
                  "Role Level Target Match",
                  "Recruiter Skim Score"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="w-fit py-3.5 px-6 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center gap-2 transition-all mt-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Run Free ATS Resume Audit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

            {/* Right: Real Resume Photo + STAR Rewrite Card */}
            <div className="lg:col-span-6">
              <div className="p-3 rounded-[32px] bg-white border border-slate-200 shadow-2xl flex flex-col gap-3">
                
                {/* Real Resume Photo — Professional Desk Setup */}
                <div className="relative rounded-[22px] overflow-hidden shadow-lg group">
                  <img 
                    src="/images/ats_resume_photo.png" 
                    alt="Professional Resume & ATS Analysis Visual" 
                    className="w-full h-[240px] object-cover object-center transform group-hover:scale-[1.03] transition-transform duration-500" 
                  />
                  {/* Overlay badge */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md flex items-center gap-2 text-white shadow-lg">
                    <FileCheck className="w-3.5 h-3.5 text-[#FF9900]" />
                    <span className="text-[11px] font-black tracking-wide">ATS RESUME SCANNING ACTIVE</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md text-emerald-400 shadow-lg">
                    <span className="text-[11px] font-black">96/100 ATS SCORE</span>
                  </div>
                </div>

                {/* STAR Bullet Transformation Comparison */}
                <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  
                  {/* Before */}
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-red-700 mb-1">
                      <span>BEFORE: GENERIC BULLET (ATS SCORE: 42/100)</span>
                      <span className="font-mono">WEAK IMPACT</span>
                    </div>
                    <p className="text-xs text-slate-800 font-mono">
                      "Managed Kubernetes clusters and deployed microservices for team."
                    </p>
                  </div>

                  {/* After */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 mb-1">
                      <span>AFTER: STAR AI REWRITE (ATS SCORE: 96/100)</span>
                      <span className="font-mono font-bold text-emerald-800">STAR VERIFIED</span>
                    </div>
                    <p className="text-xs text-emerald-950 font-mono leading-relaxed font-semibold">
                      "Architected multi-region AWS EKS clusters using Terraform & Helm, reducing deployment latency by 68% and maintaining 99.99% uptime SLA across 40+ microservices."
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ENGINEER TESTIMONIALS */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">COMMUNITY SUCCESS</span>
            <h2 className="text-3xl font-black text-[#232F3E] tracking-tight mt-1">Engineers Who Aced Their Interviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Vikram Malhotra",
                role: "Senior DevOps Engineer",
                company: "Hired at AWS • ₹34 LPA",
                quote: "The Stage 4 CrashLoopBackOff incident simulation was identical to my actual AWS bar raiser interview. Absolutely game-changing platform!"
              },
              {
                name: "Ananya Deshmukh",
                role: "Cloud Architect",
                company: "Hired at Razorpay • ₹28 LPA",
                quote: "The ATS Resume Analyzer fixed 8 critical missing keywords on my resume. I got 5 callback calls within a single week!"
              },
              {
                name: "Rohan Kapoor",
                role: "Site Reliability Engineer",
                company: "Hired at Google Cloud • ₹40 LPA",
                quote: "The Voice AI evaluation gave me real-time feedback on my answer structure and WPM pacing. Helped me stay calm and structured."
              },
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {mounted && [...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed italic">"{t.quote}"</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#232F3E]">{t.name}</span>
                    <span className="text-xs text-slate-500 font-semibold">{t.role}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {t.company}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faqs" className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12">
            <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">GOT QUESTIONS?</span>
            <h2 className="text-3xl font-black text-[#232F3E] tracking-tight mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                q: "How does the Voice AI Interview Simulator work?",
                a: "Our AI interviewer asks real-time scenario questions using natural speech. It listens to your spoken answer, converts speech to text, evaluates technical accuracy across 5 pillars, and provides instant scoring."
              },
              {
                q: "Is CloudOps AI suitable for beginners?",
                a: "Yes! Stage 1 starts with Core Linux & Shell Scripting fundamentals. The platform builds your skills step-by-step up to Stage 5 senior architecture reviews."
              },
              {
                q: "How does the SMS & WhatsApp OTP login work?",
                a: "You can register with your phone number and receive instant verification OTP codes directly via SMS or WhatsApp for fast, secure onboarding."
              },
              {
                q: "What is the 80%+ passing score rule?",
                a: "To ensure production readiness, each stage requires an 80%+ score on accuracy and incident troubleshooting before unlocking the next stage."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="p-5 rounded-2xl bg-white border border-slate-200 cursor-pointer hover:border-[#FF9900] shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-black text-[#232F3E]">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${activeFaq === idx ? "rotate-90 text-[#FF9900]" : ""}`} />
                </div>
                {activeFaq === idx && (
                  <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ENTERPRISE FOOTER - BOTMARTZ AI SOLUTIONS PVT LTD */}
      <footer className="relative z-10 pt-16 pb-12 bg-[#1A232E] text-white border-t border-slate-800 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top High-Converting Call To Action Card */}
          <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-r from-[#111823] via-[#1A232E] to-[#232F3E] border border-[#FF9900]/30 flex flex-col md:flex-row items-center justify-between gap-8 mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF9900]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-2 max-w-xl relative z-10">
              <span className="text-xs font-black text-[#FF9900] uppercase tracking-widest">READY TO ACE YOUR CLOUDOPS INTERVIEW?</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Start Your Free AI Voice Interview Today</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                No credit card required. Instant access to Stage 1 assessment & 6-factor ATS resume audit.
              </p>
            </div>

            <Link
              href="/register"
              className="py-4 px-8 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-xl shadow-[#FF9900]/30 flex items-center gap-2 shrink-0 hover:scale-[1.02] transition-all relative z-10"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4-Column Enterprise Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
            
            {/* Col 1: Brand & Company Info */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF9900] via-amber-500 to-orange-400 p-[1px] shadow-md">
                  <div className="w-full h-full bg-[#111823] rounded-[11px] flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-[#FF9900]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-white">
                    CloudOps <span className="text-[#FF9900]">AI</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                    Botmartz AI Solutions Pvt Ltd
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
                The Next-Gen AI Assessment & Career OS for Cloud, DevOps & SRE Engineers. Built & Operated by <strong>Botmartz AI Solutions Pvt Ltd</strong>.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Botmartz Verified Company
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold">
                  SOC2 Type II Certified
                </span>
              </div>
            </div>

            {/* Col 2: AI Platform Features */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-[#FF9900] uppercase tracking-wider">AI Platform</span>
              <ul className="flex flex-col gap-2 text-xs font-medium text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Voice AI Interview Simulator</a></li>
                <li><a href="#stages" className="hover:text-white transition-colors">5-Stage Gatekeeper System</a></li>
                <li><a href="#ats" className="hover:text-white transition-colors">6-Factor ATS Resume Audit</a></li>
                <li><a href="#stages" className="hover:text-white transition-colors">AWS Production Outage Lab</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">30-Day AI Career Roadmap</a></li>
              </ul>
            </div>

            {/* Col 3: Evaluated Tech Stacks */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-[#FF9900] uppercase tracking-wider">Cloud Tech Stacks</span>
              <ul className="flex flex-col gap-2 text-xs font-medium text-slate-400">
                <li><span className="text-slate-300">Amazon Web Services (AWS EKS/VPC)</span></li>
                <li><span className="text-slate-300">Kubernetes & Helm Charts</span></li>
                <li><span className="text-slate-300">HashiCorp Terraform HCL</span></li>
                <li><span className="text-slate-300">Docker Microservices</span></li>
                <li><span className="text-slate-300">Linux Kernel & Shell Debugging</span></li>
              </ul>
            </div>

            {/* Col 4: Corporate & Legal */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black text-[#FF9900] uppercase tracking-wider">Corporate & Legal</span>
              <ul className="flex flex-col gap-2 text-xs font-medium text-slate-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security & SOC2 Portal</Link></li>
                <li><span className="text-slate-300">Botmartz Enterprise SLA</span></li>
                <li><span className="text-slate-300">Contact Support</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 pt-8">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#FF9900]" />
              <span>© 2026 <strong>Botmartz AI Solutions Pvt Ltd</strong>. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
              <span>CloudOps AI v3.0</span>
              <span>•</span>
              <span>Botmartz Enterprise Cloud</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
