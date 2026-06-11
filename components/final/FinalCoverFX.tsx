"use client";

import { motion, useReducedMotion } from "framer-motion";

/** 漂浮氣泡（模組級常數＝SSR/CSR 一致，避免 hydration mismatch） */
const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (i * 53) % 100,
  size: 5 + ((i * 17) % 16),
  duration: 8 + ((i * 7) % 10),
  delay: (i * 0.9) % 7,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + ((i * 11) % 26)),
}));

/**
 * 期末封面專用的炫技動畫背景。
 * 只在封面 section 內 absolute 填滿（父層 overflow-hidden 裁切），不影響下方內容。
 */
export function FinalCoverFX() {
  const reduced = useReducedMotion();

  return (
    <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
      {/* 漂移光暈：青 / 紫 */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "52vmin", height: "52vmin", left: "8%", top: "12%",
          background: "radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%)",
        }}
        animate={reduced ? undefined : { x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: "46vmin", height: "46vmin", right: "6%", bottom: "10%",
          background: "radial-gradient(circle, rgba(167,139,250,0.20), transparent 70%)",
        }}
        animate={reduced ? undefined : { x: [0, -36, 0], y: [0, -28, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {!reduced && (
        <>
          {/* 聲納掃描：旋轉的 conic 扇形，徑向遮罩淡出 */}
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: "150vmin", height: "150vmin", x: "-50%", y: "-50%",
              background:
                "conic-gradient(from 0deg, rgba(34,211,238,0.16), transparent 22%, transparent 78%, rgba(167,139,250,0.13))",
              maskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
              WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          />

          {/* 聲納擴散環 */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 rounded-full border border-accent-cyan/30"
              style={{ width: 240, height: 240, marginLeft: -120, marginTop: -120 }}
              animate={{ scale: [0.35, 2.3], opacity: [0, 0.35, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: "easeOut" }}
            />
          ))}

          {/* 上升氣泡 */}
          {BUBBLES.map((b) => (
            <motion.span
              key={b.id}
              className="absolute rounded-full"
              style={{
                left: `${b.left}%`, top: "100%", width: b.size, height: b.size,
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55), rgba(34,211,238,0.12))",
                border: "1px solid rgba(34,211,238,0.25)",
              }}
              animate={{ y: ["0vh", "-118vh"], x: [0, b.drift, 0], opacity: [0, 0.85, 0.85, 0] }}
              transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </>
      )}

      {/* 底部漸層暈，讓標題更聚焦 */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, transparent 40%, rgba(10,14,26,0.55) 100%)" }}
      />
    </div>
  );
}
