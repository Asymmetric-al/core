> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 05 — Executed evidence and limits

7 September2026. These results reproduce current defects and test bounded assumptions. They are not passing donor-feature acceptance tests or hosted verification.

## Actual Core model

The existing pure model was imported directly and exercised using synthetic copies of its current unit-test fixture. The experiment made no database, browser, auth-session or provider calls. Six current behaviors were reproduced.

<!-- prettier-ignore -->
| ID | Observation | Actual result |
| --- | --- | --- |
| M01 | refunded maps to failed | `"Failed"` |
| M02 | processing has constructed receipt url | `"/api/donor/receipts/donation-1"` |
| M03 | unlike currencies combined in summary | `20000` |
| M04 | jpy divided by 100 | `1` |
| M05 | succeeded row count used as receipt count | `1` |
| M06 | missing dates become epoch | `"1970-01-01T00:00:00.000Z"` |

## Actual receipt-route control flow with mocked dependencies

Node24.15.0 TypeScript stripping/VM modules executed six actual source modules: `receipts.ts`, `model.ts`, `service.ts`, `route-helpers.ts`, `shared/http-errors.ts` and `api-http-error.ts`. Auth/admin queries and NextResponse were mocked with synthetic rows. The VM had no fetch, environment, filesystem, database or provider access; an outer allowlisted loader read only these source files. This proves the current control flow under those inputs, not real Next/Supabase/hosted behavior. Four assertions passed; the process exited0. Experimental Node warnings were expected. The in-memory harness was not saved as a replay script; source paths, inputs and observed outputs are recorded here.

<!-- prettier-ignore -->
| ID | Synthetic condition | Observed current result |
| --- | --- | --- |
| R01 | Owned failed donation | HTTP200 “Donation Receipt”, Status:Failed |
| R02 | Owned refunded donation | HTTP200 “Donation Receipt”, Status:Failed |
| R03 | Owned processing donation | HTTP200 “Donation Receipt”, Status:Processing |
| R04 | Missing owned donation, PGRST116 mock | Promise rejects with ApiHttpError404 rather than returning the wrapper's normalized404 Response |

## Synthetic PostgreSQL counterexamples

PostgreSQL17.10, an existing local `postgres:17-alpine` image, network disabled, no published ports, bounded memory/tmpfs and uniquely labeled disposable container. No Core tables or existing local Supabase data were used. All24 assertions passed **against their stated expected observations**, including demonstrations that naïve approaches fail. This is not24 passing Core authorization tests.

<!-- prettier-ignore -->
| ID | Assumption/counterexample | Observed | Expected |
| --- | --- | --- | --- |

| E01 | naive join multiplies header | `60000` | `60000` |
| E02 | naive join multiplies refunds | `4000` | `4000` |
| E03 | separate grain preserves gift and confirmed refunds | `10000,2000` | `10000,2000` |
| E04 | pending refund not completed | `2000,500` | `2000,500` |
| E05 | ministry filter amount not whole gift | `6000,10000` | `6000,10000` |
| E06 | mixed currency sum is nonsensical scalar | `20100` | `20100` |
| E07 | currency partition preserves exact amounts | `EUR:10000,JPY:100,USD:10000` | `EUR:10000,JPY:100,USD:10000` |
| E08 | hardcoded cents divisor breaks jpy | `1,100` | `1,100` |
| E09 | cross tenant fk rejected | `0` | `0` |
| E10 | financial parent delete restricted | `1` | `1` |
| E11 | current grant scopes tenant | `a` | `a` |
| E12 | no donor financial update grant | `f` | `f` |
| E13 | omitted with check reuses using | `a` | `a` |
| E14 | offset first page | `4,3` | `4,3` |
| E15 | offset second page repeats entry | `3,2` | `3,2` |
| E16 | keyset avoids new front insert duplicate | `2,1` | `2,1` |
| E17 | keyset alone misses mutated sort key | `2` | `2` |
| E18 | read committed header before correction | `1` | `1` |
| E19 | separate query reads newer refund version | `2300` | `2300` |
| E20 | bounded snapshot header version | `2` | `2` |
| E21 | bounded snapshot keeps refunds consistent | `2300` | `2300` |
| E22 | long snapshot permission before revocation | `3` | `3` |
| E23 | long snapshot keeps old permission | `3` | `3` |
| E24 | new authorization after revocation denies | `0` | `0` |

