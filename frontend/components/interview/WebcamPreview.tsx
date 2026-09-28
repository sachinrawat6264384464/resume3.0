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
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blurMode, setBlurMode] = useState<"BACKGROUND" | "FULL" | "OFF">("BACKGROUND");

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

  // Real-time Canvas Portrait Background Blur Loop
  useEffect(() => {
    if (!stream || !isActive) return;

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

        if (!maskCanvasRef.current) {
          maskCanvasRef.current = document.createElement("canvas");
        }
        const maskCanvas = maskCanvasRef.current;
        if (maskCanvas.width !== width || maskCanvas.height !== height) {
          maskCanvas.width = width;
          maskCanvas.height = height;
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (blurMode === "FULL") {
            // Full Privacy Camera Blur
            ctx.save();
            ctx.filter = "blur(24px) brightness(0.9) contrast(1.1)";
            ctx.drawImage(video, 0, 0, width, height);
            ctx.restore();
          } else if (blurMode === "BACKGROUND") {
            // 1. Draw 100% CRYSTAL CLEAR SHARP video on base canvas
            ctx.filter = "none";
            ctx.drawImage(video, 0, 0, width, height);

            // 2. Render Blurred Background layer on offscreen maskCanvas
            const bCtx = maskCanvas.getContext("2d");
            if (bCtx) {
              bCtx.clearRect(0, 0, width, height);
              bCtx.filter = "blur(22px) brightness(0.9) contrast(1.05)";
              bCtx.drawImage(video, 0, 0, width, height);
              bCtx.filter = "none";

              // 3. Cut out face & body portrait from the blurred layer (destination-out)
              bCtx.globalCompositeOperation = "destination-out";

              const centerX = width * 0.5;
              const centerY = height * 0.5;
              const rx = width * 0.32;
              const ry = height * 0.48;

              const grad = bCtx.createRadialGradient(
                centerX, centerY, rx * 0.25,
                centerX, centerY, rx
              );
              grad.addColorStop(0, "rgba(0,0,0,1)");
              grad.addColorStop(0.65, "rgba(0,0,0,0.85)");
              grad.addColorStop(0.9, "rgba(0,0,0,0.3)");
              grad.addColorStop(1, "rgba(0,0,0,0)");

              bCtx.fillStyle = grad;
              bCtx.beginPath();
              bCtx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
              bCtx.fill();

              bCtx.globalCompositeOperation = "source-over";

              // 4. Overlay blurred room background (Face area remains 100% sharp from base video!)
              ctx.drawImage(maskCanvas, 0, 0);
            }
          } else {
            // Raw Camera Feed
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
  }, [stream, isActive, blurMode]);

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
            <>
              <button
                type="button"
                onClick={() => {
                  if (blurMode === "BACKGROUND") setBlurMode("FULL");
                  else if (blurMode === "FULL") setBlurMode("OFF");
                  else setBlurMode("BACKGROUND");
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                  blurMode === "BACKGROUND"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : blurMode === "FULL"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
                title="Toggle Background Blur Mode"
              >
                {blurMode === "BACKGROUND" ? "✨ BG Blur: ON" : blurMode === "FULL" ? "🙈 Full Privacy Blur" : "📷 Blur: OFF"}
              </button>

              <button
                onClick={() => setIsFloating(!isFloating)}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF9900]/20 text-[#FF9900] border border-[#FF9900]/30 hover:bg-[#FF9900] hover:text-slate-950 transition-all"
                title="Toggle Floating Moveable Window"
              >
                {isFloating ? "Dock Window" : "Float Window 📌"}
              </button>
            </>
          )}
        </div>
      </div>

      {stream && isActive ? (
        <div className="w-full h-full relative pt-9">
          {/* Hidden input video element */}
          <video
            ref={setVideoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          
          {/* Real-time Portrait Blur Output Canvas */}
          <canvas
            ref={blurCanvasRef}
            className="w-full h-full object-cover scale-x-[-1]"
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
