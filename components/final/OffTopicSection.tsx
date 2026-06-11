"use client";

import { motion } from "framer-motion";
import { SlideSection } from "@/components/midterm/SlideSection";
import { Figure } from "./Figure";

export function OffTopicSection() {
  return (
    <SlideSection id="off-topic">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center gap-10">
        {/* Header */}
        <motion.div
          className="text-center flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
        >
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider"
            style={{ background: "rgba(249,163,72,0.15)", color: "#F9A348" }}
          >
            題外話
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            所以，為什麼那麼多難以解釋的抽象問題？
          </h2>
          <p className="text-muted text-sm sm:text-base max-w-xl leading-relaxed">
            Wi-Fi 調一下功率，三個完全沒關係的零件一起壞。GPS 等了半小時找不到衛星。矽利康不管怎麼打都漏水。三用電表摔壞。
          </p>
          <p className="text-muted text-sm sm:text-base max-w-xl leading-relaxed">
            有沒有可能是因為——我今年跑去 Computex，把今年剩下的運氣全部花掉了？
          </p>
        </motion.div>

        {/* 兩張照片 */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full items-start justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Figure
            src="/images/final/離題_簽名01.png"
            alt="Computex 現場黃仁勳正在簽名"
            width={540}
            height={960}
            caption="親眼在現場看他簽"
            widthClass="w-full max-w-xs"
          />
          <Figure
            src="/images/final/離題_簽名02.jpg"
            alt="RTX 3070 Ti 上的黃仁勳親筆金色簽名"
            width={960}
            height={1280}
            caption="RTX 3070 Ti，親筆金色簽名"
            widthClass="w-full max-w-xs"
          />
        </motion.div>

      </div>
    </SlideSection>
  );
}
