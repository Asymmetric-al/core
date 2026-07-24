# Phase 17 System-Message Census — 2026-07-19

- **Program:** SiteStacker Parity
- **Phase:** 17 — System Messages & Template Management (`system-messages`)
- **Status:** planning census closed; implementation and Live activation not started
- **Runtime baseline revision:** `fb5f1bfeb4378bc16bbe036a22975cb3f4c600a4`
- **Planning-package baseline:** the Git-tracked Phase 17 files in this change;
  their reviewed commit and blob ids freeze the exact package
- **Normative product companions:** [Phase 17 PRD](./phase-17-system-messages-template-management.md),
  [executable manifest](./phase-17-system-message-executable-manifest.md), and
  the active `outbound-communications` OpenSpec delta
- **Informative evidence:** [research appendix](./phase-17-system-messages-template-management-research-evidence.md)
- **Phase 19 amendment (2026-07-24):** the three former generic statement
  planning keys are replaced by five finite Phase 19 meanings; this census now
  contains 18 Target Live candidates and 20 Reserved keys

## Purpose and Truth Posture

This is the durable M0 inventory required by D16. It answers four different questions without collapsing them:

1. What actually sends, binds, or records outbound email in the observed repository?
2. Which stable message meanings are planned for Phase 17?
3. Which product-message obligations have a deliberate key or deferral?
4. What must a mechanical closure gate prove before any key becomes Live?

The answers below are **specified**, not implemented. “Target Live” is a delivery target, not current runtime truth. All 38 planning keys begin `Reserved`; a Target Live candidate becomes `Live` only after its complete key-specific proof pack passes. No row below proves a producer has migrated, a tenant is ready, a provider submission is safe, or a feature is available.

Every one of the 18 Target Live keys in this census is explicitly tenant scope
through its named executable-manifest profile. None may infer scope from a
recipient or publication. Eve/platform-operator meanings remain deferred until
an exact platform profile and stable key pass the separate platform-scope proof
gate. Asym customer-account bootstrap/security mail is also deferred, but it is
not an Eve recipient branch: its future owner must define a separate verified
app-account recipient/trigger authority before it can enter the catalog.

The runtime SHA is intentionally separate from the planning-package commit. Code
anchors describe what was observed at that runtime baseline; the checked-in
planning package records the proposed disposition. Neither substitutes for a
census at the implementation branch head. M0, every key activation, and final
Phase 17 release must record the actual code SHA, catalog generation, manifest
hash, census-tool version, allow-list hash, sorted result hash, and result.

### Reproducible scan protocol

The M0 implementation must turn this dated manual scan into a checked-in script
that follows this exact protocol:

1. Scan Git-tracked files at one recorded commit; never combine unstaged or
   ignored files with the result.
2. Include `apps/**`, `packages/**`, `supabase/**`, `openspec/**`, and
   `docs/prds/sitestacker-parity/**`. Exclude `.git`, dependency/build/cache
   directories, coverage, and `.scratch`. Keep tests/fixtures/examples as a
   separate classified input set rather than silently discarding them.
3. Search, at minimum, Resend construction and every individual/batch send or
   receive method; `sendEmail` definitions/imports/callers; product notification
   writers; receipt/correction/approval senders; template/binding reads;
   `email_send_logs`, `email_events`, `notification_queue`; Supabase Auth hook
   configuration; webhook routes; scheduled/background producers; inbound
   seams; test sends; canaries; and provider/template identifiers.
4. Normalize paths to repository-relative `/` form, sort rows by path/symbol,
   deduplicate exact matches, and require one reviewed disposition for every
   result. The allow-list is explicit, versioned, and hashed; `Unknown` fails.
5. Emit the scan command/tool version, include/exclude sets, pattern-set hash,
   allow-list hash, row count, sorted-result SHA-256, and repository commit. A
   rerun with the same inputs must reproduce the same hash.

Every direct-send/tooling allow-list entry, including a documentation example
or test fixture, records its exact path/symbol, one closed allow-list class
(`nonproduction_documentation` or `nonproduction_test_fixture`), accountable
owner, `reviewed_at`, mandatory `review_trigger`, and exactly one of
`expires_at` or an explicit `review_reason`. A review-reason entry is re-approved at M0, every
catalog activation, and final release, and is invalidated immediately by a
path, content, import-graph, or production-bundle-reachability change. The entry
exempts only the proved nonproduction example or fixture; it never authorizes
runtime provider I/O.

The initial implementation PR must check in that script and its first immutable
output before any contract becomes Live. A later runtime writer, changed scan
input, or hash drift invalidates the prior closure result and blocks activation
until reviewed.

## Census Row Vocabulary

Every discovered item receives exactly one disposition:

- `target_live_candidate` — stable key is planned to become Live only after exact proof;
- `reserved` — stable meaning exists but no Phase 17 send/readiness/publication path may exist yet;
- `retired` — historical meaning only; new intent is rejected;
- `operational_test` — connection/template/canary operation, not a product message;
- `human_authored_external` — owned by its human-message product, not this catalog;
- `inbound_owned_elsewhere` — inbound/reply ingestion owned by Phase 26;
- `history_only_alias` — legacy family/variant retained only for truthful migration/history;
- `deferred_with_owner` — obligation is inventoried but lacks a proved occurrence contract;
- `not_a_message` — a dashboard/source projection, not a communication occurrence;
- `remove_or_retire` — no current producer or valid future authority is proved.

