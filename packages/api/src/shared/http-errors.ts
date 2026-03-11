import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
  const status = message.includes("Unauthorized")
    ? 401
    : message.includes("Forbidden")
      ? 403
      : 500;

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
