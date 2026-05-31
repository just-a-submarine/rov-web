"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // 取最靠近頂部的可見標題
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 }
    );

    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <aside className="hidden xl:block w-52 flex-shrink-0">
      <div className="sticky top-20">
        <p className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest mb-3">
          <List size={13} />
          本頁目錄
        </p>
        <nav className="flex flex-col gap-0.5 border-l border-border">
          {items.map((item) => {
            const active = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`-ml-px border-l-2 py-1 text-sm leading-snug transition-colors duration-150
                  ${item.depth === 3 ? "pl-6" : "pl-3"}
                  ${
                    active
                      ? "border-accent-cyan text-accent-cyan font-medium"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
              >
                {item.text}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
