"use client";

import { HullViewer } from "./HullViewer";

export function FreeCADShowcase() {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="text-center">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">3D Print × FreeCAD MCP</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">ROV 外殼模型</h2>
        <p className="text-muted text-sm mt-2 max-w-md mx-auto leading-relaxed">
          PETG 中段，外徑 90 mm × 長 250 mm，由 Claude 透過 FreeCAD MCP 自主建模。
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-xs text-muted font-mono mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan inline-block" />
          ROV_Hull.FCStd — 可拖曳旋轉
        </p>
        <HullViewer />
      </div>
    </div>
  );
}
