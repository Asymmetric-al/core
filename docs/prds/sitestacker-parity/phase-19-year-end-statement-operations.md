# Phase 19 — Year-End Statement Operations: Frozen, Reviewed Bulk Fulfillment with Separately Authoritative Outcomes

## Status

**PRD exists; groomed but not dispatched.** This document authorizes planning only. It does not authorize implementation, schema changes, issue dispatch, or a `ready-for-agent` label.

**Decision authority:** Phase 19 `/grill-with-docs` D1-D18, ratified by Conrad on 2026-07-22 and 2026-07-23. Where older repository language conflicts, the decisions and explicit congruence appendix in this document control for Phase 19.

**Confirmed testing seam:** the tenant- and actor-scoped **Statement Operations service** described below. Conrad confirmed this seam on 2026-07-24 before specification drafting continued.

**Companion contracts:**

- [ADR-0040 — Canonical statement-run authorities and atomic release](../../adr/0040-canonical-statement-run-authorities-and-atomic-release.md)
- [ADR-0041 — Contract-derived statement fulfillment and containment](../../adr/0041-contract-derived-statement-fulfillment-and-containment.md)
- [ADR-0042 — Truthful statement operations and minimized evidence](../../adr/0042-truthful-statement-operations-and-minimized-evidence.md)
- [OpenSpec change — Add Statement Operations](../../../openspec/changes/add-statement-operations/proposal.md)

**Program-order gate:** implementation dispatch remains blocked until the Phase 17 and Phase 18 authority contracts are merged, accepted, or explicitly superseded and their ownership is reconciled. The Phase 19 planning package may be reviewed and merged independently; it does not make those predecessor runtimes live.

## Problem Statement

Year-end statements are high-volume, deadline-sensitive operations. Finance may need to prepare tens of thousands of exact donor documents, send or print them through different routes, watch recipient-level outcomes, recover failures, answer donor questions, and prove what happened. That is a bulk operations product, not a loop over an editable year filter.

The repository's current annual-statement route recomputes mutable donor data into a live `.txt` download. It has no frozen population, exact reviewed release, durable recipient operations, archival PDF identity, delivery finality, physical-fulfillment evidence, cooperative containment, late-fact handling, truthful completion, or minimized audit record. Treating that route as a foundation would create split-brain statement truth and technical debt.

Finance staff need one fast, calm workspace while the product preserves separate authority for:

- source eligibility, legal donor, gift dates, coverage, and corrections;
- generated-document identity, current artifact, exact bytes, and access;
- communication intent, provider evidence, and delivery outcomes;
- portal availability;
- print preparation, custody, provider handoff, and postal evidence;
- run participation, release, controls, completion, and evidence projection.

Tenant flexibility must not become a legal-rules editor, destination free-for-all, provider-status dependency, or approval bureaucracy. Ordinary users should see only the decisions and exceptions they can safely act on.

## Solution

Build one canonical **Statement Operations** product over one purpose-pinned **Statement Run** and **Run Item** model.

The permanent flow is:

1. Source authorities provide exact eligible **Statement Subjects**, source closures, and versioned facts.
2. Phase 19 builds one immutable, inert **Run Preflight**.
3. Staff review exceptions and any deliberate participation or delivery changes.
4. One atomic **Start live run** operation promotes the exact reviewed candidate and opens its release barrier.
5. Recipient-level work proceeds through tenant-fair, fenced claims.
6. Phase 18 generates and owns each exact current document artifact.
7. Phase 17/6 owns communication preparation, Resend transport, and monotonic delivery evidence.
8. Phase 19 owns statement-specific orchestration, portal-operation coordination, physical fulfillment, containment, completion, late-fact follow-up, and evidence projection.
9. Staff may mark a run complete without erasing or relabeling independently live downstream truth.

The **Year-End Operations** workspace is a permission-filtered, rebuildable projection. It may group compatible purpose-pinned runs for convenience, but it is never a campaign parent, lifecycle authority, idempotency source, or global completion state.

## Product outcomes

1. Finance staff can prepare, review, and start a normal run in a few clear steps.
2. Every released run exactly matches one reviewed immutable preflight.
3. One failed recipient never blocks unrelated recipients.
4. Legal donor, recognition, destination, document, communication, portal, print, and completion truth never collapse into one misleading status.
5. Tenants control legitimate participation, delivery, paper, staffing, approval, and follow-up choices without receiving a legal-rules engine.
6. Self-print is the quiet default; connected mailing remains optional and proof-gated.
7. Donors have unmetered access to the exact current statement and may deliberately request another copy without duplicate effects.
8. Healthy automation stays quiet; exceptions name one cause owner and one next action.
9. The product remains tenant-safe, fair, and responsive at certified January volume.
10. No live-text annual-statement runtime or alternate statement-run writer remains.

## Goals

- Create one purpose-pinned Statement Run and Run Item system.
- Freeze exact inclusion and exclusion evidence before release.
- Support ordinary same-person release and narrowly protected release without bureaucracy.
- Preserve source-owned eligibility and purpose-owned legal behavior.
- Give tenants bounded, inspectable control over participation and fulfillment.
- Provide fair, resumable, idempotent execution at certified seasonal volumes.
- Make pause, resume, stop, completion, correction, supplemental work, and recovery truthful.
- Provide one coherent staff workspace and one calm donor-year presentation.
- Reuse Phase 17 and Phase 18 rather than introducing new message or document engines.

## Implementation Decisions

1. **D1 — Canonical purpose-pinned runs:** one authoritative run/item system behind a disposable Year-End Operations projection.
2. **D2 — Exact reviewed atomic start:** one immutable Run Preflight, one atomic release barrier, and separately authoritative downstream truth.
3. **D3 — Source-owned subjects:** Phase 7 legal-donor Statement Subjects, optional purpose-separated recognition, and independently authorized Delivery Recipients.
4. **D4 — Prospective receipt plans:** exact-issuer Canadian receipt plans are source-frozen; Canadian behavior is structurally absent without an active Phase 18 pack.
5. **D5 — Immutable primary release:** source-owned year-boundary check evidence and a contract-owned late-fact lane never reopen the original run.
6. **D6 — Delivery profiles:** tenant-authored Statement Delivery Profiles compile into code-owned compatible Fulfillment Plans and execution lanes.
7. **D7 — Frozen recipient snapshot:** one reviewed destination snapshot changes only through governed destination succession.
8. **D8 — Cooperative containment:** one control fence governs Pause, Resume, Stop, and urgent privacy containment.
9. **D9 — Self-print first:** secure exact-artifact packages are standard;
   mail-house and at most one proof-gated connected provider with separate
   administration/paid-lane authority and a tenant spending guard are optional.
10. **D10 — Staff-controlled completion:** authorized staff complete a run; Asym derives clean or exception outcome and preserves live follow-up.
11. **D11 — Certified fair capacity:** workload-shaped certification, tenant-fair execution, protected critical-message capacity, and one bounded target date.
12. **D12 — One help doorway:** **Help with this statement** resolves intent and routes to the owning command.
13. **D13 — Proportional communication:** a finite contract-owned statement communication catalog; no tenant event matrix or second message system.
14. **D14 — Proportional approval:** same-person standard release; exactly one independent reviewer only for contract-protected or tenant-strengthened runs.
15. **D15 — Optional Support overview:** one separate **Support overview — Not a tax document**, off by default.
16. **D16 — Exact-current access:** unmetered donor view/download/local print and repeatable, bounded outbound-copy fulfillment.
17. **D17 — Minimized evidence:** one PII-minimized Run Evidence Record and one governed temporary audit package.
18. **D18 — Bounded participation:** tenant-authorized run participation over source-authoritative eligibility; no legal or gift-line override.

## Out of Scope

- Tenant-authored eligibility, tax, jurisdiction, receipt, gift-date, coverage, or legal-donor rules.
- A durable year-end campaign parent or global campaign completion state.
- A generic workflow builder, approval builder, routing DSL, spreadsheet editor, saved-query runtime authority, or priority marketplace.
- A second renderer, statement generator, communication history, event store, notification system, contact store, records system, or audit platform.
- Per-gift statement editing, legal-donor picking, gift-line override, force-include, or run-local facts editing.
- Automatic household merging or a combined official household tax statement.
- NCOALink client, match engine, licensing product, or automatic CRM overwrite. A future NCOALink-to-CRM capability requires separate grooming.
- Printer drivers, desktop agents, presort/postage engines, mail-house marketplaces, or provider auto-switching.
- Generic retry, resend-all, force-send, predecessor resend, or blind retry after ambiguous handoff.
- Donor-visible access quotas, downloadable-copy inventories, DRM, or a custom PDF viewer.
- A permanent audit-package library or report builder.
- Legacy compatibility, dual runtime, or extension of the live-text statement route.

## Authority hierarchy

When sources conflict, apply this order:

1. Phase 7 legal donor, eligibility, facts, official coverage, and correction authority.
2. Phase 13 posted ledger and line-level money truth.
3. Phase 14 recognition and gift-date relationship projection.
4. Phase 18 purpose contract, generated-document admission, identity, artifact, currentness, and access.
5. Phase 17/6 communication contract, consent, suppression, prepared message, provider evidence, and monotonic outcome.
6. Phase 19 frozen population, run participation, release, recipient-operation coordination, physical fulfillment, containment, completion, and Run Evidence Record.
7. Current privacy, restricted-person, records, incident, and authorization policy.
8. Rebuildable UI projections, aggregates, caches, provider labels, estimates, and search indexes.

Provider URLs, current contact defaults, browser selections, run completion, download events, mail status, and operational projections never establish document, money, legal-donor, eligibility, or delivery truth.

## Dependencies and ownership

| Concern                                                              | Authority                      | Phase 19 behavior                                                     |
| -------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| Legal donor, eligibility, gift date, coverage and corrections        | Phase 7                        | Consume exact immutable source contracts; never infer or edit         |
| Posted money and designation lines                                   | Phase 13                       | Reference exact source revisions; never recalculate                   |
| Recognition and historical relationship                              | Phase 14                       | Consume separately for optional informational output                  |
| Document purpose, identity, current artifact, exact bytes and access | Phase 18                       | Submit item-authoritative intents and reference owner state           |
| Message content, consent, sender, transport and delivery outcome     | Phase 17/6                     | Admit finite occurrences and reference owner state; never call Resend |
| Run population, release, participation, orchestration and controls   | Phase 19                       | Own                                                                   |
| Portal presentation                                                  | Donor portal + Phase 18 access | Coordinate visibility; never claim access or receipt                  |
| Physical fulfillment                                                 | Phase 19                       | Own exact-artifact packaging, custody and normalized evidence         |
| Contact/destination source                                           | Party/contact authority        | Freeze reviewed revisions; do not create a shadow contact store       |
| Privacy incidents and legal holds                                    | Existing owner                 | Close the run fence and link evidence; do not duplicate case state    |
| Workflow execution                                                   | Inngest                        | Execute identifier-only work; never own business truth                |

## Repo anchors — REAL today versus FORWARD

### REAL today

- The donor-portal annual-statement handler recomputes current donor data into a `.txt` response.
- `getOwnedStatementDonations` filters current settled donations by UTC year.
- The donor statement route is a thin adapter to that legacy statement handler.
- The generated-document purpose catalog registers annual U.S. and Canadian cumulative purposes behind the `phase19_statement_seam` launch gate. The optional `giving.summary.informational@1` purpose is currently gated only by the Phase 18 renderer/artifact pipeline; the Phase 19 contract requires its separate Phase 7/13/14/19 purpose-and-privacy proof before activation.
- `admitDocumentPurpose` demonstrates a side-effect-free purpose-admission boundary, not a statement-run implementation.
- The existing workflow ledger, claim, dispatch, and recovery modules demonstrate reusable durable dispatch, fencing, and recovery patterns.
- The shared API package is the established business boundary; application route handlers are thin adapters.
- The Phase 17 and Phase 18 documents in this directory are proposed authority contracts, not proof that their full runtimes are live.

### FORWARD, not live

- One Statement Operations service becomes the only Phase 19 application boundary.
- One canonical relational run/preflight/item/recipient-operation model becomes the only statement-run authority.
- Phase 19 UI actions, API adapters, workflow functions, recovery scans, reconciliation workers, and support actions all delegate to that service.
- Phase 18 remains the only generated-document system.
- Phase 17/6 remains the only email/in-product communication system.
- The live `.txt` statement route and all alternate annual-statement assembly paths are removed before production.

Nothing in this PRD claims the forward elements are implemented.

## Canonical vocabulary

- **Statement Run:** One immutable released population for one exact tenant/environment, issuer, purpose, period, policy set, and cutoff.
- **Run Draft:** Editable server-owned candidate configuration before preflight.
- **Run Preflight:** Immutable inert candidate manifest reviewed before release.
- **Run Item:** One governed Statement Subject/document candidate, never an email address or gift line.
- **Statement Subject:** Exact Phase 7 legal donor or valid source-proved joint donor.
- **Recognition Subject:** Purpose-separated person or household recognized through Phase 14.
- **Delivery Recipient:** Independently authorized person or representative receiving an exact document.
- **Year Presentation Group:** Disposable navigation grouping with no authority.
- **Participation Decision:** Append-only run-local automatic/include/hold/permitted-omit decision.
- **Document Period:** Source- and jurisdiction-owned period represented by the statement.
- **Source-Fact Cutoff:** Exact source closure included in the reviewed run.
- **Readiness Target:** Tenant operational goal shown as **Target ready for
  review by**; never eligibility, release authority, or legal authority.
- **Compliance-Risk Rule:** Versioned source-, jurisdiction-, or tenant-owned
  evidence-and-review policy that may strengthen proof for exceptional dating;
  it never changes gift date, Document Period, Source-Fact Cutoff, or release
  authority.
