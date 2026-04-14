"use client";

import { motion } from "framer-motion";

const phases = [
  {
    phase: "期中",
    status: "done",
    title: "設計概念",
    items: ["系統規格", "3D 建模", "電路設計", "通訊架構", "外殼展示"],
    accent: "#22D3EE",
  },
  {
    phase: "期末",
    status: "next",
    title: "完整實現",
    items: ["韌體開發", "組裝防水", "地面站完成", "下水測試", "Demo 展示"],
    accent: "#A78BFA",
  },
];

export function Roadmap() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Roadmap</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">接下來</h2>
      </div>

      {/* Timeline */}
      <div className="flex flex-col sm:flex-row items-stretch gap-0 w-full max-w-2xl">
        {phases.map((phase, i) => (
          <div key={phase.phase} className="flex-1 flex flex-col sm:flex-row items-stretch">
            {/* Phase card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="flex-1 glass rounded-2xl p-6 flex flex-col gap-3"
              style={{
                background: phase.status === "done" ? `${phase.accent}08` : `${phase.accent}04`,
                borderColor: `${phase.accent}30`,
              }}
            >
              {/* Phase badge */}
              <div className="flex items-center gap-2">
                <div
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                  style={{ background: `${phase.accent}20`, color: phase.accent }}
                >
                  {phase.phase}
                </div>
                {phase.status === "done" && (
                  <span className="text-xs text-muted">✔ 完成</span>
                )}
                {phase.status === "next" && (
                  <span className="text-xs text-muted">→ 進行中</span>
                )}
              </div>

              <h3 className="text-lg font-bold" style={{ color: phase.accent }}>
                {phase.title}
              </h3>

              <ul className="flex flex-col gap-1.5">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted">
                    <span style={{ color: phase.accent + "80" }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Arrow connector */}
            {i < phases.length - 1 && (
              <div className="flex items-center justify-center w-12 text-xl text-muted sm:block hidden">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* End message */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
        className="text-muted text-sm font-mono text-center"
      >
        謝謝收看 ·{" "}
        <span className="gradient-text font-bold">只是一台潛水艇</span>
        {" "}· Electronics II
      </motion.p>
    </div>
  );
}
