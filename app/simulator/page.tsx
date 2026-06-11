import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export const metadata: Metadata = {
  title: "模擬器",
  description: "潛水艇儀表板模擬器 — 直接試玩手機操控介面（離線模擬，非真實裝置）",
};

export default function SimulatorPage() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      {/* 纖細返回列（取代共用 TopNav，避免浮層蓋住儀表板控制） */}
      <header className="flex-none h-12 px-3 flex items-center justify-between glass border-b border-border">
        <Link
          href="/final"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">返回報告</span>
        </Link>

        <div className="flex items-center gap-2 text-accent-cyan">
          <Gamepad2 size={16} />
          <span className="text-sm font-bold tracking-wide">潛水艇模擬器</span>
        </div>

        <span className="text-xs text-muted/60 font-mono">
          <span className="hidden sm:inline">離線模擬 · </span>建議橫向
        </span>
      </header>

      {/* 真實手機儀表板（沿用 Ground-Station 網頁），由 sim-engine.js 餵假遙測 */}
      <iframe
        src="/sim/index.html"
        title="潛水艇儀表板模擬器"
        className="flex-1 w-full border-0 block bg-black"
        allow="fullscreen; gamepad"
      />
    </div>
  );
}
