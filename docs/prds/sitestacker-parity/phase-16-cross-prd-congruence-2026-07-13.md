# Phase 16 Cross-PRD Congruence Package — 2026-07-13

## Status and verdict

**Scope:** Phase 16, Pledges & Recurring Commitments (`pledges-commitments`)
**Decision authority:** the complete Phase 16 grill record, ratified D1–D19
**Review date:** 2026-07-13
**Program posture:** documentation and planning only; no product implementation or dispatch is authorized by this package

**Verdict: GREEN for the completed Phase 16 PRD, ADR, research, congruence, and OpenSpec package. RED for dispatching the existing Phase 13 recurring-giving tickets unchanged; the Phase 16 `/to-tickets` step must replace or explicitly supersede them.**

The ratified Phase 16 design can be made fully congruent with the program. It does not require a new money ledger, identity model, permission engine, communication delivery stack, recognition model, or offline-gift posting path. It consumes those predecessor contracts and supplies the missing commitment, schedule, occurrence, collection-control, fulfillment, support-health, self-service, staff-service, and fixed-pledge domains.

The material conflicts are known and bounded. They are concentrated in the roadmap's old “one model” wording, the Phase 13 recurring design and its published children #706–#710, Phase 7/13 recurring-ACH posting and receipt timing, two Phase 9 projection labels, several stale OpenSpec requirements, and predecessor registries that must admit the new Phase 16 record and event types. Every conflict has a named winner and amendment below. No unresolved conflict is permitted to pass into ticket authoring.

## Source precedence used for this review

When two documents disagree, the Phase 16 PRD author MUST apply this order:

1. Ratified Phase 16 decisions D1–D19 and their amendments/hardening.
2. Merged OpenSpec product invariants that are not explicitly superseded here.
3. Accepted ADRs, especially ADR-0001 and ADR-0007 through ADR-0011.
4. Earlier committed SiteStacker parity PRDs, with the dated amendments in this package applied.
5. Roadmap prose and published issue bodies.
6. Current implementation only as a real-vs-forward anchor, never as product intent.

The Phase 16 PRD MUST preserve this precedence in its own congruence section. An implementation agent must never revive stale Phase 13 behavior merely because it appears in an older issue body or current table name.

## Canonical ownership map after Phase 16

| Truth or operation                                                                                                     | Owning phase/domain | Phase 16 relationship                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant, site, currency, attribution axes, calendar presentation                                                        | Phase 2             | Consume; add a separately named, frozen tenant giving-time-zone fact for schedule calculations. Do not overload tax time zone or browser locale.                                                                                                                                                                                                                                           |
| Projection, export, consent, record-policy floor                                                                       | Phase 3             | Consume; register every Phase 16 record, derived projection, export shape, and action.                                                                                                                                                                                                                                                                                                     |
| Party identity, donor access, claiming, merge/dedupe                                                                   | Phase 4 and Phase 9 | Consume Party and identity. Phase 16 owns immutable Commitment Party assignment and effective-dated service/remitter/authorizer roles.                                                                                                                                                                                                                                                     |
| Public checkout handoff and guest-first entry                                                                          | Phase 5             | Consume. Phase 16 adds a payment-backed recurring agreement and its initial contribution outcome without changing the “no record for mere abandonment” rule.                                                                                                                                                                                                                               |
| Communication intent, delivery-profile, event, consent, delivery and outcome spine                                     | Phase 6             | Consume exclusively. Phase 16 owns recurring/fixed domain transition meaning, recipient projection and candidate policy, then submits idempotently to Phase 6 only when the exact message key is Live in the pinned activation generation; never a parallel mail queue or sender. Reserved/unknown keys remain source-suppressed with zero Phase 6 state and no later historical catch-up. |
| Receipt, statement, legal donor and tax facts                                                                          | Phase 7             | Consume. Phase 16 records processing-ACH initiation-confirmation meaning and submits it through Phase 6 only when that exact key is Live in the pinned activation generation; an official successful-payment receipt waits for processor-confirmed success.                                                                                                                                |
| Operations/data-health worklists                                                                                       | Phase 8             | Consume for incidents and repair. Phase 16 supplies recurring-control and data-health signals, aggregated into one tenant incident where appropriate.                                                                                                                                                                                                                                      |
| CRM Party spine, relationship shell, support edges, dashboards                                                         | Phase 9             | Consume and extend with multi-axis commitment projections and the ratified cash-first missionary hierarchy.                                                                                                                                                                                                                                                                                |
| Restricted-ministry and anonymity firewall                                                                             | Phase 10            | Consume without bypass. Privacy is applied before row display and before aggregation.                                                                                                                                                                                                                                                                                                      |
| Custom-field catalog                                                                                                   | Phase 11            | Do not use for money, schedules, commitments, authorization, or fulfillment. Phase 16 facts are first-class typed fields.                                                                                                                                                                                                                                                                  |
| Capability, active-assignment and tenant-safe authorization                                                            | Phase 12            | Consume. Mint explicit Phase 16 capabilities; names and staff job titles never authorize.                                                                                                                                                                                                                                                                                                  |
| Contribution ledger, Connect execution, designation lines, money finality                                              | Phase 13            | Consume as the only money truth. Phase 16 replaces the stale recurring-intent/executor design, not the append-only ledger; recurring ACH `processing` is evidence-only until provider-confirmed success posts money.                                                                                                                                                                       |
| Recognition/soft credit, DAF, tribute and matching-gift credit                                                         | Phase 14            | Consume as a separate axis. Fulfillment applications never become recognition credit, and recognition never changes legal donor or commitment Party.                                                                                                                                                                                                                                       |
| Offline money entry, deposits, phone-gift lane                                                                         | Phase 15            | Consume for posted contributions and staff payment capture. Fixed-pledge entry is not money; matching a posted offline gift to a pledge is Phase 16 fulfillment.                                                                                                                                                                                                                           |
| Recurring commitment, fixed-total pledge, schedule, occurrence, collection control, fulfillment, health and management | Phase 16            | Own. These are separate aggregates linked through explicit typed references, never collapsed into a universal pledge row.                                                                                                                                                                                                                                                                  |
| Authored message templates, locale/site resolution and rendered communication content                                  | Phase 17            | Later consumer. Phase 16 defines typed meaning facts, eligibility, and preview requirements; it does not hardcode a delivery vendor or template prose.                                                                                                                                                                                                                                     |

