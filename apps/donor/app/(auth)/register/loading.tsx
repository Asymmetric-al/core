import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Suspense boundary for the cookie read in `requireAnonymousVisitor`.
 *
 * Deliberately per-route rather than an `(auth)/layout.tsx` boundary: content
 * inside a boundary is excluded from the static shell even when it is entirely
 * static, so a group-level boundary would strip `/forgot-password` — a static
 * card with no request reads — of its shell for no reason.
 */
export default function RegisterLoading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6"
      aria-busy="true"
      role="status"
      aria-label="Loading registration"
    >
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <Skeleton className="h-64 w-full max-w-md rounded-xl" />
    </div>
  );
}
