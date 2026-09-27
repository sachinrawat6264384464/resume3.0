import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from "@/lib/firebase";

export interface VideoWalkthroughItem {
  id: string;
  category: string; // e.g. "overview", "dashboard", "interviews", "resume-ats", etc.
  title: string;
  tagline: string;
  description: string;
  videoUrl: string;
  audioEnabled: boolean;
  keyFeatures: string[];
  mockRoute: string;
  stats: { label: string; value: string }[];
  updatedAt: string;
}

export interface SystemRoleItem {
  id: string;
  roleName: string;
  roleCode: string;
  description: string;
  assignedEmail?: string;
  allowedServices: string[]; // List of route paths allowed e.g. ["/dashboard", "/interviews", "/admin/candidates"]
  userCount: number;
  isSystemDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLogItem {
  id: string;
  userName: string;
  userEmail: string;
  roleName: string;
  action: string;
  pageLocation: string;
  timestamp: string;
  status: "ONLINE" | "IDLE" | "OFFLINE";
}

// -------------------------------------------------------------
// DEFAULT SEED DATA (Used when Firebase is offline or loading)
// -------------------------------------------------------------

export const DEFAULT_VIDEOS: VideoWalkthroughItem[] = [
  {
    id: "overview",
    category: "All Project Overview",
    title: "CloudOps AI Assessment OS — Complete Master Architecture Overview",
    tagline: "End-to-End Enterprise AI Interview & Candidate Evaluation Platform",
    description: "Iss comprehensive walkthrough video me poore CloudOps AI project ka architecture, candidate evaluation pipeline, 30 interview stages, STAR formula resume scanner, and admin management tools ko detailed voice narration ke sath explain kiya gaya hai.",
    videoUrl: "/vedio/candidate-dashboard.mp4",
    audioEnabled: true,
    keyFeatures: [
      "Full Project System & Enterprise Architecture Walkthrough",
      "30 Sequential CloudOps & DevOps Candidate Stages",
      "Real-time Voice AI Interviewer & Evaluation Engine",
      "Firebase Secured Multi-Tenant Admin & Candidate Control"
    ],
    mockRoute: "/dashboard",
    stats: [
      { label: "Total Services", value: "8 Modules" },
      { label: "Interview Stages", value: "30 Levels" },
      { label: "Voice Support", value: "100% HD Audio" }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "dashboard",
    category: "Candidate Dashboard",
    title: "Candidate Mission Control Dashboard & Readiness Score",
    tagline: "Your Central Readiness Hub & Daily Goal Tracker",
    description: "Iss service me candidate ka complete profile overview, live readiness score, daily streak, and 30 interview stages ka progress track hota hai. Ek single screen se aap sabhi activities monitor kar sakte hain.",
    videoUrl: "/vedio/candidate-dashboard.mp4",
    audioEnabled: true,
    keyFeatures: [
      "Real-time readiness score (0–100%)",
      "Sequential stage progress tracking",
      "Daily activity & streak counter",
      "Quick access to active interviews"
    ],
    mockRoute: "/dashboard",
    stats: [
      { label: "Stages Covered", value: "30 Stages" },
      { label: "Target Band", value: "₹18 – ₹40 LPA" },
      { label: "Metrics Sync", value: "Instant DB" }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "interviews",
    category: "Interview Stages (30 Stages)",
    title: "30 Stage Spoken Voice AI Mock Interview Chamber",
    tagline: "Practice Real Spoken AI Mock Interviews with Live Video & Background Blur",
    description: "Candidate 30 structured interview stages me part le sakte hain. AI voice interviewer real-time me questions puchta hai, spoken answers evaluate karta hai, aur STAR methodology ke sath detailed feedback deta hai.",
    videoUrl: "/vedio/interview-stages.mp4",
    audioEnabled: true,
    keyFeatures: [
      "Voice AI interactive interview room",
      "Real-time Camera Background Blur (18px Bokeh)",
      "5-Dimension AI evaluation rubric",
      "👑 40 LPA Staff Engineer Boss Battle"
    ],
    mockRoute: "/interviews",
    stats: [
      { label: "Stages", value: "30 Levels" },
      { label: "Feedback", value: "STAR Formula" },
      { label: "Boss Battle", value: "Stage 30" }
    ],
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_ROLES: SystemRoleItem[] = [
  {
    id: "super_admin",
    roleName: "Super Admin",
    roleCode: "SUPER_ADMIN",
    description: "Full Administrator Access across all Admin OS Services",
    assignedEmail: "admin@cloudops.internal",
    allowedServices: [
      "/admin", "/admin/candidates", "/admin/video-management", 
      "/admin/roles-permissions", "/admin/reminders", "/admin/live-sessions",
      "/admin/payment-gateway", "/admin/templates", "/admin/reports", "/admin/leaderboard"
    ],
    userCount: 2,
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "hr_manager",
    roleName: "HR / Hiring Manager",
    roleCode: "HR_MANAGER",
    description: "Access to Candidate Profiles, Live Sessions, Reports & Analytics",
    assignedEmail: "hr.manager@cloudops.ai",
    allowedServices: [
      "/admin/candidates", "/admin/live-sessions", "/admin/reports", "/admin/leaderboard"
    ],
    userCount: 4,
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "candidate",
    roleName: "Candidate / Student",
    roleCode: "CANDIDATE",
    description: "Standard Portal Access for Admin Reporting",
    assignedEmail: "candidate@cloudops.ai",
    allowedServices: [
      "/admin/candidates", "/admin/reports"
    ],
    userCount: 28,
    isSystemDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_AUDIT_LOGS: AdminAuditLogItem[] = [
  {
    id: "log-1",
    userName: "Alex Vance (Admin)",
    userEmail: "admin@cloudops.internal",
    roleName: "Super Admin",
    action: "Updated Video Walkthrough: 'All Project Overview'",
    pageLocation: "/admin/video-management",
    timestamp: "2 mins ago",
    status: "OFFLINE"
  },
  {
    id: "log-2",
    userName: "Sachin Rawat",
    userEmail: "sachinrawat6264384464@gmail.com",
    roleName: "Candidate / Student",
    action: "Completed Stage 1 Interview Assessment",
    pageLocation: "/interviews/stage-1/room",
    timestamp: "14 mins ago",
    status: "OFFLINE"
  },
  {
    id: "log-3",
    userName: "Vikas Sharma",
    userEmail: "vikas.sharma@cloudops.ai",
    roleName: "HR / Hiring Manager",
    action: "Exported Candidate Database Roster (CSV)",
    pageLocation: "/admin/candidates",
    timestamp: "45 mins ago",
    status: "OFFLINE"
  }
];

// -------------------------------------------------------------
// FIREBASE FIRESTORE API WRAPPERS
// -------------------------------------------------------------

// 1. VIDEOS
export async function getFirebaseVideos(): Promise<VideoWalkthroughItem[]> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("firebase_video_walkthroughs");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
  }

  if (db) {
    try {
      const snap = await getDocs(collection(db, "video_walkthroughs"));
      if (!snap.empty) {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoWalkthroughItem));
        if (typeof window !== "undefined") {
          localStorage.setItem("firebase_video_walkthroughs", JSON.stringify(list));
        }
        return list;
      }
    } catch (e) {
      console.warn("Firestore videos fetch fallback:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_video_walkthroughs", JSON.stringify(DEFAULT_VIDEOS));
  }
  return DEFAULT_VIDEOS;
}

export async function saveFirebaseVideo(video: VideoWalkthroughItem): Promise<void> {
  const currentList = await getFirebaseVideos();
  const existingIdx = currentList.findIndex(v => v.id === video.id);
  let updatedList: VideoWalkthroughItem[];
  
  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = { ...video, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [video, ...currentList];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_video_walkthroughs", JSON.stringify(updatedList));
  }

  if (db) {
    try {
      const videoRef = doc(db, "video_walkthroughs", video.id);
      await setDoc(videoRef, {
        ...video,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore video save fallback:", e);
    }
  }
}

export async function deleteFirebaseVideo(videoId: string): Promise<void> {
  const currentList = await getFirebaseVideos();
  const updatedList = currentList.filter(v => v.id !== videoId);

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_video_walkthroughs", JSON.stringify(updatedList));
  }

  if (db) {
    try {
      await deleteDoc(doc(db, "video_walkthroughs", videoId));
    } catch (e) {
      console.warn("Firestore video delete fallback:", e);
    }
  }
}

// 2. ROLES & PERMISSIONS
export async function getFirebaseRoles(): Promise<SystemRoleItem[]> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("firebase_system_roles");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  if (db) {
    try {
      const fetchPromise = getDocs(collection(db, "roles_permissions"));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout")), 1200)
      );

      const snap: any = await Promise.race([fetchPromise, timeoutPromise]);
      if (snap && !snap.empty) {
        const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as SystemRoleItem));
        if (typeof window !== "undefined") {
          localStorage.setItem("firebase_system_roles", JSON.stringify(list));
        }
        return list;
      }
    } catch (e) {
      console.warn("Firestore roles fetch fallback:", e);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_system_roles", JSON.stringify(DEFAULT_ROLES));
  }
  return DEFAULT_ROLES;
}

export async function saveFirebaseRole(role: SystemRoleItem): Promise<void> {
  const currentList = await getFirebaseRoles();
  const existingIdx = currentList.findIndex(r => r.id === role.id);
  let updatedList: SystemRoleItem[];

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = { ...role, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [role, ...currentList];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_system_roles", JSON.stringify(updatedList));
  }

  if (db) {
    try {
      const roleRef = doc(db, "roles_permissions", role.id);
      await setDoc(roleRef, {
        ...role,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore role save fallback:", e);
    }
  }
}

export async function deleteFirebaseRole(roleId: string): Promise<void> {
  const currentList = await getFirebaseRoles();
  const updatedList = currentList.filter(r => r.id !== roleId);

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_system_roles", JSON.stringify(updatedList));
  }

  if (db) {
    try {
      await deleteDoc(doc(db, "roles_permissions", roleId));
    } catch (e) {
      console.warn("Firestore role delete fallback:", e);
    }
  }
}

// 3. AUDIT LOGS ("Who did what & where")
export async function getFirebaseAuditLogs(): Promise<AdminAuditLogItem[]> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("firebase_admin_audit_logs");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }
  return DEFAULT_AUDIT_LOGS;
}

export async function addFirebaseAuditLog(log: Omit<AdminAuditLogItem, "id" | "timestamp">): Promise<void> {
  const currentList = await getFirebaseAuditLogs();
  const newEntry: AdminAuditLogItem = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: "Just now"
  };
  const updatedList = [newEntry, ...currentList];

  if (typeof window !== "undefined") {
    localStorage.setItem("firebase_admin_audit_logs", JSON.stringify(updatedList));
  }

  if (db) {
    try {
      const logRef = doc(db, "admin_audit_logs", newEntry.id);
      await setDoc(logRef, newEntry);
    } catch (e) {
      console.warn("Firestore log save fallback:", e);
    }
  }
}
