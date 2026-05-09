"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";

import { DashboardSkeleton } from "../../../features/donor/components/dashboard-ui";
import { DonorDashboardMainBody } from "../../../features/donor/components/donor-dashboard-main-body";

/**
 * Public capture route for Boneyard CLI (no donor-dashboard auth shell).
 * Run: `bun run boneyard:donor` with dev server on :3000.
 */
export default function BoneyardDonorDashboardCapturePage() {
  const fixture = <DonorDashboardMainBody />;

  return (
    <div className="container-responsive pt-4">
      <h1 className="sr-only">Donor dashboard</h1>
      <BoneyardSkeleton
        name="donor-dashboard-main"
        loading={true}
        fallback={<DashboardSkeleton />}
        fixture={fixture}
        snapshotConfig={{
          excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
          excludeTags: ["footer"],
        }}
      >
        {fixture}
      </BoneyardSkeleton>
    </div>
  );
}
