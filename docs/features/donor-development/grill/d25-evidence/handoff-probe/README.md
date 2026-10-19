# D25 isolated source-confirmed handoff recovery

First runtime attempt: **7/7 passed**, 2026-10-10 UTC, 18:51:57–18:52:04.
Python AST parsing passed before execution. No failed runtime attempts or reruns.
This experiment tests recovery by a handoff consumer against independently
existing financial/source facts. It does **not** test P15's real posting command,
commit-to-lineage atomicity, physical custody or production authorization.

## Artifacts and provenance

- [setup.sql](setup.sql): synthetic source/consumer schema and fixed data.
- [mechanics.py](mechanics.py): assertions and controlled transaction schedules.
- [run-lab.py](run-lab.py): isolated local Docker runner and exact cleanup.
- [results.json](results.json): seven cases, actual SQLSTATEs, backend waits and
  PostgreSQL version.
- [run-metadata.json](run-metadata.json): source HEAD, image/container identities,
  invocation, input hashes, isolation inspection, stdout/stderr and removal proof.

```sh
python docs/features/donor-development/grill/d25-evidence/handoff-probe/run-lab.py
```

Inputs frozen before the recorded execution:

| File         | SHA256                                                             |
| ------------ | ------------------------------------------------------------------ |
| setup.sql    | `62d581d1c296c289b36b9bc1185cbfda959515daba3c65a1e06c022acdf87fdd` |
| mechanics.py | `dc23f74e2b07a28d279f65494cdb68debfa614790daa1dab6524ad9b5ebdf2fe` |
| run-lab.py   | `9cb5c119ff4ffb77e6b8e72adb9eb31fc6af0cd00089367dc4b6c7444e4f59a4` |

Source HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
PostgreSQL `17.11` on x86_64-pc-linux-musl, GCC Alpine 15.2.0, read committed;
Docker `28.4.0`. Image:
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

## What was tested

1. Source confirmation is required and must identify the exact handoff/scope and
   nonempty posted-reference set. Draft/unconfirmed, another handoff, a reference
   existing only in another scope, NULL source, empty claimed/source sets and an
   equal-amount substitute all fail without changing consumer or finance state.
   Multiple negative inputs form one invariant case, not seven inflated tests.
2. The exact owner set `[11,12]` attaches one resolution/history/result; reordered
   duplicate input normalizes to that set. Financial rows remain byte-equivalent
   in the observed state. Two references demonstrate no implicit single-reference
   assumption; they do not select business cardinality or split authority.
3. A session-scoped fixture fault after writing the result raises `23514`, rolling
   back the consumer's local writes. Independently posted evidence remains. An
   exact same-key retry in a new session succeeds without posting again.
4. A material handoff revision holds the head lock first. Waiting old confirmation
   consumption then fails the version guard (`40001`), preserving both the revised
   report and financial facts. This SQLSTATE is explicitly raised by the fixture;
   it is not a SERIALIZABLE transaction conflict.
5. Confirmation consumption can win first; material report revision waits and then
   advances the head. Historical resolution remains at its accepted version.
   Replay returns its old receipt without rewriting the newer head, and a new
   request trying to apply old source proof to the new head is rejected.
6. An independently injected finance adjustment and source-confirmation correction
   change current source facts after resolution. Historical replay remains the
   original result, leaves the corrected finance state untouched and does not
   reapply. A changed posted-reference payload under the same key conflicts.
7. Concurrent exact duplicate consumption produces one resolution, one history
   event and one result, with no additional financial writes.

Cases 4, 5 and 7 use genuine separate PostgreSQL sessions. Each records exact
blocker/waiter backend PIDs from `pg_blocking_pids`; overlap is observed, not
assumed from timing. Other cases are sequential. Financial state is checked in
every case. The consumer functions contain no finance insert/update/delete.

## Isolation and cleanup

The runner pins the local Docker socket and removes remote Docker environment
overrides. Network `none`, no ports/bind mounts/volumes, 128 MiB tmpfs data, 256 MiB
memory and one CPU. The trust setting is confined to this disposable isolated
container. No live database, Supabase project, project credentials, Core migration
or provider was accessed. SQL enters through standard input.

Container `phase27-d25-handoff-lab-190020`, exact ID
`77e3d3c451fd5604e90d70398fa08a19add81d9e09091f87552bcd437d93f5da`, was removed in
the runner finalizer. Removal exit 0 returned that exact ID; subsequent inspection
exit 1 reported `No such container` for the same ID. Metadata retains both.

## Explicit limits

This is a synthetic **consumer recovery** experiment. Source financial rows and
confirmations are independently seeded; case 6 changes finance from the fixture
owner. No actual P15 commit occurs. Normal production posting must create its own
coherent accepted lineage/result and required source intent; this probe cannot
qualify that integration or justify a gap there. A consumer failure must not be
repaired by creating another contribution.

The owner runs all invoker functions with a controlled search path and PUBLIC
execution/table privileges revoked. There are no real nonowner roles, RLS/P12
policies, legally scoped source identities, permission-change races or recipient
checks. The confirmation flag assumes owner authority; it does not prove it.
Owner access can edit historical tables. Command-retained history is not tested
production immutability, lawful retention or complete financial conservation.

The head's numeric version denotes a materially relevant report revision. It
does not define withdrawal, loss of custody, disappearance of responsibility,
cancelled finance, automatic reopening, required new tasks or final product
states. An old accepted resolution and a newer report can coexist; actual source
semantics must decide the permitted reconciliation. Incidental metadata is not
automatically a material revision.

Integer scope, exact-reference JSON, source confirmation tables, a ten-reference
guard and lock grain are fixture choices, not a physical schema/API, universal
matching engine or production limit. Two source references do not select one-to-
many/many-to-many business cardinality. Normalized integer references are compared
only with the exact owner set, never with amount/date/name proximity.

Actual source revocation under concurrent consumption, an unresolved financial
posting outcome, cross-process crash recovery, partial source commits, real
outbox/task delivery, historical result-disclosure revocation, browser/HTTP,
scale and financial/communication owner qualification remain untested. Existing
runner/session helpers were reused; previous scenarios were not rerun. No product
code or migration was edited.
