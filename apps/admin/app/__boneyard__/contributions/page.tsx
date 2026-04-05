"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";

import { mockContributions } from "../../contributions/data";
import {
  ContributionsMainBody,
  ContributionsPageActions,
} from "../../contributions/main-body";

/**
 * Public capture route for Boneyard CLI (no admin shell auth).
 * Run: `bun run boneyard:admin` with dev server on :3030.
 */
export default function BoneyardContributionsCapturePage() {
  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={<ContributionsPageActions />}
    >
      <BoneyardSkeleton
        name="admin-contributions-content"
        loading={true}
        fixture={
          <ContributionsMainBody
            data={mockContributions}
            isLoading={false}
            onSelectContribution={() => {}}
          />
        }
        snapshotConfig={{
          excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
          excludeTags: ["footer"],
        }}
      >
        <div />
      </BoneyardSkeleton>
    </PageShell>
  );
}
