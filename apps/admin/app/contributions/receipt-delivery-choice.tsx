import {
  Field,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { useId } from "react";

import type {
  ContributionReceiptDeliveryView,
  ReceiptDeliveryChoice,
  ResolvedReceiptDeliverySelection,
} from "@asym/api/admin/contribution-operations";

/**
 * Updated receipt delivery choice (AL-263, ADR-CD-029 / ADR-CD-030).
 *
 * When a correction changes values already represented on a sent receipt,
 * staff explicitly choose how the donor receives the updated receipt: email
 * (when the donor has an address and has not opted out), PDF, or defer with
 * a reason where policy permits. Unavailable options stay visible with their
 * server-computed blocked reason; nothing is auto-sent and the server remains
 * the policy authority.
 */

/**
 * The `receiptDelivery` block the server attaches to
 * `ViewerProjectedContributionDetail` for gifts with a sent receipt (AL-263).
 */
export type ContributionReceiptDeliveryContext =
  ContributionReceiptDeliveryView;

/**
 * A concrete delivery selection — the requester's proposal on a pending
 * correction request, or the selection submitted with a correction/decision.
 */
export type ReceiptDeliveryProposal = ResolvedReceiptDeliverySelection;

/** In-progress form value; `choice` is null until a selection is made. */
export interface ReceiptDeliveryValue {
  choice: ReceiptDeliveryChoice | null;
  deferReason: string;
}

const RECEIPT_DELIVERY_CHOICE_LABELS: Record<ReceiptDeliveryChoice, string> = {
  email: "Send updated receipt by email",
  pdf: "Generate updated receipt PDF",
  defer: "Don't send now (defer with reason)",
};

export function receiptDeliveryChoiceLabel(
  choice: ReceiptDeliveryChoice,
): string {
  return RECEIPT_DELIVERY_CHOICE_LABELS[choice];
}

/** Download URL for a generated updated-receipt PDF snapshot. */
export function receiptSnapshotPdfUrl(snapshotId: string): string {
  return `/api/admin/contribution-operations/receipt-snapshots/${encodeURIComponent(
    snapshotId,
  )}/pdf`;
}

/**
 * Initial form value: the requester's proposal when it is still available,
 * otherwise the server-computed default choice.
 */
export function resolveInitialReceiptDeliveryValue(input: {
  receiptDelivery: ContributionReceiptDeliveryContext;
  proposal?: ReceiptDeliveryProposal | null;
}): ReceiptDeliveryValue {
  const availabilityByChoice = new Map(
    input.receiptDelivery.options.map((option) => [
      option.choice,
      option.available,
    ]),
  );
  const proposal = input.proposal ?? null;

  if (proposal && availabilityByChoice.get(proposal.choice)) {
    return { choice: proposal.choice, deferReason: proposal.deferReason ?? "" };
  }

  return { choice: input.receiptDelivery.defaultChoice, deferReason: "" };
}

function optionDisplayLabel(
  choice: ReceiptDeliveryChoice,
  donorEmail: string | null,
): string {
  const baseLabel = RECEIPT_DELIVERY_CHOICE_LABELS[choice];
  if (choice === "email" && donorEmail) {
    return `${baseLabel} (${donorEmail})`;
  }
  return baseLabel;
}

export function ReceiptDeliveryChoiceField({
  affectedFields,
  receiptDelivery,
  value,
  onChange,
  proposal = null,
  error = null,
}: {
  affectedFields: string[];
  receiptDelivery: ContributionReceiptDeliveryContext;
  value: ReceiptDeliveryValue;
  onChange: (value: ReceiptDeliveryValue) => void;
  proposal?: ReceiptDeliveryProposal | null;
  error?: string | null;
}) {
  const groupId = useId();
  const deferReasonId = useId();

  return (
    <div
      className="space-y-3 rounded-lg border border-border bg-muted/20 p-3"
      data-testid="receipt-delivery-choice"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          This correction changes receipt fields: {affectedFields.join(", ")}
        </p>
        <p className="text-xs text-muted-foreground">
          Choose how the donor receives the updated receipt. It is never sent
          automatically.
        </p>
        {proposal && (
          <p className="text-xs text-muted-foreground">
            Requester proposed: {receiptDeliveryChoiceLabel(proposal.choice)}
            {proposal.choice === "defer" && proposal.deferReason
              ? ` — ${proposal.deferReason}`
              : null}
          </p>
        )}
      </div>

      <RadioGroup
        aria-label="Updated receipt delivery"
        value={value.choice}
        onValueChange={(next) => {
          if (next === "email" || next === "pdf" || next === "defer") {
            onChange({ ...value, choice: next });
          }
        }}
        className="gap-2"
      >
        {receiptDelivery.options.map((option) => {
          const itemId = `${groupId}-${option.choice}`;

          return (
            <div key={option.choice} className="space-y-1">
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  id={itemId}
                  value={option.choice}
                  disabled={!option.available}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={itemId}
                  className={cn(
                    "text-sm font-normal leading-snug",
                    !option.available && "text-muted-foreground",
                  )}
                >
                  {optionDisplayLabel(
                    option.choice,
                    receiptDelivery.donor.email,
                  )}
                </Label>
              </div>
              {option.blockedReason && (
                <p className="pl-6 text-xs text-muted-foreground">
                  {option.blockedReason}
                </p>
              )}
            </div>
          );
        })}
      </RadioGroup>

      {value.choice === "defer" && (
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={deferReasonId}>
            Defer reason
            {receiptDelivery.deferReasonRequired ? "" : " (optional)"}
          </FieldLabel>
          <Textarea
            id={deferReasonId}
            aria-invalid={Boolean(error)}
            aria-required={receiptDelivery.deferReasonRequired}
            value={value.deferReason}
            onChange={(event) =>
              onChange({ ...value, deferReason: event.target.value })
            }
            placeholder="Why is the updated receipt not being sent now?"
          />
        </Field>
      )}

      <FieldError errors={error ? [{ message: error }] : []} />
    </div>
  );
}
