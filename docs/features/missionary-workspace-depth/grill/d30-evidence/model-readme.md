# D30 finite need-purpose and policy counterexamples

**October 18, 2026 UTC.** The founder selected a specific one-time need as a
sufficient purpose independently of additional support. Organization-wide versus
per-need customization remains an unanswered clarification. This artifact tests
one abstract effective policy; it selects neither customization shape nor an
actor grant. Temporal behavior below is the proposed review amendment, not a
claim of ratification or implementation.

[Model](need-policy-counterexamples.py) and [deterministic results](need-policy-counterexamples.json):
**13 counterexample families, 4 positive controls, 38 passed outcome assertions.**
Only this new Python standard-library model ran. No previous model, application,
database, provider, network or private data was accessed.

## Reproduce

From the repository root:

```bash
python3 docs/features/missionary-workspace-depth/grill/d30-evidence/need-policy-counterexamples.py > /tmp/d30-need-policy-counterexamples.json
cmp /tmp/d30-need-policy-counterexamples.json docs/features/missionary-workspace-depth/grill/d30-evidence/need-policy-counterexamples.json
```

The JSON includes the script SHA-256. Assertions raise on a mismatch. The script
prints deterministic results and does not write files itself. The generated JSON
retains the script serializer's exact bytes for comparison; it is intentionally
excluded from Markdown/handwritten-JSON formatting.

## Compared alternatives

| Cases   | Unsafe shortcut                                                                                                               | Corrected modeled outcome                                                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01–B03 | Infer purpose from appeal/default-fund/end-date/payment labels, require additionality, or spread evidence across scope.       | Require exact qualified donor-accepted one-time need terms and positive received scope. Additionality is independent. Need ownership, gift/Party/subject and canonical portion must agree.                                 |
| B04–B06 | Create a member per need/reason, invalidate a gift when its need closes, or classify old acceptance using today's need terms. | One D20 gift-purpose member can carry several exact reasons. Closed/funded status is not financial or purpose invalidity. Captured donor-accepted terms remain authoritative.                                              |
| B07–B08 | Use policy at worker time or re-enable an unadmitted old receipt.                                                             | The original source-live eligible receipt binds an enabled interval. A first later confirmation can admit only within that still-enabled interval; Off-period/history receipts and old unadmitted intervals do not revive. |
| B09–B11 | Cancel accepted work when Off, trust stale prechecks, or start another generation on every save/retry.                        | Off preserves accepted intent. Acceptance rechecks source/purpose/policy/authority. No-op saves/retries preserve the interval; changed payload conflicts; receipt recovery checks current permission.                      |
| B12     | Expose a private need title/count, reuse stale source qualification, or inherit D30 power from D29 confirmation.              | Apply current disclosure and source checks. Use one safe generic label only when that reason itself is permitted. A D29 capability does not supply the separate D30 capability.                                            |
| B13     | Complete the latest group, consume new arrivals on retry, or reopen coverage for another need on the same gift.               | Handle the exact reviewed gift set; keep new gifts pending; recover original coverage and never replay the covered business member.                                                                                        |

Controls cover independent need-purpose admission without money/send effects;
evidence before receipt and first genuine confirmation after receipt; qualified
correction/repair of existing unconsumed reasons while Off; and a genuine new
receipt after re-enable while old unadmitted work remains excluded.

## Exact proposed temporal rule

A newly configured effective policy starts Off. Qualified Turn on starts a
prospective enabled interval. The original owning-source eligible live receipt,
not a provider delivery or accounting date, binds that interval. Purpose may be
recorded before receipt or while Off, but recording alone creates no task.

New admission needs both source-qualified facts and the same interval still On
at authoritative acceptance. Off ordered first stops new admission. Acceptance
ordered first preserves its reason and durable intent; later materialization
and correction are existing work. Re-enable starts another interval, and a no-op
save does not. Old unadmitted or Off-period receipts are not swept into it.

A real source correction can withdraw an affected reason and restore that same
admitted, originally live, still-unhandled reason while Off. Repair cannot admit
never-admitted work or replay completed coverage. Independent D29/amount reasons
retain their own qualification. This is a proposed D30 rule, not an assumption
that D22's policy or D29's activation contract already defines it.

## Ownership and limits

The model consumes opaque qualified need terms, donor acceptance, canonical
portion, original instruction and current surviving support. It computes no
financial allocation, refund, recognition, FX or commitment application. Purpose
acceptance leaves financial fixture facts unchanged. The need's ordinary
Closed/Funded state is distinct from a correction invalidating the captured
terms. No private supporting prose is copied into task evidence.

[D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md) owns
business-member identity and handling. [D29](../phase28-d29-additional-gift-purpose-adversarial-review.md)
remains a separate reason and permission. [D22](../phase28-d22-amount-based-gift-follow-up-adversarial-review.md)
remains a separate amount policy. No additional-support statement, financial
application, interaction or message is inferred from a need-purpose gift.

The records and sets are reasoning variables, not a proposed schema, second
ledger, local permission engine or actual task system. Selected sequential
schedules do not prove concurrent execution, SQL/RLS, locks, durable transactions,
crash recovery, one-current-task uniqueness or production behavior. Actual
financial/need/authorization producers, privacy surfaces, activation history,
retained data and UI behavior remain untested. Reviewed handling models only
selected gift/source versions and benign arrivals; it does not claim the full
D20 purpose, responsibility, authority and Undo contract. The JSON contains all
limitations. Passing this model establishes no deployed grant or release readiness.
