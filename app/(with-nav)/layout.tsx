import { TopNav } from "@/components/nav/TopNav";
import { QRCorner } from "@/components/nav/QRCorner";
import { CursorTrail } from "@/components/effects/CursorTrail";

export default function WithNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="flex-1">{children}</main>

      {/* 固定右下角 QR — 觀眾可隨時掃描當前頁面 */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-1">
        <QRCorner />
        <span className="text-xs text-muted/40 font-mono hidden sm:block">此頁 QR</span>
      </div>

      {/* 滑鼠 / 觸控軌跡特效 */}
      <CursorTrail />
    </>
  );
}
