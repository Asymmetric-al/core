"use client";

import { useEffect, type ReactNode } from "react";

import { QueryProvider } from "./query-provider";

interface TanStackDBProviderProps {
  children: ReactNode;
}

let hasWarnedAboutTanStackDbProviderDeprecation = false;

export function TanStackDBProvider({ children }: TanStackDBProviderProps) {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      !hasWarnedAboutTanStackDbProviderDeprecation
    ) {
      hasWarnedAboutTanStackDbProviderDeprecation = true;
      console.warn(
        "[asym/database] TanStackDBProvider is deprecated. Use QueryProvider from @asym/database/providers instead.",
      );
    }
  }, []);

  return <QueryProvider>{children}</QueryProvider>;
}
