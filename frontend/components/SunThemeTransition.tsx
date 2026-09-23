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
        // Extended timer for majestic slow-motion sunrise & sunset transition
        const timer = setTimeout(() => {
          setAnimatingTheme(null);
        }, 3200);
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
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* SLOW MOTION SUNRISE LIGHT TRANSITION */}
        {animatingTheme === "light" && (
          <motion.div
            key="sunrise-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 2.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Slow Expanding Solar Light Flare Circle (brings Light Theme background) */}
            <motion.div
              initial={{ scale: 0, opacity: 0.2 }}
              animate={{ scale: 40, opacity: 1 }}
              transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-44 h-44 rounded-full bg-[#F8FAFC] shadow-[0_0_180px_rgba(251,191,36,0.9)]"
            />

            {/* Majestic Slow Rising Glowing Golden 3D Sun */}
            <motion.div
              initial={{ y: "85vh", scale: 0.3, opacity: 0 }}
              animate={{ y: "0vh", scale: 1.4, opacity: 1 }}
              exit={{ y: "-65vh", opacity: 0 }}
              transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center"
            >
              {/* Sun Outer Solar Flare Glow */}
              <div className="w-52 h-52 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_180px_rgba(251,146,60,1)] animate-pulse" />
              
              {/* Spinning Solar Corona Rays */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-25px] rounded-full border-4 border-dashed border-amber-300/70 opacity-80"
              />

              {/* Sun Core Light */}
              <div className="absolute w-40 h-40 sm:w-64 sm:h-64 rounded-full bg-white/95 shadow-[inset_0_0_35px_rgba(255,255,255,1)]" />
            </motion.div>
          </motion.div>
        )}

        {/* SLOW MOTION SUNSET DARKNESS VEIL TRANSITION */}
        {animatingTheme === "dark" && (
          <motion.div
            key="sunset-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 2.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Top-down Slow Rolling Pitch-Black Night Sky Curtain */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-[#050811] shadow-[0_40px_120px_rgba(5,8,17,1)]"
            />

            {/* Descending Sun Sinking into Bottom Horizon */}
            <motion.div
              initial={{ y: "0vh", scale: 1.2, opacity: 1 }}
              animate={{ y: "85vh", scale: 0.2, opacity: 0 }}
              transition={{ duration: 2.6, ease: [0.32, 0, 0.67, 0] }}
              className="relative flex items-center justify-center z-10"
            >
              <div className="w-52 h-52 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_140px_rgba(234,88,12,0.8)]" />
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
