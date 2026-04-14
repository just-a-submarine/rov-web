"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { BubbleField } from "@/components/home/BubbleField";
import { NavGrid } from "@/components/home/NavGrid";
import { QRCorner } from "@/components/nav/QRCorner";

export default function HomePage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* Animated particle background */}
      <BubbleField />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,211,238,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="flex flex-col items-center gap-10 w-full py-16 px-4">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <Logo size={56} showText={false} />
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text leading-tight tracking-tight">
              只是一台潛水艇
            </h1>
            <p className="text-muted text-sm sm:text-base mt-2 font-mono tracking-widest uppercase">
              Just a Submarine · ROV Project
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mt-1">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent-cyan opacity-60" />
            <span className="text-xs text-muted font-mono">Electronics II</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent-violet opacity-60" />
          </div>
        </motion.div>

        {/* Navigation grid */}
        <NavGrid />

      </div>

      {/* QR Code 固定右下角 — 掃描可分享首頁 */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-1">
        <QRCorner />
        <span className="text-xs text-muted/40 font-mono hidden sm:block">此頁 QR</span>
      </div>
    </div>
  );
}