- **Late Fact Obligation:** Deduplicated post-release fact requiring no action, supplemental coverage, correction, or replacement. Its permanent logical slot is tenant/environment + primary run + Statement Subject + source-fact identity + purpose contract; source revisions append through compare-and-swap instead of creating parallel open obligations.
- **Supplemental Run:** New reviewed operation covering post-release facts without reopening the primary run.
- **Statement Delivery Profile:** Versioned tenant-authored configuration of permitted statement routes.
- **Fulfillment Plan:** Frozen compatible route plan for one recipient-document operation.
- **Execution Lane:** Derived mutually exclusive operational lane for an executable route step.
- **Recipient-Document Operation:** One Statement Subject, logical document, authorized recipient, and fulfillment intent.
- **Recipient Delivery Snapshot:** Frozen recipient, destination, authority, locale, Site, route, and revision evidence.
- **Destination Succession:** Governed append-only replacement of an eligible destination for future execution.
- **Run Control Posture:** Running, pause requested, paused and contained, stop requested, or remaining work stopped.
- **Control Fence:** Atomic authority preventing stale claims from crossing irreversible boundaries.
- **Physical Fulfillment Attempt:** One self-print, mail-house, or connected-provider attempt using exact artifact bytes.
- **Completion Snapshot:** Immutable tenant attestation plus system-derived clean or exception outcome.
- **Statement Communication Occurrence:** One permanent semantic donor-message occurrence admitted by Phase 19 and delivered by Phase 17.
- **Support overview:** Separate `giving.summary.informational@1` document always labeled **Support overview — Not a tax document**.
- **Run Evidence Record:** PII-minimized projection of frozen release/completion evidence and links to owner truth.
- **Audit Package:** Temporary scope-bound derivative of currently authorized evidence.

## Product information architecture

### Year-End Operations

- Group purpose-pinned runs by year and issuer.
- Show separate population, documents, portal, communication, and paper axes.
- Lead with the current safe action and grouped exceptions.
- Avoid KPI walls, blended progress, provider jargon, and technical identifiers.
- Permit compatible multi-run convenience actions only when each underlying command remains independently truthful.

### Run Preflight

- Exact purpose, issuer, period, cutoff, and policy summary.
- Included, excluded, blocked, held, already-current, and changed populations.
- Reconciled counts and per-currency totals.
- Delivery-lane and paper-method preview.
- Standard or protected release posture.
- One **Start live run** or **Request review** action.
- Safe confirmation focus on **Keep reviewing**.

### Run operations

- Persistent control banner only when the posture is not ordinary running.
- Recipient operations with server-side filters, grouping, and pagination.
- Separate document, portal, communication, and physical evidence.
- Completion review and collapsed **Run record**.
- Technical detail disclosed only when it helps diagnosis.

### Year-end statement delivery

One settings area for:

- organization default;
- Site and recipient-profile assignments;
- primary route;
- unavailable/final-failure behavior;
- paper method;
- portal posture;
- statement communication summary;
- synthetic preview and aggregate impact;
- immutable profile publication.

### Party Giving tab

One logical statement row and the shared **Help with this statement** destination. It must not implement a second recovery path.

### Donor portal

- One calm yearly group.
- Official documents first.
- Optional Support overview second.
- Exact-current **View statement**, **Download PDF**, **Print**, **Send another copy**, and **Help** actions.
- No access counter, copy inventory, provider state, superseded artifact picker, or legal-operation vocabulary.

## Role-specific experience

- **Finance/run operators:** prepare, review exceptions, start, control, complete, and recover runs.
- **Donor care:** use contextual help for one exact statement without entering bulk operations.
- **Reviewers:** see one exact candidate and one atomic approve-and-start action only when required.
- **Tenant administrators:** configure capabilities, delivery profiles, paper defaults, optional Support overviews, and bounded internal follow-up.
- **Auditors/records staff:** inspect the Run Evidence Record and request one governed temporary package.
- **Donors/authorized representatives:** repeatedly access the exact current artifact and request permitted additional delivery.
- **Missionaries:** receive no new official-document, spouse, household, DAF, destination, or tax-detail access.

## Domain and data model requirements

This section defines logical authorities and invariants. It does not require one physical table per noun.

### Mutable before release

- Run draft and expected revision.
- Current candidate population projection.
- Append-only participation decisions.
- Statement Delivery Profile drafts and immutable publications.
- Run-only route changes.
- Reviewer request evidence.
- Optional **Target ready for review by**.

### Immutable Run Preflight

The preflight pins:

- tenant and environment;
- live or synthetic test mode;
- issuer, jurisdiction pack, activation epoch, and compliance profile;
- document purpose/version/digest and output policy;
- period, source cutoff, issuer timezone, and canonicalization version;
- ordered included, excluded, blocked, held, and already-current Statement Subjects with stable reasons;
- Phase 7 fact closures and coverage identities;
- Phase 18 publication-resolution pins;
- Phase 17 communication-plan-resolution pins;
- portal and physical-fulfillment policies;
- delivery-profile versions and assignments;
- recipient/destination revision evidence;
- for any connected direct-mail route: exact mailpiece count, provider
  connection/capability revision, billing currency, a provider quote or
  certified upper-bound total with as-of/expiry, and the tenant's current
  direct-mail spending-guard revision;
- counts, per-currency totals, the derived release-floor contract/version/reason,
  eligible-review policy, and manifest digest.

Review request, reviewer delegation, and decision evidence are separate
compare-and-swap-bound records that reference the exact preflight; they are not
part of the candidate digest they review. `approveAndStartLiveRun` re-proves
both the immutable preflight and the current review record, then appends the
final review decision inside D2's atomic release transaction.

Test preflights use synthetic data only, are visibly watermarked, cannot allocate official identity or donor history, and can never be promoted to live.

A connected direct-mail candidate is blocked when exact cost cannot be bounded,
the quote/upper bound is expired, or the total exceeds the tenant's spending
guard. The start transaction re-proves the count, quote/upper bound, and guard;
a change stales the preflight with zero external effect.

### Released run

- Exists only after D2's atomic transaction.
- Exact idempotent replay returns the same run.
- Changed semantic reuse conflicts.
- Frozen membership is never edited after release.
- Cross-run coverage identities prevent duplicate official work.
- One release barrier controls claimability.
- No external I/O occurs inside the start transaction.

### Run Item and Recipient-Document Operation

- A Run Item binds one Statement Subject and exact source coverage.
- Source gift and recognition lines remain inclusion facts beneath the item; they are not Phase 19 run items.
- A Recipient-Document Operation independently binds the authorized recipient, destination snapshot, logical-document intent, portal posture, Fulfillment Plan, and route steps.
- Shared destinations never merge items.
- Each route step has one execution lane and permanent semantic identity.

### State axes

Do not create one global status enum or a blended progress percentage.

| Axis          | Closed launch vocabulary                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Population    | `included`, `held`, `not_in_this_run`, `already_current`, `blocked`, `excluded`                                                                                                          |
| Document      | Phase 18-owned `requested`, `admitted`, `ready_current`, `blocked`, `failed`, `replaced`, `cancelled` projections                                                                        |
| Portal        | `unavailable`, `available`, `restricted`, `revoked`; availability is not access                                                                                                          |
| Communication | Phase 17-owned plan/preparation, provider-submission, mail-server delivery, reputation, and evidence-health projections; never one flattened status                                      |
| Paper         | `ready`, `package_prepared`, `downloaded`, `printed`, `partly_printed`, `transferred`, `accepted`, `in_production`, `postal_handoff`, `returned`, cancellation states, `outcome_unknown` |
| Control       | `running`, `pause_requested`, `paused_contained`, `stop_requested`, `remaining_work_stopped`                                                                                             |
| Completion    | current closeout posture `open`, `completed`, `completed_with_exceptions`, or `active_review_after_completion`; immutable numbered Completion Snapshots remain separate                  |
| Audit package | `preparing`, `ready_until_expiry`, `downloaded`, `expired_disposed`, `needs_attention`                                                                                                   |

### Database invariants

- Composite tenant/environment ownership and same-scope foreign keys.
- Issuer-bearing relationships enforce the exact issuer.
- `ENABLE RLS` plus `FORCE RLS` on tenant-bearing tables.
- Server-derived scope, authorization, and semantic fingerprints.
- Immutable preflight, release, completion, and event evidence.
- Unique coverage and operation identities.
- Exact replay versus changed-key conflict.
- Optimistic CAS for drafts, preflights, profiles, participation, review, control, succession, and completion commands.
- Bounded leases, fencing, transactional outbox, recovery scans, and reconciliation.
- Tenant-fair claims and protected interactive/critical-message capacity.
- No exact destination PII in generic run evidence, logs, metrics, filenames, or queue payloads.
- Exact destination material only in encrypted, purpose-bound execution records.
- Identifier-only workflow events.
- Set-based/keyset processing; no browser population assembly, offset walk at scale, or skip-errors commit.
- Restrictive deletion; released evidence is append-only or disposed through the owning records contract.

## Statement Operations application boundary

### Primary public seam

All Phase 19-owned UI, route handlers, workflow functions, recovery scans, and physical-provider adapters use one tenant- and actor-scoped **`StatementOperationsService`** application boundary. Phase 17 and Phase 18 workers and adapters continue through their own public boundaries and return owner evidence through typed ports.

The service exposes explicit typed commands and queries. It is not one mega-function and does not leak database rows, Inngest internals, Resend payloads, renderer APIs, or provider-specific states.

### Commands

| Command family       | Observable contract                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Draft                | Create or update one purpose-pinned run draft with expected-revision CAS                                            |
| Preflight            | Build or rebuild an exact immutable preflight; compare typed stale deltas                                           |
| Participation        | Include, hold, permitted-omit, restore automatic, add eligible subject, or apply one exact bulk decision            |
| Delivery profile     | Draft, preview impact, publish, archive, assign, and apply reviewed run-only compatible changes                     |
| Review               | Request, change, cancel, or request changes for protected review                                                    |
| Release              | Start a standard run or approve-and-start a protected run atomically                                                |
| Control              | Preview and execute Pause, Resume, Stop, and urgent privacy containment                                             |
| Destination          | Create governed destination succession after current authorization and handoff proof                                |
| Physical fulfillment | Prepare/revoke package; record print, transfer, provider, postal, cancellation, return, and reconciliation evidence |
| Target               | Set, change, or remove **Target ready for review by**                                                               |
| Completion           | Mark complete, stop-and-complete, or return to bounded active review                                                |
| Help/copy            | Resolve contextual intent and admit one bounded additional-copy occurrence                                          |
| Evidence             | Prepare, authorize, stream, expire, and dispose one temporary audit package                                         |

The service receives one trusted, server-resolved execution context containing:

- tenant and environment;
- stable human or service principal and active assignment;
- effective-access token and assurance;
- governance epoch; and
- trace identity.

Command DTOs never accept caller-authoritative tenant, environment, actor, role, capability, or assurance fields.

Every consequential command carries only:

- the target resource;
- the expected revision or fence;
- an opaque client replay token; and
- bounded command-specific input.

The server derives the permanent semantic slot and immutable command fingerprint. Exact replay returns the original result; reuse with changed normalized input conflicts. Authorization and currentness are re-proved at commit.

### Queries

- Year-End Operations workspace.
- Exact Run Preflight and typed stale comparison.
- Recipient workspace with server-side filtering, grouping, pagination, and masked destinations.
- Run detail with independently authoritative axes.
- Delivery Profile, assignment, impact, lane, and **Why this route?** projection.
- Paper-fulfillment projection.
- Grouped attention and current follow-up.
- Contextual help action projection.
- Donor yearly document projection.
- Run Evidence Record and audit-package state.

Queries return authorized projections, not mutable source-of-truth copies. Counts are permission-filtered and must reconcile to item truth.

### Typed service contract

These names define the public behavior. Implementations may compose private helpers, but routes and workers may not expose an alternate command.

| Public command                                                                                  | Command-specific input after trusted context and shared replay/CAS fields                                                                                    | Closed successful result                                                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `saveRunDraft`                                                                                  | purpose, issuer, period, source cutoff, policy selection, optional target                                                                                    | new or replayed draft revision                                             |
| `buildRunPreflight`                                                                             | draft revision                                                                                                                                               | immutable preflight identity, digest, reconciled counts, typed blockers    |
| `applyParticipationDecision`                                                                    | preflight candidate, Statement Subject, automatic/include/hold/permitted-omit decision, bounded reason/note where required                                   | new candidate revision and invalidated prior review                        |
| `applyBulkParticipationDecision`                                                                | server-materialized selection identity, expected count/digest, one compatible decision                                                                       | all-applied result or exact reconciliation conflict; never skip-errors     |
| `saveDeliveryProfileDraft` / `previewDeliveryProfileImpact`                                     | bounded profile fields or exact draft revision and assignment scope                                                                                          | draft revision or permission-filtered synthetic/aggregate impact           |
| `publishDeliveryProfile` / `archiveDeliveryProfile`                                             | exact draft/impact identity or published profile revision                                                                                                    | immutable publication or archive revision; typed compatibility blocker     |
| `assignDeliveryProfile` / `applyRunDeliveryChange`                                              | exact supported scope or candidate-only reviewed selection, profile/route, reason/effective interval                                                         | immutable assignment or pre-Start run-only decision                        |
| `requestRunReview` / `changeRunReviewer` / `cancelRunReview` / `requestRunChanges`              | exact preflight/review identity and eligible reviewer or bounded note where applicable                                                                       | current review projection; no release effect                               |
| `startLiveRun` / `approveAndStartLiveRun`                                                       | exact preflight, release-floor version, review evidence when protected                                                                                       | newly released or exactly replayed run                                     |
| `pauseRun` / `resumeRun` / `stopRemainingWork` / `containOutgoingDelivery`                      | run, control epoch, preview identity, bounded reason where required                                                                                          | new control posture plus truthful settlement projection                    |
| `supersedeDestination`                                                                          | recipient operation, predecessor route, saved or purpose-bound contact revision, this-statement/future-contact choice                                        | one new successor identity or reconciliation blocker                       |
| `preparePrintPackage` / `openPrintPackage` / `revokePrintPackage`                               | run or exact pieces, package revision, current storage/access fence                                                                                          | fixed package state, authorized byte stream, or future-access revocation   |
| `recordPrintOutcome` / `recordPostalHandoff` / `recordPhysicalEvidence`                         | exact package/attempt revision and typed counts/evidence                                                                                                     | reconciled physical-attempt projection                                     |
| `saveDirectMailConnection` / `testDirectMailConnection` / `activateDirectMailConnection`        | proof candidate, test/live environment, write-only credential input, capability/cost-guard evidence                                                          | write-only connection posture or exact activation blockers                 |
| `setDirectMailSpendingGuard` / `rotateDirectMailCredentials` / `disconnectDirectMailConnection` | connection revision, billing-currency ceiling, write-only replacement, or current control fence                                                              | new connection/guard posture; no implicit mail submission                  |
| `reauthorizeDirectMailExecution`                                                                | run, exact remaining-piece selection/digest, prior authorization revision, compatible connection/capability revision, current quote/upper bound and guard    | new bounded execution-authorization revision or typed incompatibility      |
| `submitDirectMail`                                                                              | exact Start-authorized released pieces or admitted copy occurrence, provider connection revision, current quote/upper-bound and tenant spend-guard revisions | one paid physical attempt or external-outcome-unknown reconciliation state |
| `setTargetReadyForReview`                                                                       | run, future instant or removal, optional bounded note                                                                                                        | target revision and evidence-based planning projection                     |
| `markRunComplete` / `stopRemainingWorkAndMarkComplete` / `returnRunToActiveReview`              | run/control/completion revisions, optional bounded note or required short return reason                                                                      | numbered Completion Snapshot and derived current closeout posture          |
| `resolveStatementHelp` / `requestAdditionalCopy`                                                | logical document, closed intent, reviewed recipient/route/destination revision, plus paid-route connection/cost/guard revisions when applicable              | owner-routed action or one fresh/replayed copy occurrence                  |
| `prepareAuditPackage`                                                                           | run, governed audit purpose, requested evidence classes                                                                                                      | fixed requester- and scope-bound package revision                          |
| `openAuditPackage`                                                                              | exact package revision and current authorization/access fence                                                                                                | reauthorized byte stream or typed unavailable outcome                      |
| `disposeAuditPackage`                                                                           | exact package revision and current records expiry/hold/disposal fence                                                                                        | verified disposal evidence or owned records blocker                        |

