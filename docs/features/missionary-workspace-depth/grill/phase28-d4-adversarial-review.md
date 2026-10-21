# Phase 28 D4 — archive from active prospects

**Disposition: Accept with required amendments.** Keep the founder's simple
choice: deliberately archive unused prospect preparation, find it later and
return it to active prospects. The amendments prevent global contact archival,
lost work, hidden disclosure and misleading recovery. They add no approval
ceremony, archive service or new staff access.

**Ratified:** the founder explicitly ratified this decision and its amendments
on October 16, 2026 (Asia/Bangkok). The ratification accepts the corrected D4
meaning and required safeguards below, including its bounded design direction;
optional Undo remains optional. It does not authorize implementation, formal
specification, tickets, additional permissions or a retention duration.

Reviewed October 16, 2026 UTC against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. This is the completed decision/research
review, not a formal specification, implementation, owner-contract amendment or
ticket plan. `/to-prd` and `/to-issues` remain separate authorized transitions.
No application, real record, account, integration or GitHub state was changed.

## Exact corrected decision to record

> **D4 — Archive from active prospects.** A currently authorized missionary may
> deliberately archive an unused, still-unshared prospect-preparation entry from their active
> prospect list. It remains findable in an obvious Archived view and can be
> returned to active prospects while current source access and retention permit.
> Archive and return act on the same preparation and preserve its lawful history;
> neither creates a replacement contact nor promises permanent retention.
>
> This is the preparation's working state. It does not archive/deactivate the
> organization's canonical person, change another worker's preparation, withdraw
> already shared contact facts, change permissions/consent, close a partnership,
> satisfy or cancel a task, stop a scheduled reminder, alter giving, publish
> private notes or notify staff. Existing work keeps its own source-owned status.
>
> Archived discovery, correction, return and recovered operation results require
> current source authority. Return does not restore old grants, reverse later
> corrections, revive completed/cancelled work, restart communication or recover
> erased information. The D3 no-new-continuity-access rule still applies.
>
> Use one clear archive action, a small Active/Archived control, concise feedback
> and an enduring **Return to active prospects** action. A convenient Undo may
> reverse only the specific accepted archive while currently allowed. It is not
> the only recovery path. No reason form, repeated confirmation, separate archive
> application or mandatory cleanup workflow is needed.
>
> Keep contact availability to staff, private-note audience and active/archived
> working state distinct. D2 sharing remains deliberate and separately qualified;
> archiving never undoes an accepted share. Safe matching considers relevant
> permitted archived records without exposing hidden matches or merging by guess.

The selected scenario is unused, still-unshared voluntary preparation. The
independence rules also protect already-authorized contact facts and any later
deliberate D2 share from an archived entry. They do not select a broader initial
archive action for shared preparation. D4 grants no general ability to archive
shared CRM contacts, Requests or managed partnerships.

**Accepted product outcome:** archive, discover and return; excellent simple UX.
**Ratified design direction:** the small interaction described below; precise
labels/layout remain design guidance and convenience Undo remains optional.
**Engineering obligation:** one qualified source transition with
current authorization and safe recovery. **Unselected:** retention duration,
automatic archival/purge, scheduled reactivation, bulk archival, staff custodians,
additional canonical editing rights or a generic undo/history product.

## Evidence: current behavior, intended behavior and limits

| Class                      | Established evidence                                                                                                                                                                                                                        | Practical limit                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder                    | Explicit A and a clear need for an uncluttered, reversible, understandable experience.                                                                                                                                                      | No representative missionary pilot, measured time benefit or actual ministry archival frequency has been established.                                                                         |
| Repository owners          | P9 already has a global Party lifecycle including archived; P27 has separate managed-work Close/Reopen. P4/P9/P12, D1–D3 and ADR-0183 retain identity, access and obligation boundaries.                                                    | These are governing meanings, not an existing preparation archive producer. The bounded P9 preparation source remains a coordinated extension to qualify.                                     |
| Current application        | Missionary roster filters loaded offset pages; donor status is shared and unrecognized values map to Active. CRM archive is a placeholder; grid Undo is component memory.                                                                   | These facts establish concrete incompatibilities, not a deployed archive vulnerability. No qualified D4 command or UI exists in inspected paths.                                              |
| Current shared UI          | Base UI/base-maia, Zinc semantic tokens, shared Sonner, Empty and focus/error patterns are available.                                                                                                                                       | Reusable presentation does not establish correct source mutations, accessible full journeys or visual quality by itself.                                                                      |
| Primary external evidence  | Givebutter/Virtuous archive discovery and matching side effects, Dynamics history/activity separation, Confluence permission changes on archive, and current W3C guidance were reviewed.                                                    | Public documentation, with dates/retrieval limits in the source note; not authenticated testing or authority to import vendor permissions/side effects.                                       |
| Primary technical evidence | PostgreSQL 17 isolation/locking/policies/partial indexes and current Supabase RLS/function docs were checked.                                                                                                                               | Provider mechanics do not prove Core grants, source APIs, caches, Storage or hosted behavior.                                                                                                 |
| Executed hypotheses        | Isolated PostgreSQL 17.11 probe: 19/19 outcomes passed, including three controlled two-session races with observed lock waits. It tests archive/return/retry/Undo, matching/uniqueness and ordering; container/volume cleanup was verified. | Synthetic schema and authority gate, not final Core tables or Supabase Auth/Data API qualification. Intentional unsafe counterexamples are expected outcomes, not production vulnerabilities. |

