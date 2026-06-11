"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FinalSectionProps {
  /** 小標（可選）；給了才顯示。期末報告刻意只在「踩坑故事」這種有序列的地方用 */
  eyebrow?: string;
  icon: LucideIcon;
  /** 重點色（hex），用於 icon 底色與外框，預設青色 */
  accent?: string;
  title: ReactNode;
  /** 右欄媒體（桌機在右、手機在下）；未給則單欄置中 */
  media?: ReactNode;
  children: ReactNode;
}

/**
 * 期末報告統一版面：左文字、右媒體（桌機兩欄；手機上下堆疊）。
 * 善用 16:9 橫向空間，沒有媒體時自動轉為單欄置中。
 */
export function FinalSection({ eyebrow, icon: Icon, accent = "#22D3EE", title, media, children }: FinalSectionProps) {
  const hasMedia = !!media;

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className={`grid items-center gap-8 lg:gap-12 ${hasMedia ? "lg:grid-cols-2" : "max-w-2xl mx-auto"}`}>
        {/* 文字（左） */}
        <motion.div
          initial={{ opacity: 0, x: hasMedia ? -20 : 0, y: hasMedia ? 0 : 16 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col gap-4 ${hasMedia ? "text-center lg:text-left" : "text-center"}`}
        >
          <div className={`flex items-center gap-3 ${hasMedia ? "justify-center lg:justify-start" : "justify-center"}`}>
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-none"
              style={{ background: `${accent}18`, color: accent }}
            >
              <Icon size={22} />
            </span>
            {eyebrow && (
              <p className="text-sm tracking-[0.25em] text-muted">{eyebrow}</p>
            )}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{title}</h2>
          <div className="flex flex-col gap-3 text-sm sm:text-base leading-relaxed text-muted">{children}</div>
        </motion.div>

        {/* 媒體（右） */}
        {hasMedia && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center lg:justify-end w-full order-first lg:order-none"
          >
            {media}
          </motion.div>
        )}
      </div>
    </div>
  );
}
