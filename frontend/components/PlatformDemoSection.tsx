"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, 
  LayoutDashboard, Mic, FileText, Calendar, Bell, 
  TrendingUp, Trophy, CheckCircle2, ArrowRight, Video, 
  ShieldCheck, Eye, Layers, Star, Zap
} from "lucide-react";

interface CandidateServiceDemo {
  id: string;
  name: string;
  icon: any;
  badge: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  mockRoute: string;
  videoPlaceholderBg: string;
  accentColor: string;
  stats: { label: string; value: string }[];
}

const CANDIDATE_SERVICES: CandidateServiceDemo[] = [
  {
    id: "dashboard",
    name: "Candidate Dashboard",
    icon: LayoutDashboard,
    badge: "Central OS",
    tagline: "Your Mission Control for Cloud & DevOps Readiness",
    description: "Iss service me candidate ka complete profile overview, live readiness score, daily streak, and 30 interview stages ka progress track hota hai. Ek single screen se aap sabhi activities monitor kar sakte hain.",
    keyFeatures: [
      "Real-time readiness score (0–100%)",
      "Sequential stage progress tracking",
      "Daily activity & streak counter",
      "Quick access to active interviews"
    ],
    mockRoute: "/dashboard",
    videoPlaceholderBg: "from-[#0F172A] via-[#1E293B] to-[#0F172A]",
    accentColor: "text-[#FF6B00]",
    stats: [
      { label: "Stages Covered", value: "30 Stages" },
      { label: "Target Band", value: "₹18 – ₹40 LPA" },
      { label: "Metrics Sync", value: "Instant DB" }
    ]
  },
  {
    id: "interviews",
    name: "Interview Stages (30 Stages)",
    icon: Mic,
    badge: "Voice AI",
    tagline: "Practice Real Spoken AI Mock Interviews",
    description: "Candidate 30 structured interview stages me part le sakte hain. AI voice interviewer real-time me questions puchta hai, spoken answers evaluating karta hai, aur STAR methodology ke sath detailed feedback deta hai.",
    keyFeatures: [
      "Voice AI interactive interview room",
      "3-Level hints & practice mode",
      "5-Dimension AI evaluation rubric",
      "👑 40 LPA Staff Engineer Boss Battle"
    ],
    mockRoute: "/interviews",
    videoPlaceholderBg: "from-purple-950 via-slate-900 to-indigo-950",
    accentColor: "text-purple-400",
    stats: [
      { label: "Stages", value: "30 Levels" },
      { label: "Feedback", value: "STAR Formula" },
      { label: "Boss Battle", value: "Stage 30" }
    ]
  },
  {
    id: "resume-ats",
    name: "Resume ATS Audit",
    icon: FileText,
    badge: "ATS Scanner",
    tagline: "Match Resume with Target JDs & Fix Gaps",
    description: "Iss service me candidate apna Resume upload karke target Job Description ke sath match kar sakte hain. Instant 6-factor ATS score milta hai aur STAR formula AI bullet point rewriter se resume strengthen hota hai.",
    keyFeatures: [
      "Instant 6-Factor ATS match score",
      "Missing skills & JD gap analysis",
      "STAR formula AI bullet rewriter",
      "Accept / Edit / Reject recommendations"
    ],
    mockRoute: "/resume-ats",
    videoPlaceholderBg: "from-blue-950 via-slate-900 to-slate-950",
    accentColor: "text-blue-400",
    stats: [
      { label: "Factors Analyzed", value: "6 Pillars" },
      { label: "Format Support", value: "PDF & DOCX" },
      { label: "AI Rewriter", value: "STAR Powered" }
    ]
  },
  {
    id: "study-planner",
    name: "Study Planner",
    icon: Calendar,
    badge: "AI Roadmap",
    tagline: "Structured Weekly Study Schedule & Tasks",
    description: "Candidate ko target role aur weak skill areas ke hisab se daily study tasks aur weekly DevOps/Cloud roadmap milta hai. Har task complete karne par progress update aur XP award hota hai.",
    keyFeatures: [
      "Automated weekly DevOps roadmap",
      "Daily scheduled study tasks",
      "Topic-wise skill mastery tracking",
      "Interactive task completion checklist"
    ],
    mockRoute: "/study-planner",
    videoPlaceholderBg: "from-amber-950 via-slate-900 to-slate-950",
    accentColor: "text-amber-400",
    stats: [
      { label: "Roadmap Weeks", value: "4 Weeks" },
      { label: "Task Types", value: "Labs & Concepts" },
      { label: "XP Coins", value: "+50 Per Task" }
    ]
  },
  {
    id: "reminders",
    name: "Smart Reminders",
    icon: Bell,
    badge: "Alert System",
    tagline: "Never Miss a Study Session or Mock Interview",
    description: "Smart reminders service candidate ko custom alerts aur study notifications set karne deti hai taaki unka practice schedule disciplined rahe aur koi scheduled interview skip na ho.",
    keyFeatures: [
      "Custom study session alerts",
      "Mock interview scheduled reminders",
      "Automated push & browser notifications",
      "Priority status tagging (High/Normal)"
    ],
    mockRoute: "/reminders",
    videoPlaceholderBg: "from-rose-950 via-slate-900 to-slate-950",
    accentColor: "text-rose-400",
    stats: [
      { label: "Notification", value: "Real-Time" },
      { label: "Schedules", value: "Custom Times" },
      { label: "Status", value: "Active Alerts" }
    ]
  },
  {
    id: "performance",
    name: "My Progress & Matrix",
    icon: TrendingUp,
    badge: "Analytics",
    tagline: "5-Pillar Rubric Breakdown & Milestone Badges",
    description: "Progress & Matrix page par candidate ki cumulative evaluation, 5-pillar assessment rubric scores, readiness velocity aur Stage 5, 10, 15, 20 & 30 milestone badges unlock aur claim karne ka option milta hai.",
    keyFeatures: [
      "Cumulative 5-pillar rubric scores",
      "Curriculum stage milestone badges",
      "Readiness velocity benchmark",
      "Interactive 3D badge claim engine"
    ],
    mockRoute: "/performance",
    videoPlaceholderBg: "from-emerald-950 via-slate-900 to-slate-950",
    accentColor: "text-emerald-400",
    stats: [
      { label: "Pillars", value: "5 Rubrics" },
      { label: "Badges", value: "5 Milestones" },
      { label: "Analytics", value: "Live Matrix" }
    ]
  },
  {
    id: "leaderboard",
    name: "Leaderboard",
    icon: Trophy,
    badge: "Gamification",
    tagline: "Compete Globally & Earn XP Rankings",
    description: "Leaderboard candidate ko baki sabhi engineers ke sath compare karta hai. Real-time XP coins earn karke top global candidates list me rank rise hoti hai.",
    keyFeatures: [
      "Real-time candidate XP rankings",
      "Top 3 podium placement medals",
      "Weekly & monthly leaderboards",
      "LinkedIn profile verification"
    ],
    mockRoute: "/leaderboard",
    videoPlaceholderBg: "from-yellow-950 via-slate-900 to-slate-950",
    accentColor: "text-yellow-400",
    stats: [
      { label: "Rankings", value: "Live Roster" },
      { label: "Rewards", value: "XP Badges" },
      { label: "Podium", value: "Gold / Silver / Bronze" }
    ]
  }
];

