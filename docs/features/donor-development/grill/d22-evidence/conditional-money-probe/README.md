# D22 — conditional monetary fields: isolated mechanics

2026-10-11 Asia/Bangkok; run 2026-10-10 UTC. **8/8 passed on the first attempt.**
New synthetic evidence, not a Core schema, migration, production database,
authorization test or implementation of asks/financial fulfillment.

The question newly admits significant nonfinancial requests alongside funding
requests. This probe tests conditional field integrity, retention of earlier
monetary meaning on a terms/type revision, and the limits of numeric storage.
It does not rerun D18/D19 cases. Only the existing local Docker/psql helpers are
reused. There is no concurrent schedule in this probe.

## Artifacts and run

- [setup.sql](setup.sql): deliberately weak CHECK counterexample, scoped request
  fixture, conditional money rule, version evidence and durable result.
- [mechanics.py](mechanics.py): eight new cases and observed values.
- [run-lab.py](run-lab.py): pinned disposable container runner.
- [results.json](results.json): all eight results and executed server version.
- [run-metadata.json](run-metadata.json): exact three input SHA256 hashes, checkout,
  image/container/isolation inspection, stdout/stderr and cleanup evidence.

Python AST syntax checks passed without creating bytecode. Executed from
`/workspace/core`:

```text
python docs/features/donor-development/grill/d22-evidence/conditional-money-probe/run-lab.py
```

One runtime attempt: **17:21:53.166366–17:21:58.150205 UTC**. Exit 0, empty stderr,
`completed: true`, `passed: 8`, `total: 8`, `all_pass: true`. No failed attempt or
rerun was omitted. Source HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

## Cases

| Case | Observation                                                                                                                                                                                                                                      | Bounded conclusion                                                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `CHECK(kind <> 'monetary' OR amount_minor > 0)` accepts a monetary row with null amount.                                                                                                                                                         | PostgreSQL CHECK accepts unknown; field requiredness must be explicit rather than inferred from a comparison. This intentional counterexample is a passing observation. |
| 2    | A monetary request retains currency while requested/expected amounts are unknown; nonfinancial fields are absent. Missing monetary currency, a fake zero on a nonfinancial row, stray nonfinancial currency and negative expected amount reject. | Conditional money meaning can be enforced locally without coercing nonfinancial or unknown amounts to zero.                                                             |
| 3    | A supplied financial target in another entity rejects; absent monetary fields do not permit a foreign journey or missing required entity.                                                                                                        | Optional references do not replace independently required scoped parent relationships.                                                                                  |
| 4    | Changing only the type flag from monetary to nonfinancial fails while money fields remain.                                                                                                                                                       | Merely hiding money inputs or changing a label cannot create a consistent accepted row.                                                                                 |
| 5    | A late receipt failure rolls back current/version/result changes. Explicit replacement with nonfinancial terms keeps the original monetary snapshot, appends the new version and commits one receipt.                                            | Accepted terms changes can preserve old meaning and atomic current/history/result. No silent financial-data deletion is necessary.                                      |
| 6    | Reusing the same key for monetary meaning conflicts. A new authorized-by-fixture revision can contain requested 12000 and expected 0; replaying the earlier nonfinancial result never erases it. A stale revision rejects.                       | Stable business identity binds the complete conditional meaning; a historical result is not current terms.                                                              |
| 7    | Amounts aggregate in separate entity/currency lanes, with known count below request count for an unknown monetary amount.                                                                                                                        | SUM ignores null; its known subtotal is not automatically a complete forecast.                                                                                          |
| 8    | PostgreSQL casts decimal 1.5 to bigint 2, and stores 9007199254740993 exactly as bigint.                                                                                                                                                         | Integer storage alone does not reject fractional input, and database range exceeds JavaScript safe integer range. Qualified parsing/transport must guard both.          |

## Isolation and cleanup

Executed PostgreSQL **17.11**, x86_64-pc-linux-musl, GCC Alpine 15.2.0,
**read committed**; Docker 28.4.0. Existing pinned image:
`postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`.
Image ID:
`sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

Network none; no published ports, bind mounts or attached volumes; 128 MiB tmpfs
data, 256 MiB memory and one CPU. Explicit local Docker socket with remote-context
overrides removed. No live database, project configuration, credentials, Core
migration/seed, provider or external financial service was used.

Exact container
`5f1c76ca5f4944cbb0291f8d6590f23b0fc4af28cea3357646155b61c1b9b43b`
was removed with exit 0; subsequent inspection returned exit 1 and `No such
container` for that exact ID. Both outputs are retained in metadata.

## Material limits

All commands execute as PostgreSQL owner. PUBLIC execution/table access is revoked,
but nonowner grants/RLS/P12, caller identity, protected financial visibility,
revocation ordering, retention and trusted actor/time audit are not modeled.
Illustrative tenant/entity/journey IDs stand for already qualified source scope.
The fixture neither invents a scope taxonomy nor proves actual catalog eligibility.

The two fixture kinds are not a final request taxonomy. Narrow noncash intentions,
mixed requests, response status and external fulfillment are not implemented here.
An optional target is deliberately allowed; no universal campaign/designation
requirement is imposed. The fixture's target column is a monetary-detail pointer;
it does not prohibit independently qualified campaign/context references on a
nonfinancial request. Keeping known-zero and unknown amounts representable does
not decide when zero or an unspecified amount is appropriate for a presented ask.
The currency table is only three fixture rows, not authoritative metadata.

The replacement function demonstrates version/result mechanics, not permission to
repurpose an already presented request or alter gifts/commitments. History rows
remain owner-writable in this fixture; it does not prove general immutability.
No lifecycle, presented-term boundary, response evidence, cadence, term, horizon,
noncash valuation, source-confirmed funding, recognition, correction or allocation
service exists here. There is no remote effect, task or provider to prove absent.

Case 6 is sequential and uses explicitly raised `40001`; it is not concurrency,
Serializable isolation, HTTP response-loss or actual business authorization proof.
Case 7 is a complete fixture set and no production reporting formula or completeness
claim. Case 8 does not exercise the actual UI/parser; the current Core money helper
is inspected separately. No production release, dependency version or Supabase
deployment version is inferred from this isolated PostgreSQL image.
