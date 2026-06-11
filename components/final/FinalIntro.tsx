"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";

export function FinalIntro() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Logo size={72} showText={false} />
      <div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text leading-tight">
          只是一台潛水艇
        </h1>
        <p className="text-muted text-lg mt-3 font-mono">Electronics II · 期末報告</p>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="mt-8 flex flex-col items-center gap-1"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-accent-cyan/50" />
        <p className="text-xs text-muted/40 font-mono">往下滑</p>
      </motion.div>
    </div>
  );
}
