# D30 — assignment authority, privacy and recovery

2026-10-11 UTC. Review of the amended direction: reviewed existing-relationship
transfers by default, with explicit Tenant opt-in for existing rule-managed
assignments. The older Q30 A/B labels are not authority over this amendment.
Research only; no implementation, live database inspection or runtime tests.
Root/API/database/Supabase instructions and Supabase/Postgres skills were applied.
Likelihoods below are engineering judgments about an unqualified implementation.

**Disposition: accept with required safeguards.** Initial routing, reviewed
transfers and optional automatic transfers must call the same qualified P9
assignment command. Neither automation nor staff responsibility creates access.

## What exists, and what remains intended

- [P9 A12](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:485)
  requires role-qualified staff-to-Party assignment edges, N assignees and ONE
  primary; portfolios derive from active edges. [D5](../phase27-q5-accountability-default.md:182)
  separates the Party representative, partnership lead and Request/task owner.
- [P12](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1556)
  requires current server-owned Active Tenant Assignment context. Its
  [named grants](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1652)
  have explicit survive/die-on-owner-transfer rules. P9 responsibility edges
  are neither those grants nor P21 Support Assignments.
- Bounded API/schema searches found no qualified P9 staff-assignment writer or
  rule-policy relation. The [relationship service](../../../../../packages/api/src/admin/crm/relationships/service.ts:55)
  synthesizes rows from donors, missionaries, profiles, pledges and care
  activities; it fetches tenant rows before in-memory filters/counts. It does not
  implement authoritative assignment edges. No unseen deployment claim follows.
- The [legacy donor schema](../../../../../supabase/migrations/20250101000000_init_schema.sql:62)
  has one `missionary_id` referencing `profiles.id`, with no role or primary-edge
  semantics. More consequentially, current
  [missionary mutations](../../../../../packages/api/src/missionary-portal/donor.ts:149)
  predicate donor edits on that column, tenant and explicit recipient-identity
  opt-in. Reusing it as a staff representative would change an existing access
  predicate, not merely a name on a portfolio.
- [CRM access](../../../../../packages/api/src/crm/auth/access.ts:16) checks broad
  staff roles and permits super-admin tenant exceptions; action is carried in
  actor metadata, not checked as a fine-grained capability here.
  [withOperation](../../../../../packages/api/src/shared/with-operation.ts:142)
  supplies an admin client. These are real current seams, not proof of the P12
  assignment-management authority D30 needs.
- [Auth context](../../../../../packages/auth/context.ts:279) resolves tenant
  from the profile and maps active memberships without retaining membership ID;
  the [current-membership RPC](../../../../../supabase/migrations/20260802041500_current_user_memberships_rpc.sql:22)
  correctly binds rows to `auth.uid()` but returns no exact assignment identity.
  The accepted P12 context must be qualified rather than inferred from this role
  snapshot.

## Material concerns and exact proposed clauses

**A30-01 — Wrong authority or scope. Critical impact; plausible.** A broad CRM
staff check, caller-selected actor or privileged worker can move a protected
relationship across Tenant, role or staff eligibility boundaries. This narrows
the command boundary, not the selected flexibility.

> Derive actor, Tenant, current authorization context and audit attribution at
> the server. Independently authorize policy administration, reviewing/applying
> transfers and receiving the exact responsibility. Revalidate current eligibility
> and scope at commit/execution. Assignment creates no membership, grant, contact
> permission, missionary sharing or finance authority. Use the same qualified
> mutation boundary for UI, bulk, imports, automation and privileged repair.

Preserve any separately qualified P12 assignment-dependent access predicate and
its current reevaluation; “no new grant” does not mean ignoring existing ABAC.
The server derives automatic versus reviewed execution from the exact current
policy and source provenance, never a caller's `automatic: true` assertion.

**Proof:** cross-Tenant Party, assignee and policy IDs; same-Tenant unauthorized
role/scope; forged actor; ended/recreated membership; unauthorized self-assignment;
and service-role replay all fail without partial mutation or existence disclosure.
Receiving responsibility need not imply permission to administer it.