| Public query                                      | Observable projection                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `getYearEndOperations`                            | grouped purpose-pinned runs, separate axes, freshness, next safe action                                            |
| `getRunPreflight`                                 | exact candidate, typed stale delta, reasons, reconciled counts/totals, release floor                               |
| `getRun` / `listRunRecipients`                    | run evidence and server-filtered/keyset recipient operations with masked destinations                              |
| `listDeliveryProfiles` / `explainFulfillmentPlan` | publications, assignments, impact, lane, rejected alternatives, **Why this route?**                                |
| `getPhysicalFulfillment`                          | package/attempt/custody/postal projections without delivery invention                                              |
| `getDirectMailConnection`                         | masked test/live posture, capabilities, evidence freshness, billing currency and spend guard; never stored secrets |
| `listRunAttention`                                | grouped deterministic causes, owners, age, affected count, next action                                             |
| `getStatementHelp`                                | current logical document plus four permitted intent families and routed action                                     |
| `getDonorYearDocuments`                           | permissioned current-first official documents and optional separate Support overview                               |
| `getRunEvidence`                                  | immutable release/completion, current follow-up references, records and audit-package posture                      |

Command results use one discriminated outcome: **applied**, **exact replay**, **stale**, **semantic conflict**, **blocked**, **invalid**, **not permitted or not found**, or **external outcome unknown** after a crossed handoff. Stale and blocked outcomes carry only a closed reason code, cause owner, permission-safe explanation, current revision where safe, and next action. Raw provider errors, SQL errors, cross-scope identifiers, client-authored reason codes, and generic success booleans never cross the boundary.

The permanent semantic slot is derived from the exact tenant/environment scope, command kind and schema version, logical target, and server-authorized occurrence slot. The immutable command fingerprint additionally covers the complete canonical input, expected revisions/fences, ordered selections, and governing policy versions. The opaque client replay token helps recover the same intent but is never itself the authority or stored as a domain identity.

### Closed cause and capability contracts

Preflight staleness uses a versioned closed catalog: `source_changed`, `coverage_changed`, `purpose_or_issuer_changed`, `document_resolution_changed`, `communication_resolution_changed`, `delivery_profile_changed`, `recipient_destination_changed`, `physical_provider_connection_changed`, `direct_mail_cost_or_guard_changed`, `review_floor_changed`, and `governance_changed`. Operational blockers use one owning family: `source`, `generated_document`, `communication`, `fulfillment_plan`, `physical_fulfillment`, `run_control`, `capacity`, `authorization_or_privacy`, or `records`. New codes require a contract version, owner, UI copy, recovery behavior, telemetry classification, and exhaustive tests; staff notes never become machine semantics.

Phase 19 registers these exact Phase 12 capability atoms:

| Capability                                            | Grants                                                                                                                                                                                                                                                                            | Never grants                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `statement_operations.view`                           | role-safe workspace, run, recipient, and evidence projections                                                                                                                                                                                                                     | artifact bytes, exact destinations, mutation                                                          |
| `statement_operations.manage_drafts`                  | drafts, preflights, target, ordinary configuration                                                                                                                                                                                                                                | participation, release, completion                                                                    |
| `statement_operations.add_participants`               | permission-filtered search and adding one compatible eligible existing Statement Subject                                                                                                                                                                                          | Party creation, facts, eligibility, coverage                                                          |
| `statement_operations.include_participants`           | include or restore automatic participation and compatible bulk actions                                                                                                                                                                                                            | editing facts, legal donor, currency, or coverage                                                     |
| `statement_operations.handle_participants_separately` | hold or purpose-permitted omit and compatible bulk actions                                                                                                                                                                                                                        | waiving required coverage or inventing legal meaning                                                  |
| `statement_operations.start_runs`                     | standard atomic Start and preparer-side request/change/cancel of protected review for the exact candidate                                                                                                                                                                         | protected review decision, paid direct mail without separate authorization, or policy bypass          |
| `statement_operations.review_protected_runs`          | review/request-changes/approve-and-start when independent and qualified                                                                                                                                                                                                           | editing the same candidate, waiver, admin bypass                                                      |
| `statement_operations.manage_delivery_profiles`       | draft/preview/publish/archive/assign compatible profiles and run-only route changes                                                                                                                                                                                               | legal/safety precedence or direct provider calls                                                      |
| `statement_operations.manage_destinations`            | governed destination succession and purpose-bound contact choice                                                                                                                                                                                                                  | arbitrary free text, general contact edit unless separately granted                                   |
| `statement_operations.prepare_physical_fulfillment`   | prepare/revoke/download exact-artifact packages                                                                                                                                                                                                                                   | submit paid mail, manage connections, or record print/postal evidence                                 |
| `statement_operations.record_physical_evidence`       | record print, transfer, postal, return, and reconciliation evidence                                                                                                                                                                                                               | generate/change documents or claim donor receipt                                                      |
| `statement_operations.manage_direct_mail_connections` | save/test/rotate/disconnect, set the per-run billing-currency spending guard, and proof-gated activate one supported connection                                                                                                                                                   | submit mail, expose stored secrets, or bypass proof/spend guards                                      |
| `statement_operations.authorize_direct_mail`          | include a connected paid lane in one reviewed Start, reauthorize exact unsubmitted pieces after a bounded execution change, or admit one deliberate staff paid-copy occurrence, within its current compatible connection, quote/upper-bound, and cumulative tenant spending guard | call the provider directly, manage credentials, widen population, exceed the guard, or imply delivery |
| `statement_operations.control_runs`                   | preview and execute Pause/Resume/Stop/privacy containment                                                                                                                                                                                                                         | recall or rewrite crossed work                                                                        |
| `statement_operations.complete_runs`                  | append the mark-completion half of `markRunComplete` or the combined stop-and-complete action                                                                                                                                                                                     | control the run without `control_runs`, choose the clean/exception label, or erase follow-up          |
| `statement_operations.return_runs_to_review`          | append bounded return evidence and restore operational review affordances                                                                                                                                                                                                         | reopen population, released work, documents, destinations, or attempts                                |
| `statement_operations.prepare_audit_packages`         | request fixed governed audit derivative                                                                                                                                                                                                                                           | download unless separately authorized                                                                 |
| `statement_operations.download_audit_packages`        | reauthorized stream of an unexpired prepared package                                                                                                                                                                                                                              | prepare, widen, retain, or bypass hold/disposal                                                       |
| `statement_operations.request_statement_copy`         | staff-side deliberate exact-current **Provide another copy** occurrence through D12                                                                                                                                                                                               | lifecycle replay, source correction, arbitrary destination, or direct provider call                   |

Command intersections are explicit: `approveAndStartLiveRun` requires
`start_runs` plus `review_protected_runs`; a connected paid lane additionally
requires `authorize_direct_mail`. `stopRemainingWorkAndMarkComplete` requires
both `control_runs` and `complete_runs`. Reading the contextual-help projection
requires `view`; **Provide another copy** requires
`request_statement_copy`; a staff-requested connected paid copy also requires
`authorize_direct_mail`; destination succession requires
`manage_destinations`; and source correction or missing-giving work requires
the applicable Phase 7/15 source capability. Resolving an intent never grants
its owner action.

`applyRunDeliveryChange` is candidate-only before Start and invalidates the
current preflight digest and any protected review. Only operations whose
compiled plan or destination consequence changed are marked stale, and
unchanged operation evidence may be reused when still current, but Start always
requires a rebuilt exact preflight with zero stale operations and a review
record bound to that new digest when protected. After Start, the frozen
Fulfillment Plan and fallback are immutable; deliberate new fulfillment uses
D7 destination succession or one D12/D16 copy occurrence, never an in-place
route mutation.
Statement-only destination succession requires `manage_destinations`.
Selecting **Also use for future statements** additionally requires the
applicable source-owned general-contact or preference capability. Without that
second grant, the future option is hidden or denied while statement-only
succession remains available.

Donor and authorized-representative access/copy actions use object-scoped portal authorization, not staff capability atoms. Service principals use separately registered least-privilege execution capabilities and never inherit a staff role. `submitDirectMail` is worker-facing only and is bound either to D2's exact Start-authorized frozen pieces or to one D16 copy occurrence admitted with the required staff or portal authorization and one-piece guard reservation. It is never a second staff button, per-piece approval, or authority to widen either occurrence. Tenant settings may grant staff atoms through Phase 12 groups but may not rename, combine, or weaken their command preconditions.

`disposeAuditPackage` is callable only by the records-retention service
principal after re-proving the current expiry, legal-hold, and disposal fence.
It has no staff button or staff capability atom. The staff
`prepare_audit_packages` capability prepares a fixed derivative only; it never
authorizes disposal.

## End-to-end production sequence

1. Resolve one exact purpose, issuer, jurisdiction activation, period, and source cutoff.
2. Obtain source-authoritative eligible Statement Subjects and exact fact closures.
3. Apply append-only participation decisions without changing eligibility.
4. Resolve delivery profile, locale, destination, portal posture, and paper method.
5. Build, reconcile, and digest the exact inert Run Preflight.
6. Apply the standard or protected release floor.
7. Atomically create run/items/release evidence/outbox and open the release barrier.
8. Fairly claim recipient operations.
9. Reprove control epoch, source/document safety, destination authority, consent, suppression, and route readiness before every irreversible boundary.
10. Request Phase 18 exact document generation.
11. Coordinate authorized portal availability separately.
12. Admit Phase 17 communication occurrences separately.
13. Prepare or submit physical fulfillment separately.
14. Reconcile downstream evidence without rewriting frozen run history.
15. Process late facts through supplemental, correction, or replacement operations.
16. Permit staff to record completion while preserving live follow-up.
17. Retain the PII-minimized Run Evidence Record and governed links.

## Proportional release review

A ready **standard** run shows only **Start live run** and D2's one concise consequence confirmation. It has no reviewer setup, approval vocabulary, mandatory note, typed phrase, checklist, repeated authentication, or handoff. The confirmation states the exact population, donor-message posture, physical route and mailpiece count, and—when connected direct mail is present—the billing currency, current quoted or upper-bound total, quote freshness, and tenant spending guard. Cost is never hidden behind provider jargon or a later screen.

A **protected** run exists only for a closed versioned contract reason or the tenant-wide **Review every live run** strengthening. **Request review** releases nothing. It routes to the optional eligible default statement-reviewer group; **Choose a reviewer instead**, **Change reviewer**, and **Cancel request** remain available from a server-filtered eligible set while nothing has started. If no eligible reviewer exists, the same surface offers **Invite reviewer** or **Manage reviewers** instead of dead-ending.

The reviewer sees the exact candidate, protection reason, significant counts/totals, direct-mail cost/guard consequence when applicable, permission-safe drill-down, currentness, and blockers. They use one atomic **Approve and start live run** action or **Request changes** with an optional short note. The final action requires current Phase 12 assurance; an already-sufficient session is reused, otherwise the existing step-up is embedded without adding another confirmation.

Independence is based on stable human principal and substantive editor provenance, not account, role, or session alone. Viewing or building preflight is not editing. A reviewer who changes participation or configuration becomes a preparer and requires another reviewer. Alternate roles of the same human, shared/service identities, support impersonation, and administrator bypass never satisfy the different-human floor.

For a one-person tenant, a rare protected run may use Phase 12's verified, expiring, revocable, candidate-scoped delegation only when the governing contract permits it. The delegate receives only the minimum aggregate review projection, no standing tenant membership, unrelated navigation/data, editing, export, reassignment, or re-delegation. Access ends on start, cancellation, supersession, expiry, or revocation; a purpose requiring a qualified internal officer cannot use an unqualified delegate.