`Unknown` is never a shippable disposition.

## Current Runtime Send, Binding, and History Census

The dated search covered Resend construction and send methods, `sendEmail` imports and callers, receipt/correction/approval writers, template and binding readers, provider webhooks, Supabase Auth email-hook configuration, scheduled/background senders, `notification_queue`, and outbound/inbound history tables. Tests are retained as explicit operational rows rather than silently discarded.

| Row       | Exact baseline repository anchor and symbol                                                                                                                                                                                                       | Observed role                                                                                         | Disposition               | Required closure                                                                                                                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RUN-001` | `packages/email/resend.ts:112` `createResendClientInstance`; `packages/email/resend.ts:815` `validateResendApiKey`; `packages/email/resend.ts:944` `sendEmail`                                                                                    | Sole located Resend SDK construction/send/key-validation primitive                                    | `not_a_message`           | Retain as the sole Resend-only adapter behind Phase 6/17 preparation and connection operations. It owns no product meaning, content resolution, sender choice, credential custody, or tenant authorization; architecture CI rejects other runtime SDK construction/send.                   |
| `RUN-002` | `packages/api/src/giving/receipts.ts:310` `deliverReceiptEmailForGift`; `:429` `sendStagedGiftReceipt`; `:468` `sendUpdatedReceiptSnapshotEmail`                                                                                                  | Successful and replacement/updated receipt content, send, consent skip, and send-log persistence      | `target_live_candidate`   | Migrate one source occurrence at a time to `giving_receipt_issued_v1` and `giving_receipt_replaced_v1`; Phase 7 artifact/currentness remains authoritative and old/new writers never both send one occurrence.                                                                             |
| `RUN-003` | `packages/api/src/admin/contribution-operations/notifications/send.ts:391` `sendContributionCorrectionNotification`                                                                                                                               | Current contribution-correction render/send variants                                                  | `target_live_candidate`   | Replace direct content authority with exact Target Live correction contracts while preserving mutually exclusive generic/partial/full-refund predicates and contract-specific no-fallback behavior.                                                                                        |
| `RUN-004` | `packages/api/src/admin/contribution-operations/notifications/store.ts:181` `readActiveTemplateBinding`; `:368` `sendContributionCorrectionNotificationFromSupabase`                                                                              | Legacy family/variant binding resolver                                                                | `history_only_alias`      | Treat as a one-way read-only migration/history adapter. It grants no lifecycle, readiness, publication, recipient, or send authority.                                                                                                                                                      |
| `RUN-005` | `packages/api/src/admin/contribution-operations/approval-notifications.ts:99` `planApprovalNotifications`; `:443` `ensureCorrectionApprovalWorkflow`; `:600` `recordCorrectionApprovalOutcome`; `:727` `processCorrectionApprovalSla`             | Approval request/reminder/escalation/outcome in-product and email planning                            | `target_live_candidate`   | Map only proved source occurrences to the four Target Live approval keys. Source state remains completion truth; read/archive/email delivery never approves or resolves work.                                                                                                              |
| `RUN-006` | `packages/api/src/admin/contribution-operations/approval-notification-email.ts:155` `deliverApprovalEmailNotifications`                                                                                                                           | Email sibling for planned approval notifications                                                      | `target_live_candidate`   | Convert to an optional contract-declared email step alongside required in-product truth and preserve exact eligible-role recipient and semantic identity.                                                                                                                                  |
| `RUN-007` | `packages/api/src/admin/mission-control-automations/adapters.ts:27` `sendContributionCorrectionNotification`                                                                                                                                      | Existing automation caller seam                                                                       | `not_a_message`           | Inventory as a caller, not a workflow/send platform. Phase 34 may invoke a Live governed action but cannot bypass the contract or own Phase 17 execution.                                                                                                                                  |
| `RUN-008` | `packages/api/src/email/test-send.ts:67` `POST`                                                                                                                                                                                                   | Resend connection test                                                                                | `operational_test`        | Keep outside donor/system-message catalog and ordinary history; retain only minimized connection-readiness proof.                                                                                                                                                                          |
| `RUN-009` | `packages/api/src/email/template-test-send.ts:154` `sendTemplateTestEmail`; `:387` `POST_STORED_TEMPLATE`                                                                                                                                         | Synthetic template test send                                                                          | `operational_test`        | Use approved synthetic fixtures, visibly mark test output, and keep it outside recipient product-message history.                                                                                                                                                                          |
| `RUN-010` | `packages/api/src/email/webhooks/resend.ts:85` `insertEmailEvent`; `:702` outbound event reduction                                                                                                                                                | Signed outbound provider-evidence reducer                                                             | `not_a_message`           | Evolve into one per-connection raw-signature, replay-safe, same-scope reducer whose connection revision derives the exact owner. It creates no product meaning and authorizes no replacement send.                                                                                         |
| `RUN-011` | `apps/admin/app/api/email/webhooks/resend/route.ts:1` exported `POST`                                                                                                                                                                             | Route exposing the Resend webhook adapter                                                             | `not_a_message`           | Keep one route per proved connection authority. Route existence alone proves no secret revision, region, owner binding, event mapping, or readiness.                                                                                                                                       |
| `RUN-012` | `packages/api/src/email/template-store.ts:14-16` `EMAIL_TEMPLATES_TABLE`, `EMAIL_TEMPLATE_VERSIONS_TABLE`, `EMAIL_TEMPLATE_SYSTEM_BINDINGS_TABLE`                                                                                                 | Mutable template head, immutable versions, and legacy binding CRUD                                    | `not_a_message`           | Migrate to canonical structured drafts, immutable publications, and generated trigger projections; preserve truthful legacy history and never treat `is_active` as Live/readiness.                                                                                                         |
| `RUN-013` | `supabase/migrations/20260611151000_contribution_correction_notifications.sql:3` `email_template_system_bindings`                                                                                                                                 | Service-only tenant/family/variant binding                                                            | `history_only_alias`      | Retain only as the one-way history alias after exact stable-key cutover; never use as generalized registry or activation authority.                                                                                                                                                        |
| `RUN-014` | `supabase/schema.sql:295` `email_send_logs`; `:378` `email_events`; `supabase/migrations/20260402090000_resend_email_foundation_backfill.sql:101`                                                                                                 | Existing outbound send-log and provider-event evidence stores                                         | `not_a_message`           | Migrate/minimize into the one Phase 6/17 history spine under D14, retaining truthful linkage without a second history authority.                                                                                                                                                           |
| `RUN-015` | `supabase/schema.sql:486,1312` `notification_queue`; `supabase/migrations/20260214090000_foundation_1_schema.sql:36`; `supabase/migrations/20260226113000_authz_memberships_foundation.sql:313`                                                   | Legacy queue with conflicting schema-snapshot/migration RLS evidence and no located production worker | `remove_or_retire`        | Do not revive it. Verify deployed state and Data-API reachability, classify/migrate any proved required data, then retire through a separate safe schema change or prove one bounded non-transport owner.                                                                                  |
| `RUN-016` | `supabase/config.toml` complete-file negative scan: no active `[auth.hook.send_email]` stanza                                                                                                                                                     | No active custom Send Email Hook located                                                              | `reserved`                | Supabase Auth meanings stay Reserved until D6's raw-body signed hook and complete action/recipient mapping are implemented and proved.                                                                                                                                                     |
| `RUN-017` | `packages/api/src/workflows/adapters/inbound-email.ts:26` `INBOUND_TABLE`; `:55` `loadInboundEmailForWorkflow`                                                                                                                                    | Inbound-provider workflow adapter                                                                     | `inbound_owned_elsewhere` | Phase 26 owns inbound/reply ingestion and bodies; no inbound row creates Phase 17 outbound meaning.                                                                                                                                                                                        |
| `RUN-018` | `packages/email/README.md:8-14` `sendEmail` example                                                                                                                                                                                               | Documentation example                                                                                 | `not_a_message`           | Allow-list class `nonproduction_documentation`; owner: Phase 6 email-adapter maintainer; reviewed 2026-07-19; review reason: document the sole adapter API; review at every closure and on any path/content/import/bundle-reachability change. Runtime reachability invalidates the entry. |
| `RUN-019` | `tests/unit/packages/email/resend.test.ts:36` and later `sendEmail` fixtures                                                                                                                                                                      | Provider adapter unit fixtures                                                                        | `operational_test`        | Allow-list class `nonproduction_test_fixture`; owner: Phase 6 email-adapter maintainer; reviewed 2026-07-19; review reason: exercise the sole adapter; review at every closure and on any path/content/import/bundle-reachability change. Runtime reachability invalidates the entry.      |
| `RUN-020` | `packages/api/src/admin/support-hub/mutations/conversations.ts:73` `sendSupportReply`; `packages/api/src/admin/support-hub/adapter/supabase.ts:602` `outbound_send_log_id`; `supabase/migrations/20260515025814_support_hub_core_modules.sql:297` | Human-authored Support Hub correspondence and historical outbound linkage                             | `human_authored_external` | Support Hub owns the human message and body. Its history FK does not grant Phase 17 product meaning or template authority.                                                                                                                                                                 |
| `RUN-021` | `packages/api/src/email/webhooks/resend.ts:554,651,759` `email.received` branches                                                                                                                                                                 | Signed inbound Resend-event path                                                                      | `inbound_owned_elsewhere` | Phase 26 owns inbound message ingestion. Share verified connection evidence where appropriate, but never treat inbound content as a Phase 17 System message.                                                                                                                               |
| `RUN-022` | `apps/admin/app/api/email/connect/route.ts:1` exported `POST`/`DELETE`; `packages/api/src/email/connect.ts:193` `POST`, `:280` `DELETE`; `packages/api/src/email/settings-store.ts:155` `upsertTenantEmailSettings`                               | Tenant Resend connection validation, credential/settings write, and disconnect path                   | `not_a_message`           | Replace or migrate through D10's tenant-owned connection aggregate and revisioned encrypted-secret custody. Preserve a six-step saved-progress setup and explicit disconnect semantics; this path grants no message meaning, readiness, sender choice, or cross-tenant credential access.  |
| `RUN-023` | `packages/api/src/email/webhooks/resend.ts:713` `email_suppressions.upsert` with `source: "resend"` and unique `(tenant_id,email,suppression_type)`                                                                                               | Provider bounce/complaint/suppressed events write tenant email-suppression evidence                   | `not_a_message`           | Preserve as an explicit Phase 3 contactability/suppression writer behind the signed same-connection reducer. Bind it to the exact tenant, address revision, event, cause, and provenance; make replay idempotent; never let suppression data choose scope or fabricate message meaning.    |

### Runtime Search Conclusion

At this dated baseline, the located production email writer chain converges on
`packages/email/resend.ts::sendEmail`; product content is currently authored by
receipts, contribution-correction notifications, and approval-email code. The
tenant connection route/settings store owns current Resend setup writes, and the
signed outbound webhook currently writes provider-derived suppression evidence
to `email_suppressions`. The census found no active Supabase custom Send Email
Hook and no production `notification_queue` worker. These are bounded
observations, not permanent truths. A changed codebase invalidates the conclusion
until the mechanical census is rerun.

## Thirty-Eight-Key Planning Catalog

There are exactly 18 Target Live candidates and 20 Reserved keys in this planning generation. There are zero fresh-build Retired keys. Runtime lifecycle is initially `Reserved` for every row.

### Target Live Candidates — Initially Reserved

| Row       | Stable key                                        | Owner/source meaning                                                  | Required activation proof focus                                                                                                      |
| --------- | ------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `KEY-L01` | `giving_receipt_issued_v1`                        | Phase 7 successful receipt from an immutable current receipt artifact | Receipt tracer; legal recipient, protected receipt facts/action, required email, Giving sender/reply purpose, no engagement-as-truth |
| `KEY-L02` | `giving_receipt_replaced_v1`                      | Phase 7 replacement receipt                                           | Supersession identity and current artifact; prior history immutable                                                                  |
| `KEY-L03` | `contribution_refund_failed_v1`                   | Terminal failed refund operation                                      | Failed is not refunded; no raw decline; support action; no false money movement                                                      |
| `KEY-L04` | `contribution_refund_completed_v1`                | Completed refund with unspecified refund kind                         | Generic predicate excludes known partial/full occurrences; amount/date/finality protected                                            |
| `KEY-L05` | `contribution_partial_refund_completed_v1`        | Completed partial refund                                              | Original/refund/remainder source facts and mutually exclusive predicate                                                              |
| `KEY-L06` | `contribution_full_refund_completed_v1`           | Completed full refund                                                 | Source-confirmed zero remainder/finality and receipt impact                                                                          |
| `KEY-L07` | `contribution_amount_corrected_v1`                | Posted contribution amount corrected                                  | Old/new money and artifact consequence source-owned                                                                                  |
| `KEY-L08` | `contribution_designation_changed_v1`             | Posted designation corrected                                          | Previous/current designation subject to recipient privacy projection                                                                 |
| `KEY-L09` | `contribution_receipt_corrected_v1`               | Contribution-correction operation produced a receipt artifact         | Exact Phase 7 artifact action; mutually exclusive with generic replacement for one source identity                                   |
| `KEY-L10` | `contribution_payment_state_corrected_v1`         | Provider-confirmed payment truth corrected                            | Old/new state, finality, receipt/statement impact; no inferred settlement                                                            |
| `KEY-L11` | `contribution_donor_relinked_v1`                  | Contribution Party association corrected                              | Permitted affected recipient; no previous/new Party identity disclosure                                                              |
| `KEY-L12` | `contribution_approval_requested_v1`              | Approval requires staff attention                                     | Exact eligible approver role; required in-product item; source task owns completion                                                  |
| `KEY-L13` | `contribution_approval_reminder_v1`               | Existing approval remains due at producer-owned reminder point        | No tenant timer, duplicate task, or fabricated urgency                                                                               |
| `KEY-L14` | `contribution_approval_escalated_v1`              | Producer marks approval escalated                                     | Exact escalation recipient and state; no automatic approval                                                                          |
| `KEY-L15` | `contribution_approval_outcome_v1`                | Requester receives final approval decision                            | Exact requester/decision; notification engagement changes nothing                                                                    |
| `KEY-L16` | `system_message_publication_review_requested_v1`  | Protected publication candidate needs independent review              | Exact Phase 12 reviewer, immutable candidate, in-product action, no approval by email click                                          |
| `KEY-L17` | `system_message_publication_changes_requested_v1` | Reviewer requested changes                                            | Exact candidate/editors and metadata; comment/body stays on authorized surface                                                       |
| `KEY-L18` | `system_message_delivery_needs_attention_v1`      | D10/D15 repair case meaningfully changed                              | Grouped cause/owner/action; required in-product path independent of broken email; no credentials/content                             |

### Reserved Planning Keys — No Runtime Path

| Row       | Stable key                              | Owner/source meaning                                  | Blocker before Live consideration                                                       |
| --------- | --------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `KEY-R01` | `statement_current_updated_v1`          | Meaningful exact-current statement successor          | Source/exposure proof, exact current artifact, authorized recipient and safe meaning    |
| `KEY-R02` | `recurring_recovery_started_v1`         | Phase 16 card recovery episode began                  | Exact Phase 16 source facts, recipient, consent, and occurrence contract                |
| `KEY-R03` | `recurring_action_required_v1`          | Donor payment action required                         | Producer-owned D6 action, no raw decline, exact recovery state                          |
| `KEY-R04` | `recurring_occurrence_missed_v1`        | One recurring occurrence is terminally missed         | D8/D16 role-safe steps, no debt/backcharge, no per-attempt missionary noise             |
| `KEY-R05` | `recurring_payment_truth_corrected_v1`  | Recurring payment truth corrected                     | Provider-confirmed correction and Phase 7 artifact consequences                         |
| `KEY-R06` | `recurring_ach_initiated_v1`            | ACH occurrence initiated/processing                   | Processing must not be called received; official receipt waits for success              |
| `KEY-R07` | `recurring_upcoming_charge_v1`          | Required upcoming semiannual/annual charge notice     | Contract-declared cadence/notice law and amount/date/manage facts                       |
| `KEY-R08` | `recurring_schedule_changed_v1`         | Recurring arrangement changed                         | Effective dates, in-flight behavior, and provider-sync truth                            |
| `KEY-R09` | `fixed_pledge_upcoming_v1`              | Optional fixed-pledge expectation upcoming            | Gentle enrolled profile; no debt or cash claim                                          |
| `KEY-R10` | `fixed_pledge_source_aware_followup_v1` | No applied gift after enrolled expectation            | Processing/matching uncertainty and stop-purpose action                                 |
| `KEY-R11` | `identity_account_claim_invitation_v1`  | Phase 4 legacy account-claim invitation               | Fresh invitation authority, D6 protected handoff, expiry/revocation                     |
| `KEY-R12` | `identity_magic_link_v1`                | Supabase magic-link sign-in                           | Signed hook, exact tenant/recipient/action mapping, five-second budget                  |
| `KEY-R13` | `identity_email_otp_v1`                 | Supabase email OTP                                    | Exact adopted auth flow, secret exclusion, producer-owned rate/expiry                   |
| `KEY-R14` | `identity_password_recovery_v1`         | Supabase password recovery                            | Scanner-resistant landing, fresh proof, terminal-state contract                         |
| `KEY-R15` | `identity_email_change_v1`              | Supabase secure/non-secure email-change confirmation  | Old/new recipient cardinality and exact token/hash mapping                              |
| `KEY-R16` | `document_artifact_ready_v1`            | Phase 18 immutable artifact ready                     | Artifact-owner recipient and protected authenticated download                           |
| `KEY-R17` | `statement_current_available_v1`        | Ordinary frozen current-statement delivery occurrence | Frozen occurrence, exact current artifact, recipient and delivery contract              |
| `KEY-R18` | `statement_current_withdrawn_v1`        | Current statement withdrawn without a successor       | Source-owned withdrawal, purpose/jurisdiction admission, safe contextual help           |
| `KEY-R19` | `statement_additional_copy_ready_v1`    | Fresh exact-current additional-copy fulfillment       | Fresh copy identity, exact current authority, no lifecycle replay or rerender           |
| `KEY-R20` | `statement_delivery_attention_v1`       | Grouped statement-delivery condition needs staff care | Actionable cause/owner contract, in-product path, no donor failure message or raw cause |

## Forty-One Product-Obligation and Disposition Categories

This table is an obligation inventory, not permission to mint speculative keys. `Coming later` visibility is quiet and read-only; deferred rows have no tenant editor, binding, preview, readiness control, or runtime send path.

| Row       | Product meaning                                                      | Source/owner anchor                                    | Disposition                                                                                                              | Blocker or migration rule                                                                                                                                                                                                                                       | Tenant visibility                      |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `OBL-001` | Account claim invitation                                             | Phase 4 PRD and `identity_account_claim_invitation_v1` | Reserved key                                                                                                             | Exact invitation producer, recipient, expiry, revocation, D6 handoff                                                                                                                                                                                            | Coming later                           |
| `OBL-002` | Magic link and adopted email OTP                                     | Supabase Auth plus Phase 4                             | Two Reserved keys                                                                                                        | Signed Send Email Hook and exact action/recipient map                                                                                                                                                                                                           | Coming later                           |
| `OBL-003` | Password recovery                                                    | Supabase Auth plus Phase 4                             | Reserved key                                                                                                             | Scanner-resistant landing and fresh proof                                                                                                                                                                                                                       | Coming later                           |
| `OBL-004` | Email confirmation/change and reauthentication                       | Supabase Auth plus Phase 4                             | Email-change Reserved; other split deferred                                                                              | Secure/non-secure recipient/token/cardinality semantics must be proved                                                                                                                                                                                          | Coming later only for existing key     |
| `OBL-005` | Password/email/security change completed notice                      | Phase 4 or future security owner                       | Deferred with owner                                                                                                      | No stable producer/recipient occurrence proved                                                                                                                                                                                                                  | Hidden inventory                       |
| `OBL-006` | Staff/donor account invitation or membership change                  | Phases 4/12                                            | Deferred with owner                                                                                                      | Separate authorization notice from marketing; prove exact recipient                                                                                                                                                                                             | Hidden inventory                       |
| `OBL-007` | Donor profile/address/contact change confirmation                    | Donor self-service owner                               | Deferred with owner                                                                                                      | Source command and security consequence not fixed                                                                                                                                                                                                               | Hidden inventory                       |
| `OBL-008` | One-time gift acknowledgement                                        | Phases 7/13                                            | Deferred with owner                                                                                                      | Must be distinct from official receipt and have an emitted occurrence                                                                                                                                                                                           | Hidden inventory                       |
| `OBL-009` | Successful gift receipt                                              | Phase 7                                                | `giving_receipt_issued_v1` Target Live candidate                                                                         | Receipt tracer and complete Live proof                                                                                                                                                                                                                          | Messages only after Live               |
| `OBL-010` | Receipt replacement, correction, void, supersession                  | Phase 7                                                | Replacement/correction candidates; other meanings deferred                                                               | Distinct mutually exclusive artifact occurrences; no history mutation                                                                                                                                                                                           | Eligible key only                      |
| `OBL-011` | Refund, return, chargeback, payment-state correction                 | Phase 13/contribution operations                       | Enumerated correction candidates; missing meanings deferred                                                              | Do not conflate provider events or refund variants                                                                                                                                                                                                              | Eligible key only                      |
| `OBL-012` | ACH initiated/processing confirmation                                | Phase 13 or 16 by occurrence                           | Recurring key Reserved; one-time deferred                                                                                | Owner must distinguish initiation, settlement, return                                                                                                                                                                                                           | Coming later                           |
| `OBL-013` | ACH success/failure/return                                           | Phases 13/16 plus 7                                    | Receipt/correction action; no generic success key                                                                        | Avoid duplicate receipt and false finality                                                                                                                                                                                                                      | Hidden inventory                       |
| `OBL-014` | Recurring arrangement created/confirmed                              | Phase 16                                               | Deferred unless exact producer contract exists                                                                           | Do not infer a key from UI confirmation                                                                                                                                                                                                                         | Hidden inventory                       |
| `OBL-015` | Recurring schedule/amount/destination/end changed                    | Phase 16                                               | `recurring_schedule_changed_v1` Reserved                                                                                 | Exact effective/in-flight/provider-sync facts                                                                                                                                                                                                                   | Coming later                           |
| `OBL-016` | Recurring skipped, paused, resumed, canceled                         | Phase 16                                               | Source/context projection; email key deferred                                                                            | Stable separate email meaning must be emitted and owned                                                                                                                                                                                                         | Hidden inventory                       |
| `OBL-017` | Recurring recovery/action required/missed/corrected                  | Phase 16                                               | Four Reserved keys                                                                                                       | D7/D8/D15 contracts, exact Party/role and no backcharge truth                                                                                                                                                                                                   | Coming later                           |
| `OBL-018` | Upcoming recurring charge                                            | Phase 16                                               | Reserved key                                                                                                             | Only contract-declared cadences and required notice facts                                                                                                                                                                                                       | Coming later                           |
| `OBL-019` | Payment method updated/expiring/unusable                             | Phase 16/payment-method owner                          | Deferred except action-required overlap                                                                                  | Exact source state/action; no raw provider event as meaning                                                                                                                                                                                                     | Hidden inventory                       |
| `OBL-020` | Fixed pledge upcoming/source-aware follow-up                         | Phase 16                                               | Two Reserved keys                                                                                                        | Explicit enrollment, gentle profile, no debt claim                                                                                                                                                                                                              | Coming later                           |
| `OBL-021` | Missionary recurring pause visibility                                | Phase 16 dashboard                                     | Not a message                                                                                                            | Keep as source projection; no catalog/runtime intent                                                                                                                                                                                                            | Not in Messages                        |
| `OBL-022` | Missionary terminal recurring miss                                   | Phase 16 plus D8                                       | In-product step of exact missed contract                                                                                 | Terminal occurrence only; no per-attempt email/noise                                                                                                                                                                                                            | Coming later with parent key           |
| `OBL-023` | DAF/tribute/matching/church recognition acknowledgement              | Phase 14                                               | Deferred with owner                                                                                                      | Exact recognition occurrence and legal recipient missing                                                                                                                                                                                                        | Hidden inventory                       |
| `OBL-024` | Artifact ready/download notice                                       | Phase 18                                               | Reserved key                                                                                                             | Immutable artifact, recipient, D6 download action                                                                                                                                                                                                               | Coming later                           |
| `OBL-025` | Statement available/update/withdrawal/copy/delivery attention        | Phases 18/19 plus 7                                    | Five finite Phase 19 Reserved keys                                                                                       | Exact producer meaning, artifact/currentness, legal recipient, purpose, exposure, and delivery-attention proof                                                                                                                                                  | Coming later for existing keys         |
| `OBL-026` | Annual tax summary or other official document delivery               | Phases 18/19                                           | Deferred with owner                                                                                                      | Document class, jurisdiction, legal recipient not fixed                                                                                                                                                                                                         | Hidden inventory                       |
| `OBL-027` | Contribution correction approval request/reminder/escalation/outcome | Contribution operations                                | Four Target Live candidates                                                                                              | Exact source predicates, eligible role, required in-product projection                                                                                                                                                                                          | Messages after Live                    |
| `OBL-028` | Generic staff assignment or mention                                  | Owning CRM/workflow phase                              | Deferred with owner                                                                                                      | Typed source/destination absent; D8 is presentation only                                                                                                                                                                                                        | Hidden inventory                       |
| `OBL-029` | Task deadline/overdue/escalation                                     | Phase 34 or owning domain                              | Deferred with owner                                                                                                      | Producer owns clock/completion; no generic timer key                                                                                                                                                                                                            | Hidden inventory                       |
| `OBL-030` | Workflow form/file/reference request                                 | Phase 34                                               | Deferred with owner                                                                                                      | Future workflow must call an already-Live typed contract                                                                                                                                                                                                        | Hidden inventory                       |
| `OBL-031` | Workflow stage/outcome notice                                        | Phase 34                                               | Deferred with owner                                                                                                      | No generic workflow-event key                                                                                                                                                                                                                                   | Hidden inventory                       |
| `OBL-032` | Support conversation assigned/replied/SLA/undelivered                | Phase 26                                               | System notices deferred; human body external                                                                             | Inbound/support owns content and reply state                                                                                                                                                                                                                    | Hidden inventory                       |
| `OBL-033` | Event registration/ticket/team/fundraiser notice                     | Future Event Hub                                       | Deferred with owner                                                                                                      | Product occurrence and recipient not fixed                                                                                                                                                                                                                      | Hidden inventory                       |
| `OBL-034` | Public form/content review/publish/domain change                     | Public-content phases                                  | Deferred with owner                                                                                                      | Exact producer/audience/action required                                                                                                                                                                                                                         | Hidden inventory                       |
| `OBL-035` | Campaign/newsletter/journey message                                  | Phases 32/34/35                                        | Human-authored external                                                                                                  | Outside system catalog unless invoking an already-Live system meaning                                                                                                                                                                                           | Not in Messages                        |
| `OBL-036` | Resend connection/domain/webhook/sender/reply problem                | Phase 17 D10/D15                                       | `system_message_delivery_needs_attention_v1` Target Live candidate                                                       | One grouped meaningful transition; in-product path independent of email                                                                                                                                                                                         | Messages after Live                    |
| `OBL-037` | Publication review/change request                                    | Phase 17 D11                                           | Two Target Live candidates                                                                                               | Exact immutable candidate and independent recipient                                                                                                                                                                                                             | Messages after Live                    |
| `OBL-038` | Import/export/transfer job completion/action needed                  | Phase 17 D19                                           | Contextual job state; key deferred                                                                                       | User evidence must prove a distinct attention event                                                                                                                                                                                                             | Hidden inventory                       |
| `OBL-039` | Eve platform-operator outage/security incident                       | Eve #436 plus Phase 17 email seam                      | Implementation-blocking deferral: this manifest generation contains zero Eve email keys; Discord remains Eve operational | Eve email is non-dispatchable until its producer enumerates each exact occurrence meaning/fence, a later manifest adds meaning-specific platform keys plus one platform profile, and every key passes its platform proof pack; generic `eve_alert` is forbidden | Hidden inventory                       |
| `OBL-040` | SMS STOP/HELP, registration, delivery                                | Later explicit SMS phase                               | Evidence only; no Phase 17 key/transport                                                                                 | D9 transport-dark launch gate must pass in later phase                                                                                                                                                                                                          | Not executable; settings evidence only |
| `OBL-041` | Asym customer-account bootstrap/security mail                        | Phase 5 boundary plus future platform identity owner   | Deferred with owner; not an Eve key or v1 platform-recipient branch                                                      | Define exact app-account source occurrence/fence, verified recipient authority, mutually exclusive platform union branch, stable keys, fixed publication/profile, and complete proof packs before intent creation                                               | Hidden inventory                       |

## Explicit Exclusions

The following are intentionally outside the system-message catalog:

- Eve's Discord operational-alert rendering, provider execution, and channel evidence. Eve email is deferred in this manifest generation: it has zero catalog keys and no dispatch path. A later Phase 17 catalog generation must own its platform-scoped fixed contract/publication/compiler, while Phase 6 owns recipient-specific preparation, Resend submission/reconciliation, and communication history.

- Resend connection tests, template tests, delivered canaries, preview renders, and review invitations that are operational rather than a cataloged product occurrence;
- human-authored support replies, newsletters, campaigns, stewardship journeys, missionary personal email, and other correspondence whose meaning is authored by a person;
- inbound email ingestion, mailbox access, thread reconstruction, and human-reply conversation state, owned by Phase 26;
- ordinary recurring payment success, which uses the Phase 7 receipt rather than a duplicate `recurring_success` key;
- dashboard-only missionary pause/health projections and source tasks whose visibility is not a message occurrence;
- transport-dark SMS execution, Twilio code/credentials/renderer/worker/bindings, and any claim that imported consent makes SMS sendable;
- arbitrary platform/operator alerts that have no named product owner, tenant recipient, or safe action; and
- current family/variant aliases after cutover, except as historical translation evidence.

`refund_started` is an orphan current type pending producer and history proof. It cannot alias `contribution_refund_failed_v1` or any completed-refund key. If no valid occurrence is proved, it is retired honestly rather than made Live by type existence.

## Fresh-Build and Activation Semantics

1. Catalog keys are code-governed and immutable in meaning. A material semantic change creates a successor key.
2. The fresh-build target contains 38 keys: 18 Target Live candidates, 20 Reserved, and zero Retired.
3. Database projection or UI presence never makes a key Live. `is_active`, a legacy binding, a published template, a provider template, or a tenant toggle is insufficient.
4. Reserved keys generate no tenant content row, binding, editor, preview, test send, readiness control, Phase 6 intent, provider submission, or product communication history.
5. Target Live candidates also begin Reserved. Activation is per exact catalog/contract generation and requires the complete source, recipient, fact, publication, locale, layout, sender, reply, plan, retention, recovery, migration, security, accessibility, and end-to-end proof bundle.
6. The receipt tracer activates first. No other Target Live key can use the tracer's proof as a substitute for its own producer/recipient/fact/action/step proof pack.
7. Current and immediately prior compatible manifest generations may coexist only for bounded deployment/recovery. Unknown or stale generations fail closed.
8. Retiring a Live key rejects all new intents. An already-prepared/provider-indeterminate item may only reconcile its exact pinned identity under D15; retirement never authorizes rerender or replacement.

## Mechanical Closure Gates

Planning closure means every row found in this dated baseline has a cited disposition. Implementation closure is stricter and must be machine-enforced.

### Required Generated Artifacts

For one recorded code SHA and catalog generation, CI must generate and hash:

- the AST/import graph of every Resend SDK construction/send call and every production `sendEmail` import/caller;
- every Phase 6 product intent producer, scheduled/background sender, Supabase Send Email Hook, provider webhook route, template/binding reader, history writer, and legacy queue row type;
- the expanded 38-key manifest and generated trigger-binding projection;
- canonical `phase17-runtime-census-closure@1`, containing every discovered
  `RUN-*` row in ascending numeric order as `{row_id, repository_anchor,
symbol, observed_role, disposition, required_closure}`. `disposition` is one
  required enum value from **Census Row Vocabulary**, never prose, an array, or
  a slash-combined value;
- canonical `phase17-obligation-exclusion-closure@1`, containing every
  contiguous unique `OBL-001`–`OBL-041` row as
  `{row_id, product_meaning, source_owner_anchor, disposition,
blocker_or_migration_rule, tenant_visibility}` plus every ordered Explicit
  Exclusion entry as `{ordinal, canonical_text}`;
- the direct-send/tooling allow-list, with every entry encoded as
  `{repository_anchor, symbol, allow_list_class, owner, reviewed_at,
nullable_expires_at, nullable_review_reason, review_trigger}` and exactly one
  of expiry or review reason present;
- per-Target-Live source adapter, migration row, and key-specific proof-pack ids; and
- hashes for this census, the executable manifest, decision traceability, OpenSpec requirements, generated registry projection, and implementation source.

The closure artifact uses one checked-in typed schema, Unicode NFC strings,
ordered arrays, lexicographically ordered object keys, UTF-8 without BOM, and
SHA-256 over the exact canonical JSON bytes. Catalog-generation evidence stores
both its artifact digest and the digest of this census source. CI must reject a
missing, duplicate, reordered, unknown, or multiply assigned runtime-census
disposition and must reject a runtime scan result without one matching typed
row. CI must also reject a missing, duplicate or reordered obligation; a changed
or omitted canonical
field; a missing or extra exclusion; or any source/artifact digest mismatch.
Counting 41 rows without proving their meanings and exclusions does not close
the census.

### Release-Blocking Conditions

The gate fails when any of these is true:

1. an in-scope runtime producer, history writer, scheduled worker, Auth hook, webhook, binding reader, or queue type has no census row;
2. a production producer emits an unknown, Reserved, Retired, or stale-generation key;
3. a product obligation, exclusion, or deferred meaning lacks an owner and explicit disposition;
4. a Target Live key lacks one fully expanded contract, exact trigger binding, current source adapter, migration disposition, or complete proof pack;
5. two keys can emit for one semantic source occurrence without documented mutually exclusive predicates;
6. a Resend SDK construction/send import is reachable outside the approved adapter, or a test/tooling allow-list entry is ownerless, lacks its mandatory review trigger, has neither a current expiry nor an explicit review reason, was not re-approved at the current closure, or is reachable from a production bundle;
7. a tenant/client role can write lifecycle, generated binding, system-default publication, activation proof, or another tenant's row;
8. a Reserved key has any executable/editor/publication/readiness side effect;
9. legacy and governed writers can both send the same semantic occurrence;
10. the census, manifest, traceability matrix, OpenSpec, generated projection, and implementation hashes disagree; or
11. the scan ran against a different SHA than the build without recording and approving the difference.

The closure check is an AST/import-and-registry analysis plus exact source and database tests, not prose grep alone. A legitimate new producer must update the typed registry, census row, owner, tests, and migration disposition in the same change. Suppressing the scanner without a bounded reviewed allow-list entry is a release failure.

## Known Planning Gaps That Must Not Be Misreported

- No Target Live key is implemented or proved by this document.
- The exact implementation-base SHA and generated source hashes do not exist yet.
- The current Supabase custom Send Email Hook does not exist; identity keys remain Reserved.
- The legacy `notification_queue` retirement/migration decision requires implementation-time data inspection.
- `refund_started` producer/history evidence is unresolved.
- Foreign future-phase obligations remain deliberately deferred; this is complete inventory, not speculative implementation.
- Provider delivery, inbox placement, human reading, business completion, and receipt/statement truth remain separate facts.

These gaps are intentional, visible activation blockers—not permission to invent defaults or claim partial readiness.