**A30-02 — Collapsing multiple roles or primary ownership. High impact; likely
with the scalar baseline.** Replacing every assignee when changing church-relations
responsibility loses donor/regional colleagues. Independent primary edits can
produce two primaries or detach the primary from its assignment.

> P9 edges remain the sole staff-responsibility authority. A transfer changes
> only the explicitly selected role-qualified assignment and its necessary primary
> consequence; other assignees remain. Enforce P9's one-primary contract over the
> authoritative set, not one invented primary per role. A primary must reference
> a current eligible assignment. An unassigned/no-eligible-owner condition must be
> explicit; do not fabricate an assignee or retain departed access to satisfy
> presentation. Do not write a second portfolio membership or repurpose
> `donors.missionary_id`.

No current implementation proves the primary invariant. Qualify its empty-set
and departure behavior with P9; do not impose “exactly one” on an empty set or
invent a shadow role-slot table to implement the choice.

**Proof:** two staff in different roles, one staff in several roles, transfer of
primary versus secondary, simultaneous primary changes, last eligible departure,
and transfer to an already-present assignee preserve a valid, nonduplicated set.
Do not invent one-assignee-per-role where P9 has not imposed it.

**A30-03 — Automation overriding deliberate decisions. High impact; likely
without explicit provenance.** A null assignee can mean deliberately unassigned;
old queued rules can undo a manual transfer or treat imported unknown history as
rule-managed. This requires guarded eligibility, not a new routing engine.

> Reviewed transfer is the default for existing responsibility. Automatic
> replacement requires current explicit Tenant opt-in for the exact rule/role/scope
> and a current assignment proved to be managed by that rule policy. Deliberate
> assignment, protection and deliberate unassignment survive rule changes until
> explicitly released. Missing provenance is not permission. Store immutable
> rule/policy revision and change basis; recheck the current assignment/protection
> head before applying. Ambiguous matches, unavailable staff or unmet source
> handoff conditions produce a qualified exception, never arbitrary replacement.

**Proof:** rule edit versus manual transfer/unassignment, disabling opt-in versus
queued execution, old rule versus new rule, overlapping rules, retired staff and
unknown legacy provenance. Opt-out prevents later automatic effects; it neither
silently reverses already-committed transfers nor restores old access. A no-op
automatic match creates no transfer/history/notification storm. Deliberately
keeping the same person while taking manual control is a real control mutation:
record the protection change without fabricating an assignee transfer. Test that
later rule changes respect it and that an exact retry creates no second event.

**A30-04 — Lost work or privacy-widening handoff. Critical impact; plausible.**
Moving the Party chip could falsely claim Requests, gifts awaiting finance and
tasks moved too; retaining a departed staff member until handoff completes could
preserve forbidden access.

> Representative change does not transfer partnership leads, Requests, tasks,
> approvals, financial obligations or private context. Each owner accounts for
> affected open work through its existing handoff rules. Revocation denies first;
> unresolved responsibility remains an authorized source-owned recovery condition,
> not an access extension or guessed administrator/missionary inbox. Apply P12's
> explicit owner-dependent grant rule without copying grants to the successor.
> Show committed responsibility separately from unresolved downstream handoff.

[ADR0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:57)
requires current authorization on task lists, counts and actions; assignment
grants no access. Only actual required source work can create a task. Optional
Studio acknowledgment cannot become a universal ceremony, but a qualified owner
requirement cannot be bypassed.

**Proof:** current rep loses access before successor eligibility; another valid
permission path survives; owner-dependent named grant ends; unrelated source duty
remains; failed recipient resolution creates no broadcast; a source-required
acknowledgment remains incomplete until actually accepted.

