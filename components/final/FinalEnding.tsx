"use client";

import { motion, useReducedMotion } from "framer-motion";

const CHARS = ["謝", "謝", "收", "看"];

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: (i * 61 + 5) % 96,
  size: 4 + ((i * 13) % 10),
  duration: 10 + ((i * 7) % 8),
  delay: (i * 1.1) % 8,
  drift: (i % 2 === 0 ? 1 : -1) * (6 + ((i * 9) % 20)),
}));

export function FinalEnding() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden px-4 py-24">
      {/* 背景光暈 */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: "45vmin", height: "45vmin", left: "8%", bottom: "20%",
          background: "radial-gradient(circle, rgba(34,211,238,0.18), transparent 70%)",
        }}
        animate={reduced ? undefined : { x: [0, 28, 0], y: [0, -18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: "40vmin", height: "40vmin", right: "6%", top: "18%",
          background: "radial-gradient(circle, rgba(167,139,250,0.16), transparent 70%)",
        }}
        animate={reduced ? undefined : { x: [0, -22, 0], y: [0, 22, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 上升氣泡 */}
      {!reduced && BUBBLES.map((b) => (
        <motion.span
          key={b.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${b.left}%`, bottom: "-5%",
            width: b.size, height: b.size,
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), rgba(34,211,238,0.1))",
            border: "1px solid rgba(34,211,238,0.22)",
          }}
          animate={{ y: [0, "-108vh"], x: [0, b.drift, 0], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* 主體 */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        {/* 逐字出場 */}
        <div className="flex gap-2 sm:gap-4">
          {CHARS.map((ch, i) => (
            <motion.span
              key={i}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black gradient-text select-none"
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </div>

        {/* 副標 */}
        <motion.p
          className="text-muted font-mono text-sm sm:text-base tracking-widest"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Electronics II · 只是一台潛水艇
        </motion.p>

        {/* 聲納脈衝 */}
        <motion.div
          className="flex flex-col items-center gap-3 mt-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-accent-cyan/50 to-transparent" />
          <div className="relative w-8 h-8 flex items-center justify-center">
            {!reduced && [0, 0.9].map((d, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-accent-cyan/40"
                animate={{ scale: [1, 2.8], opacity: [0.55, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: d }}
              />
            ))}
            <div className="w-2 h-2 rounded-full bg-accent-cyan/70" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
