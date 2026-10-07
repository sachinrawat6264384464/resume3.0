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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      try {
        const prevUserRaw = localStorage.getItem("auth_user");
        if (prevUserRaw) {
          const prevUser = JSON.parse(prevUserRaw);
          if (prevUser.id && prevUser.id !== user.id) {
            localStorage.clear();
            sessionStorage.clear();
          }
        }
      } catch (e) {}
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedFields };
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(newUser));
      }
      return { user: newUser };
    });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
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
