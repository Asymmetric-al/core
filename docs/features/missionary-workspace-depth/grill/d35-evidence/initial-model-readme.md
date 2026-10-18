# D35 finite continuation model

The founder selected missionary continuation when the organization permits it,
while independently authorized staff may still act. This model illustrates a
proposed source contract for that choice with **15 counterexample families and
five positive controls**. It is a pure standard-library executable document, not
an implementation, database test, permission grant or ratification artifact.

The model has one synthetic referral, two actors, two possible command paths and
a small number of explicitly ordered events. Each world starts with an ordinary
window at `[0,10)` and authoritative fixture time `20`. The first qualified new
window ends at `30`; a later control explicitly supplies acceptance time `40`
and end `50`. These are arbitrary ordered instants, not dates, a real clock,
elapsed-duration selection or a product retention period. All supplied windows
must be source-qualified and end after acceptance. Their qualification producer
and eventual policy remain unresolved. Absence is also a versioned fixture
basis: a policy appearing after an absence review does not authorize the old
intent. A window that ends while the command waits is no longer usable.

## Inputs and boundaries

`Actor` contains separately supplied current membership, assignment generation,
Tenant/ministry/Entity scope, action grants, response-read authority and ordinary
read authority. No role string authorizes an action. `Source` separately supplies
canonical identity qualification, current source privacy/action floors, ordinary
expiry, readable retention and exact source-qualified action contexts. The
eligible context list is a synthetic owner fact, not a proposed schema, a new
recipient rule or proof of how P9 determines eligibility.

An optional `collision` is a separately source-qualified incompatible active
occurrence, not every same-Party relationship. Its fixture revision fences
reviewed absence as well as presence. Existing and newly introduced conflicts
are rejected without merging either source or pretending the old intent was
accepted. No collision classifier, general edge constraint or reconciliation
algorithm is implemented.

The proposed one organization-wide missionary continuation setting is initially
Off for new/unconfigured organizations. It does not introduce settings per
ministry. Scoped P12 and source gates remain mandatory. Staff use their own
qualified action path; changes to the missionary setting do not invalidate an
otherwise unchanged staff command. Policy changes are supplied qualified owner
events; policy-administration authority itself is not tested.

Each deliberate command captures its reviewed context, authority, source/cycle,
relevant policy and source-window basis. `execute` represents one abstract
serialized acceptance. It checks those facts at that boundary and appends one
attributable cycle while preserving source identity and earlier cycle facts.
These revisions refer to relevant continuation authority/source/terms. The model
does not prescribe rejecting every changed global P12 epoch: the real resolver
must re-evaluate current relevant facts. A control changes only ordinary read
authority after review; continuation still accepts and the subsequent read is
denied. A legitimate later expiry or read restriction can differ from historical
acceptance without indicating source drift.
No SQL, lock, transaction primitive, database representation or actual concurrent
execution is exercised. Both staff-first and missionary-first orders are tested
as separate finite schedules.

## Recovery and honest outcomes

`accepted_effects` is an in-memory illustration of source-owned same-intent
recovery evidence. It is **not** a proposed receipt table, generic command journal,
provider ledger or use of P9 `crm_command_logs`. The real existing source/audit
owner must demonstrate a recoverable, coherent accepted outcome before
activation. The example assumes that source change, attributable audit and
recoverable acceptance agree; it does not test crash-atomic storage.

An unchanged accepted intent returns its historical acceptance receipt under
current safe response authority even if missionary continuation is now Off or
its action grant is gone. Changed payload under that identity conflicts. The
receipt says `accepted_cycle`, never that the source is currently Active. Retry
after that cycle expires recovers the same receipt and cannot open another cycle.
Current disclosure denial leaves the accepted source effect intact.

A returned `rejected` result with `effect: none` is a definite no-effect outcome
for that attempted new admission. It creates no queued work. An old reviewed
intent remains stale after On→Off→On; a fresh deliberate review and new intent
can proceed under current facts. `unknown` describes only a simulated transport
observation: the source may have accepted, or the request may not have arrived.
The examples exercise both cases using same-intent recovery/retry. They do not
simulate a network, impose a new durable rejected-command store or silently turn
unknown into failure.

## Retention, access and side effects

Opening the qualifying minimal-history fixture does not change the referral.
That helper only tests the no-action seam; the full D34 projection remains
outside this model. The positive control starts with no active relation or
active read; an exact qualified action on the expired source can still succeed
without a fake relationship pre-step. Successful continuation can satisfy a present active-
relationship read predicate when current read authority and source privacy also
permit. It never restores a revoked grant, private context or contact consent.

The old personal-data deadline and an already absent old body stay unchanged.
The positive control also carries a distinct source-qualified retention trigger
for the new cycle. Thus the model does not impose a blanket ban on legitimate
new-cycle retention. No actual erasure, hold, restoration or retention producer is
tested. Existing consumed tasks, created tasks, sends and actual-interaction
fixtures remain unchanged; real integrations and fire-time authorization are
not exercised.

## Reproduction

From the repository root, run only this new model:

```sh
python3 docs/features/missionary-workspace-depth/grill/d35-evidence/continuation-counterexamples.py
```

The script writes no files and prints deterministic JSON with its SHA-256,
case IDs, outcomes and assertion count. The checked-in
[result](continuation-counterexamples.json) records the author's first run;
the root agent separately reproduces it. The [analytical review](counterexample-review.md)
records failure scenarios, owner anchors and unresolved production proof.

Passing these finite examples is not exhaustive scheduling, formal verification,
SQL/RLS proof, privacy noninterference, deployed authorization or release
readiness. Grant expiry, real identity transitions, merge and handoff producers,
client late-response handling, actual clocks, transactions, workers, distributed
caches and external effects remain untested. No prior model, probe or verifier
is required or rerun.
