import { ASSIGNMENT_HEADER, TENANT_HEADER } from "@asym/auth/request-headers";
import { isWebStudioApiPath, isWebStudioPagePath } from "@asym/auth/web-studio";
import { readDocumentScopeForSend } from "@asym/database/document-scope";
import { retiredScopeResponse } from "@asym/database/request-scope-headers";

import { noticeWebStudioRefusal } from "./web-studio-refusal-notice";
import {
  readWebStudioRefusalDigest,
  WEB_STUDIO_CLAIM_ASSIGNMENT_HEADER,
  WEB_STUDIO_CLAIM_TENANT_HEADER,
  WEB_STUDIO_REFUSAL_HEADER,
} from "../../../cms/auth/web-studio-refusal";

/**
 * Every call a Web Studio document makes to Payload's REST routes names the
 * tenant and membership row the document was rendered for (plan 5.2; AL-2675,
 * WP2b slice C), in the same `x-asym-tenant` and `x-asym-assignment` headers
 * the rest of the platform uses. Payload's strategy compares them with the
 * organization the Web Studio cookie selects now and refuses a call from a
 * document rendered for another, so switching organization in another tab
 * never retargets an open form.
 *
 * Payload's admin makes its calls with the global `fetch` (its `requests`
 * helper, forms, uploads); nothing else reaches it, so the document wraps
 * `fetch` once. Only same-origin calls under `/web-studio/api` change; Mission
 * Control's own `/api` routes are scoped by slice B's shared fetch wrapper.
 *
 * Payload's server functions are server actions, which Next posts with the
 * global `fetch` to the page's own address (`next-action` header). On a Web
 * Studio page they name the same tenant and row, in Web Studio's own claim
 * headers, because the proxy deletes the REST pair from a page request; the
 * Payload layout compares them with the cookie's choice before Payload runs
 * (council on the joined release, JC2). The chooser's own action, under
 * `/web-studio` but not a Web Studio page, names nothing.
 *
 * None of these calls asks the browser to bypass its cache, as slice B's
 * own-API wrapper does: Payload's REST answers carry no `Cache-Control`,
 * `ETag`, `Last-Modified` or `Expires`, so the browser stores none of them
 * to reuse, and a server action is a POST (council on the joined release,
 * JC9, checked against the answers a development server gives).
 *
 * A response the server marks as a Web Studio refusal is reported to the
 * document, which asks the person to reload once (council C2); the response
 * itself reaches Payload unchanged, except a later refused autosave, which
 * reaches it without a message (council r2 CR5). A server action cannot
 * set a header, so a refused server function names its refusal in the
 * digest of the error its answer carries; the hook reads a copy of that
 * answer, and Next reads the answer itself.
 *
 * Once the document's scope is retired (another person signed in, the
 * person signed out, or a scope was refused; JB1), neither kind of call is
 * sent (check of the fix lists, JR1): without the document's claims the
 * server would act for whoever is signed in now. Each answers the refusal
 * the platform's wrappers give, made in the browser, while the document
 * shows the reload notice in place of Payload's view and reloads.
 */

const WRAPPED = Symbol.for("asym.webStudio.documentFetch");

type WrappableWindow = Window & { [WRAPPED]?: true };

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/** The same refusal, with an empty error list Payload's forms show nothing for. */
function withoutMessage(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify({ errors: [] }), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** The method a call is made with: its init's, else its request's, else GET. */
function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  return (
    init?.method ?? (input instanceof Request ? input.method : "GET")
  ).toUpperCase();
}

/**
 * Reads a refused server function's answer, from a copy, and asks the person
 * to reload when it names a Web Studio refusal. Next reads the answer itself.
 */
function noticeRefusedServerFunction(response: Response): void {
  if (response.ok) return;
  void response
    .clone()
    .text()
    .then((body) => noticeWebStudioRefusal(readWebStudioRefusalDigest(body)))
    .catch(() => {
      // An answer that cannot be read names no refusal.
    });
}

export function installWebStudioDocumentFetch(
  target: WrappableWindow = window,
): void {
  if (target[WRAPPED]) return;
  const original = target.fetch.bind(target);

  target.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    // One decision for this call (L1).
    const state = readDocumentScopeForSend();
    const retired = state.kind === "retired";
    const scope = state.kind === "scoped" ? state.scope : null;
    if (!scope && !retired) return original(input, init);
    let url: URL;
    try {
      url = new URL(requestUrl(input), target.location.href);
    } catch {
      return original(input, init);
    }
    if (url.origin !== target.location.origin) return original(input, init);
    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    // A server function of Payload's, posted from a Web Studio page (JC2).
    const serverFunction =
      isWebStudioPagePath(url.pathname) &&
      requestMethod(input, init) === "POST" &&
      headers.has("next-action");
    if (!scope) {
      // Retired (JR1): a call that would carry the claims is not sent.
      return serverFunction || isWebStudioApiPath(url.pathname)
        ? Promise.resolve(
            retiredScopeResponse({ errors: [{ message: "Unauthorized" }] }),
          )
        : original(input, init);
    }
    if (serverFunction) {
      headers.set(WEB_STUDIO_CLAIM_TENANT_HEADER, scope.tenantId);
      headers.set(WEB_STUDIO_CLAIM_ASSIGNMENT_HEADER, scope.assignmentId);
      return original(input, { ...init, headers }).then((response) => {
        noticeRefusedServerFunction(response);
        return response;
      });
    }
    if (!isWebStudioApiPath(url.pathname)) return original(input, init);
    headers.set(TENANT_HEADER, scope.tenantId);
    headers.set(ASSIGNMENT_HEADER, scope.assignmentId);
    return original(input, { ...init, headers }).then((response) => {
      const refusal = response.headers.get(WEB_STUDIO_REFUSAL_HEADER);
      const first = noticeWebStudioRefusal(refusal);
      // Payload toasts a refused autosave on every pause; the document's
      // notice already says nothing is saved, so later ones reach Payload
      // with no message (council r2 CR5). An explicit save keeps its own.
      if (refusal && !first && url.searchParams.get("autosave") === "true") {
        return withoutMessage(response);
      }
      return response;
    });
  };
  target[WRAPPED] = true;
}
