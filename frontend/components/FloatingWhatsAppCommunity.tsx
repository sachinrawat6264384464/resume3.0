"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Headphones, X, ChevronRight } from "lucide-react";

export function FloatingWhatsAppCommunity() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 24 }); // right: 24, bottom: 24
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("floating_widget_pos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPos(parsed);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return;
      const deltaX = dragStartRef.current.startX - e.clientX;
      const deltaY = dragStartRef.current.startY - e.clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 120, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 120, dragStartRef.current.initialY + deltaY));

      setPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
      const deltaX = dragStartRef.current.startX - e.touches[0].clientX;
      const deltaY = dragStartRef.current.startY - e.touches[0].clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 120, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 120, dragStartRef.current.initialY + deltaY));

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem("floating_widget_pos", JSON.stringify(pos));
        } catch (e) {}
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, pos]);

  // Hide widget completely on admin routes or before mounting
  if (!mounted || !pathname || pathname.startsWith("/admin")) {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      initialX: pos.x,
      initialY: pos.y
    };
  };

  const toggleExpand = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsExpanded((prev) => !prev);
  };

  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open("https://chat.whatsapp.com/LOxsACQwbGgAudjaC3qhOJ", "_blank", "noopener,noreferrer");
  };

  const openZoomMeet = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open("https://zoom.us/j/cloudops-candidate-support", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{ right: `${pos.x}px`, bottom: `${pos.y}px` }}
      className={`fixed z-50 select-none touch-none transition-all duration-200 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* EXPANDED FLOATING SIDEBAR PANEL (WhatsApp + Zoom Meet) */}
      {isExpanded ? (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 border-2 border-slate-700/80 rounded-3xl p-3.5 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 min-w-[230px] animate-fadeIn relative">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800 text-white">
            <span className="text-[11px] font-mono font-black text-[#FF6B00] uppercase tracking-wider flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-[#FF6B00]" />
              LIVE SUPPORT & COMMUNITY
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Collapse Widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. WhatsApp Community Button */}
          <button
            onClick={openWhatsApp}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#075E54] text-white font-black text-xs shadow-lg hover:shadow-[#25D366]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.286-1.387c1.455.794 3.09 1.213 4.783 1.214h.004c5.507 0 9.99-4.479 9.99-9.986 0-2.668-1.039-5.176-2.924-7.062-1.886-1.887-4.394-2.928-7.066-2.928zm5.836 14.167c-.244.688-1.431 1.309-1.97 1.378-.49.063-1.127.089-1.817-.132-.418-.134-.956-.312-1.636-.607-2.873-1.246-4.739-4.148-4.883-4.34-.143-.191-1.171-1.558-1.171-2.97 0-1.412.74-2.106 1.002-2.392.262-.287.571-.358.761-.358.19 0 .38.001.547.009.178.009.417-.068.653.498.244.588.832 2.03.904 2.176.072.146.12.316.024.507-.096.191-.144.31-.286.478-.143.168-.301.376-.43.506-.143.143-.292.299-.126.585.166.286.738 1.2 1.583 1.953 1.087.967 2.003 1.267 2.289 1.41.286.143.453.12.62-.072.167-.191.716-.835.907-1.121.19-.286.381-.238.643-.143.262.095 1.666.786 1.952.929.286.143.477.214.548.334.071.119.071.692-.173 1.38z"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black">WhatsApp Community</span>
                <span className="text-[9px] font-mono text-emerald-200">Join Active Candidate Group</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 2. Zoom Meet Support Button */}
          <button
            onClick={openZoomMeet}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#2D8CFF] via-[#0B5CFF] to-[#0042B3] text-white font-black text-xs shadow-lg hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M4.5 4.5A2.5 2.5 0 002 7v10a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5v-2.172l3.293 3.293c.63.63 1.707.184 1.707-.707V6.586c0-.891-1.077-1.337-1.707-.707L17 9.172V7A2.5 2.5 0 0014.5 4.5h-10z"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black">Zoom Live Support</span>
                <span className="text-[9px] font-mono text-blue-200">Connect to Live Room</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>
      ) : (
        /* COLLAPSED TRIGGER BUTTON */
        <div
          onClick={toggleExpand}
          className="relative group cursor-pointer"
          title="Click to Open WhatsApp & Zoom Support Bar"
        >
          {/* Dynamic Dual Pulse Ring */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#25D366] via-cyan-400 to-[#2D8CFF] opacity-85 blur-sm animate-pulse" />

          {/* Trigger Circle */}
          <div className="relative w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-slate-900 border-2 border-white/80 shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
            {/* Dual Logos (WhatsApp + Zoom) */}
            <div className="flex items-center justify-center -space-x-1">
              <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.286-1.387c1.455.794 3.09 1.213 4.783 1.214h.004c5.507 0 9.99-4.479 9.99-9.986 0-2.668-1.039-5.176-2.924-7.062-1.886-1.887-4.394-2.928-7.066-2.928zm5.836 14.167c-.244.688-1.431 1.309-1.97 1.378-.49.063-1.127.089-1.817-.132-.418-.134-.956-.312-1.636-.607-2.873-1.246-4.739-4.148-4.883-4.34-.143-.191-1.171-1.558-1.171-2.97 0-1.412.74-2.106 1.002-2.392.262-.287.571-.358.761-.358.19 0 .38.001.547.009.178.009.417-.068.653.498.244.588.832 2.03.904 2.176.072.146.12.316.024.507-.096.191-.144.31-.286.478-.143.168-.301.376-.43.506-.143.143-.292.299-.126.585.166.286.738 1.2 1.583 1.953 1.087.967 2.003 1.267 2.289 1.41.286.143.453.12.62-.072.167-.191.716-.835.907-1.121.19-.286.381-.238.643-.143.262.095 1.666.786 1.952.929.286.143.477.214.548.334.071.119.071.692-.173 1.38z"/>
                </svg>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#2D8CFF] flex items-center justify-center shadow-md border border-slate-900">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M4.5 4.5A2.5 2.5 0 002 7v10a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5v-2.172l3.293 3.293c.63.63 1.707.184 1.707-.707V6.586c0-.891-1.077-1.337-1.707-.707L17 9.172V7A2.5 2.5 0 0014.5 4.5h-10z"/>
                </svg>
              </div>
            </div>

            {/* Pulse Green Badge Dot */}
            <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-90"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25D366] border-2 border-white shadow-md"></span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
