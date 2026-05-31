import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DocMeta } from "@/lib/docs";

interface DocPagerProps {
  prev: DocMeta | null;
  next: DocMeta | null;
}

export function DocPager({ prev, next }: DocPagerProps) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 pt-6 border-t border-border grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-border p-4 transition-all duration-150 hover:border-accent-cyan/40 hover:bg-surface-2"
        >
          <span className="flex items-center gap-1 text-xs text-muted">
            <ChevronLeft size={13} />
            上一篇
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-accent-cyan">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-border p-4 text-right transition-all duration-150 hover:border-accent-cyan/40 hover:bg-surface-2 sm:items-end"
        >
          <span className="flex items-center justify-end gap-1 text-xs text-muted">
            下一篇
            <ChevronRight size={13} />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-accent-cyan">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
