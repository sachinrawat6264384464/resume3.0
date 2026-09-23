"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Cloud, Mic, Sparkles, Trophy, ArrowRight, CheckCircle2, 
  FileText, Upload, Play, Search, Award, ArrowUpRight
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_IS_ADMIN_PORTAL === "true") {
      window.location.href = "/login?admin=true";
    }
  }, []);

  // Ultra-Smooth 5-Heading Typewriter Animation Effect
  useEffect(() => {
    const phrases = [
      "REAL PRACTICE",
      "VOICE AI MOCKS",
      "ATS RESUME AUDIT",
      "CLOUDOPS SKILLS",
      "40 LPA BOSS BATTLE"
    ];
    const currentPhrase = phrases[loopNum % phrases.length];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (typedText !== currentPhrase) {
        timer = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        }, 150);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2800);
      }
    } else {
      if (typedText !== "") {
        timer = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        }, 80);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
          setLoopNum((prev) => prev + 1);
        }, 500);
      }
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, loopNum]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FF6B00] selection:text-white overflow-x-hidden relative transition-colors duration-300 w-full">
      
      {/* Dynamic CSS for Theme Responsive Outlined Text */}
      <style jsx global>{`
        .hollow-stroke {
          -webkit-text-stroke: 2.5px #070b14;
          color: transparent;
        }
        .dark .hollow-stroke {
          -webkit-text-stroke: 2.5px rgba(255, 255, 255, 0.88);
          color: transparent;
        }
      `}</style>

      {/* FULL-WIDTH BACKGROUND VERTICAL GRID LINES */}
      <div className="fixed inset-0 pointer-events-none z-0 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 w-full px-6 sm:px-12 lg:px-20 opacity-20 dark:opacity-25">
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full hidden md:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full hidden md:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full hidden lg:block"></div>
        <div className="border-r border-slate-300 dark:border-slate-800/80 h-full"></div>
      </div>

      {/* 1. TOP NAVBAR (FULL-WIDTH Ultra-Sleek Glassmorphism Header with Working ThemeToggle) */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/90 dark:bg-[#070b14]/90 border-b border-slate-200/90 dark:border-slate-800/70 shadow-sm dark:shadow-2xl transition-all duration-300 w-full overflow-x-hidden">
        <div className="w-full px-2 sm:px-8 lg:px-20 h-14 sm:h-20 flex items-center justify-between gap-1 sm:gap-4 max-w-full">
          
          {/* Logo */}
          <Link prefetch={false} href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
            <div className="w-6.5 h-6.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-[#FF6B00] via-amber-500 to-orange-400 p-[1.5px] shadow-lg shadow-[#FF6B00]/30 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#070b14] rounded-[7px] sm:rounded-[14px] flex items-center justify-center text-white">
                <Cloud className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#FF6B00] fill-[#FF6B00]/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                  CLOUDOPS <span className="text-[#FF6B00]">AI</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black text-[#FF6B00] bg-[#FF6B00]/15 border border-[#FF6B00]/40 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <span className="hidden sm:block text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mt-1">
                CAREER PREPARATION & MOCK INTERVIEW OS
              </span>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <ThemeToggle />

            <Link prefetch={false} 
              href="/login" 
              className="text-[10px] sm:text-xs font-black text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-1.5 py-1 sm:px-5 sm:py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent sm:border-slate-800 transition-all uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>

            <Link prefetch={false} 
              href="/register" 
              className="text-[10px] sm:text-xs font-black text-white bg-[#FF6B00] hover:bg-[#e05e00] px-2.5 py-1.5 sm:px-6 sm:py-3 rounded-full shadow-lg shadow-[#FF6B00]/30 flex items-center gap-1 sm:gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider shrink-0 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="inline sm:hidden">Start</span>
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>

        </div>
      </header>

      {/* SECTION 1: HERO (FULL SCREEN HEIGHT + IMPACTFUL BIG TYPOGRAPHY) */}
      <section className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 sm:py-16 lg:py-20 overflow-hidden w-full">
        
        {/* HERO MAIN CONTAINER - STRETCHED FULL WIDTH */}
        <div className="w-full px-4 sm:px-8 lg:px-20 flex flex-col justify-center my-auto">
          
          {/* TOP ACCENT BADGE */}
          <div className="w-max max-w-full inline-flex items-center gap-2 text-[#FF6B00] text-xs sm:text-sm font-black tracking-wider uppercase mb-6 sm:mb-10 leading-tight bg-[#FF6B00]/10 border border-[#FF6B00]/30 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-[#FF6B00] shrink-0" />
            <span className="truncate">Multi-Cloud + DevOps + DevSecOps + AI Careers</span>
          </div>

          {/* DISPLAY TYPOGRAPHY WITH PRODUCT DOCUMENTATION HEADLINE - ENLARGED FONT SIZES */}
          <div className="flex flex-col tracking-tighter uppercase font-black select-none w-full">
            
            {/* LINE 1: EXACT DOCUMENTATION HEADLINE PART 1 */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 dark:text-white leading-[0.96] tracking-tight">
              NO SHORTCUT.
            </h1>

            {/* LINE 2: ORANGE ARROW ICON + HOLLOW OUTLINED STROKE TYPEWRITER TEXT */}
            <div className="flex items-center gap-3 sm:gap-4 my-2 sm:my-3 flex-wrap">
              <ArrowUpRight className="w-8 h-8 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#FF6B00] stroke-[3.5] shrink-0 hover:scale-110 transition-transform duration-300 drop-shadow-[0_4px_20px_rgba(255,107,0,0.35)]" />
              <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.96] hollow-stroke tracking-tight inline-flex items-center">
                {typedText || "REAL PRACTICE"}
                <span className="animate-pulse text-[#FF6B00] font-normal border-r-4 sm:border-r-8 border-[#FF6B00] h-[0.75em] inline-block ml-1" />
              </span>
            </div>

            {/* LINE 3: EXACT DOCUMENTATION HEADLINE PART 2 */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 dark:text-white leading-[0.96] tracking-tight">
              INTERVIEW PREP.
            </h1>

          </div>

          {/* SUBTEXT & GET STARTED ACTION BAR - FULL WIDTH GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-10 sm:mt-14 pt-8 border-t border-slate-200 dark:border-slate-800/80 w-full">
            
            {/* Left Narrative from Documentation */}
            <div className="md:col-span-8 flex flex-col gap-2">
              <p className="text-base sm:text-xl lg:text-2xl text-slate-900 dark:text-slate-100 font-extrabold leading-relaxed max-w-3xl">
                "Learn Today. Implement Today. Build Your Career for a Lifetime."
              </p>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 font-semibold max-w-3xl">
                Upload Resume → Match with JD → Fix Resume with STAR Formula → Practice Voice AI → Land High-Paying Multi-Cloud & DevOps Roles.
              </p>
            </div>

            {/* Right Quick Action Circular / Pill Glass Button */}
            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3">
              <Link 
                href="/register" 
                className="relative group px-8 py-4 rounded-full bg-white dark:bg-slate-900/90 border-2 border-slate-300 dark:border-slate-700 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-[#FF6B00]/25 flex items-center gap-3 backdrop-blur-xl"
              >
                <span>GET IN TOUCH & START FREE</span>
                <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: THE 2 PRIMARY JOURNEY CARDS (PUSHED DOWN BELOW THE FOLD) */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80 w-full bg-slate-50/50 dark:bg-slate-950/40">
        <div className="w-full px-4 sm:px-8 lg:px-20">
          
          <div className="flex flex-col gap-1 mb-8 text-center sm:text-left">
            <span className="text-[10px] font-mono font-black text-[#FF6B00] uppercase tracking-widest">SELECT YOUR PATH</span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Choose Your Primary Preparation Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 w-full text-left">
            
            {/* OPTION 1: REVIEW MY RESUME */}
            <div className="p-6 sm:p-8 rounded-[28px] bg-white dark:bg-slate-900/90 border-2 border-slate-200 dark:border-slate-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xl hover:shadow-[#FF6B00]/15 transition-all duration-300 flex flex-col justify-between gap-6 group relative overflow-hidden backdrop-blur-xl w-full">
              <div className="absolute top-0 right-0 p-4 text-slate-200 dark:text-slate-800/80 font-black text-5xl sm:text-7xl select-none group-hover:text-[#FF6B00]/20 transition-colors">
                01
              </div>

              <div className="flex flex-col gap-3.5 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-[#FF6B00] uppercase tracking-widest">PRIMARY JOURNEY 1</span>
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                    📄 Option 1 — Review My Resume
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Upload Resume / LinkedIn → Add Target Job Description → Instant ATS Score → Resume Skill Analysis → Rewrite bullets with <strong className="text-[#FF6B00]">STAR Formula</strong> (Accept | Edit | Reject).
                </p>

                <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>6-Factor ATS Breakdown (Skills, Experience, Keywords...)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Resume-JD Gap Matcher ("You Already Have" vs "Improve")</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>STAR Formula AI Bullet Point Rewriter</span>
                  </div>
                </div>
              </div>

              <Link prefetch={false}
                href="/resume-ats"
                className="w-full py-3 rounded-xl font-black text-xs text-white bg-[#FF6B00] hover:bg-orange-500 shadow-md shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all z-10 uppercase tracking-widest mt-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Audit Resume ATS Now →</span>
              </Link>
            </div>

            {/* OPTION 2: PREPARE FOR MY INTERVIEW */}
            <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] bg-white dark:bg-slate-900/80 border-2 border-slate-200 dark:border-slate-800 hover:border-purple-500 shadow-lg dark:shadow-xl hover:shadow-purple-500/15 transition-all duration-300 flex flex-col justify-between gap-4 group relative overflow-hidden backdrop-blur-xl w-full">
              <div className="absolute top-0 right-0 p-4 text-slate-200 dark:text-slate-800/80 font-black text-5xl sm:text-7xl select-none group-hover:text-purple-500/20 transition-colors">
                02
              </div>

              <div className="flex flex-col gap-3.5 z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">PRIMARY JOURNEY 2</span>
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                    🎤 Option 2 — Prepare for My Interview
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Select Career Path → Take Challenges → Practice Mock Interviews with <strong className="text-purple-600 dark:text-purple-400">Hints Level 1-3</strong> → Get AI Evaluated → Pass 20 Core Stages + 👑 <strong className="text-[#FF6B00]">40 LPA Final Boss Battle</strong>.
                </p>

                <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>🎯 Practice Mode (Hints Level 1-3) vs 🎥 Interview Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>5-Dimension AI Scoring (Technical, Communication, Confidence...)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Strict 80% Stage Gate & Multi-Leaderboard Rankings</span>
                  </div>
                </div>
              </div>

              <Link prefetch={false}
                href="/interviews"
                className="w-full py-3 rounded-xl font-black text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all z-10 uppercase tracking-widest mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Voice AI Interview Challenge →</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS WORKFLOW - FULL WIDTH */}
      <section className="relative z-10 py-20 bg-slate-100/80 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 transition-colors w-full">
        <div className="w-full px-6 sm:px-12 lg:px-20 flex flex-col gap-12">
          
          <div className="text-center max-w-4xl mx-auto">
            <span className="px-4 py-1.5 rounded-full text-xs font-black text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/30 inline-flex items-center gap-2 mb-4 tracking-widest uppercase">
              ⚡ STEP-BY-STEP JOURNEY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              How It Works: <span className="text-[#FF6B00]">From Resume to Offer Letter</span>
            </h2>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 font-medium mt-3">
              A structured, continuous practice loop designed to make you 100% interview ready.
            </p>
          </div>

          {/* 6 Steps Workflow Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
            {[
              { num: "01", title: "Upload Resume / LinkedIn", desc: "Upload PDF/DOCX or link your LinkedIn profile. AI extracts skills, experience, projects, and certifications automatically.", icon: FileText, color: "text-[#FF6B00]" },
              { num: "02", title: "Analyze & JD Match", desc: "Compare your resume against any target Job Description. Get instant 6-Factor ATS score and missing skill gap analysis.", icon: Search, color: "text-blue-500 dark:text-blue-400" },
              { num: "03", title: "Personalized Practice", desc: "Unlock customized interview challenges tailored to your target role. Practice with Hints Level 1-3 or Teleprompter Mode.", icon: Mic, color: "text-purple-500 dark:text-purple-400" },
              { num: "04", title: "AI + Human Feedback", desc: "Receive real-time 5-dimension AI evaluation (Technical, Communication, Confidence, Structure, Practical) + optional mentor review.", icon: Award, color: "text-emerald-500 dark:text-emerald-400" },
              { num: "05", title: "Repeat & Level Up", desc: "Earn XP, unlock badges, rise on weekly/improvement leaderboards, and re-attempt challenges to reach 80%+ readiness.", icon: Trophy, color: "text-amber-500 dark:text-amber-400" },
              { num: "06", title: "Crack the Real Interview", desc: "Unlock 40 LPA Final Boss Battles and enter real interviews with confidence, clear answers, and top salary readiness.", icon: CheckCircle2, color: "text-teal-500 dark:text-teal-400" }
            ].map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div key={idx} className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col gap-4 relative hover:border-[#FF6B00] transition-all duration-300 group w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-[#FF6B00] group-hover:text-white dark:group-hover:text-slate-950 transition-colors tracking-widest">
                      STEP {step.num}
                    </span>
                    <IconComp className={`w-7 h-7 ${step.color}`} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FOOTER - FULL WIDTH */}
      <footer className="relative z-10 py-10 bg-slate-950 dark:bg-[#070b14] text-white border-t border-slate-800/80 w-full">
        <div className="w-full px-6 sm:px-12 lg:px-20 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-[#FF6B00]" />
            <span>© 2026 CloudOps AI Assessment OS. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <Link prefetch={false} href="/login" className="hover:text-[#FF6B00] transition-colors uppercase tracking-wider">Candidate Sign In</Link>
            <Link prefetch={false} href="/register" className="hover:text-[#FF6B00] transition-colors uppercase tracking-wider">Register Account</Link>
            <Link prefetch={false} href="/leaderboard" className="hover:text-[#FF6B00] transition-colors uppercase tracking-wider">Leaderboards</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