The run page remains authority. Phase 17 may send one durable in-product review item and optional scanner-safe locator, but delivery, open, read, dismissal, forwarding, or notification failure never approves or loses the request. For group ownership, the first valid atomic decision resolves sibling actionable items. Material candidate/governance change supersedes the request and presents **This run changed while you were reviewing it** with **Review current run**.

## Delivery-profile resolution

### Tenant-authored configuration

An authorized tenant may publish one organization default per compatible statement purpose and any number of additional named profiles. Profiles may be assigned at supported organization, Site, or recipient-preference scopes. There is no arbitrary low profile cap.

A profile may configure:

- primary digital, portal, or paper route;
- deliberate digital-and-paper delivery;
- behavior when a route is unavailable;
- behavior only after terminal failure;
- self-print, secure mail-house package, or activated connected provider;
- permitted locale and Site variants;
- portal posture and finite statement communication.

### Deterministic precedence

1. Legal, privacy, restricted-person, purpose, and recipient-authority constraints.
2. Current consent, suppression, safety, and channel readiness.
3. An authorized, reasoned run-only change among the remaining compatible routes.
4. Explicit frozen recipient preference or recipient-profile assignment.
5. Exact supported Site assignment.
6. Organization default.
7. Code-owned compatible fallback or one typed exception.

Equal-specificity conflicts block with one typed cause; no arbitrary winner is selected. A transient email failure does not activate paper. Only a terminal outcome can activate an already-frozen compatible fallback.

### UX

The settings flow is:

**Primary delivery → If unavailable or failed → Print fulfillment → Review impact → Publish**

Preview uses synthetic examples and aggregate impact, never live donor PII. Each run lane offers **Why this route?**, showing the frozen preference, Site, locale, readiness, rejected alternatives, and fallback without exposing protected data.

## Recipient and destination contract

- Release freezes recipient authority, selected destination revision, locale, Site, route, and a safe digest.
- Current safety and authorization remain live and are re-proved before handoff.
- Destination value, owner, recipient authority/effective interval, usability, statement-specific selection reason, consent/suppression/privacy state, addressee, and artifact-affecting locale are material. Unrelated phone, note, tag, display-label, unused-contact, or proved same-delivery-point formatting changes are not.
- A later primary-contact change does not silently retarget a still-valid explicitly reviewed destination, but it is material when **current primary** was the recorded selection reason or the old destination becomes unsafe.
- Before start, a material change stales only the affected preflight operations. After start, it holds only the affected unsubmitted route and never silently chooses a successor.
- Safe pre-handoff changes create one append-only successor with a new semantic occurrence/provider key.
- Submitted or indeterminate work reconciles before another attempt.
- A destination-only change may reuse exact artifact bytes.
- Any fact printed inside the PDF changes only through the owning source correction and Phase 18 successor.
- A one-statement destination is a purpose-bound contact with evidence and effective bounds, not free text or a shadow contact store.
- **Use for this statement only** and **Also use for future statements** are separate permissioned choices; statement-routing authority never silently changes the general primary contact or standing preference.
- Exact values are encrypted and purpose-bound; generic evidence shows only masked values and revisions.

NCOALink remains a future separately groomed capability. Provider address changes may inform evidence but never overwrite the CRM or silently create destination succession.

## Physical fulfillment

### Self-print — default

**Print and mail ourselves** is automatically preselected and requires no provider connection or onboarding prompt. One bounded **Office print setup** supports Letter/A4, single/double-sided, recommended window envelopes or labels/printed envelopes, color/black-and-white, and an authorized return address. Only compatible choices appear. A synthetic, visibly non-production statement provides alignment proof without donor PII; Phase 19 adds no printer driver, desktop agent, free-form margin editor, presort, or postage engine.

Staff may prepare secure, expiring exact-artifact packages with:

- deterministic manifest and piece identities;
- item and page counts;
- artifact digests and lengths;
- print profile and paper size;
- duplex separation that cannot place another donor's page on a back side;
- chunking with per-chunk and overall checksums;
- opaque filenames without donor PII;
- explicit expiry and revocation evidence.

**Prepared** and **Downloaded** never mean printed or mailed. After download, the exact label is **Downloaded — mailing not recorded**. Staff choose **All N printed successfully** or **Some had problems**; partial evidence reconciles usable, spoiled, and unprinted counts. **Record postal handoff** defaults time to now, pre-fills only usable pieces, accepts one handoff method and optional receipt/reference, and explicitly records handoff—not delivery. Jams, spoiled pieces, or replacement copies reuse the same document identity and exact current artifact.

Package links are short-lived, audited, revocable for future Asym access, and explicit that an already downloaded local copy cannot be recalled. Tenants may set one bounded follow-up interval for downloaded work with no recorded handoff; the reminder groups the run and never creates donor, missionary, or per-piece noise.

### Existing mail house

The same physical-fulfillment contract may produce a secure exact-artifact package for the tenant's existing mail house. Evidence distinguishes package prepared, downloaded, transferred, accepted, in production, postal handoff, returned, and outcome unknown. No arbitrary mapping engine or mail-house marketplace ships.

### Connected direct mail

At most one provider adapter may become Live after:

- DPA/security/privacy/custody review;
- exact-artifact and address-region proof;
- test/live isolation;
- idempotent or reconcilable submission;
- signed webhook and polling reconciliation;
- cancellation-window and too-late behavior;
- international/issuer coverage proof;
- cost and rate-limit observability;
- outage and exit proof.

PostGrid is the first evidence candidate because its official Print & Mail API supports predesigned PDFs, Canada/U.S. mail, sandbox progression, cancellation before printing, and signed webhooks. Lob is the preferred U.S.-focused alternative because it provides mature letter, cancellation, tracking-event, and test/live APIs. This is a research disposition, not vendor adoption. Only one adapter may be activated; core records remain provider-neutral.

Provider setup remains outside ordinary self-print. An authorized tenant operator enters separately scoped test and live credentials, proves both connections, generates one synthetic sample, reviews detected countries/capabilities, confirms tenant-owned billing/agreement, and activates explicitly. Credentials are server-side, encrypted, write-only after entry, and exposed only through **Test**, **Rotate**, and **Disconnect**. Connecting or testing can never send live donor mail.

Activation also requires one tenant-set maximum connected-direct-mail spend per
run in the provider's billing currency. Every live preflight pins the exact
mailpiece count and a current provider quote or adapter-certified upper bound,
which becomes the frozen authorization ceiling at Start;
if the total cannot be bounded, is stale, or exceeds the guard, connected direct
mail is unavailable for that candidate. The existing D2 start confirmation
shows the count, route, amount/upper bound, freshness, and guard. No second
purchase dialog is added. Starting a run with a paid lane requires both
`start_runs` and `authorize_direct_mail`; that one reviewed Start authorizes the
service principal to execute only the frozen pieces within the frozen bound.
Managing a provider connection never authorizes paid submission.

Immediately before submission, the service principal obtains a fresh current
quote or certified bound. It proceeds only when that bound is no greater than
the latest authorization ceiling and still fits the current cumulative guard,
recording both reviewed and execution-time evidence. A routine write-only
credential rotation within the same logical provider account, billing
agreement, currency, regions, and proven capabilities advances only a
credential revision; execution re-proves it without changing semantic
authorization. Disconnect, account/provider/currency/capability changes, or
loss of required proof are material and block submission.

If the fresh bound exceeds the latest authorization ceiling, or an otherwise
compatible material connection revision is required, the grouped exception
offers one **Review updated mailing cost** action. Authorized staff see the
exact remaining piece count, old and new amount/upper bound, currency, delta,
connection consequence, and remaining guard. Confirming
`reauthorizeDirectMailExecution` appends one compare-and-swap-bound
authorization for only those unsubmitted pieces; it does not change run
population, Fulfillment Plan, submitted/unknown attempts, or invoke the
provider. Incompatible, disconnected, over-guard, stale, or concurrently
changed evidence remains blocked with D8 Stop and reconciliation actions. This
is exception recovery, not an ordinary second purchase step.

The guard is cumulative for the run's ordinary paid pieces and later
additional-copy occurrences. Provider-accepted and outcome-unknown attempts
reserve their upper bound until owner evidence settles them. A paid
additional-copy request atomically pins a current one-piece quote/upper bound
and connection revision and reserves the remaining guard before release; it
never changes frozen population.

## Cooperative run containment

### Pause new work

- Close claim admission in one O(1) transaction before scanning impact.
- Show **Pausing new work** until settlement proves old-epoch workers cannot cross a new irreversible boundary.
- Then show **New work is paused**.
- Already submitted work may complete and remains separately truthful.

### Resume remaining work

- Require contained posture and current readiness proof.
- Reopen only safe remaining work under a new control epoch.
- Do not replay completed, submitted, indeterminate, or permanently stopped work.
- Permit blocked items to remain held.

### Stop remaining work

- Permanently prevent every unclaimed operation and every claimed operation
  that has not crossed its serialized irreversible-handoff fence.
- Reconcile submitted and indeterminate work.
- Never claim to recall, void, revoke, delete, or unsend prior work.
- Never resume stopped work inside the same run.

### Contain outgoing delivery now

- Close the same control fence immediately without a second confirmation.
- Revoke provably unsubmitted material.
- Attempt external cancellation only when supported and record confirmed, too late, unsupported, or outcome unknown.
- Create or link the owning privacy incident.
- Never describe already released work as recalled.

Every irreversible handoff serializes against the current control row/epoch. Crossing after an earlier control command won is a release-blocking invariant failure and alert.

## Completion and follow-up

- Runs never auto-complete.
- **Mark run complete** records one immutable numbered Completion Snapshot.
- Asym derives **Completed** or **Completed with N exceptions**; staff cannot choose a false clean label.
- If executable work remains, **Stop remaining work and mark complete** first uses the D8 stop fence and completes only after settlement.
- Ordinary bounces, returns, unresolved donor questions, or other exceptions warn but do not create artificial blockers.
- Only authorization/scope failure, reconciliation/integrity failure, uncontained privacy risk, unsettled stop, or stale/concurrent review blocks completion.
- Completion sends, retries, cancels, rerenders, revokes, or disposes nothing.
- **At completion** remains immutable.
- **Follow-up now** continues to reflect current communication, return, incident, correction, and recovery truth.
- Exceptions automatically remain in the follow-up workspace.
- **Return to active review** appends evidence, preserves prior completion, and never reactivates stopped or completed work.

Tenants grant **Mark run complete** and **Return to active review** through the
separate Phase 12 capability atoms in this PRD; neither action is implied by
ordinary run visibility or participation access. Within those grants, a tenant
may optionally configure one default follow-up team or role, bounded due-date
presets, reminder thresholds, and a closed set of internal reason categories.
These settings organize exceptions after completion; they never become
prerequisites, legal classifications, lifecycle states, or permission bypasses.
Staff may leave every optional field blank and complete a run in the same
single reviewed action.

The current closeout projection follows this closed transition table:

| From                                       | Command                            | To                                         | Effect                                                                     |
| ------------------------------------------ | ---------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `open`                                     | `markRunComplete`                  | `completed` or `completed_with_exceptions` | append Completion Snapshot 1; derive result                                |
| `open`                                     | `stopRemainingWorkAndMarkComplete` | `completed` or `completed_with_exceptions` | execute D8 Stop, settle crossed work, then append Completion Snapshot 1    |
| `completed` or `completed_with_exceptions` | `returnRunToActiveReview`          | `active_review_after_completion`           | append return evidence; restore routine review/reminders only              |
| `active_review_after_completion`           | `markRunComplete`                  | `completed` or `completed_with_exceptions` | append the next numbered Completion Snapshot; derive from current evidence |

Return to review does not reopen population, the release barrier, stopped work, finished route steps, document versions, destinations, or provider attempts. It permits staff to inspect and coordinate independently authorized follow-up and later record a new operational closeout.

`stopRemainingWorkAndMarkComplete` reaches the existing
`remaining_work_stopped` posture before it can append the Completion Snapshot.
If the stop fence has not settled all crossed work to a truthful terminal or
outcome-unknown state, completion remains blocked; the combined action never
creates a second closeout state or reports premature completion.

## Seasonal capacity and fairness

### Initial certified profile

- Up to 50,000 Statement Subjects in one run.
- Up to 500,000 concurrently admitted recipient-document operation equivalents across tenants.
- A run above 50,000 may build a complete preflight and be reviewed, but release blocks atomically with the exact count and active certification ceiling.
- Over-cap runs are never truncated, partly released, or silently divided into visible or legally distinct runs.
- Certification includes ordinary, long, 100-page, locale/font, attachment/link, portal, and print-heavy shapes.

These are launch certification claims, not hard-coded architecture ceilings. Raising them requires new production-shaped evidence, not a schema redesign.

### Fair claims and protected capacity

- Owner-first tenant fairness prevents a large tenant from starving smaller tenants.
- A global ceiling plus per-tenant keyed limits protects shared dependencies.
- Every eligible active tenant receives a claim within `2 × active tenant count` eligible claim decisions unless its own recorded readiness, provider, safety, or control state makes it ineligible.
- Critical transactional messages and interactive document access retain reserved capacity.
- Bulk statement work cannot consume all Phase 17 or Phase 18 capacity.
- Tenants cannot configure queue weight, buy priority, or manipulate share.
- Inngest concurrency, throttling, and bounded priority may execute the product policy; the policy and evidence remain product-owned.
- Lossy rate limiting is not permitted for durable statement work.

### Target ready for review by

Staff may set, change, or remove one bounded target. It:

- informs planning and a rounded readiness range;
- may reorder this tenant's runs within its current fair round and use idle capacity;
- cannot change legal eligibility, queue share, safety, provider limits, or protected capacity;
- shows **Estimating…** until evidence is stable;
- identifies concrete blockers when the target is at risk;
- never becomes a guaranteed deadline.

### Progress

Show separate durable counts for population frozen, documents ready, portal available, communication submitted/final, and self-print package ready. Include freshness and reconciliation state. Do not fabricate one global percentage.

## Statement communication contract

Phase 19 admits only a finite set of semantic occurrences through Phase 17's public plan compiler:

