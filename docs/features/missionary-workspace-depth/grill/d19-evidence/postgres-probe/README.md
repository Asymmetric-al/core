# D19 disposable PostgreSQL first-support follow-up probe

Final result: **35/35 outcomes passed, eight actual two-session races** with observed transaction lock waits. [database-lifecycle.md](../database-lifecycle.md) explains the hypotheses, owner contract and limits. This is synthetic PostgreSQL mechanics, not Core, financial/recognition/P12, hosted Supabase, privacy, provider or user qualification.

Reproduce from repository root with existing Python, Docker and the cached image:

```sh
python3 docs/features/missionary-workspace-depth/grill/d19-evidence/postgres-probe/run.py
```

The runner imports the unchanged [D1 harness](../../d1-evidence/postgres-probe/run.py), clears inherited Docker endpoint/context/TLS selectors and uses `unix:///var/run/docker.sock`. Container `phase28-d19-pg` has `--network none`, no ports, no host mounts and synthetic rows only. Trust authentication is confined to this disposable local fixture. Pinned image: `postgres@sha256:2d2b8998d31037bf721cfdf764d76ba74171b4fab3431b7f72c27c56ddbdf9e3`; observed PostgreSQL 17.11. No dependency install, real data, hosted database, provider call or sending occurs.

Artifacts:

- [setup.sql](setup.sql): exact synthetic source versions/head, signals, canonical aliases, independent tasks, receipts/audit, constraints, coarse forced tenant RLS, grants and commands.
- [run.py](run.py): seeded input assumptions, expected output/SQLSTATEs, executing roles, eight controlled races, state assertions and cleanup.
- [results.json](results.json): final 35 outcomes, commands/output, eight `Lock:transactionid` waits, source/task/effect counts and executed-artifact/helper hashes.
- [roles.json](roles.json), [privileges.json](privileges.json): eight nonsuperuser/non-BYPASSRLS roles; thirteen coarse forced-RLS tables. Ordinary actors and worker have no raw tables; executor cannot access the effect sentinel. Policy manager has explicit gate rights.
- [sources.json](sources.json): one fresh changelog, twelve verified same-day primary sources and eight owner-source hashes. External bodies remain in the stated temporary cache.
- [environment.json](environment.json), [cleanup.json](cleanup.json): actual image/version/isolation and successful container/anonymous-volume removal, verified `2026-10-16T16:24:17.502874+00:00`.
- [First development snapshot](development-attempts/01-before-read-handoff-review/reason.json), [second snapshot](development-attempts/02-before-history-hold-review/reason.json): passing earlier assertions preserved before read/handoff fencing and history-only hold checks were strengthened. Each snapshot contains its own SQL/runner/results/hashes and cleanup. Use the root runner above for the final proof; snapshots preserve historical source.

The fixture **consumes** already-qualified first-support eligibility, complete-history state, source cursor and live/history-only origin. It computes no gift minimum, money sum, recognition attribution, completeness, contact permission or ministry identity. Exact typed subject/Legal Entity qualification remains outstanding.

Permanent tenant/canonical Party/ministry/purpose coverage prevents replayed work. Human Done is an **Independent follow-up task** outcome, never proof of an interaction/send/gift or source completion. Task/outcome/required audit co-commit. A new transport key cannot repeat the human effect. Current gate and assignee fences apply to read and completion; handoff is an explicit exact-task CAS operation, not an automatic Party/ministry assignment transfer.

Unknown qualification holds the same unhandled task. History-only repair stays held; qualified live resolution can resume it. Terminal withdrawal requires separately qualified explicit repair; automatic replay does not reopen it. Human Done/Not needed survives financial recalculation. Conditional manual Undo and explicit erroneous-withdrawal repair are **unimplemented and unproved, not forbidden product behaviors**.

Likewise, a valid withdrawal of a misattributed gift that never actually supported this ministry cannot permanently burn an unhandled first-support opportunity. Later newly live first support may require owner-qualified re-admission of the same purpose/task, unlike genuine support followed by refund. The fixture returns Needs source resolution and **does not prove or prohibit** that distinction/re-admission; it implements no permanent product ban or historical catch-up policy.

The merge case assumes an already-qualified alias-to-canonical mapping with an existing canonical task. It does not prove actual P4 merge/unmerge or collisions where both identities already had tasks/completed work. The empty effect sentinel covers communication/interaction/gift/enrollment only inside this disconnected fixture; actual producers/listeners remain unqualified.

All three runs record cleanup in `finally`; Docker `--rm` removes container and anonymous volume, then the runner verifies both absent. The cached image remains. Research artifacts stay outside application and migration paths.
