"use client";

import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function RouteError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  const digest =
    error instanceof Error &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <Empty role="alert">
      <EmptyHeader>
        <EmptyTitle>
          <h1>This page couldn&apos;t load</h1>
        </EmptyTitle>
        <EmptyDescription>
          Try again, or return to Home. If the problem continues, contact your
          Mission Control administrator.
        </EmptyDescription>
      </EmptyHeader>
      {digest ? (
        <p className="text-xs text-muted-foreground">Reference: {digest}</p>
      ) : null}
      <EmptyContent className="flex-row flex-wrap justify-center">
        <Button onClick={retry}>Try again</Button>
        <ButtonLink variant="outline" render={<Link href="/" />}>
          Back to Home
        </ButtonLink>
      </EmptyContent>
    </Empty>
  );
}
