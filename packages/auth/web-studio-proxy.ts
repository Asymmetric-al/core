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

export async function refreshWebStudioApiSession(
  request: NextRequest,
  pathname: string,
  roleClass: string | null,
): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-asym-pathname", pathname);
  if (roleClass) requestHeaders.set(ROLE_CLASS_HEADER, roleClass);
  else requestHeaders.delete(ROLE_CLASS_HEADER);
  requestHeaders.delete(ADDRESS_PREFIX_HEADER);
  requestHeaders.delete(TENANT_REWRITE_HEADER);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
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
