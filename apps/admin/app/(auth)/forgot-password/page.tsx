import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1>Forgot password?</h1>
          </CardTitle>
          <CardDescription>
            Password reset is not available here yet. Ask a Mission Control
            administrator to reset your access.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <ButtonLink variant="outline" render={<Link href="/login" />}>
            Back to sign in
          </ButtonLink>
        </CardFooter>
      </Card>
    </main>
  );
}
