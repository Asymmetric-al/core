"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";

import { useDonorDashboardBootstrap } from "./use-donor-dashboard-bootstrap";

import {
  DashboardSkeleton,
  DonorDashboardMainBody,
} from "@/features/donor/components";

export default function DonorDashboardPage() {
  const bootstrap = useDonorDashboardBootstrap();

  if (bootstrap.isError) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50/80 p-6 text-center">
        <p className="text-sm font-medium text-rose-800">
          {bootstrap.error instanceof Error
            ? bootstrap.error.message
            : "Could not load the dashboard."}
        </p>
        <button
          type="button"
          className="mt-4 text-xs font-bold uppercase tracking-widest text-rose-700 underline"
          onClick={() => void bootstrap.refetch()}
        >
          Retry
        </button>
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
