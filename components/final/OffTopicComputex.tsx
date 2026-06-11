"use client";

import { Sparkles } from "lucide-react";
import { Figure } from "./Figure";

const photos = [
  {
    src: "/images/final/離題_簽名01.png",
    alt: "RTX 3070 Ti 公版卡上的黃仁勳親筆簽名",
    width: 942, height: 1670,
  },
  {
    src: "/images/final/離題_簽名02.jpg",
    alt: "Computex 黃仁勳簽名顯卡",
    width: 3024, height: 4032,
  },
];

export function OffTopicComputex() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center gap-8 text-center">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="text-accent-violet" size={28} />
          純離題，湊個時間
        </h2>
        <p className="text-muted mt-4 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          做潛艇做到一半，我跑去逛了 Computex。在自己的
          <span className="text-foreground"> RTX 3070 Ti Founders Edition（公版卡）</span>上，
          要到了黃仁勳的親筆簽名。跟潛艇完全沒關係，純粹想放上來炫一下。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full max-w-md place-items-center">
        {photos.map((p) => (
          <Figure
            key={p.src}
            src={p.src}
            alt={p.alt}
            width={p.width}
            height={p.height}
            aspectClass="aspect-[3/4]"
            widthClass="w-full"
          />
        ))}
      </div>
    </div>
  );
}
