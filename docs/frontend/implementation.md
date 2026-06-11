# Sentinel Frontend — Cinematic Experience Implementation

> **Status:** Active. Documents the immersive presentation layer introduced on
> `feat/ui-revamp-balraj`. This is a **presentation-only** revamp — it consumes
> the existing gateway APIs, authentication, and data models unchanged. For the
> product/architecture spec see [`../implementation.md`](../implementation.md).
>
> **Brand update (supersedes §3/§5 below where they differ):** the experience
> now uses the official Sentinel identity — surface **ink** `#0B0C0F`, neutral
> **porcelain** `#ECEAE3`, single accent **gold** `#E7A03C`; typefaces
> **Archivo** (display/body) + **IBM Plex Mono** (labels). The hero centrepiece
> is **The Living Mark** (`components/brand/Seal.tsx`) — two arcs that orbit and
> *seal* into a ring with an igniting gold core — which replaces the earlier
> WebGL neural field (removed as too heavy). Logo + favicon are wired site-wide
> via `components/brand/{Seal,Logo}.tsx` and `app/icon.svg`.
>
> **Lightness:** ambient glows are baked CSS radial gradients (not `blur()`
> filters), the fixed nav uses a solid translucent fill (no `backdrop-filter`
> on scroll), the grain/turbulence filter and infinite glow-pulse loops are
> gone, and motion is GPU-only (transform/opacity) — matching the restraint of
> Active Theory / Immersive Garden references.

---

## 1. Objective and Constraints

Transform the human-facing surface into an award-quality, interactive experience
(in the spirit of Active Theory, Resn, Immersive Garden, and Apple product pages)
**without touching the backend**.

Hard constraints honoured:

- Existing gateway endpoints, auth (httpOnly BFF cookie), and data models are the
  source of truth. No replacement APIs.
- The cinematic surface is **scoped** — it owns a dark `void` canvas and never
  flips the global theme, so the light-mode app (dashboard, marketplace, auth)
  is untouched.
- Points/credits terminology, no-currency display rules, Conventional Commits,
  no inline comments, and JSDoc-only documentation all still apply.

---

## 2. Folder Structure

```
src/
  app/
    page.tsx                         # Server page: loads live stats, renders <HomeExperience>
  lib/
    design/motion.ts                 # Motion tokens: easings, durations, staggers
    hooks/useReducedMotion.ts        # Reactive prefers-reduced-motion
  components/marketing/
    HomeExperience.tsx               # Client orchestrator (dark surface + smooth scroll)
    providers/
      SmoothScroll.tsx               # Lenis ↔ GSAP ScrollTrigger bridge
    three/
      SceneStage.tsx                 # No-SSR gate: tier detection + in-view pausing
      HeroCanvas.tsx                 # R3F <Canvas> + lights + bloom
      NeuralField.tsx                # AI neural network (nodes + synapses)
      Dust.tsx                       # Ambient particle field
    ui/
      Reveal.tsx                     # Scroll-reveal wrapper
      SplitText.tsx                  # Word-by-word masked heading reveal
      Counter.tsx                    # Spring count-up, in-view
      MagneticButton.tsx             # Cursor-magnetic CTA
      TiltCard.tsx                   # 3D pointer-tilt glass card
    sections/
      Nav.tsx Hero.tsx Pipeline.tsx Features.tsx
      Ecosystem.tsx Stats.tsx CallToAction.tsx Footer.tsx
```

---

## 3. Design System

Defined in `tailwind.config.ts` (tokens) + `globals.css` (utilities), layered on
top of the existing light-mode tokens — additive, nothing removed.

| Token group | Values |
|---|---|
| Surface (`void`) | `950 #04050a` → `500 #262b47` — the deep-space canvas |
| Accent (`aurora`) | `indigo #6366f1`, `violet #a78bfa`, `cyan #22d3ee`, `blush #f472b6` |
| Display type | Fluid `display-sm / display / display-lg` via `clamp()` |
| Utilities | `.text-aurora`, `.glass`, `.ring-hairline`, `.glow-ring`, `.grain` |
| Keyframes | `float`, `glow-pulse`, `gradient-pan`, `scroll-hint`, `dashFlow` |

**Motion language** (`src/lib/design/motion.ts`) is the single source for timing:
signature easing `expo [0.16,1,0.3,1]`, durations `instant…cinematic`, and
stagger intervals. GSAP and Framer Motion both read from it so the whole page
shares one rhythm.

---

## 4. Animation System

Three cooperating layers:

1. **Lenis** (`SmoothScroll.tsx`) — inertial smooth scroll. Wired to GSAP's
   `ScrollTrigger.update` and driven from the GSAP ticker so scrubbed animations
   stay frame-perfect. Fully disabled (no rAF loop) under reduced motion.
2. **Framer Motion** — component-level reveals, parallax (`useScroll` /
   `useTransform`), counters (`useSpring`), and pointer micro-interactions. Chosen
   for SSR-safety and declarative `whileInView`.
3. **GSAP + ScrollTrigger** — available for pinned / scrubbed scroll-driven
   sequences; currently registered through the Lenis bridge.

