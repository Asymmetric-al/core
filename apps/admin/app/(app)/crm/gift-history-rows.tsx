"use client";

import { OPERATION_DEFINITIONS } from "@asym/api/admin/contribution-operations/catalog";
import {
  formatSharedContributionAmount,
  SHARED_RECEIPT_STATUS_LABELS,
  SHARED_REFUND_STATE_LABELS,
} from "@asym/api/admin/contribution-shared";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Fragment, useId } from "react";

import { formatCrmDate } from "./crm-display";
import {
  GiftInlineActionControls,
  resolveGiftRowAction,
} from "./gift-inline-action-controls";
import { ContributionStatusBadge } from "../contributions/contribution-status";

import type { OperationDefinition } from "@asym/api/admin/contribution-operations/catalog";
import type {
  CrmGiftHistoryRow,
  CrmGiftHistoryViewSettings,
  CrmTablePreferencesResponse,
} from "@asym/database/types";

type StatusTone = "ok" | "warning" | "destructive-subtle";

interface StatusSegment {
  key: "receipt";
  text: string;
  tone: StatusTone;
}

const RECEIPT_TONES: Record<string, StatusTone> = {
  sent: "ok",
  pending: "warning",
  not_sent: "warning",
  failed: "destructive-subtle",
};

const TONE_RANK: Record<StatusTone, number> = {
  ok: 0,
  warning: 1,
  "destructive-subtle": 2,
};

/**
 * The gift's receipt state. CRM posting is retired (Asym Postgres is the
 * CRM), so a stale post state stays history in the gift sheet rather than a
 * status here that staff cannot act on.
 */
function giftStatusSegments(
  shared: CrmGiftHistoryRow["shared"],
): StatusSegment[] {
  const receipt = SHARED_RECEIPT_STATUS_LABELS[shared.receiptStatus];
  return [
    {
      key: "receipt",
      text: `Receipt ${receipt.toLowerCase()}`,
      tone: RECEIPT_TONES[shared.receiptStatus] ?? "ok",
    },
  ];
}

/**
 * "Receipt sent". A receipt that failed or is still pending carries a state
 * badge; a sent receipt stays plain text.
 */
