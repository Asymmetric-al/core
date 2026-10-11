# D26 — shared working history: implementation evidence

2026-10-11 Asia/Bangkok; fresh checkout inspection and isolated experiment on
2026-10-10 UTC. HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
Founder chose shared eligible working context with missionary autonomy. This is
research evidence, not a formal owner amendment, product implementation, migration,
live policy audit or activation of a new missionary projection.

## Minimal source recommendation

Qualify one narrow source-owned development context and its current permitted
audience. For newly authored eligible routine context in that source, shared is
the understandable default, not an instruction to widen all CRM notes. Staff and
missionary actions remain governed independently by their current capabilities;
an otherwise authorized missionary does not need to become staff or obtain a
routine staff approval to record the shared update. A policy-widening control is
not a new per-entry managerial approval.

Suggested precise clause:

> A shared-context save identifies the exact qualified source, typed encounter
> reference where applicable, purpose, intended audience and relevant revisions.
> Default sharing applies only after the source and current actor's action and
> disclosure authority are proved. Validate the current old record and proposed
> result; a permitted edit cannot retarget its source/context or broaden audience
> by changing a link. Source invalidation and acceptance have an unambiguous order.
> Accept content, required provenance/history, durable result and any required
> native intent atomically. Retry preserves the accepted business identity but
> rechecks current result-disclosure authority. Later narrowing ends further
> unauthorized disclosure; it does not erase lawful historical acceptance.

No current proof means no shared admission. Offer source-permitted recovery and
preserve only a lawful draft; do not silently choose another audience, label an
unshared save shared, turn it into a Support request or copy it into generic CRM
notes. This does not invent a personal ownership rule, shared-team engine, global
encounter service, automatic classifier or mandatory extra task.

## Current implementation and gaps

- [CRM notes migration](../../../../../supabase/migrations/20260818000000_crm_notes.sql:5)
  stores `standard`/`restricted`, body, optional free-text linked record ID/type/
  label and author. The misleadingly named `linked_type_when_id` constraint at
  23–26 checks only a nonblank ID; it is not a typed same-source encounter FK.
  RLS is enabled and forced at 39–40. Authenticated SELECT/INSERT policies at
  45–79 require staff membership and role-based restricted-note access; there is
  no qualified missionary shared-history projection. `standard` is not permission
  to share beyond that existing source boundary.
- [Notes route](../../../../../packages/api/src/admin/crm/notes/index.ts:15)
  defaults visibility to `standard` at 24. GET/POST use
  [requireCrmAccess](../../../../../packages/api/src/crm/auth/access.ts:22), whose
  current implementation checks staff role membership and tenant at 35–62. Passing
  `crm.note.create` names an action but does not implement the future P12 resolved
  capability/source/field/purpose contract. Do not grant broad staff access to make
  the missionary path work.
- [Creation service](../../../../../packages/api/src/admin/crm/notes/service.ts:170)
  trims caller-provided links and applies the standard default. At 186–187 only
  restricted creation requires admin; no source encounter or audience eligibility
  is resolved there. It inserts the note at 224–228 and separately logs at 256–278.
  That is not atomic shared-source content/history/result acceptance.
- [Idempotent lookup](../../../../../packages/api/src/admin/crm/notes/service.ts:108)
  searches tenant plus request ID. Existing results return at 197–203 and again
  after a uniqueness conflict at 231–244, before any new note-specific current
  disclosure check. This is not a qualified D26 semantic-intent comparison or
  access-revocation-safe historical receipt. These are source-reuse gaps, not a
  claim that this task observed a production disclosure incident.
- [Current list](../../../../../packages/api/src/admin/crm/notes/service.ts:127)
  loads tenant notes, maps them, then filters by role and slices in memory.
  [Model conversion](../../../../../packages/api/src/admin/crm/notes/model.ts:36)
  builds a body preview and treats any nonrestricted visibility as standard at 49. [Restricted-reader logic](../../../../../packages/api/src/admin/crm/notes/model.ts:122)
  uses role names. Neither supplies a fail-closed new shared-source classification.
- The creation [command payload](../../../../../packages/api/src/admin/crm/notes/service.ts:262)
  includes body/title/link details. The
  [generic redactor](../../../../../packages/api/src/crm/commands/log.ts:46) checks
  credential-like key names, then writes `command_payload` at 83. It does not make
  a note body safe for a broadly readable audit or derivative store. D26 must use
  minimal classified business evidence and protected source content rather than
  treating this logger as a permissible shared transcript/archive.
- [CRM cache tags](../../../../../packages/api/src/shared/cache-tags.ts:37) and
  [invalidation helper](../../../../../packages/api/src/shared/cache-tags.ts:97)
  invalidate admin CRM families after note creation. This is not current audience/
  assignment/purpose revocation, a caller-specific cache key, browser cache clearing
  or rejection of a late response after acting-context change.
