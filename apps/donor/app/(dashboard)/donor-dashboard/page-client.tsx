"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { Button } from "@asym/ui/components/shadcn/button";
import { pageHeading, useLoadRetry } from "@asym/ui/hooks";
import { AlertCircle, RefreshCw } from "lucide-react";

import { useDonorDashboardBootstrap } from "./use-donor-dashboard-bootstrap";
import { DashboardSkeleton } from "../../../features/donor/components/dashboard-ui";
import { DonorDashboardMainBody } from "../../../features/donor/components/donor-dashboard-main-body";

const mainBody = <DonorDashboardMainBody />;

export default function DonorDashboardPage() {
  const bootstrap = useDonorDashboardBootstrap();
  // With nothing cached, a retry clears the error and is pending while it
  // runs; the view keeps saying what went wrong until the retry answers.
  // However the dashboard recovers, focus on the error view moves to its
  // heading, once the dashboard has one.
  const { failureView, ...retry } = useLoadRetry({
    error: bootstrap.error,
    loading: bootstrap.isPending,
    onRetry: bootstrap.refetch,
    landing: pageHeading,
  });

  if (retry.error) {
    const message =
      retry.error instanceof Error
        ? retry.error.message
        : "Could not load the dashboard.";

    return (
      <div
        ref={failureView}
        className="flex flex-col items-center justify-center rounded-xl border border-destructive/10 bg-destructive/10 py-16 text-center"
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-destructive/10 bg-card">
          <AlertCircle className="size-7 text-destructive" />
        </div>
        <div
          key={retry.failedRetries}
          role="alert"
          className="flex flex-col items-center"
        >
          <h3 className="text-sm font-semibold text-destructive">
            Load failed
          </h3>
          <p className="mt-2 max-w-sm text-xs font-medium text-destructive/90">
            {message}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-6"
          disabled={retry.retrying}
          focusableWhenDisabled
          onClick={retry.retry}
        >
          <RefreshCw className="mr-2 size-3.5" data-icon="inline-start" />
          {retry.retrying ? "Trying again…" : "Try again"}
        </Button>
      </div>
    );
  }

  const isPending = bootstrap.isPending;

  return (
    <BoneyardSkeleton
      name="donor-dashboard-main"
      loading={isPending}
      transition={300}
      fallback={<DashboardSkeleton />}
      fixture={mainBody}
      snapshotConfig={{
        excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
        excludeTags: ["footer"],
      }}
    >
      {mainBody}
    </BoneyardSkeleton>
  );
}
