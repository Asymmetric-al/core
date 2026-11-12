"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { FlaskConical } from "lucide-react";

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
      {/* Excluded from the skeleton snapshot; says plainly these are fixtures. */}
      <Alert role="note" variant="info" className="mb-6" data-no-skeleton>
        <FlaskConical aria-hidden="true" />
        <AlertTitle>Fixture data for skeleton capture</AlertTitle>
        <AlertDescription>
          This page renders sample contributions so loading skeletons can be
          captured. None of these gifts are real.
        </AlertDescription>
      </Alert>
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
