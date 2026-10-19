# Phase 27 D24 — a recorded appeal working list

2026-10-11, Asia/Bangkok; research evidence records actual UTC times.
**Founder selected A; reviewed decision explicitly ratified; disposition: Accept.** Reviewed against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, ratified D23 and the preceding decisions.
This is decision research in the ongoing grill-with-docs session, not a formal
PRD/OpenSpec, implementation, ticket publication or activation. The founder
subsequently instructed, “Yes, ratify this amended D24.” The exact reviewed
decision and safeguards are explicitly ratified without substantive change.
No runtime experiment was rerun. The dated research evidence remains intact;
the [ratification/continuation checks](d24-ratification-q25-validation.json)
verify this update separately from the original review.

A recorded list is the appropriate planning model. The critical distinction is
between **whom staff planned to approach**, **who is currently eligible for that
outreach**, and **what actually happened**. Preserve all three meanings. Freezing
the plan must not freeze permissions, duplicate a contact directory or imply that
anyone has already been asked. The safeguards below resolve A within Q24's stated
boundaries and D21's delegated design judgment; they do not require another series
of small votes.

## Exact decision recorded

> **D24 — Keep an appeal's working supporter list as recorded planning intent,
> changed deliberately by authorized staff.** Staff may select eligible people or
> organization Parties individually or from a finite reviewed group, then add,
> exclude, remove or deliberately return entries as the appeal develops. Saved
> filters help find candidates; later filter changes never silently add, remove
> or substitute members. Preserve source-qualified identity and lawful change
> history without creating another contact directory or generic group system.
>
> Keep planning, current eligibility and actual participation distinct. Inclusion
> means planned outreach, not Asked, supporter agreement, a financial commitment,
> received money, communication permission or enrollment in a partnership journey.
> Organization inclusion does not automatically select its human contacts. Current
> permissions and purpose/contact restrictions still govern every read, addition,
> suggestion, export and outward action; historical inclusion is no permanent grant.
>
> **Remove from working list** ends that planned inclusion while keeping history.
> **Exclude from this appeal** records an explicit appeal-specific decision not to
> approach that Party for this appeal. Ordinary Add, repeated imports and retries
> do not silently restore either disposition. A clearly labelled, authorized
> **Return to list** action can restore planned inclusion after current checks;
> it cannot clear wider restrictions or revive ended tasks, reviews or messages.
>
> Existing requests, responses, gifts and commitments retain their source truth
> when an entry leaves the working list. For solicitation whose qualified producer
> purpose depends on that working membership, continued inclusion and absence of
> exclusion are current producer
> eligibility conditions at the communication owner's dispatch-admission boundary.
> Removal/exclusion stops affected work not yet admitted there through the qualified
> owner fence. It does not recall in-flight or delivered communication, cancel
> unrelated service obligations or erase actual history. A mere appeal link does
> not make a message dependent on membership. The interface explains
> those effects truthfully.
>
> Keep daily use clear in Asym's shared interface: a working list, visible permitted
> restrictions and next actions, contextual exclusion/removal, understandable group
> selection and per-item results, and accessible recovery. A group action binds its
> exact intended members; each accepted change, required history, receipt and actual
> required producer-fence advancement are atomic; permitted secondary effects use
> durable intent. Retries cannot re-evaluate the filter, override a
> later decision or create duplicate membership. Identity repairs and conflicts
> preserve history and never silently authorize new outreach.

## Evidence, alternatives and certainty

| Evidence                                                        | What it establishes and its limits                                                                                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d24-evidence/ownership.md)                          | Exact P9/P27/P6/P17/P32/P13 boundaries, merge and source-work contracts; accepted intent is not proof of a deployed appeal service.                             |
| [Authorization](d24-evidence/authorization.md)                  | Current source seams and P3/P10/P12 requirements for list existence, fields, counts, bulk changes and egress. No live policy or production vulnerability claim. |
| [Implementation and experiment](d24-evidence/implementation.md) | Checked-in list/batch mechanics and bounded new PostgreSQL membership/exclusion/retry proof. No actual P12, product UI, provider or scale qualification.        |
| [UX](d24-evidence/ux.md)                                        | Current shared selection/filter/list patterns, primary guidance and the proposed full staff flow. No completed prototype or measured staff preference.          |
| [Missions and comparable practice](d24-evidence/practice.md)    | Fresh primary nonprofit/CRM documentation with scope/date limits, strongest alternatives and specific warnings against copied semantics.                        |
| [Independent challenge](d24-evidence/independent-review.md)     | Integrated review of scope, consistency, proof limits and necessary corrections; initial findings and their disposition retained.                               |

