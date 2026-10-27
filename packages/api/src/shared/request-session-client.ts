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