The Phase 16-to-Phase 6 handoff is generation-gated. A source occurrence may
enter `compileAndReleaseCommunicationPlanOccurrence` only when its exact message
key is `Live` in the pinned Phase 17 activation generation. An unknown or
`Reserved` key is source-suppressed and creates no plan occurrence, header,
intent, event, notification projection, preparation, or provider work in Phase 6. Later activation is prospective only: it must not replay or backfill
historical source occurrences suppressed under an earlier generation.

## Domain boundaries that the Phase 16 PRD must state explicitly

### 1. Two commitment kinds, not one universal pledge model

Phase 16 owns two distinct aggregates:

- A **recurring commitment** expresses ongoing donor intent backed by a collection arrangement. Its central truth is the continuing schedule and independently manageable destination lines.
- A **fixed-total pledge** expresses a promised total, usually offline, with an optional expected-payment plan. It does not itself charge, post, receipt, or recognize money.

They may share Party references, destinations, audit infrastructure, fulfillment applications, and staff visual language. They MUST NOT share a mutable universal status, universal editor, or inferred conversion path. A recurring gift does not silently become a fixed pledge; a completed or canceled fixed pledge does not silently become a recurring collection agreement.

### 2. One recurring-giving group, explicit collection cohorts, independent lines

A donor-facing recurring-giving group is explicit and never inferred from
coincident dates or payment methods. It contains destination-specific recurring
lines for one tenant, Commitment Party, payer/authorizer context, and currency;
a mismatch creates another group. Lines with compatible merchant/account,
authorization lineage, schedule, collection behavior, and provider capability
may share a collection cohort. The executor mapping is:

- explicit execution legs under each compatible cohort;
- one leg/subscription for ordinary cadences and two 1st/15th monthly legs for
  twice-monthly;
- one exact Stripe subscription-item binding per recurring line in every
  applicable leg;
- no `items[0]` identity assumption; and
- no “one subscription per line” requirement.

Line-owned facts include destination, amount, line end date and line lifecycle. Cohort-owned facts include payment method, execution schedule, retry/recovery posture, cohort pause/skip operation and provider-control state. A line-level action that would break compatibility splits the line into another cohort through an effective-dated operation; it does not rewrite history.

### 3. Separate state axes

The PRD MUST NOT define a single six-state recurring status as authoritative. It must preserve at least these independent axes:

- donor intent and line lifecycle;
- schedule/occurrence state;
- collection health and retry runway;
- payment attempt and money finality;
- provider access and executor-control posture;
- synchronization/reconciliation freshness;
- fulfillment/variance;
- derived support health and attention reasons.

UI badges may summarize these facts, but the summary is derived, versioned, and inspectable. Unknown, stale, conflicting, or reconciling data never appears healthy merely because the last known lifecycle value was active.

### 4. Schedule truth is distinct from payment truth

The schedule engine owns an immutable/effective-dated calendar epoch and named occurrences. Payment attempts attach to an occurrence but never redefine its intended date. A late retry, late settlement, ACH return, provider outage, or manual collection attempt cannot drift the next normal occurrence. Missed occurrences are historical variance, not debt, and are never automatically back-charged.

### 5. Fulfillment is an explicit, conserved application

Posted contribution designation lines are money truth from Phase 13/15. Expected occurrence lines are commitment truth from Phase 16. An immutable fulfillment application connects the two, grouped by an operation when one payment satisfies multiple expectations. Automatic application is allowed only through one of three independent exact proof paths: (1) frozen provider lineage that names the exact occurrence and line allocation; (2) an authenticated donor instruction that names the exact source and target; or (3) an approved authenticated structured-remittance mapping. Every path must prove the same tenant, currency, designation, source/target capacity, and actual Commitment Party; structured authority approval/supersession has one deterministic current winner per exact grain, and one donor instruction can authorize at most one original application. Ambiguity remains a suggestion only. Fuzzy identity, amount/date proximity, memo text, or household inference may propose a match but cannot post it.

A later refund, return, chargeback, NSF, void, re-designation, or match correction is not a fresh application. It uses immutable canonical correction evidence tied to the complete affected prior operation set and exact entries; the correction must still proceed if the original provider, donor, remittance, or staff application authority has expired, been revoked, or been consumed. Full corrections exact-invert once. An ambiguous partial reversal retracts the complete affected vector across one or several prior operations from definite coverage and opens review rather than guessing. Apply and authority invalidation serialize on one deterministic authority fence so revocation stops unstarted work without invalidating completed history.

Recognition from Phase 14 is separate. A fulfillment application cannot alter the legal donor, receipt owner, recognition Party, or soft-credit allocation.

## Phase-by-phase congruence findings

