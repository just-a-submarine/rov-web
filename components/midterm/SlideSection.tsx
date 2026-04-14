"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface SlideSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SlideSection({ id, children, className = "" }: SlideSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section
      id={id}
      ref={ref}
      className={`min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-4 py-16 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="w-full max-w-5xl mx-auto"
      >
        {children}
      </motion.div>
    </section>
  );
}
