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
  title: "No access",
  description: "Your account does not have permission to view this portal.",
};

export default function NoAccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">No access</h1>
          </CardTitle>
          <CardDescription>
            Your account does not have permission to view this portal.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-wrap gap-2">
          <Link href="/" className={buttonVariants()}>
            Go to home
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Switch account
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
