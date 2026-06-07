import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

/**
 * Animated loading skeleton. Use to fill space while async content loads.
 * Compose multiple Skeletons to match the shape of the real content.
 *
 * @example
 * <Skeleton className="h-4 w-48" />
 * <Skeleton className="h-32 w-full rounded-lg" />
 */
export function Skeleton({ className }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-100", className)}
      aria-hidden="true"
    />
  );
}

/** Skeleton preset for an agent card. */
export function AgentCardSkeleton(): React.JSX.Element {
  return (
    <div className="sentinel-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-8 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}
