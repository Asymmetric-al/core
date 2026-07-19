# Phase 17 Cross-PRD and OpenSpec Congruence Package

- **Date:** 2026-07-19
- **Phase:** 17 — System Messages & Template Management (`system-messages`)
- **Authoring provenance:** founder-ratified D1–D20, reproduced in the checked-in
  [decision-to-test register](./phase-17-decision-test-traceability-2026-07-19.md)
  with the source-record digest
- **Program posture:** planning only; issue set pending; groomed-not-dispatched;
  not built or live

## Verdict

| Question                                                               | Verdict                                                                                    | Reason                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can the Phase 17 PRD be authored without changing prior product truth? | **GREEN**                                                                                  | D1–D20 extend the existing Phase 2/3/6 foundation while preserving producer, document, money, recognition, privacy, and workflow owners.                                          |
| Were there material predecessor conflicts?                             | **RED before this package; GREEN after the dated amendments**                              | Phase 2 fallback order, Phase 3 SMS consent, Phase 4 protected actions, Phase 6 history/delivery identity/recovery, and OpenSpec automation routing required explicit correction. |
| Is the current repo already Phase 17?                                  | **RED**                                                                                    | Email Studio and Resend foundations are real; the Phase 6 spine and Phase 17 governed product remain forward.                                                                     |
| Does this package authorize implementation or dispatch?                | **RED**                                                                                    | No Phase 17 issue set or implementation dispatch is authorized. No `ready-for-agent` state is created.                                                                            |
| Is cross-phase ownership now unambiguous?                              | **GREEN, conditional on the companion OpenSpec/ADR files landing in the same spec change** | The old statement, new winner, compatibility boundary, and future-phase owners are enumerated below.                                                                              |

## Authority and method

This package uses one no-guessing hierarchy:

1. merged `openspec/specs/**` is the current product baseline;
2. the active `outbound-communications` delta states proposed observable Phase
   17 behavior;
3. the Phase 17 PRD and executable manifest together provide the detailed
   implementation interface and must agree with that delta;
4. canonical `docs/adr/0022`–`0029` record accepted architecture but cannot
   override observable behavior; and
5. predecessor PRDs/roadmap/code provide context or current-state evidence,
   while the census, traceability register, this congruence package, and
   `CONTEXT.md` provide activation/reconciliation proof. Dated research is
   informative evidence that must be reverified.

Any disagreement among the first four layers is a release blocker. An
implementer does not choose a convenient winner; the documents must be amended
together before dispatch or Live activation.

Current code is evidence, not a design template. A predecessor PRD is a
committed planning contract, not proof that its tables or services are live.
Where a Phase 17 ruling narrows an older statement, the amendment preserves the
older rule outside the exact compatibility boundary rather than silently
rewriting history.

## Canonical ownership map

