import {
  getSupabasePublicConfig,
  type SupabasePublicConfig,
} from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextParam } from "./demo-login";
import {
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "./e2e-auth";
import { derivePrimaryRole, type AuthMembership } from "./permissions";
import {
  isListedRouteMatch,
  matchesListedRoute,
  matchesProtectedPrefix,
} from "./route-matching";

import type {
  MembershipRole,
  StaffSubrole,
  UserRole,
} from "@asym/database/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthSessionResolution = {
  userId: string | null;
  role: UserRole | null;
};

type AuthSessionResolverContext = {
  supabase: SupabaseClient;
  userId: string | null;
};

type MembershipRow = {
  tenant_id: string | null;
  role: string | null;
  staff_role: string | null;
  is_active: boolean | null;
};

const USER_ROLES = new Set<UserRole>([
  "donor",
  "missionary",
  "admin",
  "staff",
  "super_admin",
]);
const MEMBERSHIP_ROLES = new Set<MembershipRole>([
  "donor",
  "missionary",
  "staff",
]);
const STAFF_SUBROLES = new Set<StaffSubrole>([
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
]);

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  authRoutes?: string[];
  protectedRoutePrefixes?: string[];
  loginPath?: string;
  redirectAuthenticatedTo?: string;
  unauthorizedRedirectTo?: string;
  allowedRoles?: UserRole[];
  allowApi?: boolean;
  resolveSession?: (
    request: NextRequest,
    context?: AuthSessionResolverContext,
  ) => Promise<AuthSessionResolution>;
}

const DEFAULT_AUTH_ROUTES = ["/login", "/register"] as const;

function isPublicRoute(pathname: string, publicRoutes: string[]) {
  return isListedRouteMatch(pathname, publicRoutes, matchesListedRoute);
}

function isProtectedRoute(pathname: string, prefixes: string[]) {
  return isListedRouteMatch(pathname, prefixes, matchesProtectedPrefix);
}

function withPathHeader(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-asym-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

/**
 * Use only the request's nextUrl.origin for redirects to prevent open redirect.
 * Do not trust Origin, Referer, or X-Forwarded-* headers for redirect targets.
 */
function buildRedirectUrl(
  request: NextRequest,
  path: string,
  next?: string | null,
) {
  const url = new URL(path, request.nextUrl.origin);
  if (next) {
    url.searchParams.set("next", next);
  }
  return url;
}

function logMissingSupabaseConfig(
  pathname: string,
  config: SupabasePublicConfig,
) {
  const missing: string[] = [];
  if (!config.url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!config.key) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  const missingHint =
    missing.length > 0 ? ` Missing: ${missing.join(", ")}.` : "";
  console.error(
    `[auth] Supabase auth config missing in proxy.${missingHint} Failing closed for protected path "${pathname}".`,
  );
}

/**
 * Shared auth proxy middleware for all app surfaces.
 *
 * Cookie/session implications:
 * - Uses Supabase SSR `getAll/setAll` bridging so refreshed auth cookies are
 *   written back to the response.
 * - Validates session via `auth.getUser()` on each matched protected request
 *   so revoked sessions are rejected and cookies stay in sync.
 */
function isRoleAllowedForApp(
  role: UserRole | null,
  allowedRoles: UserRole[] | undefined,
) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (!role) {
    return false;
  }
  return allowedRoles.includes(role);
}

function isUserRole(role: string | null | undefined): role is UserRole {
  return Boolean(role && USER_ROLES.has(role as UserRole));
}

function isMembershipRole(
  role: string | null | undefined,
): role is MembershipRole {
  return Boolean(role && MEMBERSHIP_ROLES.has(role as MembershipRole));
}

function isStaffSubrole(
  staffRole: string | null | undefined,
): staffRole is StaffSubrole {
  return Boolean(staffRole && STAFF_SUBROLES.has(staffRole as StaffSubrole));
}

async function loadMembershipsForProxy(
  supabase: SupabaseClient,
  userId: string,
  tenantId: string | null,
): Promise<AuthMembership[]> {
  if (!tenantId) {
    return [];
  }

  const { data } = await supabase
    .schema("authz")
    .from("memberships")
    .select("tenant_id, role, staff_role, is_active")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  return ((data ?? []) as MembershipRow[])
    .filter(
      (row): row is MembershipRow & { tenant_id: string; role: string } =>
        typeof row.tenant_id === "string" && isMembershipRole(row.role),
    )
    .map((row) => ({
      tenantId: row.tenant_id,
      role: row.role as MembershipRole,
      staffRole: isStaffSubrole(row.staff_role) ? row.staff_role : null,
      isActive: row.is_active ?? true,
    }));
}

async function resolveSupabaseSessionRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AuthSessionResolution> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  const profileRole = isUserRole(profile?.role) ? profile.role : null;
  const tenantId =
    typeof profile?.tenant_id === "string" ? profile.tenant_id : null;
  const memberships = await loadMembershipsForProxy(supabase, userId, tenantId);

  return {
    userId,
    role: derivePrimaryRole({ profileRole, memberships }),
  };
}

