"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import * as React from "react";

import { useSupportFailureRecovery } from "../hooks/use-support-failure-recovery";

/**
 * Inline failure banner rendered above the inbox body whenever a support
 * mutation fails. The banner offers a one-click retry that calls the
 * `retry` callback bundled into the failure record. Phase 7 surfaces this
 * for the send-reply / save-draft / add-note / assign / status / label /
 * snooze / run-macro mutations; sonner toasts remain in place as the
 * lightweight notification surface.
 */
export function SupportFailureBanner() {
  const { failure, clear } = useSupportFailureRecovery();
  const [retrying, setRetrying] = React.useState(false);

  if (!failure) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await failure.retry();
      clear();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-warning shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {labelForKind(failure.kind)} failed
          </p>
          <p className="mt-0.5 text-xs">{failure.message}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleRetry()}
          disabled={retrying}
          focusableWhenDisabled={retrying}
          className="rounded-lg font-bold uppercase tracking-wider text-warning hover:bg-warning/15"
        >
          <RefreshCw
            className={retrying ? "size-3.5 animate-spin" : "size-3.5"}
          />
          Retry
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clear}
          aria-label="Dismiss failure"
          className="size-8 text-warning hover:bg-warning/15"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
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
