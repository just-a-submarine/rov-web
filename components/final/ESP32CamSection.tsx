"use client";

import { Camera } from "lucide-react";
import { SlideSection } from "@/components/midterm/SlideSection";
import { FinalSection } from "./FinalSection";

export function ESP32CamSection() {
  return (
    <SlideSection id="esp32cam">
      <FinalSection
        icon={Camera}
        accent="#F9A8D4"
        title="ESP32-CAM 實際拍攝"
        media={
          <div className="glass rounded-2xl p-3 w-full max-w-lg">
            <video
              src="/videos/esp32cam.mp4"
              controls
              muted
              playsInline
              className="rounded-xl w-full"
            />
          </div>
        }
      >
        <p>這是潛艇上的鏡頭實際拍到的畫面。640×480 MJPEG，地面站接收到的就是這個。</p>
        <p>畫質是 SD，但確實是它眼睛看到的世界。</p>
        <p>拍照與錄影會同步存進 ESP32 裡面的 SD 卡。</p>
      </FinalSection>
    </SlideSection>
  );
}
