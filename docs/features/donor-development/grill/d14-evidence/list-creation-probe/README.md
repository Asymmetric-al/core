# D14 additional-list creation mechanics experiment

**2026-10-10, 13:54:51–13:54:56 UTC: 14/14 checks passed.** This is a bounded,
synthetic PostgreSQL experiment, including intentionally insufficient designs.
It establishes the observations below; it does not implement or qualify Core P27,
select a final schema/API, prove an authorization model, or decide list lifecycle.

## Reproduction and isolation

[setup.sql](setup.sql) defines the toy data and functions. [mechanics.py](mechanics.py)
records the checks in [results.json](results.json). [run-lab.py](run-lab.py) and
[run-metadata.json](run-metadata.json) retain the protocol, UTC times, all three input
SHA-256 hashes, image identity, inspected isolation and cleanup result.

The already-present image was
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Actual server: PostgreSQL **17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0, 64-bit;
Docker 28.4.0. The created container had network disabled, no ports, no bind mounts,
tmpfs data, 256 MiB memory and one CPU. No image was pulled, no application DSN,
credential or SQL migration was read, and no application/hosted database was
contacted. Removal of the exact created container ID was verified.

An intentional repeat from the repository root, with Docker and the same image
available, is:

```sh
python docs/features/donor-development/grill/d14-evidence/list-creation-probe/run-lab.py
```

It overwrites this probe's result and metadata files. The runner refuses an
existing container name rather than reusing or deleting it. D10–D13 tests were not
rerun: the new concerns are additional list identity, membership and creation.

## Observed results

| #   | Experiment and outcome                                                                                                                                                                                                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Separate valid tenant/list and tenant/stage FKs accepted a journey in list 1 pointing to a stage in list 2. This is the deliberate inadequate-reference counterexample.                                                                                                                                                      |
| 2   | A tenant/list/stage composite membership FK rejected the same-tenant wrong-list update (23503). The independent tenant/list FK rejected a foreign list with null stage (23503). Existing journey rows/history were unchanged.                                                                                                |
| 3   | Treating `(tenant, label)` as the create-command key with conflict-do-nothing retained only the first of two different intents. A label collision is not proof of a retry.                                                                                                                                                   |
| 4   | One create stored a new list, two independently generated stage IDs, one configuration event and a matching successful receipt. No source stage IDs were borrowed.                                                                                                                                                           |
| 5   | Retrying that completed intent returned the same list/stage identities and receipt, with no new records. This models an ambiguous successful response, not an actual HTTP interruption.                                                                                                                                      |
| 6   | Reusing the key with another label or stage payload failed 22023 and changed nothing.                                                                                                                                                                                                                                        |
| 7   | A different intent with the same display label produced different list/stage IDs in this fixture. The fixture permits equal labels to isolate identity; it does not decide Core's duplicate-name policy.                                                                                                                     |
| 8   | A null stage label failed during stage insertion (23502); the previously claimed receipt and inserted list were rolled back, with no new stage or configuration event.                                                                                                                                                       |
| 9   | A transaction error after successful function execution but before commit (22012) likewise left no list, stage, event or successful receipt. Consumed identity sequence values are not treated as persisted lists.                                                                                                           |
| 10  | Nonowner `lab_config`, neither superuser nor BYPASSRLS, could perform its granted list-metadata update. Journey SELECT and UPDATE both failed 42501 because neither privilege was granted. This is privilege separation, not P12 proof.                                                                                      |
| 11  | Label-only grouping merged two independently identified stages named Engaged into one count of 2. Grouping by list/stage identity retained two counts of 1. The experiment demonstrates identity loss, not that two real ministries have different semantics.                                                                |
| 12  | Two sessions submitted one create intent concurrently. The retry was observed waiting on the first session's exact PID. An observer saw none of the first transaction's uncommitted records; after commit, the retry returned its receipt. Exactly one list, two stages, one configuration event and one receipt were added. |
| 13  | Owner calls using the same effect token in another tenant produced separate scoped receipts and lists. This tests key scope, not authorization to name a tenant.                                                                                                                                                             |
| 14  | All creation operations left the existing journey identities, assigned list/stage, revision and history byte-for-byte equal to the initial snapshot.                                                                                                                                                                         |

## Limits and unresolved decisions

Creation executes as the isolated owner. The function validates only the narrow
fixture input needed for the experiment; it is not a secure application endpoint.
Its PUBLIC execute privilege is revoked. The separate `lab_config` case grants only
list SELECT/UPDATE, with a fixed tenant-1 policy; it does not create a real list
through Core's authorization boundary. No Supabase Auth/PostgREST, P12 capability,
tenant session resolution, revocation race or forbidden function path was tested.

The fixture has no supporter/ministry/purpose key. Its one list reference per toy
journey illustrates membership; it does not establish ordinary-journey lifetime
uniqueness or prevent duplicate partnership work in a real API. In particular,
adding a list ID to a business deduplication key would not follow from this design.
No additional ministry, record, enrollment, task, consent, gift or access was created.

The create function commits complete new list data as one unit. This is one
sufficient mechanism, not a selected draft/apply/publish lifecycle. No copy,
template inheritance, default, selector, applicability, retirement, deletion,
restore, list switch, mapping, version migration or multi-person approval exists
in the fixture. Global numeric identities, event/receipt tables, exact SQLSTATEs
and array ordering are experiment choices, not proposed contracts. Do not copy
them as production schema without domain and integration design.

A database identity is distinct from both a display label and a command identity.
The [consolidated D14 R04](../../phase27-d14-adversarial-review.md) states bounded
new-list display-name validation. A different intent with a conflicting name must
receive an honest permitted validation outcome, not a false successful replay.
The fixture does not implement that policy or exercise language normalization,
name-availability disclosure or duplicate-name UX.

One controlled interleaving is not every concurrency schedule, deadlock analysis,
load test or performance result. No real API, browser, cache, list/stage report,
existing-data migration, application unit suite or end-to-end flow was exercised.
Positive assertions show only that the authored mechanism works for these cases;
counterexamples supply independent evidence against those insufficient designs.

Fresh PostgreSQL **17** primary references retrieved 2026-10-10 (living pages,
no article publication date): [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
for composite references; [INSERT](https://www.postgresql.org/docs/17/sql-insert.html)
for unique-conflict waiting and conflict behavior; [transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html)
for atomic rollback and visibility. They support engine mechanics, not Core's
product rules or the completeness of this implementation.
