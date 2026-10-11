# D18 — saved list changes: implementation and database evidence

2026-10-10. Fresh checkout/source review at
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Research only; no formal PRD/OpenSpec,
issue, product code, migration, live database or remote mutation. This supports
deliberate same-journey list changes subject to the explicit current-stage gate.
The interview source [Q18](../phase27-q18-changing-saved-list.md:30) reserves how a
recorded stage is handled at lines 38–40 and 64–66. This appendix does not decide it.

## Recommendation and smallest source contract

Accept the ability to deliberately change the approved list for the same ongoing
partnership, preserving identity and truthful history. Require the current-stage
handling contract before releasing the command. That gate does not require a new
approval process, mandatory explanation, mapping system, workflow engine or new
journey. The minimal persistence shape remains one owner-controlled command with
one local authoritative PostgreSQL transaction, adequate scoped constraints,
current source checks, ordered concurrency and a durable accepted result.

Suggested exact clause:

> A deliberate accepted list change updates the same journey's current binding and
> preserves its supporter, identified ministry, continuing purpose, actual scope
> and earlier lawful history. Revalidate the exact target's current new-attachment
> eligibility and the actor's authority; neither a default nor prior attachment
> grants that authority. Bind the submitted operation to exact source intent and
> observed journey revision. Commit its resulting coherent list/stage disposition,
> required history, durable result and any separately required source intent
> atomically. The stage disposition must follow the separately qualified product
> contract; this decision authorizes no implicit clear, label/rank mapping or
> fabricated progress. Recover an old result without applying it again or presenting
> it as current state. Ordinary list change does not rewrite the past or admit a
> second journey.

## Fresh source facts, not implementation inferred from documents

- A fresh `rg` search for `cultivation`, `stage_list`, `stageList`, `journey_id`,
  `journeyId`, `list_change` and `listChange` in `packages/api/src`,
  `packages/database`, `supabase/migrations`, `apps/admin` and `apps/missionary`
  found no matching implementation. This is bounded checkout evidence, not a claim
  about unseen branches or deployment state. [Admin workspace collection](../../../../../packages/database/collections/admin-workspace.ts:10)
  explicitly labels itself local demo; its fixed stage enum at line 35 is not a
  saved P27 catalog binding. There is no real D18 source command here to qualify.
- [Generic table mutation](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts:89)
  directly patches a single table by selected ID. Its optimism at line 127 is not
  an atomic list/stage/history/result contract. Existing backend rules keep compound
  and privileged mutations in `packages/api`; a browser patch of two fields cannot
  become this command merely because an FK accepts the final row.
- [CRM tenant table-default SQL](../../../../../supabase/migrations/20260611160000_crm_table_preferences.sql:182)
  is a useful local compound-mutation example: advisory serialization at line 205,
  row lock at 215, owner-specific capability checks at 225, mutation at 249 and
  before/after audit insertion at 280. Its signature does not carry an expected
  journey revision or a durable switch intent; its presentation-domain scope and
  authorization must not be copied as P27 policy. [Route](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243)
  expressly distinguishes default configuration capability from contribution
  permissions at lines 254–257. Defaults confer no saved-journey edit authority.
- [Donation fee replay SQL](../../../../../supabase/migrations/20261001053404_preserve_donation_saga_fee_replay.sql:58)
  gives a current example of a narrow invoker function: fixed search path at 66,
  row lock at 75, semantic payload comparison before claim at 80–89, and explicit
  function grants at 95–98. It is a different financial owner, not a D18 interface
  or reason to reuse donation effect identities. The analogous
  [integration proof](../../../../../tests/integration/supabase/donation-fee-replay-verification.sql:23)
  checks effective grants and preservation on conflict; it was inspected, not run.
- [CRM preference migration tests](../../../../../tests/unit/supabase/crm-table-preferences-migration.test.ts:85)
  are SQL text assertions, including expected grants and lock/audit strings at
  lines 114–145. They do not prove P27 runtime behavior. Existing note creation uses
  [request ID](../../../../../packages/api/src/admin/crm/notes/service.ts:190)
  for duplicate lookup, inserts at 224, then separately logs at 256; the
  [operation wrapper](../../../../../packages/api/src/shared/with-operation.ts:128)
  creates a new UUID per request. These limited examples do not satisfy stable
  user-intent retry and atomic accepted history for D18. No unrelated fix is proposed.
- Current [CRM loading](../../../../../packages/database/hooks/admin-crm-infinite.ts:192)
  retains previous data and at most eight pages at lines 203–207; its
  [source](../../../../../packages/api/src/admin/crm/service.ts:202) reads limit+1.
  Loaded or filtered choices remain a presentation slice. A missing old list after
  a switch/withdrawal cannot mean the journey disappeared, and a stale response
  cannot replace a more recent accepted source revision.

## Concerns, decision effect, precise amendment and proof

Ratings describe an unqualified implementation risk, not an observed P27 defect.

