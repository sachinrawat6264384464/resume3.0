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

    // Clean, crisp space star colors: Pure white & soft icy silver-blue (No orange/purple hues)
    const starColors = [
      "rgba(255, 255, 255, ",
      "rgba(255, 255, 255, ",
      "rgba(255, 255, 255, ",
      "rgba(241, 245, 249, ",
      "rgba(224, 242, 254, ",
      "rgba(186, 230, 253, "
    ];

    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      // Create ~130 dynamic floating space stars
      const starCount = Math.floor((width * height) / 8500);
      for (let i = 0; i < Math.max(110, starCount); i++) {
        const baseAlpha = Math.random() * 0.7 + 0.3;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.5,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
          speedY: -(Math.random() * 0.3 + 0.08), // Floating upwards like cosmic space dust
          speedX: (Math.random() * 0.12 - 0.06), // Gentle sideways drift
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

        // Draw crisp particle star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${Math.max(0.1, Math.min(1, star.alpha))})`;
        if (star.size > 1.4) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        } else {
          ctx.shadowBlur = 0;
        }
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden dark:block">
      {/* Pure Deep Pitch Dark Space Layer (No colorful hazes/nebulae) */}
      <div className="absolute inset-0 bg-[#050811] transition-colors duration-300" />

      {/* Dynamic 60fps Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-95"
      />
    </div>
  );
}
