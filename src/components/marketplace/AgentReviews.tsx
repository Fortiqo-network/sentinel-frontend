"use client";

import * as React from "react";
import {
  getReviews,
  submitReview,
  deleteMyReview,
  respondToReview,
  deleteReviewResponse,
  reportReview,
  type ReviewList,
} from "@/lib/api/reviews";
import { isSentinelApiError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth";

interface Props {
  agentId: string;
  ownerId?: string;
}

function Stars({ value }: { value: number }): React.JSX.Element {
  return (
    <span className="text-gold" aria-label={`${value} out of 5`}>
      {"★★★★★".slice(0, value)}
      <span className="text-porcelain/25">{"★★★★★".slice(value)}</span>
    </span>
  );
}

/**
 * Reviews & ratings for an agent: aggregate, list, and a write form gated to
 * subscribers (a 403 from the API is surfaced as a subscribe prompt).
 *
 * @example
 * <AgentReviews agentId={agent.id} />
 */
export function AgentReviews({ agentId, ownerId }: Props): React.JSX.Element {
  const [data, setData] = React.useState<ReviewList | null>(null);
  const [rating, setRating] = React.useState(5);
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = React.useState("");
  const [respondingId, setRespondingId] = React.useState<string | null>(null);
  const [responseText, setResponseText] = React.useState("");
  const [respondBusy, setRespondBusy] = React.useState(false);
  const [reportingId, setReportingId] = React.useState<string | null>(null);
  const [reportReason, setReportReason] = React.useState("spam");
  const [reportBusy, setReportBusy] = React.useState(false);
  const [reportedIds, setReportedIds] = React.useState<Set<string>>(new Set());

  const user = useAuthStore((s) => s.user);
  const isOwner = Boolean(ownerId) && user?.id === ownerId;
  const isAuthed = Boolean(user);

  async function submitReport(reviewId: string): Promise<void> {
    setReportBusy(true);
    try {
      await reportReview(agentId, reviewId, reportReason);
      setReportedIds((prev) => new Set(prev).add(reviewId));
      setReportingId(null);
    } catch {
      setMessage("Could not report this review.");
    } finally {
      setReportBusy(false);
    }
  }

  function replaceItem(updatedId: string, next: { seller_response: string | null }): void {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((it) =>
              it.id === updatedId ? { ...it, seller_response: next.seller_response } : it,
            ),
          }
        : prev,
    );
  }

  async function saveResponse(reviewId: string): Promise<void> {
    if (responseText.trim().length === 0) return;
    setRespondBusy(true);
    try {
      const updated = await respondToReview(agentId, reviewId, responseText.trim());
      replaceItem(reviewId, { seller_response: updated.seller_response ?? null });
      setRespondingId(null);
      setResponseText("");
    } catch {
      setMessage("Could not post your response.");
    } finally {
      setRespondBusy(false);
    }
  }

  async function removeResponse(reviewId: string): Promise<void> {
    setRespondBusy(true);
    try {
      await deleteReviewResponse(agentId, reviewId);
      replaceItem(reviewId, { seller_response: null });
    } catch {
      setMessage("Could not remove your response.");
    } finally {
      setRespondBusy(false);
    }
  }

  const load = React.useCallback(async () => {
    try {
      setData(await getReviews(agentId));
    } catch {
      setData({ items: [], total: 0, average: null, count: 0 });
    }
  }, [agentId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      await submitReview(agentId, rating, body.trim() || undefined);
      setBody("");
      setStatus("idle");
      setMessage("Thanks — your review was saved.");
      await load();
    } catch (err) {
      setStatus("error");
      setMessage(
        isSentinelApiError(err) && err.statusCode === 403
          ? "You need to subscribe to this agent before reviewing it."
          : isSentinelApiError(err) && err.statusCode === 401
            ? "Please sign in to leave a review."
            : "Could not save your review. Please try again.",
      );
    }
  }

  async function removeMine(): Promise<void> {
    try {
      await deleteMyReview(agentId);
      setMessage("Your review was removed.");
      await load();
    } catch {
      setMessage("Could not remove your review.");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-porcelain">Reviews</h2>
        {data && data.count > 0 ? (
          <span className="text-sm text-porcelain/70">
            <Stars value={Math.round(data.average ?? 0)} />{" "}
            <span className="font-medium text-porcelain">{(data.average ?? 0).toFixed(1)}</span>{" "}
            ({data.count})
          </span>
        ) : (
          <span className="text-sm text-porcelain/50">No reviews yet</span>
        )}
      </div>

      {/* Write form */}
      <form onSubmit={submit} className="space-y-3 rounded-xl border border-porcelain/10 bg-ink-800/40 p-4">
        <div className="flex items-center gap-2">
          <label htmlFor="review-rating" className="text-xs font-medium text-porcelain/70">
            Your rating
          </label>
          <select
            id="review-rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="sentinel-focus rounded-lg border border-porcelain/15 bg-ink-800/60 px-2 py-1 text-sm text-porcelain"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share how this agent performed (optional)"
          rows={3}
          maxLength={4000}
          className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2 text-sm text-porcelain placeholder:text-porcelain/30"
        />
        {message && (
          <p className={status === "error" ? "text-xs text-red-400" : "text-xs text-emerald-400"}>{message}</p>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink-950 transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {status === "submitting" ? "Saving…" : "Submit review"}
        </button>
      </form>

      {/* List */}
      <ul className="space-y-4">
        {data?.items.map((r) => (
          <li key={r.id} className="rounded-lg border border-porcelain/10 bg-ink-800/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-porcelain">{r.reviewer_name ?? "Anonymous"}</span>
              <Stars value={r.rating} />
            </div>
            {r.body && <p className="mt-1.5 text-sm text-porcelain/70">{r.body}</p>}
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-porcelain/40">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>

            {r.seller_response && (
              <div className="mt-3 rounded-lg border-l-2 border-gold/50 bg-ink-900/40 px-3 py-2">
                <p className="text-xs font-semibold text-gold">Developer&apos;s response</p>
                <p className="mt-1 text-sm text-porcelain/70">{r.seller_response}</p>
              </div>
            )}

            {isOwner && (
              <div className="mt-3">
                {respondingId === r.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Write a public reply…"
                      rows={2}
                      maxLength={4000}
                      className="sentinel-focus block w-full rounded-lg border border-porcelain/15 bg-ink-800/60 px-3 py-2 text-sm text-porcelain placeholder:text-porcelain/30"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={respondBusy}
                        onClick={() => void saveResponse(r.id)}
                        className="rounded-lg bg-gold px-3 py-1 text-xs font-semibold text-ink-950 transition-colors hover:bg-gold/90 disabled:opacity-60"
                      >
                        {respondBusy ? "Saving…" : "Post reply"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRespondingId(null)}
                        className="rounded-lg px-3 py-1 text-xs text-porcelain/50 hover:text-porcelain/80"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRespondingId(r.id);
                        setResponseText(r.seller_response ?? "");
                      }}
                      className="text-xs text-gold/80 underline-offset-2 hover:text-gold hover:underline"
                    >
                      {r.seller_response ? "Edit response" : "Respond"}
                    </button>
                    {r.seller_response && (
                      <button
                        type="button"
                        disabled={respondBusy}
                        onClick={() => void removeResponse(r.id)}
                        className="text-xs text-porcelain/40 underline-offset-2 hover:text-porcelain/70 hover:underline disabled:opacity-60"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {isAuthed && !isOwner && (
              <div className="mt-2">
                {reportedIds.has(r.id) ? (
                  <span className="text-xs text-porcelain/40">Reported — thanks.</span>
                ) : reportingId === r.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="sentinel-focus rounded-lg border border-porcelain/15 bg-ink-800/60 px-2 py-1 text-xs text-porcelain"
                    >
                      <option value="spam">Spam</option>
                      <option value="abuse">Abuse</option>
                      <option value="off_topic">Off-topic</option>
                    </select>
                    <button
                      type="button"
                      disabled={reportBusy}
                      onClick={() => void submitReport(r.id)}
                      className="rounded-lg bg-ink-700 px-2 py-1 text-xs text-porcelain transition-colors hover:bg-ink-600 disabled:opacity-60"
                    >
                      {reportBusy ? "Sending…" : "Send report"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportingId(null)}
                      className="text-xs text-porcelain/40 hover:text-porcelain/70"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReportingId(r.id)}
                    className="text-xs text-porcelain/30 underline-offset-2 hover:text-porcelain/60 hover:underline"
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {data && data.count > 0 && (
        <button
          type="button"
          onClick={removeMine}
          className="text-xs text-porcelain/40 underline-offset-2 hover:text-porcelain/70 hover:underline"
        >
          Remove my review
        </button>
      )}
    </section>
  );
}
