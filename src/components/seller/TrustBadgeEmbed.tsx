"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildBadgeEmbed } from "@/lib/badge";

type SnippetKind = "html" | "markdown" | "iframe";

const SNIPPET_TABS: { key: SnippetKind; label: string }[] = [
  { key: "html", label: "HTML" },
  { key: "markdown", label: "Markdown" },
  { key: "iframe", label: "iframe" },
];

/**
 * "Verified by Sentinel" badge embed panel for the seller portal (B3).
 *
 * Shows a live preview of the agent's trust badge (served by the Sentinel API)
 * and gives sellers copy-paste HTML / Markdown / iframe snippets to drop the
 * badge onto their own site. The badge is fetched live, so the score it shows is
 * always current — there is nothing to keep in sync.
 */
export function TrustBadgeEmbed({ slug }: { slug: string }): React.JSX.Element {
  const embed = React.useMemo(() => buildBadgeEmbed(slug), [slug]);
  const [active, setActive] = React.useState<SnippetKind>("html");
  const [copied, setCopied] = React.useState(false);

  const snippet = embed[active];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — selection still works.
      setCopied(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verified by Sentinel badge</CardTitle>
        <CardDescription>
          Embed your live trust score on your own site. The badge always shows
          your current score — no need to update it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Preview:</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={embed.svgUrl} alt="Verified by Sentinel" height={20} />
        </div>

        <div className="flex gap-1" role="tablist" aria-label="Embed format">
          {SNIPPET_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={
                "rounded px-3 py-1 text-sm " +
                (active === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-start gap-2">
          <pre className="flex-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">
            <code>{snippet}</code>
          </pre>
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
