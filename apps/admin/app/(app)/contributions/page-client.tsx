"use client";

import { useMissionControlNeedsAttention } from "@asym/database/hooks";
import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, RotateCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { ContributionDetailOverlay } from "./contribution-detail-overlay";
import {
  INVALID_CONTRIBUTION_LINK_MESSAGE,
  invalidateContributionOperationQueries,
  isContributionGiftParam,
} from "./contribution-detail-query";
import { boneyardContributionsFixture, mockContributions } from "./data";
import { useContributionFreshness } from "./freshness-indicator";
import {
  ContributionsMainBody,
  ContributionsPageActions,
  hasContributionsPageActions,
} from "./main-body";
import { useAdminContributions } from "./use-admin-contributions";
import { CONTRIBUTIONS_PAGE_META } from "../../../components/table-page-meta";

import type { Contribution } from "./types";

/** When `"1"`, table data comes from `mockContributions` (local dev only). */
const USE_MOCK_CONTRIBUTIONS_UI =
  process.env.NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK === "1";

/** For a failure whose cause is unknown (a 500, a failed query). */
const LOAD_ERROR_NEXT_STEP =
  "Something went wrong while loading. Retry, or try again in a few minutes.";
/** Only when the request never reached the server. */
const NETWORK_ERROR_NEXT_STEP = "Check your connection, then retry.";

/**
 * Messages that only restate "loading failed" (the list route's and the
 * loader's fallbacks). They would echo the title, so the next step shows
 * instead; a specific server message is shown as is.
 */