| Meaning                            | Recipient effect                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| Ordinary statement ready           | One donor notice when the frozen plan includes outbound communication           |
| Corrected/replaced statement ready | Notify only after an exact healthy current successor and exposure proof         |
| Statement withdrawn/unavailable    | Notify only when purpose and exposure rules require it                          |
| Donor-requested additional copy    | One fresh bounded occurrence per deliberate request                             |
| Grouped staff attention            | In-product/operational attention; never a donor message to a failed destination |

Portal publication, print readiness, progress, retry, provider acceptance, run completion, and internal recovery do not create donor messages. Phase 19 never calls `sendEmail` or Resend directly and never stores a second communication ledger.

Each tenant may assign a responsible team or role for each grouped,
contract-owned attention cause and choose one bounded companion posture:
`in_product_only`, `immediate_companion_email`, or
`daily_grouped_summary`. The default is `in_product_only`. Security,
privacy, legal, and other source-owned urgent notices keep their owning
contract's required posture. Phase 17 compiles any permitted companion email;
Phase 19 never sends one directly. Grouping is by tenant, run, cause, and owner
window, so a recipient fan-out cannot become a staff notification storm.

Correction wording depends on proven exposure. A predecessor possibly exposed through email, portal, print, or external custody may require corrective communication. A never-exposed predecessor must not generate fabricated correction language.

Provider batching is an adapter optimization, not a product contract. Resend's current Batch API permits up to 100 emails per request but does not support attachments; rate limits are team-wide and conveyed through response headers. Phase 17 must adapt to the tenant's current account capacity, use durable semantic identities beyond Resend's 24-hour idempotency window, and keep attachment versus secure-link delivery purpose-controlled.

## Contextual help and donor access

### Help with this statement

Party Giving and Year-End Operations open the same logical statement resource. The surface shows exact-current access and current outcome first, then four closed intent families:

1. **Provide another copy**
2. **Change where it goes**
3. **The statement is wrong**
4. **Giving is missing**

The server resolves the legal action. Staff never choose retry, regenerate, version, serial, provider, replacement, correction, or supplemental semantics directly.

### Donor direct access

- Authorized donors and representatives may repeatedly view, download, and locally print exact current bytes.
- Every list, byte, and range request reauthorizes the logical document, current head, recipient authority, and exact storage generation.
- Direct access creates no document, issuance, copy, delivery, fulfillment, or human-read claim.
- Replaced, void, corrupt, disposed, held, or unauthorized predecessors are unavailable through a nonrevealing denial.
- Guest-link expiry ends only that grant; it does not limit signed-in access.
- Invisible infrastructure abuse controls may protect the service but cannot become a donor entitlement or visible quota.

### Send another copy

- Each confirmed request creates one fresh bounded outbound occurrence.
- Equivalent unresolved artifact + recipient + route + destination-revision requests deduplicate permanently.
- After terminal resolution, another deliberate request is allowed.
- A failed outbound copy never removes direct access.
- Canadian copies preserve exact current bytes and serial; corrections/replacements use the legal owner path.
- Connected direct mail appears only when the published Delivery Profile
  expressly permits donor/staff copy fulfillment through it.
- A paid copy atomically pins and reserves a current one-piece cost upper bound
  inside the run's cumulative tenant guard, including accepted or
  outcome-unknown attempts.
- Before a staff paid-copy submission, one concise confirmation shows the
  recipient, route, masked destination, exact one-piece price or certified
  upper bound with currency, and remaining cumulative run guard. Its primary
  action uses plain language such as **Mail one copy for up to $X**.
- Submit re-proves every displayed revision. Stale recipient, route,
  destination, connection, price, or guard evidence returns to review with zero
  provider effect.
- Donor self-service never exposes tenant cost or guard details; the tenant's
  standing Delivery Profile permission, portal authorization, and current guard
  remain authoritative.
- If cost cannot be bounded or guard remains insufficient, release has zero paid
  effect and the review offers only already-permitted digital/self-print
  alternatives or one typed next action; it never silently switches route.

## Optional Support overview

- Default **Off** produces no runtime work, setup question, ordinary UI, or measurable participant-specific cost.
- When enabled and meaningful, it uses the separate `giving.summary.informational@1` purpose and its own run/item/artifact/delivery truth.
- Launch recognition roles are household support and sufficiently disclosed, unambiguous DAF recommendations only.
- Direct/legal presentation wins dedupe.
- One contribution appears once.
- Per-currency subtotals are permitted; cross-currency and direct-plus-indirect grand totals are forbidden.
- Unsupported, anonymous, ambiguous, revoked, or restricted recognition is omitted or blocked according to Phase 14.
- Every preview, PDF, row, email, portal card, print wrapper, and metadata surface persistently says **Support overview — Not a tax document**.
- Official documents remain first and recover independently.
- Missionaries receive no Support overview artifact or added donor-detail access.

## Canadian participation

Canadian annual official-receipt behavior exists only when the exact issuer's Phase 18 Canadian registered-charity pack is active.

Without that activation:

- no Canadian fields, labels, controls, joins, jobs, exports, alerts, or empty states appear;
- donor country, Site, address, CAD currency, French locale, import, or caller input cannot activate it;
- ordinary U.S./informational execution is unchanged.

For an active issuer, Phase 7 freezes one prospective receipt plan per eligible cash occurrence:

- `individual_cash` — after each successful eligible donation; or
- `annual_cumulative_cash` — once after year-end.

Phase 19 consumes that source decision. It cannot change it. Cumulative coverage includes only compatible, source-eligible posted cash with no existing current official coverage. Noncash gifts remain separate. Existing valid individual receipts are never automatically cancelled or rolled into cumulative coverage. Concurrency protection prevents overlapping individual and cumulative coverage.

The participant-only preflight shows **Ready for year-end receipt**, **Already receipted individually**, **Non-cash — separate receipt required**, **Needs review**, and typed blocked reasons.

## Year-boundary check intake and late facts

Phase 19 keeps four independent coordinates separate:

1. source/jurisdiction-owned Document Period;
2. tenant operational Readiness Target, shown as **Target ready for review by**;
3. versioned compliance-risk rule;
4. immutable Source-Fact Cutoff.

For U.S. mailed checks, Phase 15/7 records the actual mailing/postmark date and delivery basis. The check's written date, entry date, deposit date, clearing date, or run date is not a substitute.

The ordinary intake:

- asks **Was this check mailed by December 31?** during the relevant boundary window;
- lets authorized staff **Record mailing date** or **Use the received date**;
- requires exact date and one factual basis;
- allows an optional note;
- treats the normal Save action as the attestation;
- requires no attachment or second reviewer by default;
- permits the tenant or jurisdiction contract to require stronger proof.

Phase 19 never edits that date. It displays a permission-safe source explanation such as **2025 · Staff-confirmed mailing date · Received January 3, 2026**.

If a material source fact changes before Start, only affected operations are
marked stale, but the immutable preflight digest and any protected review are
no longer startable. Staff rebuild the exact preflight; unchanged operation
evidence may be reused when still current, while Start requires zero stale
operations and, when protected, a review record bound to the rebuilt digest.

If a fact arrives after Start, the primary run remains immutable and one
deduplicated Late Fact Obligation resolves through owner rules to:

- no document action;
- nonoverlapping supplemental coverage;
- source-authorized correction/replacement; or
- another separately reviewed purpose-pinned run.

The obligation's permanent semantic slot is derived from tenant/environment,
primary run, Statement Subject, source-fact identity, and purpose contract.
Exact replay returns the same obligation. A later revision of the same source
fact appends a compare-and-swap successor revision inside that slot; it never
creates a second concurrently open obligation. A materially different source
fact receives a different slot.

Exact copy access, delivery retry, portal access, or print replay never creates a late fact.

## Run participation

Automatic source-derived participation is the default. Authorized staff may, before start:

- **Use automatic result**
- **Include in this run**
- **Handle separately**
- use a purpose-permitted **Do not include this time**
- **Add to this run** for an existing eligible Statement Subject
- apply exact bulk include/separate/restore actions

Tenants grant add, include/restore, and handle-separately actions independently
through the three Phase 12 capability atoms above. They may require one short
bounded internal note for a sensitive handle-separately action; no note is
required by default. Purpose- or jurisdiction-permitted curation is absent when
not allowed, and no grant or setting can weaken source-owned eligibility or
required official coverage.

Participation is operational only. Every include re-proves complete source eligibility, compatibility, issuer, purpose, coverage, and currentness. Staff cannot edit gift lines, dates, amounts, currencies, donor identity, jurisdiction, or coverage.

Bulk commands:

- operate on one server-materialized reviewed selection;
- reprove every member at commit;
- fail with exact typed reconciliation instead of silently skipping;
- use CAS and semantic idempotency;
- append evidence when restored or undone.

Search is permission-filtered and non-enumerating. Closed outcomes include **Ready to include**, **Already included**, **Already current**, **Needs source correction**, **Not compatible**, and **Not eligible**.

Any participation change invalidates an existing preflight and protected review. No post-start participation edit exists.

## Security, privacy, and tenant safety

- Derive tenant/environment/actor from the authenticated server context; never trust caller-supplied scope.
- Reauthorize every command and every artifact access, including Range requests.
- Use same-scope composite foreign keys, forced RLS, service-only write paths, and hostile cross-scope tests.
- Return nonrevealing denials for cross-tenant, unauthorized Party, document, destination, run, package, and provider identifiers.
- Encrypt exact destinations and restrict them to purpose-bound execution.
- Keep PII out of queue events, logs, metrics, traces, filenames, checksums, and generic evidence.
- Mask destination comparisons and reason messages.
- Bind storage authorization to opaque object generation, digest, and length; never expose raw bucket URLs.
- Apply CSRF/origin protection to staff and donor mutations.
- Prevent spreadsheet injection in operational exports and package manifests.
- Sign and replay-protect provider webhooks; store normalized evidence and tightly controlled raw evidence only where the provider contract requires it.
- Treat provider acceptance as ambiguous until owner-specific finality.
- Preserve restricted-person, anonymity, deceased, representative, and current safety rules at each handoff.
- Holds preserve evidence but never authorize access.

## Accessibility and UX requirements

All staff and donor flows conform to WCAG 2.2 AA and the repo frontend/testing contracts:

- semantic headings, landmarks, tables/cards, fieldsets, descriptions, errors, and status messages;
- complete keyboard operation with visible focus and no drag-only action;
- focus order and initial focus that prefer the safe action for consequential dialogs;
- text-plus-icon status; never color alone;
- no hover-only reason or action;
- 44 CSS-pixel touch targets where applicable;
- 400% zoom and 320 CSS-pixel reflow without two-dimensional scrolling except true data tables;
- forced-colors and high-contrast support;
- reduced-motion behavior;
- long names, long locales, French, and RTL resilience;
- screen-reader announcements for changed counts, saved decisions, containment settlement, and terminal errors without stealing focus;
- mobile cards backed by the same server query and semantics as desktop tables.

Use shared `PageShell`, `DataTableResponsive`, Base UI primitives, and Maia/Zinc design tokens. No page-local color system, custom spreadsheet grid, provider-centric dashboard, wall of summary cards, or noisy success notifications.

## Failure taxonomy and recovery

| Cause owner           | Examples                                                                                | Permanent behavior                                                   |
| --------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Source                | ineligible gift, ambiguous donor, stale facts, missing coverage proof                   | Block affected item; link source action; rebuild or supplemental run |
| Phase 18              | missing compatible publication, render failure, corrupt artifact, current-head conflict | Keep item isolated; use exact request identity; owner repair         |
| Phase 17              | sender not ready, suppression, provider ambiguity, bounce, complaint, webhook lag       | Preserve communication truth; reconcile before fallback/retry        |
| Phase 19 plan         | conflicting assignment, no compatible route, stale destination snapshot                 | Typed plan exception; reviewed compatible change                     |
| Physical fulfillment  | package mismatch, partial print, provider timeout, return, cancellation unknown         | Preserve piece evidence; reconcile; never infer mailed/delivered     |
| Control               | stale epoch, unsettled pause/stop, old worker crossing                                  | Fence reject, alert, reconcile; no duplicate side effect             |
| Capacity              | provider 429, quota, backlog, certification limit                                       | Adaptive backpressure and honest range; never drop or truncate       |
| Authorization/privacy | permission loss, representative revoked, incident                                       | Fail closed; contain new work; nonrevealing response                 |
| Records               | package purge failed, evidence disposed, hold conflict                                  | Owning records state; no reconstruction from mutable CRM             |

Automatic retries are bounded and cause-specific. Healthy recovery stays quiet. Terminal or human-actionable failure produces one persistent grouped attention item with cause, affected count, owner, next action, and what remains unaffected.

## Observability and runbooks

Metrics must cover:

- queue depth and oldest age by tenant, service class, stage, and lane;
- preflight build and atomic-start latency;
- claim, fence, lease, and stale-worker prevention;
- run/item/aggregate reconciliation drift;
- Phase 18 generation and artifact blockers;
- Phase 17 submission, webhook, finality, and grouped-attention lag;
- paper package size, expiry, download/handoff gap, provider reconciliation, and returns;
- fairness and protected-capacity budgets;
- target range versus actual review readiness;
- paused/stopped/reconciliation age;
- late-fact and supplemental obligation age;
- completion and post-completion issue counts;
- audit-package preparation, expiry, purge, and integrity.

Metrics, logs, and traces contain stable opaque identifiers and closed cause codes, never donor names, addresses, emails, gift narratives, or document bytes.

Runbooks must cover stale preflight, population mismatch, ambiguous downstream handoff, stuck claim, provider outage, poison item, cross-tenant denial spike, containment failure, privacy incident, print mismatch, missing/corrupt artifact, sender/webhook failure, late-fact backlog, audit-package disposal failure, and capacity/fairness breach.

## User Stories

1. As authorized finance staff, I want to create one purpose-pinned run draft,
   so that one operational run cannot mix issuers, jurisdictions, periods, or
   legal purposes.
2. As finance staff, I want one derived Year-End Operations workspace, so that
   I can work quickly without creating a new campaign authority.
