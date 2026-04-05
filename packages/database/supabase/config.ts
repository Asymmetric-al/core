export interface SupabasePublicConfig {
  url: string | null;
  key: string | null;
  keyType: "publishable" | "anon" | null;
}

/**
 * Resolve public Supabase credentials with forward-compatible key support.
 *
 * Supabase recommends publishable keys (`sb_publishable_*`) for new projects,
 * while many existing environments still use legacy anon keys. This resolver
 * supports either without forcing callers to change import signatures.
 */
export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null;

  if (publishableKey) {
    return {
      url,
      key: publishableKey,
      keyType: "publishable",
    };
  }

  if (anonKey) {
    return {
      url,
      key: anonKey,
      keyType: "anon",
    };
  }

  return {
    url,
    key: null,
    keyType: null,
  };
}
