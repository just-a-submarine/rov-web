"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function QRCorner() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  return (
    <div className="hidden sm:flex items-center justify-center rounded border border-border p-0.5" style={{ background: "rgba(10,14,26,0.8)" }}>
      <QRCodeSVG
        value={url}
        size={42}
        bgColor="transparent"
        fgColor="#22D3EE"
        level="M"
      />
    </div>
  );
}