Source notes: [owner lifecycle](d4-evidence/owner-lifecycle.md),
[current runtime](d4-evidence/current-runtime.md),
[UX research](d4-evidence/ux-research.md),
[product synthesis](d4-evidence/product-synthesis.md),
[technical research](d4-evidence/technical-research.md), and
[PostgreSQL probe](d4-evidence/postgres-probe/README.md).
The [D3 review](phase28-d3-adversarial-review.md) retains its earlier decision
scope; D4 now resolves its previously open ordinary cleanup choice.

## Concern register

Severity describes harm if the failure occurs; likelihood is conditional
engineering reasoning, not measured production incidence. Each concern links
to exact clauses and independently testable outcomes below.

### D4-R01 — The wrong record is archived

**What/why:** Reusing `parties.lifecycle_status`, `donors.status`, donor deletion
or a P27 Close action changes a shared person or managed relationship rather
than one missionary's preparation. Other staff lose useful records or see false
status; restore may overwrite shared facts. **Severity: High. Likelihood:
plausible if reused by label alone.** P9 A10/model already defines global
archived state; current donor writers update shared status and readers normalize
unknown values to Active. **Decision impact:** narrows scope, preserves A.
**Permanent fix/exact change:** D4-C01/C02/C12; use the qualified preparation
source, retain its identity and keep global/managed lifecycles independent.
Prove P01/P04/P14 rather than adding another contact table.

### D4-R02 — Archive/restore widens access

**What/why:** A separate archive folder, count, search, export, audit payload,
privileged RPC or restoration tool reveals private preparation. Historical
authorship or an old grant becomes a read right. **Severity: High. Likelihood:
plausible**, supported by Core's existing broad-reader hazards and Confluence's
documented inherited-permission changes during archival. That vendor behavior
conflicts with D1/D3 and is explicitly rejected. **Decision impact:** requires
consistent enforcement; no new audience. **Permanent fix/exact change:**
D4-C02/C03/C10/C11; current source authorization before every disclosure,
tenant-bound relationships and no staff archive custodian. Prove P02/P08/P13.

### D4-R03 — Archived data disappears from matching and creates duplicates

**What/why:** Active-list absence is mistaken for nonexistence; a new contact is
created, or restoration collides with a duplicate. Auto-merge on email can join
spouses/church mailboxes or disclose hidden work. **Severity: High for identity
or disclosure; Medium for ordinary duplicates. Likelihood: plausible.** Current
Virtuous/Givebutter documentation excludes archived contacts from some matching;
PostgreSQL partial uniqueness protects only included rows. Neither pattern is
an acceptable substitute for Core identity rules. **Decision impact:** qualifies
archive discovery and data quality. **Permanent fix/exact change:** D4-C04/C10;
consider permitted retained identity evidence, preserve all-lifecycle invariants,
never infer one person per email or reveal hidden matches. Prove P03/P10/P13.

### D4-R04 — Retry or Undo reverses newer work

**What/why:** Archive succeeds but its response is lost; the user returns the
entry to active, then an old retry archives it again. An old Undo reverses a
later rearchive or a whole-array UI rollback clobbers a newer result. Stale
authorization checks accept forbidden mutations. **Severity: High for
unauthorized effects; Medium for wrong working state. Likelihood: plausible
under routine concurrency/poor networks.** PostgreSQL semantics, the synthetic
probe and current memory-only Undo/whole-array rollback substantiate it.
**Decision impact:** adds safe acceptance/recovery, not a new workflow.
**Permanent fix/exact change:** D4-C07/C08/C09; bind intended transition,
relevant revision and current authority; recover historical results without
reapplying them; make Undo conditional. Prove P05–P09/P17.

### D4-R05 — Archive silently cancels or restarts other work

**What/why:** A scheduled personal reminder disappears, an accepted obligation
looks complete, a queued newsletter is stopped or restarted, or restoring
creates a new ask/thank-you. Conversely the user believes archiving stopped an
existing follow-up. **Severity: High for lost duties/unwanted communication;
Medium for confusion. Likelihood: plausible** if one status drives all domains.
ADR-0183/P27 and Dynamics' documented separation of inactive contacts from active
activities substantiate distinct meanings. **Decision impact:** preserves A's
list scope and requires a small contextual explanation. **Permanent fix/exact
change:** D4-C05/C06/C13; retain source-owned work, show permitted open-work
context when relevant, no forced cancellation or replay. Prove P04/P07/P18.

### D4-R06 — Reversible on paper, confusing or effectively lost in use

