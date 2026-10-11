# D24 isolated recorded-membership mechanics

First runtime attempt: **8/8 passed**, 2026-10-10 UTC, 18:25:07–18:25:13.
No failed runtime attempts or reruns. Python AST parsing passed before execution.
This is a synthetic database experiment, not a Core migration or product test.
Only reusable runner/session-isolation helpers were adapted from the previous
lab; these scenarios exercise D24 membership, exclusion and replay semantics.

## Reproducible artifacts

- [setup.sql](setup.sql): synthetic source tables/functions and fixed data.
- [mechanics.py](mechanics.py): assertions and controlled transaction schedules.
- [run-lab.py](run-lab.py): exact disposable Docker execution and cleanup.
- [results.json](results.json): all eight observations, SQLSTATEs, backend waits
  and server version.
- [run-metadata.json](run-metadata.json): source HEAD, exact image/container,
  invocation, input hashes, isolation inspection, stdout/stderr and removal proof.

Run only within the approved isolated lab using:

```sh
python docs/features/donor-development/grill/d24-evidence/membership-probe/run-lab.py
```

Inputs were frozen before the recorded run:

| File         | SHA256                                                             |
| ------------ | ------------------------------------------------------------------ |
| setup.sql    | `b8b34b32c23723f5265cc1b1bd8d7c563d1c82b304655ed4bd79d8b1d59a7ddd` |
| mechanics.py | `5129089deecddd668e59694d6db9ed56aa6f468b5564a04c373fac5a0103b599` |
| run-lab.py   | `7715f8e58ce54b2d713976d17af9e799710952c9e3e276785ae731425a042631` |

## New observations

1. Capturing candidate identities 1/2 with a duplicate gives two recorded members;
   changing the filter to identities 1/3 does not add 3 or remove 2. Direct duplicate
   membership fails scoped uniqueness (`23505`). This contextualizes membership,
   not an additional claim about D4 enrollment capture.
2. An explicit exclusion creates a retained revision-1 identity while no included
   row existed. A bulk add captured at absent revision 0 waits on that transaction,
   then records conflict. It does not revive the entry.
3. Inclusion can commit before an explicit current exclusion. Exclusion waits,
   then records revision 2. Replaying the earlier successful batch returns its
   historic inclusion result while current membership stays excluded. The test
   deliberately provides expected revision 1 to the exclusion; it does not prove
   a real UI can know an uncommitted version or may silently refresh stale intent.
4. One bounded batch records included, unavailable and previously-removed outcomes
   per item. Later restoring eligibility or removing an included member does not
   change the old result, add a formerly unavailable Party or reapply inclusion.
5. A late receipt constraint failure rolls back all proposed membership/history
   writes. The separately accepted finite capture remains for recovery; there is
   no half-accepted membership.
6. Plain Add skips an excluded entry even at its current version. A separate
   explicit Return at that version succeeds and retains history. After a later
   removal, exact Return replay preserves removal; a new command with the stale
   version fails (`40001`, deliberately raised by the fixture guard).
7. Command identity normalizes order and identical duplicate candidates. Changing
   captured identities under the same key conflicts (`23514`); duplicate IDs with
   different observed versions are invalid (`22023`).
8. Concurrent exact batch retry waits, returns the same result and leaves one
   member, one history entry and one receipt.

Cases 2, 3 and 8 have genuine two-session interleavings. Each records exact waiter
and blocker PostgreSQL backend PIDs from `pg_blocking_pids`, rather than assuming
overlap from elapsed time. The other cases are sequential mechanics checks.

## Isolation and limits

PostgreSQL `17.11` on x86_64-pc-linux-musl, GCC Alpine 15.2.0, `read committed`;
Docker `28.4.0`. Image:
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.
Source HEAD: `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

The runner fixes the local Docker socket and removes remote Docker environment
overrides. It creates a uniquely named container with network `none`, no ports,
bind mounts or volumes, 128 MiB tmpfs data, 256 MiB memory and one CPU. The database
trust setting applies only to this disposable network-isolated container. No
project credentials, real database, Supabase project, Core migration or provider
was accessed. Test data arrived through standard input.

Container `phase27-d24-membership-lab-182263`, exact ID
`3a9603949f1399120e7e98007712476bb9636bbc4a9fb5d451d6bc9e7126f64c`, was removed in
the runner's finalizer. Removal exit 0 returned that exact ID; subsequent inspection
exit 1 reported `No such container` for that exact ID. Metadata records both.

The owner runs all functions. They are invoker functions with explicit search path
and PUBLIC execution/table privileges revoked, but there are no real nonowner
sessions, RLS policies, P12 decisions, identity merges or source restriction owners.
The eligibility boolean is synthetic and does not prove any contact permission.
Fixture owner access can mutate historical tables; retaining history through these
commands is not production immutability or lawful-retention proof.

The appeal-level lock deliberately covers absent members for this small model.
It is not a recommendation to lock an entire production appeal for every edit.
Real lock order, grain, deadlock retry and throughput need source qualification.
Integer scope, table/function names, JSON receipt shape, 25-item cap and the
three membership state spellings are illustrative. They do not select a physical
P27 schema, final public API, complete lifecycle or production batch limit.

All per-item domain outcomes commit in one bounded fixture transaction. A stored
unavailable/conflict outcome is terminal for that exact intent; a fresh deliberate
attempt can recheck it under a new intent. Interrupted multi-chunk execution,
transient-failure scheduling, result-disclosure revocation, outbox consumers and
browser/HTTP behavior are untested. No new worker engine is implied. No Request,
journey, task, message, campaign attribution, commitment, money or financial
coverage effect exists in this fixture, so it cannot verify those owners.
