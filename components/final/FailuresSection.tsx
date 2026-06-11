"use client";

import Link from "next/link";
import { Satellite, Droplets, BatteryWarning, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { SlideSection } from "@/components/midterm/SlideSection";
import { Figure } from "./Figure";

export function FailuresSection() {
  return (
    <SlideSection id="failures">
      <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-10">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">三個沒解決的問題</h2>
        </motion.div>

        {/* 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
          {/* GPS */}
          <motion.div
            className="glass rounded-2xl p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
                style={{ background: "#34D39918", color: "#34D399" }}
              >
                <Satellite size={20} />
              </span>
              <h3 className="text-lg font-bold">GPS 收不到衛星</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              裝了外接天線，實測怎麼等都搜不到衛星，定不了位。硬體限制，不是寫程式能解的。
            </p>
            <p className="text-sm leading-relaxed text-muted">
              自動導航的程式全部寫完了，哪天換一顆能用的模組，插上去就能跑。
            </p>
            <Figure
              src="/images/final/gps-no-signal.jpg"
              alt="GPS 搜不到衛星的畫面"
              width={3024}
              height={4032}
              caption="等了很久，就是收不到衛星"
              widthClass="w-full"
            />
          </motion.div>

          {/* 漏水 */}
          <motion.div
            className="glass rounded-2xl p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
                style={{ background: "#22D3EE18", color: "#22D3EE" }}
              >
                <Droplets size={20} />
              </span>
              <h3 className="text-lg font-bold">漏水，沒能下水</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              接縫、開孔、出線口都打了矽利康、纏了自融膠帶。測試還是進水。最後沒能帶它下水，這是最主要的遺憾。
            </p>
            <Figure
              src="/images/final/矽利康.jpg"
              alt="密封處的矽利康打膠處理"
              width={4032}
              height={2632}
              caption="接縫一處一處打膠，還是漏了"
              widthClass="w-full"
            />
            <Figure
              src="/images/final/waterproof-loop.png"
              alt="防水處理無盡循環示意圖"
              width={1254}
              height={1254}
              caption="矽利康無盡循環"
              widthClass="w-full"
            />
          </motion.div>

          {/* 電池 */}
          <motion.div
            className="glass rounded-2xl p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
                style={{ background: "#F9731618", color: "#F97316" }}
              >
                <BatteryWarning size={20} />
              </span>
              <h3 className="text-lg font-bold">接電池開機會自動重啟</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              因為時間都花在漏水問題上，平時測試全都接 USB，沒發現任何異常。直到最後才接上電池——結果 Wi-Fi 一啟動整台就重啟，推測是啟動瞬間的峰值電流超出電池的供電上限。
            </p>
            <p className="text-sm leading-relaxed text-muted">
              嘗試調低 Wi-Fi 發射功率來減少峰值電流。調完之後，垂直馬達、右馬達、電流計全部報銷——跟 Wi-Fi 設定毫無邏輯關係的三樣東西，一起壞掉。到現在也不知道為什麼。調低功率還是有點不穩定，所以最後還是改接 USB 使用。
            </p>
            <p className="text-sm leading-relaxed text-muted">
              禍不單行——原本想用三用電表找出故障位置，偏偏在這之前剛好摔壞了。
            </p>
            <Figure
              src="/images/final/broken-multimeter.jpg"
              alt="摔壞的三用電表"
              width={3024}
              height={4032}
              caption="想找故障位置，偏偏三用電表已經摔壞了"
              widthClass="w-full"
            />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Link href="/simulator">
            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="glass rounded-2xl px-6 py-4 flex items-center gap-3"
              style={{ borderColor: "rgba(34,211,238,0.4)", boxShadow: "0 0 28px rgba(34,211,238,0.12)" }}
            >
              <Play size={20} className="text-accent-cyan" />
              <span className="font-semibold text-foreground">沒做到的事，在模擬器裡體驗看看</span>
              <ArrowRight size={18} className="text-accent-cyan" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </SlideSection>
  );
}
