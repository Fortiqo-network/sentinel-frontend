import * as React from "react";
import { PageShell } from "@/components/marketing/PageShell";

export interface InfoPageProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}

/**
 * Simple content page on the cinematic marketing surface — used for legal,
 * status, and docs-bridge pages. Server-rendered for crawlable content.
 *
 * @example
 * <InfoPage eyebrow="Legal" title="Terms of Service">…</InfoPage>
 */
export function InfoPage({ eyebrow, title, intro, children }: InfoPageProps): React.JSX.Element {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 py-20">
        {eyebrow && (
          <p className="font-brand-mono text-xs uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
        )}
        <h1 className="mt-4 text-display-sm font-semibold text-porcelain">{title}</h1>
        {intro && <p className="mt-4 text-base text-porcelain/55">{intro}</p>}
        <div className="mt-10 space-y-4 text-sm leading-relaxed text-porcelain/60 [&_a]:text-gold [&_a:hover]:underline [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-porcelain">
          {children}
        </div>
      </section>
    </PageShell>
  );
}
