import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

import { ApiHttpError, ensureJsonBody } from "../../shared/http-errors";

type JsonResult<T = unknown> =
  { ok: true; body: T } | { ok: false; response: NextResponse };

function getPgErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return null;
}

export async function readJsonBody<T = unknown>(
  request: Request,
  schema?: ZodType<T>,
): Promise<JsonResult<T>> {
  try {
    const body = await ensureJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "JSON body must be an object." },
          { status: 400 },
        ),
      };
    }

    if (schema) {
      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return {
          ok: false,
          response: NextResponse.json(
            {
              error: "Invalid request payload.",
              details: parsed.error.flatten(),
            },
            { status: 422 },
          ),
        };
      }

      return { ok: true, body: parsed.data };
    }

    return { ok: true, body: body as T };
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 415) {
      return {
        ok: false,
        response: NextResponse.json({ error: error.message }, { status: 415 }),
      };
    }
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      ),
    };
  }
}

export function toApiErrorResponse(
  error: unknown,
  fallbackMessage: string,
  status = 500,
): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Invalid request payload.",
        details: error.flatten(),
      },
      { status: 422 },
    );
  }

  if (getPgErrorCode(error) === "42501") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: fallbackMessage }, { status });
}

export function toMutationErrorResponse(
  error: unknown,
  fallbackMessage: string,
): NextResponse {
  if (getPgErrorCode(error) === "22023") {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 422 },
    );
  }
  return toApiErrorResponse(error, fallbackMessage, 500);
}
