"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

interface SidebarProps {
  docs: DocMeta[];
}

interface DocGroup {
  category: string;
  docs: DocMeta[];
}

/** 依 frontmatter 的 category 分組，保留首次出現順序與組內順序。 */
function groupDocs(docs: DocMeta[]): DocGroup[] {
  const groups: DocGroup[] = [];
  for (const doc of docs) {
    const category = doc.category ?? "其他";
    let group = groups.find((g) => g.category === category);
    if (!group) {
      group = { category, docs: [] };
      groups.push(group);
    }
    group.docs.push(doc);
  }
  return groups;
}

export function Sidebar({ docs }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = groupDocs(docs);

  const renderGroups = () =>
    groups.map((group) => (
      <div key={group.category} className="mb-4 last:mb-0">
        <p className="px-3 mb-1.5 text-[0.7rem] font-semibold text-muted uppercase tracking-widest">
          {group.category}
        </p>
        <div className="flex flex-col gap-0.5">
          {group.docs.map((doc) => {
            const href = `/docs/${doc.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={doc.slug}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-150 leading-snug
                  ${
                    active
                      ? "bg-accent-cyan-dim text-accent-cyan font-medium"
                      : "text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
              >
                {doc.title}
              </Link>
            );
          })}
        </div>
      </div>
    ));

  return (
    <>
      {/* ── 行動版：可折疊索引 ── */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-border bg-surface-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={14} />
            文件索引
          </span>
          {mobileOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {mobileOpen && (
          <nav className="mt-2 rounded-lg border border-border bg-surface p-2">
            {renderGroups()}
          </nav>
        )}
      </div>

      {/* ── 桌面版：固定側邊欄 ── */}
      <aside className="hidden md:block w-56 flex-shrink-0">
        <div className="sticky top-20">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-3">
            文件索引
          </p>
          <nav>{renderGroups()}</nav>
        </div>
      </aside>
    </>
  );
}
