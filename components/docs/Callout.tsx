import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "success" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}

const CONFIG: Record<
  CalloutType,
  { color: string; border: string; bg: string; label: string }
> = {
  info: {
    color: "#22D3EE",
    border: "rgba(34,211,238,0.30)",
    bg: "rgba(34,211,238,0.07)",
    label: "說明",
  },
  warning: {
    color: "#FBBF24",
    border: "rgba(251,191,36,0.30)",
    bg: "rgba(251,191,36,0.07)",
    label: "注意",
  },
  success: {
    color: "#34D399",
    border: "rgba(52,211,153,0.30)",
    bg: "rgba(52,211,153,0.07)",
    label: "通過",
  },
  danger: {
    color: "#F87171",
    border: "rgba(248,113,113,0.34)",
    bg: "rgba(248,113,113,0.08)",
    label: "警告",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const cfg = CONFIG[type];

  return (
    <div
      className="my-5 rounded-xl border p-4"
      style={{
        borderColor: cfg.border,
        background: cfg.bg,
        borderLeftWidth: 3,
        borderLeftColor: cfg.color,
      }}
    >
      <p
        className="mb-1.5 text-xs font-semibold tracking-wide"
        style={{ color: cfg.color }}
      >
        {title ?? cfg.label}
      </p>
      <div className="callout-body text-sm leading-relaxed text-muted">
        {children}
      </div>
    </div>
  );
}

export default Callout;
