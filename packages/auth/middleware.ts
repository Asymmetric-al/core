import {
  getSupabasePublicConfig,
  type SupabasePublicConfig,
} from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { reportAccessDiagnostic } from "./access-diagnostics";
import { safeNextParam } from "./demo-login";
import {
  assertSupabaseDatasourceAllowedForE2EBypass,
  E2E_AUTH_COOKIE_NAME,
  getE2EAuthCookieNameForProxyHost,
  isE2EAuthBypassEnabled,
  parseE2EAuthCookieValue,
  type E2EAuthSession,
} from "./e2e-auth";
import { frontNotFound } from "./front";
import { admitApiMutation } from "./mutation-admission";
import { hasAnyRole, type RoleSnapshot } from "./permissions";
import { readActiveAssignments } from "./principal/assignment";
import { listE2EAuthAssignments } from "./principal/e2e-assignments";
import {
  createRpcAssignmentReader,
  withReadErrorCause,
} from "./principal/reader";
import {
  ADDRESS_PREFIX_HEADER,
  ASSIGNMENT_HEADER,
  NAME_TENANT_HEADER,
  PAGE_SCOPE_HEADERS,
  ROLE_CLASS_HEADER,
  TENANT_HEADER,
  TENANT_REWRITE_HEADER,
} from "./request-headers";
import {
  isListedRouteMatch,
  matchesListedRoute,
  matchesProtectedPrefix,
} from "./route-matching";
import {
  CHOOSER_PATH,
  isOutsideTenantSegment,
  parseTenantAddress,
} from "./tenant-address";
import { decideLanding, decideTenantAddress } from "./tenant-address-decisions";
import {
  decideWebStudioAccess,
  isStrayWebStudioChooserPath,
  isWebStudioApiPath,
  isWebStudioPath,
  WEB_STUDIO_CHOOSER_PATH,
  WEB_STUDIO_TENANT_COOKIE,
  type WebStudioCookieState,
} from "./web-studio";
import {
  refreshWebStudioApiSession,
  webStudioChooserUrl,
  webStudioEntryRedirect,
} from "./web-studio-proxy";

import type { AssignmentRpcClient } from "./principal/reader";
import type { ActiveAssignment, RoleClass } from "./principal/types";
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
  roleClass?: RoleClass;
  allowApi?: boolean;
  resolveUserRole?: (args: {
    userId: string;
    supabase: SupabaseUserRoleReader;
    request: NextRequest;
    roleClass: RoleClass | null;
    nameTenantId?: string;
  }) => Promise<RoleSnapshot | null>;
  tenantAddress?: boolean;
  webStudio?: {
    readCookie: (value: string | undefined) => Promise<WebStudioCookieState>;
  };
}

export type SupabaseUserRoleReader = ReturnType<typeof createServerClient>;

export interface UnauthenticatedRedirectRule {
  prefix: string;
  redirectTo: string;
  preserveNext?: boolean;
}

const DEFAULT_AUTH_ROUTES = ["/login", "/register"] as const;

const TENANT_REWRITE_MARKER = crypto.randomUUID();

const PROTECTED_ACTION_PATH_PREFIX = "/invite";

function isProtectedActionDoorwayPath(pathname: string): boolean {
  return (
    pathname === PROTECTED_ACTION_PATH_PREFIX ||
    pathname.startsWith(`${PROTECTED_ACTION_PATH_PREFIX}/`)
  );
}

function applyProtectedActionHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-transform, max-age=0",
  );
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

function isPublicRoute(pathname: string, publicRoutes: string[]) {
  return isListedRouteMatch(pathname, publicRoutes, matchesListedRoute);
}

function isProtectedRoute(pathname: string, prefixes: string[]) {
  return isListedRouteMatch(pathname, prefixes, matchesProtectedPrefix);
}

function forwardedRequestHeaders(
  request: NextRequest,
  pathname: string,
  roleClass: RoleClass | null,
  isApiRequest: boolean,
  nameTenantId?: string,
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-asym-pathname", pathname);
  if (roleClass) requestHeaders.set(ROLE_CLASS_HEADER, roleClass);
  else requestHeaders.delete(ROLE_CLASS_HEADER);
  for (const name of PAGE_SCOPE_HEADERS) {
    if (isApiRequest && (name === TENANT_HEADER || name === ASSIGNMENT_HEADER))
      continue;
    requestHeaders.delete(name);
  }
  if (nameTenantId) requestHeaders.set(NAME_TENANT_HEADER, nameTenantId);
  return requestHeaders;
}

function withPathHeader(
  request: NextRequest,
  pathname: string,
  roleClass: RoleClass | null,
  nameTenantId?: string,
) {
  return NextResponse.next({
    request: {
      headers: forwardedRequestHeaders(
        request,
        pathname,
        roleClass,
        pathname.startsWith("/api/"),
        nameTenantId,
      ),
    },
  });
}

