# D29 finite purpose counterexamples

**October 17, 2026 UTC.** This is executable semantic evidence for the D29 answer
review, not an implementation, source-owner amendment or release qualification.
The founder selected additional support without a required one-time need. The
founder also explicitly selected **authorized staff and missionaries when the
organization permits it** for recording/correction. This model uses abstract
qualified current action/scope permissions; role membership alone supplies no
grant. The remaining review amendments are not yet ratified.

[Model](purpose-counterexamples.py) and [deterministic results](purpose-counterexamples.json):
**14 counterexample families, 5 positive controls, 47 passed outcome assertions.**
All identities, money and time values are synthetic. Python's standard library
is the only dependency. No application, database, provider, network or earlier
model was run or changed.

## Reproduce

From the repository root:

```bash
python3 docs/features/missionary-workspace-depth/grill/d29-evidence/purpose-counterexamples.py > /tmp/d29-purpose-counterexamples.json
cmp /tmp/d29-purpose-counterexamples.json docs/features/missionary-workspace-depth/grill/d29-evidence/purpose-counterexamples.json
```

The JSON records the script's SHA-256. A failed outcome raises an exception;
a successful run prints deterministic JSON without modifying any files itself.

## What is compared

| Cases   | Unsafe alternative                                                                                                 | Corrected modeled result                                                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01–B03 | Parse a memo, trust a flag, infer from frequency/absence/size/appeal, or act before money is received.             | Require qualified donor-origin affirmative purpose **and** eligible received money.                                                                                                                                 |
| B04–B05 | Expand an affirmed portion to the whole gift, accept a wrong allocation/currency, or sum currencies.               | Keep exact certified portions and separate currency amounts. No FX or amount threshold is invented.                                                                                                                 |
| B06–B07 | Let old purpose defeat financial contradiction/refund uncertainty, or bypass current actor/scope.                  | Withdraw actual invalidity, hold the uncertain purpose reason for owner resolution, and enforce qualified action/scope. The independently qualified amount reason survives this fixture's purpose-only uncertainty. |
| B08–B09 | Turn evidence IDs, revisions or multiple flags into new members, or reopen handled coverage.                       | Resolve the existing D20 gift/Party/subject/purpose identity. New reasons cannot repeat completed gift-purpose work.                                                                                                |
| B10     | Trust eligibility checked before revocation, source/purpose/survivor correction or criterion change.               | Check current authority and relevant source/purpose/survivor revision facts at the modeled acceptance boundary. Accepted history is retained after later revocation; current disclosure is denied.                  |
| B11     | Treat recent recording, policy revision or historical import as new live support.                                  | Preserve original acquisition/cohort and actual affirmation provenance. Neither new labels nor transport time activates historical work.                                                                            |
| B12     | Finish or retry against the latest group instead of the reviewed members.                                          | New outside members remain pending; selected material changes reject the whole disposition; retries recover the original exact result; changed payload with the same key conflicts.                                 |
| B13     | Reject or rewrite an original additional-portion assertion because a later identified refund reduced that portion. | Preserve the original 25-of-125 assertion against its referenced source revision; separately consume the owner's current positive surviving scope of 15.                                                            |
| B14     | Allocate an unidentified mixed refund proportionally.                                                              | Preserve the original assertion and mark the current reason unavailable until the owner resolves the remaining scope. Known no-survivor evidence withdraws the reason; it is different from uncertainty.            |

Controls demonstrate a small confirmed portion without an appeal or amount rule;
affirmation before receipt waiting for qualified money; a first actual affirmation
later than an originally live cohort receipt; and correction restoring the same
unconsumed reason without an outward effect. The fifth control verifies that an
originally wholly additional gift can retain a qualified positive remaining scope
after an owner-resolved partial refund.

## Governing meaning and assumptions

[D19](../phase28-d19-first-support-follow-up-adversarial-review.md) first-support
qualification and coverage remain distinct. This model does not implement its
history proof. [D20 C03/C06–C11](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md)
supply stable member identity, exact reviewed coverage and correction boundaries.
[D21 C02–C06/C12](../phase28-d21-explicit-gift-follow-up-adversarial-review.md)
reject inferred purpose and preserve financial truth and historical origin.
[D22](../phase28-d22-amount-based-gift-follow-up-adversarial-review.md)
remains an independent amount criterion, with its own captured policy semantics.

The proposed D29 temporal contract is represented explicitly: a purpose assertion
before receipt can wait for the qualified receipt; a first actual later donor
affirmation can qualify an uncovered, originally live D29-enabled cohort gift.
A historical import, preactivation acquisition or retrospective relabeling cannot
manufacture that live origin. Receipt, affirmation and recording dates remain
different. The cohort and those dates are owner-qualified input assumptions; this
model does not prove the real activation-history or occurrence producer.

Original asserted scope and current eligible support are separate facts. The
model bounds the assertion against its referenced source snapshot, preserves it,
and consumes an opaque owner certification of current surviving scope bound to
current source and purpose revisions. Both facts may be shown only under the
fixture's qualified disclosure authority. The corrected path neither calculates
refund allocation nor changes a donor's historical assertion. The explicitly
unsafe B14 alternative alone performs proportional refund arithmetic.

Criterion revision fences stale evaluation and cannot create a second business
effect. It does not propose a new tenant setting, policy switch or financial
threshold. Supporting private prose is not represented or copied into task
projection; actual evidence storage/access remains untested.

## Limits

The dataclasses and sets express obligations; they select no physical schema,
second task ledger, actor role mapping or permission engine. Selected sequential
schedules are not real concurrent execution or exhaustive model checking. Atomic
acceptance, unique membership and durable receipts are assumed owner boundaries,
not proven SQL transactions, RLS, locks, crash recovery or deployed uniqueness.

One canonical direct-support profile and compatible task family are represented.
Actual financial folds, source-issued survivor certifications, partial-refund attribution, recognition/contact routes,
identity aliases, source-issued authority, worker projection, UI review, capacity,
cache eviction, protected-body access and end-to-end behavior are not tested.
D19 completion is not implemented or claimed as proved. Diagnostic results are
synthetic internal observations, not proposed disclosure of hidden records.
The JSON contains the complete limitation list.
