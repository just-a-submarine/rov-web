"use client";

import { motion } from "framer-motion";

/* System flow: Xbox → GS ↔ ROV, Camera → Phone */
const flowNodes = [
  { icon: "🎮", label: "Xbox 手把",  sub: "差速操控",    color: "#FBBF24" },
  { icon: "📡", label: "地面站",     sub: "ESP32-S3",    color: "#22D3EE" },
  { icon: "🌊", label: "ROV",        sub: "水下載具",    color: "#A78BFA" },
  { icon: "📷", label: "OV5640",     sub: "影像模組",    color: "#F9A8D4" },
  { icon: "📱", label: "手機瀏覽器", sub: "即時監控",    color: "#6EE7B7" },
];

const specs = [
  { value: "1 m",      label: "操作水深",  accent: "#22D3EE", textClass: "text-3xl" },
  { value: "200 m",    label: "無線距離",  accent: "#A78BFA", textClass: "text-3xl" },
  { value: "GPS",      label: "自動導航",  accent: "#FBBF24", textClass: "text-3xl" },
  { value: "影像串流",  label: "OV5640 直連", accent: "#6EE7B7", textClass: "text-xl sm:text-2xl" },
];

export function MissionScene() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Mission</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">這是什麼？</h2>
        <p className="text-muted mt-3 text-sm max-w-lg mx-auto leading-relaxed">
          自製水下遙控載具（ROV）。Xbox 手把操控、手機瀏覽器即時觀看影像、Neo-M8N GPS 自動航點導航，全程防水。
        </p>
      </div>

      {/* System flow diagram */}
      <div className="w-full max-w-3xl">
        <p className="text-xs text-muted font-mono text-center mb-4 uppercase tracking-widest">系統流程</p>
        <div className="flex items-center justify-center flex-wrap gap-1">
          {flowNodes.map((node, i) => (
            <div key={node.label} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-1.5 glass rounded-2xl px-4 py-3 min-w-[4.5rem] text-center"
              >
                <span className="text-2xl">{node.icon}</span>
                <p className="text-xs font-bold whitespace-nowrap leading-tight" style={{ color: node.color }}>
                  {node.label}
                </p>
                <p className="text-xs text-muted font-mono whitespace-nowrap">{node.sub}</p>
              </motion.div>

              {i < flowNodes.length - 1 && (
                <motion.div
                  className="px-1 sm:px-2 text-muted text-base select-none"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* ↔ between GS and ROV (bidirectional ESP-NOW), → elsewhere */}
                  {i === 1 ? "↔" : "→"}
                </motion.div>
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted/50 font-mono mt-3">
          影像直連 ROV → 手機（不過地面站）
        </p>
      </div>

      {/* Key specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
        {specs.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-5 text-center"
          >
            <p className={`${s.textClass} font-bold font-mono whitespace-nowrap`} style={{ color: s.accent }}>{s.value}</p>
            <p className="text-xs text-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Water wave decoration */}
      <div className="w-full max-w-2xl h-10 opacity-20">
        <svg viewBox="0 0 400 40" className="w-full" preserveAspectRatio="none">
          <motion.path
            d="M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,35 400,20"
            stroke="#22D3EE" strokeWidth="1.5" fill="none"
            animate={{ d: [
              "M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,35 400,20",
              "M0,20 C50,35 100,5 150,20 C200,35 250,5 300,20 C350,35 400,5 400,20",
              "M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,35 400,20",
            ]}}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
}
