import type { Metadata } from "next";
import { Trophy, Clock } from "lucide-react";

export const metadata: Metadata = { title: "期末報告" };

export default function FinalPage() {
  return (
    <div className="min-h-[80dvh] flex flex-col items-center justify-center px-4">
      <div className="text-center flex flex-col items-center gap-6 max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(167,139,250,0.12)" }}>
          <Trophy size={44} className="text-accent-violet" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">期末報告</h1>
          <div className="flex items-center justify-center gap-2 text-muted text-sm font-mono">
            <Clock size={13} />
            <span>Coming Soon</span>
          </div>
        </div>

        {/* Hint */}
        <p className="text-muted text-sm leading-relaxed">
          期末報告將展示完整下水測試、實際操控演示，以及各子系統整合成果。
          <br />
          <span className="text-accent-violet/70">— 敬請期待 —</span>
        </p>

        {/* Progress bar (decorative) */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-muted font-mono mb-1.5">
            <span>期中 ✔</span>
            <span>期末 …</span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-violet"
              style={{ width: "45%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
