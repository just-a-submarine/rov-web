"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const sensors = [
  { addr: "0x2C", name: "QMC5883P", role: "電子羅盤",  color: "#22D3EE", icon: "🧭" },
  { addr: "0x76", name: "MS5837",   role: "水壓感測器", color: "#6EE7B7", icon: "🌊" },
  { addr: "0x40", name: "INA260",   role: "電流計",     color: "#F9A8D4", icon: "⚡" },
  { addr: "0x20", name: "MCP23017", role: "IO 擴展",    color: "#A78BFA", icon: "🔌" },
];

export function SensorsSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Sensors & Comms</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">感測器 × 通訊</h2>
      </div>

      {/* I2C Bus visualization */}
      <div className="relative w-full max-w-2xl">
        {/* Bus line */}
        <div className="flex items-center gap-0 mb-2">
          <div className="text-xs font-mono text-muted w-20 text-right pr-3">GPIO 1/2</div>
          <div className="flex-1 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #22D3EE, #A78BFA)" }} />
          <div className="text-xs font-mono text-muted w-24 pl-3">I²C Bus</div>
        </div>

        {/* Sensors hanging off bus */}
        <div className="ml-20 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {sensors.map((s, i) => (
            <motion.div
              key={s.addr}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHovered(s.addr)}
              onHoverEnd={() => setHovered(null)}
            >
              {/* Vertical connector */}
              <motion.div
                className="w-0.5 h-6"
                style={{ background: s.color }}
                animate={{ opacity: hovered === s.addr ? 1 : 0.4 }}
              />
              {/* Sensor card */}
              <motion.div
                className="glass rounded-xl p-3 text-center w-full cursor-pointer"
                whileHover={{ scale: 1.05 }}
                animate={{
                  borderColor: hovered === s.addr ? s.color : "rgba(0, 0, 0, 0)",
                  boxShadow: hovered === s.addr ? `0 0 16px ${s.color}40` : "0 0 0px rgba(0,0,0,0)",
                }}
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-xs font-bold" style={{ color: s.color }}>{s.name}</p>
                <p className="text-xs text-muted mt-0.5">{s.role}</p>
                <p className="text-xs font-mono mt-1" style={{ color: s.color + "99" }}>{s.addr}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comms protocol info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          { label: "控制下行",  val: "100 Hz",  sub: "地面站 → ROV", color: "#22D3EE" },
          { label: "遙測上行",  val: "5 Hz",    sub: "ROV → 地面站",  color: "#6EE7B7" },
          { label: "影像串流",  val: "MJPEG",   sub: "OV5640 直連",   color: "#A78BFA" },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-muted font-mono">{item.label}</p>
            <p className="text-2xl font-bold font-mono mt-1" style={{ color: item.color }}>{item.val}</p>
            <p className="text-xs text-muted mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* GPS Navigation — UART, separate from I2C bus */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="glass rounded-2xl px-5 py-4 w-full max-w-2xl flex items-center gap-4"
      >
        <div className="text-3xl shrink-0">🛰️</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-bold" style={{ color: "#FBBF24" }}>Neo-M8N GPS</p>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24" }}>UART1</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            主動式天線（LNA 28dB）延伸至浮標。搭配 QMC5883P 羅盤，支援 Potential Field 自動航點導航
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-mono" style={{ color: "#FBBF24" }}>CEP 2.5 m</p>
          <p className="text-xs text-muted mt-0.5">5 Hz NMEA</p>
        </div>
      </motion.div>
    </div>
  );
}
