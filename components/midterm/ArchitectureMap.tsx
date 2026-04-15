"use client";

import { motion } from "framer-motion";

/**
 * Communication architecture:
 *   Xbox → GS: USB 有線連接（實體控制器輸入）
 *   Phone ↔ GS: WebSocket (control UI + telemetry relay)
 *   GS → ROV: ESP-NOW 100 Hz (control downlink)
 *   ROV → GS: ESP-NOW 5 Hz (telemetry uplink)
 *   ROV → Phone: 即時影像串流
 */

const mainNodes = [
  { id: "phone", label: "手機瀏覽器", sub: "WebSocket / 即時影像串流", x: "10%", y: "55%", accent: "#6EE7B7" },
  { id: "gs",    label: "地面站",     sub: "ESP32-S3 · 熱點",    x: "50%", y: "55%", accent: "#22D3EE" },
  { id: "rov",   label: "ROV",        sub: "ESP32-S3 · 連線",   x: "90%", y: "55%", accent: "#A78BFA" },
];

const topNode = { id: "xbox", label: "Xbox 控制器", sub: "USB 有線連接", x: "50%", y: "14%", accent: "#FBBF24" };

export function ArchitectureMap() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Architecture</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">通訊架構</h2>
      </div>

      {/* Diagram */}
      <div className="relative w-full max-w-3xl" style={{ height: 300 }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">

          {/* Xbox → GS: USB 有線連接 (vertical dashed, amber) */}
          <motion.line x1="400" y1="58" x2="400" y2="138"
            stroke="#FBBF24" strokeWidth="1.8" strokeDasharray="5 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          />
          <text x="415" y="102" fill="#FBBF24" fontSize="10" fontFamily="monospace">USB 有線連接</text>

          {/* Phone ↔ GS: WebSocket (upper dashed, green) */}
          <motion.line x1="140" y1="148" x2="355" y2="148"
            stroke="#6EE7B7" strokeWidth="1.8" strokeDasharray="6 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            viewport={{ once: true }}
          />
          <text x="248" y="138" textAnchor="middle" fill="#6EE7B7" fontSize="11" fontFamily="monospace">WebSocket</text>

          {/* GS → ROV: ESP-NOW control downlink (solid cyan) */}
          <motion.line x1="445" y1="143" x2="660" y2="143"
            stroke="#22D3EE" strokeWidth="2.5"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            viewport={{ once: true }}
          />
          {/* ROV → GS: ESP-NOW telemetry uplink (dashed cyan, opposite direction) */}
          <motion.line x1="445" y1="155" x2="660" y2="155"
            stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="5 4" opacity={0.55}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            viewport={{ once: true }}
          />
          <text x="553" y="138" textAnchor="middle" fill="#22D3EE" fontSize="11" fontFamily="monospace">ESP-NOW 無線控制</text>
          <text x="553" y="176" textAnchor="middle" fill="#22D3EE" fontSize="9" fontFamily="monospace" opacity={0.65}>↓100Hz · ↑5Hz</text>

          {/* Phone → ROV: MJPEG (lower arc, pink) */}
          <motion.path d="M 140 178 Q 400 280 660 178"
            stroke="#F9A8D4" strokeWidth="1.5" strokeDasharray="5 5" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            viewport={{ once: true }}
          />
          <text x="400" y="268" textAnchor="middle" fill="#F9A8D4" fontSize="10" fontFamily="monospace">即時影像串流</text>

          {/* Animated data packet: GS → ROV (control, fast) */}
          <motion.circle r="5" cy={143} fill="#22D3EE"
            animate={{ cx: [445, 660], opacity: [0.9, 0] }}
            transition={{ duration: 1.0, repeat: Infinity, repeatDelay: 0.3, ease: "linear" }}
          />
          {/* Animated data packet: ROV → GS (telemetry, slower) */}
          <motion.circle r="3.5" cy={155} fill="#22D3EE"
            animate={{ cx: [660, 445], opacity: [0.7, 0] }}
            transition={{ duration: 2.0, repeat: Infinity, repeatDelay: 1.0, ease: "linear" }}
          />
        </svg>

        {/* Xbox node (top-center) */}
        <motion.div
          key={topNode.id}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 glass rounded-2xl px-4 py-3 text-center"
          style={{ left: topNode.x, top: topNode.y }}
        >
          <p className="text-sm font-bold whitespace-nowrap" style={{ color: topNode.accent }}>{topNode.label}</p>
          <p className="text-xs text-muted font-mono mt-0.5 whitespace-nowrap">{topNode.sub}</p>
        </motion.div>

        {/* Main row nodes */}
        {mainNodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 glass rounded-2xl px-4 py-3 text-center"
            style={{ left: node.x, top: node.y }}
          >
            <p className="text-sm font-bold whitespace-nowrap" style={{ color: node.accent }}>{node.label}</p>
            <p className="text-xs text-muted font-mono mt-0.5 whitespace-nowrap">{node.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 justify-center text-xs font-mono">
        {[
          { color: "#FBBF24", label: "USB 有線連接", dashed: true },
          { color: "#6EE7B7", label: "WebSocket 控制 / 遙測中繼", dashed: true },
          { color: "#22D3EE", label: "ESP-NOW 無線控制 ↓控制 100Hz · ↑遙測 5Hz", dashed: false },
          { color: "#F9A8D4", label: "即時影像串流", dashed: true },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <svg width="24" height="8" viewBox="0 0 24 8">
              <line
                x1="0" y1="4" x2="24" y2="4"
                stroke={l.color}
                strokeWidth={l.dashed ? 1.5 : 2.5}
                strokeDasharray={l.dashed ? "5 4" : "0"}
              />
            </svg>
            <span className="text-muted">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