3. As a run preparer, I want to review one exact inert preflight, so that I know
   precisely what an atomic start will release.
4. As a tester, I want mock-recipient test mode to be incapable of live effects,
   so that preview and test-send work cannot reach donors or consume official
   identities.
5. As an authorized preparer, I want an ordinary ready run to start in one
   atomic action, so that routine operations have no needless approval
   bureaucracy.
6. As a protected-run reviewer, I want exactly one bounded independent review,
   so that exceptional risk is controlled without burdening ordinary runs.
7. As a preparer or reviewer, I want stale preflight rejection to have zero
   effects, so that concurrent changes cannot release a candidate I did not
   review.
8. As finance staff, I want legal donors and official coverage to remain
   source-owned, so that statement operations cannot invent tax truth.
9. As donor-relations staff, I want household and DAF recognition separated from
   official statements, so that engagement context cannot become a tax claim.
10. As a tenant administrator, I want optional support overviews to be
    unmistakably non-tax and default Off, so that tenants not using them see no
    noise.
11. As a non-Canadian tenant, I want Canadian receipt operations to be
    structurally absent, so that an irrelevant jurisdiction never complicates
    my workflow.
12. As Canadian finance staff, I want cumulative receipt coverage derived from
    the exact issuer and jurisdiction contract, so that per-gift and annual
    coverage never overlap incorrectly.
13. As gift-entry staff, I want a simple staff-attested mailed-check date at the
    year boundary, so that a check mailed by December 31 can be counted correctly
    without default evidence bureaucracy.
14. As finance staff, I want post-release late facts to enter a governed
    supplemental or correction lane, so that the immutable primary release is
    never silently rewritten.
15. As a run preparer, I want source-authoritative automatic participation to be
    the default, so that normal runs require no row-by-row curation.
16. As authorized staff, I want to add one compatible eligible existing
    Statement Subject, so that lawful omissions can be corrected without
    creating shadow donors or editing facts.
17. As authorized staff, I want exact reversible pre-start bulk participation
    actions, so that I can work efficiently without silent partial success.
18. As a tenant administrator, I want clear versioned Delivery Profiles, so that
    tenant preferences remain flexible without becoming legal or workflow code.
19. As finance staff, I want every recipient operation to compile into one
    truthful Fulfillment Plan, so that routes and fallbacks are deterministic
    and inspectable.
20. As a recipient or representative, I want my reviewed recipient and
    destination meaning frozen at release, so that later CRM edits do not
    silently retarget my statement.
21. As authorized staff, I want governed destination succession, so that a safe
    correction creates a new accountable occurrence rather than mutating sent
    work.
22. As a donor, I want every channel to use the exact current Phase 18 artifact,
    so that portal, email, and print never disagree.
23. As a donor, I want at most one ordinary statement notice, so that portal and
    print readiness do not create duplicate email.
24. As a donor, I want correction, replacement, and withdrawal messages to be
    based on proven exposure and current artifact truth, so that messages never
    fabricate an event.
25. As tenant staff, I want delivery failures grouped by cause and owner under my
    tenant's quiet attention posture, so that I can act without a notification
    storm.
26. As finance staff, I want self-print automatically preselected with one
    bounded office setup, so that the common workflow is immediate and clear.
27. As finance staff, I want to record printing and postal handoff as separate
    truthful actions, so that a download is never mistaken for mailing or
    delivery.
28. As a tenant administrator, I want optional mail-house or direct-mail setup
    behind proof gates, so that tenant flexibility does not expose live donor
    mail during testing.
29. As authorized staff, I want to pause new work through one atomic control
    fence, so that no later claim crosses while in-flight truth remains visible.
30. As authorized staff, I want to resume only proved-safe remaining work, so
    that submitted, stopped, or indeterminate operations are not replayed.
31. As authorized staff, I want to stop only unreleased work permanently, so
    that crossed handoffs remain truthful and auditable.
32. As privacy staff, I want immediate honest containment, so that future
    release stops quickly without falsely claiming already exposed material was
    recalled.
33. As every tenant, I want certified tenant-fair seasonal execution, so that a
    noisy large run cannot starve my donors or protected critical messages.
34. As finance staff, I want one bounded Target ready for review by control, so
    that I can plan without buying priority or receiving a false guarantee.
35. As operations staff, I want separate durable progress axes with freshness,
    so that queue motion is never presented as delivery or completion.
36. As authorized tenant staff, I want to decide when operational work is
    complete while Asym derives the truthful result, so that I retain control
    without being able to hide exceptions.
37. As follow-up staff, I want immutable at-completion evidence alongside live
    current outcomes, so that completion never erases or freezes recovery truth.
38. As tenant staff, I want one contextual Help with this statement doorway, so
    that I can resolve copy, destination, error, and missing-giving needs without
    choosing legal or provider mechanics.
39. As an authorized donor or representative, I want unmetered exact-current
    view, download, and local print, so that I can access my statement whenever I
    need it without minting copies.
40. As an authorized donor or staff member, I want a deliberate bounded Send
    another copy action, so that outbound fulfillment is repeatable but
    duplicate gestures cannot duplicate delivery.
41. As finance staff, I want one quiet PII-minimized Run Evidence Record, so that
    I can audit release and completion without duplicating owner data.
42. As an authorized auditor, I want one fixed temporary evidence package, so
    that governed review is possible without creating a permanent report
    library.
43. As a staff member or donor, I want failures to converge safely and every
    critical journey to remain accessible, so that recovery does not require
    tribal knowledge or exclude users.
44. As a tenant administrator, I want separate role grants and an optional
    bounded-note policy for participation actions, so that I control staff
    authority without weakening source eligibility or required coverage.

## Independently verifiable acceptance

### US19-01 — Staff create one purpose-pinned run draft

- One draft has one tenant/environment, issuer, purpose, jurisdiction, period, currency compatibility, cutoff, and policy set.
- Mixing incompatible purposes or issuers is rejected before preflight.
- Editing uses CAS and never overwrites a newer draft.

### US19-02 — Staff use one derived Year-End Operations workspace

- Runs are grouped by year and issuer without creating a campaign authority.
- Separate operational axes and the next safe action are visible.
- Rebuilding or deleting the projection cannot change run truth.

### US19-03 — Staff review one exact preflight

- Included, excluded, blocked, held, already-current, counts, totals, delivery lanes, and paper disposition reconcile exactly.
- The browser cannot author membership or totals.
- Every exception has a stable reason, owner, and next action.

### US19-04 — Test mode cannot create live effects

- Test runs use synthetic data and visible watermarking.
- They cannot create official identities, donor history, portal publication, communication, or physical fulfillment.
- Test work cannot be promoted into live work.

### US19-05 — A standard run starts through one atomic action

- A currently authorized preparer starts a ready standard run without approval UI.
- The one confirmation shows exact population, message posture, physical route
  and pieces, and any current direct-mail cost/guard consequence.
- One transaction promotes the exact preflight, records evidence, opens the barrier, and writes the outbox.
- Duplicate replay returns the same run; changed replay conflicts.

### US19-06 — A protected run gets exactly one independent review

- Protection appears only for a closed contract reason or tenant-wide strengthening.
- Requesting review has no side effects.
- A different authorized human approves and starts the exact candidate atomically.
- Standard runs remain bureaucracy-free.

### US19-07 — Stale preflight rejection has zero effects

- A material source, purpose, population, publication, plan, or governance change invalidates the candidate.
- Start rejects atomically and explains a permission-safe delta.
- No document, message, portal, or print work begins.

### US19-08 — Legal donors remain source-owned

- Each official item uses the exact Phase 7 Statement Subject.
- Household, address, email, payment method, staff preference, and recognition cannot replace it.
- Ambiguous authority blocks only the affected item.

### US19-09 — Household recognition remains separate

- Optional recognition never enters an official document or deductible total.
- Shared destinations do not merge official documents.
- Current household changes do not rewrite frozen history.

### US19-10 — Support overviews are optional and unmistakably non-tax

- Default Off creates no runtime work or ordinary UI noise.
- On creates only meaningful `giving.summary.informational@1` items.
- Every surface persistently says **Support overview — Not a tax document**.
- Official and informational failures remain independent.

### US19-11 — Canadian behavior is absent for nonparticipants

- No active exact-issuer pack means no Canadian controls, labels, joins, jobs, or measurable ordinary overhead.
- Canadian-looking donor, locale, currency, address, import, or caller input cannot activate it.

### US19-12 — Canadian annual receipt coverage is source-authoritative

- Only gifts frozen as `annual_cumulative_cash` and otherwise eligible enter cumulative coverage.
- Individually receipted and noncash gifts remain excluded with truthful reasons.
- Phase 15 batch or quick-entry commit posts the money but creates no per-gift
  official receipt, coverage record, or receipt-send outbox occurrence for an
  `annual_cumulative_cash` gift.
- Concurrent individual and cumulative coverage cannot overlap.

### US19-13 — Year-boundary checks use source-owned dates

- Phase 19 consumes Phase 15/7 `gift_date` and `delivery_basis`.
- A staff-attested December mailing received in January can enter the prior-year population before cutoff.
- Phase 19 offers no inline tax-year or mailing-date override.

### US19-14 — Late facts use governed follow-up

- Facts posted after start do not mutate the primary run.
- One deduplicated obligation resolves to no action, supplemental coverage, correction, or replacement.
- The logical slot uses primary run, Statement Subject, source-fact identity,
  and purpose; exact replay returns the same obligation and a later source
  revision appends instead of creating a parallel open obligation.
- Exact-copy access and delivery retry never create a late fact.

### US19-15 — Automatic participation is the default

- Staff can proceed without affirming every recipient.
- **Use automatic result** restores source-derived behavior without erasing prior evidence.
- Manual participation never changes source facts or legal eligibility.

### US19-16 — Staff may add an eligible existing subject

- Search is permission-filtered and non-enumerating.
- The server returns one closed outcome such as ready, already included/current, blocked, incompatible, or ineligible.
- Staff cannot create a shadow Party or select individual lines/totals.

### US19-17 — Bulk participation is exact and reversible before start

- Actions operate on one materialized reviewed selection.
- Every member is re-proved at commit.
- Mixed or raced selections are not silently skipped.
- Returning to automatic appends evidence rather than deleting it.

### US19-18 — Tenants publish clear delivery profiles

- Staff configure primary delivery, unavailable/failure behavior, paper method, portal posture, and permitted communication.
- Preview uses synthetic examples plus aggregate impact.
- Published versions are immutable and historical runs retain their version.

### US19-19 — Each operation compiles to one truthful Fulfillment Plan

- Resolver precedence is deterministic and tenant choices cannot bypass legal/safety constraints.
- Lane counts reconcile to the frozen population.
- **Why this route?** explains preference, Site, locale, readiness, rejected routes, and fallback.

### US19-20 — Recipient and destination meaning freezes at release

- Each operation pins recipient authority, destination revision, locale, Site, route, and digest.
- Frozen destination never becomes frozen permanent authorization.
- Exact material is absent from generic evidence and telemetry.

### US19-21 — Destination changes use governed succession

- Safe pre-handoff changes create one new destination successor.
- Indeterminate or submitted work reconciles before another delivery.
- Visible PDF changes require source/document correction first.
- One-run and future-statement destination changes remain separate choices.

### US19-22 — Every item uses Phase 18's exact artifact

- Phase 19 submits item-authoritative generation intent through the Phase 18 public boundary.
- Retry preserves exact request identity.
- Delivery, print, or run state never rerenders or changes document truth.

### US19-23 — The ordinary statement creates one donor notice

- Email plus portal creates one email occurrence and one separately truthful portal fact.
- Portal publication, print readiness, run progress, and completion create no duplicate donor notice.
- Phase 19 never submits directly to Resend.

### US19-24 — Correction, replacement, and withdrawal messages are truthful

- A lifecycle message is admitted only after exact current-successor and exposure proof.
- Never-exposed predecessors do not produce fabricated correction wording.
- Invalid or withdrawn bytes are never linked as current.

### US19-25 — Delivery failures create grouped staff attention

- Definitive failures follow only a frozen compatible fallback.
- Indeterminate outcomes do not trigger blind resend or premature print.
- Staff see one grouped cause/owner surface, not one notification per donor.
- Tenants may assign the responsible team or role for each contract-owned
  attention cause.
- The default is in-product only; permitted alternatives are one immediate
  companion email or one daily grouped summary.
- Urgent source-owned security, privacy, and legal notice rules cannot be
  weakened.

### US19-26 — Self-print is the quiet default

- **Print and mail ourselves** is preselected without a setup prompt.
- One bounded Office print setup covers only compatible paper, duplex,
  envelope/addressing, color, and return-address choices.
- A visibly synthetic no-PII alignment proof verifies the setup.
- Staff prepare secure exact-artifact packages with reconciled counts, checksums, print profile, and duplex separation.
- Preparing or downloading does not claim printing or mailing.

### US19-27 — Staff record truthful self-print and postal evidence

- Download shows **Downloaded — mailing not recorded**.
- Staff can record all-success or partial print outcomes.
- Postal handoff is a simple bounded attestation and remains distinct from delivery.
- Spoiled or replacement pieces reuse the same document identity.
- Expiry/revocation stops future Asym access but explicitly cannot recall a
  downloaded local copy.
- One optional tenant follow-up interval groups downloaded work with no recorded
  handoff.

### US19-28 — Optional mail-house and direct-mail methods preserve one contract

- Secure mail-house packages distinguish download, transfer, acceptance, production, and postal handoff.
- At most one direct provider adapter launches after proof; PostGrid is first candidate and Lob the U.S.-focused alternative.
- Setup separates test and live credentials, synthetic proof, detected
  capabilities, tenant-owned billing, and explicit activation.
- A tenant-set per-run spending guard and current bounded cost evidence are
  required before any paid submission.
- Connection administration and authorization of a paid lane use separate
  capabilities; Start remains the single staff release action.
- Execution may proceed below the frozen ceiling after a nonsemantic credential
  rotation; a higher bound or compatible material revision requires one
  exact-pieces **Review updated mailing cost** action.
