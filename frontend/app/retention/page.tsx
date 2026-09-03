"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Clock, FileText, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";

export default function RetentionPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050C17] text-white font-sans selection:bg-[#FF6B00] selection:text-white">
      
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-[#0B1E36]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link prefetch={false} 
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
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black text-blue-400 bg-blue-950/60 border border-blue-800/80 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>DATA LIFECYCLE MANAGEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
            90-Day Data Retention Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Automated Audio Purging & Document Lifecycle Rules
          </p>
        </div>

        {/* Retention Content Sections */}
        <div className="py-10 flex flex-col gap-10 text-slate-300 text-sm font-normal leading-relaxed">
          
          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">01.</span> Retention Policy Overview
            </h2>
            <p>
              To protect candidate privacy and comply with global data protection regulations (GDPR, CCPA), CloudOps AI Assessment OS enforces an automated 90-day data retention lifecycle for sensitive candidate evaluation assets.
            </p>
          </section>

          {/* Retention Lifecycle Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3.5 shadow-lg">
              <div className="px-3.5 py-1.5 rounded-xl bg-orange-500/15 text-[#FF6B00] border border-orange-500/30 font-mono font-black text-xs w-fit">
                Day 0
              </div>
              <h3 className="text-sm font-black text-white uppercase">Assessment Session</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Candidate completes Voice AI interview and submits ATS resume. Transcripts & rubric scores are generated instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3.5 shadow-lg">
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono font-black text-xs w-fit">
                Day 1–89
              </div>
              <h3 className="text-sm font-black text-white uppercase">Active Evaluation Window</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Hiring team reviews candidate stage gates, technical scores, and voice transcripts inside the admin dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3.5 shadow-lg">
              <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-black text-xs w-fit">
                Day 90+
              </div>
              <h3 className="text-sm font-black text-white uppercase">Automated Audio Purge</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Raw microphone audio recordings and uploaded resume files are permanently deleted from cloud storage.
              </p>
            </div>

          </div>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">03.</span> Retained Anonymized Metrics
            </h2>
            <p>
              After the 90-day retention window expires, raw audio files and uploaded resume documents are destroyed. Anonymized statistical metrics (such as aggregate WPM cadence, technical score percentages, and stage completion rates) are retained for platform benchmarking.
            </p>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">04.</span> Early Deletion & Data Export
            </h2>
            <p className="text-xs text-slate-300">
              Candidates may request early deletion of their audio recordings or account data at any time prior to the 90-day threshold by submitting a ticket in our candidate help desk or emailing <span className="text-[#FF6B00] font-bold">privacy@cloudops-ai.com</span>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link prefetch={false} href="/privacy" className="text-xs font-bold text-slate-400 hover:text-[#FF6B00] transition-colors flex items-center gap-1">
            <span>Review Privacy Policy</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link prefetch={false} href="/#faq" className="text-xs font-bold text-[#FF6B00] hover:underline">
            Return to Footer
          </Link>
        </div>

      </main>
    </div>
  );
}
