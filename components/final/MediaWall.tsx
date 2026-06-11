"use client";

import { motion } from "framer-motion";
import { Film, ImagePlus } from "lucide-react";

export function MediaWall() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">實物與 Demo</h2>
        <p className="text-muted mt-3 text-sm max-w-lg mx-auto leading-relaxed">
          組裝過程、實機照片，與實際操控演示影片。
        </p>
      </div>

      {/* Demo 影片（待補） */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl border-2 border-dashed border-border/60 aspect-video flex flex-col items-center justify-center gap-3 mb-6"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(167,139,250,0.12)", color: "#A78BFA" }}>
          <Film size={26} />
        </div>
        <p className="text-foreground font-semibold">Demo 操控演示影片</p>
        <p className="text-xs text-muted font-mono">待補上傳</p>
      </motion.div>

      {/* 實物 / 組裝照（待補） */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass rounded-2xl border-2 border-dashed border-border/60 h-48 flex flex-col items-center justify-center gap-3"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(34,211,238,0.12)", color: "#22D3EE" }}>
          <ImagePlus size={26} />
        </div>
        <p className="text-foreground font-semibold">實物 / 組裝 / 下水照片</p>
        <p className="text-xs text-muted font-mono">待補上傳</p>
      </motion.div>
    </div>
  );
}
