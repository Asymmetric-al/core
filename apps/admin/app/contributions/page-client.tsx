"use client";

import { useContributionNeedsAttention } from "@asym/database/hooks";
import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { ContributionDetailOverlay } from "./contribution-detail-overlay";
import { boneyardContributionsFixture, mockContributions } from "./data";
import { ContributionsMainBody, ContributionsPageActions } from "./main-body";
import { useAdminContributions } from "./use-admin-contributions";

/**
 * Re-exported so existing consumers (tests, sibling surfaces) keep one import
 * path for the shared freshness helper that lives with the overlay.
 */
export { invalidateContributionOperationQueries } from "./contribution-detail-overlay";

/** When `"1"`, table data comes from `mockContributions` (local dev only). */
const USE_MOCK_CONTRIBUTIONS_UI =
  process.env.NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK === "1";

export default function ContributionsPage() {
  const contributionsQuery = useAdminContributions();
  const needsAttentionQuery = useContributionNeedsAttention();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const giftParam = searchParams.get("gift");
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    () => giftParam,
  );
  const [showFreshness, setShowFreshness] = useState(false);
  const freshnessTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedDonationId(giftParam);
  }, [giftParam]);

  useEffect(() => {
    return () => {
      if (freshnessTimerRef.current !== null) {
        window.clearTimeout(freshnessTimerRef.current);
      }
    };
  }, []);

  /** Quiet, low-noise freshness indicator after row data refreshes (ADR-CD-022). */
  const markFreshness = useCallback(() => {
    setShowFreshness(true);
    if (freshnessTimerRef.current !== null) {
      window.clearTimeout(freshnessTimerRef.current);
    }
    freshnessTimerRef.current = window.setTimeout(() => {
      setShowFreshness(false);
    }, 8000);
  }, []);

  const openerElementRef = useRef<HTMLElement | null>(null);

  const openGift = useCallback(
    (donationId: string) => {
      // Smart close (ADR-CD-023): remember the opener so closing the detail
      // overlay can restore focus to it.
      openerElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setSelectedDonationId(donationId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("gift", donationId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeGift = useCallback(() => {
    setSelectedDonationId(null);
    // Smart close removes only the gift selection from route state; filters,
    // search, and the rest of the workspace stay untouched (ADR-CD-023).
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // Restore focus after the sheet unmounts so its focus-trap cleanup
    // cannot clobber the opener focus (ADR-CD-023 focus return).
    const opener = openerElementRef.current;
    openerElementRef.current = null;
    window.setTimeout(() => opener?.focus(), 0);
  }, [pathname, router, searchParams]);

  const isError = contributionsQuery.isError;
  const isPagePending = contributionsQuery.isPending;
  const contributionRows = isError
    ? []
    : USE_MOCK_CONTRIBUTIONS_UI
      ? mockContributions
      : (contributionsQuery.data ?? []);
  const needsAttentionGroups = isError
    ? []
    : (needsAttentionQuery.data?.groups ?? []);

  const errorMessage =
    contributionsQuery.error instanceof Error
      ? contributionsQuery.error.message
      : contributionsQuery.error != null
        ? String(contributionsQuery.error)
        : "Could not load contributions.";

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      density="compact"
      actions={<ContributionsPageActions />}
    >
      <div data-testid="mc-contributions-live">
        {showFreshness && (
          <p
            role="status"
            className="mb-2 text-xs text-muted-foreground"
            data-testid="contributions-freshness"
          >
            Updated just now
          </p>
        )}
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-100 rounded-3xl">
            <div className="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
              <AlertCircle className="size-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 uppercase tracking-tight">
              Load failed
            </h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm font-medium">
              {errorMessage}
            </p>
            <Button
              type="button"
              onClick={() => void contributionsQuery.refetch()}
              variant="outline"
              className="mt-6 h-10 px-6 rounded-xl font-semibold uppercase tracking-widest text-[10px]"
            >
              <RefreshCw className="mr-2 size-4" />
              Retry
            </Button>
          </div>
        ) : (
          <BoneyardSkeleton
            name="admin-contributions-content"
            loading={isPagePending}
            fallback={<ContributionsBoneyardFallback />}
            fixture={
              <ContributionsMainBody
                data={boneyardContributionsFixture}
                isLoading={false}
                onSelectContribution={() => {}}
                needsAttentionGroups={[]}
              />
            }
            snapshotConfig={{
              excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
              excludeTags: ["footer"],
            }}
          >
            <ContributionsMainBody
              data={contributionRows}
              isLoading={isPagePending}
              needsAttentionGroups={needsAttentionGroups}
              onSelectContribution={(contribution) => {
                openGift(contribution.id);
              }}
              onOpenContributionById={(contributionId) => {
                openGift(contributionId);
              }}
            />
          </BoneyardSkeleton>
        )}

        <ContributionDetailOverlay
          donationId={selectedDonationId}
          sourceSurface="contribution_hub"
          onClose={closeGift}
          onActionSuccess={markFreshness}
        />
      </div>
    </PageShell>
  );
}