| Concern                                                                                                                                                      | Owner                                                               | Phase 17 relationship                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operational business truth, source occurrence, eligibility, recipient roles, timing, protected action                                                        | Producing domain                                                    | Consumes one typed, fenced, explicitly scoped projection; tenant scope uses tenant/Party authority, while platform scope is admitted only through the fixed platform scope and exact current `eve_platform_owner` authority/fence; never queries or invents source truth.                                        |
| Site/locale/currency context                                                                                                                                 | Phase 2                                                             | Phase 17 consumes that context and owns the system-message locale activation aggregate, per-contract readiness projection, and permitted presentation inheritance.                                                                                                                                               |
| Consent, field projection, export and merge-field safety                                                                                                     | Phase 3                                                             | Consumes the single fail-closed resolver; adds no parallel consent or arbitrary record access.                                                                                                                                                                                                                   |
| Invitation/claim credential and redemption                                                                                                                   | Phase 4                                                             | Presents a typed scanner-safe action descriptor; never mints/redeems/interprets proof.                                                                                                                                                                                                                           |
| Delivery Plan occurrence coordination; communication intent, dispatch, provider evidence, suppression and durable history                                    | Phase 6                                                             | Phase 17's generated resolver selects the exact immutable binding/plan. Phase 6 owns one unique plan-occurrence header and one bounded transaction that releases the complete independently keyed child-intent set before any claim; the header is coordination only, not a queue, workflow, ledger, or outcome. |
| Receipt/statement facts, document class, currentness and official artifact                                                                                   | Phase 7; artifacts deepened by Phase 18; statement runs by Phase 19 | Provides editable surrounding content only; never owns official truth or artifact.                                                                                                                                                                                                                               |
| Restricted-person and care/security egress safety                                                                                                            | Phases 3/10                                                         | Every authoring, preview, send, support and history projection obeys strictest-wins.                                                                                                                                                                                                                             |
| Authorization and publication-review capabilities                                                                                                            | Phase 12                                                            | Consumes explicit capabilities and active assignment; creates no role or policy engine.                                                                                                                                                                                                                          |
| Money/payment/campaign facts                                                                                                                                 | Phase 13                                                            | Renders protected typed facts only.                                                                                                                                                                                                                                                                              |
| DAF/tribute/matching/recognition recipients and privacy                                                                                                      | Phase 14                                                            | Governs presentation only; never derives a recognition recipient or amount visibility.                                                                                                                                                                                                                           |
| Offline-gift post/outbox                                                                                                                                     | Phase 15                                                            | Consumes already-governed outbox candidates; creates no second send path.                                                                                                                                                                                                                                        |
| Recurring/fixed-pledge states, candidates, retry/no-debt meaning and audiences                                                                               | Phase 16                                                            | Maps exact obligations to catalog contracts and publications without reinterpreting them.                                                                                                                                                                                                                        |
| System-message catalog, publication, presentation resolution, bounded Delivery Plans, in-product presentation, sender/reply configuration and message repair | Phase 17                                                            | Owns.                                                                                                                                                                                                                                                                                                            |
| Inbound replies and conversations                                                                                                                            | Phase 26                                                            | Phase 17 records only outbound reply posture and destination evidence; remains transport-dark inbound.                                                                                                                                                                                                           |
| Campaign/newsletter authoring and audience operations                                                                                                        | Phase 32                                                            | Not a Phase 17 system-message feature.                                                                                                                                                                                                                                                                           |
| General enrollment, waits, branches, tasks, mutations and workflow runs                                                                                      | Phase 34                                                            | May call a fixed governed-message action; Phase 17 does not build a workflow engine.                                                                                                                                                                                                                             |

## Current repo truth versus Phase 17 target

### REAL today

- `public.tenant_email_settings` is a singular per-tenant record with current
  From/Reply-To fields, an encrypted Resend key, webhook hints, and coarse
  readiness fields
  (`supabase/migrations/20260402090000_resend_email_foundation_backfill.sql:6-34`).
- `email_send_logs`, `email_events`, suppression tables, and inbound-email
  storage exist (`same migration:36-113`). The current event table includes raw
  payload, click URL, user-agent, and IP fields (`:57-72`).
- Email Studio stores mutable `email_templates` plus
  `email_template_versions`, `unlayer|react_email` builder data, HTML/text,
  subject/preheader, category, and `is_active`
  (`20260511023547_email_studio_react_email_builder.sql:3-51`). A send log may
  reference a version (`:53-59`).
- `email_template_system_bindings` is a mutable family/variant/required-tag
  mapping with `is_active`
  (`20260611151000_contribution_correction_notifications.sql:3-14`).
- Template and general test-send routes currently accept request-level From and
  Reply-To choices (`packages/api/src/email/template-test-send.ts:136-150`;
  `packages/api/src/email/test-send.ts:96-109`).
- Existing template tables are service-only and RLS-disabled
  (`20260511023547_email_studio_react_email_builder.sql:76-80`). That is
  evidence of the current provider/configuration boundary, not permission to
  make tenant-facing Phase 17 configuration RLS-disabled.

### FORWARD, not live

No implementation of `communication_events`, `communication_intents`, or
`communication_delivery_profile_versions` was found under current migrations
or `packages/api/src`; the Phase 6 spine is still a planned prerequisite. The
following Phase 17 capabilities are also forward:

- the cited completeness inventory and executable Reserved/Live/Retired
  catalog;
- immutable activation generations and System message contracts;
- one canonical structured message document, typed facts/actions, complete
  publications, and mock-only preview;
