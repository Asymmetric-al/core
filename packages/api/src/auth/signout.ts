import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

type PendingCookie = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
  };
};

function normalizeCookieOptions(options?: PendingCookie["options"]) {
  if (!options) return undefined;
  const { sameSite, ...rest } = options;
  if (typeof sameSite === "boolean") {
    return rest;
  }
  return sameSite ? { ...rest, sameSite } : rest;
}

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return { name: pair, value: "" };
      return {
        name: pair.slice(0, idx),
        value: decodeURIComponent(pair.slice(idx + 1)),
      };
    });
}

function createAuthClient(request: Request) {
  const pendingCookies: PendingCookie[] = [];
  const { url, key } = getSupabasePublicConfig();

  if (!url || !key) {
    return { supabase: null, pendingCookies };
  }

  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return requestCookies;
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: PendingCookie["options"];
        }[],
      ) {
        cookiesToSet.forEach((cookie) => {
          pendingCookies.push({
            name: cookie.name,
            value: cookie.value,
            options: cookie.options,
          });
        });
      },
    },
  });

  return { supabase, pendingCookies };
}

function parseOrigin(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isAllowedSignoutRequest(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const originHeader = parseOrigin(request.headers.get("origin"));
  if (originHeader) {
    return originHeader === requestOrigin;
  }

  const refererHeader = parseOrigin(request.headers.get("referer"));
  if (refererHeader) {
    return refererHeader === requestOrigin;
  }

  // Reject requests that do not provide any origin context.
  return false;
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/**
 * Signs the user out server-side so Supabase auth cookies are cleared.
 */
export async function POST(request: Request) {
  if (!isAllowedSignoutRequest(request)) {
    return noStoreJson(
      { ok: false, error: "Invalid sign-out request origin." },
      { status: 403 },
    );
  }

  const { supabase, pendingCookies } = createAuthClient(request);
  if (!supabase) {
    return noStoreJson(
      { ok: false, error: "Supabase auth is not configured." },
      { status: 503 },
    );
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return noStoreJson(
      { ok: false, error: "Unable to sign out." },
      { status: 500 },
    );
  }

  const response = noStoreJson({ ok: true });
  pendingCookies.forEach((cookie) => {
    response.cookies.set(
      cookie.name,
      cookie.value,
      normalizeCookieOptions(cookie.options),
    );
  });
  return response;
}
