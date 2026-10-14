"use client";

import React, { useEffect, useRef } from "react";

interface FireworksProps {
  trigger: boolean;
  durationMs?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  trail: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
}

const PALETTE = [
  "#10B981", // Emerald
  "#34D399", // Mint
  "#06B6D4", // Cyan
  "#38BDF8", // Sky
  "#F59E0B", // Amber Gold
  "#FBBF24", // Warm Yellow
  "#EC4899", // Pink
  "#A855F7", // Purple
];

export function Fireworks({ trigger, durationMs = 3500 }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    let animationFrameId: number;
    const startTime = performance.now();
    let isSpawning = true;

    // Launch rocket
    const launchRocket = () => {
      if (!isSpawning) return;
      const x = width * 0.15 + Math.random() * (width * 0.7);
      const targetY = height * 0.15 + Math.random() * (height * 0.35);
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      rockets.push({
        x,
        y: height,
        targetY,
        vy: -(8 + Math.random() * 5),
        color,
        exploded: false,
      });
    };

    // Explode rocket into particles
    const explode = (x: number, y: number, color: string) => {
      const particleCount = 45 + Math.floor(Math.random() * 25);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 5.5;
        const pColor = Math.random() > 0.3 ? color : PALETTE[Math.floor(Math.random() * PALETTE.length)];
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: pColor,
          size: 2 + Math.random() * 2.5,
          decay: 0.012 + Math.random() * 0.014,
          trail: [],
        });
      }
    };

    // Initial burst volley
    launchRocket();
    setTimeout(launchRocket, 180);
    setTimeout(launchRocket, 360);
    setTimeout(launchRocket, 600);
    setTimeout(launchRocket, 900);
    setTimeout(launchRocket, 1300);
    setTimeout(launchRocket, 1700);

    const interval = setInterval(() => {
      if (performance.now() - startTime < durationMs) {
        launchRocket();
      } else {
        isSpawning = false;
        clearInterval(interval);
      }
    }, 320);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;

        // Draw rocket head & tail spark
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y - r.vy * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 4) p.trail.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.98; // drag
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.lineWidth = p.size * 0.8;
          ctx.stroke();
        }

        // Draw main spark
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const active = rockets.length > 0 || particles.length > 0 || isSpawning;
      if (active) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger, durationMs]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
