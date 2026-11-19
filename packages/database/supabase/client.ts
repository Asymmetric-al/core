import { createBrowserClient } from "@supabase/ssr";

import { getDocumentScope } from "../document-scope";
import { applyRequestScopeHeaders } from "../request-scope-headers";
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
 */
function scopedDataApiFetch(dataApiPrefix: string): typeof fetch {
  return (input, init) => {
    if (!requestUrl(input).startsWith(dataApiPrefix)) {
      return fetch(input, init);
    }
    const headers = applyRequestScopeHeaders(
      new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      ),
      getDocumentScope(),
    );
    return fetch(input, { ...init, headers });
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
