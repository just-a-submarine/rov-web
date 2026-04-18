import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDocsMeta, getDocContent } from "@/lib/docs";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { AIChatWidget } from "@/components/docs/AIChat";

interface Props {
  params: Promise<{ slug: string }>;
}

function TableWrapper(props: React.ComponentPropsWithoutRef<"table">) {
  const { style, ...rest } = props;
  return (
    <div style={{ overflowX: "auto", marginBottom: "1.2rem" }}>
      <table style={{ ...style, marginBottom: 0 }} {...rest} />
    </div>
  );
}

const components = { table: TableWrapper };

export async function generateStaticParams() {
  return getAllDocsMeta().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocContent(slug);
  return { title: doc?.title ?? slug };
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = getDocContent(slug);
  if (!doc) notFound();

  return (
    <>
      <article>
        <h1 className="text-2xl font-bold text-foreground mb-1">{doc.title}</h1>
        {doc.description && (
          <p className="text-muted text-sm mb-6">{doc.description}</p>
        )}
        <div className="h-px bg-border mb-8" />
        <div className="mdx-content">
          <MDXRemote
            source={doc.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            components={components}
          />
        </div>
      </article>
      <AIChatWidget
        docTitle={doc.title}
        docSlug={slug}
        docContent={doc.content}
      />
    </>
  );
}
