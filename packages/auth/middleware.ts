import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { safeNextParam } from "./demo-login";

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  authRoutes?: string[];
  protectedRoutePrefixes?: string[];
  loginPath?: string;
  redirectAuthenticatedTo?: string;
  allowApi?: boolean;
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
 * Shared auth proxy middleware for all app surfaces.
 *
 * Cookie/session implications:
 * - Uses Supabase SSR `getAll/setAll` bridging so refreshed auth cookies are
 *   written back to the response.
 * - Validates/refreshes JWT claims via `auth.getClaims()` on each matched
 *   protected request to maintain SSR session continuity.
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const authRoutes = options.authRoutes ?? [...DEFAULT_AUTH_ROUTES];
  const protectedRoutePrefixes = options.protectedRoutePrefixes ?? ["/"];
  const loginPath = options.loginPath ?? "/login";
  const redirectAuthenticatedTo = options.redirectAuthenticatedTo ?? "/";
  const allowApi = options.allowApi ?? true;

  return async function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (allowApi && pathname.startsWith("/api/")) {
      return withPathHeader(request, pathname);
    }

    const { url, key } = getSupabasePublicConfig();
    if (!url || !key) {
      // Fail-safe: if auth config is missing, avoid breaking all requests.
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

    const { data: claimsResult } = await supabase.auth.getClaims();
    const userId = claimsResult?.claims?.sub ?? null;

    const isAuthRoute = authRoutes.some((route) =>
      matchesRoutePrefix(pathname, route),
    );

    if (isPublicRoute(pathname, publicRoutes) && !isAuthRoute) {
      return supabaseResponse;
    }

    if (isAuthRoute && userId) {
      const requestedNext = safeNextParam(
        request.nextUrl.searchParams.get("next"),
      );
      const destination = requestedNext ?? redirectAuthenticatedTo;
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (isAuthRoute) {
      return supabaseResponse;
    }

    if (isProtectedRoute(pathname, protectedRoutePrefixes) && !userId) {
      const redirectUrl = new URL(loginPath, request.url);
      const next = safeNextParam(
        `${request.nextUrl.pathname}${request.nextUrl.search || ""}`,
      );
      if (next) {
        redirectUrl.searchParams.set("next", next);
      }
      return NextResponse.redirect(redirectUrl);
    }

    return supabaseResponse;
  };
}
