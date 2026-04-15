import type { Metadata } from "next";
import { SlideSection } from "@/components/midterm/SlideSection";
import { MissionScene } from "@/components/midterm/MissionScene";
import { HullDiagram } from "@/components/midterm/HullDiagram";
import { FreeCADShowcaseClient } from "@/components/midterm/FreeCADShowcaseClient";
import { PropulsionSection } from "@/components/midterm/PropulsionSection";
import { SensorsSection } from "@/components/midterm/SensorsSection";
import { ArchitectureMap } from "@/components/midterm/ArchitectureMap";
import { CurrentState } from "@/components/midterm/CurrentState";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "期中報告" };

/* 分段導覽點（桌面版右側快速跳轉） */
const sections = [
  { id: "title",      label: "封面" },
  { id: "mission",    label: "任務" },
  { id: "hull",       label: "三段艇體" },
  { id: "model",      label: "3D 模型" },
  { id: "propulsion", label: "推進系統" },
  { id: "comms",      label: "感測器 × 通訊" },
  { id: "state",      label: "進度·Roadmap" },
];

export default function MidtermPage() {
  return (
    <div className="relative">
      {/* Section navigation dots (desktop, fixed right side) */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="group flex items-center gap-2 justify-end"
            title={s.label}
          >
            <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity font-mono">
              {s.label}
            </span>
            <div className="w-2 h-2 rounded-full bg-border hover:bg-accent-cyan transition-colors" />
          </a>
        ))}
      </nav>

      {/* ① Title */}
      <SlideSection id="title">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo size={72} showText={false} />
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold gradient-text leading-tight">
              只是一台潛水艇
            </h1>
            <p className="text-muted text-lg mt-3 font-mono">Electronics II · 期中報告</p>
          </div>
          {/* Scroll hint */}
          <div className="mt-8 flex flex-col items-center gap-1 animate-bounce">
            <div className="w-px h-8 bg-gradient-to-b from-transparent to-accent-cyan/50" />
            <p className="text-xs text-muted/40 font-mono">scroll</p>
          </div>
        </div>
      </SlideSection>

      {/* ② Mission — 這是什麼 */}
      <SlideSection id="mission">
        <MissionScene />
      </SlideSection>

      {/* ③ Hull — 三段式艇體（先講物理結構） */}
      <SlideSection id="hull">
        <HullDiagram />
      </SlideSection>

      {/* ④ 3D Model — ROV 外殼模型 */}
      <SlideSection id="model">
        <FreeCADShowcaseClient />
      </SlideSection>

      {/* ⑤ Propulsion — 推進系統（差速轉向 + 垂直深度） */}
      <SlideSection id="propulsion">
        <PropulsionSection />
      </SlideSection>

      {/* ⑥ Sensors × Architecture — 合併成一個 section */}
      <SlideSection id="comms">
        <SensorsSection />
        <div className="h-px bg-border/30 my-16" />
        <ArchitectureMap />
      </SlideSection>

      {/* ⑦ Current State + Roadmap */}
      <SlideSection id="state">
        <CurrentState />
      </SlideSection>
    </div>
  );
}
