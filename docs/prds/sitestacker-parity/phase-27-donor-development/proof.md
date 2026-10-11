# Phase 27 — Cross-cutting architecture, proof and operation

These requirements apply to every domain volume. Existing owner constraints remain in force; narrower decision-specific requirements and exact monitor profiles are retained, not replaced by this common floor.

## REQ27-Q01 — One authoritative command boundary

**Trace:** D1–D30; ADR0001; platform boundaries.

All P27 business mutations SHALL execute in the canonical shared API/domain boundary against Asym Postgres. App routes are thin adapters; browser collections expose only approved current projections. A read model, search index, cache, board, export or task projection cannot become a second write authority. P9 retains identities, relationships, assignments, encounters and shared tasks; P27 owns partnership work, stage catalogs, Requests, appeal plans and their meaning. Finance, recognition, commitment, content, dispatch, documents, care and identity owners retain their authoritative facts. Source modules expose bounded authorized commands and reads; no direct consumer writes to their tables and no restored Twenty dependency.

### AC27-Q01-01

- **GIVEN** a staff actor uses either a list, detail, board or later qualified projection.
- **WHEN** the same business change is submitted.
- **THEN** the same owner validation and durable outcome apply and there is one authoritative history.

### AC27-Q01-02

- **GIVEN** a dependent source is unavailable or not qualified.
- **WHEN** a consumer attempts a source-owned effect.
- **THEN** the dependent action reports unavailable with safe recovery, makes no substitute fact and leaves unrelated valid work usable.

## REQ27-Q02 — Current authority across all paths

**Trace:** D4/D6/D22–D30; P3/P10/P12; ADR0211.

Every read, mutation, background attempt and result recovery SHALL derive tenant and acting principal from authenticated trusted context and recheck current acting-context authority, capabilities, subject scope, source classification and Legal Entity where applicable. Human contexts prove current Active Tenant Assignment/membership where required by their contract; background execution proves its qualified service identity/capability and live human-owner ceiling, never a fabricated human session or membership. A caller may request an eligible subject, responsible person or target value; only the source may validate and establish that choice. Tenant, author, actor, approval attribution, permission scope and security audit fields are not caller-assigned facts. Assignment, audience membership, stage, household/church membership, shared email and possession of an opaque ID never grant access. Background credentials are bounded by the currently admitted source capability and current non-human-identity ceiling; original initiation is not permanent delegated authority. Donor/missionary/staff mixed identities use the selected acting context, not the union of roles.

### AC27-Q02-01

- **GIVEN** two tenants contain similar identities and a staff actor supplies a foreign ID or forged attribution.
- **WHEN** any list, command, job or receipt is requested.
- **THEN** no foreign value or effect is returned, counts do not disclose it and accepted audit attribution comes only from the authenticated source.

### AC27-Q02-02

- **GIVEN** a user loses access after submit but before job execution or receipt recovery.
- **WHEN** the delayed path runs.
- **THEN** current policy denies the forbidden effect or disclosure while preserving lawful already accepted work.

## REQ27-Q03 — Database constraints and effective RLS

**Trace:** D4/D6/D22–D30; current Supabase/Postgres owner conventions.

Every new source relation SHALL carry tenant scope and stable identifiers, with tenant-aware composite foreign keys for owned references. Required references and enum/state combinations are constrained; optional assessment or incomplete intake is represented intentionally, never by fictitious IDs. Enforce source-specific cardinality and immutable identity/attribution through constraints and one guarded transaction, including old-row to new-row transformations. Index tenant/scope predicates and foreign-key access paths. Exposed tables require effective grants and RLS; test effective SELECT/INSERT/UPDATE/DELETE permissions, both USING and WITH CHECK outcomes, permissive/restrictive policy composition, views, RPC EXECUTE grants, storage references, owners and bypass roles. Default PUBLIC function execution is revoked for privileged commands; use invoker security or a narrowly qualified definer with fixed safe search path and explicit authorization. A service-role command must preserve the same domain boundary. No broad authenticated role grant substitutes for row/field authorization. Protected history cannot be casually updated/deleted and referenced catalogs cannot cascade-delete it; source retention/correction remains possible through its qualified command.

### AC27-Q03-01

- **GIVEN** an authenticated user can edit a permitted record.
- **WHEN** they attempt to change tenant, author, scope or a reference to an ineligible row through table, RPC, upsert or view.
- **THEN** each bypass is rejected atomically by the actual deployed policies/constraints or qualified source boundary.

### AC27-Q03-02

