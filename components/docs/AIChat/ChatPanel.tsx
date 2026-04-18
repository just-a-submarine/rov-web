"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type KeyboardEvent,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { X, Trash2, Send, Plus, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { VoiceWaveButton } from "./VoiceWaveButton";
import { useVoiceInput } from "./useVoiceInput";
import type { Message, Attachment } from "./useChat";

interface ChatPanelProps {
  docTitle: string;
  messages: Message[];
  isStreaming: boolean;
  isMobile: boolean;
  onClose: () => void;
  onSend: (text: string, attachments: Attachment[], selectedText?: string) => void;
  onClear: () => void;
  panelBottomDesktop: number;
  pendingSelectedText?: string;
  onClearSelectedText: () => void;
}

export function ChatPanel({
  docTitle,
  messages,
  isStreaming,
  isMobile,
  onClose,
  onSend,
  onClear,
  panelBottomDesktop,
  pendingSelectedText,
  onClearSelectedText,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { voiceState, isSupported, toggle: toggleVoice, bands } = useVoiceInput({
    onResult: (transcript) =>
      setInput((prev) => (prev ? prev + " " + transcript : transcript)),
  });

  // 自動捲到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 開啟面板時聚焦輸入框
  useEffect(() => {
    // 延遲一幀，確保動畫後再聚焦，避免 iOS 鍵盤佈局問題
    const t = setTimeout(() => textareaRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (isStreaming) return;
    onSend(text, attachments, pendingSelectedText);
    setInput("");
    setAttachments([]);
    onClearSelectedText();
  }, [input, attachments, isStreaming, onSend, pendingSelectedText, onClearSelectedText]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const addImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachments((prev) => [
        ...prev,
        { type: "image", url: reader.result as string, name: file.name },
      ]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach(addImageFile);
      e.target.value = "";
    },
    [addImageFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach(addImageFile);
    },
    [addImageFile]
  );

  const removeAttachment = useCallback((idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const isEmpty = messages.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed z-[9999] flex flex-col rounded-2xl border border-border bg-surface overflow-hidden"
      style={
        isMobile
          ? {
              // 手機：全螢幕，留 TopNav(64px) 上方與底部(64px)空間
              left: 8, right: 8, top: 64, bottom: 64,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.06)",
            }
          : {
              // 桌面：固定 380×520，右下角，精確在 FAB 正上方
              right: 20,
              bottom: panelBottomDesktop,
              width: 380,
              height: 520,
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,211,238,0.06)",
            }
      }
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse flex-shrink-0" />
          <span className="text-xs font-medium text-muted truncate">
            {docTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {messages.length > 0 && (
            <button
              onClick={onClear}
              title="清除對話"
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-4">
            <div className="w-10 h-10 rounded-full bg-accent-cyan-dim border border-accent-cyan/20 flex items-center justify-center">
              <FileText size={18} className="text-accent-cyan" />
            </div>
            <div>
              <p className="text-sm text-foreground/70 font-medium">文件 AI 助手</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                已載入文件上下文。
                <br />
                有任何問題都可以直接詢問。
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={
                isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant"
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div
        className={`border-t border-border flex-shrink-0 transition-colors ${
          isDraggingOver ? "bg-accent-cyan-dim" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
      >
        {/* 選取文字 tag */}
        {pendingSelectedText && (
          <div className="flex items-center gap-2 px-3 pt-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted bg-surface-2 rounded-md px-2 py-1 flex-1 min-w-0 border border-border">
              <span className="text-accent-cyan/60 flex-shrink-0">選取：</span>
              <span className="truncate">
                {pendingSelectedText.length > 50
                  ? pendingSelectedText.slice(0, 50) + "…"
                  : pendingSelectedText}
              </span>
            </div>
            <button
              onClick={onClearSelectedText}
              className="flex-shrink-0 text-muted hover:text-foreground"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* 附件預覽 */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 pt-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative group">
                <img
                  src={att.url}
                  alt={att.name}
                  className="h-12 w-12 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface border border-border
                    text-muted hover:text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={9} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input bar — items-center 讓所有按鈕與輸入框垂直置中 */}
        <div className="flex items-center gap-1 px-2 py-2">
          {/* 新增附件 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="新增圖片"
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
              text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <Plus size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* 文字輸入 */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDraggingOver ? "放開以加入圖片" : "輸入問題…"}
            rows={1}
            className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm
              text-foreground placeholder:text-muted resize-none outline-none
              focus:border-accent-cyan/40 transition-colors overflow-y-auto leading-relaxed"
            style={{ minHeight: "36px", maxHeight: "96px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 96) + "px";
            }}
          />

          {/* 語音（波形按鈕） */}
          <VoiceWaveButton
            voiceState={voiceState}
            isSupported={isSupported}
            bands={bands}
            onClick={toggleVoice}
          />

          {/* 發送 */}
          <button
            onClick={handleSend}
            disabled={isStreaming || (!input.trim() && attachments.length === 0)}
            title="發送"
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              text-accent-cyan hover:bg-accent-cyan-dim"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
