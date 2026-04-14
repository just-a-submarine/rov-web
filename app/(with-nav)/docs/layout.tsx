import { getAllDocsMeta } from "@/lib/docs";
import { Sidebar } from "@/components/docs/Sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const docs = getAllDocsMeta();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 flex gap-8">
      {/* Sidebar */}
      <Sidebar docs={docs} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
