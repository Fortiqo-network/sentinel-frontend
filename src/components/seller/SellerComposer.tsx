"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils/cn";
import { isSentinelApiError } from "@/lib/api/client";
import { createPost } from "@/lib/api/sellers-public";

type Kind = "impression" | "article";

/**
 * Composer for a seller to publish an impression or article to their public
 * feed. Seller-role is enforced by the API; a 403/401 surfaces as a toast.
 *
 * @example
 * <SellerComposer />
 */
export function SellerComposer(): React.JSX.Element {
  const { addToast } = useToast();
  const [kind, setKind] = React.useState<Kind>("impression");
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(): Promise<void> {
    const trimmed = body.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      await createPost({
        kind,
        title: kind === "article" ? title.trim() || null : null,
        bodyMd: trimmed,
      });
      addToast({ message: "Posted to your feed.", variant: "success" });
      setTitle("");
      setBody("");
    } catch (err) {
      const message = isSentinelApiError(err)
        ? err.statusCode === 403
          ? "Only sellers can post to a feed."
          : err.message
        : "Could not publish your post.";
      addToast({ message, variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-porcelain">Share an update</h2>
        <div className="ml-auto inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-porcelain/15">
          {(["impression", "article"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                kind === k
                  ? "bg-slate-900 text-white dark:bg-gold dark:text-ink-950"
                  : "text-slate-500 hover:text-slate-900 dark:text-porcelain/50 dark:hover:text-porcelain",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {kind === "article" && (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title"
          className="mb-3"
          maxLength={200}
        />
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={kind === "article" ? "Write your article…" : "Share a quick impression…"}
        rows={kind === "article" ? 6 : 3}
        maxLength={20000}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-porcelain/15 dark:bg-ink-800 dark:text-porcelain dark:placeholder:text-porcelain/30"
      />

      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={submit} disabled={busy || !body.trim()}>
          {busy ? "Posting…" : "Post"}
        </Button>
      </div>
    </Card>
  );
}
