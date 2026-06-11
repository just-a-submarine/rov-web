"use client";

import { Activity } from "lucide-react";
import { SlideSection } from "@/components/midterm/SlideSection";
import { FinalSection } from "./FinalSection";
import { Figure } from "./Figure";

export function MotorsAliveSection() {
  return (
    <SlideSection id="motors-alive">
      <FinalSection
        icon={Activity}
        accent="#34D399"
        title="壞掉之前，確實跑起來過"
        media={
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <video
              src="/videos/motors-working.mp4"
              controls
              muted
              playsInline
              className="w-full rounded-2xl"
            />
            <Figure
              src="/images/final/motors-alive.png"
              alt="馬達正常運作時的系統截圖"
              width={2400}
              height={1080}
              caption="電池出問題之前，儀表板電流計讀數正常"
              widthClass="w-full"
            />
          </div>
        }
      >
        <p>雖然最後電池問題連帶三個零件一起報銷，但在那之前，馬達、攝影機、通訊全部都有跑起來。</p>
        <p>這段影片就是壞掉之前拍的。不是全部失敗，只是最後沒能下水。</p>
      </FinalSection>
    </SlideSection>
  );
}
