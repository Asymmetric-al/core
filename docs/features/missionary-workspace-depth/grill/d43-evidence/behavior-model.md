# D43 — pending confirmation lifecycle model

Research date: **October 18, 2026**. The founder selected Q43 A: a source-accepted
pending signup may finish after its Page entry is turned Off, before its original
deadline and subject to current newsletter/recipient rules. New intake through
that Off entry is blocked. This new model supports the answer review; it does
not ratify additional policy or demonstrate an implementation.

Files: [new Python model](behavior-model.py) and [results](results.json).
Only this new standalone standard-library program is executed. No older model,
probe, checker or application module is imported or run. The results carry its
source SHA-256 and every bounded scenario trace.

Execution result: **44/44 checks passed**: six expected naive counterexamples and
38 revised cases. The recorded source hash matches the executed new file, and
this note's local links resolve. These are model checks, not application coverage.

## Meaning of the model

An immutable accepted request records exact tenant/newsletter/entry binding,
recipient revision, withdrawal generation, acceptance instant and original
deadline. An entry's visible flag governs new acceptance; it is not consulted
as an additional veto on an already accepted request. Confirmation still checks
the original request, its current source validity and `now < original deadline`.
The original deadline is not a subscription expiration date after admission.

Repeated acceptance of the same immutable operation recovers the same request
and deadline even after entry Off. A previously rejected operation remains
rejected when entry On returns. A fresh human request is distinct and can be
accepted through an eligible entry. The model assumes those identities are
trusted; inventing a new HTTP key is not itself fresh human intent.

Two pending requests can share a current recipient and converge on one active
membership. If the reader withdraws between their confirmations, the other old
pending request cannot reactivate membership. Replaying a previously confirmed
request returns its historical outcome without applying it again. A fresh
eligible request after withdrawal may rejoin. An independently qualified D42
direct Join is represented only as an assumed source event, without implementing
its Auth proof path.

**Off→On has two different cases:** a still-valid accepted request was never
cancelled by entry Off and may finish under A. An expired, withdrawn, superseded
or invalid-scope request does not regain authority merely because entry On
returns. Those statements are compatible; reopening does not reset either kind.

## Counterexamples and finite coverage

The deliberately naive variants expose six expected failures:

1. Requiring current entry visibility strands an eligible pre-Off request.
2. A pending-flag-only rule activates an expired request.
3. The same rule ignores withdrawal.
4. It follows a changed Page target into another purpose instead of preserving
   the request's original purpose.
5. It ignores a closed newsletter purpose.
6. Extending the deadline on resend admits beyond the original deadline.

The revised model enumerates all six serialized orders of acceptance, entry Off
and confirmation. It separately tests confirmation before, exactly at and after
the deadline; lost acceptance responses; repeated intake/resend; accepted valid
and invalid requests across Off→On; two pending requests; current membership;
withdrawal and fresh rejoin; delayed mail and late responses; exact target scope;
purpose/recipient/binding retirement; mutable Page target changes with a still-live
original source binding; an independently authorized alternative entry;
immutable request parameters; inert GET/scanner visits; and the distinction
between proof expiry and membership status.

Delayed mail observation and response arrival have no source mutation. Resend
does not replace the request's deadline; an expired request cannot regain action
authority through resend. The resend operation assumes its separate source
authorization is already satisfied. It does not select an availability policy,
retry count, token rotation, automatic reminder or provider-send behavior.

Every naive check passing means that its **counterexample was found**, not that
the naive algorithm passed a safety test. Revised passing checks establish only
the specified finite traces and assumptions, not exhaustive system correctness.

## Explicit bounds and assumptions

Time uses arbitrary integer ticks with a fixture lifetime of **10 ticks**. This
has no relationship to hours, days, the unadopted D6 numbers or a recommended
duration. The model selects no grace period, resend window or retention limit.

Each source operation is one assumed atomic in-memory step. Serial permutations
model possible linearized histories; they are not threaded or actual database
race tests. The model **does not prove DB/Auth cross-service atomicity**, native
transaction boundaries, trusted clocks, source uniqueness, RLS, privileges,
token integrity, CSRF, delivery or failure recovery. Current authorization and
recipient/purpose rules are supplied predicates, not implementations.

The original operational binding's liveness is separate from the current Page
target or generation. **Confirmation does not require current Page-generation
equality.** Hiding/unpublishing the entry or changing its mutable target cannot
retarget a pending token. The original request can still complete for its
original purpose while its original binding remains source-authorized; source
retirement/deletion of that authoritative binding blocks it. The real owner must
qualify binding survival for each transition. This model supplies that predicate
explicitly and does not claim every Page edit cancels pending requests. New intake
does check the current entry target. Wrong presented confirmation scope is
rejected without consuming the valid original request.

Terminal receipts are retained indefinitely in memory for this experiment,
which is not a retention recommendation. Recovery assumes current access to the
specific receipt. Internal traces may show current membership for assertions;
they are not public copy or permission to reveal arbitrary-address subscription
or suppression state. Late-response UI fencing, cache safety and accessibility
remain separate implementation/UI proof obligations.

Run only the new file:

```sh
python docs/features/missionary-workspace-depth/grill/d43-evidence/behavior-model.py > docs/features/missionary-workspace-depth/grill/d43-evidence/results.json
```

The [Q43 research](../phase28-q43-pending-newsletter-confirmation-research.md)
provides original question context; its unanswered status predates the current
selection. D42 retry/fresh-rejoin boundaries are respected without importing or
executing its earlier model. No application/schema, formal owner text, live
setting, actual message, external account or prior evidence file is changed.
