# D23 — review of exact proposed terms: implementation evidence

2026-10-11 Asia/Bangkok; source/probe inspection on 2026-10-10 UTC. Checkout
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. Founder chose built-in review when needed:
routine authorized work proceeds without an extra approval by default; selected
requests can require native review. This is research, not formal specification,
product implementation, migration, live-database work or activation.

## Minimal recommendation

Keep one source request, its relevant business-terms version, a bounded review
round and durable decision evidence/result. A mutable current head can point at
the applicable round; lawful prior terms and decisions remain retained. Reuse P9
shared work for review responsibility and follow-through. Do not infer a general
approval builder, chain, voting/quorum model, mandatory self-review prohibition,
threshold engine or optional Workflow Studio dependency from D23.

Suggested precise clause:

> A required review concerns the exact identified proposed business terms and
> prospective action under the applicable source policy. The accepting source
> validates the current terms, review round and reviewer authority, then records
> one accepted terminal decision, required history/result and native intent
> atomically. A material proposal change requires fresh approval only while the
> effective policy requires review; an unrelated metadata change does not silently
> invalidate it. Before the supported outward action actually starts, revalidate
> current acting authority, relevant
> policy compatibility, exact terms and all communication-owner requirements.
> An old receipt proves the earlier decision, not current permission. Later reviewer
> departure alone neither erases nor retroactively invalidates a valid decision.

Approval, request presentation, response, P16 commitment, P13 received money,
communication eligibility, public release and actual task completion stay separate.
Historical recording of a request already made must remain truthful without
inventing an earlier review or treating later approval as retroactive compliance.

## Fresh current-source inspection and its limits

Current P27 request/review implementation was not found in the inspected API,
database and migrations. Existing contribution approval code is a useful different
owner example, not a ready P27 engine:

- [Correction policy](../../../../../packages/api/src/admin/contribution-operations/approval-policy.ts:57)
  falls back to `separation_of_duties` at line 64. Its capability and self-decision
  checks at 106–130 belong to contribution corrections. D23's ordinary default is
  no extra review; do not copy that fallback, contribution capability, stronger
  categories or reviewer rule into Requests. The later
  [P13 owner contract](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:861)
  also distinguishes finance authority/audit from optional additional SoD. Existing
  code is not authority to override either owner's newer intent.
- [Correction request schema](../../../../../supabase/migrations/20260611120000_contribution_correction_requests.sql:23)
  stores payload/status/expected revision and decision attribution on one mutable
  row. Lines 56–58 add tenant idempotency uniqueness; 67–74 enable RLS, revoke
  browser roles and grant service-role table access. This does not provide P27's
  exact terms/round/policy identity or retained-history permissions. Its cascading
  financial-source deletes are not precedent for destroying P27 decision history.
- [recordDecision](../../../../../packages/api/src/admin/contribution-operations/correction-requests.ts:193)
  uses a tenant/id/pending-status compare-and-set at 214–217. That is a useful
  competing-decision mechanism, not proof of business-version freshness. Repeated
  same-status handling at 315–330 reuses its correction result; it is not P27
  full normalized decision-payload identity or current result-disclosure evidence.
- The same service [applies correction](../../../../../packages/api/src/admin/contribution-operations/correction-requests.ts:432)
  before recording the decision at 476 and appending audit at 492. At 444–450 it
  expressly omits the pre-request `expectedRevision`, because adding request/audit
  metadata itself changes that detail fingerprint. This illustrates why P27 needs
  a relevant business-terms version instead of a generic detail hash. Do not
  transplant `expectedRevision: null`, separate network writes or financial
  apply-on-approval as the P27 solution. This review proposes no unrelated fix and
  does not claim those source lines alone prove a production incident.
- [Existing correction test](../../../../../tests/unit/packages/api/admin/contribution-correction-requests.test.ts:387)
  explicitly expects the null expected revision at 419–429 using stub dependencies.
  It was inspected, not run, and is no database race or P27 proof. Current
  [approval notification RPC](../../../../../supabase/migrations/20260611150000_contribution_approval_notifications.sql:429)
  locks a pending request at 467–473 and writes deduplicated notifications at
  486–504 together with the SLA stamp. Reuse the atomicity lesson; its SLA policy,
  recipients and event identities are contribution-owned.
- [DON-15](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1679)
  consumes required human review and exact proposal approval at 1691–1697. It is
  disabled at 1703 with source-dependent identity/recovery at 1709–1711 and an
  unresolved binding. It neither implements approval nor changes the native owner.
  Completing a shared review task or a Studio node must not become the decision.

## Concerns, exact amendments and acceptance evidence

Ratings concern an unqualified implementation, not an observed P27 defect.

