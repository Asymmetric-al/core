import { ASSIGNMENT_HEADER, TENANT_HEADER } from "@asym/auth/request-headers";
import { isWebStudioApiPath } from "@asym/auth/web-studio";
import { getDocumentScope } from "@asym/database/document-scope";

import { noticeWebStudioRefusal } from "./web-studio-refusal-notice";
import { WEB_STUDIO_REFUSAL_HEADER } from "../../../cms/auth/web-studio-refusal";

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
 * A response the server marks as a Web Studio refusal is reported to the
 * document, which asks the person to reload once (council C2); the response
 * itself reaches Payload unchanged.
 */

const WRAPPED = Symbol.for("asym.webStudio.documentFetch");

type WrappableWindow = Window & { [WRAPPED]?: true };

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

export function installWebStudioDocumentFetch(
  target: WrappableWindow = window,
): void {
  if (target[WRAPPED]) return;
  const original = target.fetch.bind(target);

  target.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const scope = getDocumentScope();
    if (!scope) return original(input, init);
    let url: URL;
    try {
      url = new URL(requestUrl(input), target.location.href);
    } catch {
      return original(input, init);
    }
    if (
      url.origin !== target.location.origin ||
      !isWebStudioApiPath(url.pathname)
    ) {
      return original(input, init);
    }
    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );
    headers.set(TENANT_HEADER, scope.tenantId);
    headers.set(ASSIGNMENT_HEADER, scope.assignmentId);
    return original(input, { ...init, headers }).then((response) => {
      noticeWebStudioRefusal(response.headers.get(WEB_STUDIO_REFUSAL_HEADER));
      return response;
    });
  };
  target[WRAPPED] = true;
}
