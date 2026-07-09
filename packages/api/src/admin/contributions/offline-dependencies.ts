import { type getAdminClient } from "@asym/database/supabase/admin";

import { ApiHttpError } from "../../shared/http-errors";

import type { OfflineEntryDependencies } from "./offline-entry";

type AdminSupabaseClient = Exclude<
  ReturnType<typeof getAdminClient>["client"],
  null
>;

/**
 * Offline gift entry DB dependency binding (Gate-8 boundary).
 *
 * The pure orchestration (`recordOfflineContribution`), the section 9.3
 * contract, and the receipt/anonymity logic are built and unit-tested. What
 * remains is binding the side effects to real infra, and that is deliberately
 * not done here because it depends on changes that are not yet landed and must
 * go through human sign-off:
 *
 *   1. The Track B section 8.1 migration (adds `donor_identity_status`,
 *      `receipt_status`, `entered_by_user_id`, `anonymous_to_*` to `donations`).
 *   2. Extending `CONTRIBUTION_ACTION_TYPES` with `offline_gift_entry` and the
 *      `sourceSurface` enum with `offline`.
 *   3. A donor create/match resolver keyed on (tenant, normalized email) that
 *      does not leak donor existence, plus an atomic contribution+audit write.
 *
 * Writing gift/money truth is a protected area (charter Gate 4 + Gate 8), so
 * until the migration + enum extension land and a maintainer wires these deps
 * against live infra, the route surfaces a precise 501 rather than inventing a
 * blind insert against columns that do not exist yet.
 *
 * See proposals/track-b/OFFLINE_GIFT_ENTRY_DESIGN.md section 5
 * (BLOCKED-FOR-LATER).
 */
export const OFFLINE_ENTRY_UNBOUND_MESSAGE =
  "Offline gift entry persistence is not yet enabled: it requires the Track B " +
  "section 8.1 donations migration, the offline_gift_entry/offline enum " +
  "extension, and a maintainer to bind the donor resolver + atomic insert/audit " +
  "deps (Gate 8).";

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
 * donor resolver plus one atomic contribution+audit write. The route, gate,
 * validation, and orchestration around them are already wired and tested.
 */
export function createOfflineEntryDependencies(
  _supabaseAdmin: AdminSupabaseClient,
): OfflineEntryDependencies {
  // Intentionally unbound until the Gate-8 maintainer PR wires these closures
  // against `_supabaseAdmin` (see the module doc above).
  return {
    resolveKnownDonor: async () => {
      throw new OfflineEntryUnboundError();
    },
    recordContributionWithAudit: async () => {
      throw new OfflineEntryUnboundError();
    },
  };
}