**I1 — “Approved” refers to a mutable record rather than reviewed business terms.
High / likely with a boolean/status field.** A reviewer may have seen USD 100 while
the proposer changes it to USD 1000; a new audit entry should not have the opposite
effect of making unchanged terms stale. **Exact amendment:** “Bind review to a
stable business version or equivalent normalized immutable terms identity, the
intended prospective action and the applicable review round. Distinguish material
terms from incidental metadata; decision/audit/view/task timestamps do not themselves
revise the proposal.” **Proof:** probe cases 1–3 exercise metadata and both terms/
decision orders. Actual classification includes purpose/requested outcome, material
monetary and nonfinancial terms, recipient/represented Party, entity/currency,
conditions, period/cadence and relevant content/artifact versions. A changed note
is not inherently harmless; its domain meaning decides. Approving one artifact
must not authorize a later materially different artifact with the same filename.

**I2 — Two reviewers or retries produce conflicting outcomes and duplicate work.
High / plausible.** **Exact amendment:** “Accept at most one terminal decision for
the exact review round. Preserve its trusted actor, recorded time, terms/policy
identity, permitted rationale and result. A revised/submitted proposal uses its
qualified next round; never overwrite the old decision. Full normalized intent,
not transport UUID or outcome text alone, governs retry.” **Proof:** cases 4–5
exercise concurrent exact replay and distinct competing outcomes. Changed outcome
under the same key conflicts. Real tests must include changed notes/attribution,
role-safe result recovery and any product-selected return/withdraw states. The
fixture's approve/reject pair is not a final state machine, and no quorum is implied.

**I3 — Decision commits without its result/native intent, or approval sends first.
High / plausible with separate service calls.** **Exact amendment:** “One source
transaction accepts the decision, required durable history/result and required
internal effect intent together. External owners consume qualified committed
intents later. Approval alone does not send, present, charge, publish or mark
responses/commitments/received money.” **Proof:** case 6 injects a late internal-event
failure and observes no decision/receipt. Real task/notification acceptance/recovery
must use the existing effect owner and actual purpose identity; no second queue or
task engine is required. An internal review outcome event is not donor contact.

**I4 — A policy/terms precheck is treated as permission at later action start.
High / plausible with queued or delayed work.** **Exact amendment:** “At each
consequential decision and supported action boundary, prove current actor/source
authority and the applicable policy's compatibility with the exact terms. Give
material invalidation and acceptance an unambiguous source order. A queued action
does not inherit eternal permission from review; a later policy change does not
erase completed historical action.” **Proof:** cases 7–8 order a relevant material
policy change against an explicit local marker using shared locks. This is not
P6 send proof. Actual P6/P17 start/dispatch, consent, content and in-flight/uncertain
effect rules still determine the real irreversible boundary. The fixture epoch
denotes a materially relevant compatibility change; no global `updated_at` invalidation
or automatic grandfathering is selected. Cosmetic or unrelated configuration does
not by itself reopen every review.

**I5 — Reviewer departure erases approval, or an old decision grants new powers.
High / plausible.** **Exact amendment:** “A reviewer must be eligible when the new
decision is accepted. Later departure or loss of reviewer permission alone does
not retroactively change that accepted fact or require the person to remain
employed for it to be used. Future action still needs the current presenting actor,
current terms, compatible material policy and all current source/contact permissions.
While effective policy requires review, the terms must remain covered by compatible
approval. Replayed decisions never reapply or reactivate withdrawn authority.”
**Proof:** case 9 preserves historical approval/replay and allows a separately
eligible presenter's compatible action, while blocking the departed reviewer's
new round. Actual P12 is absent from the fixture. Explicit approval withdrawal or
material-policy incompatibility is a different source fact from reviewer departure;
both preserve old history and require current disclosure on read.

**I6 — Unknown policy or no eligible reviewer becomes “no review required.” High /
plausible with empty query fallbacks.** **Exact amendment:** “Distinguish a proved
not-required result, required review and unresolved applicability. A missing,
unreadable or failed policy lookup does not prove review optional. A required
review with no eligible reviewer remains a visible owner-routed exception. Reviewer
lookup failure cannot block work already proved review-not-required. Do not turn
empty reviewer options, stale cached policy or suppressed tasks into approval.”
**Proof:** case 10 exercises the three results without creating fake approvals for
routine work. Actual safe errors must not reveal protected policy or reviewer facts.
The minimal organization default and explicit required-request rule remain owned
by the main D23 decision; this appendix adds no configurable threshold builder.

**I7 — Out-of-scope guardrail for any later monetary applicability rule. High /
plausible only if thresholds are later supported.** The selected finite D23 policy
requires no money comparisons. This is neither a D23 implementation requirement
nor a D23 test requirement; no numerical threshold, automatic rule builder or
universal monetary review gate is selected.

