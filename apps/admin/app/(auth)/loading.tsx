import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * The public group's Suspense boundary. `register/page.tsx` awaits
 * `createClient()` + `supabase.auth.getUser()`; with `cacheComponents: true`
 * and no boundary above it, the route cannot be prerendered. `login` has its
 * own `loading.tsx`; `forgot-password` and `no-access` are fully static and
 * never reach this fallback.
 */
export default function AuthGroupLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-64 w-full max-w-md rounded-xl" />
    </div>
  );
}
