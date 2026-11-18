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
 */
export type WebStudioRefusal = "no_session" | "no_selection" | "scope_mismatch";

const CONTEXT_KEY = "asymWebStudioRefusal";

type RequestWithContext = { context?: Record<string, unknown> | null };

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
  return value === "no_session" ||
    value === "no_selection" ||
    value === "scope_mismatch"
    ? value
    : null;
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
  return {
    status: STATUS[refusal],
    response: { errors: [{ message: WEB_STUDIO_REFUSAL_MESSAGES[refusal] }] },
  };
};