- tenant-selected bounded fallback, contract-locale readiness, Brand Kits,
  Layout Roles/Role Layouts, and proportional publication review;
- Delivery Plan compilation, production in-product notification presentation,
  and transport-dark SMS evidence;
- D10 tenant-owned Resend proof, bounded Sender Profiles, reply-purpose
  destinations, and immutable composed delivery identities;
- body-free history plus the optional encrypted expiring Recent sent copy;
- prepared-message identity, provider-boundary recovery and grouped repair;
  and
- native portability, foreign conversion and bilateral transfer.

The Phase 17 PRD must label all of these as **FORWARD** and cite the real
predecessor it extends or replaces. “Email Studio exists” is not “Phase 17 is
built.”

## Phase-by-phase congruence findings

| Phase | Finding                                                                                                                                                                  | Reconciliation                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | **GREEN.** Outcome parity and evidence posture align.                                                                                                                    | Preserve source-cited capability parity and Built/Live evidence discipline.                                                                                                                                            |
| 1     | **AMENDED.** Communication history was named; Phase 17 configuration/presentation records were not.                                                                      | Asym Postgres/code own catalog, publications, configuration, sender/reply revisions and recent-copy detail; provider remains executor/evidence only.                                                                   |
| 2     | **MATERIAL CONFLICT, AMENDED.** D9 fixed one override order.                                                                                                             | D3 permits two platform-defined priorities only for eligible system-message content. Receipts and contracts without tenant choice retain the fixed order.                                                              |
| 3     | **MATERIAL GAP, AMENDED.** Email consent/merge-field safety exists; SMS provenance and Phase 17 capabilities were absent.                                                | Extend channel evidence without enabling SMS; reuse one resolver and explicit Phase 12 capabilities.                                                                                                                   |
| 4     | **MATERIAL SECURITY CONFLICT, AMENDED.** Raw redirect context/action-link wording could become authority or an editable token.                                           | Phase 4 owns proof; Phase 17 presents a scanner-safe Asym handoff; server-owned context is re-proved.                                                                                                                  |
| 5     | **BOUNDED GAP, AMENDED.** Tenant and platform sender purposes were not separated.                                                                                        | Tenant identity/system mail uses tenant Ready Resend; Asym customer bootstrap is a distinct platform contract, never fallback.                                                                                         |
| 6     | **MATERIAL CONFLICT, AMENDED.** Test-history, personalized subject, singular delivery profile, provider-boundary and raw-evidence language were too broad or incomplete. | Preserve the one spine while adopting D10/D14/D15/D16/D17/D20 amendments.                                                                                                                                              |
| 7     | **BOUNDED CONFLICT, AMENDED.** Editable presentation could be mistaken for receipt/statement truth; recent copy for artifact.                                            | Phase 7 owns facts/artifacts; Phase 17 owns only permitted surrounding content/presentation.                                                                                                                           |
| 8     | **GREEN WITH CONSUMER NOTE.** Operations/data health is the correct place to surface catalog/readiness/recovery health.                                                  | Consume body-free grouped health signals; do not create one task per failed recipient or a second healer. No predecessor edit required.                                                                                |
| 9     | **GREEN WITH CONSUMER NOTE.** Party/activity spine is compatible.                                                                                                        | Timeline and in-product projections reference Phase 6/17 records and apply role/privacy floors. No duplicate history.                                                                                                  |
| 10    | **MATERIAL SAFETY GAP, AMENDED.** Already-sent email is non-retractable, but still-readable recent copies needed a reclassification rule.                                | Immediate deny plus priority purge; durable body-free evidence and immutable official artifacts retain their lawful contracts.                                                                                         |
| 11    | **GREEN WITH MISUSE RISK.** Custom fields cannot own message facts, variables, sender routes or workflows.                                                               | Use typed catalog and producer fact registries, never EAV/custom fields for safety-critical message behavior. No predecessor edit required.                                                                            |
| 12    | **MATERIAL AUTHORIZATION GAP, AMENDED.** Broad template permissions were insufficient.                                                                                   | Add small explicit Phase 17 capability atoms; preserve capability-only enforcement and contract-owned independent-review floor.                                                                                        |
| 13    | **GREEN, CLARIFIED.** Money truth and Phase 17 content ownership already separate.                                                                                       | Add a dated protected-fact note; change no ledger or recurring supersession.                                                                                                                                           |
| 14    | **BOUNDED CONFLICT, AMENDED.** Fixed house templates and old binding registry predated the governed catalog.                                                             | Migrate into the same contract/publication registry; Phase 14 retains recognition facts/recipients/privacy.                                                                                                            |
| 15    | **GREEN.** The transaction that posts an offline gift already emits outbox facts and forbids inline send.                                                                | Consume the same Phase 6/17 seam; no new batch sender. No predecessor edit required.                                                                                                                                   |
| 16    | **BOUNDED GAP, AMENDED.** Message obligations were exact, but catalog/sender/recovery structures and atomic multi-step compilation were not yet ratified.                | Map them to Phase 17 contracts; preserve Phase 16 meaning/candidate/source-fence ownership and Phase 7 success receipt; submit one bounded plan occurrence through Phase 6, never independently committed child calls. |

