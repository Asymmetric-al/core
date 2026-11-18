"use client";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import * as React from "react";
export function ReportLoadError({
  onRetry,
  isRetrying = false,
  failedRetries = 0,
}: {
  onRetry: () => void;
  isRetrying?: boolean;
  failedRetries?: number;
}) {
  const retryRef = React.useRef<HTMLButtonElement>(null);
  const shownFailures = React.useRef(failedRetries);
  React.useLayoutEffect(() => {
    if (shownFailures.current === failedRetries) return;
    shownFailures.current = failedRetries;
    // The remounted alert took Try again with it; focus moved elsewhere stays.
    if (document.activeElement === document.body) retryRef.current?.focus();
  }, [failedRetries]);
  return (
    // A new key per failed retry remounts the alert, so it is announced again.
    <Alert key={failedRetries} variant="destructive">
      <AlertTitle>Couldn’t load this report</AlertTitle>
      <AlertDescription>
        The figures are unavailable. Try again to load the latest data.
        <Button
          ref={retryRef}
          type="button"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          focusableWhenDisabled
        >
          {isRetrying ? "Trying again…" : "Try again"}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
