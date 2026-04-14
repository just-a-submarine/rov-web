"use client";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 36, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG：極簡線條潛艇剪影 */}
      <svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 60 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="只是一台潛水艇 logo"
      >
        {/* 艇身主體 */}
        <ellipse
          cx="28" cy="20"
          rx="22" ry="11"
          stroke="url(#logo-grad)"
          strokeWidth="1.8"
          fill="none"
        />
        {/* 指揮塔 */}
        <rect
          x="22" y="9"
          width="10" height="7"
          rx="1.5"
          stroke="url(#logo-grad)"
          strokeWidth="1.6"
          fill="none"
        />
        {/* 潛望鏡 */}
        <line x1="27" y1="9" x2="27" y2="4" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="27" y1="4" x2="33" y2="4" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" />
        {/* 螺旋槳（後端）*/}
        <line x1="49" y1="15" x2="53" y2="13" stroke="url(#logo-grad)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="49" y1="25" x2="53" y2="27" stroke="url(#logo-grad)" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="50" cy="20" r="1.5" fill="url(#logo-grad)" />
        {/* 氣泡 */}
        <circle cx="56" cy="10" r="1"   fill="#22D3EE" opacity="0.6" />
        <circle cx="59" cy="6"  r="0.7" fill="#22D3EE" opacity="0.4" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="60" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight gradient-text">
            只是一台潛水艇
          </span>
          <span className="text-xs text-muted font-mono tracking-wider">
            JUST A SUBMARINE
          </span>
        </div>
      )}
    </div>
  );
}
