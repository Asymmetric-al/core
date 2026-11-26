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
import { parseTenantAddress } from "./tenant-address";

export const OPERATOR_AREA_ROOT = "/operator";

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

function admitted(request: NextRequest, refresh: Refresh): NextResponse {
  const headers = new Headers(request.headers);
  for (const name of [...headers.keys()]) {
    if (name.toLowerCase().startsWith(ASYM_HEADER_PREFIX)) headers.delete(name);
  }
  const cookie = request.headers.get("cookie");
  if (cookie === null) headers.delete("cookie");
  else headers.set("cookie", cookie);
  const response = withRefresh(
    NextResponse.next({ request: { headers } }),
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

  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    logOnce(
      "config",
      "[operator] Supabase auth config is missing; the operator area answers 503.",
    );
    return unavailable();
  }

  const refresh: Refresh = { cookies: [], headers: new Headers() };
  try {
    const supabase = createServerClient(url, key, {
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
