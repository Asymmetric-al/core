"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";

import { boneyardContributionsFixture } from "../../../(app)/contributions/data";
import {
  ContributionsMainBody,
  ContributionsPageActions,
} from "../../../(app)/contributions/main-body";

/**
 * Public capture route for Boneyard CLI (no admin shell auth).
 * Run: `bun run boneyard:admin` with dev server on :3030.
 */
export default function BoneyardContributionsCapturePage() {
  const skeletonContent = (
    <ContributionsMainBody
      data={boneyardContributionsFixture}
      isLoading={false}
      onSelectContribution={() => {}}
    />
  );

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={<ContributionsPageActions canManageContributions={false} />}
    >
      <BoneyardSkeleton
        name="admin-contributions-content"
        loading={false}
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