| Phase    | Concern                                                                                                                                                                                     | Binding reconciliation for the Phase 16 PRD                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2  | **Concern: yes.** Phase 2 supplies calendar/site/currency facts but not the exact recurring schedule clock.                                                                                 | Define a tenant-owned IANA **giving time zone**, freeze the applicable zone on each schedule epoch, calculate civil dates in that zone, and resolve each occurrence to one provider-safe instant. Do not reuse `tax_timezone`, browser zone, site locale, or processor settlement date as the anchor. Preserve integer minor units, explicit currency, tenant on every row, and frozen attribution axes.                                                                                                                                                                                                         |
| Phase 3  | **Concern: yes.** Its record census and projection registry predate Phase 16.                                                                                                               | Add recurring groups, cohorts, lines, schedule epochs, occurrences, attempts, provider-control incidents, fixed pledges, plan versions, named expectations/lines, unscheduled balance lines, fulfillment applications, authorization evidence, command journal entries and derived health projections to the ownership/policy/egress census. All staff, donor, missionary, reporting and export reads pass the same projection chokepoint.                                                                                                                                                                       |
| Phase 4  | **Concern: yes.** General merge re-pointing could be mistaken for transfer of a promise.                                                                                                    | A duplicate merge may re-point identity references while retaining provenance, but it does not transfer the Commitment Party. A true owner change supersedes the old commitment/pledge and creates a new one with fresh authority. Donor portal access still requires verified possession and tenant-safe claiming.                                                                                                                                                                                                                                                                                              |
| Phase 5  | **Concern: bounded.** “Create a gift record only on completed gift” is too narrow for an accepted recurring authorization whose initial ACH payment is processing.                          | Preserve “no record for browse, form abandonment, or failed pre-acceptance handoff.” Once the processor accepts the recurring arrangement and returns a durable initial-payment state, persist the agreement, occurrence and attempt even if ACH is processing. The PRD author must pin the exact acceptance boundary and idempotent saga state; it must never label processing funds received.                                                                                                                                                                                                                  |
| Phase 6  | **Concern: yes.** Existing recipient and event relations point at legacy person/pledge shapes and there is no durable pre-dispatch intent owner.                                            | Extend the canonical spine with Party/contact-point recipients, durable semantic `communication_intents`, immutable delivery-profile versions backed by `tenant_email_settings`, and typed relations to recurring group/cohort/line/occurrence/attempt, fixed pledge/expectation/expectation line, and provider-control incident. D9/D19 domain meaning and candidate generation belong to Phase 16; consent/rendering/dispatch/delivery/outcome remain Phase 6/17. No hardcoded Resend or Email Studio dependency in Phase 16 domain code.                                                                      |
| Phase 7  | **Concern: material conflict.** Older text allowed an ACH receipt at `payment_intent.processing`; D4/D10 and the unified Phase 13 finality contract require source success first.           | For one-time and recurring ACH, `processing` produces provider evidence and a truthful initiation/submission confirmation only. Processor-confirmed success creates/posts the source occurrence once; only a Phase 7 frozen plan/ordinary policy that admits an individual receipt emits one authorization pointer. `annual_cumulative_cash` emits no per-gift authorization/request/delivery and records year-end readiness. Phase 18 owns any exact receipt artifact and Phase 17 owns delivery. A later return appends the Phase 13 money inverse and one Phase 7 correction pointer; history is not deleted. |
| Phase 8  | **Concern: bounded.** Naive per-line alerts would create operational storms.                                                                                                                | Register provider-control loss, reconciliation staleness, unknown executor outcome, scheduler drift and fulfillment inconsistency as health signals. Collapse shared provider/control failures into one tenant incident with affected counts and drill-down, never one task per recurring line. Phase 8 may coordinate repair but cannot fabricate money, authority, schedule or provider-stop proof.                                                                                                                                                                                                            |
| Phase 9  | **Concern: material projection conflict.** It reserves a single `on-track/behind` pledge status and a thinner missionary support view.                                                      | Replace that placeholder with D12 multi-axis support health and attention reasons. Adopt D13's cash-first missionary hierarchy. Preserve the Party spine and derived support edge, but derive “supporting” from eligible settled gifts/valid recurring intent without treating an offline pledge as cash.                                                                                                                                                                                                                                                                                                        |
| Phase 10 | **Concern: yes.** Exact next dates and donor identity can become quasi-identifiers.                                                                                                         | Apply anonymity and restricted-worker policy before aggregation and display. Missionaries see only permitted donor identity, designation, amount/cadence, last successful date, next **scheduled** date, pause/resume wording and payment outcome summary. They never see payment credentials, processor codes, staff authorization proof, or hidden restricted targets. Small-cell/coarsening rules remain available where exact dates could identify one supporter.                                                                                                                                            |
| Phase 11 | **Concern: no conflict; misuse risk exists.**                                                                                                                                               | Commitment amounts, cadence, schedules, end dates, authorization evidence, provider control, retry rules, fulfillment and health are typed core data. None may be implemented as tenant custom fields or EAV. Tenant configuration uses bounded, versioned first-class policy rows.                                                                                                                                                                                                                                                                                                                              |
| Phase 12 | **Concern: yes.** Broad staff proxy editing must not become broad ambient authority.                                                                                                        | D15 consumes the capability spine and active assignment. Every service-desk action passes operator authority, Party instruction and collection authorization independently. The server derives the action class and allowed path. Payment fields remain provider-owned. No role-name check, consent checkbox, or second staff approval can manufacture donor authorization.                                                                                                                                                                                                                                      |
| Phase 13 | **Concern: major dated supersession required.** Its ledger remains authoritative; its recurring design does not, and its former processing-post option conflicts with unified ACH finality. | Keep append-only contribution/designation/posting truth, Connect direct-charge execution, provider event ingestion, designation eligibility and refund/return corrections. Replace the recurring object, executor mapping, lifecycle, retry, portal and cutover claims. For one-time and recurring ACH, `processing` persists evidence/projection only; success creates/posts once and emits zero or one Phase 7 authorization pointer according to the frozen plan/policy; a late return appends the money inverse and one source-correction pointer.                                                           |
| Phase 14 | **Concern: yes.** Recognition and fulfillment could be conflated.                                                                                                                           | Legal donor, recognition Party, DAF advisor, tribute recipient, matching-gift expectancy and soft credit stay Phase 14 facts. D11 fulfillment applications are a separate conserved relation. DAF advisor identity never becomes the Commitment Party or collection authorizer by inference.                                                                                                                                                                                                                                                                                                                     |
| Phase 15 | **Concern: no conflict after explicit boundary.**                                                                                                                                           | Fixed-pledge entry creates no contribution. Offline gifts continue through the one governed batch-commit path; phone card/ACH payments remain Stripe-rail online gifts through provider-owned fields. After posting, Phase 16 may explicitly apply a designation line to a pledge expectation. Never write “pledge fulfillment” directly into the batch as money truth.                                                                                                                                                                                                                                          |

## Dated amendment ledger

