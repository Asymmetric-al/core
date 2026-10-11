# D24 — recorded appeal membership: implementation evidence

2026-10-11 Asia/Bangkok; source inspection and isolated probe on 2026-10-10 UTC.
Checkout `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Founder selected a recorded
working list with deliberate changes. This appendix qualifies that choice; it is
not a formal specification, production schema, migration or deployment claim.

## Smallest sufficient source contract

Keep one scoped appeal/Party membership identity, its current recorded disposition
and retained change history. Included, excluded and removed describe the appeal's
plan; current visibility and contact eligibility remain independent source facts.
Keep a finite, bounded set of accepted Party identities for one deliberate bulk
intent, with observed membership versions and durable per-item outcomes. A filter
is a discovery aid, not a subscription that edits the recorded plan.

Suggested precise clause:

> An accepted membership operation identifies the appeal, exact scoped Party set,
> intended change and relevant observed membership state. The source rechecks each
> item's current authority, identity and eligibility before accepting actionable
> inclusion. It records each accepted membership change with its history and
> durable result atomically. A stale bulk add cannot override later exclusion or
> removal, including an exclusion recorded while no included row existed. Ordinary
> Add skips a previously excluded or removed entry. Return to list is a new,
> explicit, authorized action against the current membership version. Exact retry
> recovers the original result; it never expands the Party set, reruns a live filter
> or reapplies an earlier change over a later membership decision.

No new workflow engine, universal bulk-job subsystem, extra review ceremony,
per-member Request, journey, task, communication or money effect follows merely
from list membership. Suitable existing action/task identity remains reusable.
SQL fixture names, integer scope, batch size 25 and parent-level locking below are
test conveniences, not selected product schema, limits or lock granularity.

## Fresh source inspection

- [CRM named views](../../../../../packages/api/src/admin/crm/table-preferences/named-views.ts:20)
  explicitly describe personal gift-history settings: columns, filters/sort and
  pinned row action, without sharing/publishing/team views. They do not store an
  appeal's accepted Party membership.
- [CRM query parameters](../../../../../packages/api/src/admin/crm/query.ts:1)
  default to 50 rows and cap at 100. The
  [current list service](../../../../../packages/api/src/admin/crm/service.ts:164)
  reads tenant-filtered legacy `donors`, applies filters, ordering and cursor,
  then a limit at 194; the list asks for limit plus one at 207–211. A selected page
  or loaded row model is not evidence of a complete authorized candidate set.
  The [route](../../../../../packages/api/src/admin/crm/index.ts:22) authenticates,
  checks current broad staff roles and passes the tenant; it does not prove future
  P12 Party/field/purpose authorization for an appeal.
- Support Hub's [saved filter shape](../../../../../packages/api/src/admin/support-hub/schemas.ts:138)
  stores view/layout/status/query/labels/assignee. The
  [adapter](../../../../../packages/api/src/admin/support-hub/adapter/supabase.ts:1042)
  persists `filter`, and its
  [table](../../../../../supabase/migrations/20260515025814_support_hub_core_modules.sql:345)
  has scoped view identity and JSON filter. This is another owner's saved query,
  not a captured appeal list. Copying a filter JSON or creating a materialized view
  does not supply deliberate member-change history or protection from resurrection.
- Shared [table header](../../../../../packages/ui/components/shadcn/data-table/data-table-body.tsx:548)
  uses page-row selection; the
  [keyboard handler](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-keyboard.ts:204)
  calls `toggleAllRowsSelected`. Those control paths need product-owned scope
  wording and finite source capture. Neither callback proves that every matching
  authorized Party was loaded. The UX appendix owns the complete selector review.
- The generic [bulk helper](../../../../../apps/admin/features/support-hub/lib/bulk-mutations.ts:8)
  uses `Promise.allSettled` and returns aggregate success/failure plus first error.
  This reports parallel calls; it is not a durable item receipt or atomic source
  mutation proof.
- Support Hub's [bulk move service](../../../../../packages/api/src/admin/support-hub/move-service.ts:324)
  iterates explicit conversation IDs, claims each item and records per-item results.
  At 389–410 it persists the batch after the individual calls. Its
  [retry path](../../../../../packages/api/src/admin/support-hub/move-service.ts:442)
  retries failed IDs, reuses the original reason and merges mutable outcomes.
  At 359–365 a retry already at its destination is treated as moved. These are
  useful evidence that partial results matter, but do not establish D24's exact
  historical receipt versus current membership semantics. In particular, an old
  appeal add must not reinterpret a later exclusion as unfinished add work. This
  audit proposes no unrelated Support Hub fix or claim of a production incident.
- The [bulk-move migration](../../../../../supabase/migrations/20260611184000_support_bulk_move_operations.sql:7)
  has scoped destination/retry references and JSON items, enables RLS and revokes
  browser writes at 43–46. Its table shape, service-role grant and Inngest comment
  are neither a P27 authorization proof nor a requirement for another job engine.
  [Existing unit tests](../../../../../tests/unit/packages/api/support-hub-move-service.test.ts:281)
  exercise partial results and failed-item retry using mocks; inspected, not rerun.

Searches over `packages/api`, `packages/database`, `supabase/migrations` and
`apps/admin` found no implementation identifiers for `donor_development`,
`development_appeal`, `appeal_members`, `appeal_audience`, `appeal_id`,
`supporter_segment` or `crm_segments`. A migration search for `appeal` likewise
found no match. This bounded source absence is not a claim about every deployed
environment or every possible alternate identifier.

## Concerns, exact amendments and acceptance evidence

Ratings describe risk in an unqualified implementation, not observed P27 bugs.

**I1 — A saved filter silently changes accepted membership. High / likely if a
query is reused as the list.** **Exact amendment:** “Persist the finite reviewed
Party identities and selection scope for this deliberate operation. Later filter,
record or saved-view edits never silently add, remove or re-add a member. A later
deliberate add is a new bounded intent.” **Effect:** A 40-Party operation cannot
turn into 45 on retry. **Proof:** probe case 1 changes the matching filter while
the captured membership remains the original two identities. This is a D24
membership check, not a repeat or extension of D4 enrollment proof. Actual paging,
candidate authorization, capture consistency, huge-set limits and readable review
remain source/UI qualification work; there is no need to add a global query engine.

**I2 — Duplicate candidates create duplicate appeal members or work. High /
plausible across overlapping pages/imports.** **Exact amendment:** “Use one scoped
appeal/Party identity and normalize duplicate candidates before mutation. Do not
deduplicate by name, email, address, relationship or household inference. A Party
may participate in distinct appeals; that never duplicates the underlying money
or authorizes duplicate communication.” **Proof:** cases 1 and 7 exercise duplicate
IDs, scoped uniqueness and rejection of conflicting observed versions. Real Party
merge/split or canonicalization must use P9's current identity and preserve source
history/references; a collision cannot silently overwrite an exclusion, multiply
contacts or rewrite earlier attribution. The fixture does not test Party merges.

**I3 — Stale bulk add resurrects an excluded or removed entry. High / likely with
upsert-to-included.** **Exact amendment:** “Keep a membership revision or equivalent
source identity even when excluded/removed; never represent removal solely by
deleting the row. Revalidate the captured head before inclusion. Ordinary Add
skips prior exclusion/removal; an intentional Return to list needs a fresh current
authorized action.” **Proof:** cases 2–3 order absent-to-excluded and add-versus-
exclusion using observed backend locks; case 6 proves that plain add skips and
explicit return retains history. A stale exclusion/return must also fail or be
visibly reconciled; do not silently auto-retry it using a refreshed revision. In
case 3 the test deliberately supplies expected revision 1 for the current exclusion;
this is no claim that the browser can know an uncommitted revision automatically.

**I4 — Transport retries become new population decisions. High / plausible after
an uncertain result.** **Exact amendment:** “An exact command retry returns the
original qualified result without rerunning selection or applying changes again.
Changed identities, intended state or observed revisions under the same semantic
command identity conflict. Historical success is displayed separately from current
membership.” **Proof:** cases 3, 4, 6–8 cover old results after exclusion/removal,
normalized intent conflicts and concurrent exact retry. Current result-disclosure
permission must still be checked; the owner-only fixture does not authorize giving
historical result details to a caller whose access has changed.

**I5 — Partial completion is hidden, or retrying failures overrides newer work.
High / plausible for large bulk operations.** **Exact amendment:** “Expose durable
per-item applied, already-present, skipped/conflicted and safely unavailable
outcomes, plus unresolved operation status if the result is genuinely unknown.
Completed items stay completed. Exact recovery uses the same finite intent and
does not reinterpret a recorded conflict or unavailable result as fresh permission.
A deliberate attempt to include newly eligible or previously conflicted entries
rechecks current state under a new bounded intent.” **Proof:** case 4 preserves
mixed results despite a later eligibility change and removal. The fixture uses one
small transaction with per-item domain outcomes; it does not implement crash-resumed
chunks, transient-failure scheduling or a new worker framework. If bounded chunking
is needed, each accepted item/change and receipt remains atomic, and original
population membership remains fixed across recovery.

**I6 — Membership commits without history/result, or absent rows escape the fence.
High / plausible with separate writes or row locking only existing members.**
**Exact amendment:** “Use one qualified source transaction for membership,
required history and durable result/native intent, including the absent-to-recorded
case. Give competing membership operations an unambiguous order and revalidate
after waiting. Required parent keys and scoped references cannot be bypassed by
nullable composite keys.” **Proof:** case 5 injects a late receipt constraint
failure and leaves no accepted member/history writes; the previously accepted
capture remains. Cases 2–3 and 8 use a coarse appeal fence only to test mechanics.
Production must qualify its own lock grain/order, deadlock handling, nonowner
grants/RLS, immutable-history permissions and old-writer containment. No row-level
security or scale proof follows from these owner sessions.

**I7 — Plan inclusion grants visibility/contact permission or becomes recipient
expansion. Critical / plausible if a campaign send consumes the raw list.**
**Exact amendment:** “Recheck current actor/Party/purpose and restriction sources
for actionable inclusion and every consequential outward action. Retained lawful
history never grants present visibility or contact permission. An organization
Party does not expand to every contact, member or donor. A saved population or
export is not a recipient authorization token.” **Evidence:**
[P27 owner constraints](../../../../prds/program-roadmap/owner-constraints.md:45)
require suppression at appeal inclusion. The probe has only a synthetic current
eligibility boolean; it cannot establish P3/P10/P12 or P6/P17/P32 behavior. Production
tests must use real roles, source restrictions, lawful redaction and current
communication fences, without leaking hidden Party existence through errors/counts.

**I8 — Inclusion/removal rewrites asked, committed or received truth. Critical /
plausible with one audience-derived status or money sum.** **Exact amendment:**
“Plan disposition and actual Request/response/financial facts remain independent.
Removal or exclusion never deletes previous asks, responses, approved terms,
commitments, financial associations or received money. Return does not repeat them.
Report current plan counts separately from historical participation and actual
source-backed outcomes, with incomplete/withheld/unknown coverage explicit.”
**Evidence:** [P13 campaign ownership](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1826)
distinguishes campaigns from appeals and derives campaign sums from exact lines;
[appeal linkage](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:2205)
belongs to P27. Membership does not stamp or rewrite P13 source-code attribution.
[P16 fulfillment](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:964)
separates money/recognition/expectation and conserves effective source capacity in
one owner operation at 983–1003. Appeal overlap is no second allocation. Amounts
remain grouped by their exact Legal Entity/currency; unknown is not zero. The
current P13 report-time-versus-frozen attribution owner seam is not resolved by
this audience decision. No money or communication effect exists in the fixture.

**I9 — Membership creates unnecessary work or bypasses required Request review.
High / plausible with “on add” automations.** **Exact amendment:** “Adding a Party
alone does not start a journey, reopen work, create every possible Request/task,
mark asked or send. Deliberate source actions and real actionable predicates own
those effects; share an appropriate existing task where it already satisfies the
purpose. Required D23 review still concerns the exact prospective Request terms,
not a generic appeal-membership approval.” **Proof gate:** actual source native
effect identity, current permissions and optional Studio replay must converge on
the same effect, without creating duplicate stewardship across surfaces. This is
an inherited integration requirement, not a new task or automation engine.

## Fresh primary documentation and proof limits

Read on 2026-10-10 UTC:

- [Supabase views](https://supabase.com/docs/guides/database/views), retrieved via
  the documentation tool: a normal view executes its query each read; a materialized
  view stores results but refreshes replace that cache. Neither supplies deliberate
  member-change semantics. Views default to owner permission checks; use qualified
  querying-role/security-invoker behavior where appropriate, not assumed RLS.
- [PostgreSQL 17 read committed](https://www.postgresql.org/docs/17/transaction-iso.html#XACT-READ-COMMITTED):
  successive queries can see changed committed data; a query reference is not a
  durable captured population.
- [PostgreSQL 17 row locking](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)
  and [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html):
  scoped uniqueness/references and a suitable mutation fence support identity and
  ordering, not authorization or product semantics by themselves.

The new [membership probe](membership-probe/README.md) passed **8/8 on its first
runtime attempt** with three exact blocking-backend observations. Pinned PG17.11,
read committed, local Docker network none, no ports or bind mounts, tmpfs data;
all three input hashes and exact container removal verified. Existing probe
scenarios were not rerun. This proves only the recorded synthetic membership
mechanics. P27 implementation, real P12/RLS, Party merges, full source eligibility,
multi-chunk crash recovery, browser/HTTP behavior, production performance, money
and external delivery remain outside that proof.
