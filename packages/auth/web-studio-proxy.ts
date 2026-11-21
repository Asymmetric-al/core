import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADDRESS_PREFIX_HEADER,
  ROLE_CLASS_HEADER,
  TENANT_REWRITE_HEADER,
} from "./request-headers";
import {
  WEB_STUDIO_CHOOSER_PATH,
  WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM,
  WEB_STUDIO_ENTRY_TENANT_PARAM,
  WEB_STUDIO_FROM_PARAM,
  type WebStudioDecision,
} from "./web-studio";

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
  // Every cache header any write of the session asked for, as the main
  // proxy keeps them: each write rebuilds the response (council on the
  // joined release, JC9).
  const refreshHeaders = new Headers();
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
          refreshHeaders.set(name, value);
        });
        refreshHeaders.forEach((value, name) => {
          response.headers.set(name, value);
        });
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

/**
 * The Web Studio chooser, returning to `next` (a Web Studio page and query),
 * offering first the organization `from` names, if any (JC3).
 */
export function webStudioChooserUrl(
  request: NextRequest,
  next: string,
  from?: string | null,
): URL {
  const url = new URL(WEB_STUDIO_CHOOSER_PATH, request.nextUrl.origin);
  url.searchParams.set("next", next);
  if (from) url.searchParams.set(WEB_STUDIO_FROM_PARAM, from);
  return url;
}

const CANONICAL_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * A link into Web Studio from a tenant's page in Mission Control (council on
 * the joined release, JC3). Web Studio keeps its organization in a cookie
 * that lasts thirty days, so the link names the page's tenant and row
 * (`withWebStudioEntry`), and the proxy compares them with the cookie's
 * choice before Web Studio renders:
 *
 * - they agree: the same address without them, so a later reload of the
 *   page never asks again;
 * - they do not, or nothing is chosen: the Web Studio chooser, offering the
 *   linked organization first, and returning to the address without them.
 *   A link never sets the cookie; only the chooser's form does, after its
 *   own check against the person's live rows;
 * - a person with no staff row: `null`, the proxy's refusal stands.
 *
 * `null` too for an address that names no organization. A value that is not
 * a tenant id is never offered.
 */
export function webStudioEntryRedirect(
  request: NextRequest,
  pathname: string,
  decision: WebStudioDecision,
): URL | null {
  const search = new URLSearchParams(request.nextUrl.search);
  if (
    !search.has(WEB_STUDIO_ENTRY_TENANT_PARAM) &&
    !search.has(WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM)
  ) {
    return null;
  }
  if (decision.kind === "refuse") return null;
  const tenantId = search.get(WEB_STUDIO_ENTRY_TENANT_PARAM) ?? "";
  const assignmentId = search.get(WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM) ?? "";
  search.delete(WEB_STUDIO_ENTRY_TENANT_PARAM);
  search.delete(WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM);
  const query = search.toString();
  const address = query ? `${pathname}?${query}` : pathname;
  if (
    decision.kind === "allow" &&
    decision.assignment.tenantId === tenantId &&
    decision.assignment.assignmentId === assignmentId
  ) {
    return new URL(address, request.nextUrl.origin);
  }
  return webStudioChooserUrl(
    request,
    address,
    CANONICAL_ID.test(tenantId) ? tenantId : null,
  );
}