These amendments are mandatory Phase 16 PRD content. They identify the older statement, the new winner, and the compatibility boundary.

### A1 — Roadmap Phase 16 “one model” wording

**Older statement:** one pledge model covering recurring, installments and offline commitments, with a simple `Active → Lapsed → Closed` lifecycle.
**Winner:** D1, D2, D11 and D12.
**Amendment:** replace the universal model with distinct recurring-commitment and fixed-total-pledge aggregates, explicit fulfillment applications and multiple state axes. “Active/Lapsed/Closed” may be display language only when derived from named facts; it is not a writable state machine.

### A2 — Phase 13 one Stripe subscription per recurring line

**Older statement:** #706 and the Phase 13 PRD create one subscription per line and group by donor × connected account.
**Winner:** D2.
**Amendment:** the explicit recurring-giving group contains independently
manageable lines and compatible collection cohorts. Each cohort owns the
minimum explicit provider execution legs: ordinary cadences normally map to one
subscription; twice-monthly maps to separate 1st/15th monthly legs. Every line
has one exact-bound item in every applicable leg. Group-level tenant,
Commitment-Party, legal-payer/authorizer-context, or currency mismatch creates a
separate group; cohort-level merchant/account/mode, authorization, schedule,
collection-behavior, or provider-capability mismatch creates separate cohorts.
No code may identify a line with `items[0]`.

### A3 — Phase 13 six-state lifecycle

**Older statement:** #706/#709 treat `active / past_due / paused / canceled / lapsed / completed` as the canonical recurring truth.
**Winner:** D2, D5, D8, D12 and D16.
**Amendment:** preserve those terms where useful as derived labels, but store independent donor-intent, schedule, collection, payment, provider-control, reconciliation and support-health facts. `lapsed` applies only when future automatic collection is actually unavailable or intentionally parked, never merely because several scheduled gifts failed.

### A4 — Phase 13 Stripe Smart Retries and two-to-three-week lapse

**Older statement:** #707 makes Stripe Dashboard Smart Retries the retry scheduler, parks after its retry window, and emits multi-touch recovery communications.
**Winner:** D6–D10.
**Amendment:** Stripe performs ordinary provider execution, but Asym owns bounded retry eligibility, candidate dates, slot consumption, episode runway and suppression. Card soft-failure bursts use the D7 schedule; D8 allows bursts for the triggering occurrence plus three later normally scheduled soft-failed occurrences, then regular-schedule-only. ACH has no silent same-occurrence representment; only the proof-gated donor-confirmed R01/R09 recovery path is allowed. Communication fires on meaningful transitions, not every attempt.

### A5 — Phase 13 pause/hold implementation

**Older statement:** #708/#709 define a default bounded hold in months, UTC `paused_until`, `pause_collection[behavior]=void`, and a cron-derived resume.
**Winner:** D4 and D5.
**Amendment:** the donor chooses skip-one, bounded pause with an explicit resume date, indefinite pause, or direct cancel. The normal occurrence grid does not shift. A named skipped occurrence is suppressed, not deleted. The provider adapter may use any proven safe mechanism, but provider execution is not declared stopped without evidence. A due-row worker may enact a resume, guarded by epoch/CAS and provider reconciliation; the product contract is a civil-date schedule in the frozen giving zone, not a raw UTC duration. Cohort actions are the default; a line may split for independent management.

### A6 — Phase 13 donor portal edits

**Older statement:** #709 edits one-line subscriptions in place, uses `items[0]`, and expresses frequency changes as provider schedule phases.
**Winner:** D2–D5, D15 and D16.
**Amendment:** donor actions operate on Asym intent through explicit commands. Provider mutations are derived per cohort and exact item binding. Before save, show amount, next date, cadence and at least the next two or three projected dates. A change today that could charge immediately requires explicit confirmation. Pending processor work remains pending and the change applies only to the next eligible occurrence. Unknown/control-loss states quarantine unsafe mutations.

### A7 — Phase 13 completion and continuation seams

**Older statement:** #710 treats fixed-term recurring completion, continuation asks and task routing as Phase 13 seams and mixes “pledge completion” language into recurring state.
**Winner:** D1, D4, D17–D19.
**Amendment:** a recurring line may have an inclusive final eligible date and become ended after its final occurrence; that does not make it a fixed-total pledge. A fixed-total pledge has its own promise/progress/end/release model. No automatic continuation or conversion occurs. Any fixed-pledge reminder follows D19 explicit enrollment, Phase 17 governed content/sender/reply resolution, and Phase 6 intent/dispatch/history. Do not reuse stale continuation fields as an all-purpose commitment mechanism.

### A8 — Phase 13 provider adoption/cutover certainty

**Older statement:** the Phase 13 PRD/#706 describe adoption or cutover into managed recurring commitments with near-gap-free control assumptions.
**Winner:** D16.
**Amendment:** provider control is evidence-derived. Unknown or changed account/merchant/mode/application enters quarantine/reconciliation. Reconnection never implies recovered control. A different executor requires formal cutover, current authorization and proof the old executor stopped. Asym suppression is not proof that the provider stopped charging.

### A9 — Phase 7 and Phase 13 unified ACH finality

**Older statement:** ACH processing may trigger receipt issuance and Phase 13 may provisionally post it into private received totals.
**Winner:** D4 and D10 plus the unified Phase 13 source-finality amendment for one-time and recurring ACH.
**Amendment:** processing persists agreement/attempt/provider evidence and an initiation confirmation/projection only. It is neither received money nor an official receipt. Provider-confirmed success creates/posts the source occurrence once and emits at most one Phase 7 receipt-authorization pointer only when the frozen plan/ordinary policy admits an individual receipt; `annual_cumulative_cash` emits zero per-gift authorization/request/delivery and records year-end readiness. Phase 7 owns source receipt/correction facts, Phase 18 owns exact artifact/currentness/access, Phase 17 owns delivery, and Phase 19 coordinates any affected statement operation. A later return appends the Phase 13 money inverse and one Phase 7 correction pointer; every downstream owner advances separately.
**Required proof:** a processing→success→late-return fixture must show zero received/posting/Phase 7 authorization/Phase 18 request/Phase 17 delivery facts at processing; exactly one source occurrence/posting and zero-or-one semantic owner-chain authorization at success according to the frozen plan/policy, never duplicates; and exactly one money inverse plus one source-correction occurrence after return, including duplicate and out-of-order event replay. The proof must reject an atomic cross-domain receipt/statement mutation.

