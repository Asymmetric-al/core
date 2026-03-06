import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  E2E_AUTH_COOKIE_NAME,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
} from "./e2e-auth";
import {
  derivePrimaryRole,
  hasAnyRole,
  type AuthMembership,
} from "./permissions";

import type { UserRole } from "@asym/database/types";

const MEMBERSHIP_ROLES = new Set(["donor", "missionary", "staff"]);
const STAFF_SUBROLES = new Set([
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
]);

type MembershipRow = {
  tenant_id: string | null;
  role: string | null;
  staff_role: string | null;
  is_active: boolean | null;
};

export interface AuthMiddlewareOptions {
  publicRoutes?: string[];
  protectedRoutes?: string[];
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

async function loadMembershipsForTenant(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  tenantId: string | null,
): Promise<AuthMembership[]> {
  if (!tenantId) {
    return [];
  }

  const { data: rows } = await supabase
    .schema("authz")
    .from("memberships")
    .select("tenant_id, role, staff_role, is_active")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  return ((rows ?? []) as MembershipRow[])
    .filter(
      (row): row is MembershipRow & { tenant_id: string; role: string } =>
        typeof row.tenant_id === "string" &&
        typeof row.role === "string" &&
        MEMBERSHIP_ROLES.has(row.role),
    )
    .map((row) => ({
      tenantId: row.tenant_id,
      role: row.role as AuthMembership["role"],
      staffRole:
        typeof row.staff_role === "string" && STAFF_SUBROLES.has(row.staff_role)
          ? (row.staff_role as NonNullable<AuthMembership["staffRole"]>)
          : null,
      isActive: row.is_active ?? true,
    }));
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const publicRoutes = options.publicRoutes ?? [];
  const protectedRoutes = options.protectedRoutes ?? [];
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
    const isProtectedRoute = isPublicRoute
      ? false
      : isAuthRoute
        ? false
        : protectedRoutes.length > 0
          ? protectedRoutes.some((route) => isRouteMatch(pathname, route))
          : true;

    if (apiRoute && allowApi) {
      return NextResponse.next({ request });
    }

    let response = NextResponse.next({ request });
    let userId: string | null = null;
    let userRole: UserRole | null = null;
    const roleSnapshot: {
      profileRole: UserRole | null;
      memberships: AuthMembership[];
    } = {
      profileRole: null,
      memberships: [],
    };

    if (resolveSession) {
      const session = await resolveSession(request);
      userId = session.userId;
      userRole = session.role;
      roleSnapshot.profileRole = session.role;
    } else {
      const e2eSession = isE2EAuthBypassEnabled()
        ? parseE2EAuthCookieValue(
            request.cookies.get(E2E_AUTH_COOKIE_NAME)?.value,
          )
        : null;

      if (e2eSession) {
        userId = e2eSession.userId;
        userRole = e2eSession.role;
        roleSnapshot.profileRole = e2eSession.role;
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
            .select("tenant_id, role")
            .eq("user_id", userId)
            .single();

          roleSnapshot.profileRole =
            typeof profile?.role === "string"
              ? (profile.role as UserRole)
              : null;
          roleSnapshot.memberships = await loadMembershipsForTenant(
            supabase,
            userId,
            typeof profile?.tenant_id === "string" ? profile.tenant_id : null,
          );
          userRole = derivePrimaryRole(roleSnapshot);
        }
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
      if (
        allowedRoles?.length &&
        (!userRole || !hasAnyRole(roleSnapshot, allowedRoles))
      ) {
        return response;
      }

      const url = request.nextUrl.clone();
      url.pathname = redirectAuthenticatedTo;
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isProtectedRoute && allowedRoles?.length) {
      if (!userRole || !hasAnyRole(roleSnapshot, allowedRoles)) {
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
