import { AuthScreenSkeleton } from "@asym/ui/components/auth/AuthScreenSkeleton";

/**
 * The public group's Suspense boundary. `register/page.tsx` awaits
 * `createClient()` + `supabase.auth.getUser()`, and
 * `forgot-password/reset/page.tsx` reads the recovery session; with
 * `cacheComponents: true` and no boundary above them, those routes cannot be
 * prerendered. `login` has its own `loading.tsx`; `forgot-password` and
 * `no-access` are fully static and never reach this fallback.
 */
export default function AuthGroupLoading() {
  return <AuthScreenSkeleton label="Loading" />;
}