### A10 — Phase 9 pledge health and missionary dashboard

**Older statement:** a single `on-track/behind` fulfillment display and a support-vs-goal-first view.
**Winner:** D12 and D13.
**Amendment:** use lifecycle plus independent attention reasons, stale/unknown suppression and exact payment/occurrence facts. Lead the missionary view with cash received this month, then online recurring outcomes and the operational recurring list. Monthly goal coverage and forecast are secondary. Fixed pledges appear quietly only when relevant records exist.

### A11 — Phase 4/9 identity merge versus Commitment Party

**Older statement:** merge/dedupe re-points child records broadly.
**Winner:** D14.
**Amendment:** re-pointing duplicate identity storage does not transfer the promise or authorization. Commitment Party provenance remains visible. A genuine owner change supersedes the commitment/pledge and creates a new Party-owned record with fresh evidence.

### A12 — Phase 6 communication references and responsibility

**Older statement:** existing event types and relations refer to legacy `donor_pledges`, and older recurring issues name Email Studio/Resend directly.
**Winner:** D9 and D19 plus the Phase 6/17 boundary.
**Amendment:** Phase 16 derives typed domain meaning, purpose-specific recipient
projections, and deterministic candidate keys. It calls the Phase 6 idempotent
intent-submission seam only when the exact key is `Live` in the pinned Phase 17
activation generation. Unknown or `Reserved` keys remain source-suppressed with
zero Phase 6 state, and later activation never catches up historical
occurrences. Phase 6 owns the durable pre-dispatch intent, governed
delivery-profile version, consent/contactability, dispatch, communication event,
and outcome; Phase 17 owns governed templates and rendering. A UI may state only
the evidenced submission/delivery state and never “donor aware.”

### A13 — Phase 14 recognition versus Phase 16 fulfillment

**Older risk:** using a soft-credit or DAF-advisor row to satisfy a pledge.
**Winner:** D11 and D14.
**Amendment:** fulfillment is an immutable application from contribution designation line to expectation line. Recognition is not fulfillment, Party authority or legal donation ownership. An advisor/member/remitter may be suggested only through explicit typed roles and evidence.

### A14 — Phase 15 offline-gift entry versus fixed-pledge entry

**Older risk:** treating promise entry or fulfillment matching as another offline-money writer.
**Winner:** D11, D17, D18 and ADR-0010.
**Amendment:** pledge capture and plan editing write no money. Offline money posts only through the Phase 15 front door. Phase 16 then applies posted contribution lines using its conserved fulfillment operation.

### A15 — OpenSpec recurring lifecycle and self-service requirements

**Older statements:** `openspec/specs/donation-lifecycle/spec.md`, `openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md`, and `openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md` describe one Stripe subscription as a one-to-one pledge, a single canonical donation/subscription status, provider-confirmed mutation of a legacy pledge, and a simpler provider-owned recovery path.
**Winner:** D1–D16.
**Amendment:** Phase 16 must ship a new OpenSpec requirement that names the two aggregate kinds, group/cohort/line executor mapping, calendar schedule/occurrence contract, separate state axes, Asym retry policy, ACH recovery restriction, provider-control quarantine, append-only commands and provider-confirmed money finality. Existing active changes must be reconciled before implementation; ticket text does not override the new requirement.

## Published issue disposition

All verified issues below are open and carry `status:blocked`; this is correct. None is dispatchable from this package.

| Issue                               | Disposition after D1–D19                                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Epic #690                           | Remains the Phase 13 ledger/cart parent. Its recurring children require dated Phase 16 supersession before dispatch.                                                                                                                                                                                                             |
| #705, Fee-cover                     | Mostly orthogonal. Reconcile its recurring per-installment language with cohort/item execution and exact occurrence truth; do not let fee-cover config change existing recurring charges without the authorization rules that govern the underlying amount.                                                                      |
| #706, Recurring object + group      | **Materially superseded.** Retain append-only installment linkage, idempotent provider event handling and repo-owned intent. Replace one-subscription-per-line, donor×account grouping, six-state authority, `items[0]`, Smart-Retry assumptions and migration/cutover claims.                                                   |
| #707, Recovery/dunning              | **Materially superseded.** Replace Stripe-owned retry schedule, two-to-three-week lapse/park, per-attempt message pressure and hardcoded delivery stack with D6–D10.                                                                                                                                                             |
| #708, Pause/skip/hold               | **Partially superseded.** Preserve CAS/epoch race protection, drift reconciliation and truthful missionary display. Replace default month-duration product contract, UTC-as-business-calendar semantics, unconditional provider-stop claims and single-line executor assumptions with D4/D5/D16.                                 |
| #709, Donor self-service            | **Materially amended.** Preserve easy self-service, honest cancel, append-only commands, eligibility revalidation and redacted reads. Replace `items[0]`, one-line subscription operations, collapsed statuses and unsafe edits during control loss. Add donor-controlled next date/re-anchoring previews and cohort/line scope. |
| #710, Completion/continuation seams | **Re-scope.** Recurring planned end remains recurring-line lifecycle. Fixed-total pledge completion/release/reminder behavior belongs to D17–D19. No automatic continuation or conversion.                                                                                                                                       |

The Phase 16 ticket author MUST either supersede these bodies explicitly or mint Phase 16 children whose descriptions state exactly which Phase 13 clauses they replace. It MUST NOT create hidden duplicate build paths.

## OpenSpec delta required with the Phase 16 PRD

The Phase 16 spec package must add a normative requirement with at least these scenarios:

