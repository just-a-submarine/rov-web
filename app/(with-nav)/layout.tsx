import { TopNav } from "@/components/nav/TopNav";

export default function WithNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="flex-1">{children}</main>
    </>
  );
}
