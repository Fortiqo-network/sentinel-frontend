import type { TocEntry } from "@/lib/docs";
import { cn } from "@/lib/utils/cn";

interface DocsTocProps {
  toc: TocEntry[];
}

/**
 * Right-hand "On this page" table of contents. Anchors link to heading ids
 * produced by rehype-slug. Hidden below xl to keep the reading column wide.
 *
 * @example
 * <DocsToc toc={doc.toc} />
 */
export function DocsToc({ toc }: DocsTocProps): React.JSX.Element | null {
  if (toc.length === 0) return null;
  return (
    <aside className="sticky top-20 hidden h-fit w-56 shrink-0 xl:block">
      <p className="mb-3 font-brand-mono text-xs uppercase tracking-[0.16em] text-porcelain/45">On this page</p>
      <ul className="space-y-1.5 border-l border-porcelain/10">
        {toc.map((entry) => (
          <li key={entry.id} className={cn(entry.depth === 3 && "ml-3")}>
            <a
              href={`#${entry.id}`}
              className="-ml-px block border-l border-transparent pl-3 text-sm text-porcelain/55 hover:border-gold hover:text-gold"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