- **GIVEN** a privileged job or definer runs.
- **WHEN** it attempts an out-of-scope write or disclosure.
- **THEN** the actual capability ceiling denies it and the test verifies grants, policies and function configuration rather than SQL strings alone.

## REQ27-Q04 — Durable effects and truthful retries

**Trace:** D4/D6/D22–D30; ADR0026/ADR0183.

A source transaction SHALL commit the authorized business effect, its revision/history, durable command receipt and required downstream intent together or commit none. An unchanged same-state command is a no-op without a fabricated new event; a genuine repeated occurrence has its own identity. Semantic idempotency is scoped to tenant, source purpose and operation identity and survives transport retries and later workflow adoption. A reused key with different normalized intent conflicts. After a response is lost, recover the original outcome with current disclosure permission, never resubmit a new business effect. Required secondary work is durably recoverable; its failure is displayed independently of source success. Use the existing durable execution/outbox patterns, not a new scheduler or generic event-sourcing platform. External ambiguous success is reconciled against the provider/source contract before replaying an irreversible effect.

### AC27-Q04-01

- **GIVEN** the source commits but the response is lost.
- **WHEN** the actor retries the same operation.
- **THEN** one business effect/history entry/required work intent exists and the permitted original result is recovered.

### AC27-Q04-02

- **GIVEN** source success precedes failed task or notification projection.
- **WHEN** recovery executes twice.
- **THEN** source success remains true, one required effect is visible after recovery and no extra task/message is created.

## REQ27-Q05 — Concurrent intent and temporal correctness

**Trace:** D6/D10–D25/D28/D30.

Mutations SHALL bind the expected current source revision and exact selected intent. Authoritative serialization must protect the source invariants under concurrent writes, not just check a stale UI revision before a later unconstrained update. Never silently overwrite a newer stage, assessment, terms revision, response, exclusion, protected assignment or policy generation. Capture actual occurrence/effective dates separately from trusted recorded time and correction provenance. Date-only values retain calendar and precision; unknown dates remain unknown. Rule/catalog changes do not rewrite prior facts. Authorization, new-use eligibility, membership and suppression are checked at the admitting transaction or the consuming owner's fenced effect boundary as defined by each contract.

### AC27-Q05-01

- **GIVEN** two real database sessions edit the same source revision.
- **WHEN** their commits are deliberately interleaved.
- **THEN** at most the permitted serialized intent wins and the other gets a recoverable conflict without losing authorized draft input.

### AC27-Q05-02

- **GIVEN** a backdated or corrected encounter, gift or decision arrives.
- **WHEN** current projections recompute.
- **THEN** history preserves its original and corrected meaning and recorded time does not masquerade as occurrence time.

## REQ27-Q06 — Complete permission-safe projections

**Trace:** D24/D26–D30; original brief.

Lists, filters, counts, sorts, search, briefs, timeline excerpts, badges, exports, cached results and notifications SHALL apply the same current source disclosure and tenant/context boundaries. Cache identity includes admitted scope and the relevant source/configuration generation; serving a stale private value is never an availability fallback. Unknown, incomplete, calculating, stale, unavailable, not applicable and known zero remain distinct. Counts and totals operate on the qualified complete authorized scope, not the loaded page. Stable server ordering and bounded pagination prevent missing/duplicate results during ordinary traversal; refresh after relevant concurrent change communicates that the view changed. Suppressed identities and restricted child records do not leak via existence errors, count differences or sorting.

### AC27-Q06-01

- **GIVEN** two viewers have different source permissions and share a cached filter.
- **WHEN** both open list, counts, brief, export and history.
- **THEN** each receives only their current permitted facts and no cache or aggregate expands disclosure.

### AC27-Q06-02

- **GIVEN** only one page is loaded or financial coverage is missing.
- **WHEN** a total or coverage label renders.
- **THEN** the complete qualified total is used or the limitation is explicit; it never reports the page sum as complete or unknown as zero.

## REQ27-Q07 — Operational follow-through without coercion

**Trace:** D4/D6/D7/D21/D26/D27; ADR0183.

Deliberately admitted active managed partnership work SHALL have an appropriate current next shared task with a due date or an explicit actionable owned exception with a review/repair path. Completion, cancellation, transfer and access loss cannot silently drop this floor. Blocked/cancelled/ended work is not a healthy next action. Source-owned obligations project into the existing shared Tasks Hub and close only through their source; visibility, notifications and generic read/delivery acknowledgements are not source completion. An exact source-owned receiving acceptance or acknowledgment may satisfy its own qualified handoff predicate, without completing other obligations. Bind each native reminder to its exact qualified purpose. Pause reviews retain D6's calendar/attention contract; do not generalize it into alerts on every task edit. No newly invented email/SMS cadence, manager escalation, business-hour shifting or mandatory missionary logging is authorized. Sparse voluntary history is not failure or neglect.

