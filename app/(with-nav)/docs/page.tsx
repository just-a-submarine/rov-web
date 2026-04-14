import { redirect } from "next/navigation";
import { getAllDocsMeta } from "@/lib/docs";

export default function DocsIndexPage() {
  const docs = getAllDocsMeta();
  const first = docs[0];
  if (first) redirect(`/docs/${first.slug}`);
  redirect("/docs/01-system-overview");
}
