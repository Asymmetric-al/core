import { QueryClient, isServer } from "@tanstack/react-query";

const NON_RETRIABLE_STATUS_CODES = new Set([401, 403]);
// `throwOnError()` from postgrest-js throws PostgrestError with `code` but no `status`.
// Keep explicit code mapping for auth/perms classification in retry logic.
const STATUS_BY_ERROR_CODE: Record<string, number> = {
  "42501": 403, // Postgres insufficient_privilege
};
const POSTGREST_AUTH_ERROR_CODES = new Set([
  "PGRST301",
  "PGRST302",
  "PGRST303",
]);

function isHttpErrorStatus(status: number): boolean {
  return Number.isInteger(status) && status >= 400 && status <= 599;
}

function getStatusForErrorCode(code: string): number | undefined {
  if (POSTGREST_AUTH_ERROR_CODES.has(code)) {
    return 401;
  }
  return STATUS_BY_ERROR_CODE[code];
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if (
    "status" in error &&
    typeof error.status === "number" &&
    isHttpErrorStatus(error.status)
  ) {
    return error.status;
  }

  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    typeof error.response.status === "number" &&
    isHttpErrorStatus(error.response.status)
  ) {
    return error.response.status;
  }

  if ("code" in error && typeof error.code === "string") {
    return getStatusForErrorCode(error.code);
  }

  if (
    "error" in error &&
    typeof error.error === "object" &&
    error.error !== null &&
    error.error !== error
  ) {
    const nestedErrorStatus = getErrorStatus(error.error);
    if (nestedErrorStatus !== undefined) {
      return nestedErrorStatus;
    }
  }

  if ("cause" in error && error.cause !== error) {
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