**Repository fact.** The [Phase 27 roadmap](../../../prds/sitestacker-parity/roadmap.md#phase-27-what-it-covers)
and original founder brief require organization appeals and expressly distinguish
saved-view definitions, recorded appeal population and actual communication
recipients. [P9](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:133)
provides a shared live list engine; using it to discover candidates does not make
its query the appeal's membership authority. [ADR0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
keeps CRM truth in Asym Postgres. P27 owns appeal planning and response meaning;
P9 owns Party identity/record shells, P12 current access, P13 financial attribution,
P16 commitments and fulfillment, and P6/P17/P32 communication effects.

**Current behavior.** Existing personal table views store settings, current CRM
list/export services query and format rows, and client selection/bulk helpers
manage local interactions. Those are useful ingredients, not qualified recorded
appeal membership, finite server selection, exact per-item authorization or durable
retry. Bounded searches found no qualified P27 appeal-population implementation.
The evidence identifies missing qualification and risky reuse assumptions, not a
confirmed production exploit or a claim that every existing source is defective.

**External fact.** Blackbaud's current Managed Lists documentation closely matches
A: directly managed membership seeded from lists/queries, with manual membership
changes and change history independent of later source-filter changes. HubSpot documents
static versus active segments; static exclusions are not ongoing consent proof.
MPDX's published appeal workflow uses an Asked bucket on addition, a shortcut that
Core must not import: a planned entry is not evidence of an actual request.
Exact official URLs, access dates and limitations are in the practice appendix.
None establishes universal missions preferences, unlimited capacity or Core safety.

**Strongest alternative.** B keeps the current working population live with a saved
filter while retaining actual asks/responses separately. It suits continuously
refreshed discovery and saves explicit population upkeep, but changes the plan and
its denominator without an appeal-specific decision. A is better for the selected
need to coordinate intended outreach. A spreadsheet/export plus ordinary requests
is a credible no-build alternative, but it requires separate reconciliation of
permission, restrictions, duplicates and history. A dedicated generic list product
is unnecessary: use appeal-owned entries within the existing list shell.

**Conflicts resolved.** P9 live saved views remain live; the deliberate operation
captures a separate finite set. P32 freezes a reviewed send population; that is not
the appeal's mutable plan. Current appeal inclusion can be a **subtract-only**
producer eligibility condition for that exact appeal-originated outreach, under
[P17's producer contract](../../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md:158)
and [P6's source validity fence](../../../prds/sitestacker-parity/phase-06-shared-communication-event-model.md:230).
It cannot add recipients to a captured send, cancel unrelated work or undo admission
to transport. P9 relationship-edge survivor rules do not settle conflicting appeal
intent during a Party merge; source-qualified repair under
[ADR0216](../../../adr/0216-non-destructive-source-governed-replayable-donor-merge.md)
must preserve the different facts. No governing owner amendment is required to
apply those boundaries; the chosen continuing-inclusion rule is explicit P27
product judgment, not a claim that the adapter is already implemented.

**Judgments and unknowns.** One working membership per appeal/qualified Party,
contextual Remove/Exclude/Return, skip-on-ordinary-add for prior dispositions and
bounded membership-conflict recovery are product decisions under D21's delegation.
No evidence warrants a mandatory exclusion essay, two-person approval, hierarchy
of audience defaults, automatic re-add rule or per-member reminder engine. Actual
staff comprehension, representative population size, qualified owner adapters and
complete nonowner authorization remain implementation/release proof obligations.
No practitioner interview or measured UX result has been fabricated.

The existing P13 coverage-register conflict between live reassignment and frozen
campaign/source attribution remains a qualification blocker for affected financial
reports. It does not block recorded planning membership, and D24 does not resolve
it by equating appeal inclusion with attribution or by choosing a financial owner
meaning implicitly.

## Minimal model and coherent lifecycle

### Keep these meanings separate

| Meaning                                       | Authority and invariant                                                                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saved filter/view                             | P9 query definition over currently permitted data; candidate discovery only. Renaming, editing or deleting it does not mutate accepted appeal entries.                                 |
| Finite selected group                         | One explicit source operation's selected Party identities, appeal, action and minimal qualified provenance. Never standing permission for future matches.                              |
| Appeal working entry                          | P27 planning intent for one scoped Party in one appeal, with current disposition and lawful change evidence. Not a contact copy, general Group or new journey.                         |
| Current eligibility                           | Current source/P12 and contact-purpose rules, including appeal-specific exclusion. A retained entry can become unavailable for outreach without rewriting who was originally included. |
| Actual request/response                       | D22/P27 evidence tied to actual terms and speakers; D23 review remains separate. Inclusion, removal or a checkbox cannot fabricate or delete those facts.                              |
| Commitment/received money/recognition         | P16/P13/P14 respectively. Membership is not attribution, payment allocation or conservation authority.                                                                                 |
| Reviewed communication population and outcome | P32/P6/P17. A send captures exact recipients, with current qualified restrictions before dispatch admission and honest in-flight/unknown outcome handling.                             |
| Task/attention                                | ADR0183/ADR0027 projections of actual source work. Membership alone is not a task, recipient grant, completion or notification event.                                                  |

Use one source-owned planning entry with **In working list**, **Excluded from this
appeal**, or **Removed from working list** meaning, plus lawful transitions. These
are not three parallel workflows or replacements for response buckets. Eligibility
is separately derived, not a fourth mutable membership status that can become stale.
Historical participation remains available through permitted records even if no
current entry is actionable. No inclusion is required to record an actual past
request or response honestly; doing so must not add someone to future outreach.

One Party has at most one current membership identity in the same appeal. The same
Party can legitimately appear in different appeals without duplicating money or
communication effects. A church and its pastor are distinct Parties; household,
shared email, spouse, advisor, donor and sponsoring organization are not merged by
matching names or addresses. Listing a church does not expand its contacts. Using
a different church contact must not bypass exclusion of the organization for the
same appeal purpose; an independent personal request is not automatically excluded
solely because of that person's relationship to the church.

### Deliberate membership changes

| Action or change                          | Required outcome                                                                                                                                                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Add eligible new Party                    | Create one planned inclusion with trusted provenance. No ask, journey, gift, contact, approval or per-row task is created merely by adding.                                                                                          |
| Add already included Party                | Truthful authorized no-op; no duplicate, reset of history or additional work. Hidden duplicates do not reveal protected membership.                                                                                                  |
| Add previously removed/excluded Party     | Ordinary Add/import/retry skips it and offers a permitted deliberate Return path. Never silently reverse a prior disposition.                                                                                                        |
| Remove from working list                  | End current planned inclusion; preserve asks/responses/history. Show it through history and candidate discovery where permitted; no permanent ban is implied.                                                                        |
| Exclude from this appeal                  | Retain a visible appeal-specific do-not-approach disposition. Can record a permitted candidate exclusion before that Party was included; no invented inclusion event.                                                                |
| Return to list                            | Explicit current-authorized operation, with the previous disposition visible, expected current state and current eligibility checks. Restore planning only; no task/review/message revival.                                          |
| Filter matches change                     | No membership mutation, new inclusion/removal or substitute. Staff can refresh discovery and deliberately choose a new finite addition.                                                                                              |
| Consent/access/eligibility changes        | Retain lawful history; current actions/read projections narrow immediately under their owner fences. Do not delete membership to conceal restriction or interpret renewed permission as a new staff inclusion decision.              |
| Request or financial outcome arrives late | Preserve real source-linked history regardless of current planning disposition; no automatic re-add or rewritten denominator.                                                                                                        |
| Appeal stops/closes or list becomes empty | No new outreach starts through retry/import/restore. Existing lifecycle gates govern any later restart; historical corrections do not reopen work. An empty permitted list is valid and is not a failed load.                        |
| Party merges                              | Use qualified canonical identity repair, retain provenance and prevent double counting. Equivalent current intentions can coalesce; conflicting current dispositions block only the affected member's actionable use until resolved. |
| Merge is undone / backup restored         | Reconcile later identity, exclusion, permission, consent and disposal fences. No blind reconstruction of earlier actionable membership or ended work.                                                                                |

Removal and exclusion both stop this appeal's planned solicitation, but mean
different things for staff: removal changes the plan, exclusion records a deliberate
appeal-specific restriction. Show the difference in brief contextual copy; do not
force people to choose a status on every ordinary addition. A short reason may be
optional; it must not demand sensitive missionary, pastoral or medical detail.
An appeal exclusion is not a global never-ask/consent editor. Only the exact owning
operation may change a wider restriction.

Merge conflict is narrowly about currently applicable intentions, not every old
history event. A prior removal already superseded by a valid Return is history,
not an eternal exclusion. Prefer a source-owned membership resolution to duplicate
Party creation or direct SQL repair. Never import relationship-edge dedupe's
“survivor wins” as permission to discard an appeal exclusion. The review does not
build a new identity system or permit automatic low-confidence merges.

### Communication, requests and shared work after removal

Continued planned inclusion is a current producer predicate for **solicitation
whose qualified producer purpose depends on the appeal's working membership**,
including follow-up prepared on that basis. Merely linking a Request or message
to the appeal does not make it membership-dependent. Required responses, receipts,
service/fulfillment and other independent duties retain their source applicability
and current contact-purpose rules. Relabelling the same solicitation as another
purpose or using another contact cannot bypass an applicable appeal exclusion.
This is not a global contact rule. Under the qualified P6/P32 contract, a membership disposition and its
required local producer-validity fence advance together; queued/claimed affected
work can no longer cross the owner's dispatch-admission boundary using old validity.
Frozen send populations do not gain replacement recipients. An ended occurrence
never resumes just because the Party is later returned to the plan.

The authoritative boundary is the communication owner's **dispatching/transport
admission**, not proof that bytes have physically left a server. Work already
admitted, submitted or indeterminate stays in-flight/unknown until reconciled; it
cannot honestly be called canceled or recalled. The UI identifies permitted pending
and in-flight implications and offers the owner's actual stop/recovery route where
needed. If an adapter cannot establish the source predicate/fence, withhold that
appeal-originated integration's activation. Do not ship a Remove button whose
ordinary implied future-outreach effect is only a cosmetic filter.

Removal does not cancel Requests, supporter promises, receipts, required services
or other independently authorized work. It makes affected appeal solicitation
inapplicable without inventing outcomes. Qualified shared work follows that exact
source action; broader outstanding obligations remain with their owners. Preparing
new work later uses the deliberate source flow, including D4's enrollment boundary
and D23's review where applicable. Do not add an enrollment ceremony merely for
list membership, or silently start one behind the Add button.

## Staff experience and interaction requirements

Use the shared Asym record shell, list/filter/search patterns and `@asym/ui`
**Base UI/base-maia, Zinc semantic tokens**. No new visual system or generic audience
builder is needed. Keep a readable **Working list**, a clear **Excluded** view and
permitted history for removals. Request/response information can appear alongside
planning context but must not become one overloaded status. Permission-safe count
labels explain whether they count planned Parties, requests or communication
recipients; those are not interchangeable denominators.

1. **Start clearly.** An empty appeal says “No supporters added yet,” with **Add
   supporters**. A failed/restricted list load is explained separately. Opening a
   filter or selecting checkboxes writes nothing. Do not require a filter, email
   address, recorded gift or existing journey for an otherwise eligible Party.
2. **Find candidates.** Search permitted people/organizations or reuse a saved
   view. Distinguish “Select this page” from a deliberate “Select all matching
   results.” Keep the selected scope and count visible. Page eviction, sorting or
   filtering never silently retargets the selection; changing its meaning requires
   explicit reselection. A **Review selection** view and **Clear selection** action
   cover the whole selected set, including off-page entries. No hidden cross-page
   selection is silently executed.
3. **Add deliberately.** An individual Add needs no second ceremony when its
   appeal/Party/action are clear. Group action shows the finite selected scope,
   permitted already-in-list/prior-disposition outcomes and the actual Add action.
   This is an action summary, not D23 proposal approval. Capture identities once;
   later matches never join. Rechecking current safety may narrow actual accepted
   results, but must not silently replace selected people.
4. **Show honest results.** The operation reports added, already present, skipped
   prior disposition, conflicted, unavailable, canceled or unresolved outcomes as
   currently permitted. Explain partial completion and offer the next useful action.
   Known accepted changes survive a lost response; retry checks the same operation,
   not a fresh query. A receipt is historical, so show current membership separately
   when it has since changed.
5. **Change the plan in context.** Row actions say **Remove from working list** or
   **Exclude from this appeal**, with short effect text and relevant pending/in-flight
   information. Returning a prior entry clearly says **Return to list**, preserves
   earlier evidence and rechecks restrictions. Avoid a permanent three-way status
   form, mandatory reason essay, broad administrator confirmation or reversible
   action confirmation on every click.
6. **Know what to do next.** Current included rows expose authorized source actions
   such as preparing a request or viewing existing work. Restricted rows explain
   the permitted limitation and recovery; they do not encourage contacting a blocked
   supporter. No source permission means no leaked reason or fake editable control.

Illustrative copy: “This list records your appeal plan. Changes to the saved filter
won't change it.” For exclusion: “Keep this supporter out of outreach for this
appeal. Existing requests and responses remain.” For a restore: “Return to the
working list. Earlier messages and tasks will not restart.” These are proposed
interaction copy, not tested user language. A current wider restriction still
prevents Return to actionable inclusion and must be explained without exposing
protected reasons.

Use readable hierarchy, useful spacing, restrained badges and text plus color.
Keep names and organization relationships recognizable without truncating meaning
or assuming Western names/addresses. No new address collection is necessary here.
Use localized dates and labels, record server instants separately from historical
occurrence precision, and never derive a business timezone from the browser or an
address. Essential actions need no hover or drag. Provide keyboard/screen-reader
selection, announced counts/pending/results, linked errors and reliable focus after
rows leave a view. Reflow at **320 CSS pixels**, equivalent zoom, RTL, light/dark,
long names and translated labels must be tested in the actual interface. A screen
reader must be able to distinguish the three kinds of selection state.

On low bandwidth, separate loading from zero results, preserve recoverable input
within the current interaction and offer safe result checking after reconnect.
Do not store sensitive manifests or exclusion reasons in browser persistence by
default. Closing the screen does not cancel an already-accepted operation. Virtual
rows and asynchronous pages must not discard selection or expose late responses
after a Tenant/context change. This staff feature adds no donor giving-checkout step
and no new public view of missionary relationships.

## Database, finite operations and failure contract

The minimal source model is scoped appeal/Party membership with a current disposition
and revision, lawful append-only transition evidence and the existing operation
receipt/durable-work mechanisms needed for group changes. Use current owner-qualified
Party references and merge provenance. Avoid JSON contact snapshots, a duplicate
consent field, a stored authoritative member-count total, a generic group model or
full event-sourcing infrastructure. Exact physical names are design work; the
invariants below are not optional conventions.

Use non-null required Tenant/appeal/Party keys, composite unique/FK relationships,
finite valid dispositions and one current membership per qualified appeal/Party.
Optional provenance references must not weaken required parent scope. Server-derived
actor, recorded time and command identity cannot come from a caller-supplied audit
record. Changing Tenant, appeal, Party, actor, exclusion or canonical resolution is
not an ordinary writable field. Correct identity only through qualified owning
commands. Indexed scoped keys and disposition/current-head predicates support lists;
measure actual query plans before adding materialized counts or partitioning.

New inclusion and Return require current authority and planning eligibility.
Historical retention/exclusion has its own qualified action; recording a lawful
restriction must not require permission to solicit. Actor rights, target rights,
applicable contact-purpose restrictions and source state are checked at each
accepted member effect and again at consequential outward boundaries. An allowed
old row must not be transformed into a forbidden new scope or state. Inspect actual
grants, RLS `USING` and `WITH CHECK`, views, functions/search paths, Storage, RPCs,
imports and service writers. `WITH CHECK` can inherit `USING` when omitted; omission
alone is not an exploit. Neither that inheritance nor RLS proves field authority,
cross-row invariants, current revocation or durable idempotency.

A multi-page “all matching” selection must become one bounded immutable intended
set under a coherent capture boundary, not a worker repeatedly running the query.
A saved definition alone, client row cache, offset page loop or list count is not
that set. Record minimum qualified selection provenance, selected identities and
expected membership state; avoid copying contact or protected query bodies. Enforce
measured operation ceilings before admission with a clear smaller-selection path;
never silently truncate the group or claim that a 100-row cache means all results.
The selected set is not a promise that every member remains authorized at execution.

Per-member source change, required transition/history, receipt and actual required
producer-fence advancement/supersession are atomic through the qualified owner
transaction. A queued promise to advance the fence later is not successful
prevention. Only permitted secondary projections/effects may wait on durable
intent. Independent members may complete separately under D4's established
pattern. A late local failure commits none of that member's effect; accepted members
remain accepted. Durable per-item outcomes and bounded execution permit result
checking and retry without holding one transaction open for a whole human-scale job.
Semantic idempotency binds exact operation/appeal/action/members and context. Changed
intent under the same identity conflicts; an old Add receipt never re-adds someone
after a later Remove/Exclude. Expected-state and appropriate row/owner fences order
competing Add, Exclude, Return, merge and revocation without last-write-wins.

Ordinary Add skips retained prior dispositions even in a new batch. Return is a
new explicit action with current state, not a magic override flag accepted by an
old batch. Cancellation fences future unaccepted item work, preserves completed
results and offers explicit current correction rather than pretending to undo them.
Unknown outcomes require authoritative checking; failed secondary projections retry
from durable intent without falsely claiming membership failed. Terminal business
outcomes are not transport retry errors, and user-facing output reauthorizes the
permitted result rather than exposing hidden membership via uniqueness errors.

Lawful business history is different from permanent personal data retention.
Use restricted references and minimized evidence; ordinary Remove/Exclude never
cascades through Requests, contribution history or decision evidence. Apply the
owning retention/redaction/disposal rules and legal holds explicitly, including
selection manifests, receipts, exports and backups. Restored readers/workers stay
fenced until current exclusion, identity, authority, cancellation and disposal
state is reconciled. No permanent frozen private contact directory is justified.

## Exact requirements for the future specification

These are research-record requirements for /to-prd, not a prematurely published
OpenSpec change or implementation claim.

- **R01 — Recorded planning intent.** Appeal membership SHALL change only through
  qualified explicit source actions. Later filter/query changes SHALL NOT mutate
  an accepted working list or the intended population of an admitted operation.
- **R02 — Separate facts.** Planned inclusion, current eligibility, actual requests,
  responses, commitment, received money and communication outcomes SHALL retain
  their distinct source meanings. Membership SHALL create none of the other facts.
- **R03 — Stable scoped identity.** Each appeal SHALL have at most one current entry
  for the same qualified Party in its Tenant/source scope, with complete scoped
  references and retained provenance. Organizations SHALL NOT expand into recipients
  and weak matching SHALL NOT merge distinct people or organizations.
- **R04 — Deliberate dispositions.** Add, Remove, Exclude and Return SHALL follow the
  lifecycle table. Plain Add/import/retry SHALL skip retained removed/excluded
  entries; only an explicit currently authorized Return may restore inclusion.
- **R05 — Current authority.** Candidate discovery, counts, group capture, each member
  effect, history, result replay, export and outward use SHALL prove their current
  exact actor/field/purpose/source permissions. Assignment or membership SHALL grant
  none. Unknown authority SHALL NOT be treated as permission or zero coverage.
- **R06 — Current restrictions.** New actionable inclusion and solicitation SHALL
  respect current applicable never-ask/contact restrictions. Existing history SHALL
  not be rewritten or erased to represent current restriction. Appeal exclusions
  SHALL NOT be used to modify global consent, or bypassed through alternate contacts
  representing the same excluded organization/purpose.
- **R07 — Finite group intent.** A group operation SHALL bind exact intended identities,
  action and source scope, distinguish selected page/all results, and record a
  coherent bounded capture. It SHALL NOT recapture a changing filter on retry.
- **R08 — Atomic member outcomes.** Each accepted member effect, required local history,
  receipt and actual required producer-fence advancement/supersession SHALL be atomic
  through the qualified owner transaction. Only permitted secondary effects may be
  deferred through durable intent; a fence-update outbox alone is insufficient.
  Independent outcomes may be
  partial; accepted work SHALL survive other members' failures and cancellation.
- **R09 — Concurrency and idempotency.** Relevant expected heads and owner fences SHALL
  serialize competing state/authority changes. Same-intent retries SHALL not duplicate
  or reapply effects; changed intent SHALL conflict; old receipts SHALL not replace
  current membership. Ordinary Add SHALL not override a newer removal/exclusion.
- **R10 — Precise outward effect.** Solicitation whose qualified producer purpose
  depends on appeal working membership SHALL use continuing inclusion as a current
  producer predicate through P6/P32 before
  dispatch admission. Removal/exclusion SHALL fence affected not-yet-admitted work,
  preserve in-flight/unknown truth and never cancel independent owner work merely
  because it has an appeal link. Return
  SHALL not revive ended effects; absent adapter qualification SHALL block activation.
- **R11 — Existing work and historical facts.** List edits SHALL preserve actual
  requests/responses/financial facts. Historical entry remains possible without
  re-adding the Party. Source-backed tasks SHALL follow exact actionable predicates;
  membership, filter refresh and generic completion SHALL not start/end other facts.
- **R12 — Identity repair.** Merge/unmerge SHALL use owner-qualified identity repair,
  retained provenance and current restrictions. Conflicting applicable planning
  intentions SHALL not become silently actionable or double-counted; resolution is
  bounded to affected membership and respects later decisions.
- **R13 — Minimal governed data.** Store minimal classified membership/provenance and
  lawful history, with current source projections for contact detail. Manifests,
  reasons, logs, caches, exports and backups SHALL obey the same authority and
  disposal boundaries; no default contact-directory snapshot or protected payload copy.
- **R14 — Clear accessible interface.** Use shared Core UI, explicit actions, clear
  selection scope, understandable disposition/eligibility/history and truthful
  pending/partial/conflict/recovery feedback. The real browser SHALL meet the
  concrete keyboard, screen-reader, reflow and low-bandwidth cases above.
- **R15 — Native bounded operation.** Planning SHALL work without Studio, external
  campaign providers, a new group/list engine or a task/reminder per entry. Consumers
  SHALL use exact qualified source identities and outcome contracts.
- **R16 — Measurement and operations.** Scoped lists/history, permission-safe counts,
  group execution, query plans, lock waits and reconciliation SHALL be measured
  against an explicit numeric admitted workload and named budgets before release.
  No undocumented silent caps or unmeasured capacity claim is permitted.
- **R17 — Safe upgrade and restore.** Additive schema, compatible writers/readers,
  current source fences and data census SHALL precede activation. Imports/backfills
  SHALL not invent planning intent or outreach; disabling a consumer SHALL not
  waive restrictions. Rollback/restore SHALL preserve new accepted history and
  re-prove current exclusion/identity/access/disposal before affected work resumes.
- **R18 — Traceability and proof.** D24/glossary/owner mappings SHALL trace into future
  requirements/design/tasks and actual implementation/tests/release evidence.
  Required negative, concurrency, migration and UX cases below SHALL be proven;
  research examples and synthetic mechanics SHALL not be claimed as deployed proof.

## Full adversarial category review

**Grades:** Critical means serious authorization/disclosure or unintended external
effect; High means corrupt planning/history, wrong action or consequential work
loss; Medium means substantial friction, maintenance or operational burden.
Likelihoods are qualitative conditional design judgments, not measured incidents.
Every category is independently considered. Each material concern below names its
reason/evidence, effect on A and exact R/AC prevention; overlap is not a skipped
category. No finding requires replacing the selected recorded-list model.

| # / category                                        | Material concern, failure and importance                                                                                                                                                                                  | Severity / likelihood; evidence                                                                                                         | Effect, permanent fix and exact requirement/proof                                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01 Problem validity, necessity and alternatives** | **Yes.** A live query cannot reliably express the staff-approved plan; conversely a general static-list product creates unnecessary setup. Spreadsheet coordination loses shared restrictions/history.                    | Medium / plausible. Q24/original brief, Blackbaud direct comparator and existing P9 engine; no measured frequency claim.                | **Narrow A** to appeal-owned entries in the shared shell; no generic audience platform. **R01, R15; AC01–03, AC27.** B remains credible for live discovery, not the selected planning model.                                      |
| **02 Brittleness**                                  | **Yes.** Saving only a filter ID, query or browser selection means later matches/page eviction silently change the operation. Stale restriction flags turn an old plan into false clearance.                              | High / likely if query/UI state is treated as source intent. Current view/selection seams, D4 and new probe scope.                      | **Clarify A** with finite server capture and current derived eligibility. **R01, R05–07; AC02–05, AC09, AC16.** Filter deletion does not destroy accepted membership.                                                             |
| **03 Technical debt**                               | **Yes.** Cloned contact snapshots, consent flags, portfolio rows, generic Groups or ungoverned counters create competing truth and repair obligations.                                                                    | High / plausible. P9 reserved Groups boundary, ADR0001, actual preference/export implementations.                                       | **Constrain design** to membership refs/history and existing source contracts. **R02–03, R13, R15; AC01, AC12, AC23, AC27.** Physical table names remain design, not a frozen framework.                                          |
| **04 Edge cases**                                   | **Yes.** Prior exclusions, removed-but-asked Parties, empty lists, unknown eligibility, church/individual overlap, duplicate identities, merged conflicting intentions and late responses can mislead or trigger contact. | High / plausible. Lifecycle analysis, source identity/restriction contracts and vendor shortcuts.                                       | **Clarify A** through the lifecycle/edge cases above and narrow current recovery. **R02–06, R11–12; AC04–12, AC20–21.** No automatic re-add or fake Asked event.                                                                  |
| **05 Footguns**                                     | **Yes.** Select all means a page or a changing query; Remove looks like deletion/recall; Add restores exclusions; a kanban move invents a response or money.                                                              | High / likely without explicit labels and source enforcement. Current table behavior and MPDX Asked warning.                            | **Require clear operation scope, consequences and distinct truth. R02, R04, R07, R10, R14; AC02–04, AC06, AC10–11, AC17–19.** UI hiding alone cannot enforce it.                                                                  |
| **06 Tenant safety**                                | **Yes.** Cross-Tenant Party/appeal IDs, stale assignment context, caches, jobs or merge references can mix private relationships or apply another organization's plan.                                                    | Critical / plausible. P12/P3 source requirements; actual P27 roles not implemented/proved.                                              | **Require complete scoped keys and all-path current authority. R03, R05, R08–09, R13; AC13, AC15–16, AC22–23.** Idempotency/query caches are scoped, not global or table-only.                                                    |
| **07 Database, RLS and authorization safety**       | **Yes.** A permitted row becomes a different Party/appeal, direct updates erase exclusion/provenance, NULL weakens FKs, or privilege/service paths bypass current checks.                                                 | Critical / plausible. PostgreSQL/Supabase docs and adjacent table grants; toy proof does not establish real RLS.                        | **Make invalid relationships/cardinality impossible and qualify the command boundary. R03–09, R13; AC13–16, AC22.** Test USING/resulting WITH CHECK behavior, grants/views/functions and service paths, not just UI.              |
| **08 Overengineering**                              | **Yes.** Every edge case becomes another status, mandatory approval, cohort hierarchy, automatic re-add rule, generic list engine or reminder.                                                                            | Medium / likely if uncontrolled flexibility is confused with configuration. D21 delegation, shared P9/Tasks and finite owner contracts. | **Keep one membership model and contextual actions. R04, R14–15; AC01, AC06–07, AC18, AC27.** No per-member workflow or default task.                                                                                             |
| **09 UX/UI and friction**                           | **Yes.** Ambiguous statuses/counts, hidden cross-page selection, inaccessible grids and vague partial-success toasts cause mistaken outreach and lost confidence.                                                         | High/Medium / plausible. Current shared UI plus fresh primary accessibility/CRM evidence; no actual pilot.                              | **Require the complete minimal workflow**, responsive readable list, named operations and useful recovery. **R07, R14; AC02–07, AC17–19, AC28.** No added donor checkout steps.                                                   |
| **10 Source of truth, ownership and invariants**    | **Yes.** Planning membership becomes recipient authority, Asked, financial success, relationship enrollment or another source's cancellation.                                                                             | Critical / plausible. P27/P9/P6/P13/P16/P32 and explicit original brief.                                                                | **Preserve owner table/cardinality and actual fact boundaries. R01–03, R10–12, R15; AC01, AC10–12, AC20, AC24, AC27.** Read models cannot approve, send or allocate money.                                                        |
| **11 Hidden coupling**                              | **Yes.** Filter refresh silently rewrites plan; list removal globally stops receipts; restoring membership resumes old sends; church membership expands people.                                                           | Critical/High / plausible. Exact producer fences and source graph boundaries.                                                           | **Use scoped subtract-only source validity, no broad lifecycle cascade. R01–04, R10–12; AC02, AC08, AC10–12, AC20, AC24.** Admission and provider truth stay separate.                                                            |
| **12 Failure modes**                                | **Yes.** Some additions commit before failure; the response is lost; cancellation races execution; secondary projection fails. Blind retry duplicates or resurrects rows.                                                 | High / plausible. D4 independent-item pattern and new membership probe.                                                                 | **Atomic item evidence and durable original intent/results. R07–10, R14; AC14–17, AC24.** Do not report accepted source work as failed solely because projection/delivery failed.                                                 |
| **13 Lifecycle, time, concurrency and idempotency** | **Yes.** Stale bulk inclusion wins over exclusion, competing returns overwrite newer intent, revocation misses the boundary, or old callbacks replay after removal.                                                       | Critical/High / plausible. Required expected-head/source fences, synthetic ordered schedules with limited scope.                        | **One coherent per-member order, exact semantic retries and current authority. R04–10, R12; AC14–16, AC20–21, AC24.** Server recording time and real occurrence remain distinct; no backdated reactivation.                       |
| **14 Data integrity**                               | **Yes.** Duplicate candidates or merges inflate population; removal erases actual outcomes; imports infer Asked from membership; read coverage masquerades as zero.                                                       | High / plausible. Original brief, Party merge contract, vendor comparison and bounded search.                                           | **Scoped identity, explicit provenance and distinct measures/coverage. R02–04, R11–13, R17; AC03–05, AC08–12, AC20–22, AC25.** Money totals retain D22 conservation.                                                              |
| **15 Security and privacy**                         | **Yes.** Selection manifests, exclusion reasons, filter logs, counts, CSVs or backups reveal protected missionary/church relationships; static exports outlive access.                                                    | Critical / plausible. P3/P10/P12, existing export/logger seams and source restrictions.                                                 | **Minimize data, reauthorize egress/replay and apply lawful disposal. R05–06, R13, R17; AC13, AC16, AC22–23, AC26.** No permanently frozen contact directory or promise to recall exported files.                                 |
| **16 Scalability and performance**                  | **Yes.** Query pages drift, giant transactions lock one appeal, full history is loaded, or per-item checks become N+1 scans. A browser cache limit can silently truncate intent.                                          | Medium/High / plausible. Current list caches and relational execution reasoning; correctness experiment is not load evidence.           | **Bound capture/execution, paginate indexed scoped reads and measure actual roles/workload. R07–09, R16; AC02–03, AC14–15, AC29.** No invented unlimited scale or unrelated-phase capacity target.                                |
| **17 Operational burden**                           | **Yes.** Unresolved partial results, hidden restrictions, merge collisions or stuck projections require manual spreadsheets/direct SQL repair.                                                                            | High / plausible. Source recovery requirements and chosen lifecycle.                                                                    | **Keep per-item outcomes and bounded authorized recovery at source. R08–12, R14, R16; AC05–09, AC14–17, AC20–21, AC24.** No forced ongoing chore for every dormant/history-only entry.                                            |
| **18 Observability and auditability**               | **Yes.** Staff cannot tell filter discovery from actual inclusion, who excluded someone, why counts changed or which operation succeeded. Logs may substitute for durable history.                                        | High / plausible. New planning fact requires preserved provenance; current log redaction is not complete privacy policy.                | **Retain typed minimal business transitions/receipts and separately governed technical evidence. R07–09, R13, R16; AC14–17, AC20, AC23–24.** Current state and historical result are distinguishable.                             |
| **19 Dependency and integration**                   | **Yes.** A saved-view/provider extension becomes membership authority, a P32 consumer omits current source validity, or duplicated native/Studio paths create extra contact.                                              | Critical/High / plausible. P6/P17/P32/DON source contracts and unqualified current seams.                                               | **Qualify exact adapters; Core owns plan and providers own delivery evidence. R01, R10, R15; AC10–11, AC24, AC27.** No external list vendor or optional Studio dependency.                                                        |
| **20 Migration, rollout and upgrade**               | **Yes.** Legacy tags/imports manufacture inclusion, mixed writers bypass new exclusion semantics, rollback reactivates work, or restore loses later restrictions.                                                         | Critical/High / plausible. No retained-data census or deployed schema was inspected.                                                    | **Additive schema, compatibility and explicit evidence migration before activation. R03–10, R13, R17; AC22, AC25–26.** Feature off stops unsafe mutations; it never waives restrictions or erases new history.                    |
| **21 Testability, traceability and proof**          | **Yes.** “Recorded,” “remove,” “all,” and “beautiful” stay vague; a synthetic test is overstated as Supabase/UX proof; glossary equates audience with recipients.                                                         | High / likely without explicit distinctions. All source/probe limits and session vocabulary.                                            | **Use exact R/AC meaning and source-qualified glossary. R14, R18; AC01–29.** Future formal specs/tickets and actual release evidence trace this decision; no premature publication.                                               |
| **22 Other development hazards**                    | **Yes.** Unbounded sensitive reason text, blind bulk Undo, hypothetical thresholds, transitive consent guesses or shell purges cause difficult repair and scope creep.                                                    | High / plausible. Lawful-retention/merge owner floors and proportionate design reasoning.                                               | **Use safe rendering, optional minimal reasons, explicit present-state correction and no inferred authority. R04–06, R12–15, R17; AC07, AC12–13, AC18–23, AC26.** No broad new engine or global exclusion setting follows from A. |

## Acceptance criteria and proof matrix

These are future implementation outcomes unless the bounded experiment explicitly
states a narrower tested mechanic. Test actual source services/roles and user flows,
not only mocked table updates.

| ID       | Independently testable outcome                                                                                                                                                                                                                                                                                                                              | Clauses               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **AC01** | Add a permitted person and organization individually: one planned entry each, no contact expansion, request, journey, gift, message, approval or automatic per-row task. Initial empty view is understandable.                                                                                                                                              | R01–03, R11, R14–15   |
| **AC02** | Select current page versus all matching results across pagination/filter changes. The explicit server-captured identities are preserved despite browser cache eviction, later additions/removals or filter deletion.                                                                                                                                        | R01, R07, R14, R16    |
| **AC03** | Duplicate candidate IDs, concurrent same-Party Add and already-in-list Add create at most one membership. Hidden existing membership produces no existence leak or workaround duplicate.                                                                                                                                                                    | R03, R05, R07–09      |
| **AC04** | A saved-filter change never adds/removes an accepted entry. New discovery may show candidates, but does not resume excluded/removed work or alter actual outcomes.                                                                                                                                                                                          | R01, R04              |
| **AC05** | New inclusion fails safely when planning authority/eligibility is denied or unknown. An existing retained entry under later restriction is shown only within current rights and cannot authorize outreach; loading/error is not zero.                                                                                                                       | R05–06, R13–14        |
| **AC06** | Remove preserves lawful requests/responses and history. Exclude records an appeal-specific restriction, including an eligible-to-record candidate not previously included. Neither changes global consent or records a donor decline.                                                                                                                       | R02, R04, R06, R11    |
| **AC07** | Plain Add/import/retry skips removed/excluded entries. Explicit Return shows previous disposition, checks current expected head and eligibility, and restores planning only; no ended tasks/reviews/messages revive.                                                                                                                                        | R04–06, R09–11        |
| **AC08** | Record real late/past request or response after removal/exclusion, including stopped work, without re-inclusion, fabricated Asked/approval or automatic contact.                                                                                                                                                                                            | R02, R11              |
| **AC09** | All entries removed, all currently restricted, no permitted entries, failed query and genuinely zero entries yield distinct truthful views/counts/actions within disclosure limits. No forced owner task for historical-only entries.                                                                                                                       | R05–06, R14, R16      |
| **AC10** | Remove/exclude and membership-dependent solicitation admission race in both orders: earlier accepted invalidation blocks later admission even with the secondary projection worker unavailable; already-dispatching/submitted/indeterminate work remains truthful and reconciles. No recall claim.                                                          | R06, R08–10           |
| **AC11** | Source exclusion narrows a captured P32 send without adding replacements. Independently required responses/receipts/service or fulfillment remain under their owners, even with an appeal link. A later Return does not resume the ended solicitation occurrence; relabelling that purpose cannot bypass exclusion.                                         | R02, R10–11, R15      |
| **AC12** | Church, pastor, household, spouse, legal donor and advisor identities are not conflated by email/address/name. Changing human contact cannot bypass the same organization's appeal exclusion; unrelated personal scope is independently evaluated.                                                                                                          | R02–03, R05–06        |
| **AC13** | Actual Tenant/appeal/Party substitution, forbidden resulting-row mutation, forged actor/provenance and capability-only/role-label shortcuts fail across API, RLS, functions, views and privileged writers without partial change or existence leak.                                                                                                         | R03–06, R08, R13      |
| **AC14** | Inject failure of required local history, receipt or producer-fence advancement after member preparation: none of that member is falsely accepted with protection missing. Independent successful members remain, unresolved ones are visible and safely recoverable. A permitted secondary projection failure after valid commit does not undo acceptance. | R07–10                |
| **AC15** | Controlled concurrent inclusion/exclusion in both orders, competing current-head changes, same-intent duplicates and changed payload under same operation key have one coherent outcome; exclusion cannot be overwritten by stale Add.                                                                                                                      | R04, R07–09           |
| **AC16** | Race current permission/suppression loss with capture and each member acceptance in both orders. Prior valid acceptance remains history; later unauthorized effects fail. Same user in another Tenant assignment cannot reuse its authority/results.                                                                                                        | R05–09, R13           |
| **AC17** | Lose response after accepted group items, then remove one entry and retry the original operation. It returns permitted original results without re-adding, recapturing or overwriting newer state. Cancellation stops future unaccepted items, not completed ones.                                                                                          | R07–09, R14           |
| **AC18** | Keyboard/screen reader can discover selection scope, mixed selection, current restrictions and Add/Remove/Exclude/Return; focus and announced results remain useful as rows leave a filtered view.                                                                                                                                                          | R14                   |
| **AC19** | Real UI passes 320-CSS-pixel/equivalent zoom, RTL, long names/translations, contrast and reduced-motion tests. Slow network/reconnect preserves safe input/result recovery without default sensitive browser persistence.                                                                                                                                   | R13–14                |
| **AC20** | Qualified Party merge of duplicate compatible membership avoids double counting and retains both origins; conflicting current inclusion/exclusion/removal becomes a bounded member conflict, not actionable survivor-wins or whole-appeal freeze.                                                                                                           | R03, R09, R12         |
| **AC21** | Unmerge after later Return/exclusion/access change and source-shell purge safeguards preserve current restrictions/history. An old removal superseded by valid Return is not misread as an eternal exclusion.                                                                                                                                               | R04, R06, R12–13, R17 |
| **AC22** | Imports/backfills distinguish evidenced prior planning from list tags/actual asks/consent, resolve canonical Parties under current authority, and never create current outreach or approvals from historical labels.                                                                                                                                        | R01–06, R11–13, R17   |
| **AC23** | Counts/filter facets/difference queries, exports, caches, late responses after context switch, logs and result receipts respect row/field/purpose floors. Test formula/script injection, protected reasons and revoked export release/download.                                                                                                             | R05, R13–14           |
| **AC24** | Delayed/duplicate/out-of-order worker and projection events preserve membership and exact effect identity. Failure of a secondary projection cannot falsify acceptance; provider uncertainty cannot trigger another send or list revival.                                                                                                                   | R08–10, R15–16        |
| **AC25** | Mixed old/new clients/jobs, additive migration and activation gates reject writers that cannot honor disposition/current-head/receipt semantics. Disabling mutation/consumer paths preserves history and restrictions.                                                                                                                                      | R03–10, R17           |
| **AC26** | Restore a backup before later exclusions, revocation, merge or disposal. Affected readers/workers remain fenced until reconciled; no erased content or ended outreach returns. Roll-forward preserves newly accepted data.                                                                                                                                  | R10, R12–13, R17      |
| **AC27** | Native appeal planning works with P34/P42 and external campaign providers unavailable. A saved view, giving campaign, workflow or provider list cannot write appeal membership by synchronization convention.                                                                                                                                               | R01–02, R15           |
| **AC28** | Moderated real-staff scenarios verify understanding of planned versus asked, Remove versus Exclude, current restriction, selected scope and partial results. Any unsafe misconception is corrected and retested before expansion.                                                                                                                           | R14, R18              |
| **AC29** | Declare numeric Tenant/Party/appeal/member/history volumes, largest-Tenant skew, group size, concurrent changes, role/permission shape and low-bandwidth profile. Measure p50/p95/p99, scans/locks, capture and recovery against named budgets; no silent truncation or unqualified higher capacity claim.                                                  | R07–09, R16, R18      |

## Executed evidence and its limits

The new [membership experiment](d24-evidence/membership-probe/README.md) supplies
isolated mechanics evidence, with [results](d24-evidence/membership-probe/results.json)
and [run metadata](d24-evidence/membership-probe/run-metadata.json): **8/8 passed on
the first runtime attempt**, 2026-10-10 **18:25:07–18:25:13 UTC**, PostgreSQL **17.11**
at `read committed`. Three genuine two-session schedules record exact PostgreSQL
waiter/blocker PIDs: exclusion before a stale Add, inclusion before an explicit
current exclusion, and concurrent exact retry. Other checks cover filter drift,
duplicates, per-item logical outcomes, receipt-failure rollback, explicit Return
and changed-intent conflicts. The input hashes and exact isolated-container removal
are retained; no failed attempt or rerun was omitted.

The fixture uses a coarse appeal lock, an illustrative **25-item laboratory cap**
and one bounded transaction for the batch. These are not production lock/limit
choices. Mixed logical item outcomes do not prove independently committed production
chunks, interrupted execution, cancellation or crash recovery. The reverse exclusion
schedule deliberately supplies the correct expected revision; it does not prove UI
auto-refresh or authorize silent refresh of stale intent.

The fixture is intentionally owner-executed and synthetic. It cannot establish
actual P12/RLS, Party identity repair, communication dispatch fencing, lawful
retention, UI/accessibility, live Supabase version or production capacity. Earlier
D4 finite-group and D23 review probes are dated supporting evidence, not rerun or
recounted as new D24 proof. The source states and keys in this experiment are not
final production table/enum choices. No product code, migration, live data,
configuration or external contact was changed.

Current primary PostgreSQL transaction/constraint/RLS guidance was checked. The
Supabase changelog was scanned; its September 25 PostgreSQL 15.19/17.11 notice was
reviewed for the new isolated relational test. The test introduces no ltree,
btree_gist, legacy cipher data or custom operator migration. This is not a live
project advisory or upgrade audit. The primary CREATE POLICY semantics take
precedence over the skill's overbroad claim that omitted WITH CHECK always permits
reassignment; actual policy/grant/function behavior still requires qualification.

## Ruthless synthesis and delivery order

**Resolved before recording.** Accept A as deliberate appeal planning, with one
scoped membership, recorded intent versus current eligibility, contextual Remove/
Exclude/Return and no membership→Asked shortcut. Capture exact group intent, do not
recapture queries, and preserve actual history. Qualify the continuing-inclusion
predicate through existing producer fences; do not leave removal as a cosmetic
workaround. Resolve identity collisions through source-owned repair, not invented
survivor precedence. No material new authority or separate founder vote is needed.

**Capture in the future spec/design.** Carry R01–R18 and AC01–AC29 into /to-prd.
Define the minimal physical constraints, current membership/read projections,
finite-selection admission and retention, exact source permission/merge adapters,
P6/P32 fence mapping, UI states and error/result contract. Keep response buckets and
financial association decisions separately visible in the phase coverage register;
D24 does not invent those answers. An ADR is needed only if later design truly
changes a governing owner contract, not to duplicate existing boundaries. Issue
publication remains separately invoked through /to-issues.

**Implementation safeguards, in dependency order.**

1. Qualify Party/current permission/restriction sources and the appeal identity;
   classify membership, provenance, count and export projections before readers.
2. Build scoped constraints and atomic individual/group commands with exact captured
   intent, current-head fences, history/receipts and safe result disclosure. Prove
   actual nonowner roles, stale retry, cancellation and competing dispositions.
3. Qualify affected source-work and appeal-originated communication fences, including
   dispatching/unknown outcomes and no automatic revival. Native planning does not
   wait for unrelated optional providers; unqualified outward lanes stay disabled.
4. Compose the shared working-list/exclusion/history and Add/Return flows, then test
   real pagination/virtualization, assistive technology, low-bandwidth recovery and
   staff comprehension. No UI status badge substitutes for the actual source rule.
5. Perform retained-data census, mixed-version/backfill/restore rehearsals and measured
   load qualification. Use a bounded tenant pilot and named operations owners before
   activating qualified effects. This research authorizes no real outreach or pilot.

**Monitor only after preventive gates pass.** These role owners must be assigned a
named person/on-call team in release evidence. Thresholds below are proposed
operating triggers, not measured service levels. Correctness and disclosure floors
remain release requirements, never risks accepted merely because a metric exists.

| Signal                                                                                        | Threshold                                                             | Accountable owner                             | Response                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unselected inclusion, duplicate current member or stale retry restoring removed/excluded work | **Any one verified occurrence**                                       | P27 engineering on-call                       | Stop affected new membership writer/group path, preserve receipts/history, investigate exact ordering, repair through source commands and require regression proof.                        |
| Appeal-originated outreach admitted after an earlier applicable exclusion/removal fence       | **Any one verified occurrence**                                       | P27 + P6/P32 integration on-call              | Disable affected outward binding, reconcile transport/provider truth, preserve evidence; do not claim recall or delete membership history.                                                 |
| Protected membership/count/reason/result exposed across current scope                         | **Any one verified occurrence**                                       | P12/security owner with P27                   | Contain affected projection/export, investigate disclosure, repair cache/authorization and follow existing incident process.                                                               |
| Accepted membership change lacks required secondary projection reconciliation                 | **Older than 5 minutes**, or **any terminal retry failure**           | Shared-work/communication integration on-call | Surface accepted change versus delayed projection separately; reconcile exact durable intent safely. Five minutes is an operating trigger, not a promised delivery time.                   |
| Current membership merge conflict has no permitted recovery route                             | **Any one detected conflict without a route**                         | P27 source recovery owner + P9 identity owner | Withhold affected actionable member only, expose safe resolution, retain history and prevent duplicate workaround.                                                                         |
| Pilot participant mistakes inclusion for Asked, or Remove for recall/erasure                  | **Any one unsafe misunderstanding**                                   | Product/UX owner                              | Revise language/composition and retest before pilot expansion; do not default to more mandatory dialogs.                                                                                   |
| Admitted query/command/backlog budget exceeded                                                | **3 consecutive 5-minute windows**, or **one exhausted retry budget** | P27 operations/database owner                 | Diagnose measured per-Tenant scans/locks/recovery; bound affected imports/projections without dropping history or bypassing restrictions. Numeric budgets must be named before activation. |

No extra ongoing task is assigned merely because an appeal has historical excluded
or removed entries. Real workload, frequency of exclusions and user comprehension
remain empirical qualification needs with explicit owners/tests, not excuses to
leave a product decision unresolved or invent universal ministry practice.

## Adversarial check

### What could go wrong with this answer?

A recorded plan could be mistaken for current permission, an actual ask or a copied
contact database. Query drift, stale retries and merge precedence could quietly
restore someone whom staff removed. The owner, mutation and recovery rules above
make those failures explicit and falsifiable without expanding into a new platform.

### What hidden assumptions are we making?

The planning value of an intentional list is product judgment supported by the
user's choice and comparable published workflows. We do not know each agency's
population size, exact practices or reviewer/communication arrangements. Real
source qualification, measured load and staff tests must establish those facts;
we do not require a generic configuration engine to accommodate unknowns.

### How does this affect the whole product?

P27 gains authoritative appeal planning intent while P9 live views keep their
existing discovery role. P6/P32 owns actual recipient/send facts; P13/P16/P14 owns
financial facts. Source eligibility can narrow appeal-originated outreach through
existing fences without creating another communication or task engine.

### How does this affect the end-user experience?

Staff can see their plan, make deliberate changes and understand what remains to
do. Ordinary additions stay short; group actions show exact scope and useful partial
results. Exclusion and removal preserve history, Return is clear, and current
restrictions remain visible without implying that messages can be recalled.

### Does this follow modern best practices?

It uses deliberate recorded membership, live authority, finite group intent,
conserved identity, transactional outcomes, safe retry and accessible shared controls.
Current primary nonprofit/CRM sources support the planning pattern but also expose
shortcuts Core must avoid. No product documentation is treated as proof of runtime
safety, staff satisfaction or universal ministry practice.

### Does this fit Asym’s existing repo and product direction?

Yes. It preserves Postgres ownership, the shared CRM/list shell, current P12 scopes,
source-controlled work and producer validity fences. It does not create a general
Group, static contact clone, money ledger, new email campaign product or optional
workflow dependency. Existing code supplies patterns, not assumed qualification.

### Should we adjust the recommendation?

**Accept A with the precise recorded interpretation above.** All 22 categories
have explicit findings, exact prevention and proof obligations. No material scope
change requires a new amended choice. The independent review and
[document checks](d24-evidence/review-checks.json) establish the completed record's
consistency separately from bounded database mechanics and future product evidence.
