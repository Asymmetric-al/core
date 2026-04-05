"use client";

import dynamic from "next/dynamic";
import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { getQueryClient } from "./query-provider";

const ReactQueryDevtoolsPanel =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then((mod) => ({
            default: mod.ReactQueryDevtools,
          })),
        { ssr: false },
      )
    : function DevToolsStub() {
        return null;
      };

interface TanStackDBProviderProps {
  children: ReactNode;
}

export function TanStackDBProvider({ children }: TanStackDBProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtoolsPanel initialIsOpen={false} />
    </QueryClientProvider>
  );
}
