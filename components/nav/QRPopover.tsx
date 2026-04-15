"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";

export function QRPopover() {
  const pathname = usePathname();
  const [origin, setOrigin] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // 切換頁面後自動關閉
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 點擊外部關閉
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const url = origin ? `${origin}${pathname}` : "";
  if (!url) return null;

  return (
    <div className="relative" ref={ref}>
      {/* 按鈕 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-8 h-8 flex items-center justify-center rounded border transition-colors
          ${open
            ? "border-accent-cyan/60 text-accent-cyan"
            : "border-border text-muted hover:text-foreground hover:border-accent-cyan/40"
          }`}
        aria-label="顯示此頁 QR Code"
      >
        <QrCode size={15} />
      </button>

      {/* 浮動面板 */}
      {open && (
        <div
          className="absolute right-0 top-10 z-50 rounded-xl border border-border/60 p-4 flex flex-col items-center gap-2"
          style={{ background: "rgba(8,12,24,0.97)", backdropFilter: "blur(16px)" }}
        >
          <QRCodeSVG
            value={url}
            size={148}
            bgColor="transparent"
            fgColor="#22D3EE"
            level="M"
          />
          <p className="text-xs text-muted font-mono w-[148px] truncate text-center">
            {pathname}
          </p>
        </div>
      )}
    </div>
  );
}