- [Missionary donor reading](../../../../../packages/api/src/missionary-portal/donors.ts:489)
  currently filters legacy donors by tenant and `missionary_id` and paginates.
  Its [anonymous projection](../../../../../packages/api/src/missionary-portal/donors.ts:383)
  strips notes and activities. Existing donor/activity DTOs and donor-scoped
  filtering are not the qualified P9 Party/encounter/source-sharing contract.
- [Notes unit tests](../../../../../tests/unit/packages/api/crm-notes.test.ts:200)
  cover restricted staff reading, creation and duplicate submission using mocks
  (duplicate case at 303). They were inspected, not run. They provide no actual
  P12, missionary audience, source-revocation or SQL concurrency evidence.

No deployed D26 capability follows from these adjacent sources. The inspected
notes source has no qualified shared-context admission or correction command for
this feature. The new SQL experiment does not patch or invoke those source paths.

## Exact owner constraints

[P9 cross-surface safety](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:901)
currently excludes Party notes/activity from missionary projections, and the
[stop conditions](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:998)
forbid private staff-note leakage and broad CRM browsing. The later
[shared interaction obligation](../../../../prds/program-roadmap/owner-constraints.md:129)
requires one permission-scoped log. D26 needs an explicit bounded owner
reconciliation, not a label change or blanket reversal of P9 safety.

[P3](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md:82)
defaults unclassified fields to invisible outside Mission Control; at 86 audit
uses identifiers rather than rendered sensitive payload; at 94 narrowing and
policy widening have different controls. Those controls concern establishing the
qualified projection, not staff approval of every routine missionary entry.
[P12](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1540)
owns the capability/PDP spine. At 1552 an authenticated missionary is a tenant
human, not public and not necessarily staff. Tenant/action/source/subject/field/
purpose floors still apply. Its [mutation parity](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1390)
requires both existing and resultant rows to remain within scope; RLS is coarse
defense at 1585, not another capability authority.

[P26 encounter ownership](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-b.md:9850)
keeps independent encounters with their owner. The
[typed source-reference rule](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-b.md:9919)
forbids copied bodies and arbitrary polymorphic target JSON. The
[cardinality clarification](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-b.md:10493)
allows several legitimate needs from one encounter; encounter ID alone is not a
universal duplicate-effect key. P26's
[shared task admission](../../../../prds/sitestacker-parity/phase-26-support-hub-requirements-a.md:3625)
also distinguishes permission to read content from permission to release a
minimized brief for another purpose, while preserving one atomic qualified
command at 3645. D26 does not make Support the owner of all interactions.

## Concerns, exact amendments and acceptance evidence

Ratings concern an unqualified implementation, not established deployed bugs.

**I1 — Shared by default becomes shared because scope is missing. Critical /
likely if `standard` or a role name is reused.** **Exact amendment:** “Use default
sharing only within a positively identified, newly authored, eligible source
context and proven intended audience. Missing or unavailable context/source/
classification is not a broader default; private/imported content is not promoted
by changing the view, authoring surface or link.” **Proof:** case 2 rejects absent
context, unqualified context and ineligible source before accepting a qualified
new item. Fixture eligibility booleans do not perform real classification or prove
source-use authority. Missing source qualification is a release gate for this
surface, not a mandate to finish the whole future Missionary Workspace first.

**I2 — An allowed update moves an old record into another audience/context.
Critical / plausible even with RLS.** **Exact amendment:** “Validate both old-row
and proposed-result scope. Routine correction keeps the source/encounter/context
binding fixed; separately governed sharing or topology changes must not be
smuggled through editable linked IDs or audience fields. Enforce equivalent
constraints on server and privileged paths.” **Proof:** case 1 executes as an
actual synthetic nonowner: RLS `USING` and `WITH CHECK` both pass when both contexts
are writable, so retargeting succeeds in the deliberately weak model. Case 2's
qualified command rejects the same retarget despite destination access. This is
why policy expressions alone do not prove origin preservation. No Core RLS bug or
production command parity was tested.

**I3 — Access changes between preview and acceptance. Critical / plausible with
stale tabs, workers or asynchronous saves.** **Exact amendment:** “Current source,
actor, relevant audience and classification checks share the required owner
mutation boundary. Source narrowing/revocation and acceptance have an unambiguous
order; reject incompatible stale work without silently adopting a new audience
or refreshed revision. A previously valid admission remains lawful history.”
**Proof:** cases 3–4 control combined synthetic narrowing versus save in both
orders. Production must integrate its actual current policy/source facts and
relevant revisions; a cosmetic audience-label rename is not automatically a
material policy change. No mandatory snapshot of every collaborator or universal
group engine is selected by the fixture generation number.

