import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  authRoutes?: string[];
  loginPath?: string;
  redirectAuthenticatedTo?: string;
  allowApi?: boolean;
}

const DEFAULT_AUTH_ROUTES = ["/login", "/register"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const authRoutes = options.authRoutes ?? DEFAULT_AUTH_ROUTES;
  const loginPath = options.loginPath ?? "/login";
  const redirectAuthenticatedTo = options.redirectAuthenticatedTo ?? "/";
  const allowApi = options.allowApi ?? true;

  return async function authMiddleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });
    const pathname = request.nextUrl.pathname;

    if (allowApi && pathname.startsWith("/api")) {
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
            try {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(
                  name,
                  value,
                  options as Record<string, unknown>,
                ),
              );
            } catch {}
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isPublicRoute = publicRoutes.some((route) =>
      matchesRoute(pathname, route),
    );
    const isAuthRoute = authRoutes.some((route) =>
      matchesRoute(pathname, route),
    );

    if (!user && !isPublicRoute && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = redirectAuthenticatedTo;
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  };
}
