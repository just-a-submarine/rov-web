"use client";

import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  t: number; // timestamp
}

interface Ripple {
  x: number;
  y: number;
  t: number;
}

const TRAIL_DURATION = 500; // ms — trail fades over this period
const RIPPLE_DURATION = 500; // ms
const RIPPLE_MAX_RADIUS = 28;
const TRAIL_SPACING = 10; // px — minimum distance before adding a new point
const TRAIL_RADIUS = 3; // px — dot size
const TRAIL_MAX_ALPHA = 0.35; // subtle

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastTrailPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Add trail point (throttled by distance) ──────────────────────
    const addTrailPoint = (x: number, y: number) => {
      const last = lastTrailPosRef.current;
      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (Math.sqrt(dx * dx + dy * dy) < TRAIL_SPACING) return;
      }
      lastTrailPosRef.current = { x, y };
      trailRef.current.push({ x, y, t: performance.now() });
    };

    // ── Mouse handlers ────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => addTrailPoint(e.clientX, e.clientY);
    const onClick = (e: MouseEvent) =>
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });

    // ── Touch handlers ────────────────────────────────────────────────
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) addTrailPoint(t.clientX, t.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) ripplesRef.current.push({ x: t.clientX, y: t.clientY, t: performance.now() });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    // ── RAF render loop ───────────────────────────────────────────────
    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Remove expired trail points
      trailRef.current = trailRef.current.filter(
        (p) => now - p.t < TRAIL_DURATION
      );

      // Draw trail dots
      trailRef.current.forEach((p, i) => {
        const age = now - p.t;
        const progress = age / TRAIL_DURATION; // 0 → 1
        const alpha = TRAIL_MAX_ALPHA * (1 - progress);
        const r = TRAIL_RADIUS * (1 - progress * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(r, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`; // accent-cyan
        ctx.fill();
      });

      // Remove expired ripples
      ripplesRef.current = ripplesRef.current.filter(
        (r) => now - r.t < RIPPLE_DURATION
      );

      // Draw ripples
      ripplesRef.current.forEach((rip) => {
        const age = now - rip.t;
        const progress = age / RIPPLE_DURATION; // 0 → 1
        const radius = RIPPLE_MAX_RADIUS * progress;
        const alpha = 0.5 * (1 - progress);

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9990 }}
    />
  );
}