export function appUrl(request: NextRequest, path: string): URL {
  const base = request.nextUrl.basePath || "";
  const full =
    !base || !path.startsWith("/") || path.startsWith("//")
      ? path
      : path === "/"
        ? base
        : path.startsWith("/?") || path.startsWith("/#")
          ? `${base}${path.slice(1)}`
          : `${base}${path}`;
  return new URL(full, request.nextUrl.origin);
}

function buildRedirectUrl(
  request: NextRequest,
  path: string,
  next?: string | null,
) {
  const url = appUrl(request, path);
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

function withSessionFrom<T extends NextResponse>(
  response: T,
  cookieSource: NextResponse,
): T {
  for (const name of ["Cache-Control", "Expires", "Pragma"]) {
    const value = cookieSource.headers.get(name);
    if (value !== null) response.headers.set(name, value);
  }
  cookieSource.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

function redirectWithCookies(url: URL, cookieSource: NextResponse) {
  return withSessionFrom(NextResponse.redirect(url), cookieSource);
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

function rewriteLeftServerResponse(pathname: string) {
  const message =
    "Tenant address rewrite left the server: the proxy received its own " +
    `rewritten request for "${pathname}". Next treats a rewrite as external ` +
    "when the server is bound to a loopback IP address such as 127.0.0.1 " +
    "or ::1; " +
    "bind it to localhost (record D-19).";
  console.error(`[auth] ${message}`);
  return new NextResponse(message, {
    status: 500,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function withSearch(request: NextRequest, pathname: string) {
  return `${pathname}${request.nextUrl.search}`;
}

function ownOriginUrl(request: NextRequest, path: string): URL | null {
  if (!path.startsWith("/")) return null;
  const url = appUrl(request, path);
  return url.origin === request.nextUrl.origin && !url.pathname.startsWith("//")
    ? url
    : null;
}

function refusedAddress(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

function chooserUrl(
  request: NextRequest,
  tenantId: string | null,
  next: string,
) {
  const url = appUrl(request, CHOOSER_PATH);
  if (tenantId) url.searchParams.set("tenant", tenantId);
  url.searchParams.set("next", next);
  return url;
}

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
  const roleClass = options.roleClass ?? null;
  const tenantAddress = options.tenantAddress === true;
  const webStudio = options.webStudio ?? null;

  if (allowedRoles && allowedRoles.length > 0 && !resolveUserRole) {
    throw new Error(
      "createAuthMiddleware: `allowedRoles` was provided without `resolveUserRole`. " +
        "Role enforcement fails closed, so every signed-in user would be redirected " +
        "from every protected route. Pass a `resolveUserRole` implementation.",
    );
  }
  const publicInside = tenantAddress
    ? publicRoutes.filter((route) => !isOutsideTenantSegment(route))
    : [];
  if (publicInside.length > 0) {
    throw new Error(
      `createAuthMiddleware: public route(s) ${publicInside.join(", ")} lie ` +
        "inside the tenant segment. Add each page outside it to " +
        "OUTSIDE_TENANT_SEGMENT_ROOTS (packages/auth/tenant-address.ts), the " +
        "one list of addresses outside the segment, or drop the route.",
    );
  }
  if (tenantAddress && !roleClass) {
    throw new Error(
      "createAuthMiddleware: `tenantAddress` needs the surface's `roleClass`, " +
        "because the membership decision reads only rows of that class.",
    );
  }
  if (webStudio && roleClass !== "staff") {
    throw new Error(
      "createAuthMiddleware: `webStudio` needs the staff `roleClass`: Web " +
        "Studio acts on staff rows.",
    );
  }

  return async function authMiddleware(
    request: NextRequest,
    { nameTenantId }: { nameTenantId?: string } = {},
  ) {
    const addressPathname = request.nextUrl.pathname;
    const refusal = await admitApiMutation(request, addressPathname);
    if (refusal) return refusal;

    if (
      tenantAddress &&
      request.headers.get(TENANT_REWRITE_HEADER) === TENANT_REWRITE_MARKER
    ) {
      return rewriteLeftServerResponse(addressPathname);
    }

    const address = tenantAddress ? parseTenantAddress(addressPathname) : null;
    const pathname = address ? address.innerPathname : addressPathname;
    if (nameTenantId && address && address.tenantId !== nameTenantId) {
      return frontNotFound();
    }
    const inName = <Row extends { tenantId: string }>(rows: readonly Row[]) =>
      nameTenantId ? rows.filter((row) => row.tenantId === nameTenantId) : rows;

    if (allowApi && pathname.startsWith("/api/")) {
      if (address) return new NextResponse(null, { status: 404 });
      return withPathHeader(request, pathname, roleClass, nameTenantId);
    }

    if (webStudio && isWebStudioApiPath(pathname)) {
      if (address) return refusedAddress();
      return refreshWebStudioApiSession(
        request,
        pathname,
        roleClass,
        nameTenantId,
      );
    }

    if (webStudio && !address && isStrayWebStudioChooserPath(pathname)) {
      const target = ownOriginUrl(
        request,
        withSearch(request, WEB_STUDIO_CHOOSER_PATH),
      );
      return target ? NextResponse.redirect(target) : refusedAddress();
    }

    const config = getSupabasePublicConfig();
    const { url, key } = config;
    const isAuthRoute = authRoutes.some((route) =>
      matchesListedRoute(pathname, route),
    );
    const isExplicitlyPublic =
      isAuthRoute || isPublicRoute(pathname, publicRoutes);

    if (address && (isExplicitlyPublic || isOutsideTenantSegment(pathname))) {
      const target = ownOriginUrl(request, withSearch(request, pathname));
      return target ? NextResponse.redirect(target) : refusedAddress();
    }

    if (
      isPublicRoute(pathname, publicRoutes) &&
      isProtectedActionDoorwayPath(pathname)
    ) {
      return applyProtectedActionHeaders(
        withPathHeader(request, pathname, roleClass, nameTenantId),
      );
    }

    const isProtectedPath =
      address !== null || isProtectedRoute(pathname, protectedRoutePrefixes);
    const requiresAuthentication = !isExplicitlyPublic && isProtectedPath;

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

      return withPathHeader(request, pathname, roleClass, nameTenantId);
    }

    const requestHeaders = forwardedRequestHeaders(
      request,
      addressPathname,
      roleClass,
      false,
      nameTenantId,
    );
    let supabaseResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });
    const refreshHeaders = new Headers();

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
          const previousCookies = supabaseResponse.cookies.getAll();
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
          previousCookies.forEach((cookie) => {
            supabaseResponse.cookies.set(cookie);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(
              name,
              value,
              options as Record<string, unknown>,
            );
          });
          Object.entries(cacheHeaders).forEach(([name, value]) => {
            refreshHeaders.set(name, value);
          });
          refreshHeaders.forEach((value, name) => {
            supabaseResponse.headers.set(name, value);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId = user?.id ?? null;
    let bypassSession: E2EAuthSession | null = null;

    const e2eAuthBypassEnabled = isE2EAuthBypassEnabled();

    if (!userId && e2eAuthBypassEnabled && isProtectedPath) {
      assertSupabaseDatasourceAllowedForE2EBypass(url);

      const e2eCookieName = getE2EAuthCookieNameForProxyHost(
        request.headers.get("host"),
      );
      const rawCookie = e2eCookieName
        ? request.cookies.get(e2eCookieName)?.value
        : undefined;
      const e2eSession = await parseE2EAuthCookieValue(rawCookie);
      if (e2eSession && isRoleAllowedForApp(e2eSession.role, allowedRoles)) {
        userId = e2eSession.userId;
        bypassSession = e2eSession;
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
          bypassSession = legacySession;
        }
      }
    }

    if (isPublicRoute(pathname, publicRoutes) && !isAuthRoute) {
      return supabaseResponse;
    }

    if (isAuthRoute) {
      if (user && redirectAuthenticatedTo) {
        if (!tenantAddress && allowedRoles && allowedRoles.length > 0) {
          const roleSnapshot = resolveUserRole
            ? await resolveUserRole({
                userId: user.id,
                supabase,
                request,
                roleClass,
              })
            : null;

          if (!roleSnapshot || !hasAnyRole(roleSnapshot, allowedRoles)) {
            if (roleSnapshot) {
              reportAccessDiagnostic("role_denied");
            }
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
      return redirectWithCookies(
        buildUnauthenticatedRedirectUrl(
          request,
          loginPath,
          unauthenticatedRedirects,
        ),
        supabaseResponse,
      );
    }

    if (webStudio && userId && isProtectedPath && isWebStudioPath(pathname)) {
      if (pathname === WEB_STUDIO_CHOOSER_PATH) return supabaseResponse;
      const assignments = await readSurfaceAssignments(
        user?.id ?? null,
        bypassSession,
        supabase,
      );
      const decision = assignments
        ? decideWebStudioAccess({
            assignments,
            cookie: await webStudio.readCookie(
              request.cookies.get(WEB_STUDIO_TENANT_COOKIE)?.value,
            ),
            nameTenantId: nameTenantId ?? null,
          })
        : ({ kind: "refuse" } as const);
      const entry = webStudioEntryRedirect(
        request,
        pathname,
        decision,
        nameTenantId,
      );
      if (entry) return redirectWithCookies(entry, supabaseResponse);
      if (decision.kind === "allow") return supabaseResponse;
      if (decision.kind === "refuse" && assignments) {
        reportAccessDiagnostic("no_assignment");
      }
      return redirectWithCookies(
        decision.kind === "choose"
          ? webStudioChooserUrl(
              request,
              withSearch(request, pathname),
              null,
              decision.refused === true,
            )
          : buildRedirectUrl(request, unauthorizedRedirectTo),
        supabaseResponse,
      );
    }

    if (
      tenantAddress &&
      roleClass &&
      userId &&
      isProtectedPath &&
      !isOutsideTenantSegment(pathname)
    ) {
      const assignments = await readSurfaceAssignments(
        user?.id ?? null,
        bypassSession,
        supabase,
      );
      if (!assignments) {
        return redirectWithCookies(
          buildRedirectUrl(request, unauthorizedRedirectTo),
          supabaseResponse,
        );
      }

      if (!address) {
        const landing = decideLanding({
          assignments: inName(assignments),
          roleClass,
        });
        if (landing.kind === "refuse") {
          reportAccessDiagnostic("no_assignment");
          return redirectWithCookies(
            buildRedirectUrl(request, unauthorizedRedirectTo),
            supabaseResponse,
          );
        }
        const target =
          landing.kind === "enter"
            ? ownOriginUrl(
                request,
                withSearch(
                  request,
                  `${landing.prefix}${pathname === "/" ? "" : pathname}`,
                ),
              )
            : chooserUrl(
                request,
                landing.tenantId,
                withSearch(request, pathname),
              );
        if (!target) return refusedAddress();
        return redirectWithCookies(target, supabaseResponse);
      }

      const decision = decideTenantAddress({
        assignments: inName(assignments),
        roleClass,
        tenantId: address.tenantId,
        subRole: address.subRole,
      });
      switch (decision.kind) {
        case "refuse":
          reportAccessDiagnostic("no_assignment");
          return redirectWithCookies(
            buildRedirectUrl(request, unauthorizedRedirectTo),
            supabaseResponse,
          );
        case "canonical": {
          const target = ownOriginUrl(
            request,
            withSearch(
              request,
              `${decision.prefix}${pathname === "/" ? "" : pathname}`,
            ),
          );
          if (!target) return refusedAddress();
          return redirectWithCookies(target, supabaseResponse);
        }
        case "choose":
          return redirectWithCookies(
            chooserUrl(
              request,
              decision.tenantId,
              withSearch(request, pathname),
            ),
            supabaseResponse,
          );
        case "allow": {
          const target = ownOriginUrl(request, withSearch(request, pathname));
          if (!target) return refusedAddress();
          requestHeaders.set(TENANT_HEADER, decision.assignment.tenantId);
          requestHeaders.set(
            ASSIGNMENT_HEADER,
            decision.assignment.assignmentId,
          );
          requestHeaders.set(ADDRESS_PREFIX_HEADER, decision.prefix);
          requestHeaders.set(TENANT_REWRITE_HEADER, TENANT_REWRITE_MARKER);
          return withSessionFrom(
            NextResponse.rewrite(target, {
              request: { headers: requestHeaders },
            }),
            supabaseResponse,
          );
        }
      }
    }

    if (
      isProtectedPath &&
      user &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      !(tenantAddress && pathname === CHOOSER_PATH)
    ) {
      const roleSnapshot = resolveUserRole
        ? await resolveUserRole({
            userId: user.id,
            supabase,
            request,
            roleClass,
            ...(nameTenantId ? { nameTenantId } : {}),
          })
        : null;

      if (!roleSnapshot || !hasAnyRole(roleSnapshot, allowedRoles)) {
        if (roleSnapshot) {
          reportAccessDiagnostic("role_denied");
        }
        return redirectWithCookies(
          buildRedirectUrl(request, unauthorizedRedirectTo),
          supabaseResponse,
        );
      }
    }

    return supabaseResponse;
  };
}

async function readSurfaceAssignments(
  userId: string | null,
  bypassSession: E2EAuthSession | null,
  supabase: SupabaseUserRoleReader,
): Promise<readonly ActiveAssignment[] | null> {
  if (!userId) {
    return bypassSession ? listE2EAuthAssignments(bypassSession) : null;
  }
  const { reader, readError } = withReadErrorCause(
    createRpcAssignmentReader(supabase as unknown as AssignmentRpcClient),
  );
  const read = await readActiveAssignments(userId, reader);
  if (!read.ok) {
    reportAccessDiagnostic("membership_query_failed", readError());
    return null;
  }
  return read.assignments;
}
