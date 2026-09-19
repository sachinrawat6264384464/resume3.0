"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Determine initial theme from document class or localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(savedTheme);
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }

    // Listen for theme changes from other components
    const handleCustomThemeChange = (e: CustomEvent) => {
      if (e.detail?.theme) {
        setTheme(e.detail.theme);
      }
    };

    window.addEventListener("themeChange" as any, handleCustomThemeChange);
    return () => {
      window.removeEventListener("themeChange" as any, handleCustomThemeChange);
    };
  }, []);

  const toggleTheme = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const nextTheme = isCurrentlyDark ? "light" : "dark";

    setTheme(nextTheme);
    
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (err) {
      console.error(err);
    }

    if (nextTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Dispatch event to sync any other ThemeToggle component on screen
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme: nextTheme } }));
  };

  // Render a fully styled button even before hydration to avoid empty box placeholder
  const activeTheme = mounted ? theme : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer select-none relative z-50 shrink-0"
      title={activeTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label="Toggle Theme"
    >
      {activeTheme === "light" ? (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  );
}



