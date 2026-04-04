import {
  getSupabasePublicConfig,
  type SupabasePublicConfig,
} from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextParam } from "./demo-login";
import {
  E2E_AUTH_COOKIE_NAME,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "./e2e-auth";

import type { UserRole } from "@asym/database/types";

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
  ) => Promise<{ userId: string | null; role: UserRole | null }>;
}

const DEFAULT_AUTH_ROUTES = ["/login", "/register"] as const;

function matchesRoutePrefix(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isPublicRoute(pathname: string, publicRoutes: string[]) {
  return publicRoutes.some((route) => matchesRoutePrefix(pathname, route));
}

function isProtectedRoute(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => matchesRoutePrefix(pathname, prefix));
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
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const authRoutes = options.authRoutes ?? [...DEFAULT_AUTH_ROUTES];
  const protectedRoutePrefixes = options.protectedRoutePrefixes ?? ["/"];
  const loginPath = options.loginPath ?? "/login";
  const allowApi = options.allowApi ?? true;

  return async function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (allowApi && pathname.startsWith("/api/")) {
      return withPathHeader(request, pathname);
    }

    const config = getSupabasePublicConfig();
    const { url, key } = config;
    const isAuthRoute = authRoutes.some((route) =>
      matchesRoutePrefix(pathname, route),
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

    if (
      !userId &&
      isE2EAuthBypassEnabled() &&
      isProtectedRoute(pathname, protectedRoutePrefixes)
    ) {
      const raw = request.cookies.get(E2E_AUTH_COOKIE_NAME)?.value;
      const e2e = parseE2EAuthCookieValue(raw);
      if (e2e) {
        userId = e2e.userId;
      }
    }

    if (isPublicRoute(pathname, publicRoutes) && !isAuthRoute) {
      return supabaseResponse;
    }

    if (isAuthRoute) {
      return supabaseResponse;
    }

    if (isProtectedRoute(pathname, protectedRoutePrefixes) && !userId) {
      const next = safeNextParam(
        `${request.nextUrl.pathname}${request.nextUrl.search || ""}`,
      );
      return NextResponse.redirect(buildRedirectUrl(request, loginPath, next));
    }

    return supabaseResponse;
  };
}
