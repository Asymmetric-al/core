/**
 * Contribution command executor.
 *
 * HTTP and stored correction requests still carry `actionType` plus a JSON
 * payload bag. Adapters parse that bag into `ContributionCommand` before
 * calling this function. Action bodies live in internal handlers; this
 * module owns permission, normalize, reason/confirmation, and dispatch.
 */

import {
  executeApproveStagedGift,
  executeCorrection,
  executeCrmRetry,
  executeDonorRelink,
  executeMetadataUpdate,
  executeRefund,
  executeResendReceipt,
  executeStripeReplay,
} from "./action-handlers";
import {
  applyApprovedCorrectionRequest,
  assertActorPermissions,
  assertReasonAndConfirmation,
  commandActionType,
  isApprovalRequestAction,
  normalizeActionInput,
  requiresCorrectionApproval,
} from "./action-runtime";
import { getContributionActionPolicy } from "./policy";
import { ApiHttpError } from "../../shared/http-errors";

import type {
  ContributionActionResult,
  ExecuteContributionActionInput,
} from "./types";

export async function executeContributionAction<TContribution = unknown>(
  rawInput: ExecuteContributionActionInput<TContribution>,
): Promise<ContributionActionResult<TContribution>> {
  const policy = getContributionActionPolicy({
    actionType: commandActionType(rawInput),
    organizationSettings: rawInput.organizationSettings,
    userPreferences: rawInput.userPreferences,
  });
  const actionRequiresApproval =
    isApprovalRequestAction(commandActionType(rawInput)) &&
    requiresCorrectionApproval(rawInput);

  assertActorPermissions(rawInput, policy, {
    requiresApproval: actionRequiresApproval,
  });
  const input = normalizeActionInput(
    await applyApprovedCorrectionRequest(rawInput),
  );
  assertReasonAndConfirmation(input, policy);

  switch (input.command.type) {
    case "resend_receipt":
      return executeResendReceipt(input);
    case "approve_staged_gift":
      return executeApproveStagedGift(input);
    case "retry_staged_gift":
    case "crm_repost":
      return executeCrmRetry(input);
    case "metadata_update":
      return executeMetadataUpdate(input);
    case "donor_relink":
      return executeDonorRelink(input);
    case "refund":
      return executeRefund(input);
    case "stripe_replay":
      return executeStripeReplay(input);
    case "amount_correction":
    case "designation_correction":
    case "fund_correction":
    case "allocation_correction":
    case "receipt_correction":
    case "statement_correction":
    case "payment_state_correction":
      return executeCorrection(input);
    default: {
      const exhaustive: never = input.command;
      throw new ApiHttpError(
        400,
        `Unsupported contribution action: ${commandActionType({ command: exhaustive })}`,
      );
    }
  }
}
