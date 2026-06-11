"use client";

import {
  Antenna, RadioTower, ShieldCheck,
  Gamepad2, Smartphone, Monitor,
  type LucideIcon,
} from "lucide-react";
import { SlideSection } from "@/components/midterm/SlideSection";
import { CompareBars, type CompareRow } from "./MiniCharts";
import { FinalSection } from "./FinalSection";
import { Figure } from "./Figure";

interface StoryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  widthClass?: string;
}

interface Story {
  n: string;
  icon: LucideIcon;
  title: string;
  accent: string;
  stuck: string;
  /** 只有真的是「比喻金句」才給；不是比喻的就併進正文，避免每張卡都長一樣 */
  metaphor?: string;
  fix: string;
  result: string;
  bars?: CompareRow[];
  customMedia?: React.ReactNode;
  image?: StoryImage;
  note?: string;
}

/* ── 拓墣圖元件（藍牙 story 專用） ── */
function DeviceNode({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}40`, color }}>
        <Icon size={26} className="w-5 h-5 sm:w-[26px] sm:h-[26px]" />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color: `${color}dd` }}>{label}</span>
    </div>
  );
}

function ConnArrow({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span className="text-xs font-mono font-medium" style={{ color: `${color}cc` }}>{label}</span>
      <div className="flex items-center w-full min-w-0">
        <div className="flex-1 h-px" style={{ background: `${color}66` }} />
        <span className="text-sm" style={{ color: `${color}99` }}>▶</span>
      </div>
    </div>
  );
}

function YMerge({ label1, label2, color }: { label1: string; label2: string; color: string }) {
  return (
    <div className="flex items-stretch gap-1.5 self-stretch">
      <div className="flex flex-col justify-around py-2">
        <span className="text-xs font-mono font-medium" style={{ color: `${color}cc` }}>{label1}</span>
        <span className="text-xs font-mono font-medium" style={{ color: `${color}cc` }}>{label2}</span>
      </div>
      <div className="flex flex-col w-4">
        <div className="flex-1 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: `${color}66` }} />
        <div className="flex-1 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: `${color}66` }} />
      </div>
      <span className="self-center text-sm" style={{ color: `${color}99` }}>▶</span>
    </div>
  );
}

function BluetoothChainDiagram() {
  return (
    <div className="glass rounded-2xl p-4 sm:p-6 w-full max-w-md flex flex-col gap-5 sm:gap-6">
      {/* 以前：搖桿＋手機都連同一個地面站 */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-muted/70">以前</span>
        <div className="flex items-stretch gap-1.5">
          <div className="flex flex-col gap-2.5">
            <DeviceNode icon={Gamepad2} label="搖桿" color="#F87171" />
            <DeviceNode icon={Smartphone} label="手機" color="#F87171" />
          </div>
          <YMerge label1="藍牙" label2="Wi-Fi" color="#F87171" />
          <div className="self-center">
            <DeviceNode icon={Monitor} label="地面站" color="#F87171" />
          </div>
        </div>
        <span className="text-xs" style={{ color: "#F87171bb" }}>⚡ 藍牙和 Wi-Fi 互搶 2.4 GHz，幾乎斷線</span>
      </div>

      <div className="w-full h-px bg-white/10" />

      {/* 現在：一站接一站 */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-wider text-muted/70">現在</span>
        <div className="flex items-center gap-1.5">
          <DeviceNode icon={Gamepad2} label="搖桿" color="#22D3EE" />
          <ConnArrow label="USB" color="#22D3EE" />
          <DeviceNode icon={Smartphone} label="手機" color="#22D3EE" />
          <ConnArrow label="Wi-Fi" color="#22D3EE" />
          <DeviceNode icon={Monitor} label="地面站" color="#22D3EE" />
        </div>
        <span className="text-xs" style={{ color: "#34D399bb" }}>✓ 連線穩定，省 65 KB 記憶體</span>
      </div>
    </div>
  );
}

const stories: Story[] = [
  {
    n: "01", icon: Antenna, title: "天線只焊到一半", accent: "#22D3EE",
    stuck: "地面站那端本來設計了外接天線，焊的時候焊壞了，那陣子訊號一直爛。一直以為是潛艇的問題，查了很久才發現是地面站自己壞掉。",
    fix: "後來發現根本不需要外接天線，板載天線就夠用了。換一塊新的 ESP32 改吃板載天線，訊號立刻正常——繞了一大圈，回到起點。",
    result: "板載天線就夠用",
    image: {
      src: "/images/final/esp32-antenna.jpg", alt: "ESP32 天線選擇電阻——決定走板載還是外接天線",
      width: 4032, height: 3024, caption: "0Ω 電阻決定訊號走向——板載天線或外接天線",
      widthClass: "max-w-xs sm:max-w-sm",
    },
  },
  {
    n: "02", icon: RadioTower, title: "藍牙跟 Wi-Fi 搶頻道", accent: "#A78BFA",
    stuck: "手把走藍牙的時候，潛艇的 Wi-Fi 幾乎等於斷線。藍牙和 Wi-Fi 都在 2.4GHz，同時用就互相干擾。",
    fix: "乾脆關掉藍牙。現在有兩種操控方式：用手機網頁直接操控，或是把搖桿接上手機、透過手機操控。連上地面站的只有手機，不會再搶頻道。連線穩定，還省了 65KB 記憶體。",
    result: "手機操控 · 連線穩定",
    customMedia: <BluetoothChainDiagram />,
  },
  {
    n: "05", icon: ShieldCheck, title: "相機排線被 Wi-Fi 干擾", accent: "#F9A8D4",
    stuck: "高速相機排線離 Wi-Fi 天線太近，畫面會冒雜訊、不穩定。",
    fix: "用鋁箔把排線整個包起來，屏蔽雜訊。",
    result: "影像穩定",
    image: {
      src: "/images/final/鏡頭包鋁箔.jpg", alt: "相機排線外層包覆鋁箔屏蔽",
      width: 2381, height: 3716, caption: "排線外層包覆鋁箔屏蔽",
    },
  },
];

function StoryMedia({ s }: { s: Story }) {
  if (s.customMedia) return <>{s.customMedia}</>;
  if (s.bars) {
    return (
      <div className="glass rounded-2xl p-5 sm:p-6 w-full max-w-sm">
        <CompareBars rows={s.bars} />
      </div>
    );
  }
  if (s.image) {
    return (
      <Figure
        src={s.image.src}
        alt={s.image.alt}
        width={s.image.width}
        height={s.image.height}
        caption={s.image.caption}
        widthClass={s.image.widthClass ?? "max-w-[15rem] sm:max-w-xs"}
      />
    );
  }
  return null;
}

function StorySlide({ s }: { s: Story }) {
  return (
    <SlideSection id={`story-${s.n}`}>
      <FinalSection
        icon={s.icon}
        accent={s.accent}
        title={s.title}
        media={<StoryMedia s={s} />}
      >
        {/* 卡關 */}
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted/70 mb-1.5">卡關</p>
          <p>{s.stuck}</p>
          {s.metaphor && (
            <p className="italic mt-1.5" style={{ color: `${s.accent}cc` }}>{s.metaphor}</p>
          )}
        </div>

        {/* 破關 */}
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted/70 mb-1.5">破關</p>
          <p className="text-foreground/90">{s.fix}</p>
        </div>

        {/* 結果 */}
        <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
          <span className="text-xs text-muted">結果</span>
          <span
            className="px-3 py-1 rounded-full text-sm font-bold font-mono"
            style={{ background: `${s.accent}1e`, color: s.accent }}
          >
            {s.result}
          </span>
        </div>

        {s.note && <p className="text-sm text-muted/70">{s.note}</p>}
      </FinalSection>
    </SlideSection>
  );
}

export function DebugStories() {
  return (
    <>
      {stories.map((s) => (
        <StorySlide key={s.n} s={s} />
      ))}
    </>
  );
}
