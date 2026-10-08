"use client";

import "./globals.css";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 bg-background font-sans text-foreground">
        <title>Missionary dashboard error</title>
        <main className="flex min-h-dvh items-center justify-center p-6">
          <div className="w-full max-w-110 text-center">
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">
                  Missionary Dashboard
                </p>
                <CardTitle>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Something went wrong
                  </h1>
                </CardTitle>
                <CardDescription>
                  We could not render this page. Try again, or return to your
                  dashboard if the problem continues.
                </CardDescription>
              </CardHeader>
              {error.digest ? (
                <CardContent>
                  <p className="break-all text-xs text-muted-foreground">
                    Reference: {error.digest}
                  </p>
                </CardContent>
              ) : null}
              <CardFooter className="justify-center">
                <Button type="button" onClick={() => reset()}>
                  Try again
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </body>
    </html>
  );
}
