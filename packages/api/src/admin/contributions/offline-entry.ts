/**
 * Offline gift entry service (Contributions Hub) — known + unknown donor modes.
 * Source: DONOR_ANONYMITY_GUEST_GIVING_SPEC §6, §9.3.
 *
 * DESIGN NOTE — build ON the existing contribution layer, do not fork truth:
 *   The contribution-operations layer (executeContributionAction) only OPERATES
 *   on gifts that already exist; there is no create path. Offline entry is the
 *   net-new create sibling. It is written dependency-injected (like
 *   createContributionActionDependencies) so the orchestration is fully
 *   unit-testable with mocks and NO live DB. In the human-owned PR the deps are
 *   bound to the real donor resolver, the `donations` insert, and
 *   appendContributionOperationAuditEvent → contribution_operation_audit_events.
 *
 * Anonymity/receipt/entered_by columns come from the Track B §8.1 migration
 * (shared dependency). Redaction for missionary/public views is handled by the
 * shared donation-projection layer keyed on donor_identity_status.
 */

import {
  buildOfflineContributionRow,
  type OfflineContributionRow,
} from "./offline-logic";
import type { OfflineContributionRequest } from "../../schemas/contributions-offline";

export interface OfflineEntryActor {
  tenantId: string;
  actorProfileId: string;
}

/** Injected side-effects — bound to real infra in the handler, mocked in tests. */
export interface OfflineEntryDependencies {
  /**
   * Resolve the donor for a KNOWN gift: existing donorId, or create/match from
   * donorInput. Returns the resolved donor_id. Never called for unknown gifts.
   */
  resolveKnownDonor: (args: {
    tenantId: string;
    donorId?: string;
    donorInput?: Extract<
      OfflineContributionRequest,
      { donorMode: "known" }
    >["donorInput"];
  }) => Promise<{ donorId: string }>;
  /** Insert the assembled contribution row; returns the new contribution id. */
  insertContribution: (
    row: OfflineContributionRow & {
      tenant_id: string;
      donor_id: string | null;
      entered_by_user_id: string;
      source: "offline";
    },
  ) => Promise<{ contributionId: string }>;
  /** Append the shared contribution-operations audit event. */
  appendAudit: (event: {
    tenantId: string;
    actorProfileId: string;
    contributionId: string;
    actionType: "offline_gift_entry";
    sourceSurface: "offline";
    donorMode: OfflineContributionRequest["donorMode"];
    amountCents: number;
    receivedDate: string;
  }) => Promise<{ auditEventId: string }>;
}

export interface OfflineEntryResult {
  contributionId: string;
  auditEventId: string;
  donorId: string | null;
  donorIdentityStatus: "known" | "unknown_offline";
  receiptStatus: OfflineContributionRow["receipt_status"];
}

/**
 * Orchestrate an offline gift entry. Pure control flow over injected side
 * effects — enforces the §6 invariants:
 *   - unknown_offline NEVER resolves/creates a donor and stores donor_id = null;
 *   - known ALWAYS resolves a donor_id (existing or created);
 *   - every entry writes exactly one audit event (§ audit spine).
 * The caller (handler) is responsible for authn + the finance capability gate.
 */
export async function recordOfflineContribution(args: {
  input: OfflineContributionRequest;
  actor: OfflineEntryActor;
  deps: OfflineEntryDependencies;
}): Promise<OfflineEntryResult> {
  const { input, actor, deps } = args;
  const row = buildOfflineContributionRow(input);

  // §6.2: unknown gifts never carry donor identity — do not touch the donor
  // resolver, do not invent fake donor data.
  let donorId: string | null = null;
  if (input.donorMode === "known") {
    const resolved = await deps.resolveKnownDonor({
      tenantId: actor.tenantId,
      donorId: input.donorId,
      donorInput: input.donorInput,
    });
    donorId = resolved.donorId;
  }

  const { contributionId } = await deps.insertContribution({
    ...row,
    tenant_id: actor.tenantId,
    donor_id: donorId,
    entered_by_user_id: actor.actorProfileId,
    source: "offline",
  });

  const { auditEventId } = await deps.appendAudit({
    tenantId: actor.tenantId,
    actorProfileId: actor.actorProfileId,
    contributionId,
    actionType: "offline_gift_entry",
    sourceSurface: "offline",
    donorMode: input.donorMode,
    amountCents: row.amount_cents,
    receivedDate: row.received_date,
  });

  return {
    contributionId,
    auditEventId,
    donorId,
    donorIdentityStatus: row.donor_identity_status,
    receiptStatus: row.receipt_status,
  };
}
