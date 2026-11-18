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
import { hasAnyRole, type RoleSnapshot } from "./permissions";
import { readActiveAssignments } from "./principal/assignment";
import { listE2EAuthAssignments } from "./principal/e2e-assignments";
import { createRpcAssignmentReader } from "./principal/reader";
import {
  ADDRESS_PREFIX_HEADER,
  ASSIGNMENT_HEADER,
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
  isWebStudioApiPath,
  isWebStudioPath,
  WEB_STUDIO_CHOOSER_PATH,
  WEB_STUDIO_TENANT_COOKIE,
  type WebStudioCookieState,
} from "./web-studio";
import {
  refreshWebStudioApiSession,
  webStudioChooserUrl,
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
  /**
   * The surface's role class (plan 5.1): staff for Mission Control and Web
   * Studio, missionary for the missionary workspace, donor for the donor
   * portal. The proxy sets it as the `x-asym-role-class` request header on
   * every request it passes on, pages and API routes alike, overwriting any
   * value the client sent, and hands it to `resolveUserRole`. Without it the
   * proxy removes the header.
   */
  roleClass?: RoleClass;
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
    roleClass: RoleClass | null;
  }) => Promise<RoleSnapshot | null>;
  /**
   * Serve the signed-in pages under the tenant in the page address (plan 5.2;
   * AL-2675): `/<tenant>[~<sub-role>]/<page>`. Requires `roleClass`.
   *
   * For a tenant address the proxy decides membership before the page shell,
   * from the person's live rows of the surface's class in that tenant, in
   * place of the role check: it refuses a tenant the person does not belong
   * to, drops a suffix a one-row person does not need, sends a person with
   * several rows to the chooser unless the suffix names one they hold, and
   * otherwise rewrites onto the existing page with the tenant, the chosen
   * row and the prefix as request headers. A signed-in page address without
   * a tenant goes to the person's one organization or to the chooser.
   * Sign-in, the chooser, Web Studio and every `/api` route stay outside the
   * tenant segment (`OUTSIDE_TENANT_SEGMENT_ROOTS`).
   */
  tenantAddress?: boolean;
  /**
   * Web Studio (plan 5.2, "One stated exception: Web Studio"; AL-2675).
   * Payload's REST routes under `/web-studio/api` only have their session
   * refreshed: no role lookup and never a redirect, so Payload's strategy
   * answers an expired or unauthorized call with JSON. Web Studio's pages
   * take the organization from the signed Web Studio cookie, which only
   * narrows: the person's live staff rows decide, and a person with several
   * and no usable selection goes to the Web Studio chooser. Staff only.
   */
  webStudio?: {
    /** Reads and verifies the Web Studio cookie's value. */
    readCookie: (value: string | undefined) => Promise<WebStudioCookieState>;
  };
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

/**
 * A value only this server process knows, set on every rewritten tenant
 * address. Next fetches an external rewrite over HTTP with the forwarded
 * request headers, so the proxy then sees its own marker come back: on a
 * server bound to `127.0.0.1` it treats the rewrite as external and would
 * otherwise render the page with no tenant and no error (record D-19). A
 * client that forges the header cannot know the value, so its copy is simply
 * deleted.
 */
const TENANT_REWRITE_MARKER = crypto.randomUUID();

function isPublicRoute(pathname: string, publicRoutes: string[]) {
  return isListedRouteMatch(pathname, publicRoutes, matchesListedRoute);
}

function isProtectedRoute(pathname: string, prefixes: string[]) {
  return isListedRouteMatch(pathname, prefixes, matchesProtectedPrefix);
}

/**
 * The request headers the proxy passes on: the pathname, and the surface's
 * role class or nothing, never a value the client sent. On a page request
 * every scope header is deleted, so only the proxy's own decision sets one.
 * On an API request the tenant and assignment headers the own-API fetch
 * wrapper sends stay, as proposals the resolver checks.
 */
