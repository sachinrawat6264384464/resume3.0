"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Cpu, Server, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function SecurityCompliancePage() {
  return (
    <div className="min-h-screen bg-[#050C17] text-white font-sans selection:bg-[#FF6B00] selection:text-white">
      
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0B1E36]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link 
            href="/#faq" 
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-300 hover:text-[#FF6B00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF6B00]" />
            <span>Back to Footer</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center justify-center shadow-xs">
              <Shield className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm sm:text-base font-black text-white">CloudOps <span className="text-[#FF6B00]">AI</span> OS</span>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
        
        {/* Page Title */}
        <div className="flex flex-col gap-3 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 w-fit">
            <Activity className="w-3.5 h-3.5" />
            <span>SOC2 TYPE II CERTIFIED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Security Compliance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Enterprise Cloud Security Infrastructure & Defense Systems
          </p>
        </div>

        {/* Security Content Sections */}
        <div className="py-10 flex flex-col gap-10 text-slate-300 text-sm font-normal leading-relaxed">
          
          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">01.</span> Security Architecture Overview
            </h2>
            <p>
              CloudOps AI Assessment OS is architected for enterprise-tier security, data privacy, and continuous availability. Built on AWS multi-region infrastructure with isolated VPC networks, our platform ensures candidate data and assessment code runs in secure, ephemeral environments.
            </p>
          </section>

          {/* 4 Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase">SOC2 Type II Certified</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Independently audited controls covering security, confidentiality, and operational availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase">256-Bit SSL Encryption</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                TLS 1.3 encryption for all voice streaming endpoints and AES-256 encryption at rest for database records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase">Sandbox Container Isolation</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Incident simulation code runs in isolated containerized environments with strict resource caps.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase">Continuous Vulnerability Scanning</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Automated SAST/DAST pipeline dependency scanning and continuous threat monitoring.
              </p>
            </div>

          </div>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">02.</span> Role-Based Access Control (RBAC)
            </h2>
            <p>
              Candidate assessment data is strictly compartmentalized. Hiring managers and company administrators can only view candidates assigned to their organization with audited access logs.
            </p>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">03.</span> Reporting Vulnerabilities
            </h2>
            <p className="text-xs text-slate-300">
              We operate a responsible disclosure policy. If you discover a potential vulnerability, please report it immediately to our security response team at <span className="text-[#FF6B00] font-bold">security@cloudops-ai.com</span>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link href="/retention" className="text-xs font-bold text-slate-400 hover:text-[#FF6B00] transition-colors flex items-center gap-1">
            <span>Next: 90-Day Data Retention Policy</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/#faq" className="text-xs font-bold text-[#FF6B00] hover:underline">
            Return to Footer
          </Link>
        </div>

      </main>
    </div>
  );
}