function GiftStatusLine({
  id,
  shared,
}: {
  id: string;
  shared: CrmGiftHistoryRow["shared"];
}) {
  const segments = giftStatusSegments(shared);
  const flagged = segments.reduce<StatusSegment | null>(
    (worst, segment) =>
      segment.tone !== "ok" &&
      (!worst || TONE_RANK[segment.tone] > TONE_RANK[worst.tone])
        ? segment
        : worst,
    null,
  );
  return (
    <span
      id={id}
      className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground"
    >
      {segments.map((segment, index) => (
        <Fragment key={segment.key}>
          {index > 0 ? <span aria-hidden="true"> · </span> : null}
          {segment === flagged && flagged.tone !== "ok" ? (
            <Badge variant={flagged.tone}>
              {segment.text.charAt(0).toUpperCase() + segment.text.slice(1)}
            </Badge>
          ) : (
            <span>{segment.text}</span>
          )}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * The gift's money state, shown whatever the status-line setting: a gift that
 * failed, is pending or was refunded never reads as money received. A
 * completed gift carries no badge (one badge per row), and a partly refunded
 * one says so.
 */
function GiftPaymentState({
  id,
  shared,
}: {
  id: string;
  shared: CrmGiftHistoryRow["shared"];
}) {
  const showPayment = shared.paymentStatus !== "completed";
  const partlyRefunded = shared.refundState === "partial_refund";
  if (!showPayment && !partlyRefunded) return null;
  return (
    <span id={id} className="flex flex-wrap items-center gap-1">
      {showPayment ? (
        <ContributionStatusBadge status={shared.paymentStatus} />
      ) : null}
      {partlyRefunded ? (
        <Badge variant="outline">
          {SHARED_REFUND_STATE_LABELS.partial_refund}
        </Badge>
      ) : null}
    </span>
  );
}

function GiftHistoryRow({
  gift,
  onOpenGift,
  onPinRowAction,
  onRunOperation,
  tablePreferences,
  viewSettings,
}: {
  gift: CrmGiftHistoryRow;
  onOpenGift: (donationId: string) => void;
  onPinRowAction: (actionId: string | null) => void;
  onRunOperation: (donationId: string, operation: OperationDefinition) => void;
  tablePreferences: CrmTablePreferencesResponse | undefined;
  viewSettings: CrmGiftHistoryViewSettings;
}) {
  const statusId = useId();
  const dateId = useId();
  const paymentId = useId();
  const shared = gift.shared;
  const formattedAmount = formatSharedContributionAmount(
    shared.amountCents,
    shared.currencyCode,
  );
  const giftDate = formatCrmDate(shared.giftDate);
  const { designation, statusLine } = viewSettings.columns;
  const hasPaymentState =
    shared.paymentStatus !== "completed" ||
    shared.refundState === "partial_refund";
  // Names the row's actions menu, so each gift's menu is told apart.
  const giftLabel = `${formattedAmount} gift${giftDate ? ` on ${giftDate}` : ""} to ${shared.designationSummary.fundName}`;

  return (
    // Phones stack the row action under the gift so the designation keeps
    // the full width; wider sheets keep it on the same line.
    <li className="flex flex-col gap-2 px-3 py-2.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <button
        type="button"
        onClick={() => onOpenGift(gift.donationId)}
        className="group flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-md text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`Open gift detail for ${formattedAmount} to ${shared.designationSummary.fundName}`}
        // The date tells same-amount gifts to the same fund apart.
        aria-describedby={
          [
            hasPaymentState ? paymentId : null,
            giftDate ? dateId : null,
            statusLine ? statusId : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-foreground tabular-nums underline-offset-4 group-hover:underline">
            {formattedAmount}
          </span>
          <GiftPaymentState id={paymentId} shared={shared} />
        </span>
        {giftDate || designation ? (
          <span className="flex max-w-full min-w-0 items-baseline gap-1 text-xs text-muted-foreground">
            {giftDate ? (
              <span id={dateId} className="shrink-0 tabular-nums">
                {giftDate}
              </span>
            ) : null}
            {giftDate && designation ? <span aria-hidden="true">·</span> : null}
            {designation ? (
              <span className="truncate">
                {shared.designationSummary.fundName}
              </span>
            ) : null}
          </span>
        ) : null}
        {statusLine ? <GiftStatusLine id={statusId} shared={shared} /> : null}
      </button>
      <GiftInlineActionControls
        giftLabel={giftLabel}
        inlineActions={gift.inlineActions}
        preferences={tablePreferences}
        receiptSent={shared.receiptStatus === "sent"}
        onPinChange={onPinRowAction}
        onRunOperation={(operation) =>
          onRunOperation(gift.donationId, operation)
        }
      />
    </li>
  );
}

/**
 * A pinned row action shows on every gift that allows it, whatever the
 * gift's state (e.g. "Send receipt" beside "Receipt sent"), so the pin is
 * said once above the list, with a way to undo it.
 */
function GiftHistoryPinnedActionNote({
  giftRows,
  onPinRowAction,
  tablePreferences,
}: {
  giftRows: CrmGiftHistoryRow[];
  onPinRowAction: (actionId: string | null) => void;
  tablePreferences: CrmTablePreferencesResponse | undefined;
}) {
  if (!tablePreferences?.user?.actionId) return null;
  const pinned = giftRows
    .map(
      (gift) =>
        resolveGiftRowAction(gift.inlineActions, tablePreferences).resolved,
    )
    .find((resolved) => resolved.source === "user_pin");
  // A pinned receipt action reads "Send receipt" or "Resend receipt" per
  // row (by receipt state), so the note names both.
  const title =
    pinned?.actionType === "resend_receipt"
      ? "Send or resend receipt"
      : pinned?.actionType
        ? OPERATION_DEFINITIONS[pinned.actionType]?.title
        : undefined;
  if (!title) return null;
  // One muted line (each pinned row action already carries the pin glyph)
  // and, beside it or under it on phones, a small button back to each
  // gift's own next step (the unpinned default).
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <p className="text-xs text-muted-foreground">
        <span className="text-foreground">{title}</span> is the action on every
        gift.
      </p>
      <Button variant="outline" size="xs" onClick={() => onPinRowAction(null)}>
        Use suggested actions
      </Button>
    </div>
  );
}

export function GiftHistoryRows({
  giftRows,
  onOpenGift,
  onPinRowAction,
  onRunOperation,
  tablePreferences,
  viewSettings,
}: {
  giftRows: CrmGiftHistoryRow[];
  onOpenGift: (donationId: string) => void;
  onPinRowAction: (actionId: string | null) => void;
  onRunOperation: (donationId: string, operation: OperationDefinition) => void;
  tablePreferences: CrmTablePreferencesResponse | undefined;
  viewSettings: CrmGiftHistoryViewSettings;
}) {
  if (giftRows.length === 0) {
    return (
      <p
        aria-live="polite"
        className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
      >
        No gifts match the current view filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <GiftHistoryPinnedActionNote
        giftRows={giftRows}
        onPinRowAction={onPinRowAction}
        tablePreferences={tablePreferences}
      />
      <ul
        aria-live="polite"
        className="flex flex-col divide-y rounded-lg border"
      >
        {giftRows.map((gift) => (
          <GiftHistoryRow
            key={gift.id}
            gift={gift}
            onOpenGift={onOpenGift}
            onPinRowAction={onPinRowAction}
            onRunOperation={onRunOperation}
            tablePreferences={tablePreferences}
            viewSettings={viewSettings}
          />
        ))}
      </ul>
    </div>
  );
}