### AC27-Q07-01

- **GIVEN** an active partnership completes or cancels its last valid next task.
- **WHEN** the source outcome is rendered.
- **THEN** a valid replacement or owned actionable exception is visible and the record is not falsely healthy.

### AC27-Q07-02

- **GIVEN** a missionary adds an eligible voluntary update without an active staff enrollment.
- **WHEN** the update is accepted.
- **THEN** no enrollment, compulsory task, quota, coaching obligation or performance penalty is created.

## REQ27-Q08 — Native integration independence

**Trace:** D22/D26/D29/D30; DON-14–DON-16 and WS-18-CORE.

The entire ordinary staff cultivation flow SHALL remain usable without Workflow Studio, Eve, hybrid Web Studio, SMS or enterprise identity. Expose accepted source events and bounded commands for optional consumers, with a permanent source-purpose effect identity shared with native follow-up. Different legitimate purposes remain different effects. Optional consumers cannot write owner tables, infer communication consent, revive retired/private context or use directory membership as portfolio/access succession. Public websites require an independently qualified public projection. No runtime coding-agent skill library, general grant engine or new vendor is introduced.

### AC27-Q08-01

- **GIVEN** optional Workflow Studio and Web Studio/Eve products are unavailable.
- **WHEN** staff complete assignment, admission, Request, response and follow-up.
- **THEN** the qualified native workflow succeeds without opening a diagram or enabling optional products.

### AC27-Q08-02

- **GIVEN** a later configured workflow requests the same source-purpose follow-up.
- **WHEN** native and configured work both retry.
- **THEN** one intended task/message exists; a separately authorized different purpose remains independent.

## REQ27-Q09 — Clear composed interface and accessible alternatives

**Trace:** D11–D30; shared base-maia contract.

Compose the existing CRM shell, saved views, task controls, Base UI primitives and exact base-maia/Zinc semantic tokens. Keep partnership lifecycle, stage/list, responsibility, Request response and source finance outcomes visually distinct. Each screen shows current context, permitted options and a useful next action; deeper configuration appears only when relevant. Ordinary reversible saves need one deliberate Save, not repetitive safety modals. Explain a real irreversible or material cross-domain consequence before committing. Preserve list position/filter and authorized edits through navigation and recoverable errors. Provide loading, empty, denied/unavailable, stale/conflict, pending and partial-success states. Boards have equivalent list/menu/keyboard operations; drag is never the only control or a financial mutation. Meet WCAG 2.2 AA, including keyboard, focus restoration, labels, errors/status announcements, contrast, 320 CSS-pixel reflow, zoom, touch target rules and reduced motion in the composed flow, not just component fixtures.

### AC27-Q09-01

- **GIVEN** a keyboard or assistive-technology user performs the ordinary and failure journeys.
- **WHEN** they change a stage, review a Request, manage an appeal and recover a conflict.
- **THEN** every control and result is understandable without drag/color alone, focus is usable and authorized input is retained.

### AC27-Q09-02

- **GIVEN** a small-screen or slow-connection user saves.
- **WHEN** the network delays, fails or returns an ambiguous response.
- **THEN** pending state is truthful, repeated taps cannot duplicate effects and the next recovery action is clear.

## REQ27-Q10 — International and sensitive context

**Trace:** D2/D6/D22/D25–D30; existing privacy/document owners.

Preserve Unicode names and tenant-defined labels without Western first/last-name, ASCII, address or phone assumptions. Display exact currency codes and owner-supported minor units with locale formatting, and dates with their actual precision/timezone. Long text, translated text and RTL content must remain readable and operable. Collect only necessary development context; do not require addresses, donor financial credentials, care details or missionary location for ordinary work. Structured briefs reference permitted sources; uploads, attachments and generated documents use existing qualified file/document owners, never a local private bucket/public link workaround. Redaction, retention, anonymization, deletion, backups and exports remain source-governed; history integrity is not unlimited retention or a right to disclose. Technical logs use safe identifiers/reason codes rather than protected narrative or payment data.

### AC27-Q10-01