function buildUnauthorizedRedirectUrl(
  request: NextRequest,
  loginPath: string,
  unauthorizedRedirectTo: string,
) {
  const next = safeNextParam(
    `${request.nextUrl.pathname}${request.nextUrl.search || ""}`,
  );
  return buildRedirectUrl(
    request,
    unauthorizedRedirectTo,
    unauthorizedRedirectTo === loginPath ? next : null,
  );
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const authRoutes = options.authRoutes ?? [...DEFAULT_AUTH_ROUTES];
  const protectedRoutePrefixes = options.protectedRoutePrefixes ?? ["/"];
  const loginPath = options.loginPath ?? "/login";
  const allowApi = options.allowApi ?? true;
  const allowedRoles = options.allowedRoles;
  const unauthorizedRedirectTo = options.unauthorizedRedirectTo ?? loginPath;

  return async function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (allowApi && pathname.startsWith("/api/")) {
      return withPathHeader(request, pathname);
    }

    const config = getSupabasePublicConfig();
    const { url, key } = config;
    const isAuthRoute = authRoutes.some((route) =>
      matchesListedRoute(pathname, route),
    );
    const isExplicitlyPublic =
      isAuthRoute || isPublicRoute(pathname, publicRoutes);
    const requiresAuthentication =
      !isExplicitlyPublic && isProtectedRoute(pathname, protectedRoutePrefixes);

    if (!url || !key) {
      if (requiresAuthentication) {
        logMissingSupabaseConfig(pathname, config);
        const next = safeNextParam(
          `${request.nextUrl.pathname}${request.nextUrl.search || ""}`,
        );
        const redirectUrl = buildRedirectUrl(request, loginPath, next);
        redirectUrl.searchParams.set("error", "auth_misconfigured");
        return NextResponse.redirect(redirectUrl);
      }

      return withPathHeader(request, pathname);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-asym-pathname", pathname);
    const requestWithHeaders = NextResponse.next({
      request: { headers: requestHeaders },
    });
    const supabaseResponse = requestWithHeaders;

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
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(
              name,
              value,
              options as Record<string, unknown>,
            );
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId = user?.id ?? null;
    let userRole: UserRole | null = null;

    // Playwright + demo-account set per-app `asym_e2e_auth_*` cookies while
    // Supabase has no user (see `E2E_AUTH_COOKIE_NAMES`).
    // Proxy may not see `E2E_AUTH_BYPASS`; also allow outside production so
    // local `next dev` can mirror tests that use surface cookies.
    if (
      !userId &&
      (isE2EAuthBypassEnabled() || process.env.NODE_ENV !== "production") &&
      isProtectedRoute(pathname, protectedRoutePrefixes)
    ) {
      const e2eCookieName = getE2EAuthCookieNameForProxyHost(
        request.headers.get("host"),
      );
      const rawCookie = e2eCookieName
        ? request.cookies.get(e2eCookieName)?.value
        : undefined;
      const e2eSession = parseE2EAuthCookieValue(rawCookie);
      if (e2eSession) {
        userId = e2eSession.userId;
        userRole = e2eSession.role;
      }
    }

    if (
      !userId &&
      isE2EAuthBypassEnabled() &&
      isProtectedRoute(pathname, protectedRoutePrefixes)
    ) {
      const legacySession = parseE2EAuthCookieValue(
        request.cookies.get(E2E_AUTH_COOKIE_NAME)?.value,
      );
      if (legacySession) {
        userId = legacySession.userId;
        userRole = legacySession.role;
      }
    }

    if (isPublicRoute(pathname, publicRoutes) && !isAuthRoute) {
      return supabaseResponse;
    }

    if (isAuthRoute) {
      return supabaseResponse;
    }

    if (
      !userId &&
      options.resolveSession &&
      isProtectedRoute(pathname, protectedRoutePrefixes) &&
      allowedRoles?.length
    ) {
      try {
        const resolvedSession = await options.resolveSession(request, {
          supabase,
          userId: null,
        });
        userId = resolvedSession.userId;
        userRole = resolvedSession.role;
      } catch (error) {
        console.error(
          `[auth] Failed to resolve custom session role for protected path "${pathname}". Failing closed.`,
          error,
        );
      }
    }

    if (isProtectedRoute(pathname, protectedRoutePrefixes) && !userId) {
      const next = safeNextParam(
        `${request.nextUrl.pathname}${request.nextUrl.search || ""}`,
      );
      return NextResponse.redirect(buildRedirectUrl(request, loginPath, next));
    }

    if (
      user?.id &&
      isProtectedRoute(pathname, protectedRoutePrefixes) &&
      allowedRoles?.length
    ) {
      try {
        const resolvedSession = options.resolveSession
          ? await options.resolveSession(request, { supabase, userId: user.id })
          : await resolveSupabaseSessionRole(supabase, user.id);
        userId = resolvedSession.userId ?? user.id;
        userRole = resolvedSession.role;
      } catch (error) {
        console.error(
          `[auth] Failed to resolve session role for protected path "${pathname}". Failing closed.`,
          error,
        );
        userRole = null;
      }
    }

    if (
      isProtectedRoute(pathname, protectedRoutePrefixes) &&
      userId &&
      !isRoleAllowedForApp(userRole, allowedRoles)
    ) {
      return NextResponse.redirect(
        buildUnauthorizedRedirectUrl(
          request,
          loginPath,
          unauthorizedRedirectTo,
        ),
      );
    }

    return supabaseResponse;
  };
}
