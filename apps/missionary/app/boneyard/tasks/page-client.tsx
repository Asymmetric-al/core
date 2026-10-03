"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Suspense } from "react";

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
      {/*
       * Stream: the fixture rows render `TaskRow`, which pulls in `motion`
       * (non-deterministic ids) and date-fns relative-date helpers that read the
       * current date. Neither can be baked into a prerender, so the rows are
       * deferred while the page frame above stays static. The header is what
       * Boneyard captures anyway.
       */}
      <Suspense
        fallback={
          <div role="status" aria-atomic="true" className="grid gap-3">
            <span className="sr-only">Loading task preview</span>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        }
      >
        <BoneyardSkeleton
          name="missionary-tasks-list"
          loading={false}
          fixture={skeletonContent}
          snapshotConfig={{
            excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
            excludeTags: ["footer"],
          }}
        >
          {skeletonContent}
        </BoneyardSkeleton>
      </Suspense>
    </PageShell>
  );
}
