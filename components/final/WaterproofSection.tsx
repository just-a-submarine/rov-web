"use client";

import { Droplets } from "lucide-react";
import { FinalSection } from "./FinalSection";
import { Figure } from "./Figure";

export function WaterproofSection() {
  return (
    <FinalSection
      icon={Droplets}
      accent="#22D3EE"
      title="怎麼讓它不進水"
      media={
        <Figure
          src="/images/final/矽利康.jpg"
          alt="密封處的矽利康打膠處理"
          width={4032}
          height={2632}
          caption="密封處逐一矽利康打膠"
          widthClass="max-w-md"
        />
      }
    >
      <p>
        潛艇要下水，最怕的就是漏。所有接縫、開孔、出線的地方，
        我都用<span className="text-accent-cyan">矽利康（Silicone）</span>一處一處打膠密封；
        外面再纏一層<span className="text-accent-cyan">自融膠帶</span>補強。
        兩層疊上去，能進水的縫基本都堵死了。
      </p>
    </FinalSection>
  );
}
