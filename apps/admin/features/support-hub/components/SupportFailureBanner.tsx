"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import * as React from "react";

import { useSupportFailureRecovery } from "../hooks/use-support-failure-recovery";

/**
 * Inline failure banner above the inbox body for the last failure reported
 * through `useSupportFailureRecovery`, with a retry that calls the record's
 * `retry`. Only the composer reports today (send reply, save draft, add
 * note); the other `SupportFailureKind` values have no reporter, so those
 * failures show only as toasts.
 */
export function SupportFailureBanner({
  returnFocus,
}: {
  returnFocus?: () => void;
} = {}) {
  const { failure, clear } = useSupportFailureRecovery();
  const [retrying, setRetrying] = React.useState(false);
  const bannerRef = React.useRef<HTMLDivElement | null>(null);

  if (!failure) return null;

  // Hand focus on before the banner unmounts, or it drops to the page body.
  // Focus the agent moved elsewhere during a retry stays where it is.
  const close = () => {
    const active = document.activeElement;
    if (
      !active ||
      active === document.body ||
      bannerRef.current?.contains(active)
    ) {
      returnFocus?.();
    }
    clear();
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await failure.retry();
      close();
    } catch {
      return;
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Alert ref={bannerRef} variant="warning" role="status" aria-live="polite">
      <AlertTriangle aria-hidden="true" />
      <AlertTitle>{labelForKind(failure.kind)} failed</AlertTitle>
      <AlertDescription>
        <p>{failure.message}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void handleRetry()}
            disabled={retrying}
            focusableWhenDisabled={retrying}
          >
            <RefreshCw
              className={retrying ? "size-3.5 animate-spin" : "size-3.5"}
            />
            Retry
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={close}
            disabled={retrying}
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function labelForKind(kind: string): string {
  switch (kind) {
    case "send-reply":
      return "Reply";
    case "save-draft":
      return "Draft save";
    case "add-note":
      return "Internal note";
    case "assign":
      return "Assignment";
    case "set-status":
      return "Status change";
    case "toggle-label":
      return "Label change";
    case "snooze":
      return "Snooze";
    case "run-macro":
      return "Macro";
    default:
      return "Action";
  }
}