The results establish: joining several child families can multiply money; currency partitioning and tenant-composite references prevent specific errors; browser write grants are separate from SELECT policy; omitted UPDATE WITH CHECK can safely reuse USING; offset/keyset pagination has different concurrency hazards; bounded snapshots keep data coherent but long snapshots also retain old authorization. They do not establish the complete target design's RLS, constraints, performance or source semantics.

## Actual Core forward migration verifier

The repository-native `scripts/verify/supabase-migrations.mjs` ran with a sanitized environment against another fresh networkless PostgreSQL17.10 container. Source was mounted read-only. A guarded PSQL wrapper passed the verifier's SQL files/transaction flag only to that exact container. The supplied local URL contained no secret and could not connect to an existing database through the wrapper. The foundation migration's single-transaction behavior was preserved.

**Result:76 forward migrations verified, exit0.** There are81 SQL files in the directory; the five excluded files are explicitly named rollback scripts, which the native verifier intentionally does not apply. This result is equivalent to the native forward-migration selection, not a claim that every file including rollback scripts ran. An initial attempt found the guessed `/usr/bin/node` executable absent; no migrations ran in that attempt. The executable was then discovered from the existing login-shell path and the complete verifier succeeded in a new container.

Catalog observations after the full forward chain:

<!-- prettier-ignore -->
| Observation | Actual result | Interpretation |
| --- | --- | --- |
| donations RLS enabled / FORCE | true / false | Existing SELECT policy enforcement exists for non-bypass roles; table-owner/service paths need separate scrutiny. |
| donation→donor reference | FOREIGN KEY(donor_id) REFERENCES donors(id) | This relation is not tenant-composite. No malformed live row or exploit was tested. |
| authenticated donation INSERT/UPDATE/DELETE | false / false / false | Preserve actual browser-write denial; do not falsely report unrestricted donor mutations. |
| service_role receipt UPDATE/DELETE | true / true | Browser RLS alone does not establish privileged-writer immutability. |
| gift_receipt_records user triggers | 0 | No user immutability trigger was present after these migrations. This is a schema observation, not proof a production writer changed records. |
| receipt foreign-key delete behavior | donation RESTRICT; Tenant CASCADE | Retention/deletion must be reviewed through the actual owner contract; not every path is append-only by constraint. |
| service_role BYPASSRLS | true | Compatibility bootstrap deliberately models the privileged role; its query/command authority remains an application responsibility. |

The helper query looking for a policy name containing `donor` returned empty; **that does not mean there is no applicable policy**. Policy names and the actual effective policy set must be inspected separately. Current migration/source review identified the applicable authenticated financial read policy and its ownership predicates.

This is real migration execution/catalog inspection on the current schema, **not** the complete target Phase13/Party schema or a real user-row RLS/concurrency test. It also does not model PostgREST caps, Supabase Auth/Storage/Realtime, deployment configuration or all production role differences. The existing CI PostgreSQL15 service and configured local PostgreSQL17 are distinct evidence; target deployment version must be explicitly qualified.

## Cleanup and boundaries

Both experiment containers were stopped and removed, verified by exact-container/label checks. The synthetic container's first immediate inspection raced asynchronous Docker `--rm`; a later inventory confirmed removal. No existing container, database, source file, credential or live provider was changed. The prior five-file setup patch was preserved.

The original scripted SQL/model/migration experiments and JSON results are included in the companion proof bundle. They retain explicit synthetic/current-source limits and safe isolated-target guards. Re-running them is research verification, not a migration command for an existing environment.

## Still required for product acceptance

Actual target-schema row/field/representative authorization and concurrent revocation; source-origin-to-posting correlation; end-to-end browser/filter/cache/document behavior; supported provider-contract/sandbox evidence; complete historical coverage; measured all-source capacity; and accessible donor task results remain T01–T14 release gates. No test in this record may substitute for those missing proofs.
