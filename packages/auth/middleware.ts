import {
  getSupabasePublicConfig,
  type SupabasePublicConfig,
} from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextParam } from "./demo-login";
import {
  assertSupabaseDatasourceAllowedForE2EBypass,
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "./e2e-auth";
import { hasAnyRole, type RoleSnapshot } from "./permissions";
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
  allowedRoles?: readonly UserRole[];
  allowApi?: boolean;
  /**
   * Resolves the signed-in user's complete role snapshot so the edge can
   * reject a wrong-app session before the app renders anything.
   *
   * Injected rather than hard-wired so this stays the one place that decides
   * *whether* a role passes, while *how* a role is looked up (and cached) is
   * the caller's concern. Returning `null` is treated as "not allowed".
   */
  resolveUserRole?: (args: {
    userId: string;
    supabase: SupabaseUserRoleReader;
    request: NextRequest;
  }) => Promise<RoleSnapshot | null>;
}

/**
 * The slice of the Supabase client the role resolver needs. Narrowed to a
 * structural type so tests can hand over a plain object instead of standing up
 * a real client.
 */
export type SupabaseUserRoleReader = ReturnType<typeof createServerClient>;

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

function redirectWithCookies(url: URL, cookieSource: NextResponse) {
  const response = NextResponse.redirect(url);
  cookieSource.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
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
  allowedRoles: readonly UserRole[] | undefined,
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
  const redirectAuthenticatedTo = options.redirectAuthenticatedTo;
  const unauthorizedRedirectTo = options.unauthorizedRedirectTo ?? loginPath;
  const resolveUserRole = options.resolveUserRole;

  // A role gate with no way to resolve a role fails closed on every request, so
  // the misconfiguration presents as "nobody can sign in anywhere" rather than
  // as an error. Refuse to build instead: loud at boot beats a silent lockout,
  // and the alternative default (skip the check) would be a silent hole.
  if (allowedRoles && allowedRoles.length > 0 && !resolveUserRole) {
    throw new Error(
      "createAuthMiddleware: `allowedRoles` was provided without `resolveUserRole`. " +
        "Role enforcement fails closed, so every signed-in user would be redirected " +
        "from every protected route. Pass a `resolveUserRole` implementation.",
    );
  }

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

    const isProtectedPath = isProtectedRoute(pathname, protectedRoutePrefixes);
    const e2eAuthBypassEnabled = isE2EAuthBypassEnabled();

    // Bind the bypass to datasource identity, not NODE_ENV: when the bypass flag
    // is on, refuse to honor an E2E cookie unless the configured Supabase project
    // is allowlisted (throws before serving a bypassed request).
    if (!userId && e2eAuthBypassEnabled && isProtectedPath) {
      assertSupabaseDatasourceAllowedForE2EBypass(url);

      // Playwright + demo-account set per-app `asym_e2e_auth_*` cookies while
      // Supabase has no user (see `E2E_AUTH_COOKIE_NAMES`). Honor both surface
      // cookies and the legacy cookie only when the explicit bypass is enabled.
      const e2eCookieName = getE2EAuthCookieNameForProxyHost(
        request.headers.get("host"),
      );
      const rawCookie = e2eCookieName
        ? request.cookies.get(e2eCookieName)?.value
        : undefined;
      const e2eSession = await parseE2EAuthCookieValue(rawCookie);
      if (e2eSession && isRoleAllowedForApp(e2eSession.role, allowedRoles)) {
        userId = e2eSession.userId;
      }

      if (!userId) {
        const legacySession = await parseE2EAuthCookieValue(
          request.cookies.get(E2E_AUTH_COOKIE_NAME)?.value,
        );
        if (
          legacySession &&
          isRoleAllowedForApp(legacySession.role, allowedRoles)
        ) {
          userId = legacySession.userId;
        }
      }
    }

    if (isPublicRoute(pathname, publicRoutes) && !isAuthRoute) {
      return supabaseResponse;
    }

    if (isAuthRoute) {
      // Send an already-signed-in visitor on to the app instead of rendering a
      // sign-in form. Gate on the Supabase `user`, never on `userId`: the E2E
      // bypass populates `userId` from a cookie with no Supabase session, and
      // redirecting those would bounce the e2e suite off /login and /register.
      if (user && redirectAuthenticatedTo) {
        if (allowedRoles && allowedRoles.length > 0) {
          const roleSnapshot = resolveUserRole
            ? await resolveUserRole({ userId: user.id, supabase, request })
            : null;

          if (!roleSnapshot || !hasAnyRole(roleSnapshot, allowedRoles)) {
            return redirectWithCookies(
              buildRedirectUrl(request, unauthorizedRedirectTo),
              supabaseResponse,
            );
          }
        }

        const requestedNext = safeNextParam(
          request.nextUrl.searchParams.get("next"),
        );
        return redirectWithCookies(
          buildRedirectUrl(request, requestedNext ?? redirectAuthenticatedTo),
          supabaseResponse,
        );
      }

      return supabaseResponse;
    }

    if (isProtectedPath && !userId) {
      return NextResponse.redirect(
        buildUnauthenticatedRedirectUrl(
          request,
          loginPath,
          unauthenticatedRedirects,
        ),
      );
    }

    // Authentication is not authorization: without this, any signed-in user of
    // any app reaches every other app's protected routes, because the check
    // above only proves *someone* is signed in.
    //
    // Gated on the Supabase `user`, never on `userId`. The E2E bypass above
    // populates `userId` from a cookie with no Supabase session and has already
    // applied `isRoleAllowedForApp` to it; re-resolving that id here would look
    // up a user who does not exist, resolve `null`, and bounce the suite.
    //
    // Fails closed: an unresolved role is treated as not allowed.
    if (isProtectedPath && user && allowedRoles && allowedRoles.length > 0) {
      const roleSnapshot = resolveUserRole
        ? await resolveUserRole({ userId: user.id, supabase, request })
        : null;

      if (!roleSnapshot || !hasAnyRole(roleSnapshot, allowedRoles)) {
        return redirectWithCookies(
          buildRedirectUrl(request, unauthorizedRedirectTo),
          supabaseResponse,
        );
      }
    }

    return supabaseResponse;
  };
}
