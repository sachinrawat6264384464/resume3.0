"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SunThemeTransition() {
  const [animatingTheme, setAnimatingTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail?.theme;
      if (newTheme === "light" || newTheme === "dark") {
        setAnimatingTheme(newTheme);
        const timer = setTimeout(() => {
          setAnimatingTheme(null);
        }, 1800);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("themeChange" as any, handleThemeChange);
    return () => {
      window.removeEventListener("themeChange" as any, handleThemeChange);
    };
  }, []);

  if (!animatingTheme) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* CINEMATIC SUNRISE TRANSITION (DARK ➔ LIGHT) */}
        {animatingTheme === "light" && (
          <motion.div
            key="sunrise-container"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* 1. OPAQUE SOLID LIGHT THEME EXPANDING WAVE (Wipes away dark page completely) */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 45, opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-40 h-40 rounded-full bg-[#F8FAFC] shadow-[0_0_200px_rgba(251,191,36,1)]"
            />

            {/* 2. SOLID 3D GOLDEN SUN DISK RISING FROM BOTTOM CENTER */}
            <motion.div
              initial={{ y: "90vh", scale: 0.4, opacity: 0 }}
              animate={{ y: "0vh", scale: 1.3, opacity: 1 }}
              exit={{ y: "-60vh", opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center z-10"
            >
              {/* Outer Radiant Solar Flare Halo */}
              <div className="w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_180px_rgba(245,158,11,1)]" />

              {/* Rotating Solar Corona Rays */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] rounded-full border-4 border-dashed border-amber-300 opacity-90"
              />

              {/* Solid Opaque Sun Core (No text shows through!) */}
              <div className="absolute w-44 h-44 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-yellow-200 via-white to-amber-100 shadow-[inset_0_0_40px_rgba(245,158,11,0.8),0_0_60px_rgba(255,255,255,1)]" />
            </motion.div>
          </motion.div>
        )}

        {/* CINEMATIC SUNSET TRANSITION (LIGHT ➔ DARK) */}
        {animatingTheme === "dark" && (
          <motion.div
            key="sunset-container"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* 1. OPAQUE SOLID NIGHT SKY CURTAIN ROLLING DOWN */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-[#050811] shadow-[0_40px_120px_rgba(5,8,17,1)]"
            />

            {/* 2. SUN SINKING INTO BOTTOM HORIZON */}
            <motion.div
              initial={{ y: "0vh", scale: 1.2, opacity: 1 }}
              animate={{ y: "90vh", scale: 0.2, opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.32, 0, 0.67, 0] }}
              className="relative flex items-center justify-center z-10"
            >
              <div className="w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_140px_rgba(234,88,12,0.9)]" />
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
