import { PageShell } from "@/components/marketing/PageShell";

interface PlaygroundLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for the playground — same cinematic ink surface and marketing
 * Nav/Footer as the homepage and marketplace, so the experience is unified.
 */
export default function PlaygroundLayout({ children }: PlaygroundLayoutProps): React.JSX.Element {
  return <PageShell>{children}</PageShell>;
}