## Dated amendment ledger

### A1 — Phase 2 fallback ordering

- **Old statement:** tenant default → site override → locale override for
  receipts and system messages
  (`phase-02-site-locale-currency-foundation.md:408-413`).
- **New winner:** D3's tenant-selected choice between two platform-defined safe
  content priorities for eligible System message contracts.
- **Compatibility boundary:** receipts, official documents, and contracts that
  do not authorize choice keep the Phase 2 order. One complete compatible
  publication wins; no fragment mixing. Locale context and immutable
  `rendered_locale` remain Phase 2 facts.

### A2 — Phase 3 consent and SMS reservation

- **Old statement:** email consent uses `do_not_email`, `do_not_contact`, and
  `email_suppressions`
  (`phase-03-minimum-permission-role-scoped-projection-foundation.md:165-193`).
- **New winner:** channel-scoped SMS consent/registration provenance is modeled
  for evidence/readiness.
- **Compatibility boundary:** `do_not_contact` stays absolute and
  `email_suppressions` stays email authority. SMS sending, templates, bindings,
  preview, tests and fallback remain structurally unavailable.

### A3 — Phase 4 protected actions

- **Old statement:** the branded hook resolves tenant from request/redirect
  context and injects an action link
  (`phase-04-identity-account-claiming-foundation.md:136-140`, `:169-170`).
- **New winner:** producer-owned credential/action; scanner-safe Asym handoff;
  fresh provider proof only after deliberate recipient action.
- **Compatibility boundary:** Phase 4 retains issuance, expiry, revocation,
  redemption and completion. `redirectTo` may carry an opaque reference but
  cannot choose authority, tenant, recipient, template or sender.

### A4 — Tenant versus platform identity mail

- **Old statement:** per-tenant branded Email Studio → Resend without an explicit
  bootstrap boundary
  (`phase-04-identity-account-claiming-foundation.md:123`).
- **New winner:** tenant identity/system mail uses the exact tenant Ready Resend
  connection.
- **Compatibility boundary:** Asym customer-account bootstrap is a separate
  forward platform communication, never shared fallback. The current v1
  platform-recipient model does not authorize it; its future owner must define
  an exact app-account source/fence and verified recipient-authority branch.

### A5 — Synthetic tests versus communication history

- **Old statement:** every platform email, including tests, becomes a
  communication event
  (`phase-06-shared-communication-event-model.md:328-330`).
- **New winner:** synthetic preview/test creates test/audit/provider-operation
  evidence only.
- **Compatibility boundary:** a real recipient business communication still
  creates exactly one Phase 6 intent/event at availability/dispatch.

### A6 — Durable subject and recent content

- **Old statement:** `communication_events.subject_snapshot` stores the subject
  (`phase-06-shared-communication-event-model.md:346-348`).
- **New winner:** durable-safe catalog title/purpose/classification and integrity
  evidence only; personalized subject/body is eligible solely for the expiring
  recent-copy detail.
- **Compatibility boundary:** body-free summary remains ordinary; deliberate
  recent-copy reveal is narrowly audited. Legacy subjects remain honestly
  legacy.

