import { create } from "zustand";
import { User, InterviewAttempt, StageAttempt, QuestionAttempt } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
  isAuthenticated: typeof window !== "undefined" ? !!localStorage.getItem("auth_token") : false,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
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
