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
        // Reset animation state after transition completes
        const timer = setTimeout(() => {
          setAnimatingTheme(null);
        }, 1500);
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
        
        {/* SUNRISE LIGHT TRANSITION */}
        {animatingTheme === "light" && (
          <motion.div
            key="sunrise-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Expanding Solar Light Flare Circle (brings Light Theme background) */}
            <motion.div
              initial={{ scale: 0, opacity: 0.3 }}
              animate={{ scale: 35, opacity: 1 }}
              transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-40 h-40 rounded-full bg-[#F8FAFC] shadow-[0_0_150px_rgba(251,191,36,0.8)]"
            />

            {/* Rising Glowing Golden 3D Sun */}
            <motion.div
              initial={{ y: "80vh", scale: 0.4, opacity: 0 }}
              animate={{ y: "0vh", scale: 1.3, opacity: 1 }}
              exit={{ y: "-60vh", opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center"
            >
              {/* Sun Outer Solar Flare Glow */}
              <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_160px_rgba(251,146,60,1)] animate-pulse" />
              
              {/* Spinning Solar Corona Rays */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] rounded-full border-4 border-dashed border-amber-300/60 opacity-80"
              />

              {/* Sun Core Light */}
              <div className="absolute w-36 h-36 sm:w-56 sm:h-56 rounded-full bg-white/90 shadow-[inset_0_0_30px_rgba(255,255,255,1)]" />
            </motion.div>
          </motion.div>
        )}

        {/* SUNSET DARKNESS VEIL TRANSITION */}
        {animatingTheme === "dark" && (
          <motion.div
            key="sunset-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Top-down Rolling Pitch-Black Night Sky Curtain */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 bg-[#050811] shadow-[0_30px_100px_rgba(5,8,17,1)]"
            />

            {/* Descending Sun Sinking into Bottom Horizon */}
            <motion.div
              initial={{ y: "0vh", scale: 1.1, opacity: 1 }}
              animate={{ y: "80vh", scale: 0.3, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.32, 0, 0.67, 0] }}
              className="relative flex items-center justify-center z-10"
            >
              <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_120px_rgba(234,88,12,0.8)]" />
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
