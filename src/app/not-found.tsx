import { redirect } from "next/navigation";

/**
 * Global 404 handler — any URL that doesn't exist sends the visitor to the
 * home page instead of a dead-end error screen (product decision: no 404s).
 */
export default function NotFound(): never {
  redirect("/");
}
