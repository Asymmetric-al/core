import { type getAdminClient } from "@asym/database/supabase/admin";

import { ApiHttpError } from "../../shared/http-errors";

import type { OfflineEntryDependencies } from "./offline-entry";

type AdminSupabaseClient = Exclude<
  ReturnType<typeof getAdminClient>["client"],
  null
>;

/**
 * Offline gift entry — DB dependency binding (Gate-8 boundary).
 *
 * The pure orchestration (`recordOfflineContribution`), the §9.3 contract, and
 * the receipt/anonymity logic are all built and unit-tested. What remains is
 * binding the three side-effects to real infra, and that is deliberately NOT
 * done here because it depends on changes that are NOT yet landed and MUST go
 * through human sign-off:
 *
 *   1. The Track B §8.1 migration (adds `donor_identity_status`,
 *      `receipt_status`, `entered_by_user_id`, `anonymous_to_*` to `donations`).
 *   2. Extending `CONTRIBUTION_ACTION_TYPES` with `offline_gift_entry` and the
 *      `sourceSurface` enum with `offline`.
 *   3. A donor create/match resolver keyed on (tenant, normalized email) that
 *      does NOT leak donor existence, plus the shared
 *      `appendContributionOperationAuditEvent` audit write.
 *
 * Writing gift/money truth is a protected area (charter Gate 4 + Gate 8), so
 * until the migration + enum extension land and a maintainer wires these deps
 * against live infra, the route surfaces a precise 501 rather than inventing a
 * blind insert against columns that do not exist yet.
 *
 * See proposals/track-b/OFFLINE_GIFT_ENTRY_DESIGN.md §5 (BLOCKED-FOR-LATER).
 */
export const OFFLINE_ENTRY_UNBOUND_MESSAGE =
  "Offline gift entry persistence is not yet enabled: it requires the Track B " +
  "§8.1 donations migration, the offline_gift_entry/offline enum extension, and " +
  "a maintainer to bind the donor resolver + insert + audit deps (Gate 8).";

class OfflineEntryUnboundError extends ApiHttpError {
  constructor() {
    super(501, OFFLINE_ENTRY_UNBOUND_MESSAGE);
    this.name = "OfflineEntryUnboundError";
  }
}

/**
 * Build the injected side-effects for {@link recordOfflineContribution}.
 *
 * `supabaseAdmin` is threaded through so the maintainer PR only has to fill the
 * three function bodies (donor resolve/create, `donations` insert with the §8.1
 * columns, and `appendContributionOperationAuditEvent`) — the route, gate,
 * validation, and orchestration around them are already wired and tested.
 */
export function createOfflineEntryDependencies(
  supabaseAdmin: AdminSupabaseClient,
): OfflineEntryDependencies {
  // Intentionally unbound until the Gate-8 maintainer PR fills the three bodies
  // against `supabaseAdmin` (see the module doc above). Referenced so the client
  // stays threaded through the signature without a dead-parameter lint warning.
  void supabaseAdmin;
  return {
    resolveKnownDonor: async () => {
      throw new OfflineEntryUnboundError();
    },
    insertContribution: async () => {
      throw new OfflineEntryUnboundError();
    },
    appendAudit: async () => {
      throw new OfflineEntryUnboundError();
    },
  };
}
