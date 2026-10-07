import { buttonVariants } from "@asym/ui/components/shadcn/button";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No access",
  description: "Your account does not have permission to view this page.",
};

export default function NoAccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have permission to view this page.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/donor-dashboard" className={buttonVariants()}>
            Go to donor home
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Switch account
          </Link>
        </div>
      </div>
    </main>
  );
}
