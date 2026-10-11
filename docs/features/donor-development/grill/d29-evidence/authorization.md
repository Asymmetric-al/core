# D29 — mixed appeal authorization, data integrity and recovery

2026-10-11 UTC. Review of selected A: one coordinated appeal can contain
financial and nonfinancial requests. This is research for the developing spec,
not implementation or a broad security scan. Root/API/database/Supabase guidance
and the Supabase/Postgres skills remain applicable. Current source and migrations
were read again; previous synthetic probes and unit tests were not rerun. No live
database, deployed policy catalog or tenant records were inspected.

**Conclusion:** the mixed scope is viable with the existing source boundaries.
The appeal must coordinate independently meaningful requests, never become a
permission container, shared private diary, money writer or universal status.
The following clauses are exact proposed safeguards for D29; risk likelihoods
are engineering judgments about unqualified implementation, not measured incidents.

## Governing facts and observed implementation

- [D22](../phase27-d22-adversarial-review.md:22) requires independently answerable
  decisions to retain separate responses and distinguishes requested, expected,
  responded, committed and received facts. [D23](../phase27-d23-adversarial-review.md:28)
  binds approval to exact terms and prospective action. An appeal-level edit
  cannot approve or rewrite all its requests.
- [D24](../phase27-d24-adversarial-review.md:206) distinguishes a request merely
  linked to an appeal from solicitation dependent on continued working-list
  inclusion. Removal fences the latter before dispatch admission and preserves
  independent duties. [D25](../phase27-d25-adversarial-review.md:24) keeps reported
  gifts and remaining custody/recording work with P15, and money with P13.
- [D26](../phase27-d26-adversarial-review.md:38) permits newly authored eligible
  shared context, not copying private notes, messages, care, sensitive locations
  or restricted financial facts. Its sharing audience is the qualified
  partnership audience, not everyone who can see its appeal or church.
- [P12](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1619)
  protects sensitive child records and existence, current aliases and all egress,
  including query predicates. [ADR0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24)
  requires an actual source action before task projection; assignment grants no
  access and task views do not own completion.
- Bounded searches for appeals, proposals and partnership requests in
  `packages/api/src`, `packages/database` and migrations found no qualified P27
  mixed-appeal source. The existing
  [Proposal stage](../../../../../packages/database/collections/admin-workspace.ts:10)
  belongs to explicitly local-only demo collections. This is absence within the
  searched checkout, not a statement about an unseen deployment.
- The legacy [campaign schema](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:9)
  has audience-filter JSON, default-zero financial totals, email channel and
  required donor/missionary references. The
  [demo policy migration](../../../../../supabase/migrations/20260216153000_demo_readonly_rls.sql:13)
  includes campaigns in its anon-readable surface. Neither establishes a safe
  private appeal model. Do not add internal mixed-appeal data to that table merely
  because the name sounds similar; complete effective-policy qualification is
  required before any reuse. No production exposure is claimed.
- The [CRM report](../../../../../packages/api/src/admin/crm/reports/service.ts:79)
  selects up to 5,000 completed legacy donations without currency in that select.
  It cannot supply complete entity/currency-aware mixed-appeal outcomes. The
  [CSV endpoint](../../../../../packages/api/src/admin/crm/reports/export.ts:9)
  derives tenant from the actor and checks a report export action, but does not
  establish a D29 child-source or aggregate disclosure contract.
- [CRM note creation](../../../../../packages/api/src/admin/crm/notes/service.ts:256)
  logs body/title after the note has already been persisted; logging failure
  throws. The [logger](../../../../../packages/api/src/crm/commands/log.ts:46)
  removes credential-shaped keys, not prayer content, names or precise locations.
  This is a concrete privacy/partial-success reuse hazard, not evidence that D29
  has already leaked data.

## A29-01 — A shared purpose is not shared authority

**Critical impact; plausible.** A coordinator who can edit the appeal could
otherwise enumerate every church contact, inspect private hosting arrangements,
see restricted money or answer on another ministry's behalf. Cross-tenant IDs
and changed parent links can make an initially allowed row forbidden.

**Required clause:** “Derive actor, tenant and active authorization context at
the server. Independently authorize appeal planning, every linked Request and
response, source financial projection, private context, history and outward
action. Appeal ownership, working-list inclusion and task responsibility SHALL
grant none of those rights. Validate complete same-tenant references and exact
applicable ministry, Party and financial-source scopes before accepting any
association or mutation. Source/tenant/actor identity SHALL NOT be mutable through
ordinary field editing.”

Tenant-wide Party identity need not acquire an invented Legal Entity column;
entity-bearing money and requests retain their source-defined context. Selecting
a contact is not proof of authority to bind the church. Current qualified
representative evidence belongs with the actual request/response, not a guessed
organization-wide permission.

