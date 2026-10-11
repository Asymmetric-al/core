# D15 — retirement admission boundary and continuing-stage mechanics

2026-10-10; inspected checkout `225c02e9499bd6c0d493223cd4b1a4120ff787e3` with
the ongoing grooming documents present. Research only. The founder selected A:
whole-list retirement stops new admissions while existing work can keep choosing
available stages. D1–D14 are not reopened. This appendix proposes narrow D15
safeguards and supplies new isolated evidence, not implementation authorization.

## Fresh current-source inspection

An exact text search for `cultivation`, `stage.list`, `stage_list`, `stage_catalog`
and `stage_preset` in `packages/api/src`, `packages/database`,
`supabase/migrations`, `apps/admin` and `apps/missionary` found no implementing
cultivation list-retirement path. Migration names mentioning staged gifts or
giving pipelines concern other domains. This is bounded checkout evidence, not
a claim about unseen deployments or differently named work.

The [admin workspace collection](../../../../../packages/database/collections/admin-workspace.ts:10)
is explicitly local-only demo infrastructure, with a fixed stage enum at line 35.
The [real shared CRM grid shape](../../../../../packages/database/types/crm-grid.ts:4)
has donor lifecycle status, without journey/list/stage identity. Its
[model](../../../../../packages/api/src/admin/crm/model.ts:41) maps the value from
`donor.status` at line 54. The [board](<../../../../../apps/admin/app/(app)/crm/kanban-view.tsx:29>)
groups by that text, maps missing status to Unknown and sorts labels alphabetically.
Those readers do not constitute the new source model and must not be treated as
proof of retirement behavior, historical resolution or a valid Not yet assessed
state.

The [existing CRM query](../../../../../packages/api/src/admin/crm/query.ts:164)
parses lifecycle status filters; the [infinite-query hook](../../../../../packages/database/hooks/admin-crm-infinite.ts:192)
keys current filters/sort, retains previous data and has a thirty-second stale
window. These are existing presentation/read patterns, not qualification of
catalog-revision, list-retirement or source-identity invalidation. Nothing found
establishes an implemented “active catalog only” P27 bug: that is the concrete
future failure mode tested below. Do not rewrite unrelated donor lifecycle
readers merely to add this grooming decision.

Authoritative implementation will belong in `packages/api` under the existing
data-access boundary, with source constraints/migrations in their normal owner
paths. No new catalog service, second per-surface pipeline, status shadow store
or generic workflow engine follows from this decision.

## Concerns, exact clauses and future proof

Severity and likelihood rate an unqualified future implementation, not an observed
incident in a nonexistent P27 feature.

**I1 — One active-only catalog hides continuing work. High / likely if selector
queries are reused everywhere.** A list can be unavailable for new admissions
while remaining the assigned source of an existing journey. A shared
`active=true` filter or inner join can erase rows, labels, board lanes, historical
filters or exports, or mislabel an assessed journey as Unknown/Not yet assessed.
Probe case 7 reproduces this loss. **Exact clause:** “Resolve an existing
journey's assigned list and recorded stage independently of whether that list is
offered for new work. New-admission choices, existing stage choices and historical
reference resolution have distinct eligibility purposes.” **Proof:** the real
source/API, board, detail, cache, search/filter, accessible selector and export
retain authorized assigned work and history across withdrawal. No fallback list,
null stage, fabricated current assessment or record migration. A retired list
label is not a disclosure grant; filter by current source permission before
enumeration or counts. This is a D15 boundary now, not three new APIs/stores.

**I2 — FK or key-only locking permits admission after retirement. High /
plausible under concurrent configuration and admission.** PostgreSQL FK/key
protection preserves referenced identity; it does not serialize a non-key
availability flag. Probe case 1 holds `FOR KEY SHARE`, observes retirement's
ordinary non-key UPDATE commit, then demonstrates an allowed stale insert.
Cases 2–3 use a conflicting row fence and current recheck for both commit orders.
**Exact clause:** “Retirement and new admission must share a source-owned
serialization boundary. If admission commits first, that accepted work remains;
if retirement commits first, new admission to that list fails without a substitute
or partial journey.” **Proof:** actual source command and DB concurrency across
single/group/contextual/import paths and stale clients; bounded retry returns the
original accepted result, while different payload under the same intent conflicts.
Authority revocation and expected configuration/journey revisions must also be
proved at their owning boundaries. `FOR SHARE` versus retirement `FOR UPDATE`
is one sufficient fixture mechanism, not a ratified SQL API. A select-then-write,
FK alone, generic RLS, `FOR KEY SHARE` alone or expiring worker lease is insufficient.

**I3 — Whole-list withdrawal becomes a blanket ban on existing stage changes.
High / likely with an overloaded eligibility predicate.** The new A behavior must
cover assessed work and an existing D13 unassessed journey. An individually
retired stage remains unavailable for a new selection. Probe case 4 makes this
distinction; cases 5–6 show valid stage changes survive both retirement orders.
**Exact clause:** “An authorized stage change on work already assigned to a
withdrawn list checks the currently available stages of that assigned list; it
does not require the list to accept new admissions. Whole-list withdrawal neither
clears nor reassesses its existing work.” **Proof:** first assessment, change to
another available stage, keep-unchanged edit and independently retired target;
serialize all relevant stage-definition and journey writers. Preserve accepted
stage/history rather than incrementing progress or forcing list replacement.
Current actor/source capability still applies. Paused/closed return eligibility
is a separate product clarification; this probe has no such lifecycle and does
not silently classify return as a new admission.

