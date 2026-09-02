"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Camera, Mic, Volume2, ShieldCheck, CheckCircle2, 
  AlertCircle, ArrowRight, Video, Lock, Info 
} from "lucide-react";
import { useDeviceCheckStore } from "@/lib/store";
import { AudioVisualizer } from "@/lib/media-recorder";

interface DeviceCheckModalProps {
  onReadyToStart: (stream: MediaStream) => void;
  targetRole?: string;
  templateTitle?: string;
}

export function DeviceCheckModal({ onReadyToStart, targetRole = "CloudOps Engineer", templateTitle = "Technical Assessment" }: DeviceCheckModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [speakerSuccess, setSpeakerSuccess] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const visualizerRef = useRef<AudioVisualizer | null>(null);

  // Initialize Media Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initMedia() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        activeStream = s;
        setStream(s);
        setCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }

        // Init visualizer
        const viz = new AudioVisualizer();
        viz.init(s);
        visualizerRef.current = viz;

        const interval = setInterval(() => {
          if (visualizerRef.current) {
            setMicVolume(visualizerRef.current.getVolumeLevel());
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
      if (visualizerRef.current) {
        visualizerRef.current.close();
      }
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

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

  const isComplete = cameraActive && micVolume >= 0 && consent;

  const handleStart = () => {
    if (stream && isComplete) {
      onReadyToStart(stream);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel-glow border border-white/10 flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Pre-Interview Hardware Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System & Device Check: {templateTitle}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Verify your camera, microphone, and audio settings before commencing the AI assessment.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Camera Preview on Left, Device Checks on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Camera Preview */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden glass-panel border border-white/10 bg-slate-950 aspect-video flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <Camera className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
                <span className="text-xs">Initializing Webcam...</span>
              </div>
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/10 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CAMERA READY</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 text-center">Ensure your face is well-lit and clearly visible within the frame.</span>
        </div>

        {/* Device Controls */}
        <div className="md:col-span-5 flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-3">
            {/* Camera Check Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl glass-panel border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Webcam Stream</div>
                  <div className="text-[11px] text-slate-400">HD 720p resolution</div>
                </div>
              </div>
              {cameraActive ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs text-slate-500">Waiting...</span>
              )}
            </div>

            {/* Microphone Check Card */}
            <div className="flex flex-col gap-2 p-3.5 rounded-xl glass-panel border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Microphone Input</div>
                    <div className="text-[11px] text-slate-400">Speak to test level</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-cyan-400">{micVolume}%</span>
              </div>
              {/* Audio meter */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${Math.min(100, micVolume * 1.5)}%` }}
                />
              </div>
            </div>

            {/* Speaker Check Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl glass-panel border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">AI Voice Output</div>
                  <div className="text-[11px] text-slate-400">Audio playback test</div>
                </div>
              </div>
              <button
                onClick={testSpeaker}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  speakerSuccess
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {speakerSuccess ? "Tested ✓" : "Play Chime"}
              </button>
            </div>
          </div>

          {/* Privacy & Recording Consent Disclosure */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Recording & Privacy Disclosure:</strong> Audio and video are temporarily recorded for AI technical evaluation and instructor review. Recordings are stored securely and automatically purged after 90 days.
              </div>
            </div>

            <label className="flex items-center gap-2.5 mt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
              />
              <span className="text-xs font-medium text-white">
                I agree to the interview recording & privacy policy.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Stage 1 unlocks immediately upon start • 80% pass threshold required</span>
        </div>

        <button
          onClick={handleStart}
          disabled={!isComplete}
          className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Begin Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
