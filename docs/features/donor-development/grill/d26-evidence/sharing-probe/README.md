# D26 isolated sharing admission and disclosure mechanics

First runtime attempt **7/7 passed**, 2026-10-10 UTC, 19:35:49–19:35:55.
Python AST parsing passed before execution. No failed runtime attempts or reruns.
This is an intentionally weak nonowner RLS counterexample followed by separate
qualified-command mechanics. It is not Core's production permission model.

## Artifacts

- [setup.sql](setup.sql): separate weak RLS and bounded command fixtures.
- [mechanics.py](mechanics.py): seven assertions and three transaction schedules.
- [run-lab.py](run-lab.py): pinned local Docker runner and exact cleanup.
- [results.json](results.json): observations, errors, actual backend waits/version.
- [run-metadata.json](run-metadata.json): input hashes, HEAD, image/container,
  isolation, stdout/stderr and cleanup proof.

```sh
python docs/features/donor-development/grill/d26-evidence/sharing-probe/run-lab.py
```

Inputs frozen before execution:

| File         | SHA256                                                             |
| ------------ | ------------------------------------------------------------------ |
| setup.sql    | `c78e3b68334f1fb6f979c7717fb5f60c3f1738c88868f48584fa99d103050f6d` |
| mechanics.py | `0203e1dbf12a7a36165f2ed31df6c6888fe5241186050f7bfcdcba9150b2201d` |
| run-lab.py   | `0e806992fd0855910bcb123ad3654a246b7611c2eaf8025a035246be70ad0b2c` |

## Observed cases

1. Actual synthetic nonowner role `d26_fixture_editor` has read/update permission
   in two contexts. Real RLS `USING` and `WITH CHECK` both hold, so an UPDATE moves
   the source row from context 1 to 2. This deliberately demonstrates that row
   admissibility in both places does not establish immutable source origin.
   The weak table/policies are separate from all subsequent command cases.
2. The bounded command rejects absent context, an unqualified shared context,
   an ineligible typed source and retargeting an existing source even where the
   destination is writable. A new eligible routine item then saves under its
   explicitly qualified context. Multiple negative inputs form one invariant case.
3. Combined source/audience invalidation wins the context fence. Waiting save
   fails current disclosure (`42501`), leaves content/history/result unchanged
   and does not silently fall back to another audience. A later read also fails.
4. Save wins first and admits one update/history/result. Invalidation waits, then
   ends disclosure. Both a later read and an exact result retry are denied, while
   the accepted content and minimal history remain in the owner fixture.
5. Same-key changed body or audience generation conflicts (`23514`). With only
   write permission removed and read permission still present, exact historical
   result recovery succeeds without a new write; a fresh save is denied.
6. A session-scoped late required-evidence fault rolls back content/history/result.
   A new session retries that exact intent successfully once. No mandatory extra
   task or notification is modeled.
7. A read admitted before narrowing holds the source fence. Narrowing waits,
   then a later read is denied. This proves admission ordering, not recall of
   bytes already delivered or correctness of browser/HTTP caches.

Cases 3, 4 and 7 use actual two-session interleavings. Results record exact
PostgreSQL waiter/blocker PIDs via `pg_blocking_pids`, not guessed timing. Others
are sequential checks. No old probe scenarios were rerun; only isolation/session
helpers were reused.

## Isolation and cleanup

PostgreSQL `17.11` on x86_64-pc-linux-musl, GCC Alpine 15.2.0, read committed;
Docker `28.4.0`. HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
Image `postgres@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24`;
image ID `sha256:79bd7c99e923138f136f8009d6bffa66e21e9d4fda5c0c561b00fc9c90cfe537`.

The runner fixes the local Docker socket and removes remote Docker environment
overrides. Network none, no ports, bind mounts or volumes; 128 MiB tmpfs data,
256 MiB memory and one CPU. The trust setting applies only inside this disposable
isolated container. No live DB, project credentials, Supabase project, provider,
Core SQL or migration was accessed. SQL enters through standard input.

Container `phase27-d26-sharing-lab-200775`, exact ID
`1e6d114f491e7b9992021d49e1a17dd767879adcfb02e13e8414170ea2b91991`, was removed in
the runner finalizer. Removal exit 0 returned that exact ID; inspection afterward
exit 1 reported `No such container` for the same ID. Metadata retains both.

## Proof levels and limits

Case 1 is real PostgreSQL RLS execution under a newly created nonowner role, on
wholly synthetic tables/policies. It is not a test of `authenticated`, Supabase
JWT identity, Core migrations, P12, missionary grants or a deployed vulnerability.
The deliberately permissive two-context model is the counterexample, not a
proposed production policy.

Cases 2–7 execute `SECURITY INVOKER` functions as owner, with explicit search path
and PUBLIC execution revoked. Actor 1 is a fixed fixture identity; context flags
and access rows are toy predicates, not the real PDP. Raw access to the qualified
tables is revoked from the weak fixture role, but privileged-path bypass and real
nonowner positive/negative production policies are not tested. The owner can
directly edit retained data. The experiment does not prove immutability or lawful
retention of content/history.

The scoped context and concrete encounter FK represent an already-qualified source
seam. No global encounter table, arbitrary polymorphic registry, personal ownership,
fixed collaborator roster, audience taxonomy or automatic classification is chosen.
The context lock is deliberately coarse. The audience generation denotes a
materially relevant change only, not a rule that every metadata change invalidates
work. The narrowing fixture combines read/write loss and new shared-admission
closure; separate real policy/source/identity changes require their own owner proof.

Receipts contain source identity/version and a SHA256 body identity in the intent,
not a second content body. Current content is returned only by the separate
qualified read function. Hashes and identifiers still require protected storage
and disclosure; this fixture is not the retention or audit contract. It models
current content plus minimal accepted-version evidence, not a selected historical
body/revision product.

No claim is made about client cache clearing, streaming release, already delivered
bytes, search/export/AI/notification projections, source correction races beyond
the modeled fence, distributed recovery, load, restore or older executors. There
are no tasks, financial effects, communications or meaningful-contact updates.
The owner must qualify every real source and egress before using D26's default.
