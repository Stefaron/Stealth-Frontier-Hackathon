"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
  noiseSeed: number;
  scale: number;
}

const COUNT = 80;
const COLOR = "16, 225, 255";

function snoise(x: number, y: number) {
  const dot = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (dot - Math.floor(dot)) * 2 - 1;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * W * 1.4,
      y: (Math.random() - 0.5) * H * 1.4,
      z: Math.random() * 500 + 50,
      size: Math.random() * 2.4 + 0.6,
      speed: Math.random() * 0.18 + 0.04,
      noiseSeed: Math.random() * 100,
      scale: Math.random() * 80 + 30,
    }));

    let raf = 0;
    let t0 = performance.now();

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        const dx = snoise(p.noiseSeed, t * p.speed) * p.scale;
        const dy = snoise(p.noiseSeed + 13.7, t * p.speed) * p.scale;
        const px = W / 2 + p.x + dx;
        const py = H / 2 + p.y + dy;
        const r = p.size * (300 / p.z);
        if (px < -50 || px > W + 50 || py < -50 || py > H + 50) continue;

        const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 6);
        grd.addColorStop(0, `rgba(${COLOR}, 0.8)`);
        grd.addColorStop(0.4, `rgba(${COLOR}, 0.18)`);
        grd.addColorStop(1, `rgba(${COLOR}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, r * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" />;
}
