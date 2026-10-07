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
  title: "Account help",
  description:
    "Reset access to the missionary portal. Contact your administrator for access support.",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">
              Forgot password?
            </h1>
          </CardTitle>
          <CardDescription>
            Password reset is not enabled yet in this environment. Contact your
            administrator for access support.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