**What/why:** The row vanishes with keyboard focus; Undo expires as the only
recovery path; Archive sounds like deleting a person; dimmed unreadable records,
hidden menus or repeated confirmations burden mobile users. **Severity: Medium,
High if misleading copy causes disclosure or missed work. Likelihood: plausible
until tested.** W3C timing/status/focus guidance and existing component mechanics
support the risk; no usability performance claim is invented. **Decision
impact:** improves the proposed interaction without a new product feature set.
**Permanent fix/exact change:** D4-C13/C14 and the exact journey below: clear
scope, one action, accessible feedback and an untimed archived recovery route.
Prove P01/P11/P15/P17.

### D4-R07 — Filters and counts misrepresent the complete source

**What/why:** Client filtering of loaded pages shows “none” while matching
archived rows exist later; offset mutation skips/repeats entries; entire-archive
loads grow without bound; stale cache results cross context or restore a row to
the wrong view. **Severity: Medium, High for context disclosure. Likelihood:
high if the current list pattern is copied unchanged.** The roster accepts only
limit/offset, filters loaded pages and counts those results. Current page caps
are not an archive/search completeness guarantee. **Decision impact:** changes
the source query, not the small visible filter. **Permanent fix/exact change:**
D4-C04/C09/C11/C14; access and state before paging, truthful scope, bounded
queries and authoritative page reconciliation. Prove P10/P11/P16.

### D4-R08 — Archive becomes indefinite retention or resurrects erased data

**What/why:** “Restore anytime” promises forever; archive/return resets a timer,
reinstates erased private bodies or revoked access, or a backup revives old
working state and outward work. **Severity: High. Likelihood: plausible** if
archive is treated as a storage/backup policy. P27 retention/restore boundaries,
D3 and exact P12 history scopes reject those assumptions. **Decision impact:**
narrows the recovery promise, without selecting a retention duration.
**Permanent fix/exact change:** D4-C03/C11/C12; lawful retention and current
access govern availability, no invented timer or perpetual archive; apply
current restrictions/disposition before restored readers/workers reopen.
Prove P08/P12/P14.

### D4-R09 — A plausible UI conceals missing source, audit and rollout proof

**What/why:** A placeholder, generic browser CRUD or local Undo is shipped as
archive; audit fails after the write, copies private text to a broader log, or
cannot explain the actor and accepted transition. Old clients overwrite new
state; operators resort to direct SQL repair. **Severity: High for privacy and
source integrity; Medium for maintenance. Likelihood: plausible**, given the
specific current runtime gaps. **Decision impact:** requires exact owner delivery
and proof, not a larger design. **Permanent fix/exact change:** D4-C07/C10/C12/C14;
atomic minimal source evidence, existing shared components, reached-reader/writer
census, compatible rollout and tests of actual outcomes. Prove P09/P13/P14/P18.

## Review of all 22 categories

