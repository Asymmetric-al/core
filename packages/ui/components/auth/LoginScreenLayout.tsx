import type { ReactNode } from "react";

/**
 * Static login page chrome rendered from the Server Component tree.
 * Keeps the full-viewport shell out of the client `LoginScreen` bundle so
 * dev SSR/client chunk skew cannot produce hydration mismatches on `<main>`.
 */
export function LoginScreenLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background via-muted to-muted" />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