1. A recurring-giving group contains independently manageable destination lines and compatible collection cohorts; exact item binding prevents cross-line mutation.
2. Monthly is featured when enabled, while tenant-enabled cadence choices are truthful, grandfathered and calculated by one schedule engine.
3. One initial contribution per disclosed compatible cohort is attempted
   immediately—never per line or twice-monthly leg; future continuing dates are
   separately disclosed and cannot double-charge today.
4. Short-month, leap-year, twice-monthly and time-zone behavior remains anchored to the intended calendar grid.
5. Skip, pause, resume, cancel and date change preserve history, never create catch-up debt and never mutate an already submitted processor payment.
6. Card retry eligibility, slot consumption, three-later-occurrence runway and schedule-only continuation follow D7/D8.
7. ACH recovery permits no silent same-occurrence representment; the narrow donor-confirmed recovery grant is proof-gated and one-use.
8. Meaningful-transition communication is idempotent and uses the Phase 6 spine
   only for an exact key that is `Live` in the pinned activation generation;
   unknown/`Reserved` keys remain source-suppressed with zero Phase 6 state and
   no historical catch-up. Fixed-pledge reminders require explicit enrollment
   and tenant narrowing only.
9. Provider-control loss quarantines unsafe commands; reconnect enters reconciliation and a cutover requires old-stop proof plus current authorization.
10. A fixed-total pledge is total-first, may carry an optional expectation plan, and creates no charge, receipt or accounting entry.
11. Fulfillment applications conserve amount, distinguish unmatched/review states and reverse exactly when contribution truth reverses.
12. Donor, staff and missionary projections apply tenant/privacy policy and show separate schedule, payment and health facts.

The delta must identify the stale active changes `add-recurring-giving` and `add-donor-self-service` as reconciliation inputs. It must not silently edit merged history without a dated change record.

## ADR package required

The Phase 16 spec author should produce the following decision records because each establishes a durable, surprising or externally constrained boundary:

1. **Separate recurring commitments from fixed-total pledges** — D1; records why no universal pledge aggregate/status/editor exists.
2. **Compatible-cohort, explicit-leg recurring executor mapping** — D2/D3;
   records group/cohort/leg/line ownership and exact item binding in every
   applicable leg, superseding one-subscription-per-line.
3. **Donor-anchored civil-date schedule and occurrence semantics** — D3–D5; records initial contribution versus continuing schedule, frozen giving time zone, clamp-and-recover dates and no-drift/no-debt behavior.
4. **Asym-owned, schedule-first card retry runway** — D6–D8; records why provider Smart Retries are not the policy authority and how attempt budget/episodes work.
5. **Rail-isolated recurring ACH recovery** — D10; records the no-silent-representment rule and proof-gated donor-confirmed recovery grant.
6. **Evidence-derived provider-control quarantine** — D16; records observation versus control, reconnect/reconcile and executor cutover proof.
7. **Governed fixed-total pledge reminders** — D19; records explicit enrollment, the single gentle profile and tenant narrowing-only control.

The PRD author may combine adjacent ADRs only if the final records keep each independent invariant, rejected alternative and superseded predecessor discoverable.

## D1–D19 coverage ledger

