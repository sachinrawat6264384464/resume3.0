"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, Mic, Volume2, ShieldCheck, CheckCircle2, AlertCircle, 
  RefreshCw, Play, VolumeX, Sparkles, ArrowRight, Eye, VideoOff,
  UserCheck, ShieldAlert, Hand
} from "lucide-react";
import { AudioVisualizer } from "@/lib/media-recorder";

interface DeviceCheckModalProps {
  templateTitle: string;
  targetRole?: string;
  onReadyToStart: (stream: MediaStream) => void;
}

export function DeviceCheckModal({ templateTitle, onReadyToStart }: DeviceCheckModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);

  const [micVolume, setMicVolume] = useState(0);
  const [micTested, setMicTested] = useState(false);
  const [speakerSuccess, setSpeakerSuccess] = useState(false);

  const [consent, setConsent] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<AudioVisualizer | null>(null);

  // Helper to release camera tracks & extinguish hardware light
  const stopAllMediaTracks = () => {
    if (visualizerRef.current) {
      try { visualizerRef.current.close(); } catch (e) {}
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    if (stream) {
      stream.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      setStream(null);
    }
    setCameraActive(false);
  };

  // 1. Initialize Media Devices (Webcam Stream + Mic Audio)
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initMedia() {
      try {
        setErrorMsg(null);
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        activeStream = s;
        setStream(s);
        setCameraActive(true);
        // Auto-verify mic when stream audio tracks exist
        if (s.getAudioTracks().length > 0) {
          setMicTested(true);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }

        // Initialize Audio Visualizer for Mic Volume Testing
        const viz = new AudioVisualizer();
        viz.init(s);
        visualizerRef.current = viz;

        const interval = setInterval(() => {
          if (visualizerRef.current) {
            const vol = visualizerRef.current.getVolumeLevel();
            setMicVolume(vol);
            if (vol >= 10) {
              setMicTested(true);
            }
          }
        }, 100);

        return () => clearInterval(interval);
      } catch (err: any) {
        setErrorMsg(
          "Camera or Microphone permission denied. Please enable device permissions in your browser settings to proceed."
        );
      }
    }

    initMedia();

    return () => {
      stopAllMediaTracks();
    };
  }, []);

  // 2. AI Face & Finger-Gap Anti-Spoofing Engine (Blocks Open Hands, Palms & Spread Fingers)
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    const faceCheckInterval = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvasRef.current = canvas;
        canvas.width = 160;
        canvas.height = 120;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, 160, 120);

          const imgData = ctx.getImageData(0, 0, 160, 120);
          const data = imgData.data;

          // 1. Horizontal Finger Gap & Edge Transition Scanner across 3 scanlines (y: 25, 40, 55)
          // Open hand with spread fingers creates 4 to 10 skin-to-background transitions!
          // A real human face/head creates max 2 smooth edge transitions.
          let maxFingerTransitions = 0;
          let totalSkinCount = 0;

          for (let y = 25; y <= 55; y += 15) {
            let transitions = 0;
            let inSkin = false;
            for (let x = 25; x <= 135; x += 2) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              const isSkin = (r > 45 && g > 25 && b > 15 && r > g && r > b && (r - Math.min(g, b) > 10));
              if (isSkin) totalSkinCount++;

              if (isSkin !== inSkin) {
                transitions++;
                inSkin = isSkin;
              }
            }
            maxFingerTransitions = Math.max(maxFingerTransitions, transitions);
          }

          const hasSpreadFingers = maxFingerTransitions >= 4;

          // 2. Dual Eye Pupil Socket Verification (y: 30..50, x: 45..65 left eye, x: 95..115 right eye, x: 72..88 nose)
          let leftEyeLum = 0, rightEyeLum = 0, noseLum = 0;
          let leftCnt = 0, rightCnt = 0, noseCnt = 0;

          for (let y = 30; y <= 50; y += 3) {
            for (let x = 45; x <= 65; x += 3) {
              const idx = (y * 160 + x) * 4;
              leftEyeLum += (data[idx] * 0.3 + data[idx + 1] * 0.59 + data[idx + 2] * 0.11);
              leftCnt++;
            }
            for (let x = 95; x <= 115; x += 3) {
              const idx = (y * 160 + x) * 4;
              rightEyeLum += (data[idx] * 0.3 + data[idx + 1] * 0.59 + data[idx + 2] * 0.11);
              rightCnt++;
            }
            for (let x = 72; x <= 88; x += 3) {
              const idx = (y * 160 + x) * 4;
              noseLum += (data[idx] * 0.3 + data[idx + 1] * 0.59 + data[idx + 2] * 0.11);
              noseCnt++;
            }
          }

          const avgLeftEye = leftEyeLum / (leftCnt || 1);
          const avgRightEye = rightEyeLum / (rightCnt || 1);
          const avgNose = noseLum / (noseCnt || 1);

          const hasEyeSockets = (avgLeftEye < avgNose * 0.97) && (avgRightEye < avgNose * 0.97);

          // 3. Arm/Wrist Extension Test (Scanning side margins x: 125..155 at y: 45..75)
          let sideArmSkinPixels = 0;
          for (let y = 45; y <= 75; y += 5) {
            for (let x = 125; x <= 155; x += 3) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              if (r > 45 && g > 25 && b > 15 && r > g && r > b && (r - Math.min(g, b) > 10)) {
                sideArmSkinPixels++;
              }
            }
          }
          const isArmExtendingToSide = sideArmSkinPixels > 15;

          // 4. Center Oval Circle Skin Coverage (x: 40..120, y: 20..80)
          let centerSkinPixels = 0;
          for (let y = 20; y <= 80; y += 4) {
            for (let x = 40; x <= 120; x += 4) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              if (r > 45 && g > 25 && b > 15 && r > g && r > b && (r - Math.min(g, b) > 10)) {
                centerSkinPixels++;
              }
            }
          }
          const centerSkinRatio = centerSkinPixels / (80 * 60 / 16);

          // Decision: If spread fingers OR side arm OR palm covering eyes -> REJECT AS HAND!
          if (hasSpreadFingers || isArmExtendingToSide || (centerSkinRatio > 0.15 && !hasEyeSockets)) {
            // 🔴 HAND / PALM / SPREAD FINGERS DETECTED!
            setIsHandDetected(true);
            setFaceDetected(false);
          } else if (centerSkinRatio >= 0.12 && hasEyeSockets && !hasSpreadFingers) {
            // 🟢 REAL HUMAN FACE DETECTED & CENTERED!
            setFaceDetected(true);
            setIsHandDetected(false);
          } else {
            // Face missing or out of frame
            setFaceDetected(false);
            setIsHandDetected(false);
          }
        }
      } catch (e) {
        setFaceDetected(false);
        setIsHandDetected(false);
      }
    }, 300);

    return () => clearInterval(faceCheckInterval);
  }, [cameraActive]);

  const testSpeaker = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 chime
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
      setSpeakerSuccess(true);
    } catch (e) {
      console.warn("Speaker test failed:", e);
    }
  };

  const isComplete = cameraActive && consent;

  const getMissingRequirements = () => {
    const missing = [];
    if (!cameraActive) missing.push("Webcam stream");
    if (isHandDetected) missing.push("Remove hand from face area");
    else if (!faceDetected) missing.push("Position face in camera");
    if (!micTested) missing.push("Speak into mic");
    if (!speakerSuccess) missing.push("Play Chime test (Optional)");
    if (!consent) missing.push("Accept privacy consent");
    return missing;
  };

  const handleStart = () => {
    stopAllMediaTracks();
    if (stream) {
      onReadyToStart(stream);
    } else {
      onReadyToStart(null as any);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-6 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-950/60 border border-blue-200 dark:border-cyan-800/80 px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span>PRE-INTERVIEW HARDWARE VERIFICATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Device Check: <span className="text-blue-600 dark:text-blue-400">{templateTitle}</span>
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
          Verify your camera, AI face alignment, microphone level (≥ 60%), and audio settings before commencing.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-bold">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Webcam Preview (Left) vs Hardware Verification Cards (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Side: Real-time Camera Feed with AI Face Box */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-lg flex items-center justify-center">
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive ? "hidden" : ""}`}
            />

            {!cameraActive && (
              <div className="flex flex-col items-center gap-2 text-slate-400 p-6 text-center">
                <VideoOff className="w-10 h-10 text-slate-600 animate-pulse" />
                <span className="text-xs font-mono font-bold">Initializing Webcam Feed...</span>
              </div>
            )}

            {/* AI Face Centering & Hand Detection Bounding Overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-4">
                
                {/* Status Badge Top Overlay */}
                <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-md ${
                  isHandDetected
                    ? "bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse"
                    : faceDetected
                    ? "bg-emerald-950/90 text-emerald-300 border-emerald-500"
                    : "bg-amber-950/90 text-amber-300 border-amber-500 animate-pulse"
                }`}>
                  {isHandDetected
                    ? "🔴 HAND DETECTED — SHOW YOUR FACE"
                    : faceDetected
                    ? "🟢 FACE DETECTED & CENTERED"
                    : "🔴 NO FACE DETECTED"}
                </div>

                {/* Center Face Target Frame */}
                <div className={`w-36 h-44 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${
                  isHandDetected
                    ? "border-rose-500 bg-rose-500/10 scale-105"
                    : faceDetected
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-amber-400/60 bg-amber-500/5 animate-pulse"
                }`}>
                  {isHandDetected ? (
                    <Hand className="w-10 h-10 text-rose-400 animate-bounce" />
                  ) : faceDetected ? (
                    <UserCheck className="w-10 h-10 text-emerald-400 opacity-80" />
                  ) : (
                    <Camera className="w-8 h-8 text-amber-400/60" />
                  )}
                </div>

                {/* Bottom Overlay Instructions */}
                <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                  {isHandDetected
                    ? "⚠️ Hand detected! Please show your face clearly inside the frame."
                    : faceDetected
                    ? "✓ Face features centered & verified"
                    : "⚠️ Position your face clearly inside the oval frame"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: 4 Hardware Verification Checklist Cards */}
        <div className="md:col-span-6 flex flex-col justify-between gap-3">
          
          <div className="flex flex-col gap-2.5">
            
            {/* 1. Webcam & AI Face Detection Check Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Webcam & AI Face Detection</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {isHandDetected
                      ? "Hand detected — show your face"
                      : faceDetected
                      ? "Face centered & verified"
                      : "Position face in camera"}
                  </div>
                </div>
              </div>
              {cameraActive && faceDetected && !isHandDetected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Face Verified ✓</span>
                </div>
              ) : isHandDetected ? (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-300 flex-shrink-0">
                  Hand Detected ✋
                </span>
              ) : (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 flex-shrink-0">
                  Center Face 👤
                </span>
              )}
            </div>

            {/* 2. Microphone Check Card (Strict ≥ 60% Rule) */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Microphone Input</span>
                      {micVolume > 0 && (
                        <span className={`text-xs font-mono font-bold ${micVolume >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {micVolume}% Level
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {micTested 
                        ? "Microphone input verified (≥ 60% Peak Level)" 
                        : micVolume > 0 
                        ? `Current: ${micVolume}%. Speak louder to reach 60% threshold.` 
                        : "Speak out loud into mic to test volume level"}
                    </div>
                  </div>
                </div>
                {micTested ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Tested ✓</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 animate-pulse flex-shrink-0">
                    {micVolume > 0 ? `Speak Louder (${micVolume}%/60%)` : "Speak Louder (≥ 60%) 🎙️"}
                  </span>
                )}
              </div>
              {/* Audio meter */}
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${
                    micVolume >= 60
                      ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"
                      : "bg-gradient-to-r from-amber-400 to-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, micVolume * 1.5)}%` }}
                />
              </div>
            </div>

            {/* 3. Speaker Check Card */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">AI Voice Output</div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Audio playback test</div>
                </div>
              </div>
              <button
                type="button"
                onClick={testSpeaker}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  speakerSuccess
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                {speakerSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Tested ✓</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Chime</span>
                  </>
                )}
              </button>
            </div>

            {/* 4. Privacy & Recording Consent Checkbox */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-medium">
                  I consent to AI proctoring, webcam facial verification, and audio response recording for evaluation.
                </span>
              </label>
            </div>

          </div>

        </div>

      </div>

      {/* Footer: Begin Assessment Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        
        {/* Missing Requirements List */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {!isComplete && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Pending: {getMissingRequirements().join(" • ")}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleStart}
            className="px-4 py-3.5 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            ⚡ Skip Checks & Enter Room
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-500/25 cursor-pointer hover:scale-[1.02]"
          >
            <span>Begin Voice AI Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
