import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password reset is not enabled yet in this environment. Contact support
          if you need to recover your account.
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
