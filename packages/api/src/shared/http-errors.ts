import { SCOPE_REFUSED_HEADER } from "@asym/database/request-scope-headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiHttpError, ApiResponseContractError } from "./api-http-error";

// Browser-safe modules import the class from "./api-http-error" directly;
// this re-export keeps the server-side import surface unchanged.
export { ApiHttpError, ApiResponseContractError };

const STATUS_BY_ERROR_CODE: Record<string, number> = {
  "23503": 409, // foreign_key_violation
  "23505": 409, // unique_violation
  "42501": 403, // insufficient_privilege
  PGRST116: 404,
};

export async function ensureJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiHttpError(400, "Invalid JSON body");
  }
}

function isHttpErrorStatus(status: number): boolean {
  return Number.isInteger(status) && status >= 400 && status <= 599;
}

function getStatusFromUnknown(error: unknown): number | undefined {
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
    return STATUS_BY_ERROR_CODE[error.code];
  }

  if ("cause" in error && error.cause !== error) {
    const causeStatus = getStatusFromUnknown(error.cause);
    if (causeStatus !== undefined) return causeStatus;
  }

  if (error instanceof Error && error.message) {
    const msg = error.message;
    if (msg.includes("Unauthorized")) return 401;
    if (msg.includes("Forbidden")) return 403;
  }

  return undefined;
}

function getZodErrorMessage(error: ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return "Invalid request";
  }

  if (firstIssue.code === "invalid_union" && "errors" in firstIssue) {
    const branchErrors = firstIssue.errors;
    if (Array.isArray(branchErrors)) {
      for (const branch of branchErrors) {
        if (!Array.isArray(branch)) continue;
        for (const nestedIssue of branch) {
          if (
            typeof nestedIssue === "object" &&
            nestedIssue !== null &&
            "message" in nestedIssue &&
            typeof nestedIssue.message === "string" &&
            nestedIssue.message.length > 0 &&
            nestedIssue.message !== "Invalid input"
          ) {
            return nestedIssue.message;
          }
        }
      }
    }
  }

  return firstIssue.message;
}

export function toApiHttpError(
  error: unknown,
  fallbackMessage = "Internal error",
): ApiHttpError {
  if (error instanceof ApiHttpError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ApiHttpError(400, getZodErrorMessage(error));
  }

  // The resolver refused the tenant or assignment the request proposed
  // (`ScopeRefusedError` from @asym/auth/context, known by name so this
  // module stays free of the auth runtime): the same 401 as before, marked so
  // the browser can tell it from any other (AL-2675, JB1).
  if (error instanceof Error && error.name === "ScopeRefusedError") {
    const reason = (error as Error & { reason?: unknown }).reason;
    return new ApiHttpError(401, error.message, {
      [SCOPE_REFUSED_HEADER]: typeof reason === "string" ? reason : "refused",
    });
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  const status = getStatusFromUnknown(error) ?? 500;

  return new ApiHttpError(status, message);
}

export function toErrorResponse(
  error: unknown,
  fallbackMessage = "Internal error",
  requestId?: string,
) {
  const normalized = toApiHttpError(error, fallbackMessage);
  const message =
    normalized.status >= 500 && !(error instanceof ApiResponseContractError)
      ? "Internal error"
      : normalized.message;
  return NextResponse.json(
    requestId ? { error: message, requestId } : { error: message },
    {
      status: normalized.status,
      ...(normalized.headers ? { headers: normalized.headers } : {}),
    },
  );
}

export async function reportOperationFailure(
  operation: string,
  error: unknown,
  requestId: string,
  status: number,
) {
  const name =
    error instanceof Error &&
    /^(?:Type|Range|Reference|Syntax|Aggregate|ApiHttp)?Error$/.test(error.name)
      ? error.name
      : "Error";
  const rawCode =
    error && typeof error === "object" && "code" in error ? error.code : null;
  const code =
    typeof rawCode === "string" &&
    /^(?:[0-9A-Z]{5}|PGRST\d{3}|E(?:CONNRESET|CONNREFUSED|TIMEDOUT))$/.test(
      rawCode,
    )
      ? rawCode
      : null;
  const sanitized = new Error("Request failed");
  sanitized.name = name;
  const header =
    error instanceof Error ? `${error.name}: ${error.message}\n` : null;
  if (header && error instanceof Error && error.stack?.startsWith(header)) {
    const frames = error.stack
      .slice(header.length)
      .split("\n")
      .filter((line) => /^\s+at /.test(line));
    sanitized.stack = [`${name}: Request failed`, ...frames].join("\n");
  }
  const diagnostic = { requestId, status, name, code, stack: sanitized.stack };
  console.error(`[${operation}] Request failed`, diagnostic);
  try {
    const { captureError } = await import("@asym/lib/monitoring");
    captureError(sanitized, diagnostic, { request_id: requestId });
  } catch {
    console.error(`[${operation}] Error tracker unavailable`, { requestId });
  }
}
