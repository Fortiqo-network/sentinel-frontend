import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Seal } from "./Seal";

/**
 * The SENTINEL wordmark — the brand's custom monoline letterforms, inlined so
 * they ink in `currentColor` and stay crisp at any size.
 */
export function Wordmark({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 -6 530 84"
      fill="none"
      className={cn("h-[0.9em] w-auto", className)}
      role="img"
      aria-label="Sentinel"
    >
      <g stroke="currentColor" strokeWidth="12" strokeLinejoin="bevel">
        <path d="M39 21 A15 15 0 1 0 24 36 A15 15 0 1 1 9 51" />
        <g transform="translate(74 0)"><path d="M6 0 V72 M0 6 H44 M0 36 H36 M0 66 H44" /></g>
        <g transform="translate(144 0)"><path d="M6 72 V0 L46 72 V0" /></g>
        <g transform="translate(222 0)"><path d="M0 6 H52 M26 0 V72" /></g>
        <g transform="translate(300 0)"><path d="M6 0 V72" /></g>
        <g transform="translate(338 0)"><path d="M6 72 V0 L46 72 V0" /></g>
        <g transform="translate(416 0)"><path d="M6 0 V72 M0 6 H44 M0 36 H36 M0 66 H44" /></g>
        <g transform="translate(486 0)"><path d="M6 0 V66 H44" /></g>
      </g>
    </svg>
  );
}

interface LogoProps {
  /** Where the logo links. Defaults to the home page. */
  href?: string;
  /** Stroke colour for the seal arcs (the wordmark uses currentColor). */
  sealStroke?: string;
  /** Show the wordmark beside the mark. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Primary brand lockup: the Living Mark beside the wordmark, linking home. The
 * seal re-seals on hover as a quiet micro-interaction.
 *
 * @example
 * <Logo href="/" />
 */
export function Logo({
  href = "/",
  sealStroke = "currentColor",
  showWordmark = true,
  className,
}: LogoProps): React.JSX.Element {
  return (
    <Link
      href={href}
      aria-label="Sentinel — home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <Seal className="h-7 w-7" stroke={sealStroke} drawIn={false} interactive />
      {showWordmark && <Wordmark className="h-3.5 text-current" />}
    </Link>
  );
}
