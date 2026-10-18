# D31 finite excess-attribution counterexamples

**October 18, 2026 UTC.** The founder selected **any positive source-confirmed
excess, with no extra minimum amount**. This artifact illustrates the proposed
source attribution amendment and its D20/D21 consumer boundary. It does not
claim that the source producer exists or that the amendment is ratified.

[Model](excess-counterexamples.py) and [deterministic results](excess-counterexamples.json)
contain 14 counterexample families and 5 positive controls. The JSON records
the exact assertion count and script SHA-256. Only this new standard-library
Python model is executed; earlier evidence models and runtime probes are not.

## Reproduce

From the repository root:

```bash
python3 docs/features/missionary-workspace-depth/grill/d31-evidence/excess-counterexamples.py > /tmp/d31-excess-counterexamples.json
cmp /tmp/d31-excess-counterexamples.json docs/features/missionary-workspace-depth/grill/d31-evidence/excess-counterexamples.json
```

The script prints deterministic JSON and writes no files. Assertions raise on
an outcome mismatch. Preserve the serializer's exact output bytes rather than
formatting the generated JSON separately.

## Source contract illustrated

The proposed qualified owner supplies exact source-live money, canonical gift
and portion, Tenant, Legal Entity, ministry subject, Party, currency, original
applicable terms, complete comparison scope and causal prefix. A fixed pledge
uses the full applicable designation-line target set, including eligible future
and undated targets; an open recurring comparison uses its exact occurrence
line. A capped D11 application or an unmatched remainder cannot prove excess.

For exact same-currency minor units, a finite original witness uses
`E = max(B + G - T, 0) - max(B - T, 0)`: `B` is the owner-proved eligible
support in prior **accepted associations**, not prior receipts; `G` is this
exact eligible gift portion, and `T` is its applicable commitment amount.
The owner assigns the causal ordinal at canonical source-association command
acceptance under the typed comparison scope's authority and lock/fence. That
source command's commit order may determine attribution.

A genuine lawful first association for an earlier still-live gift appends its
ordinal at the actual source command; it never backdates to the gift's receipt.
Delayed delivery of an **already accepted** association retains its original
ordinal. D31 worker/replay arrival, UUID order, displayed gift date and
retrospective sorting cannot assign or change the ordinal. Exact scope,
baseline and prefix must share the same original comparison-epoch semantics.
The model receives that accepted association order as a fixture input.

Two gifts of 60 against 100 have original excess 0 and 20 in the illustrated
source association order. A leave-one-out calculation assigns 20 to both and double-counts
the aggregate excess; choosing a different worker order changes which gift
owns the excess. Neither is accepted as source attribution.

Preserve the original proof and separately reprove current surviving excess
over the same original order, scope, terms and epoch with corrected owner
association facts. Current surviving excess cannot exceed original `E`.
Reversing the preceding 60 removes the later gift's 20; restoring that preceding
money can restore the same unconsumed reason. The consumer never redistributes
excess or applies money. An ordinary later term amendment starts a prospective
comparison epoch; it does not rewrite an old certificate or manufacture a new
money occurrence.

The consumer requires current qualified proof and positive surviving excess.
It fences the gift source revision **and the comparison/certificate dependency
revision**, because a predecessor correction can invalidate this gift's proof
without changing this gift's own money revision. Unknown proof is unavailable,
not zero. These are proposed owner obligations, not claims about existing code.

## Cases

| Cases   | Unsafe alternative                                                                                                               | Corrected modeled outcome                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| B01–B02 | Extra minimum; zero/negative, fee cover, floating-point residue, mixed currency or unmatched money treated as excess.            | One eligible minor unit qualifies. Unsupported or nonpositive facts do not.                                            |
| B03–B04 | Subtract one installment from the whole gift, or assign all current pledge overage to that gift.                                 | Compare the exact eligible portion against the complete qualified target; attribute only marginal excess.              |
| B05     | Leave-one-out excess for concurrent gifts, or worker-order attribution.                                                          | The frozen source order yields one attributable 20, not two.                                                           |
| B06–B07 | Current overage after a term reduction or a new historical evidence delivery treated as new qualifying money.                    | Preserve the original money event and terms; genuinely late proof of an eligible original live occurrence may qualify. |
| B08–B10 | Proportional guesses after ambiguous refunds, gift-only revision checks, or cached acceptance permission.                        | Unknown remains unavailable; source, comparison, certificate and authority changes are rechecked at acceptance.        |
| B11–B12 | Positive amount or privileged role bypasses exact scope; each reason/proof revision becomes a new member.                        | Exact financial/Party scope is required; all qualified reasons share one D20 business member.                          |
| B13–B14 | Complete the latest group, absorb arrivals on retry, reopen a covered gift, or disclose a cached reason/result after revocation. | Handle the reviewed gifts, recover the original result under current access, and preserve completed coverage.          |

Controls cover the isolated small gift after prior fulfillment, exact recurring
occurrence excess without donor-stated additionality, original unconsumed
correction/restoration, identified surviving excess without rewriting original
history, distinct equal-amount gifts, and a selected source change requiring
review again.

## Limits

The records are synthetic reasoning variables, not schema proposals, a second
ledger or a service implementation. The source producer's real evidence,
original causal order, comparison completeness, baseline, target-version
transitions, linked recurring/fixed coverage and overlapping comparison scopes
are not implemented or tested. One comparison revision is modeled per world.
No FX, fees, matching, refunds or donor authority is inferred by this model.
In particular, the model does not prove command ordering for a new or delayed
first association, or preservation of an already accepted association's ordinal
on delayed delivery. Its late-evidence case consumes a qualified certificate;
it does not execute the source-association command.

Selected sequential schedules assume serialized boundaries. They prove no
SQL/RLS behavior, database locks, transaction isolation, durable outbox, crash
recovery, database uniqueness or actual concurrent execution. Current
permissions and live-cohort qualification are abstract owner inputs. D20
coverage examples do not implement its full task grouping, responsibility,
purpose-version, Undo or UI contract. No application, database, provider,
network, private data or older model is accessed. Passing this finite model
does not establish producer availability, deployed grants or release readiness.

The owning boundaries are [D21](../phase28-d21-explicit-gift-follow-up-adversarial-review.md),
[D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md), and
[Phase 16 F.1–F.7/M.2–M.3](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md).
D22 whole-gift thresholds, D29 additional-purpose evidence and D30 specific-need
purpose remain independent reasons. D31 adds no new financial application,
interaction, message or amount-setting authority.