| #   | Category                                                  | Material concern and conclusion                                                                                                                                                                                                                                                                                                                                      |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, alternatives                 | **No material concern with the selected job.** The founder wants unused preparation out of active work with later reuse. An equivalent existing source disposition/filter is the strongest simpler implementation; a display-only filter with no persisted intent or deletion alone does not satisfy the whole job. No justification for a separate archive service. |
| 2   | Brittleness                                               | **Yes — R04/R07.** Local memory, stale revisions, capped-page matching and assumed grant freshness fail outside the happy path. Use source-backed state and recovery (C07–C11).                                                                                                                                                                                      |
| 3   | Technical debt                                            | **Yes — R01/R09.** Global donor status, generic browser CRUD or copied archive records create conflicting authorities and permanent compatibility debt. Extend the correct source and shared UI (C01/C10/C12).                                                                                                                                                       |
| 4   | Edge cases                                                | **Yes — R03–R08.** Same person in multiple contexts, shared mailbox, hidden match, already-shared contact, open reminder, last row, expired Undo, lost response, return after erasure and stale prearchive Share are explicitly covered below.                                                                                                                       |
| 5   | Footguns                                                  | **Yes — R01/R03/R04.** Archive person, automatic merge, Delete as archive, stale Undo and restore-as-replay are dangerous shortcuts. C01/C04/C05/C08 constrain them.                                                                                                                                                                                                 |
| 6   | Tenant safety                                             | **Yes — R02/R07/R09.** Archived search, operation recovery, workers, cache keys and diagnostics can bypass tenant/source scope. C03/C10/C11 apply before disclosure; no cross-tenant fallback or global archive browser.                                                                                                                                             |
| 7   | Database, RLS, authorization safety                       | **Yes — R02–R04/R09.** Inspect grants, USING/WITH CHECK, column mutation, real view/function privileges, tenant-aware FKs, null semantics, state defaults/checks, stable keys and indexes. Archive is not DELETE or permission. No new money type/arithmetic is introduced; existing financial facts remain untouched.                                               |
| 8   | Overengineering                                           | **No material concern in bounded D4.** One persisted source disposition with two normal views/actions is enough. No reason taxonomy, approval, recurring cleanup, generic Undo framework, new database or per-contact ACL is justified. Existing equivalent source state should be reused when qualified.                                                            |
| 9   | UX/UI and friction                                        | **Yes — R05/R06/R07.** Clear scope, persistent discovery, focus after removal, accessible feedback, honest open-work notice and good phone/empty/error states are necessary. C13/C14 preserve base-maia and avoid repeated confirmations. No donor checkout changes are introduced.                                                                                  |
| 10  | Source of truth, ownership, invariants                    | **Yes — R01/R03/R05/R08.** Preparation working state, Party identity, sharing, tasks, consent and retention have distinct owners. C01–C06 retain one authoritative fact each; UI filters/caches are projections.                                                                                                                                                     |
| 11  | Hidden coupling                                           | **Yes — R01/R05/R07.** Global status normalization, primary missionary pointers, shared counts, task closure and recipient rules must not become accidental archive semantics. Explicit owner contracts keep unrelated work independent.                                                                                                                             |
| 12  | Failure modes                                             | **Yes — R04/R07/R09.** Committed write/lost response, failed refresh, audit failure, stale result and unsupported operation need distinct outcomes. C07–C09 ensure recovery without repeated effects or false success.                                                                                                                                               |
| 13  | Lifecycle, temporal correctness, concurrency, idempotency | **Yes — R04/R05/R08.** Archive→return→archive creates different transitions; old retries/Undo cannot reverse the newest intent. Source revision/current authority decide order, not device clocks. No automatic expiry, revival or backdated cleanup.                                                                                                                |
| 14  | Data integrity                                            | **Yes — R01/R03/R04/R09.** Preserve the same source identity, lawful attribution and other contexts; maintain duplicate safeguards across retained states and prevent stale overwrites. No active-only canonical uniqueness.                                                                                                                                         |
| 15  | Security/privacy                                          | **Yes — R02/R08/R09.** Names, counts, toasts, log bodies, exports, storage URLs and backups remain protected. Archive does not declassify or authorize broader history; retention is not access.                                                                                                                                                                     |
| 16  | Scalability/performance                                   | **Yes — R07; unqualified performance, concrete query mismatch.** Authorization/state/search before bounded paging; actual index and query-plan proof required. Current 50/100-row roster pages and 2,000 related-row caps are existing code facts, not target scale/completeness/latency guarantees.                                                                 |
| 17  | Operational burden                                        | **Yes — R08/R09.** Missing source receipts or incompatible writers invite SQL repair, orphan cleanup and private administrator queues. Require safe source recovery and policy-governed disposition, with no new operator workflow for routine archive.                                                                                                              |
| 18  | Observability/auditability                                | **Yes — R04/R09.** Durable transition and actor attribution must survive retries appropriately; technical logs cannot be business truth or private-data copies. C07/C09 distinguish prior acceptance from current state.                                                                                                                                             |
| 19  | Dependencies/integrations                                 | **Yes — R02/R04/R05/R09.** Existing Supabase, source services and UI libraries require exact qualification. Archive has no provider side effect; optional sync, AI, SMS and workflows are not prerequisites. Existing queued work follows its own source rules.                                                                                                      |
| 20  | Migration/rollout/upgrades                                | **Yes — R01/R08/R09.** Unknown legacy provenance, broad readers, old writers, restored grants and mixed versions require a source-preserving cutover. Do not backfill archive/private state from old donor labels or revert to a broad reader.                                                                                                                       |
| 21  | Testability/traceability/proof                            | **Yes — R09.** Synthetic database tests and documented vendor patterns do not qualify Core. C14 and P01–P18 tie selected behavior to later owner reconciliation, OpenSpec/design/tasks/issues and release evidence at authorized transitions.                                                                                                                        |
| 22  | Other development hazards                                 | **No additional distinct material concern found.** Checked accidental bulk action, archive as offline backup, notification spam, scope expansion, arbitrary timers, future rollback and fake visual/runtime proof; all are covered above rather than inflated into new features.                                                                                     |

## Exact clauses for the later authorized spec/design

- **D4-C01 — Exact source scope.** The selected archive action begins with
  unused, still-unshared voluntary preparation. Archive/return changes only the
  qualified preparation's participation in active work. Preserve its source
  identity, original attribution and lawful history. Do not change canonical
  Party lifecycle, donor status, primary assignment, another worker's context,
  managed-work status, financial records or suppression.
- **D4-C02 — Independent state meanings.** Working state, contact availability
  to staff and private-history audience remain separate. Archive cannot undo
  an accepted D2 share. A new deliberate source-qualified D2 share may act on
  archived preparation without returning it to active prospects; its review
  must explain that independent result. It grants no additional canonical edit
  power and does not share private notes.
- **D4-C03 — Current access on retained data.** Apply current P12/source/field/
  history authority to archived lists, counts, search, detail, corrections,
  return, exports and recovered results. Archive itself neither grants nor
  revokes access. Return does not revive expired grants or create successor
  rights; independent surviving authority paths still count.
