"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ArrowRight, Bot } from "lucide-react";
import { Figure } from "./Figure";

const memes = [
  {
    src: "/images/final/迷因_和AI一起建造偉大事物.png",
    alt: "迷因：和 AI 一起建造偉大的事物",
    width: 1122, height: 1402, caption: "「跟 AI 一起，建造偉大的東西」",
  },
  {
    src: "/images/final/迷因_Claude.png",
    alt: "迷因：Claude",
    width: 1287, height: 1222, caption: "主力打手：Claude",
  },
  {
    src: "/images/final/迷因_猴子拿ak47.png",
    alt: "迷因：猴子拿 AK47",
    width: 1692, height: 930, caption: "拿到 AI 工具的我",
  },
];

export function AIAgentSection() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center gap-8 text-center">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center justify-center gap-2">
          <Bot className="text-accent-violet" size={30} />
          軟體？全部交給 AI 代理
        </h2>
        <p className="text-muted mt-4 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          硬體是我們親手焊、親手裝的。但只要沾到<span className="text-accent-violet">軟體、程式碼</span>，
          不管是潛艇韌體、地面站、手機操控網頁、自動導航演算法，連這個報告網站，
          全部都是 <span className="text-accent-cyan">AI 代理（AI Agent）</span>寫出來的。
          我負責出需求、驗收、回報踩到的坑，程式碼它包辦。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl items-start">
        {memes.map((m) => (
          <Figure
            key={m.src}
            src={m.src}
            alt={m.alt}
            width={m.width}
            height={m.height}
            caption={m.caption}
            aspectClass="aspect-[4/5]"
            widthClass="max-w-[15rem] md:max-w-none"
          />
        ))}
      </div>

      <Link href="/repos">
        <motion.div
          whileHover={{ scale: 1.04, y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="glass rounded-2xl px-6 py-4 flex items-center gap-3"
          style={{ borderColor: "rgba(167,139,250,0.4)", boxShadow: "0 0 28px rgba(167,139,250,0.16)" }}
        >
          <Github size={22} className="text-accent-violet" />
          <span className="font-semibold text-foreground">想看 AI 寫出來的程式碼？原始碼倉庫</span>
          <ArrowRight size={18} className="text-accent-violet" />
        </motion.div>
      </Link>
    </div>
  );
}