**A30-05 — Disclosure through previews, counts and stale clients. Critical
impact; plausible.** Territory reasons can expose precise missionary locations;
"affected work" counts can reveal private children. Existing
[relationship query keys](../../../../../packages/database/hooks/admin-crm-relationships.ts:157)
contain filters, not Tenant/principal/authorization revision, and retain previous
data. This does not prove an end-to-end leak, but the hook alone supplies no
context-isolation guarantee. Current
[collections](../../../../../packages/database/collections/tables/people.ts:29)
disable donor realtime pending production qualification.

> Apply current P12 row, field and purpose floors before candidate enumeration,
> counts, ordering, previews, history, exports and dispatch. Explain a transfer
> using permitted reasons only. Context-bound caches and previews must not serve
> previous authority after revocation or context switch; revalidate download and
> action access. Protected history is not public plaintext or permanent private
> notes. Keep actual assignments distinct from suggested changes and partial
> handoff results.

**Proof:** hidden staff/Party/work does not alter unauthorized counts or ordering;
revoked/switching clients cannot receive old previews; exports preserve aliases;
rule reasoning cannot disclose a blocked location. Earlier downloaded copies
cannot honestly be promised recalled.

**A30-06 — Split commits and stale bulk work. High impact; plausible.** Nearby
[note creation](../../../../../packages/api/src/admin/crm/notes/service.ts:224)
persists before separate command logging; logging failure throws after success.
Copying that pattern makes transfers/history diverge and retries misleading.

> Commit the exact assignment-set change, required history, semantic result
> identity and required downstream intent coherently under expected source and
> policy revisions. Recheck authoritative conditions at that boundary. A finite
> reviewed bulk operation records per-item accepted/conflicted/failed outcomes;
> it never silently includes newly matching records. Lost responses and duplicate
> delivery recover the same effect. Retry cannot overwrite a later manual change.

**Proof:** independent DB connections race transfer/primary/protection/revocation;
fail before commit leaves neither change nor history; fail after commit recovers
the same result without another move. A later rule generation cannot be overwritten
by earlier completion. Secondary publication failure remains visible/recoverable
without claiming the source save failed.

## Database and release qualification

The [donor SELECT policy](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:160)
allows broad tenant staff, owner and super-admin reads; it is not a prospective
staff-edge policy. [Membership grants](../../../../../supabase/migrations/20260226113000_authz_memberships_foundation.sql:73)
permit authenticated own-row SELECT and service-role ALL with true `USING` and
`WITH CHECK`. Neither proves D30 mutation safety. No assignment RPC was found in
the bounded current-source search.

Require non-null Tenant identity, tenant-composite references for Party, staff,
role/rule and history, source-defined active-edge uniqueness, and a transactionally
enforced primary invariant. Preserve ended edges and immutable attribution;
deletion must not cascade away lawful history or obligations. Preserve privacy
disposal rules. Plain FKs prove relationship existence, not current eligibility.

Qualify actual SQL grants, effective old-row `USING` and new-row `WITH CHECK`,
upserts, field immutability, views, function execution/search paths, Data API and
service/import/repair paths. A permitted row must not be retargetable into a
forbidden Tenant, subject, role or actor. An omitted UPDATE/ALL `WITH CHECK`
inherits `USING`; absence alone is not a bypass. Permissive policies combine;
service credentials can bypass RLS and still require current source authority.
These semantics follow [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
and [PostgreSQL policies](https://www.postgresql.org/docs/17/sql-createpolicy.html),
checked in this session; Supabase documentation discovery was refreshed today.

Existing [CRM tests](../../../../../tests/unit/packages/api/crm-auth.test.ts:91)
explicitly expect a super-admin exception; relationship tests use an in-memory
query double. They do not prove actual-role SQL, P12 floors or concurrent transfers.
Activation requires those real database/source tests plus context-switch/egress,
mixed-writer migration and production-shaped bounded-query evidence. Legacy rows
must not be labeled automatically managed by inference; old scalar writers cannot
remain competing authority. Rollback must preserve history and restrictions after
new writes. No live qualification or passing runtime result is claimed here.
