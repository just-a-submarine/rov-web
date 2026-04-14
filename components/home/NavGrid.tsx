"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Presentation,
  Trophy,
  BookOpen,
  Github,
} from "lucide-react";

interface NavCard {
  href: string;
  icon: React.ReactNode;
  label: string;
  accent: string;
  dimBg: string;
}

const cards: NavCard[] = [
  {
    href: "/midterm",
    icon: <Presentation size={32} />,
    label: "期中報告",
    accent: "#22D3EE",
    dimBg: "rgba(34,211,238,0.08)",
  },
  {
    href: "/final",
    icon: <Trophy size={32} />,
    label: "期末報告",
    accent: "#A78BFA",
    dimBg: "rgba(167,139,250,0.08)",
  },
  {
    href: "/docs",
    icon: <BookOpen size={32} />,
    label: "技術文件",
    accent: "#6EE7B7",
    dimBg: "rgba(110,231,183,0.08)",
  },
  {
    href: "/repos",
    icon: <Github size={32} />,
    label: "GitHub 倉庫",
    accent: "#F9A8D4",
    dimBg: "rgba(249,168,212,0.08)",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function NavGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 w-full max-w-2xl mx-auto px-4"
    >
      {cards.map((card) => {
        const inner = (
          <motion.div
            variants={item}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.97 }}
            className="relative group cursor-pointer"
          >
            <div
              className="glass rounded-2xl p-7 flex flex-col items-center gap-4 text-center
                         transition-all duration-300 group-hover:border-opacity-30"
              style={{
                borderColor: "transparent",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = card.dimBg;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${card.accent}30`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200"
                style={{ background: card.dimBg, color: card.accent }}
              >
                {card.icon}
              </div>

              {/* Label */}
              <p className="text-lg font-bold text-foreground">{card.label}</p>

              {/* Arrow */}
              <span
                className="text-xl opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1"
                style={{ color: card.accent }}
              >
                →
              </span>
            </div>
          </motion.div>
        );

        return (
          <Link key={card.href} href={card.href}>
            {inner}
          </Link>
        );
      })}
    </motion.div>
  );
}