**AC:** foreign appeal/request/Party IDs, same-tenant unauthorized ministry,
coordinator without finance access, missionary with only personal partnership
access, forged recorder, and permitted old row retargeted to forbidden scope all
fail without a partial association or revealing hidden existence. This narrows
implementation, not the selected mixed-purpose scope.

## A29-02 — Preserve independent answers and truthful association

**High impact; likely if implemented as one supporter bucket.** “Yes to prayer,
no to funding, hosting undecided” becomes contradictory if one scalar status
controls the row. A new association or appeal-purpose edit may also rewrite the
meaning of an already-presented invitation.

**Required clause:** “An appeal coordinates existing source Requests and their
actual versions/responses. Independently answerable requests SHALL retain their
own identity, terms, presentation, response and follow-through. Association SHALL
not duplicate a Request, fabricate a response, overwrite earlier terms or create
a financial commitment. Changing the appeal description or supported purposes
SHALL NOT alter earlier presented requests, approvals or outcomes. Correcting
an association preserves qualified history and current source authority.”

Use a non-null tenant-aware key for each association and prevent duplicate
associations for the same exact source reference. Do not infer one-request-per-
person or forbid all multiple appeal references without owner justification.
Cardinality of coordination links must not change cardinality of underlying
business effects. Historical association is not a mutable financial attribution.

**AC:** simultaneous prayer acceptance, funding decline and conditional hosting
remain separately understandable; repeated linking creates no duplicate request;
late response binds the actual terms; concurrent revision/approval/response cannot
approve unseen terms or overwrite newer evidence. A source correction is visible
without rewriting the original record. This supplies the data grain needed by A.

## A29-03 — Keep money and participation in separate units

**Critical financial integrity; plausible.** Joining several requests or appeal
members to one gift multiplies its amount. Hosting/prayer totals could appear as
received gifts, and an Awaiting finance item could prematurely increase funding.

**Required clause:** “Financial results SHALL come from current qualified
P13/P14/P16/P15 projections with their explicit legal-giving, recognition,
commitment, fulfillment or intake meaning. P27 SHALL NOT post, allocate, fulfill,
value or receipt money. A source effect linked more than once SHALL contribute
only according to its owner's conservation and attribution rules. Nonfinancial
responses and actual participation SHALL use their own named meaning and units;
they SHALL NOT become zero-value gifts, money equivalents or a combined success
score. Unknown, not applicable and unavailable are not measured zero.”

Amounts preserve the source currency exponent/exact arithmetic, entity and period;
no float conversion or unlike-currency sum. D25 reported receipt, finance recording
and remaining physical handling stay distinct. P27 can display permitted progress
without full gift/provider details, but that narrower projection needs explicit
source qualification; denial of detail does not automatically authorize its amount.

**AC:** one gift related to several requests/appeals is not multiplied; partial
refund/correction updates the financial view under its owner; prayer yes cannot
fund an ask; mixed currencies never form one unlabeled total; a gift awaiting
finance contributes no received money; no-goal appeal shows no invented zero goal.

## A29-04 — Combined views must not reveal private children

**Critical privacy impact; likely with naive joins or badges.** A prayer note may
contain care information; hosting may expose a worker's exact location. “Three
responses, two visible” or filtering on a hidden amount can reveal denied facts.

**Required clause:** “Apply current source, row, field and purpose floors before
search, counts, filtering, sorting, grouping, previews and export. An appeal
summary SHALL disclose only a qualified aggregate or the exact authorized slice
it names, never a hidden remainder. Preserve permitted aliases and classification
across links, attach/detach, caches, notifications, AI and historical views.
Private content SHALL NOT be copied or summarized into shared context merely
because it concerns the appeal.”

Classify source references themselves. Restriction may hide an entire record;
do not always show a placeholder naming its type or purpose. D26 does not grant
all appeal staff access to missionary updates. Technical traces carry minimal
operation IDs and safe outcome classes; lawful audit/history has its separate
restricted purpose and retention. Recovered results and downloaded exports need
current authority. Prior external copies cannot honestly be promised recalled.

**AC:** adding a hidden hosting request or private gift leaves unauthorized counts,
sort order, filter choices and export unchanged unless the exact aggregate is
separately admitted; revoked/context-switched users receive no stale preview;
source restriction survives detach; sensitive correction removes governed copies
without transferring authorship or retaining public plaintext audit history.

## A29-05 — Purpose changes cannot bypass consent or revive work

**Critical contact safety; plausible.** A blocked fundraising invitation could be
renamed prayer/hosting to continue the same prohibited solicitation. Closing the
appeal could incorrectly cancel handling work or a promised visit.

**Required clause:** “Each outward effect SHALL retain its actual qualified
purpose, recipient and source conditions. Mixed appeal scope SHALL NOT turn a
marketing/solicitation message into a transactional exception or supply consent.
D24 removal/exclusion SHALL fence exactly its dependent future solicitation,
without canceling independent responses, receipts, accepted obligations or P15
handling. Link changes, reopened lists or another contact SHALL NOT bypass a
current restriction or revive an ended source occurrence.”