| Decision | Ratified contract that must appear in the Phase 16 PRD                                                                                                                                                                                                                                                                                                                                                                      | Predecessor or later-phase binding                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1       | Separate recurring commitment and fixed-total pledge aggregates; collection arrangement and posted contribution remain orthogonal; no universal mutable status/editor or automatic conversion.                                                                                                                                                                                                                              | Amends roadmap and Phase 13 legacy pledge language; consumes Phase 13 ledger.                                                                                                                      |
| D2       | Explicit recurring-giving group, destination lines and compatible cohorts; explicit execution legs (ordinary normally one subscription, twice-monthly two 1st/15th legs) and exact item per line per applicable leg; line/cohort ownership; separate state axes; outbox, idempotency and reconciliation.                                                                                                                    | Supersedes #706 one-subscription-per-line and `items[0]`.                                                                                                                                          |
| D3       | Monthly featured when enabled; adjacent one-time choice; tenant-controlled weekly, every-two-weeks, twice-monthly, every-four-weeks, monthly, quarterly, semiannual and annual availability; grandfathering; one versioned schedule engine.                                                                                                                                                                                 | Extends Phase 2 tenant/site configuration and Phase 5 checkout; twice-monthly is 1st+15th, not a 14/15-day approximation.                                                                          |
| D4       | Immediate first contribution plus donor-controlled continuing anchor; today/future disclosure; no duplicate today; effective-dated epochs; giving time zone; clamp-and-recover dates; open-ended default; optional inclusive final eligible date; card/ACH finality distinctions.                                                                                                                                           | Narrows Phase 7 ACH receipt timing; replaces Phase 13 provider-anchor shortcuts. Daily is excluded from the Phase 16 cadence set.                                                                  |
| D5       | Skip one named occurrence; bounded or indefinite pause; unchanged normal grid; direct cancel; fresh authorization/new epoch on restart; no catch-up; cohort default with line split; missionary read-only pause visibility.                                                                                                                                                                                                 | Partially supersedes #708/#709; future notifications use Phase 17 governed content/sender resolution and Phase 6 dispatch/history.                                                                 |
| D6       | Guardrailed hybrid with Asym as retry-policy authority and Stripe as normal payment executor; no automatic retry for activation, ACH, hard decline/action-required or unknown control.                                                                                                                                                                                                                                      | Supersedes #707 Smart-Retry authority and mandatory early lapse.                                                                                                                                   |
| D7       | Card retry candidates: weekly +2/+4; nonweekly +2/+4/+6 local dates; 48-hour floor; no sliding/weekend shift; actual-attempt budget; unknown reservation; manual attempt consumes slot; stop control; Balanced/Off tenant profiles.                                                                                                                                                                                         | Schedule engine and occurrence attempts must share one policy implementation.                                                                                                                      |
| D8       | Triggering occurrence plus three later normally scheduled soft-failed occurrences may receive D7 bursts; fourth later becomes regular-schedule-only until episode resolution; no backcharge; future schedule continues; credential-wide rolling safety ceiling.                                                                                                                                                             | Supersedes `past_due → lapsed` merely on retry exhaustion and Phase 13 “park after 2–3 weeks.”                                                                                                     |
| D9       | Notify on meaningful transitions: recovery start, action required, terminal miss, recovery and legally required notices; semantic dedupe; no “donor aware” claim without outcome; semiannual/annual upcoming reminder.                                                                                                                                                                                                      | Phase 16 meaning/recipient facts, Phase 17 governed content/sender/reply resolution, and Phase 6 intent/dispatch/history; missionaries get in-product operational state without per-attempt noise. |
| D10      | Recurring ACH gets one ordinary unattended entry; no silent representment; optional exact-cohort R01/R09 donor-confirmed one-use recovery only with lawful/exclusive provider proof; separate one-time gift fallback; no anchor drift/debt.                                                                                                                                                                                 | Narrow ACH ADR; success-only official receipt; late-return inverse.                                                                                                                                |
| D11      | Separate money finality, designation, commitment, occurrence, attempt, fulfillment, recognition and certainty; immutable conserved applications; three closed automatic application proofs; deterministic structured-authority winners; single-use donor instructions; correction evidence distinct from application authority; exact reversal; ambiguous partial reversal quarantined; heuristic match is suggestion only. | Consumes Phase 13/15 money and Phase 14 recognition without conflation.                                                                                                                            |
| D12      | Derived multi-axis support health at line/pledge grain and cohort collection-lapse grain; lifecycle plus attention reasons; unknown/stale never healthy; bounded, reconstructable `review_after_at`; fixed pledge owns outcome/progress.                                                                                                                                                                                    | Replaces Phase 9 `on-track/behind` placeholder and Phase 13 six-state authority.                                                                                                                   |
| D13      | Missionary dashboard hierarchy is cash received this month, online recurring outcomes this month, recurring operational list, secondary goal coverage, 12-month forecast, then conditional Other commitments. Fixed pledges remain quiet.                                                                                                                                                                                   | Amends Phase 9 dashboard; privacy before aggregation; exact rational monthly-equivalent factors only for secondary comparison.                                                                     |
| D14      | One immutable Commitment Party plus separate effective-dated representative authority, service contact by purpose, expected remitter, collection authorizer, posted legal donor and recognition Party. No household/org/DAF inference; ownership change supersedes.                                                                                                                                                         | Reuses Phase 9 Party, Phase 12 authorization, Phase 14 recognition; qualifies Phase 4/9 merge re-pointing.                                                                                         |
| D15      | Broad but safe staff service desk with three independent gates and four truthful outcomes: Apply now, Complete with donor now, Awaiting authorization, Collection blocked. Provider-owned payment fields; MOTO only where supported; recurring ACH not TEL; append-only command journal.                                                                                                                                    | Consumes Phase 12 capabilities and Phase 15 secure phone-payment lane; no bulk widening.                                                                                                           |
| D16      | Evidence-derived control-loss quarantine with Managed/Degraded/At risk/Restricted/Unknown/Reconciling/External read-only postures; Asym suppression is not provider-stop proof; cancel intent recorded immediately; reconnect is not control; formal cutover.                                                                                                                                                               | Supersedes Phase 13 adoption/cutover certainty and prevents unsafe D5–D15 actions.                                                                                                                 |
| D17      | Fixed pledge total-first with optional One date / Even installments / Custom dates plan; explicit undated remainder; destination-bearing plan lines; no automatic charge/receipt/reminder; append-only versions and clear staff progress.                                                                                                                                                                                   | Keeps legacy offline pledge use lightweight; expectation dates later feed D19 only when explicitly enrolled.                                                                                       |
| D18      | One simple doorway with four truthful operations: donor-requested change, donor-requested ending, internal expectation release and entry correction; independent folds; conservation equation; no resurrection; exact inverse restore.                                                                                                                                                                                      | Fixed-pledge management only; no GL/legal adjudication or bulk write-off.                                                                                                                          |
| D19      | Quiet explicit enrollment in one Gentle two-touch fixed-pledge reminder profile; tenant maximum Off/Upcoming/Upcoming+follow-up; all start Off; tenant can narrow/disable only; candidate reproof; permanent semantic idempotency; GET read-only/POST stop.                                                                                                                                                                 | Phase 16 policy/candidates, Phase 6 delivery, Phase 17 content, Phase 25 shared recipient preferences. No missionary reminder noise.                                                               |

**Coverage result:** D1–D19 are each mapped to a PRD-owned contract, a predecessor amendment or a named later seam. There is no unassigned ratified decision.

## Dependency and build-order contract

The Phase 16 PRD should require this dependency order so agents cannot build UI over unsettled truth:

1. **Congruence and durable decisions:** land the dated amendments, OpenSpec delta and ADRs before implementation tickets become ready.
2. **Core types and ownership:** two aggregates, Party roles, group/cohort/line, fixed pledge, tenant keys, RLS, capability registry and ownership-matrix entries.
3. **Schedule and occurrence engine:** civil-date epochs, cadence rules, projection, occurrence identity and time-zone/DST tests.
4. **Executor binding and provider-control proof:** exact cohort/execution-leg/subscription/item mapping, command journal, reconciliation, control quarantine and idempotent event intake.
5. **Initial contribution and payment finality:** one immediate attempt per
   disclosed cohort, card/ACH state handling, receipt/confirmation boundary and
   duplicate prevention.
6. **Recurring management and retries:** date change, amount/cadence/payment method, skip/pause/cancel, D6–D10 attempt policy and no-drift/no-debt guarantees.
7. **Fixed pledge and fulfillment:** total-first entry, optional plans, D18 operations, conserved applications and reversals.
8. **Derived projections:** support health, missionary cash-first view, donor portal and staff service desk, all through Phase 3/10/12 controls.
9. **Communication candidates and seams:** D9/D19 record typed domain meanings
   and bounded candidates. After reproof and domain dedupe, an eligible current
   occurrence enters Phase 6 once through
   `compileAndReleaseCommunicationPlanOccurrence` only when its exact key is
   `Live` in the pinned activation generation, including governed one/zero-member
   results. An unknown or `Reserved` key is source-suppressed with zero Phase 6
   state; later activation is prospective and never catches up a historical
   suppressed occurrence. Only the private compiler transaction creates
   independently keyed child intents; producers never submit or commit them
   directly. Phase 6 creates events only at dispatch or in-product publication,
   and Phase 17 owns rendering. Future missionary pause email meaning has no
   Phase 16 runtime plan occurrence, intent, or event.
