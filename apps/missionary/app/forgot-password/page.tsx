import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account help",
  description:
    "Reset access to the missionary portal. Contact your administrator for access support.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password reset is not enabled yet in this environment. Contact your
          administrator for access support.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex text-sm font-medium text-foreground hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
