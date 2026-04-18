"use client";

import { useState, useCallback, useRef } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
}

export interface Attachment {
  type: "image";
  url: string; // base64 data URL
  name: string;
}

interface UseChatOptions {
  docContext: string;
  docTitle: string;
}

export function useChat({ docContext, docTitle }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string, attachments: Attachment[] = [], selectedText?: string) => {
      if (isStreaming) return;

      const contextPrefix = selectedText
        ? `[選取的段落]\n"${selectedText}"\n\n[問題]\n`
        : "";

      const userContent = buildUserContent(
        contextPrefix + text,
        attachments
      );

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: contextPrefix + text,
        attachments,
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      abortRef.current = new AbortController();

      try {
        const apiMessages = buildApiMessages(
          [...messages, userMsg],
          userContent
        );

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            docContext,
            docTitle,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          const errJson = await res.json().catch(() => ({ error: "未知錯誤" }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: `錯誤：${errJson.error ?? res.statusText}` }
                : m
            )
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + delta }
                      : m
                  )
                );
              }
            } catch {
              // 忽略解析失敗的 chunk
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `連線錯誤：${(err as Error).message}` }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, docContext, docTitle]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, clearMessages, stopStreaming };
}

// ── helpers ────────────────────────────────────────────────────────────────

function buildUserContent(
  text: string,
  attachments: Attachment[]
): string | Array<{ type: string; [k: string]: unknown }> {
  if (attachments.length === 0) return text;

  const parts: Array<{ type: string; [k: string]: unknown }> = [
    { type: "text", text },
  ];
  for (const att of attachments) {
    if (att.type === "image") {
      parts.push({ type: "image_url", image_url: { url: att.url } });
    }
  }
  return parts;
}

function buildApiMessages(
  msgs: Message[],
  lastContent: ReturnType<typeof buildUserContent>
) {
  return msgs.map((m, i) => {
    if (i === msgs.length - 1 && m.role === "user") {
      return { role: "user", content: lastContent };
    }
    return { role: m.role, content: m.content };
  });
}
