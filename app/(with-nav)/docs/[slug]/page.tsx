import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDocsMeta, getDocContent, getAdjacentDocs } from "@/lib/docs";
import { extractToc, rehypeHeadingIds } from "@/lib/toc";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { AIChatWidget } from "@/components/docs/AIChat";
import { Callout } from "@/components/docs/Callout";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { DocPager } from "@/components/docs/DocPager";

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

/** 標題加上錨點連結（id 由 rehypeHeadingIds 注入）。 */
function withAnchor(Tag: "h2" | "h3" | "h4") {
  return function HeadingWithAnchor({
    id,
    children,
    ...rest
  }: React.ComponentPropsWithoutRef<"h2">) {
    return (
      <Tag id={id} {...rest}>
        {children}
        {id && (
          <a href={`#${id}`} className="heading-anchor" aria-label="連結至此段落">
            #
          </a>
        )}
      </Tag>
    );
  };
}

const components = {
  table: TableWrapper,
  Callout,
  h2: withAnchor("h2"),
  h3: withAnchor("h3"),
  h4: withAnchor("h4"),
};

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

  const toc = extractToc(doc.content);
  const { prev, next } = getAdjacentDocs(slug);

  return (
    <>
      <div className="flex gap-8">
        <article className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground mb-1">{doc.title}</h1>
          {doc.description && (
            <p className="text-muted text-sm mb-6">{doc.description}</p>
          )}
          <div className="h-px bg-border mb-8" />
          <div className="mdx-content">
            <MDXRemote
              source={doc.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeHeadingIds],
                },
              }}
              components={components}
            />
          </div>
          <DocPager prev={prev} next={next} />
        </article>
        <TableOfContents items={toc} />
      </div>
      <AIChatWidget docTitle={doc.title} docSlug={slug} docContent={doc.content} />
    </>
  );
}
