"use client";

import { Mic } from "lucide-react";
import type { VoiceState } from "./useVoiceInput";

interface VoiceWaveButtonProps {
  voiceState: VoiceState;
  isSupported: boolean;
  bands: number[];
  onClick: () => void;
}

export function VoiceWaveButton({
  voiceState,
  isSupported,
  bands,
  onClick,
}: VoiceWaveButtonProps) {
  if (!isSupported) return null;

  // processing 時禁用點擊
  const disabled = voiceState === "processing";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={
        voiceState === "listening"
          ? "點擊停止錄音"
          : voiceState === "processing"
          ? "處理中…"
          : "語音輸入"
      }
      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
        text-muted hover:text-foreground hover:bg-surface-2 transition-colors
        disabled:cursor-not-allowed disabled:opacity-70"
    >
      {voiceState === "listening" && (
        // 波形：12 根白色豎條，靜音時 1px，說話時波動
        <div className="flex items-end gap-[1.5px]" style={{ width: 32, height: 18 }}>
          {bands.map((level, i) => (
            <div
              key={i}
              className="rounded-full bg-foreground/80"
              style={{
                width: 2,
                height: Math.max(1, Math.round(level * 18)),
                transition: "height 55ms ease-out",
                transitionDelay: `${i * 5}ms`,
              }}
            />
          ))}
        </div>
      )}

      {voiceState === "processing" && (
        // 轉圈 Loading 動畫
        <div
          className="w-[18px] h-[18px] rounded-full border-2 animate-spin"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            borderTopColor: "rgba(255,255,255,0.8)",
          }}
        />
      )}

      {voiceState === "idle" && <Mic size={16} />}
    </button>
  );
}
