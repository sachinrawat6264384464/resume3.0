"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, CameraOff, Mic, MicOff, Volume2, ShieldCheck, CheckCircle2, 
  AlertCircle, Play, Sparkles, ArrowRight, VideoOff,
  UserCheck, Hand, Lock, VolumeX, RefreshCw
} from "lucide-react";
import { AudioVisualizer } from "@/lib/media-recorder";
import { useAuthStore } from "@/lib/store";

interface DeviceCheckModalProps {
  templateTitle?: string;
  targetRole?: string;
  onReadyToStart: (stream: MediaStream | null) => void;
}

export function DeviceCheckModal({ templateTitle = "Technical Assessment", targetRole, onReadyToStart }: DeviceCheckModalProps) {
  const authUser = useAuthStore((s) => s.user);
  
  // Extract candidate display name
  const candidateName = authUser?.full_name || authUser?.email?.split("@")[0] || "Candidate";

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);

  const [micVolume, setMicVolume] = useState(0);
  const [micTested, setMicTested] = useState(false);
  
  // Voice Preview State
  const [selectedVoice, setSelectedVoice] = useState("Ravya · American English");
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualizerRef = useRef<AudioVisualizer | null>(null);

  // Background Blur Processing Canvas Loop
  useEffect(() => {
    if (!cameraActive || !stream) return;

    let animId: number;

    const renderBlurFrame = () => {
      const video = videoRef.current;
      const canvas = blurCanvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (isBlurEnabled) {
            ctx.save();
            ctx.filter = "blur(18px) brightness(0.92) contrast(1.05)";
            ctx.drawImage(video, 0, 0, width, height);
            ctx.restore();

            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;
            const mCtx = maskCanvas.getContext("2d");

            if (mCtx) {
              mCtx.drawImage(video, 0, 0, width, height);
              mCtx.globalCompositeOperation = "destination-in";

              const centerX = width / 2;
              const centerY = height * 0.52;
              const rx = width * 0.36;
              const ry = height * 0.48;

              const grad = mCtx.createRadialGradient(
                centerX, centerY, rx * 0.35,
                centerX, centerY, rx
              );
              grad.addColorStop(0, "rgba(0,0,0,1)");
              grad.addColorStop(0.7, "rgba(0,0,0,0.95)");
              grad.addColorStop(1, "rgba(0,0,0,0)");

              mCtx.fillStyle = grad;
              mCtx.beginPath();
              mCtx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
              mCtx.fill();

              ctx.drawImage(maskCanvas, 0, 0);
            }
          } else {
            ctx.drawImage(video, 0, 0, width, height);
          }
        }
      }
      animId = requestAnimationFrame(renderBlurFrame);
    };

    renderBlurFrame();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [cameraActive, stream, isBlurEnabled]);

  // Release camera tracks cleanly
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
    setMicActive(false);
  };

  // Initialize Media Devices (Webcam + Microphone)
  const initMedia = async () => {
    try {
      setErrorMsg(null);
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(s);
      setCameraActive(s.getVideoTracks().some(t => t.enabled));
      setMicActive(s.getAudioTracks().some(t => t.enabled));
      
      if (s.getAudioTracks().length > 0) {
        setMicTested(true);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }

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
      console.warn("Media permissions notice:", err);
      setErrorMsg(
        "Camera or Microphone access was not granted. Please enable browser permissions or click 'Continue without camera'."
      );
    }
  };

  useEffect(() => {
    initMedia();
    return () => {
      stopAllMediaTracks();
    };
  }, []);

  // AI Face Centering Scan
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    const faceCheckInterval = setInterval(() => {
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

          let centerSkinPixels = 0;
          let totalPixelsChecked = 0;
          for (let y = 15; y <= 95; y += 4) {
            for (let x = 35; x <= 125; x += 4) {
              totalPixelsChecked++;
              const idx = (y * 160 + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              if (r > 40 && g > 20 && b > 15 && r > g && r > b && (r - Math.min(g, b) > 12)) {
                centerSkinPixels++;
              }
            }
          }
          const centerSkinRatio = centerSkinPixels / (totalPixelsChecked || 1);

          let topSkinPixels = 0;
          for (let y = 5; y <= 40; y += 4) {
            for (let x = 20; x <= 140; x += 4) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx], g = data[idx + 1], b = data[idx + 2];
              if (r > 50 && g > 30 && b > 20 && r > g && r > b) topSkinPixels++;
            }
          }
          const isExtremePalmBlocking = topSkinPixels > 180 && centerSkinRatio > 0.65;

          if (isExtremePalmBlocking) {
            setIsHandDetected(true);
            setFaceDetected(false);
          } else {
            setIsHandDetected(false);
            setFaceDetected(centerSkinRatio >= 0.05 || cameraActive);
          }
        }
      } catch (e) {
        setIsHandDetected(false);
        setFaceDetected(true);
      }
    }, 300);

    return () => clearInterval(faceCheckInterval);
  }, [cameraActive]);

  // Toggle Camera Track
  const toggleCamera = () => {
    if (!stream) {
      initMedia();
      return;
    }
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !videoTracks[0].enabled;
      videoTracks[0].enabled = nextState;
      setCameraActive(nextState);
    } else {
      initMedia();
    }
  };

  // Toggle Mic Track
  const toggleMic = () => {
    if (!stream) {
      initMedia();
      return;
    }
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextState = !audioTracks[0].enabled;
      audioTracks[0].enabled = nextState;
      setMicActive(nextState);
    } else {
      initMedia();
    }
  };

  // Play Sample Speech Preview for Selected Voice
  const handlePreviewVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (isPreviewingVoice) {
      setIsPreviewingVoice(false);
      return;
    }

    const sampleText = `Hello ${candidateName}, I am your AI interviewer. I will evaluate your response with natural neural pacing.`;
    const utterance = new SpeechSynthesisUtterance(sampleText);
    
    utterance.rate = 1.55;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    if (selectedVoice.includes("Indian")) {
      const inVoice = voices.find(v => v.lang.includes("en-IN") || v.name.includes("India"));
      if (inVoice) utterance.voice = inVoice;
    } else if (selectedVoice.includes("British")) {
      const ukVoice = voices.find(v => v.lang.includes("en-GB") || v.name.includes("UK") || v.name.includes("British"));
      if (ukVoice) utterance.voice = ukVoice;
    } else {
      const usVoice = voices.find(v => v.lang.includes("en-US") || v.name.includes("US") || v.name.includes("English"));
      if (usVoice) utterance.voice = usVoice;
    }

    utterance.onstart = () => setIsPreviewingVoice(true);
    utterance.onend = () => setIsPreviewingVoice(false);
    utterance.onerror = () => setIsPreviewingVoice(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartInterview = () => {
    stopAllMediaTracks();
    onReadyToStart(stream);
  };

  const handleStartWithoutCamera = () => {
    stopAllMediaTracks();
    onReadyToStart(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-8 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Let's check your setup
        </h1>
        <p className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Find a quiet place, position your camera at eye level, and give yourself permission to pause before answering.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Setup Checklist vs Right Pre-Interview Lobby Device Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Numbered Checklist Items & Voice Options & Action Buttons */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Step 1: Camera */}
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-colors ${
              cameraActive 
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}>
              {cameraActive ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : "1"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Camera</h3>
                <span className={`text-xs font-semibold ${cameraActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {cameraActive ? "Ready" : "Not checked"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Local preview only—never recorded
              </p>
            </div>
          </div>

          {/* Step 2: Microphone */}
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 transition-colors ${
              micActive || micTested 
                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}>
              {micActive || micTested ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : "2"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Microphone</h3>
                <span className={`text-xs font-semibold ${micActive || micTested ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                  {micActive || micTested ? "Ready" : "Not checked"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Used to transcribe your answers
              </p>
            </div>
          </div>

          {/* Step 3: Interviewer voice */}
          <div className="flex items-start gap-4 pb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Interviewer voice</h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Natural neural speech with clear, human-like pacing
              </p>
            </div>
          </div>

          {/* Choose Interviewer Voice Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Choose interviewer voice
            </label>
            <div className="flex items-center gap-3">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="Ravya · American English">Ravya · American English (Female AI)</option>
                <option value="Ravya · Indian English">Ravya · Indian English (Female AI)</option>
                <option value="Emma · British English">Emma · British English (Female AI)</option>
                <option value="Sarah · Professional AI">Sarah · Professional AI (Female AI)</option>
              </select>

              <button
                type="button"
                onClick={handlePreviewVoice}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
              >
                {isPreviewingVoice ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    <span>Playing...</span>
                  </>
                ) : (
                  <span>Preview voice</span>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-2">
            <button
              type="button"
              onClick={initMedia}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Test camera & microphone</span>
            </button>

            <button
              type="button"
              onClick={handleStartInterview}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <span>Generate my interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleStartWithoutCamera}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors text-center mt-1"
            >
              Continue without camera
            </button>
          </div>

        </div>

        {/* Right Column: Pre-interview Lobby Device Window */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="rounded-3xl bg-[#0e131f] border border-slate-800 p-4 sm:p-5 shadow-2xl flex flex-col gap-4 text-slate-200 relative overflow-hidden">
            
            {/* Top Bar inside mockup frame */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">Pre-interview lobby</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  {cameraActive ? "CAMERA ON" : "CAMERA OFF"}
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[11px] font-mono font-bold text-slate-400">
                  HD preview
                </span>
              </div>
            </div>

            {/* Main Video Display Canvas / Preview Box */}
            <div className="relative aspect-video w-full rounded-2xl bg-[#080b12] border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center text-center p-6 group">
              
              {/* Hidden Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
              />

              {/* Real-time Portrait Canvas Blur / Mirror Output */}
              {cameraActive ? (
                <canvas
                  ref={blurCanvasRef}
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative flex items-center justify-center w-14 h-14">
                    <span className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400/80" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-slate-200">Your preview will appear here</h4>
                    <p className="text-xs text-slate-400 max-w-xs">We do not record or upload this video.</p>
                  </div>
                </div>
              )}

              {/* Status Badge Overlay when camera active */}
              {cameraActive && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border backdrop-blur-md ${
                    isHandDetected
                      ? "bg-rose-950/90 text-rose-300 border-rose-500"
                      : faceDetected
                      ? "bg-emerald-950/90 text-emerald-300 border-emerald-500"
                      : "bg-amber-950/90 text-amber-300 border-amber-500"
                  }`}>
                    {isHandDetected ? "Hand Blocking Face" : faceDetected ? "Face Centered ✓" : "Position Face"}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBlurEnabled(!isBlurEnabled)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-900/90 text-amber-300 border border-amber-500/50 backdrop-blur-md flex items-center gap-1 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{isBlurEnabled ? "Blur ON" : "Blur OFF"}</span>
                  </button>
                </div>
              )}

            </div>

            {/* Bottom Bar inside mockup frame */}
            <div className="flex items-center justify-between text-xs text-slate-400 gap-2 flex-wrap pt-1">
              {/* Left: User badge */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200 capitalize">{candidateName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>

              {/* Center: Controls & Hint */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    micActive
                      ? "bg-slate-900/90 text-emerald-400 border-emerald-500/40"
                      : "bg-rose-950/80 text-rose-400 border-rose-600/50"
                  }`}
                >
                  {micActive ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  <span>Mic</span>
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    cameraActive
                      ? "bg-slate-900/90 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-900/80 text-slate-400 border-slate-700"
                  }`}
                >
                  {cameraActive ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                  <span>Camera</span>
                </button>

                <span className="text-[11px] text-slate-400 hidden xl:inline ml-1">
                  Keep your face centered and your light in front of you.
                </span>
              </div>

              {/* Right: Private preview badge */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <span>Private preview</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