const GENERIC_LOAD_ERROR =
  /^(could ?n[o']t|failed to|unable to) load (the )?contributions\.?$/i;
/** Messages browsers use when a request never reached the server. */
const NETWORK_FAILURE =
  /^(failed to fetch|load failed|network ?error( when attempting to fetch resource)?|network request failed)\.?$/i;

function describeLoadError(message: string | null): string {
  const trimmed = message?.trim() ?? "";
  if (NETWORK_FAILURE.test(trimmed)) return NETWORK_ERROR_NEXT_STEP;
  return trimmed && !GENERIC_LOAD_ERROR.test(trimmed)
    ? trimmed
    : LOAD_ERROR_NEXT_STEP;
}

/**
 * Inline list failure: the whole workspace depends on the list, so the error
 * replaces it in place with the server's reason (or a next step when the
 * server gave none) and a working retry.
 */
function ContributionsLoadError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <Card role="alert">
      <Empty>
        <EmptyHeader>
          {/* Destructive tone tells a failed load from an empty list. */}
          <EmptyMedia variant="icon">
            <AlertCircle className="text-destructive" />
          </EmptyMedia>
          <EmptyTitle>
            <h2>Couldn&apos;t load contributions</h2>
          </EmptyTitle>
          <EmptyDescription>{describeLoadError(message)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Retry
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  );
}

export default function ContributionsPage({
  canManageContributions = false,
}: {
  canManageContributions?: boolean;
}) {
  const contributionsQuery = useAdminContributions();
  const needsAttentionQuery = useMissionControlNeedsAttention();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const giftParam = searchParams.get("gift");
  // Home links to one needs-attention kind with ?attention=<group key>.
  const attentionKeys = searchParams.getAll("attention").filter(Boolean);
  const selectedGiftParam = isContributionGiftParam(giftParam)
    ? giftParam
    : null;
  const hasInvalidGiftParam = giftParam != null && selectedGiftParam == null;
  const [giftSelection, setGiftSelection] = useState({
    giftParam,
    donationId: selectedGiftParam,
  });
  if (giftSelection.giftParam !== giftParam) {
    setGiftSelection({ giftParam, donationId: selectedGiftParam });
  }
  const selectedDonationId =
    giftSelection.giftParam === giftParam
      ? giftSelection.donationId
      : selectedGiftParam;
  const { markFreshness, showFreshness } = useContributionFreshness();
  const openerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (selectedDonationId || !openerElementRef.current) {
      return;
    }
    // Wait for the sheet to close before returning focus, so its
    // focus-trap cleanup cannot clobber the opener (ADR-CD-023).
    const opener = openerElementRef.current;
    openerElementRef.current = null;
    const timeout = window.setTimeout(() => opener.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [selectedDonationId]);

  /**
   * Bulk receipt batches change receipt state for many rows at once; refresh
   * the shared queries (ADR-CD-032) and surface the same quiet freshness
   * indicator single-row actions use.
   */
  const handleBulkReceiptSuccess = useCallback(() => {
    void invalidateContributionOperationQueries(queryClient);
    markFreshness();
  }, [markFreshness, queryClient]);

  const openGift = useCallback(
    (donationId: string) => {
      // Smart close (ADR-CD-023): remember the opener so closing the detail
      // overlay can restore focus to it.
      openerElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setGiftSelection({ giftParam, donationId });
      const params = new URLSearchParams(searchParams.toString());
      params.set("gift", donationId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [giftParam, pathname, router, searchParams],
  );

  const handleSelectContribution = useCallback(
    (contribution: Contribution) => openGift(contribution.id),
    [openGift],
  );

  const closeGift = useCallback(() => {
    setGiftSelection({ giftParam, donationId: null });
    // Smart close removes only the gift selection from route state; filters,
    // search, and the rest of the workspace stay untouched (ADR-CD-023).
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [giftParam, pathname, router, searchParams]);

  useEffect(() => {
    if (!hasInvalidGiftParam) {
      return;
    }

    // The fixed id keeps a re-render from stacking a second toast.
    toast.error(INVALID_CONTRIBUTION_LINK_MESSAGE, {
      id: "invalid-contribution-link",
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [hasInvalidGiftParam, pathname, router, searchParams]);

  const isError = contributionsQuery.isError;
  const isPagePending = contributionsQuery.isPending;
  const contributionRows = isError
    ? []
    : USE_MOCK_CONTRIBUTIONS_UI
      ? mockContributions
      : (contributionsQuery.data ?? []);
  // The server leaves retired kinds (CRM posting) out of Needs Attention;
  // their old failures stay on each gift as history only.
  const needsAttentionGroups = isError
    ? []
    : (needsAttentionQuery.data?.groups ?? []);
  // Read on its own: a failed check must not pass for "nothing needs
  // attention". A failed gifts load already replaces the whole workspace.
  const needsAttentionFailed = !isError && needsAttentionQuery.isError;

  const errorMessage =
    contributionsQuery.error instanceof Error
      ? contributionsQuery.error.message
      : contributionsQuery.error != null
        ? String(contributionsQuery.error)
        : null;
  const isLoadingOlder =
    !USE_MOCK_CONTRIBUTIONS_UI && Boolean(contributionsQuery.isLoadingOlder);
  // A failed older page (or refresh) keeps the gifts on screen; only a
  // failed first load replaces the workspace with the error above.
  const loadIssue = USE_MOCK_CONTRIBUTIONS_UI
    ? null
    : (contributionsQuery.loadIssue ?? null);

  return (
    <PageShell
      title={CONTRIBUTIONS_PAGE_META.title}
      description={CONTRIBUTIONS_PAGE_META.description}
      density={CONTRIBUTIONS_PAGE_META.density}
      actions={
        hasContributionsPageActions(canManageContributions) ? (
          <ContributionsPageActions
            canManageContributions={canManageContributions}
          />
        ) : undefined
      }
    >
      <div data-testid="mc-contributions-live" className="flex flex-col gap-6">
        {isError ? (
          <ContributionsLoadError
            message={errorMessage}
            onRetry={() => void contributionsQuery.refetch()}
          />
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
              isLoadingOlder={isLoadingOlder}
              loadIssue={loadIssue}
              needsAttentionGroups={needsAttentionGroups}
              needsAttentionFailed={needsAttentionFailed}
              onRetryNeedsAttention={() => void needsAttentionQuery.refetch()}
              showFreshness={showFreshness}
              onRefresh={() => void contributionsQuery.refetch()}
              onSelectContribution={handleSelectContribution}
              onOpenContributionById={openGift}
              onBulkReceiptSuccess={handleBulkReceiptSuccess}
              initialNeedsAttentionKeys={attentionKeys}
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
