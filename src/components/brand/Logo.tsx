"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Tessera } from "./Tessera";

/** Per-letter stroke paths of the SENTINEL wordmark, with write-in delays. */
const LETTERS: { d: string; transform?: string; delay: number }[] = [
  { d: "M39 21 A15 15 0 1 0 24 36 A15 15 0 1 1 9 51", delay: 0 },
  { d: "M6 0 V72 M0 6 H44 M0 36 H36 M0 66 H44", transform: "translate(74 0)", delay: 0.11 },
  { d: "M6 72 V0 L46 72 V0", transform: "translate(144 0)", delay: 0.22 },
  { d: "M0 6 H52 M26 0 V72", transform: "translate(222 0)", delay: 0.33 },
  { d: "M6 0 V72", transform: "translate(300 0)", delay: 0.44 },
  { d: "M6 72 V0 L46 72 V0", transform: "translate(338 0)", delay: 0.55 },
  { d: "M6 0 V72 M0 6 H44 M0 36 H36 M0 66 H44", transform: "translate(416 0)", delay: 0.66 },
  { d: "M6 0 V66 H44", transform: "translate(486 0)", delay: 0.77 },
];

interface WordmarkProps {
  className?: string;
  /** `static` renders the wordmark in `currentColor`; `write` animates each
   *  letter drawing itself in amber (used by the proof). */
  mode?: "static" | "write";
}

/**
 * The SENTINEL wordmark — the brand's monoline letterforms. In `write` mode the
 * letters draw themselves left-to-right in amber, exactly as the proof writes
 * the name once the counterparts fit.
 */
export function Wordmark({ className, mode = "static" }: WordmarkProps): React.JSX.Element {
  const write = mode === "write";
  return (
    <svg
      viewBox="-6 -10 542 92"
      fill="none"
      className={cn("h-[0.9em] w-auto", write && "tessera-write", className)}
      role="img"
      aria-label="Sentinel"
    >
      <g
        stroke={write ? "#E7A03C" : "currentColor"}
        strokeWidth="12"
        strokeLinejoin="bevel"
        fill="none"
      >
        {LETTERS.map((l, i) => (
          <path
            key={i}
            d={l.d}
            transform={l.transform}
            pathLength={write ? 100 : undefined}
            style={
              write
                ? { strokeDasharray: 100, strokeDashoffset: 100, ["--d" as string]: `${l.delay}s` }
                : undefined
            }
          />
        ))}
      </g>
    </svg>
  );
}

interface LogoProps {
  href?: string;
  /** Half-fill colour for the Tessera (the wordmark uses currentColor). */
  sealStroke?: string;
  showWordmark?: boolean;
  className?: string;
}

/**
 * Primary brand lockup for navigation: the scanning Tessera beside the
 * wordmark, linking home. The seam scans forever — the mark never rotates.
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
      <Tessera className="h-7 w-7" seam="scan" fill={sealStroke} />
      {showWordmark && <Wordmark className="h-3.5 text-current" />}
    </Link>
  );
}

type Phase = "idle" | "forge" | "written";

/**
 * The interactive **Counterpart Proof** lockup for the footer. At rest it shows
 * the scanning Tessera; on click the right half pulls away and mirrors (a forged
 * half cannot fit), returns true, the seam fills, and SENTINEL writes itself in
 * amber — then settles back. Click again to replay.
 *
 * @example
 * <ProofLockup />
 */
export function ProofLockup({ className }: { className?: string }): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>("idle");
  const busy = useRef(false);

  const prove = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    setPhase("forge");
    window.setTimeout(() => setPhase("written"), 900);
    window.setTimeout(() => {
      setPhase("idle");
      busy.current = false;
    }, 5200);
  }, []);

  const proving = phase !== "idle";

  return (
    <button
      type="button"
      onClick={prove}
      aria-label="Prove the counterpart"
      className={cn("group inline-flex items-center gap-3 text-current sentinel-focus", className)}
    >
      <Tessera
        className="h-9 w-9"
        seam={phase === "written" ? "fill" : "scan"}
        rightShift={phase === "forge" ? 18 : 0}
        rightMirror={phase === "forge"}
      />
      <span
        className="overflow-hidden transition-all duration-700 ease-out"
        style={{ width: proving ? 150 : 0, opacity: proving ? 1 : 0 }}
      >
        {phase === "written" ? (
          <Wordmark key="w" mode="write" className="h-4" />
        ) : (
          <Wordmark className="h-4 text-current" />
        )}
      </span>
    </button>
  );
}
