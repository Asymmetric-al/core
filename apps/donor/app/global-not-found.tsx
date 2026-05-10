import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | Give Hope",
  description: "The requested Give Hope page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="m-0 bg-zinc-50 font-sans text-zinc-900">
        <main className="flex min-h-screen items-center justify-center p-6">
          <section className="w-full max-w-[440px] rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">
              404
            </p>
            <h1 className="mb-3 text-[28px] font-semibold">Page not found</h1>
            <p className="m-0 text-sm text-zinc-600">
              The page you are looking for does not exist or has moved.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-[10px] bg-zinc-900 px-[18px] py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white no-underline"
            >
              Return home
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