### A7 — Phase 6 payload boundary

- **Old statement:** body payload stays entirely in a channel owner
  (`phase-06-shared-communication-event-model.md:346-348`).
- **New winner:** one optional subordinate encrypted, expiring support-safe copy
  may be retained for eligible email classes.
- **Compatibility boundary:** never official truth, publication, retry payload,
  search/export corpus, legal archive or provider authority.

### A8 — Delivery profile and sender/reply authority

- **Old statement:** singular From/Reply-To and one latest delivery profile per
  tenant (`phase-06-shared-communication-event-model.md:369-371`).
- **New winner:** one mutable tenant Resend aggregate with one required Default,
  bounded same-domain Sender Profiles, separate reply-destination revisions,
  and several coexisting exact immutable composed delivery snapshots.
- **Compatibility boundary:** no secret in snapshots, no request-level override,
  no Reply-To on Sender Profile, no silent substitution or cross-account retry.

### A9 — Resend batching

- **Old statement:** Phase 6 prose reserves a fixed 50-recipient cap
  (`phase-06-shared-communication-event-model.md:504-505`).
- **New winner:** one current official Resend adapter constant/limit with tests;
  each recipient keeps a permanent message identity.
- **Compatibility boundary:** batching is transport optimization only, never
  batch-wide truth, BCC personalization or cross-tenant/account grouping.

### A10 — Prepared identity and provider outcomes

- **Old statement:** idempotent dispatch/reconciliation exists without a full
  preparation/provider-boundary state contract
  (`phase-06-shared-communication-event-model.md:462-464`).
- **New winner:** immutable Prepared message identity plus definitely
  unsubmitted, accepted, rejected and indeterminate outcome classes.
- **Compatibility boundary:** fallback can choose another complete compatible
  publication only before preparation. After preparation/possible submission,
  exact content/action/locale/sender/account identity is preserved and unknown
  outcomes reconcile before retry.

### A11 — Provider evidence minimization

- **Old statement:** current events retain raw payload, click URL, user-agent and
  IP (`resend_email_foundation_backfill.sql:57-72`).
- **New winner:** durable normalized minimal signed evidence; bounded raw
  reconciliation material expires separately.
- **Compatibility boundary:** historical evidence remains truthful and is
  migrated under an explicit retention policy; official facts are not deleted.

### A12 — Phase 7/14 truth versus editable content

- **Old statement:** fixed template/binding language could imply the template
  owns official or recognition meaning
  (`phase-14-donor-credit-operations.md:41-45`, `:68-75`).
- **New winner:** tenant-authored content around a source-owned protected truth
  core in one immutable publication.
- **Compatibility boundary:** Phase 7 owns documents/facts; Phase 14 owns
  recognition recipients/privacy; document-class forbidden fields remain.

### A13 — Reclassification and Recent sent copy

- **Old statement:** already-sent email is not retractable
  (`phase-10-sensitive-data-safety.md:95`).
- **New winner:** later restricted/high-risk classification immediately denies
  and priority-purges any still-readable tenant recent copy/cache. Platform
  messages retain body-free evidence only and have no readable-copy branch in
  this generation.
- **Compatibility boundary:** external delivered email remains non-retractable;
  lawful body-free evidence and official artifacts keep their source rules.

### A14 — Phase 12 capabilities and review

- **Old statement:** broad entity/template permissions and draft status
  (`phase-12-full-role-permission-configuration.md:157-161`).
- **New winner:** explicit catalog, author, publish, protected-review, brand,
  delivery-settings, recent-copy, portability and repair capabilities.
- **Compatibility boundary:** no role-name authority, local approval engine or
  weakened contract review floor.

### A15 — Catalog lifecycle

- **Old statement:** template `category`, `is_active`, family/variant binding or
  database row may look like product lifecycle.
- **New winner:** one code-governed executable catalog with stable keys,
  Reserved/Live/Retired and immutable activation generation.
- **Compatibility boundary:** existing rows are migration adapters; history
  stays readable and no fictional activation/reviewer evidence is created.

### A16 — Automation routing

