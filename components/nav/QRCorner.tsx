"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

interface QRCornerProps {
  size?: number;
}

export function QRCorner({ size = 64 }: QRCornerProps) {
  const pathname = usePathname();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = origin ? `${origin}${pathname}` : "";

  if (!url) return null;

  return (
    <div className="hidden sm:flex items-center justify-center rounded border border-border p-1" style={{ background: "rgba(10,14,26,0.8)" }}>
      <QRCodeSVG
        value={url}
        size={size}
        bgColor="transparent"
        fgColor="#22D3EE"
        level="M"
      />
    </div>
  );
}
