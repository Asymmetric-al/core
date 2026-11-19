import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * The public group's Suspense boundary. `register/page.tsx` awaits
 * `createClient()` + `supabase.auth.getUser()`; with `cacheComponents: true`
 * and no boundary above it, that route cannot be prerendered. `login` and
 * `forgot-password/reset` have their own `loading.tsx`; `forgot-password` and
 * `no-access` are fully static and never reach this fallback.
 */
export default function AuthGroupLoading() {
  return <AuthScreenSkeleton label="Loading" />;
}
