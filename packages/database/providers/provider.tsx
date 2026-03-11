"use client";

import { type ReactNode, useEffect } from "react";

import { QueryProvider } from "./query-provider";

interface TanStackDBProviderProps {
  children: ReactNode;
}

export function TanStackDBProvider({ children }: TanStackDBProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    console.warn(
      "[asym/database] TanStackDBProvider is deprecated. Use QueryProvider from @asym/database/providers instead.",
    );
  }, []);

  return <QueryProvider>{children}</QueryProvider>;
}
