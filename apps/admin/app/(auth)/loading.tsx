import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * The public group's Suspense boundary. `register/page.tsx` awaits
 * `createClient()` + `supabase.auth.getUser()`; with `cacheComponents: true`
 * and no boundary above it, the route cannot be prerendered. `login` has its
 * own `loading.tsx`; `forgot-password` and `no-access` are fully static and
 * never reach this fallback.
 */
export default function AuthGroupLoading() {
  return <AuthScreenSkeleton label="Loading" />;
}
