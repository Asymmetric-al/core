import {
  CONTRIBUTION_ACTION_TYPES,
  type ContributionActionType,
} from "./types";
import { ApiHttpError } from "../../shared/http-errors";

export type ContributionCommandExtras = Record<string, unknown>;

interface ContributionCommandBase {
  extras: ContributionCommandExtras;
}

export interface ResendReceiptCommand extends ContributionCommandBase {
  type: "resend_receipt";
  stagedGiftId?: string;
}

export interface ApproveStagedGiftCommand extends ContributionCommandBase {
  type: "approve_staged_gift";
  stagedGiftId?: string;
}

export interface CrmRetryCommand extends ContributionCommandBase {
  type: "retry_staged_gift" | "crm_repost";
  stagedGiftId?: string;
  allocationId?: string;
  scope?: "parent" | "designation";
}

export interface MetadataUpdateCommand extends ContributionCommandBase {
  type: "metadata_update";
}

export interface RefundCommand extends ContributionCommandBase {
  type: "refund";
  amount?: number;
}

export interface DonorRelinkCommand extends ContributionCommandBase {
  type: "donor_relink";
  donorId?: string;
}

export interface AmountCorrectionCommand extends ContributionCommandBase {
  type: "amount_correction";
  amount?: number;
  receiptDelivery?: Record<string, unknown>;
}

export interface FundOrDesignationCorrectionCommand extends ContributionCommandBase {
  type: "designation_correction" | "fund_correction";
  fundId?: string;
}

export interface AllocationCorrectionCommand extends ContributionCommandBase {
  type: "allocation_correction";
  designationLines?: unknown[];
  fundId?: string;
  missionaryId?: string;
}

export interface ReceiptOrStatementCorrectionCommand extends ContributionCommandBase {
  type: "receipt_correction" | "statement_correction";
}

export interface PaymentStateCorrectionCommand extends ContributionCommandBase {
  type: "payment_state_correction";
  status?: string;
}

export interface StripeReplayCommand extends ContributionCommandBase {
  type: "stripe_replay";
  stripeEventId?: string;
}

export type ContributionCommand =
  | ResendReceiptCommand
  | ApproveStagedGiftCommand
  | CrmRetryCommand
  | MetadataUpdateCommand
  | RefundCommand
  | DonorRelinkCommand
  | AmountCorrectionCommand
  | FundOrDesignationCorrectionCommand
  | AllocationCorrectionCommand
  | ReceiptOrStatementCorrectionCommand
  | PaymentStateCorrectionCommand
  | StripeReplayCommand;

const CONTRIBUTION_ACTION_TYPE_SET = new Set<string>(CONTRIBUTION_ACTION_TYPES);

function isContributionActionType(
  value: string,
): value is ContributionActionType {
  return CONTRIBUTION_ACTION_TYPE_SET.has(value);
}

