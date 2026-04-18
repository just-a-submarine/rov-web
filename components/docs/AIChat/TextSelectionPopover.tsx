"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare } from "lucide-react";

interface TextSelectionPopoverProps {
  containerSelector: string; // e.g. ".mdx-content"
  onAskAboutSelection: (selectedText: string) => void;
}

interface PopoverPosition {
  x: number;
  y: number;
}

export function TextSelectionPopover({
  containerSelector,
  onAskAboutSelection,
}: TextSelectionPopoverProps) {
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [selectedText, setSelectedText] = useState("");

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? "";

    if (!text || text.length < 5) {
      setPosition(null);
      setSelectedText("");
      return;
    }

    // 確認選取範圍在目標容器內
    const container = document.querySelector(containerSelector);
    if (!container) {
      setPosition(null);
      return;
    }

    const range = selection!.getRangeAt(0);
    const isInsideContainer = container.contains(range.commonAncestorContainer);
    if (!isInsideContainer) {
      setPosition(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 6,
    });
    setSelectedText(text);
  }, [containerSelector]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    // 點選浮動按鈕本身時不清除
    if (target.closest("[data-ai-popover]")) return;
    setPosition(null);
    setSelectedText("");
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  if (!position) return null;

  return (
    <div
      data-ai-popover
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)",
        zIndex: 9998,
      }}
    >
      <button
        onClick={() => {
          onAskAboutSelection(selectedText);
          setPosition(null);
          setSelectedText("");
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium
          bg-surface border border-accent-cyan/40 text-accent-cyan shadow-lg
          hover:bg-accent-cyan-dim transition-colors whitespace-nowrap"
      >
        <MessageSquare size={12} />
        詢問 AI
      </button>
    </div>
  );
}
