import { Skeleton } from "../shadcn/skeleton";

/**
 * Shared loading shell for the auth screens.
 *
 * One component so `/login` and `/register` cannot drift: they render the same
 * wrapper (`AuthShell` in `auth-primitives.tsx`), so their fallbacks must too.
 * The outer classes mirror that wrapper exactly, so the page neither jumps
 * nor changes colour when the real screen resolves.
 */
export function AuthScreenSkeleton({ label }: { label: string }) {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8"
      aria-busy="true"
    >
      {/*
       * `role="status"` sits on the inner wrapper, not on `<main>`: an explicit
       * role would override the `main` landmark, and the real screens render
       * `<main>` too, so the landmark must not appear only after the swap.
       */}
      <div
        className="flex w-full max-w-md flex-col items-center gap-6"
        role="status"
        aria-label={label}
      >
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </main>
  );
}
