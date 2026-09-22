"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GripVertical, Sparkles, ExternalLink } from "lucide-react";

export function FloatingWhatsAppCommunity() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 24 }); // right: 24, bottom: 24
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("whatsapp_widget_pos");
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

      const newX = Math.max(10, Math.min(window.innerWidth - 220, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.initialY + deltaY));

      setPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
      const deltaX = dragStartRef.current.startX - e.touches[0].clientX;
      const deltaY = dragStartRef.current.startY - e.touches[0].clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 220, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStartRef.current.initialY + deltaY));

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem("whatsapp_widget_pos", JSON.stringify(pos));
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

  // Hide widget completely on admin routes or before mounting (AFTER all hooks!)
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

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.open("https://chat.whatsapp.com/LOxsACQwbGgAudjaC3qhOJ", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{ right: `${pos.x}px`, bottom: `${pos.y}px` }}
      className={`fixed z-50 select-none touch-none transition-transform duration-75 ${
        isDragging ? "scale-105 cursor-grabbing" : "cursor-grab hover:scale-105"
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Dynamic Pulse Aura Ring */}
      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 opacity-75 blur-sm animate-pulse" />

      {/* Main Movable Button */}
      <div 
        onClick={handleClick}
        className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 text-white shadow-2xl border-2 border-emerald-300/40 ring-4 ring-emerald-500/20 backdrop-blur-md transition-all group cursor-pointer"
      >
        {/* Grip Icon for Draggable Visual Hint */}
        <GripVertical className="w-3.5 h-3.5 opacity-60 text-emerald-100 group-hover:opacity-100 transition-opacity shrink-0" />

        {/* WhatsApp Icon with Pulse Badge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6 fill-current text-white drop-shadow-md"
            viewBox="0 0 24 24"
          >
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.286-1.387c1.455.794 3.09 1.213 4.783 1.214h.004c5.507 0 9.99-4.479 9.99-9.986 0-2.668-1.039-5.176-2.924-7.062-1.886-1.887-4.394-2.928-7.066-2.928zm5.836 14.167c-.244.688-1.431 1.309-1.97 1.378-.49.063-1.127.089-1.817-.132-.418-.134-.956-.312-1.636-.607-2.873-1.246-4.739-4.148-4.883-4.34-.143-.191-1.171-1.558-1.171-2.97 0-1.412.74-2.106 1.002-2.392.262-.287.571-.358.761-.358.19 0 .38.001.547.009.178.009.417-.068.653.498.244.588.832 2.03.904 2.176.072.146.12.316.024.507-.096.191-.144.31-.286.478-.143.168-.301.376-.43.506-.143.143-.292.299-.126.585.166.286.738 1.2 1.583 1.953 1.087.967 2.003 1.267 2.289 1.41.286.143.453.12.62-.072.167-.191.716-.835.907-1.121.19-.286.381-.238.643-.143.262.095 1.666.786 1.952.929.286.143.477.214.548.334.071.119.071.692-.173 1.38z"/>
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
          </span>
        </div>

        {/* Text Label & Badge */}
        <div className="flex flex-col text-left shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-xs tracking-tight uppercase drop-shadow-sm whitespace-nowrap">
              Join WhatsApp Community
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce shrink-0" />
          </div>
          <span className="text-[9.5px] font-bold text-emerald-100/90 tracking-wide font-mono whitespace-nowrap">
            {isDragging ? "📍 Dragging position..." : "⚡ Click to Join Direct Chat"}
          </span>
        </div>

        <ExternalLink className="w-3.5 h-3.5 text-emerald-100 opacity-80 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
      </div>
    </div>
  );
}
