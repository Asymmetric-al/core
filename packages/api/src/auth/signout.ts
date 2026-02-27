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

/**
 * Signs the user out server-side so Supabase auth cookies are cleared.
 */
export async function POST(request: Request) {
  const { supabase, pendingCookies } = createAuthClient(request);
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase auth is not configured." },
      { status: 503 },
    );
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to sign out." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  pendingCookies.forEach((cookie) => {
    response.cookies.set(
      cookie.name,
      cookie.value,
      normalizeCookieOptions(cookie.options),
    );
  });
  return response;
}