- **Old statement:** an automation email uses the contribution notification
  module (`openspec/specs/platform-boundaries/spec.md:401-406`).
- **New winner:** a governed-message action at either tenant or platform scope
  invokes a Live Phase 17 contract only through its exact code-owned producer
  binding. Tenant scope resolves its tenant-published contract-bounded Delivery
  Plan; platform scope resolves the immutable Asym-owned fixed plan/version
  declared by the exact meaning-specific platform profile. The producer submits
  one complete bounded plan occurrence. Phase 6 privately materializes every
  independently keyed recipient-step intent in the same transaction and releases
  none until the complete parent is verified. An `in_product` intent produces one
  local `available` event and the Phase 17 role-safe attention projection, with
  no provider submission, state, or outcome.
- **Compatibility boundary:** Phase 34 owns workflow enrollment, timing,
  branches, tasks, mutations and runs. Phase 17 owns no workflow runtime.

### A17 — Tenant control

- **Old statement:** merged OpenSpec broadly promises tenant-controlled
  templates/policy (`platform-surfaces/spec.md:219-225`).
- **New winner:** control is bounded by the System message contract and minimum
  source-owned truth core.
- **Compatibility boundary:** tenants cannot disable required safety/legal
  meaning, expose forbidden facts, invent events/recipients/actions, or weaken
  consent/security.

### A18 — Correction-message fallback

- **Old statement:** invalid contribution correction template blocks with no
  fallback (`contribution-operations/spec.md:210-232`).
- **New winner:** D15 permits only contract-proven whole-message recovery before
  preparation.
- **Compatibility boundary:** the correction contract keeps no-fallback unless
  it explicitly authorizes a complete compatible prior/system publication.
  There is no global loosening.

### A19 — Roadmap open questions

- **Old statement:** review, outbound identity and launch locales are open
  (`roadmap.md:1073-1076`).
- **New winner:** D1–D20 close all three and define the complete governed model.
- **Compatibility boundary:** Phase 17 remains planning-only and issue-set
  pending; closing design questions does not claim implementation.

### A20 — Future-phase boundaries

- **Old risk:** later phases could duplicate Phase 17 histories, templates,
  inboxes, inbound replies, campaigns or workflows.
- **New winner:** 18 documents; 19 statement runs; 24 broad localization; 25/28
  full role notification centers; 26 inbound; 32 campaigns/newsletters; 34
  workflows.
- **Compatibility boundary:** later phases consume the same Phase 6/17 records
  and contracts; they do not copy authority or history.

## OpenSpec reconciliation

`openspec/project.md:24-30` requires new feature-level contracts to receive
their own capability spec, and `:32-41` explicitly lists
`outbound-communications` as the second missing capability. Therefore the
active `sitestacker-parity` change must contain:

| Delta                                      | Required action                                                                                                                                                      | Verdict         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `specs/outbound-communications/spec.md`    | Add complete requirements/scenarios for D1–D20, tenant/cross-tenant safety, source ownership, publication, delivery, evidence, recovery, portability and boundaries. | **REQUIRED**    |
| `specs/platform-surfaces/spec.md`          | MODIFIED full outbound requirement: tenant control is contract-bounded and truth-preserving.                                                                         | **REQUIRED**    |
| `specs/platform-boundaries/spec.md`        | MODIFIED full automation requirement: platform-level action through the exact code-owned producer binding; Phase 34 workflow ownership.                              | **REQUIRED**    |
| `proposal.md`, `design.md`, `tasks.md`     | Add the dated Phase 17 scope, decisions, affected specs, predecessor amendments, ADRs and validation task.                                                           | **REQUIRED**    |
| merged `openspec/specs/**`                 | Do not edit directly in this proposed change.                                                                                                                        | **PRESERVE**    |
| merged contribution correction no-fallback | Preserve unless the exact contract is separately and safely changed.                                                                                                 | **GREEN AS-IS** |
| merged donation receipt source-truth rule  | Preserve. Phase 17 changes presentation, not gift completion/receipt truth.                                                                                          | **GREEN AS-IS** |

