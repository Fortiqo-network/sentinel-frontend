"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in dev to avoid spamming the gateway
        refetchOnWindowFocus: process.env.NODE_ENV === "production",
        // Retry once on failure; gateway handles rate-limit via 429 with Retry-After
        retry: 1,
        staleTime: 60_000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a singleton QueryClient on the client side, or a fresh instance
 * on the server side (required for SSR — each request must have its own client).
 */
function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the application with the TanStack Query client.
 * Must be a client component because it uses useState internally.
 */
export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
