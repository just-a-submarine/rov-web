"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";

interface FigureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** 外框寬度上限（Tailwind class），預設 max-w-sm */
  widthClass?: string;
  /** 給定時用固定比例圖框（等大磚塊），例：aspect-[4/5] */
  aspectClass?: string;
  /** 圖片填滿方式，預設 contain（完整顯示、不裁切） */
  fit?: "contain" | "cover";
}

/**
 * 報告用統一圖框：glass 圓角 + 置中 + 進場淡入 + 可選說明文字。
 * 點圖可放大（lightbox，透過 portal 掛到 body，避開祖先 transform 影響 fixed）。
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  widthClass = "max-w-sm",
  aspectClass,
  fit = "contain",
}: FigureProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const objectFit = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <>
      <motion.figure
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`flex flex-col items-center gap-2 w-full ${widthClass}`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`放大檢視：${alt}`}
          className="group relative block w-full glass rounded-2xl overflow-hidden p-1 cursor-zoom-in"
        >
          {aspectClass ? (
            <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-black/25`}>
              <Image src={src} alt={alt} fill sizes="(max-width: 640px) 90vw, 320px" className={objectFit} />
            </div>
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="(max-width: 640px) 90vw, 420px"
              className={`w-full h-auto rounded-xl ${objectFit}`}
            />
          )}
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn size={15} />
          </span>
        </button>
        {caption && (
          <figcaption className="text-xs text-muted/70 font-mono text-center leading-relaxed">
            {caption}
          </figcaption>
        )}
      </motion.figure>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm cursor-zoom-out"
              >
                <button
                  type="button"
                  aria-label="關閉"
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
                >
                  <X size={22} />
                </button>
                <motion.div
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center gap-3"
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    sizes="92vw"
                    className="rounded-lg object-contain shadow-2xl"
                    style={{ width: "auto", height: "auto", maxHeight: "86vh", maxWidth: "92vw" }}
                  />
                  {caption && <p className="text-sm text-white/70 font-mono text-center">{caption}</p>}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