The new capability should cover at least: catalog/activation; producer truth and
protected actions; complete publication/fallback; typed variables/mock preview;
locale/brand/layout/review; Delivery Plans and in-product presentation;
transport-dark SMS; tenant Resend/sender/reply; body-free evidence/recent copy;
prepared identity/recovery; portability; and tenant/privacy/accessibility/
observability/migration tests. Do not grow `platform-product-intent` with these
feature details.

## ADR allocation

PR #465 ended the SiteStacker series at ADR-0017. Current `develop` subsequently
assigned ADR-0018 through ADR-0021 to Eve autonomy, governance, audit, and
kill-switch decisions. Those numbers remain Eve-owned; Phase 17 therefore starts
at the next available **ADR-0022**. Every identifier in the allocation below
refers exclusively to the canonical repository ADR files under `docs/adr/`; no
feature-local ADR namespace applies. The lean allocation is:

1. ADR-0022 — producer-owned protected actions and Phase 17 presentation;
2. ADR-0023 — contract-bounded Delivery Plans versus general workflows;
3. ADR-0024 — one Asym notification presentation/engagement model with
   proportional role launch;
4. ADR-0025 — evidence-ready SMS governance with transport unavailable;
5. ADR-0026 — universal tenant-owned Resend, no shared fallback, and composed
   sender/reply delivery identities (includes D17/D20; no duplicate Sender
   Profile ADR);
6. ADR-0027 — canonical structured message document, immutable presentation
   dependencies, and minimum protected truth core (D4/D13/D18);
7. ADR-0028 — body-free history and expiring support-safe recent copy; and
8. ADR-0029 — immutable prepared-message/provider boundary and whole-message
   recovery.

Do not create an ADR for every D-number. The PRD/OpenSpec adequately own the
remaining bounded product choices.

## Active Eve email and Discord reconciliation

Current `develop` also contains the active
`add-eve-email-discord-notifications` change for issue #436. Its safe-event
policy and destination decisions remain valid, but its email path cannot become
a parallel renderer, queue, provider choice, retry lifecycle, or history.

The compatible ownership split is:

1. Eve/#436 owns the governed source event, safe fact envelope, severity and
   channel eligibility, platform-owner recipient authority, dedupe/pause/expiry
   decision, and the Discord operational channel.
2. An eligible Eve **email** becomes a platform-scoped, Asym-fixed system
   message. Phase 17 owns its contract, fixed publication resolution, compiler,
   and platform delivery-profile/connection configuration and proof. Phase 6
   owns recipient-specific intent and preparation orchestration through those
   resolvers, Resend submission, idempotency/recovery, provider outcome, and
   communication history.
3. Platform-scoped email uses a separately proved Asym-owned Resend connection
   and domain. It is never a shared fallback for tenant messages, cannot carry
   tenant or donor content, and is not tenant-configurable.
4. Discord remains an Eve operational-awareness channel with Eve-owned
   provider execution/evidence. It is not presented as a Phase 17 tenant
   channel, a Phase 6 email outcome, or durable communication truth.
5. No Eve email can activate until #436 enumerates an exact stable event meaning
   and a platform-scoped Phase 17 contract passes the normal Live proof gate.
6. Every Phase 6 execution/history row carries explicit `scope_kind`, the
   exclusive `tenant_id` XOR `platform_scope_id`, generated `scope_owner_id`,
   and scope-prefixed composite parent/result keys and FKs. Tenant recipients use
   Party/contact and tenant delivery profiles; platform v1 uses only the closed
   `eve_platform_owner` authority branch with an exact revision plus service-only
   `platform_email_settings`/profile/connection, with all tenant fields null.
   The opaque provider route verifies one connection revision first, derives
   its structural scope/owner, then resolves the scope-prefixed provider-message
   identity; payload fields never select scope. Provider envelopes are
   single-scope, tenant roles cannot see platform rows, and migration never
   creates a fake tenant. Every other platform recipient kind fails before
   intent creation; customer-account bootstrap/security requires a future
   separately ratified branch.

The Phase 17 PRD/OpenSpec and the active Eve proposal/design/spec/tasks carry
this same split so neither implementation can claim ambiguous ownership.

## Required program-document state

