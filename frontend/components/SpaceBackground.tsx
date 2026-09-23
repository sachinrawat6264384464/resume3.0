"use client";

import { useEffect, useRef } from "react";

interface Star3D {
  x: number; // offset from center
  y: number; // offset from center
  z: number; // depth
  size: number;
  alpha: number;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  alpha: number;
  decay: number;
  thickness: number;
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

    const fov = 350;
    const maxDepth = 1000;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener("resize", handleResize);

    let stars: Star3D[] = [];
    let shootingStars: ShootingStar[] = [];

    const initStars = () => {
      stars = [];
      const starCount = Math.floor((width * height) / 3500);
      for (let i = 0; i < Math.max(180, starCount); i++) {
        stars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * maxDepth,
          size: Math.random() * 0.3 + 0.1,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    };

    const createShootingStar = () => {
      // Spawn a shooting star diagonally across the top/right sky
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * (height * 0.4);
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // ~45 deg angle
      const speed = Math.random() * 5 + 7;

      shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: Math.random() * 80 + 70,
        alpha: 1.0,
        decay: Math.random() * 0.015 + 0.012,
        thickness: Math.random() * 1.5 + 1.2
      });
    };

    initStars();

    // Spawn a shooting star every 2 to 4 seconds
    let lastShootingStarTime = Date.now();
    const shootingStarInterval = 2800;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Render 3D Forward Motion Stars (Flying towards viewer)
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Move star closer to the front camera (Z decreases slowly for ultra-smooth motion)
        star.z -= 0.45;

        // Reset star if it passes the viewer screen or moves off edges
        if (star.z <= 0) {
          star.z = maxDepth;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        // 3D Perspective Projection
        const k = fov / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        // Reset if projected coordinates go way outside canvas boundaries
        if (px < -50 || px > width + 50 || py < -50 || py > height + 50) {
          star.z = maxDepth;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          continue;
        }

        // Calculate size & opacity for ultra-micro fine stars
        const distanceRatio = 1 - star.z / maxDepth;
        const currentRadius = Math.max(0.15, distanceRatio * 0.45 * star.size);
        const currentAlpha = Math.min(1.0, distanceRatio * 1.4 * star.alpha);

        // Draw 100% PURE WHITE Ultra-Micro Fine Star
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.shadowBlur = 0;
        ctx.fill();
      }

      // 2. Spawn periodic Shooting Stars ("Toot-te Taare")
      const now = Date.now();
      if (now - lastShootingStarTime > shootingStarInterval + Math.random() * 1500) {
        createShootingStar();
        lastShootingStarTime = now;
      }

      // 3. Render Shooting Stars with Glowing White Tails
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];

        s.x += s.dx;
        s.y += s.dy;
        s.alpha -= s.decay;

        if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - s.dx * (s.length / 15);
        const tailY = s.y - s.dy * (s.length / 15);

        // Draw Gradient Trail
        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${s.alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${s.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = s.thickness;
        ctx.lineCap = "round";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 255, 255, 0.95)";
        ctx.stroke();

        // Glowing Head of Shooting Star
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thickness * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
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
      {/* Pure Pitch Dark Space Layer (No color hazes) */}
      <div className="absolute inset-0 bg-[#050811] transition-colors duration-300" />

      {/* Dynamic 60fps 3D Starfield & Shooting Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-95"
      />
    </div>
  );
}
