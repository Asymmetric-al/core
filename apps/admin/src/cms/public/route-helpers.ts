import { connection, NextResponse } from "next/server";

import { isPayloadClientInitializationError } from "../get-payload";

/**
 * Ensures dynamic route handlers run at request time (Next.js `connection()`).
 * Skips in Vitest where `connection()` is unavailable.
 */
export async function ensureRequestTimeExecution() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  await connection();
}

type PublicCmsRouteErrorOptions = {
  clientMessage: string;
  /** Logged on non-init errors (500 path). */
  logMessage: string;
};

/**
 * Shared try/catch tail for public CMS JSON routes: Payload init vs generic 500.
 * Preserves exact JSON bodies and status codes per caller.
 */
export function publicCmsRouteErrorResponse(
  error: unknown,
  { clientMessage, logMessage }: PublicCmsRouteErrorOptions,
) {
  if (isPayloadClientInitializationError(error)) {
    console.error(error.message);

    return NextResponse.json(
      { error: clientMessage },
      { status: error.statusCode },
    );
  }

  console.error(logMessage, error);

  return NextResponse.json({ error: clientMessage }, { status: 500 });
}