- `roadmap.md` and `phase-map.md`: `PRD exists (issue set pending;
groomed-not-dispatched)` for Phase 17; no invented issue number.
- `README.md`: Phase 17 entry after Phase 16, naming D1–D20 and planning-only
  posture.
- `parity-matrix.md`: distinguish real Email Studio/Resend foundation from the
  forward Phase 6/17 product; no unresolved founder decision, while exact future
  key enumeration and implementation proof remain explicitly pending.
- `CONTEXT.md`: canonical Phase 17 vocabulary; older generic template/binding/
  notification/workflow language is not authority.
- Phase 1/2/3/4/5/6/7/10/12/13/14/16: the dated amendment blocks in this
  package are normative.
- Phase 8/9/11/15: audit-only compatibility notes; no predecessor edit needed.

## Release-blocking invariants

1. Every D1–D20 ruling maps to a PRD section, data/API contract, UX behavior,
   acceptance test, and ticketable slice.
2. Every current producer and prior obligation has a cited inventory
   disposition; every executable entry has one stable key and exactly one
   Reserved/Live/Retired lifecycle state.
3. Every Live contract names source owner, truth core, recipient roles,
   channel/steps, locale/fallback, layout, sender/reply, recent-copy class,
   recovery posture and proof bundle.
4. Preview/review uses stored synthetic mock facts only. Runtime values are
   typed, producer-projected, tenant/role/purpose/document-class scoped, and
   escaped by default. No arbitrary record path or expression language exists.
5. Phase 6 remains one recipient-intent/event/dispatch spine and one external
   send writer. No second queue, send log, notification ledger, inbox, sent-mail
   archive, provider template authority or workflow runtime appears.
6. Each mutually exclusive scope branch has one mutable Resend aggregate:
   `tenant_email_settings` for one tenant, or service-only
   `platform_email_settings` for the fixed Asym platform owner. No row, command,
   fallback or provider event crosses branches. Each writer uses its canonical
   owner store and atomically persists validation evidence; tenant legacy scalar
   deliverability fields remain synchronized until their governed cutover. Any
   divergence is release-blocking. Sender/reply configuration is subordinate,
   revisioned and non-secret; prepared snapshots are immutable and same-scope.
7. Cross-tenant/site/locale/role/account, stale revision, arbitrary id, import,
   cache, preview and support-tool negative tests fail closed.
8. Phase 7 official artifacts and Phase 10 safety survive fallback, expiry,
   recovery, portability, reclassification and restore. Recent-copy deletion
   cannot break official records, reconciliation or retry.
9. OpenSpec strict validation and Markdown/Prettier/link checks pass. Every
   `MODIFIED` OpenSpec requirement restates the complete requirement and
   scenarios.
10. No document claims Phase 17 is built, live, dispatched, issue-published, or
    `ready-for-agent`.
11. Each producer-authorized recipient/channel-step occurrence slot has one
    permanent scoped uniqueness lock. Communication replay returns its existing
    row only when the server-derived semantic identity and separate
    immutable-command hash both match; any mismatch conflicts, and legitimate
    successor work needs a new slot token. Producer invalidation touches only the
    exact scope+producer+fence key. Prepared artifacts and provider-submission
    envelopes use separate closed AAD schemas.
12. Audit uses the closed tenant-human, platform-human-through-service, or
    platform-automation actor branch. Recent-copy reveal additionally re-proves
    exact recipient Party/contact authority; source access alone is insufficient.

## Final synthesis

The final architecture is congruent because it keeps one authority per kind of
truth. The producer decides what happened and who may receive its meaning.
Phase 17 governs how that meaning is safely published and resolved. Phase 6
proves what communication was attempted or made available. Resend executes one
recipient-specific email under its exact tenant or platform scope and returns
evidence. Official documents, money, recognition, privacy and workflows stay
with their existing owners.

The package is **GREEN for specification** once its PRD, executable manifest,
dated census and traceability matrix, evidence ledger, these predecessor
amendments, focused ADRs, and active-change OpenSpec deltas land together. It
remains **RED for implementation/live evidence** until a
separate founder dispatch produces build tickets and each Live message contract
passes its activation proof. That distinction is intentional and binding.