**I1 — List-only assignment creates an invalid or invented current stage. High /
likely if generic patching is reused.** Q18 lines 64–66 reserve stage handling;
D13's permitted initial absence cannot clear an already saved assessment. Separate
valid list/stage IDs are insufficient membership, and nullable stage can bypass a
single composite FK's required-list check. **Effect:** accept the capability, keep
stage handling a release gate. **Exact amendment:** “Preserve required non-null
source/list keys and exact-list stage membership independently of any permitted
stage absence. Before acceptance, resolve the current-stage disposition under its
qualified product contract and show the intended result; do not infer equivalence
from label, rank or an empty dropdown.” **Proof:** actual command/UI tests for every
selected stage-policy outcome, wrong-list and cross-scope references, null stage
with a valid required parent and malformed missing parents. D14 already exercises
the general composite/null mechanics; no new toy null test was warranted here.

**I2 — A successful patch loses history or leaves an ambiguous partial result.
High / plausible.** D12 R02/R07/R08 already require coherent current/history/result;
the note service demonstrates why separate network writes cannot prove it.
**Exact amendment:** “The owning source accepts current binding, required immutable
change evidence and durable result in one transaction, including any separately
required local intent. Failure before commit accepts none; response/projection
failure after commit preserves the accepted result.” **Proof:** a fault after the
binding and history writes but before receipt, independently observed precommit
state, and recovery after commit/response loss. New probe case 1 passes the local
transaction mechanics. It does not prove remote response loss or a real outbox.
No queue or distributed transaction is needed for the local binding alone.

**I3 — A stale stage writer reverses a switch; A→B→A evades value checks. High /
plausible under ordinary multi-user edits.** Expected old list/stage equality can
match again after intervening accepted changes. A catalog revision alone is not
the journey's revision. **Exact amendment:** “All consequential stage and list
mutations share the journey's qualified source concurrency boundary and check the
observed revision, resolving changed source state without silently rebasing intent.
An unchanged current choice is a semantic no-op after current authorization and
freshness resolution, not a new switch or assessment.” **Proof:** old-stage edit
versus switch in both orders, two list switches, same-value stale requests and
A→B→A. New cases 2, 3 and 6 pass bounded lock/revision mechanics; two simultaneous
switches and same-value no-op are still real-command proof requirements. A local
integer counter is fixture detail, not a mandated public wire format.

**I4 — An already displayed target is withdrawn before acceptance. High /
plausible.** D15 R01/R02 distinguishes continued use from new attachment, including
a return to a formerly used list. An FK only proves identity, not mutable eligibility.
**Exact amendment:** “Give target availability and the actual attachment an
unambiguous accepted order. If withdrawal wins, reject new attachment without
partial change; if attachment wins, later withdrawal retains the current journey.
Do not require an eligible explicit choice to remain usual/sole, or resolve an
omitted target from a current default.” **Proof:** controlled both-order races,
withdrawn historical target, unauthorized target, latest-default changes and all
write doors. New cases 4–5 prove the first schedules with a SHARE target lock; D15's
recorded KEY SHARE counterexample remains relevant and was not repeated. Actual
P12 revocation and catalog-stage eligibility require their own accepting fence.

**I5 — An old receipt overwrites current binding or becomes another effect. High /
plausible with network retry and delayed responses.** D12 R08/R09 already makes
historical result distinct from current state. **Exact amendment:** “A durable
scope-bound intent binds command kind, journey and normalized complete submitted
meaning, including explicit target and the qualified stage disposition. Exact
replay recovers the original currently disclosable result; changed meaning conflicts.
It never reexecutes after later state changes. Reconcile uncertain acceptance before
revising intent; a fresh deliberate later change has its own identity.” **Proof:**
case 6 returns B/revision 2 while current remains A/revision 3 and preserves all
rows. Actual reauthorization/disclosure and client revision ordering remain gates.
No list/stage-pair lifetime uniqueness; a valid later return is a separate accepted
operation, not a duplicate of the earlier visit.

**I6 — Past meaning is recomputed from today's list, or deletion destroys history.
High / plausible.** List names can change; equal labels across lists need not mean
equal stages. **Exact amendment:** “Retain stable prior/target references and
accepted meaning/provenance under the history owner's rules. Ordinary switching
records the current source acceptance, never relabels earlier events, backdates a
process change, erases visits or cascades deletion through accepted history.”
**Proof:** case 7 protects old stage references and captured list meaning across a
rename. Real command/history grants must also prevent ordinary UPDATE/DELETE and
mutable-scope reassignment. Avoid a blanket public full-row snapshot: the fixture's
JSON is convenient mechanics evidence, while production history must minimize
fields, preserve permitted meaning and enforce current disclosure/retention rules.
Historical correction, stage-duration interpretation and reporting denominator
semantics require owner qualification; this ability does not fabricate progress.

