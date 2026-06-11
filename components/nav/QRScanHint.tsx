"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScanHintProps {
  /**
   * 捲動超過此距離（px）就淡出收起。
   * 不給（undefined）＝常駐不收起（首頁用）。
   */
  hideAfter?: number;
}

/**
 * 指向右下角 QR Code 的動畫提示：文字在上、底下一支較大的垂直箭頭「↓」直指 QR，
 * 箭頭停在 QR 正上方、不蓋到 QR。
 */
export function QRScanHint({ hideAfter }: QRScanHintProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (hideAfter == null) return; // 常駐
    const onScroll = () => setVisible(window.scrollY <= hideAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideAfter]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
          className="fixed right-5 bottom-[122px] z-40 hidden sm:flex flex-col items-end gap-2.5 pointer-events-none select-none"
        >
          <span
            className="px-3 py-1.5 rounded-full text-sm font-bold text-foreground glass whitespace-nowrap"
            style={{ borderColor: "rgba(34,211,238,0.4)", boxShadow: "0 0 24px rgba(34,211,238,0.18)" }}
          >
            掃 QR Code 進網站
          </span>
          <motion.span
            className="text-5xl leading-none text-accent-cyan mr-[18px]"
            style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.5))" }}
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
