/**
 * Shared throwing JSON reader for database portal hooks.
 * Checks `response.ok` before consuming the body so error payloads still
 * surface while React Doctor's status-before-body rule stays honest.
 *
 * Error grammar matches `readErrorMessage` in `@asym/lib` (string `error`,
 * then string `message`, else status). This file cannot import that helper:
 * `@asym/lib` already depends on `@asym/database`.
 */

function readPortalErrorMessage(payload: unknown): string | null {
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

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(
      readPortalErrorMessage(payload) ??
        `Request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as T | null;
  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}
