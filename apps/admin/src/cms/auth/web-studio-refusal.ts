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

/**
 * The tenant and row a Web Studio document names on a server function of
 * Payload's (council on the joined release, JC2). A server function is a
 * server action posted to the page's own address, and the proxy deletes the
 * REST pair (`x-asym-tenant`, `x-asym-assignment`) from every page request,
 * where only its own decision may set one. So the document sends the same
 * claim under Web Studio's own names, which nothing reads as a choice: the
 * Payload layout only compares them with the cookie's
 * (`web-studio-server-function.ts`).
 */
export const WEB_STUDIO_CLAIM_TENANT_HEADER = "x-asym-web-studio-tenant";
export const WEB_STUDIO_CLAIM_ASSIGNMENT_HEADER =
  "x-asym-web-studio-assignment";
export const WEB_STUDIO_CLAIM_GENERATION_HEADER =
  "x-asym-web-studio-generation";

/**
 * A server action cannot set a response header, so a refused server function
 * names its refusal in its error's digest, which Next keeps and sends in the
 * action's answer (`next/dist/server/app-render/create-error-handler.js`
 * respects an error's own digest). The document's fetch hook reads it there
 * and asks the person to reload, as it does for a refused REST call.
 */
const REFUSAL_DIGEST_PREFIX = "ASYM_WEB_STUDIO_REFUSAL;";

export function webStudioRefusalDigest(refusal: WebStudioRefusal): string {
  return `${REFUSAL_DIGEST_PREFIX}${refusal}`;
}

const FLIGHT_ERROR_LINE = /^[0-9a-f]+:E(.*)$/;

/** The refusal a server action's answer names in its error digest, if any. */
export function readWebStudioRefusalDigest(
  body: string,
): WebStudioRefusal | null {
  for (const line of body.split(/\r?\n/)) {
    const match = FLIGHT_ERROR_LINE.exec(line);
    if (!match) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1]!);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      continue;
    }
    const digest = (parsed as { digest?: unknown }).digest;
    if (typeof digest !== "string") continue;
    if (!digest.startsWith(REFUSAL_DIGEST_PREFIX)) continue;
    const named = digest.slice(REFUSAL_DIGEST_PREFIX.length);
    if (isWebStudioRefusal(named)) return named;
  }
  return null;
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

export function webStudioRefusalResponse(refusal: WebStudioRefusal): Response {
  const message = WEB_STUDIO_REFUSAL_MESSAGES[refusal];
  return Response.json(
    { message, errors: [{ message }], docs: [] },
    {
      status: STATUS[refusal],
      headers: {
        [WEB_STUDIO_REFUSAL_HEADER]: refusal,
        "cache-control": "no-store",
      },
    },
  );
}

const REFUSAL_ERROR_NAMES = new Set(["Forbidden", "UnauthorizedError"]);

/** Payload `hooks.afterError`: the refusal's status and message for an anonymous `Forbidden`. */
export const webStudioRefusalAfterError: AfterErrorHook = ({ error, req }) => {
  const refusal = readWebStudioRefusal(req);
  if (!refusal || !REFUSAL_ERROR_NAMES.has(error.name)) return;
  // Payload merges the request's response headers into its error response.
  const request = req as RequestWithContext;
  request.responseHeaders ??= new Headers();
  request.responseHeaders.set(WEB_STUDIO_REFUSAL_HEADER, refusal);
  const message = WEB_STUDIO_REFUSAL_MESSAGES[refusal];
  return {
    status: STATUS[refusal],
    // `docs` lets Payload's bulk actions show the message (council r2 CR5).
    response: { message, errors: [{ message }], docs: [] },
  };
};
