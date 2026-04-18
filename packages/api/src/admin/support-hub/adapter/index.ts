/**
 * Single swap point for the Support Hub server-side data layer.
 *
 * Phase 7 — `inMemorySupportHubAdapter` is the sole implementation. It is
 * seeded from the donor-care fixtures in `./fixtures.ts` (kept separate
 * from the `"use client"` TanStack DB collections in
 * `packages/database/collections/support-hub.ts` so the server-side
 * adapter never crosses the RSC boundary) and persists across requests
 * within the running process.
 *
 * **TODO(Phase 8):** the UI does **not** call this adapter today —
 * `apps/admin/features/support-hub/**` reads + writes the in-memory
 * TanStack DB collection directly through Phase 2's hooks. To activate
 * the swap:
 *
 *   1. Land `supabase/migrations/<ts>_support_hub_foundation.sql` (Phase 1
 *      §3.4 schema + Phase 6 additions) and the matching RLS policies.
 *   2. Author `./supabase.ts` against `getAdminClient()` from
 *      `@asym/database/supabase/admin` and replace the right-hand side of
 *      the `supportHubAdapter` export below.
 *   3. Wire `routeInboundToSupportHub()` into the `email.received`
 *      branch of `packages/api/src/email/webhooks/resend.ts` (a
 *      grep-able TODO marks the spot today).
 *   4. Replace each `useSupportXxxLive` hook with `useQuery` against the
 *      route handlers under `apps/admin/app/api/admin/support/**` (or
 *      keep the live collections as a client-side cache + add a sync
 *      mechanism that hydrates them from the API).
 *
 * See `docs/features/support-hub/final-audit-and-wrap-up.md` for the full
 * source-of-truth + production-readiness analysis and the file-by-file
 * Phase 8 follow-up checklist.
 */

import { inMemorySupportHubAdapter } from "./in-memory";

export const supportHubAdapter = inMemorySupportHubAdapter;

export type { SupportHubAdapter } from "./types";
export type {
  AddPrivateNoteInput,
  AssignConversationInput,
  SaveAutomationRuleInput,
  SaveBusinessHoursInput,
  SaveCannedResponseInput,
  SaveInboxSettingsInput,
  SaveLabelInput,
  SaveMacroInput,
  SaveNotificationPreferencesInput,
  SaveSavedViewInput,
  SaveSignatureInput,
  SaveSlaPolicyInput,
  SaveTeamInput,
  SendReplyInput,
  SetConversationPriorityInput,
  SetConversationStatusInput,
  SnoozeConversationInput,
  SupportConversationFilter,
  ToggleAutomationRuleInput,
  ToggleConversationLabelInput,
  UnsnoozeConversationInput,
} from "./types";

export { __resetInMemorySupportHubStore } from "./in-memory";
