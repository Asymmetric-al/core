"use client";

import { type ReactNode } from "react";

import { QueryProvider } from "./query-provider";

interface TanStackDBProviderProps {
  children: ReactNode;
}

export function TanStackDBProvider({ children }: TanStackDBProviderProps) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[asym/database] TanStackDBProvider is deprecated. Use QueryProvider from @asym/database/providers instead.",
    );
  }

  return <QueryProvider>{children}</QueryProvider>;
}
