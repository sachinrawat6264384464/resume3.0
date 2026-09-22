"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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

      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + deltaY));

      setPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragStartRef.current || e.touches.length !== 1) return;
      const deltaX = dragStartRef.current.startX - e.touches[0].clientX;
      const deltaY = dragStartRef.current.startY - e.touches[0].clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMoved(true);
      }

      const newX = Math.max(10, Math.min(window.innerWidth - 80, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + deltaY));

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

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    window.open("https://chat.whatsapp.com/LOxsACQwbGgAudjaC3qhOJ", "_blank", "noopener,noreferrer");
  };

  const isNearLeftEdge = typeof window !== "undefined" ? pos.x > window.innerWidth / 2 : false;

  return (
    <div
      style={{ right: `${pos.x}px`, bottom: `${pos.y}px` }}
      className={`fixed z-50 select-none touch-none transition-transform duration-75 group ${
        isDragging ? "scale-110 cursor-grabbing" : "cursor-grab hover:scale-110"
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Dynamic Pulse Aura Ring */}
      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#128C7E] opacity-80 blur-sm animate-pulse" />

      {/* Floating Hover Tooltip - Dynamically positioned left or right based on button position */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs font-black py-2 px-4 rounded-2xl shadow-2xl border border-[#25D366]/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-2 shrink-0 z-50 ${
          isNearLeftEdge ? "left-20" : "right-20"
        }`}
      >
        <span className="text-[#25D366] text-sm">💬</span>
        <span>Join WhatsApp Community 🚀</span>
        <div 
          className={`w-2.5 h-2.5 bg-slate-900 rotate-45 absolute top-1/2 -translate-y-1/2 ${
            isNearLeftEdge 
              ? "-left-1.2 border-l border-b border-[#25D366]/50" 
              : "-right-1.2 border-r border-t border-[#25D366]/50"
          }`} 
        />
      </div>

      {/* Round Circular Movable Button */}
      <div 
        onClick={handleClick}
        className="relative w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] text-white shadow-2xl border-2 border-emerald-100/60 ring-4 ring-[#25D366]/30 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:shadow-[#25D366]/40"
        title="Join WhatsApp Community"
      >
        {/* SVG WhatsApp Icon */}
        <svg
          className="w-9 h-9 sm:w-10 sm:h-10 fill-current text-white drop-shadow-lg transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
        >
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.982l-1.413 5.163 5.286-1.387c1.455.794 3.09 1.213 4.783 1.214h.004c5.507 0 9.99-4.479 9.99-9.986 0-2.668-1.039-5.176-2.924-7.062-1.886-1.887-4.394-2.928-7.066-2.928zm5.836 14.167c-.244.688-1.431 1.309-1.97 1.378-.49.063-1.127.089-1.817-.132-.418-.134-.956-.312-1.636-.607-2.873-1.246-4.739-4.148-4.883-4.34-.143-.191-1.171-1.558-1.171-2.97 0-1.412.74-2.106 1.002-2.392.262-.287.571-.358.761-.358.19 0 .38.001.547.009.178.009.417-.068.653.498.244.588.832 2.03.904 2.176.072.146.12.316.024.507-.096.191-.144.31-.286.478-.143.168-.301.376-.43.506-.143.143-.292.299-.126.585.166.286.738 1.2 1.583 1.953 1.087.967 2.003 1.267 2.289 1.41.286.143.453.12.62-.072.167-.191.716-.835.907-1.121.19-.286.381-.238.643-.143.262.095 1.666.786 1.952.929.286.143.477.214.548.334.071.119.071.692-.173 1.38z"/>
        </svg>

        {/* Pulse Green Badge Dot */}
        <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-90"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25D366] border-2 border-white shadow-md"></span>
        </span>
      </div>
    </div>
  );
}
