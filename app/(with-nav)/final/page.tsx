import type { Metadata } from "next";
import { SlideSection } from "@/components/midterm/SlideSection";
import { FinalIntro } from "@/components/final/FinalIntro";
import { FinalCoverFX } from "@/components/final/FinalCoverFX";
import { CoreFeatures } from "@/components/final/CoreFeatures";
import { DebugStories } from "@/components/final/DebugStories";
import { FailuresSection } from "@/components/final/FailuresSection";
import { AIAgentSection } from "@/components/final/AIAgentSection";
import { MotorsAliveSection } from "@/components/final/MotorsAliveSection";
import { ESP32CamSection } from "@/components/final/ESP32CamSection";
import { ControlDiscoverySection } from "@/components/final/ControlDiscoverySection";
import { OffTopicSection } from "@/components/final/OffTopicSection";
import { FinalEnding } from "@/components/final/FinalEnding";
import { QRScanHint } from "@/components/nav/QRScanHint";

export const metadata: Metadata = { title: "期末報告" };

/* 期末＝「真的做出來＋一路的硬仗」。一頁一個重點，全部用白話故事＋現場演示。 */
export default function FinalPage() {
  return (
    <div className="relative">
      {/* ① 封面（炫技動畫背景僅限封面，不影響下方內容） */}
      <section
        id="intro"
        className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden px-4 py-16"
      >
        <FinalCoverFX />
        <div className="relative z-10">
          <FinalIntro />
        </div>
      </section>

      {/* ② 網站核心：模擬器試玩 + 文件 AI 助手（一上來就帶到最重要的東西） */}
      <SlideSection id="core">
        <CoreFeatures />
      </SlideSection>

      {/* ③ 卡關 → 破關：天線 / 藍牙 / 相機排線 */}
      <DebugStories />

      {/* ④ 軟體：全部交給 AI 代理（含原始碼倉庫入口） */}
      <SlideSection id="ai-agent">
        <AIAgentSection />
      </SlideSection>

      {/* ⑤ 三個沒解決的問題（放最後，誠實收尾） */}
      <FailuresSection />

      {/* ⑥ 壞掉之前確實跑起來過（馬達影片＋截圖佐證） */}
      <MotorsAliveSection />

      {/* ⑦ ESP32-CAM 實際拍攝畫面 */}
      <ESP32CamSection />

      {/* ⑧ 意外發現：任何能開瀏覽器的設備都能控制 */}
      <ControlDiscoverySection />

      {/* ⑨ 題外話：運氣用在 Computex 了（自嘲收尾） */}
      <OffTopicSection />

      {/* 結尾 */}
      <FinalEnding />

      {/* 指向右下角 QR 的掃描提示（滑過第一屏才收起，不會一捲就消失） */}
      <QRScanHint hideAfter={500} />
    </div>
  );
}