function forwardedRequestHeaders(
  request: NextRequest,
  pathname: string,
  roleClass: RoleClass | null,
  isApiRequest: boolean,
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
  return requestHeaders;
}

function withPathHeader(
  request: NextRequest,
  pathname: string,
  roleClass: RoleClass | null,
) {
  return NextResponse.next({
    request: {
      headers: forwardedRequestHeaders(
        request,
        pathname,
        roleClass,
        pathname.startsWith("/api/"),
      ),
    },
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

/** Copies the refreshed session cookies and their cache headers onto `response`. */
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

/** Record D-19: the failure is loud, never a page rendered without its tenant. */
function rewriteLeftServerResponse(pathname: string) {
  const message =
    "Tenant address rewrite left the server: the proxy received its own " +
    `rewritten request for "${pathname}". Next treats a rewrite as external ` +
    "when the server is bound to a loopback IP address such as 127.0.0.1; " +
    "bind it to localhost (record D-19).";
  console.error(`[auth] ${message}`);
  return new NextResponse(message, {
    status: 500,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

/** `pathname` plus the request's query, as a redirect target or `next`. */
function withSearch(request: NextRequest, pathname: string) {
  return `${pathname}${request.nextUrl.search}`;
}

/**
 * `path` as a URL on the request's own origin, or null when it would resolve
 * anywhere else. Every rewrite target and every redirect the proxy builds
 * from the page address goes through this. Next.js fetches a rewrite to
 * another origin itself, with the request headers the proxy set, the session
 * cookie among them, so such a target is refused, never followed (council
 * round 1, A2). `parseTenantAddress` already refuses an inner path that
 * starts another authority (A1); this refusal stands if a parse ever lets
 * one through.
 */
function ownOriginUrl(request: NextRequest, path: string): URL | null {
  if (!path.startsWith("/")) return null;
  const url = new URL(path, request.nextUrl.origin);
  return url.origin === request.nextUrl.origin ? url : null;
}

/**
 * The answer to an address the proxy will not serve: no page, as for an API
 * route under a tenant prefix. Nothing in it comes from the address, and it
 * carries no session cookie.
 */
function refusedAddress(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

function chooserUrl(
  request: NextRequest,
  tenantId: string | null,
  next: string,
) {
  const url = new URL(CHOOSER_PATH, request.nextUrl.origin);
  if (tenantId) url.searchParams.set("tenant", tenantId);
  url.searchParams.set("next", next);
  return url;
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
  const roleClass = options.roleClass ?? null;
  const tenantAddress = options.tenantAddress === true;
  const webStudio = options.webStudio ?? null;

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

  return async function authMiddleware(request: NextRequest) {
    const addressPathname = request.nextUrl.pathname;

    if (
      tenantAddress &&
      request.headers.get(TENANT_REWRITE_HEADER) === TENANT_REWRITE_MARKER
    ) {
      return rewriteLeftServerResponse(addressPathname);
    }

    const address = tenantAddress ? parseTenantAddress(addressPathname) : null;
    // Route decisions use the pathname the page files see.
    const pathname = address ? address.innerPathname : addressPathname;

    if (allowApi && pathname.startsWith("/api/")) {
      // No API route lives inside the tenant segment (plan 5.2).
      if (address) return new NextResponse(null, { status: 404 });
      return withPathHeader(request, pathname, roleClass);
    }

    // Payload's REST routes under `/web-studio/api` (plan 5.2): the session
    // is refreshed and nothing else. Never inside the tenant segment.
    if (webStudio && isWebStudioApiPath(pathname)) {
      if (address) return new NextResponse(null, { status: 404 });
      return refreshWebStudioApiSession(request, pathname, roleClass);
    }

    const config = getSupabasePublicConfig();
    const { url, key } = config;
    const isAuthRoute = authRoutes.some((route) =>
      matchesListedRoute(pathname, route),
    );
    const isExplicitlyPublic =
      isAuthRoute || isPublicRoute(pathname, publicRoutes);

    // Sign-in, the chooser, Web Studio and the public pages stay outside the
    // tenant segment: an address that puts one inside it loses the prefix.
    if (address && (isExplicitlyPublic || isOutsideTenantSegment(pathname))) {
      const target = ownOriginUrl(request, withSearch(request, pathname));
      return target ? NextResponse.redirect(target) : refusedAddress();
    }

    // A tenant address is a signed-in page by definition.
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

      return withPathHeader(request, pathname, roleClass);
    }

    // The full address, so the layouts' sign-in redirect returns to it.
    const requestHeaders = forwardedRequestHeaders(
      request,
      addressPathname,
      roleClass,
      false,
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
      // Send an already-signed-in visitor on to the app instead of rendering a
      // sign-in form. Gate on the Supabase `user`, never on `userId`: the E2E
      // bypass populates `userId` from a cookie with no Supabase session, and
      // redirecting those would bounce the e2e suite off /login and /register.
      if (user && redirectAuthenticatedTo) {
        // Under the tenant address the target page makes the membership
        // decision; a role check here would refuse a person in two
        // organizations before they can choose one.
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

    // Web Studio's pages (plan 5.2): outside the tenant segment, the
    // organization comes from the signed Web Studio cookie, judged against
    // the person's live staff rows, in place of the role check, which would
    // refuse a person in two organizations. The chooser needs only a
    // signed-in person.
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
          })
        : ({ kind: "refuse" } as const);
      if (decision.kind === "allow") return supabaseResponse;
      if (decision.kind === "refuse" && assignments) {
        reportAccessDiagnostic("no_assignment");
      }
      return redirectWithCookies(
        decision.kind === "choose"
          ? webStudioChooserUrl(request, withSearch(request, pathname))
          : buildRedirectUrl(request, unauthorizedRedirectTo),
        supabaseResponse,
      );
    }

    // The tenant in the page address (plan 5.2): the membership decision,
    // scoped to the address's tenant, replaces the role check on every
    // signed-in page inside the tenant segment.
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
        const landing = decideLanding({ assignments, roleClass });
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
        assignments,
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
          // The rewrite target keeps the request's origin, so Next serves it
          // from this server; anything else is refused before a header is
          // set (A2), and the marker catches a same-origin rewrite that Next
          // still sends out (D-19).
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

    // Authentication is not authorization: without this, any signed-in user of
    // any app reaches every other app's protected routes, because the check
    // above only proves *someone* is signed in.
    //
    // Gated on the Supabase `user`, never on `userId`. The E2E bypass above
    // populates `userId` from a cookie with no Supabase session and has already
    // applied `isRoleAllowedForApp` to it; re-resolving that id here would look
    // up a user who does not exist, resolve `null`, and bounce the suite.
    //
    // Fails closed: an unresolved role is treated as not allowed. The chooser
    // only lists the person's own rows, so it takes no role check: it is where
    // a person in two organizations, whom the check would refuse, chooses one.
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

/**
 * The person's live rows, validated, for the membership decision: from the
 * assignments RPC on the request's own session, or from the signed cookie of
 * an E2E bypass identity. `null` when the read fails or a row is malformed:
 * the caller refuses.
 */
async function readSurfaceAssignments(
  userId: string | null,
  bypassSession: E2EAuthSession | null,
  supabase: SupabaseUserRoleReader,
): Promise<readonly ActiveAssignment[] | null> {
  if (!userId) {
    return bypassSession ? listE2EAuthAssignments(bypassSession) : null;
  }
  const read = await readActiveAssignments(
    userId,
    createRpcAssignmentReader(supabase as unknown as AssignmentRpcClient),
  );
  if (!read.ok) {
    reportAccessDiagnostic("membership_query_failed");
    return null;
  }
  return read.assignments;
}
