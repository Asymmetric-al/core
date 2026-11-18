import type { AfterErrorHook } from "payload";

/**
 * Why Payload's strategy signed nobody in for a Web Studio request (plan 5.2;
 * AL-2675, WP2b slice C), and what that refusal looks like on the wire.
 *
 * The strategy cannot answer a request itself: when it signs nobody in,
 * Payload runs the operation anonymously, and every Web Studio collection
 * refuses an anonymous caller with `Forbidden`. The strategy leaves its reason
 * on the request's context, and `webStudioRefusalAfterError` turns that
 * `Forbidden` into the answer the reason calls for, always JSON and never a
 * redirect:
 *
 * - `no_session`: the session has ended or expired: 401, sign in again;
 * - `scope_mismatch`: the page was rendered for another organization than the
 *   Web Studio cookie now selects: 409, reload the page. A form opened before
 *   the person switched organization in another tab is never retargeted;
 * - `no_selection`: no usable organization (none chosen among several, or a
 *   cookie that names a row the person does not hold live): 403.
 *
 * The answer carries the message at the top level and in Payload's `errors`,
 * and names the refusal in the `x-asym-web-studio-refusal` header, by which
 * the Web Studio document recognizes it on any screen and asks the person to
 * reload (council C2; `web-studio-refusal-dialog.tsx`).
 */
export type WebStudioRefusal = "no_session" | "no_selection" | "scope_mismatch";

/** The response header that names a Web Studio refusal. */
export const WEB_STUDIO_REFUSAL_HEADER = "x-asym-web-studio-refusal";

const CONTEXT_KEY = "asymWebStudioRefusal";

export function isWebStudioRefusal(value: unknown): value is WebStudioRefusal {
  return (
    value === "no_session" ||
    value === "no_selection" ||
    value === "scope_mismatch"
  );
}

type RequestWithContext = {
  context?: Record<string, unknown> | null;
  responseHeaders?: Headers;
};

export function markWebStudioRefusal(
  req: RequestWithContext | null | undefined,
  refusal: WebStudioRefusal,
): void {
  if (!req) return;
  req.context ??= {};
  req.context[CONTEXT_KEY] = refusal;
}

export function readWebStudioRefusal(
  req: RequestWithContext | null | undefined,
): WebStudioRefusal | null {
  const value = req?.context?.[CONTEXT_KEY];
  return isWebStudioRefusal(value) ? value : null;
}

export const WEB_STUDIO_REFUSAL_MESSAGES: Record<WebStudioRefusal, string> = {
  no_session: "Your session has ended. Sign in again to continue.",
  no_selection:
    "Choose the organization to work in. Open Web Studio again to choose.",
  scope_mismatch:
    "This page was opened for a different organization. Reload the page to continue; nothing was saved.",
};

const STATUS: Record<WebStudioRefusal, number> = {
  no_session: 401,
  no_selection: 403,
  scope_mismatch: 409,
};

/** Payload `hooks.afterError`: the refusal's status and message for an anonymous `Forbidden`. */
export const webStudioRefusalAfterError: AfterErrorHook = ({ error, req }) => {
  const refusal = readWebStudioRefusal(req);
  if (!refusal || error.name !== "Forbidden") return;
  // Payload merges the request's response headers into its error response.
  const request = req as RequestWithContext;
  request.responseHeaders ??= new Headers();
  request.responseHeaders.set(WEB_STUDIO_REFUSAL_HEADER, refusal);
  const message = WEB_STUDIO_REFUSAL_MESSAGES[refusal];
  return {
    status: STATUS[refusal],
    response: { message, errors: [{ message }] },
  };
};