**I4 — Retry or cached success leaks a now-protected result. Critical / plausible
with stored note bodies or the current early duplicate return.** **Exact amendment:**
“Before returning a receipt, current content, snippet, identity or source link,
recheck its current permitted disclosure. Historical success cannot grant read
access; denial does not undo acceptance or justify retrying as a new write.
Changed normalized content/source/audience intent under the same identity
conflicts.” **Proof:** cases 4–5 deny read/result recovery after disclosure loss,
but permit historical identity-only recovery where read remains allowed and only
write authority ended. New writes remain denied. This distinguishes current
disclosure from requiring a historical author to retain write permission forever.
Actual result errors and protected identities need nonenumerating owner behavior.

**I5 — Read prechecks or cache invalidation substitute for current egress proof.
Critical / plausible across shared views and acting-context switches.**
**Exact amendment:** “Every source read and derivative egress uses current permitted
source/field/purpose context. Bound caches by that context and relevant source/
policy versions, invalidate or stop further reads after narrowing, and reject
late results in the wrong acting context. Do not reconstruct unavailable source
content from a previous payload or log.” **Proof:** case 7 orders a database read
before narrowing and denies a later read. It establishes database admission order
only: it cannot recall already delivered bytes or prove browser, CDN, HTTP stream,
notification, export, AI/index or client-cache behavior. Those real egress doors
require the existing owners' qualification; neither TTL nor broad cache tags alone
satisfy it.

**I6 — Sensitive context is laundered through the “routine” update or audit.
Critical / plausible with copy/paste, summaries or full-payload logging.**
**Exact amendment:** “A routine label or readable source is not authority to
release protected staff, Support, care, finance or third-party content. Keep the
permitted shared account minimal and source-qualified; attachments and derivatives
retain joint source restrictions. Store required audit identifiers/cause and
governed revision evidence, not an uncontrolled body copy.” **Evidence:** current
note command logs include body while the generic redactor targets credential keys.
**Proof gate:** real private-source, hidden-label/count, export/search/brief,
notification, redaction/retention and error cases. The SQL fixture uses fictional
text and minimal ID/version history, not a content classifier or privacy engine.

**I7 — A shared timeline creates another encounter or universal source service.
High / plausible when generic linked-record fields are extended.** **Exact amendment:**
“Reference the one actual owner encounter by a closed qualified type/identity and
version where available. A development-purpose account can reference that source
without copying its transcript/attachments or transferring editing authority.
When no independent encounter exists, do not fabricate one solely for display.
Preserve legitimate distinct needs from one encounter; deduplicate the same
admission effect by its actual durable identity.” **Proof gate:** exact source
adapter/ref validation, cross-source/scope substitution and owner correction
propagation. The fixture's concrete encounter FK demonstrates a bounded reference;
it does not select a universal encounter registry or final source taxonomy.

**I8 — Content saves without required history or result. High / plausible with
the current insert-then-log pattern.** **Exact amendment:** “One source acceptance
records content, required provenance/history, durable result and necessary native
intent atomically. Exact retry preserves that effect; changed content or audience
identity conflicts. Retained lawfully accepted content does not vanish because a
later audience narrows.” **Proof:** cases 5–6 cover exact intent and a late failure
after history/receipt preparation, then same-intent recovery once. The fixture
retains only current content plus minimal version evidence; it neither defines
the production historical-content policy nor proves immutable-history permissions,
distributed task delivery or migration/restore behavior.

**I9 — Shared participation becomes staff control or a new task/effect trigger.
High / plausible with managerial assignment shortcuts.** **Exact amendment:**
“Missionary autonomy is expressed through qualified current action authority,
without automatic staff-only approval of routine permitted updates. Authorship,
audience membership, work responsibility, supervision and source correction
authority are separate. Sharing alone creates no communication, consent, new
task, last-contact event, stage move, completed work or financial result.”
**Proof gate:** actual missionary/staff/other-context negative and positive paths,
source-owned correction and current task reuse. Completing or exposing a task is
not a review decision or an encounter. Optional Workflow Studio consumes the same
actual source effect identity and cannot be a prerequisite or duplicate producer.

## New experiment and evidence limits

[Sharing probe](sharing-probe/README.md): **7/7 passed on its first runtime
attempt**, with three observed exact-backend lock schedules. Case 1 deliberately
uses a synthetic nonowner role against real PostgreSQL RLS. Cases 2–7 run owner
commands with a fixed fictional actor and synthetic context/access flags. Those
two proof levels are distinct; none is Core's actual P12/RLS or deployed behavior.
All executed input hashes, exact pinned server/image, output and exact container
removal are preserved. No prior probe was rerun; no product or live data changed.

Freshly read 2026-10-10 UTC:
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
documents UPDATE old-row `USING`, result-row `WITH CHECK`, the needed SELECT policy,
view invoker behavior and stale JWT caveats. These support the mechanics but do
not authorize copying fixture ACLs into Core; P12 retains the single business PDP
and RLS stays its qualified coarse defense. Production qualification still needs
real actors, row/field/purpose decisions, source correction/visibility, old writers,
all egress/caches, retention and the exact bounded owner amendment.
