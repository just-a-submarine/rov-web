"use client";

import { Wifi } from "lucide-react";
import { SlideSection } from "@/components/midterm/SlideSection";
import { FinalSection } from "./FinalSection";
import { Figure } from "./Figure";

export function ControlDiscoverySection() {
  return (
    <SlideSection id="control-discovery">
      <FinalSection
        icon={Wifi}
        accent="#22D3EE"
        title="能開瀏覽器的，都能控制它"
        media={
          <Figure
            src="/images/final/control-discovery.jpg"
            alt="Meta Quest 2 VR 頭盔內的瀏覽器控制潛艇畫面"
            width={1456}
            height={816}
            caption="Meta Quest 2 裡面開瀏覽器，一樣可以操控"
            widthClass="w-full max-w-lg"
          />
        }
      >
        <p>地面站其實就是一個網頁。只要裝置能連上同一個 Wi-Fi、能打開瀏覽器，就能控制潛艇。</p>
        <p>手機、平板、電腦——測試的時候順手拿起 Meta Quest 2 試了一下，也直接能用。</p>
      </FinalSection>
    </SlideSection>
  );
}
