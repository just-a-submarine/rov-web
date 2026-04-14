"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const segments = [
  {
    id: "front",
    label: "前端蓋",
    sub: "PP 現成品",
    detail: "純封閉端蓋，無開孔。以自融膠帶 + 環氧樹脂密封。",
    color: "#6EE7B7",
    width: "22%",
    rx: "50%",
  },
  {
    id: "body",
    label: "中段艇體",
    sub: "PETG · 3D 列印",
    detail: "Bambu Lab A1 一體成型。OD 90mm × 250mm，壁厚 1.5mm。裝載所有電子元件。",
    color: "#22D3EE",
    width: "56%",
    rx: "4px",
  },
  {
    id: "rear",
    label: "後端蓋",
    sub: "PP 現成品",
    detail: "純封閉端蓋，無開孔。同前端密封工序。",
    color: "#A78BFA",
    width: "22%",
    rx: "50%",
  },
];

const specs = [
  { k: "外徑", v: "90 mm" },
  { k: "總長", v: "250 mm" },
  { k: "壁厚", v: "1.5 mm" },
  { k: "材料", v: "PETG HF（灰）" },
];

export function HullDiagram() {
  const [active, setActive] = useState<string | null>(null);
  const activeSegment = segments.find((s) => s.id === active);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Hull</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">三段式艇體</h2>
      </div>

      {/* Hull visual */}
      <div className="w-full max-w-2xl flex items-center gap-1 h-28">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.id}
            className="h-full flex flex-col items-center justify-center cursor-pointer relative"
            style={{ width: seg.width }}
            whileHover={{ scale: 1.04, y: -4 }}
            onClick={() => setActive(active === seg.id ? null : seg.id)}
          >
            <div
              className="w-full h-full flex items-center justify-center transition-all duration-200"
              style={{
                background: active === seg.id ? `${seg.color}25` : `${seg.color}12`,
                border: `2px solid ${active === seg.id ? seg.color : seg.color + "60"}`,
                borderRadius: i === 0 ? "50% / 50% 0 0 50%" : i === 2 ? "0 50% 50% 0 / 0 50% 50% 0" : "4px",
                boxShadow: active === seg.id ? `0 0 24px ${seg.color}40` : "none",
              }}
            >
              <div className="text-center">
                <p className="text-xs font-bold" style={{ color: seg.color }}>{seg.label}</p>
                <p className="text-xs text-muted mt-0.5 font-mono hidden sm:block">{seg.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail card */}
      {activeSegment && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl px-5 py-4 max-w-sm text-sm"
          style={{ borderColor: activeSegment.color + "40" }}
        >
          <p className="font-semibold" style={{ color: activeSegment.color }}>{activeSegment.label}</p>
          <p className="text-muted text-xs mt-1 leading-relaxed">{activeSegment.detail}</p>
        </motion.div>
      )}

      {/* Spec table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl">
        {specs.map((s) => (
          <div key={s.k} className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted font-mono">{s.k}</p>
            <p className="text-sm font-bold text-accent-cyan mt-1 font-mono">{s.v}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted font-mono">← 點選各段查看細節</p>
    </div>
  );
}
