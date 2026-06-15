import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { allDocParams, loadDoc, loadNavSections, pagerFor } from "@/lib/docs";
import { mdxComponents } from "@/components/docs/mdx-components";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsToc } from "@/components/docs/DocsToc";

interface DocPageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug: string[] }> {
  return allDocParams();
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = loadDoc(slug);
  if (!doc) return { title: "Docs · Sentinel" };
  const path = slug.length ? `/docs/${slug.join("/")}` : "/docs";
  return {
    title: `${doc.title} · Sentinel Docs`,
    description: doc.description || undefined,
    alternates: { canonical: path },
  };
}

/**
 * Markdown docs page. Renders sentinel-docs content (read at build time) inside
 * the cinematic docs shell: sidebar, article, and table of contents.
 */
export default async function DocPage({ params }: DocPageProps): Promise<React.JSX.Element> {
  const { slug = [] } = await params;
  const doc = loadDoc(slug);
  if (!doc) notFound();

  const href = slug.length ? `/docs/${slug.join("/")}` : "/docs";
  const sections = loadNavSections();
  const { prev, next } = pagerFor(href);

  const { content } = await compileMDX({
    source: doc.source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          rehypeHighlight,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ],
      },
    },
  });

  return (
    <div className="relative min-h-screen bg-ink-950 text-porcelain">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-aurora-radial opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <DocsSidebar sections={sections} />

        <article className="min-w-0 flex-1 lg:max-w-3xl">
          <p className="font-brand-mono text-xs uppercase tracking-[0.2em] text-gold">Documentation</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-porcelain">{doc.title}</h1>
          {doc.description && <p className="mt-2 text-porcelain/60">{doc.description}</p>}

          <div className="mt-8 docs-content">{content}</div>

          <nav className="mt-12 flex items-center justify-between gap-4 border-t border-porcelain/10 pt-6">
            {prev ? (
              <Link href={prev.href} className="group text-left">
                <span className="block text-xs text-porcelain/50">Previous</span>
                <span className="font-medium text-porcelain group-hover:text-gold">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={next.href} className="group text-right">
                <span className="block text-xs text-porcelain/50">Next</span>
                <span className="font-medium text-porcelain group-hover:text-gold">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        <DocsToc toc={doc.toc} />
      </div>
    </div>
  );
}
