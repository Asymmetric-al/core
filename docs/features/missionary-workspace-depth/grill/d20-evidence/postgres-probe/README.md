# D20 disposable PostgreSQL probe

**38/38 outcomes passed, with nine actual two-session races and observed transaction lock waits.** [Database interpretation](../database-lifecycle.md) explains the owner assumptions, results and limitations. This is synthetic mechanism evidence, not Core, financial/recognition/P12, hosted Supabase/Auth/PostgREST, privacy, provider or user qualification.

Run from `/workspace/core` with Python standard library and the already-cached Docker image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d20-evidence/postgres-probe/run.py
```

The runner reuses the unchanged [D1 local Docker/psql and concurrency helper](../../d1-evidence/postgres-probe/run.py). It creates only `phase28-d20-pg`, isolated with `--network none`, no published ports and no host mounts, using `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`. Actual server: PostgreSQL 17.11, Debian `17.11-1.pgdg13+2`. Local trust authentication applies only inside this disposable synthetic instance. No application database, project credential or provider is accessed.

- [setup.sql](setup.sql): synthetic constraints, eleven forced coarse-Tenant-RLS tables, bounded commands and explicit privileges.
- [run.py](run.py): inputs, expected results/SQLSTATEs, actual role execution, state assertions, nine controlled independent-session races and cleanup.
- [results.json](results.json): all 38 outcomes, commands/outputs, nine `Lock:transactionid` observations, counts and executed SQL/runner/source/helper hashes.
- [roles.json](roles.json) and [privileges.json](privileges.json): eight nonsuperuser/non-BYPASSRLS roles, table grants/RLS and function owners/search paths/ACLs. Ordinary actors and worker have no raw tables; the command executor cannot access the effect sentinel.
- [sources.json](sources.json): one freshly fetched changelog, twelve verified same-day primary technical sources and eight owner-file hashes. External bodies remain in the recorded temporary cache. Additional working owner research is identified in the note rather than falsely listed as hashed.
- [environment.json](environment.json) and [cleanup.json](cleanup.json): actual image/server/isolation and verified container/volume absence at `2026-10-16T16:51:40.040054+00:00`.

The fixture's scope integer and eligibility/source revision are **prequalified input assumptions**, not a financial adapter, typed subject resolver or P12 policy engine. A SQL login represents the trusted test actor; spoofing a request setting is rejected, but actual Supabase authentication/request context is unproved.

G1/G2 completion does not absorb an unreviewed G3. If G3 arrives before completion, the same task remains Open with G3. If completion commits first and later G3 arrives, it creates the next open task. Durable per-gift purpose coverage and the old receipt survive either order. Concurrent distinct gifts are tested joining one current task; same-gift replay is sequential. Changed reviewed-source evidence conflicts the entire completion. Required audit failure rolls back acceptance, and replay cannot clear residue or change the old disposition.

**No Undo implementation or proof is included**, including the simple no-successor case. Original group references are immutable in this toy; this is not a prohibition on qualified restoration/transfer preserving original lineage. Source withdrawal/held-member reconciliation and independent undertakings are absent, so the fixture's last-member closure is not the full production closure predicate. Lost-response recovery is modeled by replay after acceptance, not a real transport disconnect. No financial, interaction, send or enrollment producer is connected; a zero sentinel does not certify real downstream integrations.

Fresh changelog/current technical readback and all executed artifact hashes were verified. Expected permission/constraint failures count as passing assertions, not vulnerabilities discovered in Core. There was one execution; no earlier or failed run is hidden.
