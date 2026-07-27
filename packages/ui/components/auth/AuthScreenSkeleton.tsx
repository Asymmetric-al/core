import { Skeleton } from "../shadcn/skeleton";

/**
 * Shared loading shell for the auth screens.
 *
 * One component so `/login` and `/register` cannot drift: they render the same
 * wrapper (`LoginScreen.tsx:169`, `RegisterScreen.tsx:116`), so their fallbacks
 * must too. The outer classes mirror that wrapper exactly — the previous
 * login-only skeleton used `min-h-[50vh] … p-6` against a real `min-h-screen …
 * bg-muted px-4 py-8`, so the page jumped and changed colour when the real
 * screen resolved.
 */
export function AuthScreenSkeleton({ label }: { label: string }) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-8"
      aria-busy="true"
      aria-label={label}
    >
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </main>
  );
}