If a later owner decision admits monetary applicability rules, that future scope
must name the amount meaning, currency, Legal Entity and relevant cadence/term/
horizon. It must compare exact compatible minor units without blending currencies/
entities, silently converting FX, annualizing an open-ended request or substituting
expected/received money for requested terms. Unknown must not satisfy a
below-threshold test; nonfinancial not-applicable differs from monetary unknown.
Future acceptance evidence would need boundary equality, 0/2/3/4 currency exponents,
revised terms, recurring per-occurrence versus fixed total, explicit zero versus
unknown, and noncash intentions without forced value. Those are future scope gates,
not work added by D23. D22's money owner and precision/readiness gates remain
authoritative.

**I8 — Task routing or access grants become approval authority. Critical /
plausible if all reviewers can click the same generic control.** **Exact amendment:**
“P27 owns request review; P12 supplies current action and field/history/result
authority. Responsible owner, task assignee, financial reviewer, tenant settings
manager and request presenter are distinct. A task checkbox, role label, configured
recipient or service credential is not a decision or grant. An eligible reviewer
must be able to evaluate the required permitted terms; do not demand blind review
of concealed facts or disclose them merely to unblock work.” **Proof:** actual
nonowner API/RLS/grants, tenant/entity/Party reference substitution, policy change,
reviewer replacement and revocation races. Neither source prototype defaults nor
the synthetic flags prove these. Default correction SoD cannot silently impose
another person on a small-team P27 flow; any real separation rule must be explicit
owner policy.

**I9 — Revision, resubmission and current-head edits rewrite decision history.
High / plausible with one mutable approval row.** **Exact amendment:** “Keep
accepted terms and decision identities durable with source revision ordering,
trusted provenance and applicable retention/disclosure. A current head may change
to show pending, returned, superseded or no-longer-required meaning under the
chosen lifecycle; it cannot mutate earlier accepted decisions or cascade-delete
them. Review-relevant edits cannot evade review by toggling a status or type.”
**Proof:** actual composite request/version/round/decision constraints, mutable-scope
guards, uniqueness, old-writer containment and immutable-history permissions.
The fixture retains rows via its commands but does not stop its owner from editing
them; it is not an immutability or full migration proof. Known harmless metadata
need not create a new review round. Merely editing a draft need not auto-submit it.

**I10 — Enforced review blocks truthful history or grants financial/contact power.
Critical / plausible.** **Exact amendment:** “Review controls supported prospective
actions. Preserve truthful recording of already presented requests/responses with
actual chronology and review-compliance facts; do not backfill approval or suppress
uncomfortable history. Approval does not create consent, a pledge, payment mandate,
source funding, receipt, public publication, reopened partnership or resumed work.”
**Proof:** late/off-platform/imported activity stays recordable without an invented
earlier approval or a new outward effect. P16's deliberate commitment handoff,
P13 effective money and P6/P17 contact/delivery remain independently qualified.
Review reminders target the internal permitted reviewer/work owner; they do not
form a competing pledge reminder or unsolicited donor contact program.

## Current PostgreSQL/Supabase references and new proof

Freshly read 2026-10-10 UTC:

- [PostgreSQL 17 row locking](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS):
  use suitable conflicting locks and consistent ordering for actual owner rows;
  key-share alone does not fence nonkey changes. Real lock order/deadlock handling
  must account for all source commands, not just this fixture.
- [Read committed](https://www.postgresql.org/docs/17/transaction-iso.html#XACT-READ-COMMITTED):
  a waiting locking reader can receive the updated row. Revalidate under the fence;
  a prior browser or worker query does not freeze terms/policy.
- [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): scoped
  uniqueness/FKs support round identity and one accepted decision; they do not
  replace current authority or cross-row semantic checks.
- [Supabase functions](https://supabase.com/docs/guides/database/functions), via
  documentation tool: invoker/definer distinction, controlled search paths, explicit
  execution privileges and exception rollback. No live Supabase project was queried.

The new [review-round probe](review-round-probe/README.md) passed **10/10 first
attempt** on pinned PostgreSQL 17.11 at read committed. It retains three input
hashes, six exact blocking-backend observations, full results, timestamps and
exact container cleanup. Network none, no ports/mounts, tmpfs, no live credentials.
No prior probe was rerun.

This proves only the listed synthetic mechanics. It does not prove P12, RLS,
monetary applicability, real request/round schema, actual communication dispatch,
history immutability, browser/HTTP behavior or production readiness. Synthetic
policy epochs and actor flags are deliberately not production authorization.
The internal event is `review_decided`; the separately invoked action marker is
not a message or evidence the supporter was actually asked. No approval automatically
creates that marker. Source-owner qualification remains a release condition.