- **D4-C04 — Retained identity participates safely in resolution.** Active-view
  absence is not evidence of nonexistence. P4/P9 resolution considers relevant
  permitted archived sources and preserves hidden-match result boundaries.
  Never auto-restore, copy a replacement identity, merge by email/name, union
  private histories or reduce an all-lifecycle canonical uniqueness invariant
  to active-only. Do not invent universal preparation cardinality.
- **D4-C05 — No independent work effects.** Existing personal reminders,
  appointments, Tasks Hub obligations, Requests, partnerships, commitments and
  communications retain their source-owned status and current applicability.
  Archive/return does not complete, cancel, defer, restart or replay them, create
  work, send notifications or infer inactivity/relationship value. A future
  working-state-dependent source purpose needs explicit qualification.
- **D4-C06 — Open work is understandable.** When currently authorized source
  facts prove related open work, show a short explanation and its existing
  action/link. Do not force cancellation, hide the work or add a closure/readiness
  ceremony. Unknown/incomplete resolution is not “no open work.” Ordinary archive
  need not be blocked merely because unrelated or independent work exists, and
  requires no exhaustive all-domain open-work scan.
- **D4-C07 — Authoritative atomic acceptance.** Use the qualified source
  command to atomically record the transition and required minimal audit/retry
  evidence, with server-derived tenant/actor/attribution and relevant expected
  source revision. Failed required evidence means no accepted transition.
  Technical telemetry/refresh failure after acceptance cannot negate it.
- **D4-C08 — Durable intent, conditional Undo.** Repeated delivery of one intent
  returns its accepted effect under current authority rather than reapplying it.
  A new archive after return is a new transition. Bind retry meaning and reject
  changed payloads. If offered, Undo targets only its specific accepted archive and current
  qualifying source state; it cannot reverse later changes or restore the whole
  row snapshot. Later return remains independently available when authorized.
- **D4-C09 — Current state and past receipt are distinct.** Reconcile unknown
  outcomes using the same operation. Present pending, rejected, accepted and
  changed-since-acceptance truthfully. Recovered old receipts cannot overwrite
  newer UI state. Order archive/return/share and relevant authority changes at
  the source boundary; revocation of an unrelated grant is not a false denial.
  Stale review context requires current review, not silent widened effects.
- **D4-C10 — Database/API enforcement.** Qualify the complete effective grants,
  RLS USING/WITH CHECK, column mutability, view/RPC/definer/service-role and
  storage paths. Bind FKs and operation identities to the tenant/source; constrain
  valid states/defaults and prevent null-owner or author-as-permission fallbacks.
  Guard both permitted old row and proposed new row. Do not reopen generic
  browser writes or create a privileged public toggle to bypass missing access.
- **D4-C11 — Correct discovery and retention.** Apply authorization, working
  state and relevant search predicates before pagination/counts. Use stable
  identities, bounded reads and scope-correct caches; reconcile moving rows and
  reject late results after context change. Retained discovery and return are
  subject to exact retention/erasure/hold/history rules. D4 creates no timer,
  reset, perpetual retention or restoration of erased bodies.
- **D4-C12 — Compatible delivery.** Inventory reached existing data, readers,
  writers, copies and pending effects. Qualify missing preparation lifecycle
  ownership before activation. Do not infer private/shared/archive provenance
  from legacy statuses. Fence incompatible paths, apply current denials and
  disposition before restore/import resumes, and ensure rollback cannot expose
  data, silently lose archived state or replay work.
- **D4-C13 — Minimal coherent presentation.** Reuse base-maia/Base UI components
  and semantic tokens. Provide clear Active/Archived scope, one archive action,
  concise pending/error/success feedback and a lasting Return to active prospects
  control. No forced reason or routine confirmation modal. Preserve focus,
  unrelated drafts and list context; keep work-state and audience labels distinct.
- **D4-C14 — Prove the complete journey.** Test actual source/Supabase boundaries,
  persistence/recovery, multi-tenant negative cases, real concurrency, retained
  data/upgrade paths, accessible phone/desktop use and production-shaped queries.
  Establish measurable budgets from representative journeys before release;
  do not claim observed usability, speed or scale from a mock or synthetic probe.

## Minimal UX: clear, useful and visually coherent

Use the existing prospect list and detail. The normal experience needs two
working views and two actions, not a new administration area.

