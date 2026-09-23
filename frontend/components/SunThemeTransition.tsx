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
        }, 2400);
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
        
        {/* RISING WHITE HORIZON WAVE WITH SUN (DARK ➔ LIGHT) */}
        {animatingTheme === "light" && (
          <motion.div
            key="sunrise-rising-wave"
            initial={{ y: "100%" }}
            animate={{ y: "-100%" }}
            transition={{ duration: 2.2, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-[#F1F5F9] shadow-[0_-40px_100px_rgba(251,191,36,0.5)] flex flex-col items-center justify-start pointer-events-none"
          >
            {/* Glowing Sun Positioned at the Leading Top Edge of the Rising Wave */}
            <div className="relative -mt-24 sm:-mt-32 flex items-center justify-center">
              
              {/* Outer Radiant Solar Flare Halo */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_140px_rgba(245,158,11,1)]" />

              {/* Rotating Solar Corona Rays */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] rounded-full border-4 border-dashed border-amber-300 opacity-90"
              />

              {/* Solid 3D Glowing Sun Core */}
              <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-yellow-200 via-white to-amber-100 shadow-[inset_0_0_30px_rgba(245,158,11,0.8),0_0_50px_rgba(255,255,255,1)]" />

            </div>
          </motion.div>
        )}

        {/* FALLING NIGHT SKY CURTAIN WITH SINKING SUN (LIGHT ➔ DARK) */}
        {animatingTheme === "dark" && (
          <motion.div
            key="sunset-falling-wave"
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 2.2, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 bg-gradient-to-b from-[#050811] via-[#070b14] to-[#090e1a] shadow-[0_40px_100px_rgba(5,8,17,0.9)] flex flex-col items-center justify-end pointer-events-none"
          >
            {/* Sun Sinking at Bottom Edge of Night Sky Curtain */}
            <div className="relative -mb-24 sm:-mb-32 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 shadow-[0_0_120px_rgba(234,88,12,0.9)]" />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
