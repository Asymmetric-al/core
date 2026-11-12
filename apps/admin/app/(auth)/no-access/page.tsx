import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import { SwitchAccountButton } from "./switch-account-button";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "No access" };

export default function NoAccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold tracking-tight">No access</h1>
          </CardTitle>
          <CardDescription>
            Your account does not have permission to view this page. Sign in
            with a different account, or go to home if this account uses Mission
            Control.
          </CardDescription>
        </CardHeader>
        {/*
         * Switching account is the primary exit: the edge proxy rejects the
         * same roles at "/", so "Go to home" only helps someone blocked from a
         * single page (such as Eve) and stays secondary.
         */}
        <CardFooter className="flex-wrap gap-2">
          <SwitchAccountButton />
          <ButtonLink variant="outline" render={<Link href="/" />}>
            Go to home
          </ButtonLink>
        </CardFooter>
      </Card>
    </main>
  );
}