| Moment                                 | Recommended UI/copy                                                                                                                                                                                                                                             | Behavior and guardrail                                                                                                                                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default list                           | **Prospects**; **Active · Archived** control, Active selected; search clearly scoped to the selected view                                                                                                                                                       | The same restrained Maia list/cards and spacing. No new dashboard of archive metrics, person-value badges or required reason categories.                                                                                                                            |
| Archive action                         | **Archive prospect** in the entry's ordinary action menu; contextual help: “Remove this prospect from your active list. Find it later under Archived.”                                                                                                          | One deliberate action, no routine confirmation. Scope comes from the prospect-entry surface; never put this label on a global Party mutation. Existing unsaved-edit protection still applies.                                                                       |
| Request pending                        | **Archiving…**; prevent duplicate intent while retaining recoverable context                                                                                                                                                                                    | A row can show pending state; do not report success or discard an unrelated draft before source acknowledgement. Network errors do not prove rollback.                                                                                                              |
| Accepted                               | **Prospect archived.** Optional **Undo**                                                                                                                                                                                                                        | Remove from Active after authoritative acceptance; update affected views/counts coherently. Undo invokes the qualified conditional inverse, not a local array restore.                                                                                              |
| Find it later                          | Switch to **Archived**; scoped search and existing bounded list navigation                                                                                                                                                                                      | Later recovery does not depend on the Undo timer; current access and retention still apply. Authorized archived matches remain available to source resolution; no hidden-match teaser or automatic reactivation.                                                    |
| Archived detail                        | **Archived** working-state badge and **Return to active prospects** action                                                                                                                                                                                      | Scope privacy labels to the preparation, such as **Preparation not shared with staff**, and separately show any currently authorized contact availability. Private notes keep their own audience. Current authorized corrections need not force a return to active. |
| Return accepted                        | **Returned to active prospects.**                                                                                                                                                                                                                               | Same entry and history; no duplicate, new permission, restarted reminder, send or managed-work enrollment.                                                                                                                                                          |
| Related work remains                   | “Archiving does not cancel this follow-up.” Link to the actual currently authorized work when proved.                                                                                                                                                           | Show only when relevant; a complete qualified count may support “1 scheduled follow-up remains.” Never guess zero/counts, force cancellation or require an all-domain work scan.                                                                                    |
| Separate D2 share from archived detail | Normal D2 review; “Contact will be available to staff. It will stay out of your active prospects.”                                                                                                                                                              | Same deliberate share authority and selected optional notices as D2. No hidden restore, extra confirmation ceremony or private-history publication.                                                                                                                 |
| Failure / unknown / newer change       | **Couldn’t archive. Try again.** only for confirmed failure; **Checking archive status…** while a check runs; **Couldn’t confirm archive status** with **Check again** for settled uncertainty; **This entry changed. Review its current status.** for conflict | Keep a retry/recovery path for the original intent. A confirmed accepted archive plus failed refresh stays accepted; current authorization governs any detail revealed.                                                                                             |
| Empty/search failure                   | **No active prospects**, **No archived prospects**, scoped **No matches**, or **Couldn’t load prospects** as applicable                                                                                                                                         | A load/access failure or filtered loaded page is not a proved empty dataset. A neutral route to Archived may be offered without revealing that a hidden match exists.                                                                                               |

The action vocabulary describes the missionary's preparation, not a person's
worth or giving status. Do not show a red danger dialog for an ordinary reversible
list action, grey archived text below contrast requirements, or rely on an icon,
color, swipe gesture or hover-only control for meaning.

After a focused row disappears, move focus predictably to a nearby record's main
link or a stable list control/heading; do not strand it on a removed menu or
unexpectedly target another Archive action. Test the appropriate fallback in
the actual list rather than freezing a focus algorithm here. Announce the
accepted result without stealing focus. A temporary toast is optional feedback;
Archived plus Return is the persistent alternative. Preserve filter, search and
scroll context where still valid, including the final row on a paged result.
Do not automatically navigate away from a useful detail merely because it is
now archived; show its truthful state and available actions.

International names/scripts and contact formats remain source values, not
mandatory Western fields. No compulsory email/phone is added to archive or
return. Long names and localized labels must reflow. Show event times in the
user's locale/timezone where useful; transition ordering uses source state, not
device time. Low-bandwidth recovery requires no offline private-data cache or
silent replay of later contradictory actions.

Accessibility uses applicable WCAG 2.2 AA requirements, including 320-CSS-pixel
reflow, 4.5:1 normal-text contrast, 3:1 large-text contrast, and target size/spacing
under 2.5.8 (24 by 24 CSS pixels or a documented applicable exception). Core's
[touch guidance](../../../ai/skills/emil-design-engineering/touch-accessibility.md)
sets a 44-pixel minimum touch target; use that local design requirement rather
than shrinking phone controls to the AA floor. These are requirements, not
measured product results. Verify focus visibility,
keyboard operation, accessible names/status and reduced-motion behavior in the
actual shared components; prettier screenshots alone do not establish quality.

## Ownership, invariants and lifecycle

| Fact                                                                | Authority                                                        | Invariant                                                                                                                |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Preparation working state and accepted transition                   | Qualified P9 preparation source; P28 presents its native purpose | Same source identity across active↔archived; one authoritative current state, truthful history. No second archived copy. |
| Canonical person/contact identity and correction                    | P4/P9 exact source commands                                      | Archive changes no Party identity/lifecycle or unqualified canonical contact value; no guessed merge/cardinality.        |
| Current reader/mutator/history scope                                | P12 plus source/field/classification owners                      | Every read/action proves current scope. Working state is not permission and restore is not grant recovery.               |
| Contact sharing and optional attention                              | D2 source admission and P6/P17 attention                         | Archive cannot undo sharing or change notification recipients. A notice is neither access nor work completion.           |
| Actual reminder, task, Request, partnership, money or communication | Its existing consequence-owning domain                           | Archive/return invents no completion, cancellation, restart, consent, send or financial fact.                            |
| Retention/disposition and lawful evidence                           | Exact source/records owners                                      | Archived is not forever; lawful erasure cannot be undone by return or backup restore.                                    |
| Visible list, count, cache and toast                                | Derived presentation                                             | Never writes authoritative truth through an optimistic snapshot or becomes a broader reader.                             |

