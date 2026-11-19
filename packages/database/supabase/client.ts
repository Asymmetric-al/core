import { createBrowserClient } from "@supabase/ssr";

import {
  getDocumentScope,
  isDocumentScopeRetired,
  retireDocumentScope,
} from "../document-scope";
import {
  applyRequestScopeHeaders,
  retiredScopeResponse,
  SCOPE_REFUSED_HEADER,
} from "../request-scope-headers";
import { getSupabasePublicConfig } from "./config";

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/**
 * `fetch` for the browser client: a Data API request carries the document's
 * tenant and assignment (plan 5.2, "The browser data layer is scoped to the
 * person, the tenant and the selected assignment"; AL-2675). They are read
 * when each request is sent, so a client created before the page fixed its
 * scope still sends them. Auth and Storage requests go out unchanged.
 *
 * A response marked `x-asym-scope-refused` retires the document's scope, as
 * the own-API wrapper does (JB1). In the first release of WP2b the database
 * reads the headers only in the command lane and the member directory, and
 * answers a row it refuses with its own error, so no Data API response
 * carries the mark yet; the second release's policies can set it through
 * PostgREST's `response.headers`, and the browser already obeys it.
 *
 * From a document whose scope is retired, a Data API request is not sent at
 * all (JR1): it answers the same refusal, made in the browser, with a body
 * in PostgREST's error shape.
 */
function scopedDataApiFetch(dataApiPrefix: string): typeof fetch {
  return async (input, init) => {
    if (!requestUrl(input).startsWith(dataApiPrefix)) {
      return fetch(input, init);
    }
    if (isDocumentScopeRetired()) {
      return retiredScopeResponse({
        message: "Unauthorized",
        code: "ASYM_SCOPE_RETIRED",
        details: null,
        hint: null,
      });
    }
    const scope = getDocumentScope();
    const headers = applyRequestScopeHeaders(
      new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      ),
      scope,
    );
    const response = await fetch(input, { ...init, headers });
    if (scope && response.headers.has(SCOPE_REFUSED_HEADER)) {
      retireDocumentScope();
    }
    return response;
  };
}

export function createClient() {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    throw new Error(
      "Supabase browser client misconfigured: set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(url, key, {
    global: { fetch: scopedDataApiFetch(new URL("/rest/v1/", url).href) },
  });
}
