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
import {
  isListedRouteMatch,
  matchesListedRoute,
  matchesProtectedPrefix,
} from "./route-matching";

import type { UserRole } from "@asym/database/types";

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  authRoutes?: string[];
  protectedRoutePrefixes?: string[];
  unauthenticatedRedirects?: UnauthenticatedRedirectRule[];
  loginPath?: string;
  redirectAuthenticatedTo?: string;
  unauthorizedRedirectTo?: string;
  allowedRoles?: UserRole[];
  allowApi?: boolean;
  resolveSession?: (
    request: NextRequest,
  ) => Promise<{ userId: string | null; role: UserRole | null }>;
}

export interface UnauthenticatedRedirectRule {
  prefix: string;
  redirectTo: string;
  preserveNext?: boolean;
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

function findUnauthenticatedRedirectRule(
  pathname: string,
  rules: UnauthenticatedRedirectRule[],
) {
  return rules.find((rule) => matchesProtectedPrefix(pathname, rule.prefix));
}

function buildUnauthenticatedRedirectUrl(
  request: NextRequest,
  loginPath: string,
  rules: UnauthenticatedRedirectRule[],
) {
  const rule = findUnauthenticatedRedirectRule(request.nextUrl.pathname, rules);
  const redirectPath = rule?.redirectTo ?? loginPath;
  const shouldPreserveNext = rule?.preserveNext ?? true;
  const next = shouldPreserveNext
    ? safeNextParam(
        `${request.nextUrl.pathname}${request.nextUrl.search || ""}`,
      )
    : null;

  return buildRedirectUrl(request, redirectPath, next);
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
  role: UserRole,
  allowedRoles: UserRole[] | undefined,
) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  return allowedRoles.includes(role);
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const authRoutes = options.authRoutes ?? [...DEFAULT_AUTH_ROUTES];
  const protectedRoutePrefixes = options.protectedRoutePrefixes ?? ["/"];
  const unauthenticatedRedirects = options.unauthenticatedRedirects ?? [];
  const loginPath = options.loginPath ?? "/login";
  const allowApi = options.allowApi ?? true;
  const allowedRoles = options.allowedRoles;

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
        const redirectUrl = buildUnauthenticatedRedirectUrl(
          request,
          loginPath,
          unauthenticatedRedirects,
        );
        if (
          !findUnauthenticatedRedirectRule(pathname, unauthenticatedRedirects)
        ) {
          redirectUrl.searchParams.set("error", "auth_misconfigured");
        }
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
      if (e2eSession && isRoleAllowedForApp(e2eSession.role, allowedRoles)) {
        userId = e2eSession.userId;
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
      if (
        legacySession &&
        isRoleAllowedForApp(legacySession.role, allowedRoles)
      ) {
        userId = legacySession.userId;
      }
    }

    if (isPublicRoute(pathname, publicRoutes) && !isAuthRoute) {
      return supabaseResponse;
    }

    if (isAuthRoute) {
      return supabaseResponse;
    }

    if (isProtectedRoute(pathname, protectedRoutePrefixes) && !userId) {
      return NextResponse.redirect(
        buildUnauthenticatedRedirectUrl(
          request,
          loginPath,
          unauthenticatedRedirects,
        ),
      );
    }

    return supabaseResponse;
  };
}
