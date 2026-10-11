# D25 — gifts awaiting finance: implementation evidence

2026-10-11 Asia/Bangkok; current source and isolated experiment inspected
2026-10-10 UTC. Checkout `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
Founder selected appeal-side tracking of gifts awaiting finance. This appendix
qualifies implementation boundaries; it is not a formal specification, migration,
production implementation, financial mutation or deployment assertion.

## Smallest sufficient source contract

Show the qualified pending handoff and responsibility through the existing intake
owner. Retain a stable source identity so staff resume the same intake rather than
entering the gift again. An accepted source result resolves the corresponding
handoff through exact lineage. Keep reporting, actual custody, responsibility,
intake preparation, source posting, deposit and clearance distinct.

Suggested precise clause:

> P15 owns the handoff/intake evidence and authoritative relationship to the posted
> financial result; P27 consumes the qualified source action/read contract. A
> generic draft, free-text note, amount/date similarity or writable status does not
> prove physical possession or posting. The normal P15 command preserves exact
> intake-to-financial lineage coherently with its accepted result. If a consumer
> fails after source posting, recover that result and repair the handoff projection
> without posting again. Acceptance of the handoff resolution, required linkage,
> history and durable result/native intent is atomic at its source boundary.
> Revalidate relevant source and handoff revisions when accepting a new resolution;
> exact historical retries do not overwrite later corrections or create money.

This does not prescribe one handoff per check, per Party, per batch or per ledger
header. Actual custody/intake cardinality must follow the qualified owner model,
including splits, grouped remittances and duplicate-report reconciliation. The
fixture's two posted references avoid silently assuming one-to-one correspondence;
they do not ratify a generalized many-to-many matching engine.

## Current source: usable lessons and incompatible shortcuts

- [Offline dependency binding](../../../../../packages/api/src/admin/contributions/offline-dependencies.ts:12)
  is intentionally unbound. Both donor resolution and contribution/audit write
  throw the 501 error at 62–66. The
  [route](../../../../../packages/api/src/admin/contributions/offline-route.ts:32)
  checks `finance:manage_contributions`, validates the legacy request and invokes
  that binding. It is not an implemented physical-handoff contract. Its comments
  describe older Track B work; the current [P15 one-front-door contract](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:58)
  supersedes wiring that legacy money path as the target solution.
- [Existing offline orchestration](../../../../../packages/api/src/admin/contributions/offline-entry.ts:86)
  calls injected `recordContributionWithAudit` at 106–124. The dependency promises
  a combined effect but remains unbound. Its
  [row builder](../../../../../packages/api/src/admin/contributions/offline-logic.ts:31)
  targets legacy `donations`, uses `Math.round(input.amount * 100)` and maps a
  `received_date`. These shapes are not a handoff minimum-field policy or current
  exact-currency source contract. In particular, a date field is not evidence of
  an identified person's current custody.
- [Existing staged gift types](../../../../../packages/api/src/giving/staged-gifts.ts:12)
  include `received`, `needs_review`, `ready_to_post`, `posted`, `failed`,
  `refunded`, `voided`. The row at 35–57 references a donation and Stripe facts.
  [Staging](../../../../../packages/api/src/giving/staged-gifts.ts:313) reads or
  creates that review record from an existing donation. This is not P15's future
  pre-commit offline row or a physically-in-hand source.
- [Staged row conversion](../../../../../packages/api/src/giving/staged-gifts.ts:123)
  falls back to amount 0, currency `usd`, donor match `matched` and status
  `received` at 123–158. Those existing defaults must not supply D25 certainty:
  unknown amount, unknown identity, unavailable source and physically received
  cannot be inferred from fallback values. This review does not establish a
  production incident or propose an unrelated change to that reader.
- [Staged-gift PATCH](../../../../../packages/api/src/admin/contributions/staged-gifts.ts:25)
  accepts mutable `received`/review statuses. It updates the head at 150–166,
  separately replaces allocations at 183–187 and then appends review audit at
  203–215. Similarly,
  [finance approval](../../../../../packages/api/src/giving/staged-gifts.ts:477)
  updates `ready_to_post` at 488–502 and appends audit at 506–516. These separate
  calls cannot be cited as D25's atomic source-resolution/history/result proof.
  Initial staging even logs and tolerates audit failure at
  [400–414](../../../../../packages/api/src/giving/staged-gifts.ts:400).
- [Allocation replacement RPC](../../../../../supabase/migrations/20260707220134_atomic_staged_gift_allocation_replace.sql:1)
  rejects absent/non-array/empty input, locks the tenant-scoped staged parent,
  replaces children in one transaction and restricts execution at 61–64. This is
  a bounded atomicity lesson, not a qualified offline handoff resolver or proof of
  all current role, source, revision and exact semantic-intent requirements.
- The older [staging migration](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:64)
  requires `donation_id`, defaults `received`/`matched`/`usd`, and gives
  `donation_id` uniqueness. It cannot represent the desired meaning merely by
  adding another label. Its original vendor-era comment at 132–133 is historical;
  [CRM retirement](../../../../../supabase/migrations/20260818010000_retire_twenty_crm_runtime.sql:39)
  and current source explicitly keep truth in Asym. Never restore retired posting.
  RLS enabled at 405 and service-role grants at 419–421 are not P12 action/field
  authorization or a complete source-scoped-reference proof.
- [Donation saga RPC](../../../../../supabase/migrations/20260820001000_begin_donation_saga_fee_extras.sql:46)
  provides a real transaction/idempotency precedent: a scoped advisory lock and
  prior result lookup, then donation at 113, audit at 133 and outbox at 160.
  Existing replay at 50–62 returns prior IDs; it does not itself demonstrate D25
  full normalized input comparison. Its financial write, default currency and
  provider workflow are not capabilities a handoff consumer may copy.

Fresh searches of API and migration paths found no `gift_entry_batches`,
`gift_entry_batch_rows`, `offline_tender_details` or qualified finance-handoff
implementation. This is bounded checkout evidence, not an assertion about every
possible identifier or deployed environment. The target source remains an
implementation gate, not a reason to create a P27 shadow writer.

## Governing owner contract

[P15](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:58)
has one intake/staging/validation/commit service for staff-entered offline gifts;
quick entry is a batch of one. Deposit grouping at 64 is independently operational.
[commitBatch](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:600)
returns exact posted header identities and preserved carried/pending outcomes,
uses revision-bound semantic idempotency, and forbids a second posting call-site
at 604. That is the normal lineage/result seam D25 must qualify. It is not enough
to bolt an asynchronous “mark received” callback onto a successful-looking UI.

[Staged rows](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1955)
are pre-commit inputs with stable client identity and row sequence. Draft donor
and amount can be unresolved at 1967–1974.
[Tender evidence](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:2000)
distinguishes mailing/postmark/received evidence and receiving staff. Those fields
alone do not define the narrow current physical-report/holder/assignment projection
for D25. P15 must qualify that source seam without requiring the whole future
finance product to ship first.

[P16 Received](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1101)
reads the P13 effective fold. ACH processing is not received at 1105; a successful
handoff is not a second received-money fact. P16's
[fulfillment operation](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:983)
owns exact currency/entity, capacity and conservation. A physical report, intake
association, appeal attribution or completed follow-up grants none of that power.

## Concerns, exact amendments and acceptance evidence

Ratings describe the risk of an unqualified implementation, not observed D25 bugs.

**I1 — A “received” label falsely certifies custody or money. Critical / likely
if current staging fields are reused directly.** **Exact amendment:** “Separate
reported physical receipt with its provenance from current holder, responsible
follow-through person, draft intake, posted effective gift, deposit and clearance.
Never infer one from another, a date, a note or a generic status.” **Effect:**
show qualified awaiting-finance work without promising funding or cleared cash.
**Proof gate:** real source readers and role-safe UI must demonstrate those
meanings; the SQL fixture intentionally assumes qualified source evidence and
does not prove whether a person has a check.

**I2 — Recording an incomplete handoff forces invented donor/value/context.
High / plausible if the complete gift-entry form is required first.**
**Exact amendment:** “Preserve permitted unresolved report details honestly and
route completion through intake. Do not invent a Party, zero amount, currency,
Legal Entity, donation or financial date to save operational follow-through.
Known context remains scoped and source-validated; financial posting waits for
the owner's complete required facts.” **Effect:** a real pending item can remain
actionable without becoming fake money. Qualified report minimums, who may report
versus accept responsibility, and owner-safe repair remain explicit source
acceptance gates. Draft-incomplete permission does not waive posting requirements.
No claim is made that a minimally scoped handoff is already implemented.

**I3 — Similar-looking gifts or generic draft completion resolve the wrong item.
Critical / plausible with amount/name/date matching.** **Exact amendment:**
“Resolve through exact source-owned intake and accepted-result lineage, including
the relevant scope and revisions. Names, amounts, dates, memo text and matching
Party alone can support suggestions, never prove processing or ownership. Resume
the same source item; do not create a new gift just to make a link.” **Proof:**
probe case 1 rejects unconfirmed, wrong-handoff, other-scope, absent, empty and
equal-amount substitute evidence. These negative checks do not replace actual
P15 lineage, P9 identity reconciliation or current P12 authority.

**I4 — One-to-one assumptions lose partial or grouped processing. High / plausible
with a single `donation_id` field.** **Exact amendment:** “Follow the intake
owner's exact item identity and cardinality. Preserve resolved and still-pending
portions and resulting source identities without a second allocation ledger or
double-counting repeated references. A complete result for one source item need
not resolve every physical item from the same Party or appeal.” **Proof:** case 2
accepts an exact set of two owner references and normalizes duplicates. This
demonstrates that the consumer need not assume one reference; it does not choose
a product bundle model, split authority or final handoff/ledger cardinality.

**I5 — Source posting succeeds but failed handoff bookkeeping prompts another
gift entry. Critical / plausible after uncertain response or projection failure.**
**Exact amendment:** “Normal P15 posting and exact lineage/result are coherent at
the source command boundary. Preserve required native intent in the source
transaction where applicable. A later consumer failure repairs the existing
handoff/result projection; it never recreates, reposts or reverses a valid gift.
Expose unresolved reconciliation and an owned recovery using the original source
identity.” **Proof:** case 3 preserves independently seeded financial evidence
through a late consumer failure and recovers the same intent without another
financial write. **Limit:** this is consumer recovery only. The real P15 commit,
lineage, partial batch, outbox, crash and exact result contract remains a required
integration proof; the probe did not post a real gift or test that transaction.

**I6 — Late confirmation overwrites a corrected handoff report. High / plausible
with delayed jobs or stale tabs.** **Exact amendment:** “Accept against the exact
relevant handoff and source business versions. Material report revision and
resolution acceptance have an unambiguous source order. An incompatible late
result cannot overwrite current corrections; preserve the source financial fact
and expose qualified reconciliation rather than treating it as unposted.”
**Proof:** cases 4–5 control both revision/consumption orders. The fixture revises
only a business version; it does not define a withdraw/disappear state, erase
physical responsibility, cancel finance or reopen completed work. Incidental
metadata need not invalidate compatible evidence; production must classify
material changes using the actual source contract.

**I7 — A historical result becomes current permission or ignores financial
correction. High / plausible with cached success.** **Exact amendment:** “An exact
retry returns historical acceptance under current permitted disclosure, without
reapplying it. Changed normalized references/source version/intent under the same
command identity conflict. Current effective money and operational/source
reconciliation are read separately from the historical result.” **Proof:** cases
5–7 preserve old results across report revision, independent source correction
and concurrent duplicate consumption. Refund/NSF/inverse facts do not mean the
original check was never handed over or that staff should enter it again. New
repair actions and any remaining physical obligation stay with the qualified
owner; this proof prescribes no automatic reopen or new task.

**I8 — Nullable references, JSON IDs or privileged roles bypass source binding.
Critical / plausible if the boundary is a raw upsert.** **Exact amendment:**
“Required source/parent keys cannot be null or absent; scoped composite references
and exact owner validation bind any accepted resolution. An incomplete report may
have unknown optional details, but its accepted completion cannot have unknown
authority. Use typed, versioned owner results rather than an unchecked universal
polymorphic registry. Current row/field/action permissions apply to write, read,
result recovery, cache, search, export and links.” **Evidence:** PostgreSQL CHECK
accepts NULL; a default composite FK can skip validation when a component is NULL.
RLS/table grants alone do not establish current business permission, and an owner
session bypasses the proof required of production callers. **Proof gate:** real
nonowner/P12 tests, scope substitution, source revocation, hidden-reference errors,
old-writer containment and retention. The fixture exercises several source guards
but no real RLS or P12 policy.

**I9 — Required local history/result can fail after a visible resolution.
High / plausible with the existing separate audit calls.** **Exact amendment:**
“Commit each accepted resolution, required history, durable result and any
required native effect intent atomically. Exact duplicates converge on one
accepted business effect. Reconcile derived projections independently; do not
declare a failed source command successful merely because a card moved.”
**Proof:** cases 3 and 7 cover late failure and a controlled duplicate race. Actual
immutable-history permissions, producer events, task transitions, broker delivery
and obsolete executor containment are outside the synthetic proof.

**I10 — Handoff visibility creates unnecessary work or expands authority.
High / plausible with generic on-create automation.** **Exact amendment:** “Use
appropriate existing shared follow-through rather than compulsory duplicate
tasks. Responsibility is not physical possession, finance capability or donor
representative authority. Appeal exclusion/removal does not discard held property
or end independently required finance service. Membership, linked pages, task
checkboxes and optional Workflow Studio cannot create a gift, receipt, message,
P16 fulfillment or source identity.” **Proof gate:** actual source/native effect
identity, task reuse, source-owned closure/reassignment and current permission
tests. Restricted or departed actors require lawful owned recovery, not an access
grant or silent disappearance of the pending responsibility.

## New proof and primary references

Freshly read on 2026-10-10 UTC:

- [Supabase database functions](https://supabase.com/docs/guides/database/functions),
  through the documentation tool: execution privilege, invoker/definer semantics,
  controlled search paths and exception rollback. No Supabase project was accessed.
- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html):
  CHECK's NULL behavior and composite-FK null escape require deliberate required
  keys. The current official documentation establishes database semantics, not
  the target application's authorization policy.

The new [handoff probe](handoff-probe/README.md) passed **7/7 on its first runtime
attempt**, including three actual two-session lock schedules. Every case observes
financial state and shows the consumer did not create or mutate it; case 6 includes
one independently injected finance correction whose effective result is preserved.
Pinned PG17.11, read committed, Docker network none, no published ports/bind mounts,
tmpfs data; source HEAD, all three input hashes, complete results and exact container
cleanup are recorded. No previous probe was rerun.

These are owner-only synthetic consumer mechanics. They prove neither P15's normal
posting/lineage integration nor source custody evidence, legal scope, actual P12/RLS,
financial correctness, real retention, UI/HTTP behavior, provider effects or
production performance. The source-confirmation boolean is a fixture assumption,
not a policy or authorization implementation. Physical handling and source posting
must remain independently truthful if consumer reconciliation is delayed.
