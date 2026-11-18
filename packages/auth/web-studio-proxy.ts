import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADDRESS_PREFIX_HEADER,
  ROLE_CLASS_HEADER,
  TENANT_REWRITE_HEADER,
} from "./request-headers";
import { WEB_STUDIO_CHOOSER_PATH } from "./web-studio";

/**
 * Web Studio's two rules in the admin proxy (plan 5.2, "One stated exception:
 * Web Studio"; AL-2675, WP2b slice C), kept out of `middleware.ts` so that
 * file only gains the lines that call them.
 */

/**
 * Payload's REST routes under `/web-studio/api` (plan 5.2; C09): the session
 * cookies are refreshed and the request passes on. No role lookup and never a
 * redirect: Payload's strategy resolves the caller from the session and the
 * Web Studio cookie and answers an expired or unauthorized call with JSON.
 *
 * The document's tenant and assignment headers stay: they are claims the
 * strategy compares with the cookie's selection, never a selection. Nothing
 * here is needed for correctness. A path the proxy's matcher skips (a file
 * name ending in an image extension, `.json`, `.txt` or `.xml`) reaches
 * Payload without it: the strategy still reads the session and the cookie
 * itself, client headers still select nothing, and an ended session still
 * gets JSON; only the refreshed session cookie is not written back.
 */
export async function refreshWebStudioApiSession(
  request: NextRequest,
  pathname: string,
  /** The surface's role class, as the proxy sets it on every request. */
  roleClass: string | null,
): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-asym-pathname", pathname);
  if (roleClass) requestHeaders.set(ROLE_CLASS_HEADER, roleClass);
  else requestHeaders.delete(ROLE_CLASS_HEADER);
  requestHeaders.delete(ADDRESS_PREFIX_HEADER);
  requestHeaders.delete(TENANT_REWRITE_HEADER);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
        cacheHeaders: Record<string, string> = {},
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        const cookieHeader = request.headers.get("cookie");
        if (cookieHeader === null) requestHeaders.delete("cookie");
        else requestHeaders.set("cookie", cookieHeader);
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request: { headers: requestHeaders } });
        previousCookies.forEach((cookie) => response.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(cacheHeaders).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

/** The Web Studio chooser, returning to `next` (a Web Studio page and query). */
export function webStudioChooserUrl(request: NextRequest, next: string): URL {
  const url = new URL(WEB_STUDIO_CHOOSER_PATH, request.nextUrl.origin);
  url.searchParams.set("next", next);
  return url;
}