**Reduced motion** is honoured at every layer: a global CSS guard collapses all
durations, `SmoothScroll` and `SceneStage` short-circuit, and `Counter` jumps to
its final value.

---

## 5. 3D Architecture

- `SceneStage` is the only entry point. It **never SSRs** (`next/dynamic`,
  `ssr:false`), shows a CSS aurora fallback while the WebGL chunk loads, detects a
  quality tier from device hints (pointer coarseness, viewport width, CPU cores),
  and uses an `IntersectionObserver` to set `frameloop` to `never` once the hero
  scrolls away — freeing the GPU for the rest of the page.
- `HeroCanvas` builds the R3F scene: aurora point-lights, `NeuralField`, `Dust`,
  and a `Bloom` pass (high tier only).
- `NeuralField` generates node positions and proximity-based synapse lines once
  (`useMemo`), renders them as a single `points` + `lineSegments` group with a
  soft circular sprite and additive blending, and animates only the group
  transform (rotation + pointer parallax) — cheap regardless of node count.

| | High tier | Low tier (mobile / ≤4 cores / coarse pointer) |
|---|---|---|
| Nodes | 100 | 55 |
| Dust | 420 | 160 |
| DPR cap | 1.75 | 1.0 |
| Bloom | yes | no |
| Antialias | yes | no |

---

## 6. Scene-by-Scene (Home Page)

1. **Hero** — full-viewport neural field, masked split-text headline, magnetic
   CTAs, scroll-linked parallax + fade hand-off.
2. **Pipeline** — the four-stage verification story; a gradient rail draws across
   the stages as they rise in sequence.
3. **Features** — three trust pillars as 3D tilt cards with a pointer-tracking glow.
4. **Ecosystem** — an interactive node network around the Sentinel hub; hovering a
   participant brightens its synapse and reveals its role.
5. **Stats** — spring count-up figures; **agents verified** and **average trust
   score** are live (see §7), pipeline depth and score scale are constants.
6. **Call to action** — closing aurora sequence with the two primary journeys.

---

## 7. API Integration

No new endpoints. The stats scene is the only data dependency:

- `app/page.tsx` is a **server component** that calls `listAgents()`
  (`GET /v1/listings`) directly against the gateway, computes `total` and the
  average `trustScore`, and passes a typed `LiveStats` object into the client
  experience. Wrapped in `try/catch` with a zero fallback so the gateway being
  unreachable never breaks the landing page. `revalidate = 60`.
- All other API access continues through `src/lib/api/*` + the BFF exactly as
  before.

---

## 8. State Management

No global state added. Everything is local component state (`useState`) or motion
values (`useMotionValue` / `useScroll`). No Zustand store, no tokens, no PII —
consistent with the existing rules.

---

## 9. Performance Strategy

- WebGL bundle is code-split and lazy (`next/dynamic`, `ssr:false`); the page is
  fully usable before it loads.
- Render loop pauses when the hero leaves the viewport.
- Quality tiers downgrade node count, DPR, antialias, and bloom on weak devices.
- Geometry is memoised; only transforms animate per frame.
- `overflow-x-clip` on the surface prevents horizontal scroll from parallax.

---

## 10. Asset Pipeline

Zero external 3D assets — geometry and the point sprite are generated at runtime,
so there are no model/texture downloads and nothing to compress. Fonts remain the
existing self-hosted Geist (`next/font`). Icons are `lucide-react` (already a
dependency).

---

## 11. Deployment Considerations

- Deploys via Vercel unchanged. No new environment variables — the stats fetch
  reuses `NEXT_PUBLIC_GATEWAY_URL` server-side.
- New runtime dependencies: `gsap`, `lenis`, `framer-motion`, `three`,
  `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
  (+ `@types/three` dev). All client-side; tree-shaken into the lazy WebGL chunk
  where possible.

---

## 12. Required Skills / Libraries Reference

| Area | Library | Docs |
|---|---|---|
| Smooth scroll | Lenis | https://github.com/darkroomengineering/lenis |
| Timeline / scrub | GSAP + ScrollTrigger | https://gsap.com/docs/v3/ , https://gsap.com/docs/v3/Plugins/ScrollTrigger/ |
| Component motion | Framer Motion | https://www.framer.com/motion/ |
| WebGL renderer | Three.js | https://threejs.org/docs/ |
| React renderer for three | @react-three/fiber | https://r3f.docs.pmnd.rs/ |
| R3F helpers | @react-three/drei | https://drei.docs.pmnd.rs/ |
| Postprocessing (bloom) | @react-three/postprocessing | https://github.com/pmndrs/react-postprocessing |
| Inspiration (study, don't copy) | Active Theory, Resn, Immersive Garden, Awwwards WebGL | https://www.awwwards.com/websites/webgl/ |

---

## 13. Roadmap (extending the language)

The home page is the reference implementation. Remaining phases reuse the same
`marketing/` primitives:

- **Marketplace** — refined, advanced theme; restrained motion, dwell-friendly
  (per product direction). Reveal + tilt primitives, no heavy per-card 3D.
- **Auth / dashboard / developer** — apply glass surfaces, motion tokens, and
  `Reveal` while preserving the light-mode app shell where it already works.
