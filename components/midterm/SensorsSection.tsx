"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const sensors = [
  { name: "QMC5883P", role: "電子羅盤",   addr: "0x2C",  color: "#22D3EE", icon: "🧭",  bus: "I²C"  },
  { name: "MS5837",   role: "水壓感測器",  addr: "0x76",  color: "#6EE7B7", icon: "🌊",  bus: "I²C"  },
  { name: "INA260",   role: "電流計",      addr: "0x40",  color: "#F9A8D4", icon: "⚡",   bus: "I²C"  },
  { name: "MCP23017", role: "IO 擴展",     addr: "0x20",  color: "#A78BFA", icon: "🔌",  bus: "I²C"  },
  { name: "Neo-M8N",  role: "GPS（浮標）", addr: "UART",  color: "#FBBF24", icon: "🛰️", bus: "UART" },
];

export function SensorsSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Sensors & Comms</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">感測器 × 通訊</h2>
      </div>

      {/* Sensor bus visualization */}
      <div className="relative w-full max-w-3xl">
        <div className="flex items-center gap-0 mb-2">
          <div
            className="flex-1 h-1 rounded-full"
            style={{ background: "linear-gradient(90deg, #22D3EE, #A78BFA, #FBBF24)" }}
          />
          <div className="text-xs font-mono text-muted w-32 pl-3">I²C × UART 感測器</div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
          {sensors.map((s, i) => (
            <motion.div
              key={s.name}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHovered(s.name)}
              onHoverEnd={() => setHovered(null)}
            >
              {/* Vertical connector — dashed for UART, solid for I²C */}
              <motion.div
                className="w-0.5 h-6"
                style={{
                  background: s.bus === "I²C" ? s.color : "none",
                  backgroundImage:
                    s.bus === "UART"
                      ? `repeating-linear-gradient(to bottom, ${s.color} 0px, ${s.color} 4px, transparent 4px, transparent 8px)`
                      : undefined,
                }}
                animate={{ opacity: hovered === s.name ? 1 : 0.4 }}
              />
              {/* Sensor card */}
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
                <p className="text-xs font-mono mt-1.5 opacity-50">{s.addr}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 影像串流 highlight */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="glass rounded-2xl px-8 py-5 w-full max-w-3xl flex items-center justify-center gap-4"
      >
        <div className="text-3xl">📡</div>
        <p className="text-3xl font-bold font-mono" style={{ color: "#6EE7B7" }}>影像串流</p>
      </motion.div>
    </div>
  );
}
