"use client";

import { motion } from "framer-motion";

export function PropulsionSection() {
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Propulsion</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">推進系統</h2>
        <p className="text-muted text-sm mt-2">
          三馬達配置：雙水平差速轉向 + 單垂直深度控制
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

        {/* ── Top-view: differential steering ── */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">水平馬達 × 2 — 俯視</p>
          <svg viewBox="0 0 260 180" className="w-full max-w-xs">
            {/* Hull body */}
            <ellipse cx="130" cy="110" rx="70" ry="26"
              fill="#8B9BAD18" stroke="#8B9BAD" strokeWidth="1.5" />
            <text x="130" y="108" textAnchor="middle"
              fill="#8B9BAD" fontSize="10" fontFamily="monospace">ROV 艇體</text>
            <text x="130" y="120" textAnchor="middle"
              fill="#8B9BAD" fontSize="8" fontFamily="monospace">90 mm OD</text>

            {/* Forward direction arrow */}
            <motion.g
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="130" y1="76" x2="130" y2="48"
                stroke="#6EE7B7" strokeWidth="2" />
              <polygon points="130,40 122,54 138,54" fill="#6EE7B7" />
            </motion.g>
            <text x="148" y="54" fill="#6EE7B7" fontSize="9" fontFamily="monospace">前進</text>

            {/* Left motor arm + block */}
            <line x1="80" y1="110" x2="42" y2="110"
              stroke="#22D3EE" strokeWidth="1.5" />
            <rect x="20" y="98" width="22" height="24" rx="3"
              fill="#22D3EE18" stroke="#22D3EE" strokeWidth="1.5" />
            <text x="31" y="82" textAnchor="middle"
              fill="#22D3EE" fontSize="9" fontFamily="monospace">左馬達</text>
            {/* Left motor propeller symbol */}
            <line x1="20" y1="110" x2="8" y2="110"
              stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />

            {/* Right motor arm + block */}
            <line x1="180" y1="110" x2="218" y2="110"
              stroke="#22D3EE" strokeWidth="1.5" />
            <rect x="218" y="98" width="22" height="24" rx="3"
              fill="#22D3EE18" stroke="#22D3EE" strokeWidth="1.5" />
            <text x="229" y="82" textAnchor="middle"
              fill="#22D3EE" fontSize="9" fontFamily="monospace">右馬達</text>
            <line x1="240" y1="110" x2="252" y2="110"
              stroke="#22D3EE" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />

            {/* Differential steering annotation */}
            <text x="130" y="155" textAnchor="middle"
              fill="#F9A8D4" fontSize="9" fontFamily="monospace">左右油門差值 → 差速轉向</text>
          </svg>
        </div>

        {/* ── Side-view: vertical motor ── */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">垂直馬達 × 1 — 側視</p>
          <svg viewBox="0 0 260 180" className="w-full max-w-xs">
            {/* Water surface */}
            <line x1="20" y1="50" x2="240" y2="50"
              stroke="#22D3EE" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
            <text x="232" y="46" textAnchor="end"
              fill="#22D3EE" fontSize="8" fontFamily="monospace" opacity="0.7">水面</text>

            {/* Hull body (side ellipse) */}
            <ellipse cx="130" cy="100" rx="70" ry="22"
              fill="#8B9BAD18" stroke="#8B9BAD" strokeWidth="1.5" />
            <text x="130" y="104" textAnchor="middle"
              fill="#8B9BAD" fontSize="10" fontFamily="monospace">ROV</text>

            {/* Vertical motor mount below hull */}
            <line x1="130" y1="122" x2="130" y2="142"
              stroke="#A78BFA" strokeWidth="1.5" />
            <rect x="116" y="142" width="28" height="16" rx="3"
              fill="#A78BFA18" stroke="#A78BFA" strokeWidth="1.5" />
            <text x="130" y="172" textAnchor="middle"
              fill="#A78BFA" fontSize="9" fontFamily="monospace">垂直馬達</text>

            {/* Float arrow (up) */}
            <motion.g
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="96" y1="98" x2="96" y2="62"
                stroke="#A78BFA" strokeWidth="2" />
              <polygon points="96,54 89,68 103,68" fill="#A78BFA" />
              <text x="78" y="76" textAnchor="middle"
                fill="#A78BFA" fontSize="9" fontFamily="monospace">上浮</text>
            </motion.g>

            {/* Dive arrow (down) */}
            <motion.g
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 1.1, ease: "easeInOut" }}
            >
              <line x1="164" y1="104" x2="164" y2="140"
                stroke="#A78BFA" strokeWidth="2" />
              <polygon points="164,148 157,134 171,134" fill="#A78BFA" />
              <text x="186" y="128" textAnchor="middle"
                fill="#A78BFA" fontSize="9" fontFamily="monospace">下潛</text>
            </motion.g>
          </svg>
        </div>
      </div>

      {/* Motor spec cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          {
            label: "左水平馬達",
            role: "提供前進推力，差速時主動加速以產生右轉力矩",
            pos: "左舷延伸臂",
            color: "#22D3EE",
          },
          {
            label: "右水平馬達",
            role: "提供前進推力，差速時主動加速以產生左轉力矩",
            pos: "右舷延伸臂",
            color: "#22D3EE",
          },
          {
            label: "垂直馬達",
            role: "正轉推向水面上浮，反轉拖入水中下潛，主動深度控制",
            pos: "艇體正下方",
            color: "#A78BFA",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="glass rounded-xl p-4"
          >
            <p className="text-sm font-bold" style={{ color: m.color }}>{m.label}</p>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">{m.role}</p>
            <p className="text-xs font-mono mt-2 opacity-55" style={{ color: m.color }}>{m.pos}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