- **GIVEN** a record uses long Unicode/RTL names, zero- or three-decimal currency and date-only history.
- **WHEN** it is edited, viewed and exported through allowed paths.
- **THEN** identity and exact quantities survive with readable labels and no fabricated address, date or currency conversion.

### AC27-Q10-02

- **GIVEN** a source becomes restricted or reaches its governed retention action.
- **WHEN** briefs, files, exports and cached recovery are requested.
- **THEN** current restriction propagates to all derivatives while lawful audit and correction follow the owner policy.

## REQ27-Q11 — Migration and safe activation

**Trace:** D10/D25/D26/D28/D30; original retained-data census.

Before new writes, inventory reached legacy rows, placeholders, references, assignments/provenance, catalogs, incomplete intake and pending jobs. Record deterministic mappings and explicit ambiguous/unmapped cases, source counts and referential checks. Do not turn unknown legacy assignment provenance into Auto, missing ratings into zero, imported notes into shared history, or imported financial state into confirmed money. Expand compatible readers/constraints first; backfill in bounded resumable idempotent batches with no user effects; verify mappings before enabling qualified writers. Fence incompatible old clients/jobs. Rehearse old-reader/new-schema and new-reader/old-schema behavior, backup restore and failed backfill recovery. Disable new admission safely while preserving accepted work and qualified recovery. After new writes, use compatible rollback/roll-forward; never downgrade destructively or erase histories to restore an old schema.

### AC27-Q11-01

- **GIVEN** legacy rows contain unknown role provenance, unmapped scope and protected notes.
- **WHEN** migration resumes after a simulated crash.
- **THEN** each retained source maps once or remains an owned explicit exception with no transfer, disclosure, duplicate effect or invented fact.

### AC27-Q11-02

- **GIVEN** new-version writes have occurred.
- **WHEN** the feature is disabled and old jobs attempt execution.
- **THEN** incompatible writers are fenced, accepted history and handling obligations remain accessible through current authority and a tested safe recovery path exists.

## REQ27-Q12 — Measured capacity and bounded work

**Trace:** D4/D6/D24–D30.

Use bounded server queries, scope-selective indexes, finite bulk snapshots, checkpoints and tenant-fair workers; do not fetch all private children or all tenants into application memory for a row. Materialize only after measured workload warrants it; projections remain reconstructible and fenced to current authority/generation. Before activation, release evidence SHALL declare numeric admitted envelope and budgets: tenants, largest-tenant Parties/partnerships/Requests/appeal members/history, list lengths, concurrent actors, rules/overlap, batch size, arrival rate, payload limits, p95 command/read latency, error rate, queue age/freshness and recovery budget, each with units, test duration and hardware/provider version. Exercise the envelope, boundary and overload with representative authorization and skew. No unset budget, unbounded job or sample-only benchmark can pass this gate. Existing per-decision monitor thresholds remain exact; no unproved throughput or arbitrary unlimited-scale promise is made.

### AC27-Q12-01

- **GIVEN** a release profile omits a numeric bound, source coverage or supported-version measurement.
- **WHEN** activation readiness is evaluated.
- **THEN** the affected profile fails qualification with the missing evidence named.

### AC27-Q12-02

- **GIVEN** the declared maximum tenant and an overloaded tenant run concurrently.
- **WHEN** representative reads, writes and recovery execute.
- **THEN** measured budgets hold for admitted tenants or overload is visibly bounded without lost accepted work, unauthorized fallback or starvation.

## REQ27-Q13 — Separate business evidence and operational signals

**Trace:** D6/D22–D30.

Business history SHALL show what changed, prior/new meaning, actual actor or source provenance, relevant revision, occurrence/effective and recorded time, and linked correction within current permissions. Keep durable business history, security audit and technical diagnostics distinct. Accepted commands have recoverable scoped receipts; bulk summaries preserve per-member accepted, rejected, conflicted and not-attempted outcomes without exposing hidden records. Each adopted monitor retains signal, threshold, accountable role and concrete response; assign actual people/on-call teams and exercise runbooks before activation. Source-owned repair, reconciliation and retry must not require routine direct database editing. Monitor security/financial invariants as incident signals in addition to preventive release tests, never in place of them.

### AC27-Q13-01

- **GIVEN** a command partially completes downstream or a batch has mixed results.
- **WHEN** an authorized operator investigates.
- **THEN** the operator can distinguish accepted source effects, pending/rejected work and safe next actions without reading private narrative logs.

### AC27-Q13-02

- **GIVEN** a declared monitor breaches its threshold.
- **WHEN** its runbook is exercised.
- **THEN** the assigned owner receives the signal and performs the named containment/reconciliation response preserving source history.

