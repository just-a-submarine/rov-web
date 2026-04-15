"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const sensors = [
  { name: "QMC5883P", role: "電子羅盤",   color: "#22D3EE", icon: "🧭"  },
  { name: "MS5837",   role: "水壓感測器",  color: "#6EE7B7", icon: "🌊"  },
  { name: "INA260",   role: "電流計",      color: "#F9A8D4", icon: "⚡"   },
  { name: "MCP23017", role: "IO 擴展",     color: "#A78BFA", icon: "🔌"  },
  { name: "Neo-M8N",  role: "GPS（浮標）", color: "#FBBF24", icon: "🛰️" },
  { name: "OV5640",   role: "攝影機",      color: "#6EE7B7", icon: "📷"  },
];

export function SensorsSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">On Board</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">感測器</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 w-full max-w-3xl">
        {sensors.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            viewport={{ once: true }}
            onHoverStart={() => setHovered(s.name)}
            onHoverEnd={() => setHovered(null)}
          >
            <motion.div
              className="glass rounded-xl p-3 text-center w-full cursor-pointer"
              whileHover={{ scale: 1.05 }}
              animate={{
                borderColor: hovered === s.name ? s.color : "rgba(0,0,0,0)",
                boxShadow: hovered === s.name ? `0 0 16px ${s.color}40` : "0 0 0px rgba(0,0,0,0)",
              }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="text-xs font-bold leading-tight" style={{ color: s.color }}>{s.name}</p>
              <p className="text-xs text-muted mt-0.5 leading-tight">{s.role}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
