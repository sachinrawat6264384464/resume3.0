import { create } from "zustand";
import { User, InterviewAttempt, StageAttempt, QuestionAttempt } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  logout: () => void;
}

const getInitialAuth = (): { user: User | null; token: string | null; isAuthenticated: boolean } => {
  if (typeof window !== "undefined") {
    try {
      const pathname = window.location.pathname;
      const isAdminRoute = pathname.startsWith("/admin");

      // On admin routes, prioritize dedicated admin session tokens
      if (isAdminRoute) {
        const adminToken = localStorage.getItem("admin_auth_token");
        const adminUser = localStorage.getItem("admin_auth_user");
        if (adminToken && adminUser && adminUser.trim() && adminUser !== "undefined") {
          const parsed = JSON.parse(adminUser);
          if (parsed && typeof parsed === "object" && parsed.id) {
            return { user: parsed, token: adminToken, isAuthenticated: true };
          }
        }
      }

      // Candidate session tokens (used for /dashboard, /interviews, etc.)
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      if (storedToken && storedUser && storedUser.trim() && storedUser !== "undefined") {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === "object" && parsed.id) {
          // If on admin route, only accept if user is an admin
          if (!isAdminRoute || parsed.role === "ADMIN" || parsed.role === "SUPER_ADMIN") {
            return { user: parsed, token: storedToken, isAuthenticated: true };
          }
        }
      }

      // Fallback for admin if accessed with dedicated token
      if (isAdminRoute) {
        const adminTokenFallback = localStorage.getItem("admin_auth_token");
        const adminUserFallback = localStorage.getItem("admin_auth_user");
        if (adminTokenFallback && adminUserFallback) {
          const parsed = JSON.parse(adminUserFallback);
          if (parsed && typeof parsed === "object" && parsed.id) {
            return { user: parsed, token: adminTokenFallback, isAuthenticated: true };
          }
        }
      }
    } catch (e) {
      console.warn("Notice: reading initial auth:", e);
    }
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      const isAdmin = 
        user.role === "ADMIN" || 
        user.role === "SUPER_ADMIN" || 
        window.location.pathname.startsWith("/admin");

      if (isAdmin) {
        localStorage.setItem("admin_auth_token", token);
        localStorage.setItem("admin_auth_user", JSON.stringify(user));
      } else {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
      }
    }
    set({ user, token, isAuthenticated: true });
  },
  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      if (typeof window !== "undefined") {
        const isAdmin = 
          newUser.role === "ADMIN" || 
          newUser.role === "SUPER_ADMIN" || 
          window.location.pathname.startsWith("/admin");
        if (isAdmin) {
          localStorage.setItem("admin_auth_user", JSON.stringify(newUser));
        } else {
          localStorage.setItem("auth_user", JSON.stringify(newUser));
        }
      }
      return { user: newUser };
    });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      const isAdmin = window.location.pathname.startsWith("/admin");
      if (isAdmin) {
        localStorage.removeItem("admin_auth_token");
        localStorage.removeItem("admin_auth_user");
        sessionStorage.removeItem("admin_cache_templates");
        sessionStorage.removeItem("admin_cache_metrics");
      } else {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("active_interview_session");
        localStorage.removeItem("cached_interviews_stages");
        localStorage.removeItem("stage0_profile_data");
        localStorage.removeItem("candidate_linkedin_url");
        localStorage.removeItem("ats_result");
      }
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

interface DeviceCheckState {
  cameraReady: boolean;
  micReady: boolean;
  speakerTested: boolean;
  consentAccepted: boolean;
  setCameraReady: (v: boolean) => void;
  setMicReady: (v: boolean) => void;
  setSpeakerTested: (v: boolean) => void;
  setConsentAccepted: (v: boolean) => void;
  isAllReady: () => boolean;
}

export const useDeviceCheckStore = create<DeviceCheckState>((set, get) => ({
  cameraReady: false,
  micReady: false,
  speakerTested: false,
  consentAccepted: false,
  setCameraReady: (v) => set({ cameraReady: v }),
  setMicReady: (v) => set({ micReady: v }),
  setSpeakerTested: (v) => set({ speakerTested: v }),
  setConsentAccepted: (v) => set({ consentAccepted: v }),
  isAllReady: () => {
    const s = get();
    return s.cameraReady && s.micReady && s.consentAccepted;
  },
}));

interface LiveInterviewState {
  attempt: InterviewAttempt | null;
  currentStage: StageAttempt | null;
  currentQuestionIndex: number;
  isRecording: boolean;
  isProcessingAnswer: boolean;
  isSpeakingQuestion: boolean;
  elapsedSeconds: number;
  setAttempt: (att: InterviewAttempt) => void;
  setCurrentStage: (stg: StageAttempt) => void;
  setCurrentQuestionIndex: (idx: number) => void;
  setIsRecording: (v: boolean) => void;
  setIsProcessingAnswer: (v: boolean) => void;
  setIsSpeakingQuestion: (v: boolean) => void;
  setElapsedSeconds: (s: number) => void;
}

export const useInterviewStore = create<LiveInterviewState>((set) => ({
  attempt: null,
  currentStage: null,
  currentQuestionIndex: 0,
  isRecording: false,
  isProcessingAnswer: false,
  isSpeakingQuestion: false,
  elapsedSeconds: 0,
  setAttempt: (attempt) => set({ attempt }),
  setCurrentStage: (currentStage) => set({ currentStage }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsProcessingAnswer: (isProcessingAnswer) => set({ isProcessingAnswer }),
  setIsSpeakingQuestion: (isSpeakingQuestion) => set({ isSpeakingQuestion }),
  setElapsedSeconds: (elapsedSeconds) => set({ elapsedSeconds }),
}));

interface ATSAnalysisState {
  isAnalyzing: boolean;
  atsResult: any | null;
  analysisError: string | null;
  activeFileName: string | null;
  setIsAnalyzing: (v: boolean) => void;
  setAtsResult: (res: any | null) => void;
  setAnalysisError: (err: string | null) => void;
  setActiveFileName: (name: string | null) => void;
  resetATS: () => void;
}

export const useATSStore = create<ATSAnalysisState>((set) => ({
  isAnalyzing: false,
  atsResult: null,
  analysisError: null,
  activeFileName: null,
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAtsResult: (atsResult) => {
    if (typeof window !== "undefined" && atsResult) {
      localStorage.setItem("ats_result", JSON.stringify(atsResult));
    }
    set({ atsResult, isAnalyzing: false, analysisError: null });
  },
  setAnalysisError: (analysisError) => set({ analysisError, isAnalyzing: false }),
  setActiveFileName: (activeFileName) => set({ activeFileName }),
  resetATS: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ats_result");
    }
    set({ atsResult: null, isAnalyzing: false, analysisError: null, activeFileName: null });
  }
}));
