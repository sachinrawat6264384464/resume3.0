"use client";

import { useEffect, useRef } from "react";
import { Camera, CameraOff, Video } from "lucide-react";

interface WebcamPreviewProps {
  stream: MediaStream | null;
  isActive: boolean;
  isRecording?: boolean;
  className?: string;
}

export function WebcamPreview({ stream, isActive, isRecording = false, className = "" }: WebcamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative rounded-2xl overflow-hidden glass-panel border border-white/10 bg-slate-950/80 aspect-video flex items-center justify-center ${className}`}>
      {stream && isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // mirror view
          />
          {/* Status overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-[11px] font-mono text-slate-200 tracking-wider">
              {isRecording ? "REC • ANSWERING" : "LIVE FEED"}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-slate-400 border border-white/5">
            HD 720p • 30fps
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <CameraOff className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-300">Camera Inactive</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">Enable camera permissions in the pre-check step.</p>
        </div>
      )}
    </div>
  );
}
