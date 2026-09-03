"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, Move, Pin, RefreshCw, Maximize2, ShieldCheck } from "lucide-react";

interface WebcamPreviewProps {
  stream: MediaStream | null;
  isActive: boolean;
  isRecording?: boolean;
  onEnableCamera?: () => void;
  className?: string;
}

export function WebcamPreview({ 
  stream, 
  isActive, 
  isRecording = false, 
  onEnableCamera,
  className = "" 
}: WebcamPreviewProps) {
  const [isFloating, setIsFloating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Callback Ref ensures video plays immediately when element mounts or stream arrives
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
      node.play().catch((err) => console.warn("Video auto-play notice:", err));
    }
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.warn("Video play notice:", err));
    }
    return () => {
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
      }
    };
  }, [stream]);

  // Dragging Handlers for Moveable Widget
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={isFloating ? { transform: `translate3d(${position.x}px, ${position.y}px, 0)` } : {}}
      className={`relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#232F3E] aspect-video flex items-center justify-center shadow-2xl transition-shadow ${
        isFloating ? "fixed z-50 top-24 right-8 w-80 shadow-2xl ring-4 ring-[#FF9900]/40 cursor-grab active:cursor-grabbing" : ""
      } ${className}`}
    >
      {/* Moveable Drag Handle Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-0 right-0 h-9 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-20 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
          <Move className="w-3.5 h-3.5 text-[#FF9900]" />
          <span>⠿ Drag & Move Camera</span>
        </div>

        <div className="flex items-center gap-2">
          {stream && (
            <button
              onClick={() => setIsFloating(!isFloating)}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30 hover:bg-[#FF9900] hover:text-slate-950 transition-all"
              title="Toggle Floating Moveable Window"
            >
              {isFloating ? "Dock Window" : "Float Window 📌"}
            </button>
          )}
        </div>
      </div>

      {stream && isActive ? (
        <div className="w-full h-full relative pt-9">
          <video
            ref={setVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]" // mirror view
          />
          
          {/* Status overlay */}
          <div className="absolute top-12 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/20 backdrop-blur-md z-10">
            <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              {isRecording ? "REC • LIVE ANSWER" : "CAMERA LIVE"}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-lg bg-slate-900/80 text-[10px] font-mono font-bold text-slate-300 border border-white/10 z-10">
            HD 720p • 30fps
          </div>
        </div>
      ) : stream && !isActive ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-3 pt-10">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <CameraOff className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-black text-white">Webcam Video Paused</p>
            <p className="text-xs text-slate-400 max-w-xs font-medium">
              Camera is turned off for privacy. Click "Camera OFF" in the top bar to resume video stream.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-3 pt-10">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9900]/10 border border-[#FF9900]/30 flex items-center justify-center text-[#FF9900]">
            <CameraOff className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-black text-white">Camera Preview Pending</p>
            <p className="text-xs text-slate-400 max-w-xs font-medium">
              Click 'Allow' in Chrome permission popup or tap below to activate webcam.
            </p>
          </div>
          {onEnableCamera && (
            <button
              onClick={onEnableCamera}
              className="px-4 py-2.5 rounded-xl font-black text-xs text-slate-950 bg-gradient-to-r from-[#FF9900] via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-md shadow-[#FF9900]/20 flex items-center gap-2 transition-all mt-1"
            >
              <Camera className="w-4 h-4" />
              <span>Enable Camera & Mic Stream 📷</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