**I4 — Continued choice becomes impossible through last-stage edits. High /
plausible, including concurrent edits to different rows.** D10's original
[R04](../phase27-d10-adversarial-review.md:167) protects lists available for new
work. D15 A needs the corresponding useful-choice invariant for lists retained
for existing work. D13's optional assessment does not justify an empty usable
catalog. **Exact proposed amendment:** “Configuration must preserve at least one
available stage for every list retained usable by existing work, including a list
withdrawn from new admissions. This does not depend on current/visible usage
counts.” Probe case 8 withdraws a list with two stages and zero journey rows; two
concurrent stage retirements share the list fence, and the second rejects after
seeing the first commit. **Proof:** actual command/DB tests for two stage edits,
restore/retire and other availability changes, coherent configuration revision and
atomic rollback. Do not query hidden journeys to decide whether a configurator can
retire the last stage or report hidden usage as the rejection reason. This is an
explicit D15 amendment, not a claim that D10 already decided whole-list policy.

**I5 — Restore/default/selection shortcuts silently change meaning. High /
plausible if a boolean toggle is treated as full lifecycle qualification.** D15
does not by itself approve list switching, default replacement, template copying,
restoration UI or unused-list deletion. If restoration is offered, it must retain
the same identity/meaning, qualify the current available set and restore only
new-admission eligibility—not stages individually retired, journey assessments,
work or communication. **Exact clause:** “Any offered restoration is a current
authorized configuration operation with truthful identity, availability and
history; it cannot publish an unusable list or resurrect unrelated effects.”
Probe case 9 uses deliberately invalid zero-stage fixture data and rejects restore;
it is conditional engine evidence, not adoption of restoration. Because valid
stage edits already maintain an available choice under the same list fence, a
second restoration race was not repeated. **Proof gate:** if restoration ships,
qualify its actual UI/source retry, revision and concurrent-writer paths; if list
selection/defaults/switching are offered, separately define their intended scope
before implementing. No automatic next-list/default selection follows from order.

**I6 — Migration or old clients reintroduce the wrong gate. High / plausible
at rollout.** Existing code has no exact new semantics, and old fixed-enum,
label-only or donor-status consumers cannot be deemed compatible through a new
column alone. **Exact clause:** “Before releasing retirement, inventory and qualify
every list/stage reader and writer. Keep assigned references resolvable, enforce
current eligibility at the canonical command and contain obsolete writers; do
not preserve incompatible behavior through dual authoritative stores.” **Proof:**
real source/API/direct-access permissions, generated types, compatible schema
deployment, cache invalidation, retained-data classification, operator rollback
that preserves source history and representative query plans. A rollback cannot
silently reopen a retired list for new work or remove accepted stage changes.
Ordinary list retirement creates no journey/task/ask, communication, financial,
consent, owner or access effects. No actual migrated database, old-client rollout,
P12 fence or performance target was tested here.

## New bounded mechanics evidence

The [probe README](list-retirement-probe/README.md) describes all nine checks,
counterexamples, controlled concurrency, source files and limitations. The
[results](list-retirement-probe/results.json) show **9/9 passed**. The
[run metadata](list-retirement-probe/run-metadata.json) records the pinned image,
input hashes, exact created container, network `none`, no ports/bind mounts/volumes,
tmpfs database, one CPU/256 MiB and verified removal. Actual server PostgreSQL
17.11; Docker 28.4.0. No image pull, Core SQL migration, app credentials, live DB
or provider was involved. Only that exact disposable container was removed.

The fixture functions run as the synthetic owner and revoke PUBLIC execution;
they do not model P12, Supabase Auth/PostgREST, RLS, tenant-resolution, permission
revocation or direct-access enforcement. It has no complete configuration audit
or permanent result receipt. Positive mechanics cases plus two inadequate-design
counterexamples establish feasibility and specific pitfalls, not a working Core
implementation or complete race proof. No current application tests were rerun:
there is no changed product code and prior probes did not cover this new boundary.

Applied repository Supabase guidance and Supabase Postgres best practices.
Current PostgreSQL 17 [row-lock documentation](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)
was retrieved 2026-10-10; it confirms KEY SHARE permits non-key updates and SHARE
conflicts with row updates. Official engine behavior supports the experiment;
the founder/source owners still decide product meaning and qualified authority.

These checks support A with the clauses above and the explicit continued-usability
amendment. They do not settle paused/closed return, applicability, list switching,
defaults, restoration or retention simply by naming fields or functions.

## Consolidated review disposition

The [completed D15 review](../phase27-d15-adversarial-review.md) reconciles this
research into an exact amended decision, including return, reversible
availability with saved-list retention, usable retained catalogs and zero-new-list
treatment. The founder explicitly ratified that decision and its safeguards on
2026-10-10. Earlier proposed labels and reservations here record the evidence-stage
scope, not a competing current recommendation. The full
review defines the owner-native dependency, naming-conflict and release-proof
requirements. No product implementation follows from publication of this appendix.