## REQ27-Q14 — Confirmed test seam and independently verifiable stories

**Trace:** User testing-seam confirmation; to-spec.

Use one primary integrated product acceptance setup: actual authenticated owner commands, authorized projections and durable-job entry points backed by disposable Supabase/Postgres, exercised by real Mission Control and qualified missionary-workspace browser journeys for their respective actors. Reuse Playwright, Vitest and actual SQL/migration seams. Focused direct role/RLS, separate-session concurrency and migration tests supplement the same backend where the browser cannot prove an invariant. Disable demo authentication and placeholder fallback; missing prerequisites fail the required suite. Use distinct real synthetic staff, finance, missionary and second-tenant identities. Only external I/O may be substituted for controlled failures/order, never the internal authority or durable effect being proved. Ordinary unit tests remain offline and test useful boundary calculations, not implementation-call counts. Run against the actual supported Supabase/Postgres release version and separately qualify external providers when consumed. Every story maps to requirement and observable positive/negative or boundary acceptance; each failure must identify the violated behavior.

### AC27-Q14-01

- **GIVEN** an acceptance run accidentally uses demo auth, fake source storage or a missing required owner.
- **WHEN** suite preflight runs.
- **THEN** it fails and cannot be reported as real integration evidence.

### AC27-Q14-02

- **GIVEN** an implementation claims a story complete.
- **WHEN** its mapped tests and source/provider qualification are reviewed.
- **THEN** the external outcome, persistence and relevant denial/failure/race cases are proved on the admitted version; documentary checks alone do not close it.

## REQ27-Q15 — Financial owner gates E7 and C-01

**Trace:** D22 R07/R15; D25; D29 R05; owner conflict register.

E7 remains an explicit P13-owned unresolved temporal meaning: live source-code-to-campaign reporting versus posting-time/frozen campaign attribution and post-gift mapping immutability. The owner must define prior gifts including previously unmapped codes, hierarchy versus mapping changes, correction/refund/recurring-origin effects and current/historical measures. P27 SHALL NOT choose a hidden policy or drop the required native financial report: affected received-toward-appeal results are unavailable until the exact adapter is qualified; independent Requests, nonfinancial work and permitted financial source facts continue. C-01 separately concerns optional tenant separation versus mandatory different approver for posted-gift corrections. Affected correction implementation remains undispatched until the owner ruling. Request review, physical intake and assignment policy do not settle it. The spec records these gates without reopening any settled Phase 27 decision or pretending upstream policy is complete.

### AC27-Q15-01

- **GIVEN** E7 attribution meaning is unresolved.
- **WHEN** an affected appeal asks for received-toward-goal.
- **THEN** the measure is explicitly unavailable, no live/frozen assumption is made, and independent work remains usable.

### AC27-Q15-02

- **GIVEN** a reviewed Request or finance-intake record is used as authority to correct a posted gift before C-01 resolution.
- **WHEN** the dependent command is proposed.
- **THEN** that lane remains blocked by the financial owner, without manufacturing correction approval.

## REQ27-Q16 — Truthful release evidence and staff pilot

**Trace:** All ratified decision proof limits; original brief.

Deliver incrementally in source dependency order: qualify owners and constraints; complete the native assignment→admission→Request→response→follow-up journey; add the agreed stage flexibility, appeal/intake/shared context and optional ratings/Auto under their own gates; prove migration, failure and audience changes; then run a bounded intended-user pilot and activate only qualified cohorts. All in-scope stories remain required; sequencing cannot silently defer them out of scope. Include representative staff, finance handlers and missionary contributors for their actual roles, accessibility users, mobile/slow-network conditions and unfamiliar users without treating synthetic walkthroughs as user feedback. A participant must be able to explain current state, audience, financial meaning, available changes and next action without facilitator rescue. Any unsafe interpretation stops expansion until corrected and retested. Publish dated pass/fail evidence with exact build/provider/cohort and limitations; planning, published, implemented, qualified and activated remain distinct.

### AC27-Q16-01

- **GIVEN** pilot participants mistake a planning response or physical gift report for received money, private notes for shared content or an assignment for access.
- **WHEN** the pilot is reviewed.
- **THEN** expansion stops, the flow/copy is corrected and the affected journey is retested.

### AC27-Q16-02

- **GIVEN** only specification formatting, trace and OpenSpec validation have passed.
- **WHEN** the work is reported.
- **THEN** the report says specified/published and keeps implementation, provider, runtime, usability and activation proof outstanding.
