"use client";

import Image from "next/image";
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

const milestones = [
  { done: true,  label: "系統規格確定",    sub: "v2.7 規格書" },
  { done: true,  label: "3D 模型建立",     sub: "PETG 中段 V4" },
  { done: true,  label: "外殼組裝完成",    sub: "半成品展示" },
  { done: false, label: "內部電路組裝",    sub: "進行中" },
  { done: false, label: "韌體開發",        sub: "ESP32 C++" },
  { done: false, label: "組裝 + 防水",     sub: "期末前完成" },
  { done: false, label: "相關測試",        sub: "下水測試" },
];

export function CurrentState() {
  const doneCount = milestones.filter((m) => m.done).length;
  const progress = (doneCount / milestones.length) * 100;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Current State</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">現在做到哪</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Progress + Milestones */}
        <div className="flex flex-col gap-4">
          {/* Overall progress bar */}
          <div className="glass rounded-2xl p-5">
            <div className="flex justify-between text-xs font-mono text-muted mb-2">
              <span>整體進度</span>
              <span style={{ color: "#22D3EE" }}>{doneCount}/{milestones.length}</span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #22D3EE, #A78BFA)" }}
                initial={{ width: "0%" }}
                whileInView={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                viewport={{ once: true }}
              />
            </div>
          </div>

          {/* Milestone list */}
          <div className="flex flex-col gap-2">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-sm"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                  style={{
                    background: m.done ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${m.done ? "#22D3EE" : "rgba(255,255,255,0.12)"}`,
                    color: m.done ? "#22D3EE" : "#6B7280",
                  }}
                >
                  {m.done ? "✔" : "·"}
                </div>
                <div>
                  <span className={m.done ? "text-foreground" : "text-muted"}>{m.label}</span>
                  <span className="text-xs text-muted ml-1.5 font-mono">{m.sub}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-mono text-muted">外殼展示</p>
          <div className="glass rounded-2xl overflow-hidden">
            <Image
              src="/images/實物照片.jpg"
              alt="ROV 外殼實物照片"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="w-full max-w-4xl">
        <div className="h-px bg-border/30 my-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">Roadmap</p>
        <div className="flex flex-col sm:flex-row gap-4">
          {phases.map((phase, i) => (
            <div key={phase.phase} className="flex-1 flex items-stretch gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex-1 glass rounded-2xl p-5 flex flex-col gap-3"
                style={{
                  background: phase.status === "done" ? `${phase.accent}08` : `${phase.accent}04`,
                  borderColor: `${phase.accent}30`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                    style={{ background: `${phase.accent}20`, color: phase.accent }}
                  >
                    {phase.phase}
                  </div>
                  <span className="text-xs text-muted">
                    {phase.status === "done" ? "✔ 完成" : "→ 進行中"}
                  </span>
                </div>
                <h3 className="text-base font-bold" style={{ color: phase.accent }}>{phase.title}</h3>
                <ul className="flex flex-col gap-1">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted">
                      <span style={{ color: phase.accent + "80" }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              {i < phases.length - 1 && (
                <div className="hidden sm:flex items-center text-xl text-muted">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

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
