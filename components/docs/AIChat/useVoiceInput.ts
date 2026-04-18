"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onError?: (msg: string) => void;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

const BAND_INDICES = [1, 2, 3, 5, 7, 9, 12, 15, 19, 24, 29, 34];
export const NUM_BANDS = BAND_INDICES.length;

export type VoiceState = "idle" | "listening" | "processing";

const isMobileDevice =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function useVoiceInput({ onResult, onError }: UseVoiceInputOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [bands, setBands] = useState<number[]>(Array(NUM_BANDS).fill(0));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const isSupported =
    !isMobileDevice &&
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // ── 波形分析迴圈 ──────────────────────────────────────────────────
  const startAnalyserLoop = useCallback(() => {
    const tick = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      if (!analyser || !dataArray) return;
      analyser.getByteFrequencyData(dataArray);
      setBands(BAND_INDICES.map((idx) => (dataArray[idx] ?? 0) / 255));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAnalyser = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    dataArrayRef.current = null;
    setBands(Array(NUM_BANDS).fill(0));
  }, []);

  // ── 開始錄音 ─────────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (!isSupported || voiceState !== "idle") return;

    // Web Audio 分析器
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as unknown as Uint8Array<ArrayBuffer>;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      startAnalyserLoop();
    } catch {
      // getUserMedia 失敗時仍繼續，無波形
    }

    // SpeechRecognition
    // 手機用 continuous: false（更穩定）；桌面用 continuous: true（可說多句）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "zh-TW";
    recognition.continuous = !isMobileDevice;
    recognition.interimResults = true;

    let finalTranscript = "";
    let lastInterimTranscript = "";

    recognition.onresult = (e: {
      results: SpeechRecognitionResultList;
      resultIndex: number;
    }) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          lastInterimTranscript = e.results[i][0].transcript;
        }
      }
    };

    recognition.onerror = (e: { error: string }) => {
      if (e.error !== "aborted") onError?.(`語音辨識錯誤：${e.error}`);
      stopAnalyser();
      setVoiceState("idle");
    };

    // onend：手動 stop 或手機 auto-stop 後觸發
    // 若沒有 isFinal 結果（手機常見），嘗試用最後的 interim
    recognition.onend = () => {
      const result = finalTranscript.trim() || lastInterimTranscript.trim();
      if (result) onResult(result);
      stopAnalyser();
      setVoiceState("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceState("listening");
  }, [isSupported, voiceState, onResult, onError, startAnalyserLoop, stopAnalyser]);

  // ── 停止錄音（手動）────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (voiceState !== "listening") return;
    // 立即停波形，切換到 processing 轉圈
    stopAnalyser();
    setVoiceState("processing");
    // recognition.stop() → 觸發 onend → 送文字 → setVoiceState("idle")
    recognitionRef.current?.stop();
  }, [voiceState, stopAnalyser]);

  const toggle = useCallback(() => {
    if (voiceState === "idle") start();
    else if (voiceState === "listening") stop();
    // processing 狀態不響應點擊
  }, [voiceState, start, stop]);

  useEffect(() => () => {
    stopAnalyser();
    recognitionRef.current?.abort();
  }, [stopAnalyser]);

  return {
    voiceState,
    isSupported,
    toggle,
    bands,
  };
}
