/**
 * Shared throwing JSON reader for database portal hooks.
 * Checks `response.ok` before consuming the body so error payloads still
 * surface while React Doctor's status-before-body rule stays honest.
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(
      payload?.error || `Request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as T | null;
  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}
