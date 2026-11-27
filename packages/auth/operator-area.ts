import { isServeUnderPathsEnabled } from "@asym/database/app-base-path";
import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import {
  normalizeHostText,
  parseOperationsNames,
} from "@asym/env/operations-names";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  frontNotFound,
  frontRefusal,
} from "./front";
import { admitApiMutation } from "./mutation-admission";
import { PAGE_SCOPE_HEADERS } from "./request-headers";
import {
  parseSubRoleAddress,
  parseTenantAddress,
  subRoleStartsAnotherAuthority,
} from "./tenant-address";

export const OPERATOR_AREA_ROOT = "/operator";

const SIGN_IN_PATH = "/login";
const CALLBACK_PATH = "/auth/callback";
const SIGN_OUT_PATH = "/api/auth/signout";
const CORE_SIGN_IN_PATH = "/api/auth/sign-in";
const CORE_SESSION_PATH = "/api/auth/session";

const ASYM_HEADER_PREFIX = "x-asym-";
const AREA_CACHE_CONTROL = "private, no-store, no-transform, max-age=0";

interface HeaderReader {
  get(name: string): string | null;
}

interface RefreshedCookie {
  name: string;
  value: string;
  options?: Record<string, unknown>;
}

interface Refresh {
  cookies: RefreshedCookie[];
  headers: Headers;
}

const loggedProblems = new Set<string>();

export function resetOperatorAreaLogForTests(): void {
  loggedProblems.clear();
}

function logOnce(problem: string, message: string): void {
  if (loggedProblems.has(problem)) return;
  loggedProblems.add(problem);
  console.error(message);
}

function isAreaForm(pathname: string): boolean {
  return (
    pathname === OPERATOR_AREA_ROOT ||
    pathname.startsWith(`${OPERATOR_AREA_ROOT}/`)
  );
}

function decodeAsciiEscapes(pathname: string): string {
  return pathname.replace(/%([0-7][0-9A-Fa-f])/g, (_escape, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
}

export function isOperatorAreaPath(pathname: string): boolean {
  if (isAreaForm(pathname)) return true;
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = decodeAsciiEscapes(pathname);
  }
  return isAreaForm(decoded);
}

export function operationsNamesFromEnv(
  env: Record<string, string | undefined>,
): string[] {
  const { names, problem } = parseOperationsNames(env.OPERATIONS_NAMES);
  if (problem) logOnce(problem, `[operator] OPERATIONS_NAMES is ${problem}`);
  return names;
}

export function isOperationsAddress(
  headers: HeaderReader,
  names: readonly string[],
): boolean {
  if (names.length === 0) return false;
  if (
    headers.get(FRONT_STAMP_HEADER) !== null ||
    headers.get(FRONT_ORIGIN_HEADER) !== null
  ) {
    return false;
  }
  const host = headers.get("host");
  if (host === null) return false;
  const normalized = normalizeHostText(host);
  if (!names.includes(normalized)) return false;
  const forwarded = headers.get("x-forwarded-host");
  return forwarded === null || normalizeHostText(forwarded) === normalized;
}

export function isOperationsSignIn(
  headers: HeaderReader,
  env: Record<string, string | undefined>,
): boolean {
  if (!isServeUnderPathsEnabled()) return false;
  if (PAGE_SCOPE_HEADERS.some((name) => headers.get(name) !== null)) {
    return false;
  }
  return isOperationsAddress(headers, operationsNamesFromEnv(env));
}

function unavailable(): NextResponse {
  return new NextResponse(null, {
    status: 503,
    headers: { "cache-control": "no-store" },
  });
}

function withRefresh<T extends NextResponse>(response: T, refresh: Refresh): T {
  for (const { name, value, options } of refresh.cookies) {
    response.cookies.set(name, value, options);
  }
  refresh.headers.forEach((value, name) => {
    response.headers.set(name, value);
  });
  return response;
}

function signInRedirect(request: NextRequest, refresh: Refresh): NextResponse {
  const target = new URL(
    `${request.nextUrl.basePath}/login`,
    request.nextUrl.origin,
  );
  target.searchParams.set("next", OPERATOR_AREA_ROOT);
  const response = withRefresh(NextResponse.redirect(target, 307), refresh);
  response.headers.set("Cache-Control", AREA_CACHE_CONTROL);
  return response;
}

function withoutAsymHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith(ASYM_HEADER_PREFIX)) headers.delete(name);
  }
  const cookie = request.headers.get("cookie");
  if (cookie === null) headers.delete("cookie");
  else headers.set("cookie", cookie);
  return headers;
}

