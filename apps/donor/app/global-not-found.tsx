import "./globals.css";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | Give Hope",
  description: "The requested Give Hope page does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="m-0 bg-background font-sans text-foreground">
        <main className="flex min-h-dvh items-center justify-center p-6">
          <section className="w-full max-w-110 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              404
            </p>
            <h1 className="mb-3 text-3xl font-semibold">Page not found</h1>
            <p className="m-0 text-sm text-muted-foreground">
              The page you are looking for does not exist or has moved.
            </p>
            <Link href="/" className={cn(buttonVariants(), "mt-6")}>
              Return home
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
