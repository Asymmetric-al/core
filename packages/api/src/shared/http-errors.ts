import { NextResponse } from "next/server";
import { ZodError } from "zod";

const STATUS_BY_ERROR_CODE: Record<string, number> = {
  "23503": 409, // foreign_key_violation
  "23505": 409, // unique_violation
  "42501": 403, // insufficient_privilege
  PGRST116: 404,
};

export class ApiHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

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

  if ("cause" in error) {
    return getStatusFromUnknown(error.cause);
  }

  return undefined;
}

export function toApiHttpError(
  error: unknown,
  fallbackMessage = "Internal error",
): ApiHttpError {
  if (error instanceof ApiHttpError) {
    return error;
  }

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return new ApiHttpError(400, firstIssue?.message ?? "Invalid request");
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  const status = getStatusFromUnknown(error) ?? 500;

  return new ApiHttpError(status, message);
}

export function toErrorResponse(
  error: unknown,
  fallbackMessage = "Internal error",
) {
  const normalized = toApiHttpError(error, fallbackMessage);
  return NextResponse.json(
    { error: normalized.message },
    { status: normalized.status },
  );
}
