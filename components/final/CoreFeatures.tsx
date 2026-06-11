"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Gamepad2, MessageSquareText, ArrowRight, type LucideIcon } from "lucide-react";

interface Feature {
  href: string;
  icon: LucideIcon;
  accent: string;
  tag: string;
  title: string;
  desc: string;
  cta: string;
}

const features: Feature[] = [
  {
    href: "/simulator",
    icon: Gamepad2,
    accent: "#A78BFA",
    tag: "親手玩",
    title: "潛水艇模擬器",
    desc: "操控介面搬上網頁了：搖桿、深度、燈光、地圖航點都能玩，連 GPS 自動導航也能看它跑起來，不需要真的潛艇。",
    cta: "試玩",
  },
  {
    href: "/docs?assistant=1",
    icon: MessageSquareText,
    accent: "#22D3EE",
    tag: "邊看邊問",
    title: "文件裡的 AI 助手",
    desc: "每篇技術文件右下角都有個 AI，看不懂直接問它，也可以選取一段文字追問。",
    cta: "翻技術文件",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function CoreFeatures() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-8 text-center">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">先玩再說</h2>
        <p className="text-muted mt-3 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          這個網站有兩個地方可以直接試——<span className="text-foreground">潛艇模擬器</span>和<span className="text-foreground">文件 AI</span>，點進去玩玩看。
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10%" }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full"
      >
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div key={f.href} variants={item}>
              <Link href={f.href}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group glass rounded-2xl p-6 sm:p-7 h-full flex flex-col items-start gap-4 text-left transition-colors"
                  style={{ borderColor: `${f.accent}40`, boxShadow: `0 0 28px ${f.accent}14` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-none"
                      style={{ background: `${f.accent}1f`, color: f.accent }}
                    >
                      <Icon size={26} />
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                      style={{ background: `${f.accent}1a`, color: f.accent }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">{f.desc}</p>
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform group-hover:translate-x-1"
                    style={{ color: f.accent }}
                  >
                    {f.cta}
                    <ArrowRight size={16} />
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
