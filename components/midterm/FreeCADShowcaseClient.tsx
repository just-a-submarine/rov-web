"use client";

import dynamic from "next/dynamic";

// R3F (WebGL) must be loaded client-side only
const FreeCADShowcase = dynamic(
  () => import("./FreeCADShowcase").then((m) => m.FreeCADShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center text-muted text-sm font-mono">
        Loading 3D…
      </div>
    ),
  }
);

export function FreeCADShowcaseClient() {
  return <FreeCADShowcase />;
}
