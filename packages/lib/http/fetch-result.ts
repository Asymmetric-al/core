/**
 * `fetch` wrappers that never throw.
 *
 * `fetch()` resolves on HTTP 4xx/5xx, so callers that read the body first
 * silently treat an error payload as data. These helpers check
 * `response.ok` before touching the body and fold every failure mode
 * (network rejection, HTTP error, unparseable body) into a discriminated
 * result, which also keeps React hooks free of `try`/`finally` and
 * `throw`-inside-`try` shapes the React Compiler cannot lower yet.
 */

export type FetchFailure =
  | {
      kind: "http";
      status: number;
      /** Parsed JSON error body, or `null` when the body was not JSON. */
      payload: unknown;
      message: string;
    }
  | { kind: "network"; cause: unknown; message: string }
  | { kind: "parse"; status: number; cause: unknown; message: string };

export type FetchResult =
  | { ok: true; response: Response }
  | { ok: false; error: FetchFailure };

export type FetchJsonResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; error: FetchFailure };

/** Pull a human-readable message out of the API error conventions used here. */
export function readErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const { error, message } = payload as { error?: unknown; message?: unknown };
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  if (typeof message === "string" && message.length > 0) {
    return message;
  }
  return null;
}

function describeInput(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

export type JsonBody<T> = {
  ok: boolean;
  status: number;
  /** Parsed JSON body, or `null` when the body was empty or not JSON. */
  body: T | null;
};

/**
 * Read a JSON body regardless of status while still checking `response.ok`
 * first. Many API routes here return `{ error }` payloads on 4xx/5xx that the
 * caller wants to surface, so the body is needed on both branches; doing the
 * status check before consuming the stream keeps that explicit and audited in
 * one place.
 */
export async function readJsonBody<T>(
  response: Response,
): Promise<JsonBody<T>> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as T | null;
    return { ok: false, status: response.status, body };
  }
  const body = (await response.json().catch(() => null)) as T | null;
  return { ok: true, status: response.status, body };
}

/** `fetch` that resolves to a result; the body is untouched on success. */
export async function fetchResult(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchResult> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch (cause) {
    return {
      ok: false,
      error: {
        kind: "network",
        cause,
        message:
          cause instanceof Error && cause.message
            ? cause.message
            : `Request to ${describeInput(input)} failed`,
      },
    };
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    return {
      ok: false,
      error: {
        kind: "http",
        status: response.status,
        payload,
        message:
          readErrorMessage(payload) ??
          `Request failed with status ${response.status}`,
      },
    };
  }

  return { ok: true, response };
}

/**
 * Throwing variant used by portal/task hooks: check `response.ok` first,
 * then read the body. Error payloads still surface `error` when present.
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const { ok, status, body } = await readJsonBody<T & { error?: string }>(
    response,
  );

  if (!ok) {
    const error =
      body && typeof body === "object" && typeof body.error === "string"
        ? body.error
        : "";
    throw new Error(error || `Request failed with status ${status}`);
  }

  if (!body) {
    throw new Error("Request returned an empty response.");
  }

  return body;
}

/** `fetchResult` plus a JSON body parse on success. */
export async function fetchJsonResult<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<FetchJsonResult<T>> {
  const result = await fetchResult(input, init);
  if (!result.ok) {
    return result;
  }

  try {
    const data = (await result.response.json()) as T;
    return { ok: true, status: result.response.status, data };
  } catch (cause) {
    return {
      ok: false,
      error: {
        kind: "parse",
        status: result.response.status,
        cause,
        message: `Response from ${describeInput(input)} was not valid JSON`,
      },
    };
  }
}
