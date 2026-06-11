"use client";

import { motion } from "framer-motion";

export interface CompareRow {
  label: string;
  /** 0~1 條長比例 */
  level: number;
  /** 右側白話結論（不寫死數字） */
  word: string;
  color: string;
}

/* ---------- 通用「前 vs 後」對比條（白話、不寫死數字） ---------- */
export function CompareBars({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-xs text-muted font-mono w-20 flex-none">{r.label}</span>
          <div className="flex-1 h-3 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: r.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${r.level * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-mono font-bold w-20 text-right flex-none" style={{ color: r.color }}>
            {r.word}
          </span>
        </div>
      ))}
    </div>
  );
}
