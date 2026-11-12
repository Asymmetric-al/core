"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { CircleAlert, RotateCw } from "lucide-react";
import * as React from "react";

interface SettingsListStateProps {
  /** What the section holds, in plain words, such as "labels". */
  noun: string;
  isLoading: boolean;
  isError: boolean;
  /**
   * Rows already on hand. They stay visible through a background refresh,
   * even one that fails, so a retry never hides data staff can still use.
   */
  itemCount: number;
  /** Support queries don't retry on their own, so staff retry here. */
  onRetry: () => unknown;
  /** The list, or its empty state, once the rows have loaded. */
  children: React.ReactNode;
}

/**
 * Keeps a support settings section honest: placeholders while the first load
 * runs, an error with Try again when it fails, and the list or its empty
 * state only once rows have loaded. A slow or failed load never reads as
 * "nothing here yet".
 */
export function SettingsListState({
  noun,
  isLoading,
  isError,
  itemCount,
  onRetry,
  children,
}: SettingsListStateProps) {
  if (itemCount === 0 && isError) {
    return <SettingsLoadError noun={noun} onRetry={onRetry} />;
  }
  if (itemCount === 0 && isLoading) {
    return (
      <div role="status" className="flex flex-col gap-2">
        <span className="sr-only">{`Loading ${noun}…`}</span>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  return <>{children}</>;
}

/** True when a section has no rows to show because its load failed or runs. */
export function isSettingsListPending(state: {
  isLoading: boolean;
  isError: boolean;
  itemCount: number;
}): boolean {
  return state.itemCount === 0 && (state.isLoading || state.isError);
}

/**
 * A panel header's create button. An empty list offers create from its empty
 * state instead, so the header shows it beside rows, or disabled while the
 * first load is pending.
 */
export function settingsHeaderAction(
  state: { isLoading: boolean; isError: boolean; itemCount: number },
  action: React.ReactNode,
): React.ReactNode {
  return state.itemCount > 0 || isSettingsListPending(state) ? action : null;
}

function SettingsLoadError({
  noun,
  onRetry,
}: {
  noun: string;
  onRetry: () => unknown;
}) {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden="true" />
      <AlertTitle>{`Couldn’t load ${noun}`}</AlertTitle>
      <AlertDescription>
        <p>Check your connection, then try again.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRetrying}
          focusableWhenDisabled
          onClick={() => void retry()}
        >
          <RotateCw data-icon="inline-start" aria-hidden="true" />
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
