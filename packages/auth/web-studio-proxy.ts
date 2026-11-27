import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADDRESS_PREFIX_HEADER,
  NAME_GENERATION_HEADER,
  NAME_TENANT_HEADER,
  ROLE_CLASS_HEADER,
  setVerifiedNameHeaders,
  TENANT_REWRITE_HEADER,
  type VerifiedNameFacts,
} from "./request-headers";
import {
  WEB_STUDIO_CHOOSER_PATH,
  WEB_STUDIO_ENTRY_ASSIGNMENT_PARAM,
  WEB_STUDIO_ENTRY_ROLE_PARAM,
  WEB_STUDIO_ENTRY_TENANT_PARAM,
  WEB_STUDIO_FROM_PARAM,
  WEB_STUDIO_REFUSED_PARAM,
  type WebStudioDecision,
} from "./web-studio";

export async function refreshWebStudioApiSession(
  request: NextRequest,
  pathname: string,
  roleClass: string | null,
  name: VerifiedNameFacts = {},
): Promise<NextResponse> {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-asym-pathname", pathname);
  if (roleClass) requestHeaders.set(ROLE_CLASS_HEADER, roleClass);
  else requestHeaders.delete(ROLE_CLASS_HEADER);
  requestHeaders.delete(ADDRESS_PREFIX_HEADER);
  requestHeaders.delete(TENANT_REWRITE_HEADER);
  requestHeaders.delete(NAME_TENANT_HEADER);
  requestHeaders.delete(NAME_GENERATION_HEADER);
  setVerifiedNameHeaders(requestHeaders, name);

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
  refused = false,
): URL {
  const base = request.nextUrl.basePath || "";
  const url = new URL(
    `${base}${WEB_STUDIO_CHOOSER_PATH}`,
    request.nextUrl.origin,
  );
  url.searchParams.set("next", next);
  if (refused) url.searchParams.set(WEB_STUDIO_REFUSED_PARAM, "1");
  if (from) url.searchParams.set(WEB_STUDIO_FROM_PARAM, from);
  return url;
}

const CANONICAL_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function webStudioEntryRedirect(
  request: NextRequest,
  pathname: string,
  decision: WebStudioDecision,
  nameTenantId?: string,
): URL | null {
  const search = new URLSearchParams(request.nextUrl.search);
  if (nameTenantId !== undefined) {
    return nameEntryRedirect(request, pathname, decision, search);
  }
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
    const base = request.nextUrl.basePath || "";
    return new URL(`${base}${address}`, request.nextUrl.origin);
  }
  return webStudioChooserUrl(
    request,
    address,
    CANONICAL_ID.test(tenantId) &&
      (nameTenantId === undefined || tenantId === nameTenantId)
      ? tenantId
      : null,
    decision.kind === "choose" && decision.refused === true,
  );
}

function nameEntryRedirect(
  request: NextRequest,
  pathname: string,
  decision: WebStudioDecision,
  search: URLSearchParams,
): URL | null {
  if (!search.has(WEB_STUDIO_ENTRY_ROLE_PARAM)) return null;
  if (decision.kind === "refuse") return null;
  const roles = search.getAll(WEB_STUDIO_ENTRY_ROLE_PARAM);
  search.delete(WEB_STUDIO_ENTRY_ROLE_PARAM);
  const query = search.toString();
  const address = query ? `${pathname}?${query}` : pathname;
  if (
    roles.length === 1 &&
    decision.kind === "allow" &&
    decision.assignment.staffRole === roles[0]
  ) {
    const base = request.nextUrl.basePath || "";
    return new URL(`${base}${address}`, request.nextUrl.origin);
  }
  return webStudioChooserUrl(
    request,
    address,
    null,
    decision.kind === "choose" && decision.refused === true,
  );
}