10. **Migration/reconciliation and proof:** evidence-only legacy classification, control/cutover quarantine, full invariant grids, accessibility, mobile and failure-recovery tests.

No ticket may create a temporary flat `donor_pledges` mutation path, parallel scheduler, parallel email queue, writable dashboard counter, or local fulfillment shortcut while waiting for a predecessor.

## PRD-author pins

The ratified decisions intentionally choose product behavior rather than every implementation name. The Phase 16 PRD author MUST pin the following without reopening founder decisions:

1. Exact table/module/type names for the two aggregates, cohorts, schedule epochs, occurrences, attempts, command journal, fulfillment applications and provider-control incidents. Names must make the domain distinctions obvious and fit repository conventions.
2. The exact tenant giving-time-zone configuration owner, fallback behavior for a missing configuration, and the deterministic DST resolver. It must be distinct from tax time zone, site locale and donor browser time zone.
3. The precise accepted-recurring-agreement boundary for guest checkout and processing ACH, including recovery after browser loss. Mere abandonment creates no durable donor-facing agreement; an accepted processor state does.
4. The provider-capability matrix for each Stripe operation and pinned API behavior: multi-item subscriptions, anchors, schedules, pauses, retries, ACH recovery, MOTO and connected-account control. Unknown capability fails closed.
5. The exact state/event names and projection labels. They may improve wording but may not collapse the ratified axes.
6. The legacy `donor_pledges` classification algorithm and evidence hierarchy. Ambiguous rows enter review/quarantine; no heuristic silently classifies fixed pledge versus recurring commitment or asserts executor control.
7. The amendment/supersession mechanics for #706–#710 and active OpenSpec changes. Do not leave two buildable definitions of the same behavior.
8. The exact Phase 17 template identifiers and localized copy contracts for D9/D19. Phase 16 only pins typed merge facts, purpose class, eligibility and preview states.
9. Counsel/compliance evidence gates for recurring card terms, ACH authorization/recovery, staff-assisted recurring changes, cancellation and reminder consent. The PRD must distinguish legal-review gates from product defaults and must not present itself as legal advice.
10. Performance budgets, projection materialization strategy and retention periods. Derived caches must be rebuildable; source events, authorization evidence and money truth remain durable according to predecessor retention contracts.

If another decision is genuinely absent during PRD writing, it must be added to a visible **PRD-author pin** with a conservative fail-closed default and an owner. It must not be guessed inside a later ticket.

## No-dangling-conflict audit

| Audit question                                                                         | Result                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does every ratified D1–D19 decision have a Phase 16 owner or named later seam?         | **Yes.** See the coverage ledger.                                                                                                                                 |
| Is any money truth duplicated outside the Phase 13/15 append-only contribution path?   | **No.** Commitments, expectations and fulfillment applications do not post money.                                                                                 |
| Is any recognition or legal-donor fact redefined?                                      | **No.** Phase 7/14 remain authoritative.                                                                                                                          |
| Can a dashboard/status field become a second writable source of truth?                 | **No.** All health, totals, monthly equivalents and summaries are derived.                                                                                        |
| Can a tenant, staffer, missionary or donor bypass Phase 3/10/12 controls?              | **No.** All reads/actions use the shared projection and capability floors.                                                                                        |
| Is provider observation confused with executor control?                                | **No.** D16 quarantine and proof-gated recovery/cutover are mandatory.                                                                                            |
| Is an ACH processing state confused with successful money?                             | **No after A9.** Initiation confirmation and official receipt are separated.                                                                                      |
| Is a missed recurring occurrence treated as collectible debt or silently back-charged? | **No.** D4/D7/D8/D10 prohibit it.                                                                                                                                 |
| Is a fixed pledge overbuilt into the main missionary workflow?                         | **No.** D13/D17 keep it conditional and quiet while preserving correct fulfillment.                                                                               |
| Are communication policy, content preparation, and delivery ownership separated?       | **Yes.** Phase 16 domain meaning/candidates; Phase 17 governed content/sender/reply resolution; Phase 6 durable intent, consent, dispatch, delivery, and history. |
| Are stale Phase 13 issues safe to dispatch unchanged?                                  | **No.** They remain blocked and have explicit dispositions above.                                                                                                 |
| Is any unresolved product choice hidden in this package?                               | **No.** Remaining implementation selections are enumerated as PRD-author pins.                                                                                    |

## Dated Phase 20 congruency amendment (2026-07-27)

Phase 16 owns commitment intent, schedule/occurrence truth, fulfillment
expectations, and provider-control evidence; none of those expected or future
facts enters an Accounting Release. Phase 20 may consume only exact posted
Phase 13/15 source occurrences, processor settlement evidence, or a later
source-owned approved-expense handoff. Each recurring financial root freezes
its Legal Entity and effective Settlement Account Binding; Phase 12
Legal-Entity scope is rechecked before any deferred action. QBO/Xero remains
authoritative for accepted accounting records, books, periods, and final
reconciliation.

## Final congruence verdict

**GREEN — the completed Phase 16 spec package incorporates A1–A15, the D1–D19 coverage ledger, the required ADR/OpenSpec package, and the PRD-author pins. No dangling product conflict remains in the documentation package.**

**HARD STOP — do not mark Phase 16 or the stale Phase 13 recurring children ready for implementation until `/to-tickets` regenerates or explicitly supersedes the ticket set against this final contract.** Groomed-not-dispatched children remain `status:blocked`; dispatch is a separate founder decision.