**I7 — Switching is used to create another journey or reset owned work. High /
plausible with reuse of admission code.** Q18 holds Party, ministry and purpose
constant; D3 identity is not a list identity. **Exact amendment:** “Change the
existing binding without a new enrollment, source-scope reassignment, purpose
merge, permission grant, financial attribution, task completion or restart of
consumed effects. Existing responsibilities, asks and next work remain under their
owners; source applicability may require explicit permitted reconciliation.”
**Proof:** new case 8 retains all fixture journey identities. It has no financial,
task or communication owners and therefore proves no absence of real external
effects. Actual receiver/source tests must inspect those identities and linked work.
A list event is not a gift, participation response, consent, contact, commitment,
ask fulfillment or a new native workflow occurrence. Do not create a generic
“new journey” outbox event for this mutation.

**I8 — Availability or settings capability becomes unauthorized mutation/history
access. Critical / plausible if privileged RPC is treated as sufficient.** Current
Supabase documentation explains service-role and definer bypass; current source
examples do not provide P27 authority. **Exact amendment:** “Resolve actual source,
actor, capability and current P12 policy from trusted context for mutation and
result/history disclosure separately. Validate the selected target; default use,
list configuration, current ownership and service credentials do not themselves
authorize the change. Qualify effective table/column/function grants, USING and
WITH CHECK, SELECT/RETURNING, views and every privileged writer.” **Proof:** real
nonowner API/DB tests, conflicting permissive grants, actor substitution, revocation
races and protected-target-safe errors. Our owner fixture proves none of these.
Do not expose raw FK exceptions or hidden before/after snapshots as product errors.

**I9 — A broad migration/change framework obscures a small operation. Medium /
plausible.** General capability does not select bulk migration, cross-scope moving,
paused/closed mutation, historical correction or automatic mapping; Q18 lines 90–93
reserves them. **Exact amendment:** “Implement the selected deliberate operation
at the existing owner boundary. Qualify necessary stage handling and mistaken-choice
recovery before release, without adding an unselected bulk engine, custom scope
hierarchy, wizard, approval role or compulsory narrative.” **Proof:** same authorized
operation and result across applicable surfaces, safe old-client containment,
coherent detail/board/history refresh, no hidden default rebinding, bounded queries
and indexed source/history lookups. No full history replay or tenant scan on save.

## PostgreSQL/Supabase primary documentation checked now

Read on 2026-10-10; database mechanics were checked against the executed major
version 17, not assumed from a different current major.

- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK):
  default composite FK matching skips checks when any referencing component is null;
  MATCH FULL instead requires all-or-none absence. Here required tenant/scope/list
  with an optional stage calls for a separate required parent relationship, not
  indiscriminate MATCH FULL on the entire tuple. Foreign keys require a suitable
  unique referenced key. Index referencing lookups appropriately. NO ACTION/RESTRICT
  differ from destructive CASCADE; CHECK is not a supported cross-table invariant.
- [PostgreSQL 17 row locks](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS):
  SHARE conflicts with row updates; KEY SHARE does not block nonkey updates. Agree
  consistent acquisition order across real owner commands, including configuration,
  and handle deadlock/transaction aborts. The fixture is not a global lock-order proof.
- [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html#XACT-READ-COMMITTED):
  read committed takes statement snapshots and a waiting updater/locking reader can
  encounter the updated row. This is why a row lock plus post-wait validation matters;
  a prior HTTP/catalog read does not freeze eligibility. One test run does not prove
  all read-committed interleavings or serializability.
- [Supabase database functions](https://supabase.com/docs/guides/database/functions):
  functions can be called through RPC; prefer invoker where appropriate, qualify
  relations and secure search paths when definer is needed, explicitly restrict
  execution grants, and preserve exception/transaction rollback semantics. The
  service-specific role model still must be selected from the owning contract.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security):
  views and definer execution can bypass policies; service keys may bypass RLS.
  Function presence, frontend validation and RLS enablement are not authorization
  evidence. The current docs were read via the Supabase documentation tool, not a
  live project query.

## New experiment and limits

The [D18 list-change probe](list-change-probe/README.md) passed **8/8 on its first
attempt** using PostgreSQL 17.11 at read committed, in a pinned disposable Docker
container with network none, no ports, mounts or live credentials. Exact input
hashes, observed backend-lock barriers, server/image versions, timestamps and
exact-ID cleanup evidence are in its artifacts. No prior probe was rerun.

The eight cases support I2–I7's local mechanics, not the existence of a P27 command,
authorization, product stage policy, full catalog lifecycle, real owner effects,
database migration, load characteristics, UI/browser behavior or end-to-end release.
The fixture requires a concrete stage only for these experiments; a nullable column
and the absence of a modeled effect table are not product permissions. No saved
history is generally immutable solely because this owner-executed function leaves
it unchanged. Actual all-writer/grants qualification remains necessary.

The [D16 selector](../d16-evidence/source-probe/README.md) and
[D17 defaults](../d17-evidence/source-probe/README.md) remain dated real-primitive
evidence about controlled IDs and initialization, not a saved-list editor. Coordinate
the current/proposed/accepted/uncertain flow with [D18 UX](ux.md); no duplicate
synthetic UI or unrelated root CI run was added for this documentation task.