function emptyRefresh(): Refresh {
  return { cookies: [], headers: new Headers() };
}

function sessionClient(request: NextRequest, refresh: Refresh) {
  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    logOnce(
      "config",
      "[operator] Supabase auth config is missing; the operator area answers 503.",
    );
    return null;
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: RefreshedCookie[],
        cacheHeaders: Record<string, string> = {},
      ) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
          refresh.cookies.push(cookie);
        }
        for (const [name, value] of Object.entries(cacheHeaders)) {
          refresh.headers.set(name, value);
        }
      },
    },
  });
}

function admitted(request: NextRequest, refresh: Refresh): NextResponse {
  const response = withRefresh(
    NextResponse.next({ request: { headers: withoutAsymHeaders(request) } }),
    refresh,
  );
  response.headers.set("Cache-Control", AREA_CACHE_CONTROL);
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function admitOperatorArea(
  request: NextRequest,
  env: Record<string, string | undefined>,
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  const address = parseTenantAddress(pathname);
  if (address) {
    return isOperatorAreaPath(address.innerPathname) ? frontNotFound() : null;
  }
  if (isServeUnderPathsEnabled() && subRoleStartsAnotherAuthority(pathname)) {
    return frontNotFound();
  }
  const named = isServeUnderPathsEnabled()
    ? parseSubRoleAddress(pathname)
    : null;
  if (named && isOperatorAreaPath(named.innerPathname)) return frontNotFound();
  if (!isOperatorAreaPath(pathname)) return null;
  if (
    request.headers.has(FRONT_STAMP_HEADER) ||
    request.headers.has(FRONT_ORIGIN_HEADER)
  ) {
    return frontNotFound();
  }
  if (!isOperationsAddress(request.headers, operationsNamesFromEnv(env))) {
    return isServeUnderPathsEnabled() ? frontRefusal() : frontNotFound();
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return frontNotFound();
  }

  const refresh = emptyRefresh();
  try {
    const supabase = sessionClient(request, refresh);
    if (!supabase) return unavailable();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return signInRedirect(request, refresh);
    const { data, error } = await supabase.rpc("caller_is_platform_operator");
    if (error || typeof data !== "boolean") {
      console.error(
        `[operator] the operator list read failed (${error?.code ?? "not a boolean"}).`,
      );
      return withRefresh(unavailable(), refresh);
    }
    if (!data) return withRefresh(frontNotFound(), refresh);
    return admitted(request, refresh);
  } catch {
    console.error("[operator] the operator area's session read failed.");
    return withRefresh(unavailable(), refresh);
  }
}

async function signInPage(request: NextRequest): Promise<NextResponse> {
  const refresh = emptyRefresh();
  try {
    const supabase = sessionClient(request, refresh);
    if (!supabase) return unavailable();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const target = new URL(
        `${request.nextUrl.basePath}${OPERATOR_AREA_ROOT}`,
        request.nextUrl.origin,
      );
      const response = withRefresh(NextResponse.redirect(target, 307), refresh);
      response.headers.set("Cache-Control", AREA_CACHE_CONTROL);
      return response;
    }
    return withRefresh(
      NextResponse.next({ request: { headers: withoutAsymHeaders(request) } }),
      refresh,
    );
  } catch {
    console.error("[operator] the operations sign-in's session read failed.");
    return withRefresh(unavailable(), refresh);
  }
}

export async function admitOperationsSignIn(
  request: NextRequest,
  env: Record<string, string | undefined>,
): Promise<NextResponse | null> {
  if (!isServeUnderPathsEnabled()) return null;
  const pathname = request.nextUrl.pathname;
  const reads = request.method === "GET" || request.method === "HEAD";
  const step =
    pathname === SIGN_IN_PATH && reads
      ? "sign-in"
      : pathname === CALLBACK_PATH && reads
        ? "callback"
        : pathname === SIGN_OUT_PATH && request.method === "POST"
          ? "sign-out"
          : pathname === CORE_SIGN_IN_PATH && request.method === "POST"
            ? "core-sign-in"
            : pathname === CORE_SESSION_PATH && reads
              ? "session"
              : null;
  if (step === null) return null;
  if (!isOperationsAddress(request.headers, operationsNamesFromEnv(env))) {
    return null;
  }
  if (step === "sign-in") return signInPage(request);
  if (step === "sign-out" || step === "core-sign-in") {
    const refusal = await admitApiMutation(request, pathname);
    if (refusal) return refusal;
  }
  return NextResponse.next({
    request: { headers: withoutAsymHeaders(request) },
  });
}
