import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Can’t sign in?",
  description: "What to try when you can’t sign in to the donor portal.",
};

// Email password reset isn't built yet and the site has no support inbox,
// so this page lists what a donor can actually do.
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
            Resetting your password by email isn’t available on this site yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Check that you’re using the email address your gift receipts go
              to.
            </li>
            <li>
              If you still can’t sign in, contact the organization you give to
              for help with your account.
            </li>
          </ul>
        </CardContent>
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
