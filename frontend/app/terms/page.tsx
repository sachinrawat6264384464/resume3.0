"use client";

import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle2, ChevronRight } from "lucide-react";

export default function TermsOfServicePage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>TERMS & AGREEMENT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Last Updated: September 3, 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Terms Content Sections */}
        <div className="py-10 flex flex-col gap-10 text-slate-300 text-sm font-normal leading-relaxed">
          
          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">01.</span> License & Platform Access
            </h2>
            <p>
              By creating an account or completing assessments on CloudOps AI Assessment OS, you agree to comply with these Terms of Service. We grant candidates a non-exclusive, revocable license to complete technical evaluations, voice interview practice modules, and ATS resume audits.
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">02.</span> Candidate Code of Conduct & Honor Code
            </h2>
            <p className="max-w-5xl">
              Candidates participating in AI voice interviews or technical incident simulations must adhere to our strict technical integrity standards:
            </p>
            <div className="p-6 rounded-2xl bg-[#0B1E36] border border-slate-800 flex flex-col gap-3.5 text-xs shadow-lg max-w-5xl">
              <div className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>You must complete voice interviews independently without third-party proxy assistance or real-time voice synthesis manipulation.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>Submitted resumes must accurately reflect your actual technical skills, certifications, and work history.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>Reverse engineering, scraping, or attempting to compromise assessment sandbox containers is strictly prohibited.</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">03.</span> 80% Stage Gate Progression Policy
            </h2>
            <p>
              Candidates understand that stage gate progression (Stage 1 through Stage 5) is strictly automated based on meeting the 80% aggregate score threshold. Hiring administrators reserve the right to manually review, override, or re-evaluate candidate stage locks based on enterprise hiring criteria.
            </p>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">04.</span> Intellectual Property
            </h2>
            <p>
              All proprietary AI scoring rubrics, AWS incident scenario topologies, Voice AI Chamber algorithms, and platform designs remain the exclusive intellectual property of CloudOps AI Assessment OS.
            </p>
          </section>

          <section className="flex flex-col gap-3 max-w-5xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="text-[#FF6B00]">05.</span> Limitation of Liability
            </h2>
            <p>
              CloudOps AI provides technical skill assessment tools &quot;as is&quot;. While our AI engines provide high accuracy scoring based on industry standards, assessment scores serve as evaluative guidance for candidates and hiring managers and do not guarantee specific employment offers.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
          <Link href="/security" className="text-xs font-bold text-slate-400 hover:text-[#FF6B00] transition-colors flex items-center gap-1">
            <span>Next: Security Compliance</span>
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
