"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, 
  LayoutDashboard, Mic, FileText, Calendar, Bell, 
  TrendingUp, Trophy, CheckCircle2, ArrowRight, Video, 
  ShieldCheck, Eye, Layers, Star, Zap, Globe
} from "lucide-react";
import { getFirebaseVideos, VideoWalkthroughItem } from "@/lib/firebase-admin-store";

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
  videoUrl?: string;
  audioEnabled?: boolean;
}

const STATIC_SERVICES: CandidateServiceDemo[] = [
  {
    id: "overview",
    name: "🌐 All Project Overview",
    icon: Globe,
    badge: "Master Architecture",
    tagline: "Complete CloudOps AI System & Platform Overview",
    description: "Iss comprehensive walkthrough video me poore CloudOps AI project ka architecture, candidate evaluation pipeline, 30 interview stages, STAR formula resume scanner, and admin management tools ko detailed voice narration ke sath explain kiya gaya hai.",
    keyFeatures: [
      "Full Project System & Enterprise Architecture Walkthrough",
      "30 Sequential CloudOps & DevOps Candidate Stages",
      "Real-time Voice AI Interviewer & Evaluation Engine",
      "Firebase Secured Multi-Tenant Admin & Candidate Control"
    ],
    mockRoute: "/dashboard",
    videoPlaceholderBg: "from-[#0F172A] via-[#1E293B] to-[#0F172A]",
    accentColor: "text-[#FF6B00]",
    videoUrl: "/vedio/candidate-dashboard.mp4",
    audioEnabled: true,
    stats: [
      { label: "Total Services", value: "8 Modules" },
      { label: "Interview Stages", value: "30 Levels" },
      { label: "Voice Support", value: "100% HD Audio" }
    ]
  },
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
    videoUrl: "/vedio/candidate-dashboard.mp4",
    audioEnabled: true,
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
      "Real-time Camera Background Blur (18px Bokeh)",
      "5-Dimension AI evaluation rubric",
      "👑 40 LPA Staff Engineer Boss Battle"
    ],
    mockRoute: "/interviews",
    videoPlaceholderBg: "from-purple-950 via-slate-900 to-indigo-950",
    accentColor: "text-purple-400",
    videoUrl: "/vedio/interview-stages.mp4",
    audioEnabled: true,
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
  const [activeTabId, setActiveTabId] = useState<string>("overview");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false); // Unmuted voice by default
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [services, setServices] = useState<CandidateServiceDemo[]>(STATIC_SERVICES);

  // Sync Firebase Walkthrough Videos
  useEffect(() => {
    async function syncFirebaseVideos() {
      try {
        const fbVideos = await getFirebaseVideos();
        if (fbVideos && fbVideos.length > 0) {
          const merged = STATIC_SERVICES.map(s => {
            const match = fbVideos.find(v => 
              v.id === s.id || 
              v.category.toLowerCase().includes(s.id.toLowerCase()) || 
              (s.id === "overview" && v.category.includes("Overview"))
            );
            if (match) {
              return {
                ...s,
                name: match.category.includes("Overview") ? "🌐 All Project Overview" : s.name,
                tagline: match.tagline || s.tagline,
                description: match.description || s.description,
                videoUrl: match.videoUrl || s.videoUrl,
                audioEnabled: match.audioEnabled !== undefined ? match.audioEnabled : true,
                keyFeatures: match.keyFeatures && match.keyFeatures.length > 0 ? match.keyFeatures : s.keyFeatures
              };
            }
            return s;
          });
          setServices(merged);
        }
      } catch (e) {
        console.warn("Firebase video sync notice:", e);
      }
    }
    syncFirebaseVideos();
  }, []);

  const activeService = services.find(s => s.id === activeTabId) || services[0];

  useEffect(() => {
    if (videoRef.current && activeService.videoUrl) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activeTabId, activeService.videoUrl]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="relative z-10 py-8 sm:py-16 lg:py-24 w-full bg-slate-50/90 dark:bg-[#070b14]/90 border-t border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-20 flex flex-col gap-6 sm:gap-10">
        
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

        {/* Horizontal Navigation Tabs (All Candidate Services including All Project Overview) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center w-full max-w-full">
          {services.map((service) => {
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
          <div className="lg:col-span-7 flex flex-col rounded-[28px] bg-slate-900 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 shadow-xl dark:shadow-2xl overflow-hidden relative group transition-colors">
            
            {/* Player Browser Header */}
            <div className="px-4 py-3 bg-slate-800/90 dark:bg-slate-900/90 border-b border-slate-700/80 dark:border-slate-800 flex items-center justify-between z-20 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              </div>

              <div className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>https://cloudops.ai{activeService.mockRoute}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  title="Toggle Video Sound Audio Track"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span>Muted 🔇</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Sound ON 🔊</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] font-mono font-black text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30">
                  {activeService.videoUrl ? "LIVE VIDEO" : "LIVE DEMO"}
                </span>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className={`relative flex-1 min-h-[340px] sm:min-h-[400px] bg-gradient-to-br ${activeService.videoPlaceholderBg} flex flex-col justify-between p-6 sm:p-8 overflow-hidden`}>
              
              {/* REAL MP4 VIDEO PLAYER IF AVAILABLE */}
              {activeService.videoUrl ? (
                <video
                  ref={videoRef}
                  src={activeService.videoUrl}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  onTimeUpdate={() => {
                    if (videoRef.current && videoRef.current.duration) {
                      setCurrentTime(videoRef.current.currentTime);
                      setDuration(videoRef.current.duration);
                      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
                  onClick={() => setIsPlaying(!isPlaying)}
                />
              ) : null}

              {/* Background Animated Grid Overlay */}
              {!activeService.videoUrl && (
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
              )}

              {/* Top Service Badge Overlay (Compact, Single-Line, Non-Obstructive) */}
              <div className="flex items-center justify-between gap-2 z-10 pointer-events-none">
                <div className="hidden xs:flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 shadow-sm shrink-0">
                  <activeService.icon className={`w-3.5 h-3.5 ${activeService.accentColor}`} />
                  <span className="text-[10px] font-extrabold text-white whitespace-nowrap truncate max-w-[130px]">
                    {activeService.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 shrink-0 whitespace-nowrap ml-auto">
                  <Eye className="w-3 h-3 text-[#FF6B00]" />
                  <span>{activeService.videoUrl ? "Recorded Walkthrough" : "Preview Mode"}</span>
                </div>
              </div>

              {/* Center Play Pulse Overlay (Visible when paused) */}
              {!isPlaying && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-slate-950/40 backdrop-blur-xs">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#FF6B00] hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl shadow-[#FF6B00]/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group/btn"
                  >
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white translate-x-0.5" />
                  </button>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 shadow-md">
                    Click to Play Recorded Walkthrough
                  </span>
                </div>
              )}

              {/* Bottom Video Controls Overlay Bar (Super Compact & Non-Obstructive) */}
              <div className="mt-auto z-10 bg-slate-950/85 backdrop-blur-md p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col gap-1.5 shadow-lg">
                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs font-mono font-bold text-slate-300">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors shrink-0"
                      title={isPlaying ? "Pause Video" : "Play Video"}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    </button>
                    <span className="text-[10px] font-semibold text-slate-300 whitespace-nowrap truncate max-w-[120px] sm:max-w-none hidden xs:inline">
                      {activeService.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 sm:p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors shrink-0"
                      title="Toggle Audio"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <span className="whitespace-nowrap text-[10px] text-slate-300 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration || 32)}
                    </span>
                  </div>
                </div>

                {/* Scrubber Progress Bar */}
                <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-800 overflow-hidden cursor-pointer">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6B00] via-amber-400 to-orange-500 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: SERVICE EXPLANATION & KEY CAPABILITIES CARD (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 xs:p-5 sm:p-8 rounded-[22px] sm:rounded-[28px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl gap-5 sm:gap-6 max-w-full overflow-hidden">
            
            <div className="flex flex-col gap-4 max-w-full">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] shrink-0">
                    <activeService.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider truncate">CANDIDATE SERVICE</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  {activeService.badge}
                </span>
              </div>

              <div className="max-w-full">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight break-words">
                  {activeService.name}
                </h3>
                <p className="text-xs font-bold text-[#FF6B00] mt-1 break-words">{activeService.tagline}</p>
              </div>

              {/* ISS SERVICE ME KYA HOTA HAI? Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 text-xs leading-relaxed text-slate-700 dark:text-slate-200 break-words max-w-full overflow-hidden">
                <span className="font-mono font-bold text-[#FF6B00] block mb-1">📖 ISS SERVICE ME KYA HOTA HAI?</span>
                <p className="break-words leading-relaxed text-xs">{activeService.description}</p>
              </div>

              {/* Key Features List */}
              <div className="flex flex-col gap-2 max-w-full">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">✨ KEY FEATURES & CAPABILITIES:</span>
                <div className="flex flex-col gap-2">
                  {activeService.keyFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="break-words min-w-0 flex-1 leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 w-full">
              <Link
                href={activeService.mockRoute}
                className="w-full px-3 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-[#FF6B00] via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-600 shadow-xl shadow-[#FF6B00]/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] text-center leading-tight uppercase tracking-wider overflow-hidden max-w-full"
              >
                <span className="break-words text-center font-extrabold sm:font-black">
                  TRY {activeService.name.toUpperCase()} NOW
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