Normal transitions are active→archived and archived→active under current source
authority. Repeating the same accepted intent is recovery, not another transition.
Repeating a new request when the desired state is already current must return
the owner's truthful no-op/conflict/current-state outcome without another effect.
An archive after a real return is a new transition. Undo is not time travel.

Source erasure or lost access can make an archived entry unavailable; those are
not invented additional archive states or reasons to restore permissions. A
legally retained body may still be unreadable to the caller. Cancelling before
submission writes nothing; closing/navigating after submission does not prove
cancellation. Conflicting relevant edits/share/authority changes are ordered
at source acceptance, preserving whichever effect validly committed first and
rechecking later intent. Unrelated grant changes must not defeat still-valid
source authority.

## Falsifiable acceptance and proof matrix

| ID     | Positive outcome                                                                                            | Negative, boundary or failure proof                                                                                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D4-P01 | Archive, reload, find in Archived and return the same preparation ID/history.                               | No copied source/person, no global contact status change; recovery remains available after the toast disappears.                                                                         |
| D4-P02 | Only current authorized readers see archived preparation and results.                                       | Another tenant, worker, staff member, coach or successor gets no name/body/count/hint through list/search/export/deep link/cache/audit.                                                  |
| D4-P03 | Qualified matching considers relevant permitted archived identity evidence.                                 | Hidden matches stay protected; shared household/email does not auto-merge; no duplicate canonical identity or automatic return.                                                          |
| D4-P04 | Independent facts/work keep their source state.                                                             | Personal reminder, accepted task, partnership, consent, queued communication, giving and another worker's preparation are not stopped/completed/restarted by archive/return.             |
| D4-P05 | A lost-response retry recovers the original accepted transition once.                                       | Archive→return→old archive retry cannot rearchive; new archive after return can succeed; changed intent on the same key rejects.                                                         |
| D4-P06 | If convenience Undo is included, it reverses only its specific accepted transition under current authority. | Old Undo cannot undo later rearchive/correction; current-authority loss blocks. Normal Return is required independently of the Undo timer, subject to current access and retention.      |
| D4-P07 | Archive and D2 sharing retain independent truthful outcomes.                                                | Stale prearchive review revalidates; accepted-first share remains shared; deliberate qualified archived Share keeps the preparation archived and private notes excluded.                 |
| D4-P08 | Relevant mutation/revocation ordering is correct in real concurrent sessions.                               | Revoke required authority first denies; accepted transition first remains historical truth; unrelated revocation with another valid path does not falsely deny.                          |
| D4-P09 | Required source evidence and transition are atomic; UI distinguishes receipt from current state.            | Inject required audit failure, lost response, refresh failure, stale receipt and newer successful state; no false success, duplicate effect or private log payload.                      |
| D4-P10 | Active/Archived search and pagination reflect the full authorized source.                                   | More than two interleaved pages, match beyond initial page, simultaneous pagination/moving row and scoped count/empty states; no missing/duplicate IDs under the chosen paging contract. |
| D4-P11 | View/cache/focus remain coherent after archive/return and context changes.                                  | Last row/page, open detail, sort/filter switch, late error, another successful mutation, same-user authority/tenant change and expired permission.                                       |
| D4-P12 | Retention/erasure/holds and restore preserve exact source rules.                                            | Archived body erased or access ended cannot be resurrected; no accidental deadline reset, auto-purge or erased-body recovery from a backup.                                              |
| D4-P13 | Actual database/API paths reject forbidden row transformations.                                             | USING/WITH CHECK, grants, tenant/source FK, null owner, caller author/actor, global status, view/function owner, service-role and Storage paths; no raw browser bypass.                  |
| D4-P14 | Retained-data migration and mixed-version operation preserve source meaning.                                | Unknown legacy provenance is not guessed; old writers cannot overwrite state; rollback/import/restore cannot widen access, lose archive state or replay effects.                         |
| D4-P15 | Representative users understand and complete archive/find/return on phone and desktop.                      | Keyboard, screen reader, reflow, contrast, target spacing, focus, long names/localization, toast expiry and reduced motion. Measure comprehension and errors, not merely click counts.   |
| D4-P16 | Actual queries/client memory remain bounded at representative retained-data sizes.                          | Inspect plans for active/archived/matching and prepared-query predicates; establish latency, dataset and poor-network budgets from evidence before release.                              |
| D4-P17 | Unsaved work and interrupted submission remain recoverable.                                                 | No implicit save/discard, no false cancel after submission, original-intent reconciliation and no stale whole-array rollback over newer results.                                         |
| D4-P18 | Native archive/return works without optional external sync, workflows, SMS or AI.                           | Missing unrelated provider gates do not block it; missing exact preparation/permission producer does. No placeholder, local-memory Undo or direct table toggle passes as completion.     |