The [current email evaluator](../../../../../packages/api/src/email/consent.ts:178)
checks global and channel suppressions with a marketing/transactional distinction.
It does not implement appeal exclusion or prove a mixed invitation's purpose.
Use P6/P17's qualified source contract. A message already admitted to transport
or with uncertain external success remains in-flight/unknown until reconciled;
do not label it canceled merely because local planning changed.

**AC:** exclusion races with queued solicitation; relabeled mixed message remains
blocked where the actual purpose is blocked; necessary separately authorized
service response survives; closed appeal retains unresolved physical handling;
late provider success creates no second send or fabricated recall.

## A29-06 — Atomic local truth, recoverable secondary effects

**High impact; plausible.** Source write then failed history/task publication may
look like total failure; retry can duplicate a request or task. Two valid writers
can overwrite different response aspects through a whole-supporter save.

**Required clause:** “For one accepted source action, persist the authoritative
change, required history, immutable result identity and required downstream intent
coherently. Enforce the expected source/policy revision and semantic retry identity
for that exact action and scope. Independent requests MAY succeed independently;
clearly report accepted, failed, conflicted and unresolved outcomes. A retry SHALL
not overwrite a later correction, restore an excluded member or duplicate an
accepted request, response, task or message.”

Reuse owner durable-work mechanisms, not distributed transactions across finance,
communications and P27. Pending projection is distinct from failed source save.
Source-required local validity fences cannot be deferred when deferral would allow
an invalid send. ADR0183 routes real work to current eligible responsibility; no
generic appeal checkbox completes every request. Missing authorization/recipient
is visible source recovery, not a guessed administrator or missionary inbox.

**AC:** fail before commit leaves no partial source/history; fail after commit
returns/checks the same accepted result; lost response and repeated job delivery
create one effect; revision conflict preserves both lawful histories; current
revocation denies a replayed result even if its original action was accepted.

## Database boundary and proof gates

Required references must be non-null and tenant-consistent composite foreign keys;
optional references must not weaken parent identity. Use uniqueness for stable
association identity and source-defined valid combinations, indexed scoped lookup
paths and immutable accepted terms/audit attribution. Do not store authoritative
member counts or duplicate contact/financial snapshots. Delete behavior must not
cascade an appeal removal through Requests, gifts, handling or lawful history.
Privacy disposal remains owner-controlled, not an eternal plaintext archive.

The adjacent [notes migration](../../../../../supabase/migrations/20260818000000_crm_notes.sql:39)
forces RLS, grants authenticated SELECT/INSERT and has distinct SELECT `USING`
and INSERT `WITH CHECK`. Its broad staff/admin predicates and text parent links
do not satisfy D29 source authority. It grants no UPDATE; absence of an UPDATE
policy is not an update bypass. The
[finance deny migration](../../../../../supabase/migrations/20260513173938_add_phase_03_rest_visibility_deny_policies.sql:1)
uses authenticated `FOR ALL USING(false) WITH CHECK(false)`; inspect all grants
and effective policies, since a permissive false policy is not an overriding
denial of a later permissive true policy.

The [allocation RPC](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:22)
locks a tenant-scoped staged gift, replaces allocations atomically and restricts
execution to service role. That demonstrates a useful source seam, not permission
for P27 to call it or proof of complete D29 financial conservation. Its
[test](../../../../../tests/unit/packages/api/admin/contributions/staged-gifts-allocations.test.ts:55)
uses a mock RPC plus SQL-text assertions; it does not execute real roles or races.
Likewise [financial viewer tests](../../../../../tests/unit/packages/api/admin/contribution-viewer-projection.test.ts:98)
prove particular projection behavior, not an appeal-wide safe join.

New D29 relations and commands must qualify actual grants, effective old-row
`USING` and resulting-row `WITH CHECK`, upserts, views, function execution/search
paths, Data API and service-role/import/repair paths. UPDATE/ALL without an explicit
check inherits `USING`; omission alone is not an exploit. RLS does not establish
field immutability or financial authority. Current server P12 checks remain
mandatory for privileged writers and readers. No Storage exposure is added by
linking existing documents; any attachment uses its own current source policy.

Primary verification on 2026-10-11 UTC used
[Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
and the [PostgreSQL policy](https://www.postgresql.org/docs/17/sql-createpolicy.html),
[row-security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and
[constraint](https://www.postgresql.org/docs/17/ddl-constraints.html) semantics
already checked in this session. No DB experiment is substituted for real product
qualification. Run actual-role negative/mutation tests, real source outcome/race
tests, aggregate noninterference and retained-data/mixed-writer migration tests
before activation. A staged feature rollout must preserve lawful history and
current restrictions; restore/rollback cannot revive old recipients, private
content or consumed work. Production-shaped query plans must prove bounded
authorized lists/rollups without N+1 child queries or page-limited totals. No
performance capacity or completed practitioner pilot is claimed here.