export function PlatformDemoSection() {
  const [activeTabId, setActiveTabId] = useState<string>("dashboard");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(35);

  const activeService = CANDIDATE_SERVICES.find(s => s.id === activeTabId) || CANDIDATE_SERVICES[0];

  // Auto progress demo simulation scrubber
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="relative z-10 py-16 sm:py-24 w-full bg-slate-900/60 dark:bg-[#070b14]/90 border-t border-b border-slate-800/80 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-8 lg:px-20 flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-black uppercase tracking-widest">
            <Video className="w-4 h-4 text-[#FF6B00]" />
            <span>Interactive Demo & Candidate Services Tour</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
            See How The Candidate Platform <span className="text-[#FF6B00]">Works in Action</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Candidate Panel ke sabhi sidebar services ka complete demo walkthrough dekhein aur samjhein ki yeh aapki Cloud & DevOps preparation me kaise madad karta hai.
          </p>
        </div>

        {/* Horizontal Navigation Tabs (All Candidate Services) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center w-full max-w-full">
          {CANDIDATE_SERVICES.map((service) => {
            const IconComp = service.icon;
            const isActive = service.id === activeTabId;
            return (
              <button
                key={service.id}
                onClick={() => {
                  setActiveTabId(service.id);
                  setProgress(0);
                  setIsPlaying(true);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                  isActive
                    ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-lg shadow-[#FF6B00]/30 scale-[1.02]"
                    : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#FF6B00]/50"
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? "text-white" : service.accentColor}`} />
                <span>{service.name}</span>
              </button>
            );
          })}
        </div>

        {/* DEMO PLAYER & DETAILS MAIN DUAL PANEL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          
          {/* LEFT: INTERACTIVE SIMULATED VIDEO PLAYER SCREEN (7 cols) */}
          <div className="lg:col-span-7 flex flex-col rounded-[28px] bg-slate-950 border-2 border-slate-800 shadow-2xl overflow-hidden relative group">
            
            {/* Player Browser Header */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>

              <div className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>https://cloudops.ai{activeService.mockRoute}</span>
              </div>

              <span className="text-[10px] font-mono font-black text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30">
                LIVE DEMO
              </span>
            </div>

            {/* Video Canvas Container */}
            <div className={`relative flex-1 min-h-[340px] sm:min-h-[400px] bg-gradient-to-br ${activeService.videoPlaceholderBg} flex flex-col justify-between p-6 sm:p-8 overflow-hidden`}>
              
              {/* Background Animated Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

              {/* Top Service Badge Overlay */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-md">
                  <activeService.icon className={`w-4 h-4 ${activeService.accentColor}`} />
                  <span className="text-xs font-black text-white">{activeService.name}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Preview Mode</span>
                </div>
              </div>

              {/* Center Play Pulse Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FF6B00] hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl shadow-[#FF6B00]/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group/btn"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-white" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                  )}
                </button>
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                  {isPlaying ? "Demo Playing • Click to Pause" : "Click to Play Demo Video"}
                </span>
              </div>

              {/* Bottom Visual Mockup UI Card inside Canvas */}
              <div className="z-10 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-4 sm:p-5 rounded-2xl flex flex-col gap-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                    {activeService.tagline}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active Module
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
                  {activeService.stats.map((st, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{st.label}</span>
                      <span className="text-xs font-mono font-black text-white">{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Video Controls Bar */}
            <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  00:{Math.floor(progress / 2).toString().padStart(2, '0')} / 01:30
                </span>
              </div>

              {/* Progress Scrubber */}
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newProgress = Math.round((clickX / rect.width) * 100);
                setProgress(newProgress);
              }}>
                <div
                  className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-500 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase">HD 1080p</span>
                <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              </div>
            </div>

          </div>

          {/* RIGHT: SERVICE EXPLANATION & "HOTA KYA HAI" DETAILS (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-[28px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between gap-6">
            
            <div className="flex flex-col gap-4">
              
              {/* Badge & Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 flex items-center justify-center font-black">
                    <activeService.icon className={`w-5 h-5 ${activeService.accentColor}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-[#FF6B00] uppercase tracking-widest">CANDIDATE SERVICE</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {activeService.name}
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
                  {activeService.badge}
                </span>
              </div>

              {/* Tagline */}
              <div className="p-3.5 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 text-[#FF6B00] text-xs font-bold leading-snug">
                💡 {activeService.tagline}
              </div>

              {/* "Hota Kya Hai" Overview Intro */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  📖 Iss Service Me Kya Hota Hai?
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {activeService.description}
                </p>
              </div>

              {/* Key Features List */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  ✨ Key Features & Capabilities:
                </span>
                {activeService.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <Link
                href={`/login?redirect=${activeService.mockRoute}`}
                className="w-full py-3.5 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Try {activeService.name} Now →</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