- Connecting or testing cannot send live donor mail.
- Ambiguous provider outcomes reconcile before retry.
- Provider states never become the core domain.

### US19-29 — Staff can pause new work truthfully

- Pause closes admission before scanning counts.
- Old-epoch workers cannot cross a later irreversible fence.
- Already submitted work may finish and remains visible.
- UI says paused only after containment is proved.

### US19-30 — Staff can resume only proved-safe remaining work

- Resume requires contained state and current readiness proof.
- Completed, submitted, indeterminate, or permanently stopped work is not replayed.
- Blocked items may remain held while safe work resumes.

### US19-31 — Staff can permanently stop work not yet handed off

- Stop prevents every unclaimed operation and every claimed operation that has
  not crossed its serialized irreversible-handoff fence.
- Submitted and indeterminate work is reconciled, not relabeled.
- Stopped work cannot resume inside the same run.
- Documents and prior history remain intact.

### US19-32 — Privacy containment is immediate and honest

- One action closes the same control fence without an extra dialog.
- Provably unsubmitted material is revoked; external cancellation is attempted only when supported.
- An incident is created or linked and already released work is never described as recalled.

### US19-33 — Seasonal execution is tenant-fair

- One noisy tenant cannot starve smaller tenants or protected critical messages.
- Providers and workers apply adaptive backpressure without dropping work.
- Tenants cannot buy, configure, or manipulate queue share.

### US19-34 — One bounded target improves planning without queue jumping

- Staff may set **Target ready for review by**.
- The product shows an honest range and readiness blockers.
- The target cannot bypass fairness, safety, provider capacity, or critical-message protection.

### US19-35 — Progress is truthful and inspectable

- Population, document, portal, communication, and print axes remain separate.
- Progress comes from durable aggregates and reconciles to item truth.
- Stale estimates are labeled and no fabricated global percentage appears.

### US19-36 — Staff decide when a run is operationally complete

- **Mark run complete** is tenant-controlled and never automatic.
- Asym derives **Completed** or **Completed with exceptions**.
- Remaining executable work uses D8's combined stop-and-complete path.
- Ordinary exceptions warn but do not create artificial blockers.
- Tenants separately grant completion and return-to-review capabilities.
- Optional follow-up owner, due-date, reminder, and internal-reason settings
  organize exceptions without adding a required field or approval step.

### US19-37 — Completion preserves live follow-up

- Immutable **At completion** evidence remains unchanged.
- Current delivery, incidents, corrections, returns, and recovery continue updating separately.
- Exceptions automatically remain in follow-up views.
- A bounded return-to-review action appends evidence rather than erasing completion.

### US19-38 — Staff have one contextual help doorway

- Party Giving and Year-End Operations open the same logical statement resource.
- Exact-current Open, Download, and Print are first.
- Four intention families route to copy, destination, source correction, or supplemental work.
- No generic retry, provider, serial, template, or legal-lifecycle picker appears.

### US19-39 — Donors have unmetered exact-current access

- Authorized donors may repeatedly view, download, and locally print.
- Every byte/range request reauthorizes and resolves the exact current artifact.
- Access creates no new document, delivery, fulfillment, or read claim.
- Replaced, void, corrupt, disposed, or unauthorized predecessors are unavailable.

### US19-40 — Authorized users may deliberately request another copy

- Each confirmation creates one bounded outbound occurrence.
- Equivalent unresolved requests deduplicate permanently.
- After terminal resolution, another deliberate request is allowed.
- Direct access remains available even when outbound delivery fails.
- A connected paid copy must be profile-permitted and fit a current one-piece
  bound inside the cumulative run guard; exhaustion creates no provider effect.
- Staff see one plain-language confirmation with recipient, route, masked
  destination, currency, one-piece price/upper bound, and remaining guard;
  stale confirmation evidence has zero provider effect.
- Donors never see tenant price or guard details.

### US19-41 — Finance can inspect one quiet Run Evidence Record

- **At release**, **At completion**, **Follow-up now**, and **Records** remain distinct.
- The record contains minimum typed evidence and owner references, not duplicated PII or artifacts.
- Later owner disposal or restriction is shown truthfully.

### US19-42 — Authorized auditors can request one temporary package

- One fixed review explains contents, exclusions, expiry, and external-copy responsibility.
- Generation is resumable, nontruncating, bounded-memory, and permanently idempotent.
- Access is re-proved before streaming.
- Expiry triggers governed verified disposal.

### US19-43 — Failures remain recoverable, tenant-safe, and accessible

- Crashes, duplicate wakes, stale leases, provider ambiguity, and late webhooks converge without duplicate official effects.
- Cross-tenant/environment poison identifiers reveal nothing and cause no work.
- Critical staff and donor journeys work by keyboard, screen reader, mobile/reflow, forced colors, long locale/RTL, reduced motion, and 400% zoom.
- Healthy recovery remains quiet; terminal issues have one persistent next action.

### US19-44 — Tenants govern who may manage run participation

- Tenants separately grant capabilities to add a subject, include or restore
  automatic participation, and handle a subject separately.
- A tenant may require one short bounded internal note for sensitive
  participation actions, but the default remains no mandatory note.
- Curated participation is offered only where the purpose and jurisdiction
  permit it; required coverage cannot be waived.
- No tenant setting can alter source-owned eligibility, facts, legal donor,
  period, currency, or official coverage.

## Testing Decisions

**Confirmed public seam:** the public Statement Operations service.

Scenario tests submit tenant/actor-scoped commands and observe preflight, run, item, recipient-operation, control, completion, evidence, and donor projections. Routes, UI actions, workflow functions, recovery scans, and reconciliation workers must delegate to the same seam.

Use real PostgreSQL/Supabase repositories for product-truth constraints, including RLS, uniqueness, CAS, transactionality, fencing, leases, claims, outbox, and concurrency.

Deterministic fakes are limited to:

- the combined source-authority port: Phase 7 facts/eligibility/coverage and, only for Support-overview scenarios, Phase 14's already-authorized recognition projection;
- Phase 18 generation/artifact boundary;
- Phase 17 communication boundary;
- physical provider adapter;
- object storage where exact-byte behavior is not the subject of the test;
- clock, IDs, and randomness.

There is no direct Phase 14 table/reducer fake and no second source seam: the optional recognition projection enters through the same external-authority boundary as the frozen source package.

Do not make Inngest internals, Resend, a renderer, raw database tables, route handlers, or UI components the primary acceptance seam.

### Test architecture

| Layer                | Required proof                                                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Service scenarios    | Every US19 story through public commands and queries                                                                                                         |
| Unit/property        | Purpose compatibility, reason catalogs, participation reducer, profile resolver, lane compilation, preflight digest, control transitions, target-range logic |
| Database integration | RLS, same-scope FKs, immutability, unique coverage, semantic idempotency, CAS, leases, fencing, outbox, claims, exact aggregates                             |
| Contract             | Phase 7 facts, Phase 18 document pins/requests, Phase 17 plans/occurrences, physical fulfillment                                                             |
| Workflow durability  | Lost/duplicate wake, crash boundaries, stale lease/fence, recovery scan, reconciliation                                                                      |
| Provider             | Resend ambiguity/finality via Phase 17; mail-provider timeout, webhook replay, cancellation evidence, partial results                                        |
| Security/privacy     | IDOR, cross-tenant poison IDs, destination masking, cache/storage isolation, CSRF/origin, PII-safe logs and exports                                          |
| Accessibility/UX     | Staff preflight/review/control/completion/help and donor access/copy flows                                                                                   |
| Performance          | 0, 1, 100, 1k, 10k, 50k; complete over-cap preflight plus atomic release block; 500,001 boundary; 10×50k, 100×5k, and noisy-neighbor shapes                  |
| Chaos                | Database, renderer, storage, workflow, provider, webhook, and reconciliation outages                                                                         |
| Architecture closure | No direct Resend, second renderer, live-text statement generation, alternate run engine, or bypass writer                                                    |

### Required public-seam scenarios

- exact preflight replay and changed-fingerprint conflict;
- stale source/publication/profile/review rejection with zero side effects;
- one-operation material staleness, rebuilt exact digest, unchanged-evidence
  reproof, and protected-review supersession;
- two concurrent `approveAndStartLiveRun` calls produce exactly one run and one
  final review decision;
- a participation edit supersedes review evidence bound to the old preflight,
  and a stale approve-and-start returns a typed conflict with zero side effects;
- participation race versus standard Start;
- concurrent Canadian individual versus cumulative coverage;
- destination change before, during, and after ambiguous handoff;
- direct-mail connection administrator without paid-lane authority, and
  paid-lane authorizer without connection-administration authority;
- direct-mail quote/upper-bound expiry, guard exceedance, count drift, and one
  authorized within-bound Start with no second staff action;
- execution-time direct-mail bound below the frozen ceiling, higher-bound
  exact-piece reauthorization, nonsemantic credential rotation, material
  connection change, stale CAS, and incompatible/over-guard rejection;
- duplicate additional-copy request at guard exhaustion and with an
  outcome-unknown paid attempt, proving one reservation and zero duplicate paid
  effect;
- pause/stop/privacy containment at every irreversible boundary;
- duplicate late-fact delivery and later source revision produce one logical,
  append-only obligation slot;
- completion while exceptions and later webhooks remain live;
- 50,000-item run with tenant fairness and bounded memory;
- complete 50,001-subject preflight followed by an atomic no-side-effect release block;
- cross-tenant IDs at every command/query;
- donor current-head race during full and Range access;
- duplicate copy request, terminal resolution, and later deliberate request;
- audit-package crash, retry, streaming, expiry, purge, and restore suppression.

### Route and UI proof

- Thin route tests prove authentication, origin/CSRF, input mapping, response mapping, and delegation.
- Small Playwright journeys cover ordinary U.S. preflight/start, exception repair, pause/resume/complete, self-print evidence, help, donor access/copy, and activated Canadian coverage.
- Automated accessibility checks are supplemented by keyboard, screen-reader, reflow/zoom, forced-colors, RTL/long-locale, and reduced-motion evidence.

## Release gates

1. Phase 17 and Phase 18 authority contracts are accepted or explicitly superseded.
2. Phase 7/14 household, DAF, year-boundary, and Statement Subject language is congruent.
3. One exact preflight/start tracer passes with real database constraints and zero side effects on stale rejection.
4. One ordinary U.S. annual statement passes source facts → run → Phase 18 artifact → portal → Phase 17 communication → exact access/copy.
5. Canadian nonparticipants prove zero surface and active issuers pass exact coverage/concurrency cases.
6. Delivery Profile compilation, destination succession, and route fallback pass deterministic replay.
7. Self-print is production-ready; connected direct mail stays dark until its
   connection, separate paid-lane authorization, exact count/cost guard, and
   provider evidence gates pass.
8. Pause/Resume/Stop and privacy containment pass every irreversible-boundary race.
9. Staff completion and return-to-review preserve independent downstream truth.
10. Donor unmetered access and outbound-copy deduplication pass exact-byte and authorization tests.
11. Run Evidence Record and audit-package retention/disposal are proved.
12. January-scale fairness, bounded memory, query plans, protected messages, and dashboard responsiveness pass.
13. WCAG 2.2 AA, keyboard, screen-reader, zoom/reflow, forced-color, RTL, and mobile evidence passes.
14. Security threat model, RLS/IDOR/storage/cache/log/export tests pass.
15. Closure tests prove the legacy live-text statement route and every alternate writer/orchestrator are removed.

## Implementation order

1. Freeze vocabulary, authority map, purpose catalog, reason catalog, and congruence amendments.
2. Establish the public Statement Operations seam and relational invariants.
3. Implement draft, preflight, participation, and atomic start.
4. Ship one ordinary U.S. end-to-end tracer.
5. Add Delivery Profiles, lane compilation, recipient snapshots, and destination succession.
6. Add fair execution, durable aggregates, and control fencing.
7. Add self-print, mail-house package, and physical evidence.
8. Add completion, late facts, supplemental work, grouped attention, and contextual help.
9. Add donor access/copy requests, Support overview, Run Evidence Record, and audit package.
10. Add opt-in Canadian coverage and any proof-gated direct provider.
11. Complete production-shaped security, accessibility, chaos, scale, restore, and architecture-closure proof.

## Decision-to-test traceability

| Decision | Primary clauses                | Release-blocking proof                                                                 |
| -------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| D1       | US19-01 to US19-03             | purpose mixing rejects; projection rebuild cannot mutate truth                         |
| D2       | US19-04 to US19-07             | exact atomic start, stale zero-effects, replay/concurrency                             |
| D3       | US19-08 to US19-10             | legal subject isolation, recognition separation, shared destination                    |
| D4       | US19-11 to US19-12             | inactive zero surface; nonoverlapping exact-issuer coverage                            |
| D5       | US19-13 to US19-14             | mailed-check boundaries, immutable primary, deduped late fact                          |
| D6       | US19-18 to US19-19             | deterministic profile resolution and exact lane reconciliation                         |
| D7       | US19-20 to US19-21             | frozen snapshot, live safety, governed succession                                      |
| D8       | US19-29 to US19-32             | O(1) fence and every handoff race                                                      |
| D9       | US19-26 to US19-28             | exact package, partial print, provider ambiguity/cancellation                          |
| D10      | US19-36 to US19-37             | staff completion, derived outcome, immutable snapshot/live follow-up                   |
| D11      | US19-33 to US19-35             | 50k/500k certification, fairness, protected capacity, honest target                    |
| D12      | US19-38                        | one resolver and four intent families from both entry points                           |
| D13      | US19-23 to US19-25             | finite occurrences, exposure proof, grouped attention                                  |
| D14      | US19-05 to US19-07             | no ordinary ceremony; one different-human protected atomic start                       |
| D15      | US19-09 to US19-10             | Off is zero; On is separate, deduped, non-tax                                          |
| D16      | US19-39 to US19-40             | unmetered exact-current access; bounded repeatable copy                                |
| D17      | US19-41 to US19-42             | minimized record; fixed temporary package; verified disposal                           |
| D18      | US19-15 to US19-17 and US19-44 | bounded pre-start control; no source override; tenant role/note policy; exact bulk CAS |

