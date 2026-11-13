import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Can’t sign in?",
  description:
    "Your organization’s administrator manages missionary accounts and can help you sign in.",
};

// Email password reset isn't built yet, and there is no support inbox, so
// this page names the person who can actually restore access.
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">
              Can’t sign in?
            </h1>
          </CardTitle>
          <CardDescription>
            Resetting your password by email isn’t available yet. Your
            organization’s administrator manages missionary accounts and can
            help you get back in.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
