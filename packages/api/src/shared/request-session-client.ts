import { getSupabasePublicConfig } from "@asym/database/supabase/config";
import { createClient } from "@asym/database/supabase/server";
import { createServerClient } from "@supabase/ssr";

export type RequestSessionClient = Awaited<ReturnType<typeof createClient>>;

function getBearerToken(request: Request): string | null {
  const authorizationHeader = request.headers.get("authorization")?.trim();
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, ...tokenParts] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer") {
    return null;
  }

  const token = tokenParts.join(" ").trim();
  return token || null;
}

/**
 * The name `@supabase/ssr` gives the session cookie, `sb-<project>-auth-token`,
 * or one chunk of it (`.0`, `.1`, ...). The PKCE `-code-verifier` cookie is not
 * a session.
 */
const SUPABASE_SESSION_COOKIE = /^sb-[^=\s;]+-auth-token(?:\.\d+)?$/;

/**
 * Whether the request carries a Supabase session the request's own client
 * could act as: a bearer token, or the session cookie. A request without one
 * (the test-only E2E bypass identity is one) would reach PostgREST as `anon`.
 */
export function requestCarriesSupabaseSession(request: Request): boolean {
  if (getBearerToken(request)) {
    return true;
  }
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .some((pair) =>
      SUPABASE_SESSION_COOKIE.test(pair.split("=", 1)[0]?.trim() ?? ""),
    );
}

/**
 * Supabase client that acts as the request's own session (anon key plus the
 * caller's JWT), so RPCs see `auth.uid()`. Resolves the session the same way
 * `getAuthContext` does: an `Authorization: Bearer` header first, otherwise
 * the request cookies.
 */
export async function createRequestSessionClient(
  request: Request,
): Promise<RequestSessionClient> {
  const bearerToken = getBearerToken(request);
  if (!bearerToken) {
    return createClient();
  }

  const { url, key } = getSupabasePublicConfig();
  if (!url || !key) {
    throw new Error(
      "Supabase client misconfigured: set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return [];
      },
      // A bearer request has no cookie session to refresh.
      setAll() {},
    },
    global: {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  });
}
