"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { ChatPanel } from "./ChatPanel";
import { TextSelectionPopover } from "./TextSelectionPopover";
import { useChat } from "./useChat";

// 提示氣泡：首次進入文件頁面顯示 3 秒
function HintBubble({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 8, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2
            bg-surface border border-accent-cyan/30 text-foreground/90
            text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap
            shadow-lg pointer-events-none"
          style={{ boxShadow: "0 4px 16px rgba(34,211,238,0.12)" }}
        >
          詢問 AI 助手
          {/* 指向右側 FAB 的小三角 */}
          <span
            className="absolute right-[-6px] top-1/2 -translate-y-1/2
              border-4 border-transparent border-l-accent-cyan/30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AIChatWidgetProps {
  docTitle: string;
  docSlug: string;
  docContent: string;
}

// 桌面版尺寸常數
// QR stack: bottom-5(20px) + ~94px ≈ 114px
// FAB: bottom = 152px（38px 以上間距離 QR）, height = 44px, top = 196px
// Panel: bottom = 204px（FAB top + 8px gap）
const FAB_BOTTOM_DESKTOP = 152; // px
const PANEL_BOTTOM_DESKTOP = FAB_BOTTOM_DESKTOP + 44 + 8; // 204px

export function AIChatWidget({ docTitle, docSlug, docContent }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [pendingSelectedText, setPendingSelectedText] = useState<string>("");
  // isMobile: true when viewport < 640px（Tailwind sm breakpoint）
  const [isMobile, setIsMobile] = useState(false);

  // 氣泡提示：3 秒後自動消失
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { messages, isStreaming, sendMessage, clearMessages, stopStreaming } =
    useChat({ docContext: docContent, docTitle });

  // 換文件時重置對話
  useEffect(() => {
    clearMessages();
    setPendingSelectedText("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docSlug]);

  const handleAskAboutSelection = useCallback((selectedText: string) => {
    setPendingSelectedText(selectedText);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (isStreaming) stopStreaming();
    setIsOpen(false);
  }, [isStreaming, stopStreaming]);

  // 手機版面板開啟時隱藏 FAB（用 style 確保可靠，不依賴 Tailwind 動態 class purge）
  const fabVisible = !(isMobile && isOpen);

  return (
    <>
      {/* 選取文字浮動按鈕 */}
      <TextSelectionPopover
        containerSelector=".mdx-content"
        onAskAboutSelection={handleAskAboutSelection}
      />

      {/* 聊天面板 */}
      <AnimatePresence>
        {isOpen && (
          <ChatPanel
            docTitle={docTitle}
            messages={messages}
            isStreaming={isStreaming}
            isMobile={isMobile}
            onClose={handleClose}
            onSend={sendMessage}
            onClear={clearMessages}
            panelBottomDesktop={PANEL_BOTTOM_DESKTOP}
            pendingSelectedText={pendingSelectedText}
            onClearSelectedText={() => setPendingSelectedText("")}
          />
        )}
      </AnimatePresence>

      {/* FAB 按鈕 */}
      <motion.button
        onClick={() => { setIsOpen((o) => !o); setShowHint(false); }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isOpen ? "關閉 AI 助手" : "開啟 AI 助手"}
        className="fixed z-[9999] w-11 h-11 rounded-full
          bg-surface border border-accent-cyan/40 text-accent-cyan
          hover:bg-accent-cyan-dim hover:border-accent-cyan/70 transition-colors
          flex items-center justify-center"
        style={{
          right: 20,
          bottom: isMobile ? 24 : FAB_BOTTOM_DESKTOP,
          display: fabVisible ? "flex" : "none",
          boxShadow: "0 4px 20px rgba(34,211,238,0.15)",
        }}
      >
        {/* 提示氣泡（未開啟時才顯示） */}
        {!isOpen && <HintBubble visible={showHint} />}

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={18} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* 未讀訊息提示點 */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-cyan border-2 border-background" />
        )}
      </motion.button>
    </>
  );
}
