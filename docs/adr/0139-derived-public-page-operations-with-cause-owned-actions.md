# ADR-0139: Derived Public Page operations with cause-owned actions

**Status:** Accepted (founder ruling, Phase 22 D22, 2026-08-14)

## Context

After D21 replaces the legacy public-ministry surface, staff need one calm place
to find Public Page reviews and the uncommon conditions that genuinely require
human action. The underlying facts remain independently owned: D5 owns
editorial workflow, D7 owns Giving readiness, D18 owns public serving and
convergence, and the other D1–D21 contracts own their own effects. A Page may be
public, retain its prior safe photo, and have Giving unavailable at the same
time. A single mutable Page-health state would misrepresent all three facts.

The repository also contains generic Mission Control task and attention tables,
but their mutable completion, dismissal, suppression, free-form metadata,
tenant-only identity, and broad privileged access cannot prove that a Public
Page source cause was corrected. Reusing those rows as Page truth would create a
second workflow and a cross-domain repair authority.

## Decision

Adopt the exact Phase 22 D22 C-prime-R formulation:

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, disposable,
> permission-filtered Public Page Operations Projection presented to authorized
> Mission Control staff as one `Public pages` workspace for each exact Tenant ×
> Legal Entity × environment × Site × locale scope, derived only from D1–D21's
> independently authoritative review candidates and finite, versioned,
> privacy-safe owner-condition descriptors rather than raw owner tables,
> duplicated status logic, or inferred health. It has exactly three stable,
> URL-addressable views: `To review`, which references without copying D4/D5's
> exact candidates and actions; `Needs attention`, which contains only current,
> unresolved, owner-labelled causes for which the current actor can perform one
> concrete authorized action; and `All pages`, which provides one
> coverage-labelled, server-filtered inventory of every Page the current actor
> may know exists. These are navigation views, never Page states. D5's `Draft`,
> `Waiting for review`, `Changes requested`, and `Published`; D18's `Public`,
> `Updating`, and `Not public`; D7's `Ready`, `Giving unavailable`, and `Staff
action needed`; and every other owner outcome remain separate
> plain-language facets, with no overall Healthy, Failed, Live, broken,
> completion-percentage, or red-amber-green Page score.**
>
> **Every projected operational condition is rooted in one stable owner-domain
> cause and monotonic source version, exact scope and affected Page or Ministry
> Update membership, privacy-safe visitor consequence, current human-
> actionability, required Phase 12 capability, responsible owner, finite
> code-owned action kind, and source coverage/through-time. One cause may affect
> many Pages without becoming many tasks or notifications, while multiple causes
> on one Page remain independently visible and independently owned. Identical
> same-scope effects are coalesced around the one root-cause action, and affected
> Pages remain inspectable only after current authorization. The projection is
> non-authoritative, application-read-only, disposable, and rebuildable from
> source truth; it has no mutable close state. A condition leaves current work
> only when its owner proves resolution or supersession. Missing, delayed,
> contradictory, stale, partial, or unavailable coverage never becomes zero,
> healthy, resolved, or a guessed task, and notification read state, dismissal,
> elapsed time, provider acceptance, an empty query result, or projection
> absence closes nothing.**
>
> **Each actionable item first states what visitors can see now and whether
> Giving is currently available, then what changed or could not be applied,
> whether Asym is already handling it, who owns the next step, and one literal
> action such as `Review changes`, `Replace photo`, `Review designation`, or
> `Choose what supporters see`. Technical provenance and exact freshness remain
> progressively disclosed to authorized staff. A code-owned action resolves to
> the owning workflow with an opaque reference and safe return path; that owner
> re-proves the actor, capability, scope, source head/version, and current facts
> before accepting any command. A viewer without that capability receives only
> permission-safe owner-directed explanation in `All pages`, not a disabled
> button or a `Needs attention` item. If no authorized responsible principal
> exists, the applicable Phase 12 access owner receives that separately owned
> cause. D22 cannot create, approve, publish, repair, retry, purge, waive,
> suppress, close, or reinterpret D1–D21 or Phase 10/12 truth.**
>
> **Quiet is structural: healthy Pages, successful automatic release, ordinary
> propagation, provider waiting, automatic retries, projection rebuilds, and
> resolved work produce no attention item, navigation alarm, email, success
> wall, or repeating live-region announcement. Communication-owning Phases 6
> and 17 may deliver at most one privacy-minimized notification occurrence for
> an exact root cause and responsible-owner generation when work first becomes
> human-actionable, its responsible owner changes, its owner-defined deadline or
> escalation is reached, or visitor impact materially worsens; repeated source
> observations do not fan out to every merely capable staff member. D22 creates
> no universal priority, due-date, SLA, assignment, or escalation engine, and
> immediate Phase 10 safety handling never waits for D22. Missionaries remain in
> their ordinary D1 Public pages dashboard and see only D5/D18 vocabulary plus
> calm actions or organization-owned explanations relevant to their exact
> assignment; spouse, teammate, subject, participant, D19 Ministry Assignment,
> and Phase 21 Support relationships grant nothing by themselves; D12 response
> moderation remains D12-owned; and donors receive no operations projection,
> cause, owner, trace, or diagnostic. An otherwise admitted Page may remain
> visible while an independently unavailable Give action uses honest
> non-technical text and never substitutes a Designation.**
>
> **The projection separates root causes from exact Page/Update impacts and
> preserves structurally complete, non-null Tenant, Legal Entity, environment,
> Site, locale, owner-domain, cause, version, Page/Update, and applicable
> generation identities through kind-correct constraints and unique impact
> membership. Projection rows, impacts, counts, filters, search, exports,
> subscriptions, logs, notifications, and caches are permission-filtered before
> presentation; exposed Supabase objects use explicit grants, indexed default-
> deny RLS and security-invoker behavior, privileged projector paths remain
> server-confined and audited, cache keys include complete scope, and no count,
> empty state, timing difference, URL, or notification may reveal another
> Tenant or a restricted Page. Transactional owner occurrences, idempotent
> monotonic consumers, out-of-order rejection, tenant-fair durable processing,
> keyset pagination, periodic count/digest reconciliation, coverage watermarks,
> smallest-scope rebuild, and privacy-safe lag/backlog diagnostics make repeated
> or delayed delivery harmless. The existing shared Mission Control task model
> may contribute reusable shell components and, only after complete same-scope
> integrity plus idempotent atomic linkage are proved, at most one follow-up
> collaboration task for a human-actionable root cause; its free-form issue
> metadata, tenant-only scope, dismiss/suppress controls, mutable resolution,
> and broad service-role access can never be D22 truth, and task completion,
> dismissal, suppression, reassignment, reminder, or read state closes nothing.**
>
> **The staff experience uses concise sentence-case consequence copy, explicit
> links and buttons rather than an ambiguous whole-row action, progressive
> detail, server-side bounded search/filter/sort, stable keyset pagination,
> honest loading/no-match/partial/unavailable states, permission-consistent
> counts, preserved filter and focus context after owner actions, semantic
> lists or tables on wide screens and stacked cards on narrow screens, logical
> keyboard order, restrained polite status announcements, non-color meaning,
> and WCAG 2.2 AA reflow and target sizing. Production activation requires
> owner-adapter contract proof; row/count/search/export/cache/RLS isolation;
> one-cause-many-Pages and many-causes-one-Page proof; duplicate, delayed,
> out-of-order, reopen, revocation, stale-tab, ambiguous-outcome, notification-
> storm, source-outage, rebuild, and rollout-skew proof; the D21 5,000-Page
> production-shaped cohort plus bursty causes and measured supported-tenant
> capacity; and representative staff, missionary, restricted-worker, mobile,
> keyboard, screen-reader, zoom, forced-colors, reduced-motion, RTL, and long-
> locale comprehension testing—without a mutable task or alert ledger, ticket
> or workflow engine, custom status/priority/due-date/assignment matrix,
> arbitrary action URL, bulk approval or resolution, `Dismiss`, `Snooze`, `Mark
fixed`, `Force live`, generic retry or purge, direct database repair, raw
> provider error, broad notification, relationship-derived access, public
> diagnostic leakage, absence-as-resolution, substituted Giving, duplicate
> owner authority, or any claim that drafted, reviewed, published, public,
> updating, gift-ready, action-needed, notified, repaired, converged, resolved,
> donated, settled, or paid are the same fact.**

The projection has two conceptual relation families: root causes and exact
Page/Update impacts. It is reconstructed from versioned owner-condition ports,
not from request-time joins over arbitrary product tables. An optional reference
to one shared Mission Control task may support assignee, comments, due date, and
reminders for a human-actionable episode. Task lifecycle and notification state
remain collaboration presentation only and cannot change projection membership
or owner truth.

## Consequences

### Positive

- Staff receive one low-noise place to review, act, or search without learning
  Phase codes or infrastructure terminology.
- Healthy and automatic behavior costs no attention, while the exact current
  visitor and Giving consequences remain understandable.
- Owner commands and source-owned resolution prevent a dashboard control from
  bypassing safety, editorial, finance, media, route, or publication authority.
- Root-cause grouping avoids one task and notification per affected Page while
  retaining exact, permission-filtered impact inspection.
- A disposable projection permits bounded queries, keyset pagination,
  reconciliation, and recovery without turning cached data into authority.
- Complete row/count/search/cache isolation and privacy-safe copy protect
  restricted workers and cross-tenant boundaries.

### Costs and constraints

- Every participating owner needs a versioned, privacy-safe condition/action
  adapter and contract proof.
- Event delivery must be idempotent and monotonic, with coverage watermarks,
  periodic reconciliation, source-outage behavior, and smallest-scope rebuild.
- The generic Mission Control task schema cannot be used as-is for cause truth;
  any task linkage needs same-scope integrity and atomic or repairable creation.
- Staff UX and notification copy need role-specific privacy testing, not merely
  component-level visual review.
- Production certification requires the D21 5,000-Page cohort, incident fanout,
  RLS query-plan, concurrency, failure, accessibility, and comprehension proof
  defined by the D22 decision record.

## Rejected alternatives

### Universal Page-health dashboard

Rejected because one color or state would collapse editorial, serving, Giving,
safety, media, routing, discovery, and convergence facts and would inevitably
mislead staff.

### Generic task or case system as source of truth

Rejected because completion, dismissal, suppression, reassignment, or comments
cannot prove the owning domain corrected a cause. It would create a second
workflow and repair authority.

### Request-time union of owner tables

Rejected because it couples D22 to raw schemas and enums, creates N-way query
and RLS risk, cannot honestly represent source coverage, and performs poorly at
tenant scale.

### One attention item per affected Page

Rejected because a single Designation, route, or media cause could fan out into
thousands of tasks and notifications. Root causes and impacts must be separate.

### Configurable tenant workflow, status, priority, or SLA matrix

Rejected because it is unnecessary setup for a rare operations surface and
would become an unbounded workflow product. Owner domains supply the finite
actions, responsibility, and any meaningful deadline.

### Contributor or donor operations view

Rejected because missionaries already have the D1/D5/D18 Public pages
experience and donors need only current admitted presentation plus honest
component-specific unavailability. D22 diagnostics would add friction and leak
private operational facts.

## Later Phase 22 D25 qualification

D25 may supply D22 with one disposable, permission-filtered action result and
one source-owned cause derived from the applicable current owner facts. It adds
no durable D22 cause, Page-health status, task, queue, or resolution fact. Age
alone never creates **Needs attention**, a reminder, or a notification, and an
otherwise valid old candidate remains in **To review** until an existing D4/D5
outcome or explicit withdrawal. Every displayed action still invokes a
currently authorized owner command that independently re-proves its facts.

## Validation before runtime certification

Before runtime certification, the implementation must pass the complete
contract, tenant/restricted-worker isolation, source coverage, cause/impact
grouping, task non-authority, event-ordering, concurrency, notification-storm,
scale, mobile, accessibility, and staff-comprehension proof in the decision
record. Acceptance of this planning decision authorizes no implementation,
migration, notification, issue publication, or production activation.

## References

- [Phase 22 D22 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d22--how-does-staff-manage-ongoing-public-pages-work-without-a-noisy-second-workflow)
- [Phase 22 D22 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#45-ratified-d22-research--quiet-derived-public-page-operations)
- [ADR-0142 — Derived editorial actionability and bounded recovery](./0142-derived-editorial-actionability-and-bounded-recovery.md)
- [ADR-0138 — Complete Public Ministry Surface authority cutover](./0138-complete-public-ministry-surface-authority-cutover.md)
