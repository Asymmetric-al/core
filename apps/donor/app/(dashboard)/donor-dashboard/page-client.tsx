"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertCircle, RefreshCw } from "lucide-react";

import { useDonorDashboardBootstrap } from "./use-donor-dashboard-bootstrap";
import { DashboardSkeleton } from "../../../features/donor/components/dashboard-ui";
import { DonorDashboardMainBody } from "../../../features/donor/components/donor-dashboard-main-body";

export default function DonorDashboardPage() {
  const bootstrap = useDonorDashboardBootstrap();

  if (bootstrap.isError) {
    const message =
      bootstrap.error instanceof Error
        ? bootstrap.error.message
        : "Could not load the dashboard.";

    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-rose-100 bg-rose-50/80 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-rose-100 bg-white">
          <AlertCircle className="size-7 text-rose-500" />
        </div>
        <h3 className="text-sm font-semibold text-rose-900">Load failed</h3>
        <p className="mt-2 max-w-sm text-xs font-medium text-rose-700/90">
          {message}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-6 h-9 rounded-lg font-bold uppercase tracking-widest text-[10px]"
          onClick={() => void bootstrap.refetch()}
        >
          <RefreshCw className="mr-2 size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const isPending = bootstrap.isPending;
  const mainBody = <DonorDashboardMainBody />;

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
