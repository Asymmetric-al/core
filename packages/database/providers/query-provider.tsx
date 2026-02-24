"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { type ReactNode } from "react";

const NON_RETRIABLE_STATUS_CODES = new Set([401, 403]);
const STATUS_BY_ERROR_CODE: Record<string, number> = {
  "42501": 403, // Postgres insufficient_privilege
  PGRST301: 401,
  PGRST302: 401,
};

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if (
    "status" in error &&
    typeof error.status === "number" &&
    Number.isInteger(error.status)
  ) {
    return error.status;
  }

  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number" &&
    Number.isInteger(error.response.status)
  ) {
    return error.response.status;
  }

  if ("code" in error && typeof error.code === "string") {
    return STATUS_BY_ERROR_CODE[error.code];
  }

  if ("cause" in error) {
    return getErrorStatus(error.cause);
  }

  return undefined;
}

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status !== undefined && NON_RETRIABLE_STATUS_CODES.has(status)) {
    return false;
  }
  return failureCount < 3;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
