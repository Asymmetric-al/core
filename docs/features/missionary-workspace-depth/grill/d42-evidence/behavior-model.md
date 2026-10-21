# D42 — bounded Join intent counterexamples

Research date: **October 18, 2026, Asia/Bangkok**. This new standalone model
supports the selected Q42 B answer review. It is research evidence, not an
application implementation, formal owner amendment or readiness claim.
Only [behavior-model.py](behavior-model.py) is executed; it imports Python's
standard library only. No older model, checker, probe or application module is
executed or imported. [Results](behavior-model-results.json) include the exact
new source file's SHA-256 and every scenario trace.

The [current owner reconciliation](owner-reconciliation.md), especially
OR01–OR04, supplies the reviewed intent: deliberate newsletter-specific Join,
qualified current same-address evidence, stronger current restrictions and safe
retry. The [original Q42 question](../phase28-q42-newsletter-confirmation-research.md)
is historical framing; B is now selected. No untouched D6 amendment is ratified
by this experiment.

## What is modeled

One exact tenant/newsletter/address has inactive/active state, an abstract
withdrawal-generation barrier and an admission-effect count. A separately
identified human Join carries the reviewed purpose, address, generation and
Auth evidence. A transport request key is not a human action. Accepted and
terminal rejected outcomes are retained against immutable intent parameters.
Withdrawal increments the barrier; a new admission does not. Independent tabs
can therefore converge on one active membership without making each other a new
admission. This is one possible behavioral representation, not a database schema.

An accepted retry returns its historical result without applying it again. Its
trace separately shows current membership, so “that Join was accepted” does not
mean “you are subscribed now” after a later withdrawal. An unsubmitted old intent
is also fenced by the withdrawal generation. A deliberately new Join after
withdrawal uses current evidence and can join again unless stronger restrictions
apply. Opening a preview alone is not Join intent.

The model supplies current proof/account/address revisions and restrictions at
the commit operation. It conservatively refuses a previously reviewed proof
snapshot if those revisions changed, including an email address changing away
and back. This demonstrates the danger of relying on the old snapshot. It does
**not** require another user-facing confirmation when an implementation can
qualify current evidence for the same reviewed action without changing its
meaning. A guest, different address or unqualified proof selects the ordinary
confirmation branch; the model does not send or complete that confirmation.

## Counterexamples and coverage

- **Forever deduplicating by address** prevents a valid deliberate rejoin after
  withdrawal. A historical success cannot permanently consume future consent.
- **Deduplicating only by transport key** lets a delayed retry obtain another key
  and revive the withdrawn membership using old human intent. This is a flaw in
  that deliberately naive model, not a claim that every idempotency-key system
  behaves this way.
- **Checking proof only at preview** admits after proof revocation. The model's
  revised operation checks current evidence before its state transition.

The revised scenarios include old accepted and unsubmitted intents, changed
transport keys, legitimate rejoin, two independently submitted tabs, all six
serialized permutations of two tab submissions and a withdrawal, proof changes,
account/email revision changes, address ABA, sign-out/account switch, guest and
different-address fallback, stronger current restrictions, tenant proof-reuse
Off/On, unavailable policy, wrong tenant, altered intent payload and current
reader checks before receipt recovery. Off leaves existing accepted membership
unchanged. A terminal rejected immediate-Join intent does not activate merely
because a later restriction or setting changes; a fresh eligible human action is
distinct. Signing in does not upgrade an old guest request; a fresh deliberate
Join with newly qualified current evidence is not permanently blocked. A
qualified different destination requires its own source state outside this
one-address fixture rather than modifying the fixture's existing membership.

The JSON's passing naive checks mean their **counterexamples were found**, not
that those algorithms are safe. Passing revised checks mean only that the stated
finite traces satisfy this model's assertions. There is no exhaustive search of
all possible system states or actual concurrent database execution.

## Execution and limits

The new model executed successfully: **35/35 checks passed**, comprising three
expected naive counterexamples and 32 revised cases. The recorded source hash
matches the executed file; the note's local links resolve. These counts describe
only this bounded experiment, not application test coverage.

Run only the new file:

```sh
python docs/features/missionary-workspace-depth/grill/d42-evidence/behavior-model.py > docs/features/missionary-workspace-depth/grill/d42-evidence/behavior-model-results.json
```

The in-memory `commit` is deliberately one atomic abstract operation. **It does
not prove that a Supabase Auth validation and a newsletter-source database write
can be serialized together.** A real implementation still must establish the
qualified proof contract, authoritative revisions/transition fences, source
transaction and uniqueness, actual privileges/RLS, cookie/CSRF handling, immutable
intent binding, current disclosure, crash recovery and bounded durable retention.
Sequential permutations stand for possible linearized orders only; they are
not threaded or multi-process race tests. Receipts are retained without limit in
this small model, not a recommendation for production retention.

The model assumes trusted intent issuance and an actual human action. A script
cannot establish that a fresh key means a fresh human decision. It also assumes
authoritative current restrictions instead of implementing the suppression
resolver. Trace fields are internal research diagnostics, not a proposed public
response or permission to expose arbitrary-address membership. Exact string
equality is a fixture, not a new international-email normalization rule.

No confirmation lifetime, pending-after-Page-Off policy, email transmission,
delivery, donor/Party claim, workforce membership or protected reading grant is
created or tested. The result is a useful counterexample/review aid whose
production obligations remain explicit.
