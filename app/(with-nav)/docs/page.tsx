import { redirect } from "next/navigation";
import { getAllDocsMeta } from "@/lib/docs";

interface Props {
  searchParams: Promise<{ assistant?: string }>;
}

// /docs 轉址到第一篇文件；若帶 ?assistant=1（從期末報告核心頁點進來）則保留參數，
// 讓落地的文件頁自動彈開 AI 助手。
export default async function DocsIndexPage({ searchParams }: Props) {
  const { assistant } = await searchParams;
  const qs = assistant ? "?assistant=1" : "";
  const docs = getAllDocsMeta();
  const first = docs[0];
  redirect(`/docs/${first ? first.slug : "01-system-overview"}${qs}`);
}
