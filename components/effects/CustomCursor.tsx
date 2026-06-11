"use client";

import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "hover" | "text";

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, .cursor-pointer';
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]';

// 鎖定色（hover）：琥珀金，對深海青/紫底高對比、最顯眼；resting 維持品牌青。
const REST = { ring: "rgba(34,211,238,0.85)", dot: "#22D3EE", glow: "rgba(34,211,238,0.5)" };
const LOCK = { ring: "rgba(251,191,36,0.95)", dot: "#FBBF24", glow: "rgba(251,191,36,0.7)" };

/**
 * 自製品牌游標：取代系統箭頭，顯示「潛艇聲納准心」。
 * - 只在精準指標裝置（滑鼠）啟用；觸控裝置完全不介入（觸控特效見 CursorTrail）。
 * - 滑到文字輸入框時隱藏准心、還原系統 I-beam（見 globals.css 的 .cursor-custom 規則）。
 * - 透過直接寫 transform 跟隨指標，零延遲；大小/顏色用 CSS transition 平滑變化。
 * - 滑到可點擊元素：變琥珀金鎖定色「突然亮起」＋一道光環轉一圈（cursor-sweep），更顯眼。
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [state, setState] = useState<CursorState>("default");
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const [spinKey, setSpinKey] = useState(0); // 每次「進入 hover」+1 → 重播一次掃描光環

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("cursor-custom");

    const move = (e: MouseEvent) => {
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      const t = e.target as Element | null;
      if (t?.closest(TEXT_FIELD)) setState("text");
      else if (t?.closest(INTERACTIVE)) setState("hover");
      else setState("default");
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      root.classList.remove("cursor-custom");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const hover = state === "hover";
  // 進入 hover 的瞬間重播掃描光環（同一元素內移動不會重觸發）
  useEffect(() => {
    if (state === "hover") setSpinKey((k) => k + 1);
  }, [state]);

  const ring = (hover ? 40 : 26) * (down ? 0.82 : 1);
  const dash = ring * 0.62;
  const c = hover ? LOCK : REST;
  const center = "absolute left-0 top-0";
  const centerStyle = { transform: "translate(-50%, -50%)" } as const;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[10000]"
      style={{ display: !visible || state === "text" ? "none" : "block" }}
    >
      {/* 外環 */}
      <div
        className={`${center} rounded-full`}
        style={{
          ...centerStyle,
          width: ring,
          height: ring,
          border: `1.5px solid ${c.ring}`,
          boxShadow: `0 0 ${hover ? 18 : 12}px ${c.glow}`,
          transition: "width .18s ease, height .18s ease, border-color .18s ease, box-shadow .18s ease",
        }}
      />
      {/* 旋轉虛線環（聲納感，常駐） */}
      <div
        className={`${center} rounded-full`}
        style={{
          width: dash,
          height: dash,
          border: `1px dashed ${c.ring}`,
          opacity: 0.5,
          animation: "cursor-spin 4s linear infinite",
          transition: "width .18s ease, height .18s ease, border-color .18s ease",
        }}
      />
      {/* 鎖定掃描光環：進入 hover 時「亮起＋轉一圈」一次後淡出（像載入轉圈） */}
      {hover && (
        <div
          key={spinKey}
          className={`${center} rounded-full`}
          style={{
            width: ring + 8,
            height: ring + 8,
            background:
              "conic-gradient(from 0deg, transparent 268deg, rgba(251,191,36,0.55) 320deg, #fff 358deg, transparent 360deg)",
            WebkitMaskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            maskImage:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            animation: "cursor-sweep .55s ease-out forwards",
          }}
        />
      )}
      {/* 中心點 */}
      <div
        className={`${center} rounded-full`}
        style={{
          ...centerStyle,
          width: hover ? 6 : 5,
          height: hover ? 6 : 5,
          background: c.dot,
          boxShadow: `0 0 8px ${c.glow}`,
          opacity: hover ? 0 : 1,
          transition: "opacity .15s ease, background .18s ease",
        }}
      />
    </div>
  );
}
