"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Github } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

const navLinks = [
  { href: "/midterm", label: "期中報告" },
  { href: "/final",   label: "期末報告" },
  { href: "/docs",    label: "文件"     },
  { href: "/repos",   label: "倉庫"     },
];

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo size={28} />
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150
                  ${active
                    ? "text-accent-cyan bg-accent-cyan-dim"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: GitHub + QR */}
        <div className="flex items-center gap-2">
          <a
            href={site.githubPersonalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded border border-border text-muted hover:text-foreground hover:border-accent-cyan/50 transition-colors"
            aria-label="個人 GitHub"
          >
            <Github size={15} />
          </a>
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded border border-border text-muted hover:text-foreground transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all
                    ${active
                      ? "text-accent-cyan bg-accent-cyan-dim"
                      : "text-muted hover:text-foreground hover:bg-surface-2"
                    }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
