# D3 selected foreign-key mechanics probe

Executed **2026-10-16 05:08 UTC**: **6 scenarios, 18/18 assertions passed** on PostgreSQL **17.11**. This is a disposable test of selected committed constraint declarations, not a D3 implementation, full migration replay, deployed catalog inspection or Supabase Auth/API/JWT qualification. Expected foreign-key errors below are successful test outcomes, not reports of production defects.

| Scenario                                                            | Observed result                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delete an auth UUID with no modeled blockers                        | Its profile, missionary record and profile-keyed personal task all disappear.                                                                                                                   |
| Delete a profile referenced by `donors.missionary_id`               | `23503`, identifying `donors_missionary_id_fkey`; auth/profile/missionary/task/donor all remain.                                                                                                |
| Delete an auth UUID whose missionary has a fund                     | `23503`, identifying `funds_missionary_id_fkey`; auth/profile/missionary/task/fund all remain.                                                                                                  |
| Delete an auth UUID whose missionary has a donation                 | `23503`, identifying `donations_missionary_id_fkey`; auth/profile/missionary/task/donation all remain.                                                                                          |
| Delete the missionary record directly, with a pledge but no blocker | Missionary disappears; pledge survives with `missionary_id = NULL`. Auth/profile/task survive because the task points to the **profile**, not the missionary record.                            |
| Delete an auth UUID with a CRM note and command log                 | Auth/profile/missionary/task disappear. Note body, author UUID/name and linked record ID/label remain. Log `actor_profile_id` becomes NULL, while `actor_user_id` and synthetic payload remain. |

Each scenario records its exact before-query/result, deletion SQL/result, expected SQLSTATE and after-query/result in [results.json](results.json). The three blocked statements leave no partial cascade committed. The successful deletion cases are counterexamples to treating hard deletion as merely ending access; the retention case is a counterexample to assuming author deletion removes copied text or historical IDs. None of these observations authorizes deleting, transferring or exposing retained records.

## Source fidelity and boundaries

[setup.sql](setup.sql) copies verbatim the complete selected `CREATE TABLE` statements for tenants, profiles, missionaries, donors, funds, donations, donor pledges and missionary tasks from `20250101000000_init_schema.sql`, CRM notes from `20260818000000_crm_notes.sql`, and command logs from `20260507234343_crm_command_logs.sql`. It then applies the exact pledge `missionary_id` added-column clause from `20260214090000_foundation_1_schema.sql:340`, changing only its terminal comma to a semicolon under the original ALTER TABLE target. [sources.json](sources.json) preserves every excerpt, its exact source lines, excerpt hash and full-file SHA-256. The runner rejects changed source files before starting a container.

The fixture substitutes **only a UUID-primary-key stub** for `auth.users`. It intentionally does not apply the rest of these migrations: policies, application triggers, auth functions, subsequent unrelated alterations and other graph edges are absent. No graph was inferred from table names: [constraints.json](constraints.json) records the fixture's actual `pg_constraint` definitions and delete actions (`c` CASCADE, `a` NO ACTION, `n` SET NULL). These selected FKs are immediate and nondeferrable. The source review is [current-runtime.md](../current-runtime.md); the fixture verifies selected mechanics from that review, not its entire graph.

All 18 assertions ran through the separate `d3_deleter` SQL login: nonsuperuser, no BYPASSRLS, no role/database creation. [roles.json](roles.json) captures actual role attributes. Setup grants it SELECT on fixture tables and DELETE on the three parent tables; superuser is used only for initialization and catalog/environment observation. No application RLS policies are installed, so these grants **do not qualify production authorization**, restricted-note access or which real actor may delete anything. Synthetic UUIDs/text only; no real contact, financial or account data.

Not exercised: the other donor profile FK as a populated blocker, campaign/post/follow/care/notification/receipt/merge graphs, tenant deletion, storage, Auth administrative deletion behavior, triggers present only in a deployed database, session/token revocation, source grants, cache behavior, access after departure, retention periods or disposition authority. There are no concurrent writes in this focused FK probe. A full deployed inventory and source-authorized lifecycle test remain necessary before any destructive operation.

## Reproduce and inspect

From `/workspace/core`, with the pinned image already cached and local Docker available:

```sh
PYTHONDONTWRITEBYTECODE=1 python docs/features/missionary-workspace-depth/grill/d3-evidence/postgres-probe/run.py
```

[run.py](run.py) reuses only the D1 Docker/psql helpers, whose SHA-256 is recorded with the setup/runner/source-manifest hashes in the result. It starts a fresh `phase28-d3-pg` using `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`, clears inherited Docker endpoint selectors, uses the explicit local socket, disables networking and publishes no ports. Local trust authentication is confined to this disposable synthetic server. [environment.json](environment.json) records the server, image and isolation facts.

The runner stops its container in `finally` and verifies that both the container and its anonymous data volume are absent. [cleanup.json](cleanup.json) confirms both removals. An initial startup attempt encountered the image's temporary initialization server shutdown before any scenario ran; readiness was corrected to wait for initialization completion, that attempt was removed, and the fresh final run above passed all scenarios. No application file, migration, hosted database, GitHub object or integration was changed.
