"use client";

import * as React from "react";

export function ClientBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