## Research evidence and modern-practice disposition

Research was refreshed on 2026-07-24. Legal rules remain owned by versioned Phase 7/18 jurisdiction contracts and qualified review; provider facts must be reverified at implementation and certification.

### Primary legal and standards sources

- [IRS Publication 526](https://www.irs.gov/publications/p526) states that a mailed check is considered delivered on the mailing date, distinguishes payment methods, defines contemporaneous written acknowledgment, and describes January 31 as typical practice rather than the statutory donor deadline. This supports D5's exact source date and D11's operational—not legal—target.
- [IRS Publication 1771](https://www.irs.gov/pub/irs-pdf/p1771.pdf) defines U.S. acknowledgment and quid-pro-quo disclosure content. Phase 19 must consume Phase 7/18 facts and cannot invent those statements.
- [CRA true-donor guidance](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/what-you-need-know-issue-official-donation-receipt.html) requires the receipt to name the true donor and requires evidence. This supports D3.
- [CRA official-receipt fields](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/what-information-must-on-official-donation-receipt-a-registered-charity.html) requires readable, not-easily-altered output, unique serial, donor, eligible amount, issuer data, and authorized signature. These remain Phase 7/18 authority.
- [CRA correcting/replacing receipts](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/correcting-replacing-official-donation-receipts.html) requires retained cancelled originals and replacement linkage. This supports immutable owner-routed correction rather than rerender or overwrite.
- [CRA timing guidance](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/when-should-a-charity-issue-a-receipt.html) suggests February 28 but states no statutory receipt-issuance timeframe. This supports purpose-owned operating targets.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) is the current W3C Recommendation and includes reflow, keyboard, focus, status-message, target-size, and error-prevention criteria used by the UX and test contracts.

### Provider and durable-execution sources

- [Resend Batch Email API](https://resend.com/docs/api-reference/emails/send-batch-emails) supports up to 100 messages per call, a 24-hour idempotency key, ordered response mapping, and currently no attachments. [Resend rate limits](https://resend.com/docs/api-reference/rate-limit) are team-wide and exposed through standard response headers; current account capacity must be observed rather than hard-coded. These support adapter-adaptive capacity and durable product identities.
- [Inngest flow control](https://www.inngest.com/docs/guides/flow-control), [concurrency](https://www.inngest.com/docs/guides/concurrency), and [throttling](https://www.inngest.com/docs/guides/throttling) distinguish executing-step concurrency, queued throttling, lossy rate limiting, and bounded priority. Phase 19 uses those as executor tools, not product truth.
- [PostGrid Print & Mail API](https://docs.postgrid.com/) documents predesigned PDF input, sandbox/live keys, Canada/U.S. letter layouts, rate limits, cancellation, and signed webhook behavior. It is the first proof candidate, not an adopted dependency.
- [Lob API](https://docs.lob.com/) documents letter creation, test/live keys, scheduled cancellation windows, and letter/tracking webhooks. It remains the U.S.-focused alternative.
- [USPS NCOALink resources](https://postalpro.usps.com/mailing-and-shipping-services/NCOALink) document licensed service-provider and processing-acknowledgment obligations. That is why NCOALink-to-CRM is explicitly future scope rather than an incidental provider flag.

### Comparative nonprofit-product evidence

- [Virtuous annual giving statements](https://support.virtuous.org/hc/en-us/articles/360054939472-How-Do-I-Send-Annual-Giving-Statements) demonstrates preview, bulk execution, portal publication, run history, and paper/email lanes. Phase 19 preserves those useful operations while replacing ad hoc live queries with frozen source-authoritative preflight.
- [Virtuous receipting groups](https://support.virtuous.org/hc/en-us/articles/33538055782029-How-Can-I-Use-Receipting-Groups) demonstrates ordered routing flexibility but also the brittleness of first-match query order. D6 replaces it with explicit versioned profiles and deterministic compatibility.
- [Blackbaud receipt history](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-receipt-history.html) demonstrates durable number/action/reason history and distinct copy/replacement intent. Phase 19 routes legal changes to Phase 18 rather than inventing lifecycle in operations.
- [Neon One year-end receipts](https://support.neonone.com/hc/en-us/articles/4407398027533-How-do-I-send-Year-End-Receipts) demonstrates preview/test-print and warns that household versus individual grouping can be legally inconvenient. D3 removes that guess by using the source-owned legal donor.
- [Zeffy year-end receipt guidance](https://support.zeffy.com/your-zeffy-year-end-tax-receipts-guide-qpqwe) demonstrates always-available donor self-service and cumulative receipt handling. Phase 19 keeps portal access unmetered but retains tenant and exact-issuer ownership instead of a platform-wide forced resend.
- [Bloomerang giving-statements update](https://bloomerang.co/news/bloomerang-launches-giving-statements-feature/) demonstrates donor-friendly recognition of financial and nonfinancial support. D15 adopts the engagement value but separates it from official tax output.

### Research conclusions

- A frozen reviewed run is safer and more operable than an ad hoc saved query.
- Legal donor, recognition, recipient, destination, and delivery must stay separate.
- Self-service access reduces support load and should not mint copies.
- Self-print must remain first-class because it is the common tenant choice.
- Provider batching, limits, and cancellation windows are volatile adapter facts.
- Durable internal semantic identity must outlive every provider idempotency window.
- A single workspace with separate axes is clearer than a false global completion percentage.
- Tenant flexibility is best expressed through versioned profiles, bounded participation, and explicit operational actions—not arbitrary queries or legal DSLs.

## Ruthless adversarial review

Every requested category contains a concern. The table records the permanent mitigation; no category is waived because it appears unlikely.

| Category                | Concern | What could go wrong / why it matters                                                                                               | Severity | Likelihood             | Permanent prevention                                                                                         |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Brittleness             | Yes     | Mutable queries, current contacts, provider states, or one mixed status could silently change population or route                  | Critical | High without controls  | Immutable preflight, pinned revisions, separate axes, typed stale rejection                                  |
| Technical debt          | Yes     | Extending the `.txt` route or duplicating Phase 17/18 logic creates split-brain systems                                            | Critical | High                   | One service boundary; clean removal; architecture-closure tests                                              |
| Edge cases              | Yes     | Late checks, joint donors, returns, stale destinations, partial print, and provider ambiguity create wrong documents or duplicates | High     | High seasonally        | Closed reason catalog, source ownership, succession, reconciliation, dedicated scenario matrix               |
| Footguns                | Yes     | Force include/send/retry, skip-errors bulk actions, arbitrary destinations, or false completion can cause legal/privacy harm       | Critical | Medium                 | Bounded commands, safe defaults/focus, exact preview, CAS, no bypass controls                                |
| Tenant safety           | Yes     | Cross-scope IDs, queue payloads, exports, caches, or provider webhooks could leak donor data                                       | Critical | Medium                 | Composite scope, forced RLS, nonrevealing APIs, opaque IDs, hostile tests                                    |
| Over-engineering        | Yes     | A workflow builder, campaign parent, legal DSL, case system, or provider marketplace would obscure ownership                       | High     | Medium                 | Explicit non-goals and one-primitive launch-story rule                                                       |
| UX/UI friction          | Yes     | Approval ceremony, noisy settings, KPI walls, provider jargon, or multiple statement copies slow staff and confuse donors          | High     | High                   | Exception-first workspace, ordinary one-action start, one help door, current-first portal                    |
| Hidden coupling         | Yes     | Statement status tied to renderer, Resend, Inngest, current contact, or provider-specific states makes change unsafe               | High     | High                   | Ports, normalized evidence, owner references, provider-neutral records                                       |
| Failure modes           | Yes     | Crash or timeout after external acceptance can trigger blind duplicate send/print                                                  | Critical | Medium                 | Semantic identity, outbox, leases/fences, outcome-unknown state, polling/webhook reconciliation              |
| Data integrity          | Yes     | Duplicate coverage, mutable membership, skipped bulk errors, and copied downstream states corrupt reports                          | Critical | Medium                 | Unique coverage, immutable run, atomic bulk commands, reconciled aggregates                                  |
| Security/privacy        | Yes     | IDOR, raw URLs, unmasked destinations, exports, and audit packages expose PII                                                      | Critical | Medium                 | Reauthorization, no-store exact access, encryption, masking, fixed temporary packages                        |
| Scalability/performance | Yes     | Browser assembly, N+1 resolution, huge attachments, or one noisy tenant can collapse January operations                            | High     | High at growth         | Set-based/keyset work, certified shapes, fair claims, adaptive backpressure, protected capacity              |
| Operational burden      | Yes     | Manual per-recipient review, tribal provider recovery, or false completion creates January support overload                        | High     | High                   | Automatic source decisions, grouped causes, runbooks, self-service, staff-controlled completion              |
| Observability gaps      | Yes     | Stale workers, drift, provider ambiguity, package mismatch, or fairness starvation can remain invisible                            | High     | Medium                 | Durable metrics by axis/cause/age, reconciliation, invariant alerts, runbooks                                |
| Dependency/integration  | Yes     | Resend, Inngest, storage, PostGrid/Lob, or webhook contracts can change                                                            | High     | High over product life | Versioned ports, capability probes, evidence gates, exit tests, revalidation                                 |
| Migration/upgrade       | Yes     | Provider IDs or prototype schema treated as domain truth makes replacement expensive                                               | High     | Medium                 | Provider-neutral semantic records, clean cut, exportable evidence, no legacy adapter                         |
| Other hazards           | Yes     | Race conditions, stale approvals, rollback after side effects, unclear ownership, and unproved deploys                             | Critical | Medium                 | Atomic release, control epoch, explicit owners, forward-compatible migrations, dark launch and closure proof |

### Ruthless synthesis

The safest and simplest path is:

1. fix vocabulary and ownership conflicts before schema work;
2. build the public service and database invariants first;
3. prove one ordinary U.S. source-to-artifact-to-portal-to-email tracer;
4. add tenant profiles and recipient snapshots without adding rule builders;
5. prove control fencing and tenant-fair execution before scaling volume;
6. make self-print complete before considering a provider;
7. add completion, help, self-service, late facts, and evidence on the same authorities;
8. activate Canadian and connected-mail capabilities only after exact evidence gates;
9. delete the live-text and alternate runtime paths before production;
10. refuse release until security, accessibility, chaos, scale, restore, and architecture-closure evidence all pass.

## Cross-PRD congruence appendix

The following amendments are normative for Phase 19:

1. Replace roadmap **issued-on-accept** with atomic durable run release. Start is not issuance, generation, portal access, send, delivery, print, or mail.
2. Replace Phase 7/14 blanket household official statements with exact source-owned Statement Subjects. Household/DAF recognition may appear only in the separate optional Support overview.
3. Treat Phase 14 contribution/recognition lines as source inclusion facts beneath a Phase 19 Run Item, not Phase 19 run items themselves.
4. Replace universal year-boundary evidence/approval ceremony with one permissioned staff attestation by default; tenants and jurisdiction packs may strengthen it.
5. Make Phase 15 immediate receipt intent consume the frozen receipt plan so Canadian annual-cumulative gifts do not mint unintended individual receipts.
6. Amend donor-self-service official statements to exact legal-donor subjects; indirect recognition uses the separate informational purpose.
7. Advance Phase 17 statement message contracts from Reserved only after the finite D13 producer/facts/artifact/recipient proof is executable.
8. Keep Phase 18 as document/current-head/exact-byte authority and Phase 19 as population/run authority.
9. Add Phase 19 record ownership to the Phase 1 source-of-truth matrix.
10. Close roadmap open questions: Statement Subject is the grouping unit; self-print is default; at most one provider is proof-gated; launch capacity is certified at 50,000 per run and 500,000 concurrent equivalents.

No amendment transfers ledger, legal-donor, document, communication, contact, privacy, or records ownership into Phase 19.

## Anti-overengineering guardrail

The permanent system is:

- one source-authoritative population;
- one exact Run Preflight;
- one atomic release barrier;
- one canonical run/item system;
- one Recipient-Document Operation model;
- one public Statement Operations service;
- one Phase 18 document boundary;
- one Phase 17 communication boundary;
- one physical-fulfillment contract;
- one control fence;
- one immutable Completion Snapshot sequence;
- one PII-minimized evidence projection; and
- one exception-first workspace.

Any new primitive requires a launch user story and a named authority owner. Tenant flexibility comes from bounded profiles, assignments, participation, capabilities, and explicit operational choices—not arbitrary programming surfaces.

## Further Notes

- This document is a planning and acceptance contract. It introduces no runtime
  implementation, migration, ticket, provider adoption, or live-send authority.
- The Phase 17/18 authority package must be accepted, merged, or explicitly
  superseded before Phase 19 implementation dispatch.
- Resend, Inngest, storage, PostGrid, Lob, postal, and jurisdiction facts are
  volatile. Implementers must reverify their official current contracts during
  dependency binding and release certification; provider facts never become
  domain truth.
- PostGrid and Lob remain research candidates. Self-print is the only required
  physical launch lane, and at most one connected direct-mail adapter may pass
  the independent proof gate.
- NCOALink-to-CRM remains a separately groomed future capability. No Phase 19
  provider response may silently overwrite CRM contact data.

## Definition of done

Phase 19 is complete only when:

- all US19 stories pass through the confirmed public seam;
- every release gate has durable evidence;
- ordinary staff can complete the common January flow quickly without unnecessary approval or configuration;
- donors can safely access exact current statements and request another copy;
- source, document, portal, communication, physical, control, completion, and evidence truth remain separate;
- tenant fairness and isolation hold at certified volume;
- Canadian behavior is absent for nonparticipants and correct for activated issuers;
- self-print is complete and any provider is proof-gated;
- the live `.txt` annual-statement route and every alternate writer/orchestrator are absent; and
- the specification, OpenSpec deltas, ADRs, and predecessor terminology remain congruent.