function optionalStringField(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalNumberField(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function optionalRecordField(
  value: unknown,
): Record<string, unknown> | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function optionalArrayField(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function crmRetryScope(value: unknown): "parent" | "designation" | undefined {
  if (value === "parent" || value === "designation") {
    return value;
  }
  return undefined;
}

function createNullPrototypeBag(): ContributionCommandExtras {
  return Object.create(null) as ContributionCommandExtras;
}

function assignOwnProperty(
  target: ContributionCommandExtras,
  key: string,
  value: unknown,
): void {
  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });
}

function extrasFromPayload(
  payload: Record<string, unknown>,
  representedKeys: ReadonlySet<string>,
): ContributionCommandExtras {
  const extras = createNullPrototypeBag();
  for (const [key, value] of Object.entries(payload)) {
    if (!representedKeys.has(key)) {
      assignOwnProperty(extras, key, value);
    }
  }
  return extras;
}

function representedKeys(entries: Array<[string, unknown]>): Set<string> {
  return new Set(
    entries.filter(([, value]) => value !== undefined).map(([key]) => key),
  );
}

/**
 * Parse HTTP/JSON bags into a Contribution command.
 * Does not trim or 400 on empty strings — execute still owns that after permissions.
 * Unknown keys and untyped known-key values round-trip through extras.
 */
export function parseContributionCommand(
  actionType: string,
  payload?: Record<string, unknown>,
): ContributionCommand {
  if (!isContributionActionType(actionType)) {
    throw new ApiHttpError(
      400,
      `Unsupported contribution action: ${actionType}`,
    );
  }

  const bag = payload ?? {};

  switch (actionType) {
    case "resend_receipt": {
      const stagedGiftId = optionalStringField(bag.stagedGiftId);
      return {
        type: actionType,
        stagedGiftId,
        extras: extrasFromPayload(
          bag,
          representedKeys([["stagedGiftId", stagedGiftId]]),
        ),
      };
    }
    case "approve_staged_gift": {
      const stagedGiftId = optionalStringField(bag.stagedGiftId);
      return {
        type: actionType,
        stagedGiftId,
        extras: extrasFromPayload(
          bag,
          representedKeys([["stagedGiftId", stagedGiftId]]),
        ),
      };
    }
    case "retry_staged_gift":
    case "crm_repost": {
      const stagedGiftId = optionalStringField(bag.stagedGiftId);
      const allocationId = optionalStringField(bag.allocationId);
      const scope = crmRetryScope(bag.scope);
      return {
        type: actionType,
        stagedGiftId,
        allocationId,
        scope,
        extras: extrasFromPayload(
          bag,
          representedKeys([
            ["stagedGiftId", stagedGiftId],
            ["allocationId", allocationId],
            ["scope", scope],
          ]),
        ),
      };
    }
    case "metadata_update":
      return {
        type: actionType,
        extras: extrasFromPayload(bag, new Set()),
      };
    case "refund": {
      const amount = optionalNumberField(bag.amount);
      return {
        type: actionType,
        amount,
        extras: extrasFromPayload(bag, representedKeys([["amount", amount]])),
      };
    }
    case "donor_relink": {
      const donorId = optionalStringField(bag.donorId);
      return {
        type: actionType,
        donorId,
        extras: extrasFromPayload(bag, representedKeys([["donorId", donorId]])),
      };
    }
    case "amount_correction": {
      const amount = optionalNumberField(bag.amount);
      const receiptDelivery = optionalRecordField(bag.receiptDelivery);
      return {
        type: actionType,
        amount,
        receiptDelivery,
        extras: extrasFromPayload(
          bag,
          representedKeys([
            ["amount", amount],
            ["receiptDelivery", receiptDelivery],
          ]),
        ),
      };
    }
    case "designation_correction":
    case "fund_correction": {
      const fundId = optionalStringField(bag.fundId);
      return {
        type: actionType,
        fundId,
        extras: extrasFromPayload(bag, representedKeys([["fundId", fundId]])),
      };
    }
    case "allocation_correction": {
      const designationLines = optionalArrayField(bag.designationLines);
      const fundId = optionalStringField(bag.fundId);
      const missionaryId = optionalStringField(bag.missionaryId);
      return {
        type: actionType,
        designationLines,
        fundId,
        missionaryId,
        extras: extrasFromPayload(
          bag,
          representedKeys([
            ["designationLines", designationLines],
            ["fundId", fundId],
            ["missionaryId", missionaryId],
          ]),
        ),
      };
    }
    case "receipt_correction":
    case "statement_correction":
      return {
        type: actionType,
        extras: extrasFromPayload(bag, new Set()),
      };
    case "payment_state_correction": {
      const status = optionalStringField(bag.status);
      return {
        type: actionType,
        status,
        extras: extrasFromPayload(bag, representedKeys([["status", status]])),
      };
    }
    case "stripe_replay": {
      const stripeEventId = optionalStringField(bag.stripeEventId);
      return {
        type: actionType,
        stripeEventId,
        extras: extrasFromPayload(
          bag,
          representedKeys([["stripeEventId", stripeEventId]]),
        ),
      };
    }
    default: {
      const exhaustive: never = actionType;
      throw new ApiHttpError(
        400,
        `Unsupported contribution action: ${exhaustive}`,
      );
    }
  }
}

function overlayDefined(
  extras: ContributionCommandExtras,
  fields: Record<string, unknown>,
): Record<string, unknown> {
  const payload = createNullPrototypeBag();
  for (const [key, value] of Object.entries(extras)) {
    assignOwnProperty(payload, key, value);
  }
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      assignOwnProperty(payload, key, value);
    }
  }
  return payload;
}

/**
 * Serialize a Contribution command back to the JSON bag used by fingerprints,
 * correction-request storage, and operations adapters.
 */
export function serializeContributionCommand(
  command: ContributionCommand,
): Record<string, unknown> {
  switch (command.type) {
    case "resend_receipt":
    case "approve_staged_gift":
      return overlayDefined(command.extras, {
        stagedGiftId: command.stagedGiftId,
      });
    case "retry_staged_gift":
    case "crm_repost":
      return overlayDefined(command.extras, {
        stagedGiftId: command.stagedGiftId,
        allocationId: command.allocationId,
        scope: command.scope,
      });
    case "metadata_update":
    case "receipt_correction":
    case "statement_correction":
      return overlayDefined(command.extras, {});
    case "refund":
      return overlayDefined(command.extras, { amount: command.amount });
    case "donor_relink":
      return overlayDefined(command.extras, { donorId: command.donorId });
    case "amount_correction":
      return overlayDefined(command.extras, {
        amount: command.amount,
        receiptDelivery: command.receiptDelivery,
      });
    case "designation_correction":
    case "fund_correction":
      return overlayDefined(command.extras, { fundId: command.fundId });
    case "allocation_correction":
      return overlayDefined(command.extras, {
        designationLines: command.designationLines,
        fundId: command.fundId,
        missionaryId: command.missionaryId,
      });
    case "payment_state_correction":
      return overlayDefined(command.extras, { status: command.status });
    case "stripe_replay":
      return overlayDefined(command.extras, {
        stripeEventId: command.stripeEventId,
      });
    default: {
      const exhaustive: never = command;
      return exhaustive;
    }
  }
}

export function withCommandPayload(
  command: ContributionCommand,
  payload: Record<string, unknown>,
): ContributionCommand {
  return parseContributionCommand(command.type, payload);
}
