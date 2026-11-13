import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useId } from "react";

import {
  formatReceiptFieldList,
  RECEIPT_DELIVERY_CHOICE_LABELS,
  receiptDeliveryChoiceLabel,
} from "./receipt-delivery-model";

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

export function ReceiptDeliveryChoiceField({
  affectedFields,
  receiptDelivery,
  value,
  onChange,
  proposal = null,
  error = null,
  disabled = false,
}: {
  affectedFields: string[];
  receiptDelivery: ContributionReceiptDeliveryContext;
  value: ReceiptDeliveryValue;
  onChange: (value: ReceiptDeliveryValue) => void;
  proposal?: ReceiptDeliveryProposal | null;
  /**
   * Disables the choice while its form submits. Passed explicitly because a
   * native `fieldset[disabled]` does not reach the Base UI radios.
   */
  disabled?: boolean;
  error?: string | null;
}) {
  const groupId = useId();
  const titleId = useId();
  const deferReasonId = useId();
  const deferReasonErrorId = `${deferReasonId}-error`;

  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-lg bg-muted/40 p-3"
      data-testid="receipt-delivery-choice"
    >
      <div className="flex flex-col gap-1">
        <p id={titleId} className="text-sm font-medium text-foreground">
          This correction changes receipt fields:{" "}
          {formatReceiptFieldList(affectedFields)}
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
        disabled={disabled}
        value={value.choice}
        onValueChange={(next) => {
          if (next === "email" || next === "pdf" || next === "defer") {
            onChange({ ...value, choice: next });
          }
        }}
      >
        {receiptDelivery.options.map((option) => {
          const itemId = `${groupId}-${option.choice}`;

          return (
            <Field
              key={option.choice}
              orientation="horizontal"
              data-disabled={!option.available}
            >
              <RadioGroupItem
                id={itemId}
                value={option.choice}
                disabled={!option.available}
              />
              <FieldContent>
                <FieldLabel htmlFor={itemId}>
                  {RECEIPT_DELIVERY_CHOICE_LABELS[option.choice]}
                </FieldLabel>
                {/* The address on its own line, so a phone never wraps it
                    mid-address inside the label. */}
                {option.choice === "email" && receiptDelivery.donor.email ? (
                  <FieldDescription>
                    <span className="break-all">
                      {receiptDelivery.donor.email}
                    </span>
                  </FieldDescription>
                ) : null}
                {option.blockedReason && (
                  <FieldDescription>{option.blockedReason}</FieldDescription>
                )}
              </FieldContent>
            </Field>
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
            aria-describedby={error ? deferReasonErrorId : undefined}
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

      <FieldError
        id={deferReasonErrorId}
        errors={error ? [{ message: error }] : []}
      />
    </div>
  );
}
