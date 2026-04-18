"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "./useChat";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan-dim border border-accent-cyan/30 flex items-center justify-center mt-0.5">
          <span className="text-accent-cyan text-xs">AI</span>
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-accent-cyan-dim text-foreground border border-accent-cyan/20"
            : "bg-surface-2 text-foreground/90"
        }`}
      >
        {/* 附件預覽 */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {message.attachments.map((att, i) => (
              <img
                key={i}
                src={att.url}
                alt={att.name}
                className="h-16 w-16 object-cover rounded-md border border-border"
              />
            ))}
          </div>
        )}

        {/* 訊息內容 */}
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {isStreaming && message.content === "" && (
              <span className="inline-flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan/60 animate-bounce" />
              </span>
            )}
            {isStreaming && message.content !== "" && (
              <span className="inline-block w-0.5 h-3.5 bg-accent-cyan/70 ml-0.5 animate-pulse align-text-bottom" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
