"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils/cn";
import { isSentinelApiError } from "@/lib/api/client";
import {
  createComment,
  getComments,
  likePost,
  reportPost,
  unlikePost,
  type PostComment,
  type SellerPost,
} from "@/lib/api/sellers-public";

interface SellerFeedProps {
  posts: SellerPost[];
  total: number;
}

interface LikeState {
  liked: boolean;
  count: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Handles the "sign in to interact" case uniformly: a 401 from any social
 * write becomes a friendly toast rather than a thrown error.
 */
function useInteractionError(): (err: unknown, fallback: string) => void {
  const { addToast } = useToast();
  return React.useCallback(
    (err: unknown, fallback: string) => {
      if (isSentinelApiError(err) && err.statusCode === 401) {
        addToast({ message: "Sign in to interact with the feed.", variant: "warning" });
        return;
      }
      const message = isSentinelApiError(err) ? err.message : fallback;
      addToast({ message, variant: "error" });
    },
    [addToast],
  );
}

function CommentThread({ comments }: { comments: PostComment[] }): React.JSX.Element {
  const parents = comments.filter((c) => !c.parentCommentId);
  const repliesOf = (id: string): PostComment[] =>
    comments.filter((c) => c.parentCommentId === id);

  return (
    <ul className="space-y-3">
      {parents.map((c) => (
        <li key={c.id}>
          <CommentRow comment={c} />
          {repliesOf(c.id).length > 0 && (
            <ul className="mt-2 space-y-2 border-l border-porcelain/10 pl-4">
              {repliesOf(c.id).map((r) => (
                <li key={r.id}>
                  <CommentRow comment={r} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function CommentRow({ comment }: { comment: PostComment }): React.JSX.Element {
  return (
    <div className="rounded-lg bg-ink-800/60 px-3 py-2">
      <p className="text-xs font-medium text-porcelain/70">
        {comment.authorName ?? "User"}
        <span className="ml-2 font-normal text-porcelain/30">{formatDate(comment.createdAt)}</span>
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-porcelain/80">{comment.bodyMd}</p>
    </div>
  );
}

function PostCard({ post }: { post: SellerPost }): React.JSX.Element {
  const onError = useInteractionError();
  const { addToast } = useToast();
  const [like, setLike] = React.useState<LikeState>({ liked: false, count: post.likeCount });
  const [busyLike, setBusyLike] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [comments, setComments] = React.useState<PostComment[] | null>(null);
  const [commentText, setCommentText] = React.useState("");
  const [commentCount, setCommentCount] = React.useState(post.commentCount);
  const [reporting, setReporting] = React.useState(false);
  const [reportReason, setReportReason] = React.useState("");

  async function toggleLike(): Promise<void> {
    if (busyLike) return;
    setBusyLike(true);
    try {
      const next = like.liked ? await unlikePost(post.id) : await likePost(post.id);
      setLike({ liked: next.liked, count: next.likeCount });
    } catch (err) {
      onError(err, "Could not update like.");
    } finally {
      setBusyLike(false);
    }
  }

  async function toggleComments(): Promise<void> {
    const next = !open;
    setOpen(next);
    if (next && comments === null) {
      try {
        const data = await getComments(post.id);
        setComments(data.items);
      } catch (err) {
        onError(err, "Could not load comments.");
      }
    }
  }

  async function submitComment(): Promise<void> {
    const body = commentText.trim();
    if (!body) return;
    try {
      const created = await createComment(post.id, body);
      setComments((prev) => [...(prev ?? []), created]);
      setCommentCount((n) => n + 1);
      setCommentText("");
    } catch (err) {
      onError(err, "Could not post comment.");
    }
  }

  async function submitReport(): Promise<void> {
    const reason = reportReason.trim();
    if (!reason) return;
    try {
      await reportPost(post.id, reason);
      addToast({ message: "Report submitted for review.", variant: "success" });
      setReporting(false);
      setReportReason("");
    } catch (err) {
      onError(err, "Could not submit report.");
    }
  }

  return (
    <article className="glass ring-hairline rounded-2xl p-5">
      {post.kind === "article" && post.title && (
        <h3 className="mb-2 text-lg font-semibold text-porcelain">{post.title}</h3>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-porcelain/80">{post.bodyMd}</p>
      <p className="mt-3 text-xs text-porcelain/40">{formatDate(post.createdAt)}</p>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          disabled={busyLike}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors",
            like.liked ? "text-rose-400" : "text-porcelain/50 hover:text-porcelain",
          )}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
          </svg>
          <span className="tabular-nums">{like.count}</span>
        </button>

        <button
          type="button"
          onClick={toggleComments}
          className="inline-flex items-center gap-1.5 text-porcelain/50 transition-colors hover:text-porcelain"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 2c-4.418 0-8 3.134-8 7 0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 1.256-.203 2.6-.635 3.512-1.256A9.9 9.9 0 0 0 10 16c4.418 0 8-3.134 8-7s-3.582-7-8-7Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="tabular-nums">{commentCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setReporting((v) => !v)}
          className="ml-auto text-xs text-porcelain/40 transition-colors hover:text-rose-400"
        >
          Report
        </button>
      </div>

      {reporting && (
        <div className="mt-3 flex gap-2">
          <Input
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason (e.g. spam, abuse)"
            className="flex-1"
          />
          <Button variant="destructive" size="sm" onClick={submitReport} disabled={!reportReason.trim()}>
            Submit
          </Button>
        </div>
      )}

      {open && (
        <div className="mt-4 border-t border-porcelain/10 pt-4">
          {comments === null ? (
            <p className="text-sm text-porcelain/40">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-porcelain/40">No comments yet.</p>
          ) : (
            <CommentThread comments={comments} />
          )}

          <div className="mt-4 flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1"
            />
            <Button size="sm" onClick={submitComment} disabled={!commentText.trim()}>
              Post
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

/**
 * Interactive social feed on a seller's public profile: like, comment (with
 * one-level threaded replies), and report. Anonymous viewers can read; writes
 * prompt sign-in via a toast on 401. Post bodies render as safe plain text
 * (rich Markdown rendering is a separate shared-renderer task).
 *
 * @example
 * <SellerFeed posts={feed.items} total={feed.total} />
 */
export function SellerFeed({ posts, total }: SellerFeedProps): React.JSX.Element {
  if (total === 0) {
    return (
      <div className="glass ring-hairline rounded-2xl px-8 py-12 text-center">
        <p className="text-porcelain/40">No posts yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
