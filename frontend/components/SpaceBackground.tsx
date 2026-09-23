"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  speedY: number;
  speedX: number;
  color: string;
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize);

    // Star Colors palette (white, cyan blue, subtle orange accent, soft purple)
    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(255, 255, 255, ",
      "rgba(255, 255, 255, ",
      "rgba(96, 165, 250, ",   // Cyan-blue tint
      "rgba(255, 165, 0, ",     // Orange tint
      "rgba(168, 85, 247, "     // Soft purple tint
    ];

    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      // Create ~120 dynamic floating space stars
      const starCount = Math.floor((width * height) / 9000);
      for (let i = 0; i < Math.max(100, starCount); i++) {
        const baseAlpha = Math.random() * 0.7 + 0.3;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 0.6,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          speedY: -(Math.random() * 0.35 + 0.08), // Floating upwards like cosmic space dust
          speedX: (Math.random() * 0.15 - 0.075), // Gentle sideways drift
          color: starColors[Math.floor(Math.random() * starColors.length)]
        });
      }
    };

    initStars();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render each floating space star
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Update Position (continuous loop)
        star.y += star.speedY;
        star.x += star.speedX;

        // Wrap around screen boundaries continuously
        if (star.y < -10) {
          star.y = height + 10;
          star.x = Math.random() * width;
        }
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;

        // Update Twinkle effect
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Draw glowing particle star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${Math.max(0.1, Math.min(1, star.alpha))})`;
        ctx.shadowBlur = star.size > 1.5 ? 8 : 0;
        ctx.shadowColor = star.color.replace("rgba", "rgb").replace(", ", "(").split("(").slice(0, 2).join("(") + ")";
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Space Background Layer with subtle cosmic radial glows */}
      <div className="absolute inset-0 bg-[#070b14] dark:bg-[#070b14] transition-colors duration-300">
        {/* Soft Radial Cosmic Nebulae Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 dark:bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 dark:bg-purple-600/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-[#FF6B00]/10 dark:bg-[#FF6B00]/15 blur-[140px] pointer-events-none" />
      </div>

      {/* Dynamic 60fps Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-85 dark:opacity-95"
      />
    </div>
  );
}
