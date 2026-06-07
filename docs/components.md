# sentinel-frontend — Component Catalog

## UI primitives (`src/components/ui/`)

All primitives follow shadcn/ui patterns (Radix under the hood) and accept a
`className` prop for Tailwind overrides. Use the `cn()` utility for merging.

### Button

```tsx
import { Button } from "@/components/ui/button";

// Variants: primary (default) | secondary | ghost | destructive | outline
// Sizes: sm | md (default) | lg | icon
<Button variant="primary" size="lg">Get Started</Button>
<Button asChild variant="ghost"><Link href="/agents">Browse</Link></Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader><CardTitle>Agent Name</CardTitle></CardHeader>
  <CardContent>Description here.</CardContent>
  <CardFooter><Button>Connect</Button></CardFooter>
</Card>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

// Variants: default | success | warning | destructive | info
<Badge variant="success">Verified</Badge>
<Badge variant="warning">Pending</Badge>
```

### Input

```tsx
import { Input } from "@/components/ui/input";

// Supports label, error, and hint props for full form field rendering
<Input label="Email" type="email" error={errors.email?.message} hint="We'll never share it." />
```

### Skeleton

```tsx
import { Skeleton, AgentCardSkeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-48" />
<AgentCardSkeleton />    // pre-built shape matching AgentCard
```

### Dialog

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogTitle>Confirm Action</DialogTitle>
    <p>Body text here.</p>
  </DialogContent>
</Dialog>
```

### Select

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Choose tier" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="verified">Verified</SelectItem>
    <SelectItem value="managed">Managed</SelectItem>
  </SelectContent>
</Select>
```

---

## Marketplace components (`src/components/marketplace/`)

### AgentCard

Renders a single agent listing card. Props: `agent: Agent`.

```tsx
import { AgentCard } from "@/components/marketplace/AgentCard";
<AgentCard agent={agent} />
```

### TrustBadge

Circular score badge coloured by band. Props: `score: number`, `size?: "sm" | "md" | "lg"`.

```tsx
import { TrustBadge } from "@/components/marketplace/TrustBadge";
<TrustBadge score={87} size="lg" />
```

### AgentGrid

Responsive 1→2→3 column grid. Handles loading skeletons and empty state.

```tsx
import { AgentGrid } from "@/components/marketplace/AgentGrid";
<AgentGrid agents={agents} isLoading={isLoading} />
```

### FilterPanel

Client component; manages marketplace filters via URL search params.

```tsx
import { FilterPanel } from "@/components/marketplace/FilterPanel";
<FilterPanel initialFilters={searchParams} />
```

---

## Dashboard components (`src/components/dashboard/`)

### UsageChart

Recharts area chart of daily invocations. Props: `data?: UsageDataPoint[]`, `height?: number`.

### SpendSummary

Three stat cards: credit balance, monthly spend, total spend.

---

## Layout components (`src/components/layout/`)

### Header

Sticky top nav. Reads auth state from Zustand and adapts nav links by role.

### Sidebar

Vertical nav for dashboard/developer layouts. Highlights active route.

### Footer

Four-column site footer with product, legal, and resource links.

---

## Adding new components

1. Create the file in the appropriate subdirectory.
2. Export a named function (no default exports for components).
3. Add JSDoc on the exported function with a `@example`.
4. If it uses browser APIs or hooks, add `"use client"` at the top.
5. Use the `cn()` utility for all className merges.
6. Explicit return type: `React.JSX.Element` for components.