P06's convenience-Undo proof applies only if that optional control is included;
the persistent Return route is mandatory. The synthetic PostgreSQL probe supplies bounded evidence for some mechanical
parts, not a checkmark for this entire matrix. Real Core/Supabase/browser,
retained-data and representative-user qualification remain release obligations.

## Ruthless synthesis and execution order

1. **Resolve before recording:** archive the preparation, not the person; retain
   a persistent discovery/return path; keep private audience and actual work
   independent. These preserve the selected outcome and need no new product
   exception or founder choice about database design.
2. **Record now:** the exact D4 decision, glossary meaning, minimal UX and evidence
   limits. Retention duration and additional rights remain unchosen; no new ADR
   is needed for a reversible source disposition under existing owner boundaries.
3. **Capture in the later authorized spec/design:** C01–C14, exact P9/P12 source
   producer and relevant P4 resolution seam, existing work/communication
   separations and applicable P01–P18 proof (P06 is conditional on optional Undo).
   Reconcile with accepted owners rather than
   copying P9 Party archive or P27 Close semantics. Avoid freezing SQL/storage
   representation, new services or a generic Undo abstraction here.
4. **Require in implementation:** state/revision/authorization acceptance,
   minimal durable source evidence, safe retries and any offered Undo, complete authorized
   queries, compatible old-client handling and existing shared UI composition.
   Required source/audit acceptance is atomic; later cache refresh is recoverable.
5. **Prove before activation:** the actual source/Supabase/role/migration path,
   real concurrency, accessible phone journey, source-qualified retention and
   measured query/usability budgets. Use exact qualified native owners without
   adding optional provider/workflow dependencies.
6. **Monitor only bounded regressions below.** Archive adoption counts, missing
   voluntary updates or time since last giving are not quality/performance scores
   for people and create no mandatory cleanup cadence.

| Signal                                                                                                                                           | Threshold                                                                        | Owner                                           | Response                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed unauthorized archived data/result or cross-context cache disclosure                                                                    | Any instance                                                                     | P12 access owner + P9 preparation owner         | Disable affected reader/mutator, contain disclosure and re-prove source/derivative authorization.                                              |
| One archive/return changes an independent contact, duty, consent or financial source outside its contract                                        | Any instance                                                                     | P9 preparation owner with affected domain owner | Stop affected writer, correct through the authoritative source; do not direct-SQL restore whole rows or replay effects.                        |
| Accepted transition lacks required receipt/attribution, duplicates an effect, or old retry/Undo overrides newer state                            | Any instance                                                                     | P9 source-operation owner                       | Pause affected operation, reconcile durable history/current state and repair the source contract before re-enabling.                           |
| A permitted retained archived entry is absent from complete scoped discovery or an accepted return persistently disagrees with source projection | Any confirmed invariant violation, excluding truthful access/disposition changes | P9 read-model owner + P28 workspace owner       | Repair projection/query and safe refresh; preserve source facts, provide honest unavailable status and prevent duplicate creation as recovery. |

These are future operational controls, not configured monitors. Performance,
retention completeness and user comprehension are proof gates, not vague “monitor
later” items. Their exact budgets/policies must be established by the named
source/product owners before release, without inventing numbers here.

## Adversarial check

### What could go wrong with this answer?

The wrong contact could be archived, private data could leak through the archive,
or retry/Undo could reverse newer work. Exact source scope, current authorization
and conditional recoverable transitions prevent those mistakes.

### What hidden assumptions are we making?

Archive is not deletion, permanent retention, permission, a relationship status
or cancellation. We have no evidence for automatic inactivity detection, archive
reasons, bulk cleanup or a new administration workflow; none is added.

### How does this affect the whole product?

One source-owned working state composes with the existing CRM. Identity, giving,
consent, tasks, communication and D2 sharing retain their own authority. D3 still
denies a new continuity reader; no separate private archive database appears.

### How does this affect the end-user experience?

One archive action removes preparation from active prospects; a nearby Archived
view and lasting Return action make recovery obvious. Small contextual copy explains any scheduled work
that remains. Visual clarity comes from the existing Maia hierarchy/components,
not more controls or warnings.

### Does this follow modern best practices?

Yes as a qualified direction: reversible source-scoped action, discoverable
recovery, accurate status, current access and safe retry. Vendor side effects
that weaken matching, change inherited permissions or deactivate whole contacts
are explicitly rejected. Actual usability and speed still require real evidence.

### Does this fit Asym’s existing repo and product direction?

Yes through P4/P9/P12, P27/ADR-0183, D1–D3 and shared base-maia UI. Global Party
archive, legacy donor status, client-only filtering and local-memory Undo are
not equivalent implementation precedents.

### Should we adjust the recommendation?

Keep A with these amendments. Build the small archive/find/return experience
on its qualified source, preserve independent work and privacy, and prove
recovery. Do not add a general archive platform or weaken source boundaries for
the convenience of a one-click UI.
