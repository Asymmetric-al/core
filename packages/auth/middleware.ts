import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { UserRole } from "@asym/database/types";

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  authRoutes?: string[];
  loginPath?: string;
  redirectAuthenticatedTo?: string;
  unauthorizedRedirectTo?: string;
  allowedRoles?: UserRole[];
  allowApi?: boolean;
  resolveSession?: (
    request: NextRequest,
  ) => Promise<{ userId: string | null; role: UserRole | null }>;
}

function isRouteMatch(pathname: string, route: string) {
  if (route === "/") {
    return pathname === "/";
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

function createAuthRedirect(request: NextRequest, loginPath: string) {
  const loginURL = request.nextUrl.clone();
  loginURL.pathname = loginPath;
  loginURL.search = "";

  const targetPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (targetPath !== loginPath && targetPath !== `${loginPath}/`) {
    loginURL.searchParams.set("next", targetPath);
  }

  return NextResponse.redirect(loginURL);
}

function createApiAuthError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

function isApiRoute(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const loginPath = options.loginPath ?? "/login";
  const authRoutes = options.authRoutes ?? [loginPath, "/register"];
  const redirectAuthenticatedTo = options.redirectAuthenticatedTo ?? "/";
  const unauthorizedRedirectTo =
    options.unauthorizedRedirectTo ?? redirectAuthenticatedTo;
  const allowApi = options.allowApi ?? false;
  const allowedRoles = options.allowedRoles;
  const resolveSession = options.resolveSession;

  return async function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const apiRoute = isApiRoute(pathname);
    const isPublicRoute = publicRoutes.some((route) =>
      isRouteMatch(pathname, route),
    );
    const isAuthRoute = authRoutes.some((route) =>
      isRouteMatch(pathname, route),
    );
    const isProtectedRoute = !isPublicRoute && !isAuthRoute;

    if (apiRoute && allowApi) {
      return NextResponse.next({ request });
    }

    let response = NextResponse.next({ request });
    let userId: string | null = null;
    let userRole: UserRole | null = null;

    if (resolveSession) {
      const session = await resolveSession(request);
      userId = session.userId;
      userRole = session.role;
    } else {
      const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseURL || !supabaseAnonKey) {
        if (isProtectedRoute) {
          if (apiRoute) {
            return createApiAuthError(401, "Unauthorized");
          }

          return createAuthRedirect(request, loginPath);
        }

        return response;
      }

      const supabase = createServerClient(supabaseURL, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: Array<{
              name: string;
              value: string;
              options?: Record<string, unknown>;
            }>,
          ) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(
                name,
                value,
                options as Record<string, unknown>,
              ),
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      userId = user?.id ?? null;

      if (userId && allowedRoles?.length) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", userId)
          .single();

        userRole = (profile?.role as UserRole | null) ?? null;
      }
    }

    if (!userId) {
      if (!isProtectedRoute) {
        return response;
      }

      if (apiRoute) {
        return createApiAuthError(401, "Unauthorized");
      }

      return createAuthRedirect(request, loginPath);
    }

    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = redirectAuthenticatedTo;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isProtectedRoute && allowedRoles?.length) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        if (apiRoute) {
          return createApiAuthError(403, "Forbidden");
        }

        const url = request.nextUrl.clone();
        url.pathname = unauthorizedRedirectTo;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    return response;
  };
}
