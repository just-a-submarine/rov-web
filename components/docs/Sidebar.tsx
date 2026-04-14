"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocMeta } from "@/lib/docs";

interface SidebarProps {
  docs: DocMeta[];
}

export function Sidebar({ docs }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="sticky top-20">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-3">
          文件索引
        </p>
        <nav className="flex flex-col gap-0.5">
          {docs.map((doc) => {
            const href = `/docs/${doc.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={doc.slug}
                href={href}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-150 leading-snug
                  ${active
                    ? "bg-accent-cyan-dim text-accent-cyan font-medium"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
              >
                {doc.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
