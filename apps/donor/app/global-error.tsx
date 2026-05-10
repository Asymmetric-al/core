"use client";

import "./globals.css";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 bg-zinc-50 font-sans text-zinc-900">
        <title>Give Hope error</title>
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="w-full max-w-[440px] rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
              Give Hope
            </p>
            <h1 className="mb-3 text-[28px] font-semibold">
              Something went wrong
            </h1>
            <p className="m-0 text-sm text-zinc-600">
              We could not load this page. Try again, or return home if the
              problem continues.
            </p>
            {error.digest ? (
              <p className="mt-5 text-xs text-zinc-500">
                Reference: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 cursor-pointer rounded-[10px] border-0 bg-zinc-900 px-[18px] py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
