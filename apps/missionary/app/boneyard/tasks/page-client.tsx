"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";

import { MissionaryTasksListBoneyardFixture } from "../../tasks/boneyard-fixture";

/**
 * Public capture route for Boneyard CLI (no missionary shell auth).
 * Run: `bun run boneyard:missionary` with dev server on :4000.
 */
export default function BoneyardTasksCapturePage() {
  const skeletonContent = <MissionaryTasksListBoneyardFixture />;

  return (
    <PageShell
      title="Mission Tasks"
      description="Manage follow-ups, calls, and partner communications."
      badge="Personal Workflow"
      actions={null}
    >
      <BoneyardSkeleton
        name="missionary-tasks-list"
        loading={true}
        fixture={skeletonContent}
        snapshotConfig={{
          excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
          excludeTags: ["footer"],
        }}
      >
        {skeletonContent}
      </BoneyardSkeleton>
    </PageShell>
  );
}
