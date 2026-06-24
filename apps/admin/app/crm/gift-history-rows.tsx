"use client";

import {
  formatSharedContributionAmount,
  SHARED_CRM_POST_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
} from "@asym/api/admin/contribution-shared";

import { GiftInlineActionControls } from "./gift-inline-action-controls";

import type { OperationDefinition } from "../contributions/operation-shell";
import type {
  CrmGiftHistoryRow,
  CrmGiftHistoryViewSettings,
  CrmTablePreferencesResponse,
} from "@asym/database/types";

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
  return (
    <div className="mt-3 divide-y divide-border" aria-live="polite">
      {giftRows.length === 0 ? (
        <p className="py-3 text-xs text-muted-foreground">
          No gifts match the current view filters.
        </p>
      ) : null}
      {giftRows.slice(0, 6).map((gift) => {
        const shared = gift.shared;
        const formattedAmount = formatSharedContributionAmount(
          shared.amountCents,
          shared.currencyCode,
        );

        return (
          <div
            key={gift.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            <button
              type="button"
              onClick={() => onOpenGift(gift.donationId)}
              className="min-w-0 rounded-lg text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={`Open gift detail for ${formattedAmount} to ${shared.designationSummary.fundName}`}
            >
              <p className="text-sm font-semibold text-foreground">
                {formattedAmount}
              </p>
              {viewSettings.columns.designation ? (
                <p className="truncate text-xs text-muted-foreground">
                  {shared.designationSummary.fundName}
                </p>
              ) : null}
              {viewSettings.columns.statusLine ? (
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {SHARED_RECEIPT_STATUS_LABELS[shared.receiptStatus]} /{" "}
                  {shared.crmPostStatus
                    ? SHARED_CRM_POST_STATUS_LABELS[shared.crmPostStatus]
                    : "Not required"}
                </p>
              ) : null}
            </button>
            <GiftInlineActionControls
              inlineActions={gift.inlineActions}
              preferences={tablePreferences}
              onPinChange={onPinRowAction}
              onRunOperation={(operation) =>
                onRunOperation(gift.donationId, operation)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
