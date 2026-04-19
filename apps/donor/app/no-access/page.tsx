import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No access",
  description: "Your account does not have permission to view this page.",
};

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">No access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have permission to view this page.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/donor-dashboard"
            className="text-sm font-medium hover:underline"
          >
            Go to donor home
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:underline"
          >
            Switch account
          </Link>
        </div>
      </div>
    </main>
  );
}
