"use client";

import "./globals.css";

import { Button } from "@asym/ui/components/shadcn/button";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 bg-background font-sans text-foreground">
        <title>Admin error</title>
        <main className="flex min-h-dvh items-center justify-center p-6">
          <section className="w-full max-w-110 rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Mission Control
            </p>
            <h1 className="mb-3 text-3xl font-semibold">
              Something went wrong
            </h1>
            <p className="m-0 text-sm text-muted-foreground">
              The admin app could not render this page. Try again, or return to
              the dashboard if the problem continues.
            </p>
            {error.digest ? (
              <p className="mt-5 text-xs text-muted-foreground">
                Reference: {error.digest}
              </p>
            ) : null}
            <Button type="button" onClick={() => reset()} className="mt-6">
              Try again
            </Button>
          </section>
        </main>
      </body>
    </html>
  );
}
