# D36 finite temporal counterexamples

This standard-library document illustrates the proposed temporal owner contract
for D36's selected organization-configured renewed period. It has **15
counterexample families and six positive controls**. It is not an application,
schema, SQL/RLS test, clock/concurrency test, deployed permission or ratification
artifact.

The adopted review proposal defines a positive whole elapsed-day count N, where
one day is exactly **86,400 seconds**. The source computes E from the actual
authoritative acceptance instant A after waiting, in UTC, and captures A/E/N and
the relevant policy revision with the cycle. Existing accepted cycles keep those
terms. No numerical product default or supported bound is selected here.

## Inputs and arithmetic

`World` requires an explicit time, supported-range fixture and display-zone
fixture. `TOY_BOUNDS = 1..400` is an intentionally supplied test range. It must not
be copied into product policy or read as an owner decision. The configured-period
fixtures also choose small numbers for particular examples; none is a default.
Actual supported finite bounds and numeric transport/type handling remain owner
qualification work.

`checked_end` accepts only a positive built-in integer in the fixture range,
normalizes the aware instant to UTC, adds N × 86,400 seconds and independently
checks timestamp representability and a positive resulting interval. The
overflow example uses an otherwise range-valid one-day period near Python's
maximum year. This tests Python's representable domain, not PostgreSQL or the
eventual application's timestamp, integer or serialization types. Python has
microsecond precision and no leap-second representation; no leap-second or
production clock-discipline guarantee is claimed.

Selected 2026 `America/New_York` transitions show the difference between one
elapsed day and local calendar-day addition: the unsafe latter can be 23 or 25
elapsed hours. Leap-day and year-end examples preserve time of day in UTC instead
of truncating to a date. The execution environment supplies IANA `zoneinfo`
data. `Europe/London` and `Africa/Abidjan` are additional display-context fixtures;
no production tzdb version or new timezone/locale setting is selected.

## Review witness and actual acceptance

The review contains an illustrative preview time/end plus a narrow explanatory
witness: current canonical display zone and end calendar date. The source
recomputes from actual A at acceptance. It does not demand
exact preview-second equality. B01 and C02 accept ordinary waiting with a new
actual E and the full configured period.

If the displayed end date or zone context changes, the command returns a
terminal changed-terms/no-effect result and needs a fresh deliberate review.
B02 crosses midnight. Ordinary DST offset advance within the same displayed
zone/date is accepted, as C06 demonstrates across two seconds. B04 shows the
unsafe result of combining actual clock time with the preview's stale offset:
the display represents an instant an hour too late. Actual time and its own
offset must be rendered together from the stored endpoint. B04 also changes only
the display-zone context while date/offset match, which requires refreshed terms.
These witness fields explain terms; they are not caller authority to write E. The
`override_end` fixture represents an unsupported malicious extra input, not an
API/schema proposal. No routine modal or per-second confirmation loop is modeled.

Real UI witness generation, context binding, accessibility, localization,
late-response handling and trusted materiality evaluation are unproved. The
finite equality check is a semantic illustration of these chosen inputs, not
an implemented browser-security contract.

## Configuration, cycles and retries

The period policy has a stable revision even when absent. Its configured value
does not itself turn missionary permission On. A real period change, including
changing away and back, invalidates a previous unaccepted policy review. No-op
save preserves the fixture's semantic revision. Initial configuration is fenced
independently from first enablement, including the case where missionary
continuation was already enabled but no usable period existed.

Staff and missionary ordinary Continue use the same qualified period. Staff's
independent action path does not depend on missionary On. Current D35/P12 action,
context, source and result authorization are supplied qualified inputs here;
their producers and complete permission model are not rerun or reimplemented.

Period edits affect future accepted cycles only. C05 shows a new deliberate cycle
using the new N/revision while preserving the older cycle. Same-intent accepted
recovery returns the original A/E/N/revision even after a later edit, Off, action
revocation or another expiry; it does not assert current Active state. Current
result authority can still withhold that receipt without undoing the effect.

`outcomes` is an in-memory illustration of D35's narrow source-owned outcome
evidence, not a table, generic command journal, provider ledger or second state
store proposal. Definite no-effect outcomes reached by qualified source intents
remain terminal; B15 isolates time-only eligibility with unchanged reviewed
display terms. Irreversibly stale reviewed revisions also fence old requests.
Actual crash durability, storage integration and evidence retirement are not
tested. Retirement must preserve a non-replay fence so missing evidence never
makes old intent admissible again. There is no selected retention duration.

The examples assume atomic source/history/outcome acceptance and authoritative
current time. They execute sequential orders only; they prove no real lock wait,
transaction-start clock behavior, source/policy writer ordering, concurrency,
clock skew/rollback, distributed cache or database isolation.

## Read/activity limits and reproduction

Source activity is half-open, A ≤ now < E; at the exact stored end it is inactive
without waiting for a sweeper. Read/activity examples compare immutable stored
facts with an unsafe reset formula. They do not exercise real view/edit/login
hooks, grant expiry, contactability, consent, retention, tasks, sends or provider
behavior. Preserving synthetic old-retention/body/consent fields proves no real
erasure or restoration behavior. This renewed-period decision also does not
choose the initial-referral period.

From the repository root, run only this new model:

```sh
python3 docs/features/missionary-workspace-depth/grill/d36-evidence/temporal-counterexamples.py
```

The script writes no files. It prints deterministic JSON with its SHA-256, case
IDs, outcomes and assertion count. The checked-in [result](temporal-counterexamples.json)
records the author's sole run; the root agent reproduces it separately. The
[analytical review](counterexample-review.md) supplies failure scenarios and
owner anchors. No older model, probe or verifier is required or executed.

Passing these finite examples is not exhaustive scheduling, formal verification,
source qualification, SQL/RLS proof, privacy noninterference or release readiness.
