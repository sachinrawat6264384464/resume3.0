"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>LEGAL & COMPLIANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Last Updated: September 3, 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Policy Content Sections */}
        <div className="py-10 flex flex-col gap-10 text-slate-300 text-sm font-normal leading-relaxed">
          
          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">01.</span> Overview & Scope
            </h2>
            <p>
              At CloudOps AI Assessment OS (&quot;CloudOps AI&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we are committed to safeguarding the privacy and security of cloud engineering candidates, hiring administrators, and technical evaluators using our AI-powered voice interview, ATS resume scoring, and incident simulation platform.
            </p>
            <p>
              This Privacy Policy explains how information is collected, processed, encrypted, and retained when you access our web application, submit audio recordings, upload resume documents, or complete technical assessments.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">02.</span> Information We Collect
            </h2>
            <p className="max-w-5xl">We collect the following categories of information necessary to deliver technical assessments:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
              <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-2.5 shadow-lg">
                <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider">Candidate Account Data</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">Name, email address, password hash, role preference, years of experience, and primary cloud skill domain (AWS, Kubernetes, Terraform).</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-2.5 shadow-lg">
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Voice AI Audio & Transcripts</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">Microphone audio stream during Voice AI Chamber sessions, speech-to-text transcriptions, and speech cadence metrics (WPM).</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-2.5 shadow-lg">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider">ATS Resume Documents</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">Uploaded PDF/DOCX resumes, extracted raw text, parsed skill keywords, and AI-generated STAR bullet point scoring.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-2.5 shadow-lg">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Assessment Metrics & Code</span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">Stage progression scores (80% gate threshold), terminal commands executed in incident sandboxes, and rubric evaluations.</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">03.</span> How We Use AI & LLM Processing
            </h2>
            <p>
              Candidate voice recordings and text inputs are processed strictly for real-time scoring and feedback. We do NOT sell candidate data or use candidate audio or resume data to train public foundation models.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 text-xs text-slate-300">
              <li>Whisper STT processes microphone audio to generate accurate technical transcripts.</li>
              <li>LLM scoring engines evaluate answers against standardized rubrics across 5 weighted pillars.</li>
              <li>Scoring algorithms determine if candidate performance meets or exceeds the strict 80% stage gate requirement.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">04.</span> Data Security & Encryption
            </h2>
            <p>
              All candidate data is protected using enterprise-grade security controls:
            </p>
            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3.5 text-xs shadow-lg">
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>256-Bit SSL / TLS 1.3 Encryption for all network data in transit.</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>AES-256 Encryption at rest for audio files and resume storage buckets.</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Strict Role-Based Access Control (RBAC) ensuring candidate scores are accessible only by authorized team administrators.</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">05.</span> Data Rights & Contact
            </h2>
            <p>
              You have the right to request access to your evaluation records, export your assessment report, or request complete deletion of your profile data.
            </p>
            <p className="text-xs text-slate-400">
              For any privacy inquiries or data deletion requests, contact our Data Protection Team at <span className="text-[#FF6B00] font-bold">privacy@cloudops-ai.com</span> or create a support ticket in our candidate help desk.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-[#FF6B00] transition-colors flex items-center gap-1">
            <span>Next: Terms of Service</span>
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
