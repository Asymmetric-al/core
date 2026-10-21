# D7 synthetic newsletter-release mechanics

Executed October 16, 2026 UTC with digest-pinned PostgreSQL **17.11**:
**41/41 checks passed**, including **six controlled two-session races with
observed `Lock:transactionid` waits**. The cached container image ran with
`--network none`, no published ports and synthetic data only. Container and
anonymous data-volume removal were verified in `cleanup.json`.

This is a disposable mechanics experiment, not a Core migration, proposed table
design, Supabase deployment, newsletter implementation or provider test.

## Observed mechanisms

| Mechanism                                  | Observed result                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source identity independent of request key | Same-key replay and different request keys for the same issue produce one immutable release, one authorization audit record and two recipient effects. A new request key cannot rebind to another issue after being recorded.                                                                                                                                          |
| Atomic acceptance                          | An injected recipient-effect constraint failure rolls back the source status, release, audit, effects and operation record. No partial released issue remains.                                                                                                                                                                                                         |
| Exact approval                             | Changed content/audience revision rejects the stale approval. Already released meaning cannot be changed by a new request. The ordinary actor cannot mutate approved records directly.                                                                                                                                                                                 |
| Scope                                      | Cross-Tenant argument, forged actor, wrong actor and forged custom GUC cannot select another source through this fixture's session binding. A second same-Tenant actor has the same command capability and successfully authorizes their own issue but cannot authorize the first actor's issue. Direct actor table access and dispatch-function execution are denied. |
| RLS old/new rows                           | A specifically privileged mutation-test role sees no other actor's row; tenant/actor reassignment fails. Its deliberately omitted `WITH CHECK` correctly inherits `USING`; a permitted value change succeeds.                                                                                                                                                          |
| Referential scope                          | A mismatched Tenant/issue/revision FK fails. This is an integrity check executed administratively, not additional application authorization proof.                                                                                                                                                                                                                     |
| Concurrent release                         | Two transactions with different request keys wait and converge to one issue release and one set of recipient effects.                                                                                                                                                                                                                                                  |
| Cancel before dispatch                     | The waiting dispatch sees canceled work and admits no effect.                                                                                                                                                                                                                                                                                                          |
| Dispatch before cancel                     | The already modeled possibly-submitted effect remains unknown; cancellation ends the other unstarted effect. No recall is claimed.                                                                                                                                                                                                                                     |
| Revocation ordering                        | Revocation first blocks a waiting effect. Dispatch first preserves the unknown effect. A later re-enable does not revive an older source cancellation epoch.                                                                                                                                                                                                           |
| Recipient withdrawal                       | Withdrawal first blocks a waiting recipient effect. Changed contact revision cannot retarget that effect; the other unchanged recipient remains independently eligible.                                                                                                                                                                                                |
| Unknown-outcome recovery                   | Repeated lookup/dispatch retains the exact effect identity without another pending effect. Wrong-key evidence cannot attach; exact late simulated provider acceptance updates that effect while canceled remaining work stays canceled.                                                                                                                                |

Every SQL result and expected SQLSTATE appears in `results.json`. Race records
contain both session transcripts, observed wait and final administrative census.
`roles.json` captures actual role attributes. `environment.json`, `sources.json`
and `manifest.json` record environment, primary source provenance and hashes.

## Boundaries of this evidence

The immutable release holds synthetic revision/digest labels and a two-member
audience. This does not prove content serialization, real recipient compilation,
large/bounded-plan admission, image/attachment rights, address normalization,
consent ownership, prepared payload encryption, sender qualification or retention.

`admitted_unknown` deliberately represents the **hypothesized crossing of the
P17 “Submission may have begun” boundary**. There is no network call. The probe
does not prove that a local mark is an irreversible provider handoff, that a
lease or preparation alone prevents cancellation, or that PostgreSQL can commit
atomically with a provider. Production must preserve P17's distinction between
definitely unsubmitted, possibly submitted and conclusively accepted work and
must never hold a transaction open across provider I/O. Existing narrowly
permitted identical same-key provider retries remain untested, not prohibited
by this experiment. Unknown outcomes cannot justify a replacement effect.

The authority `revision` is a **synthetic cancellation epoch** advanced for an
exact purpose revocation. It is not a proposal to cancel work on every unrelated
permission edit. Actual source policy must identify what revokes pending work,
which surviving independent authorities remain valid and whether continuation
is allowed. The fixture chooses one required authority path so the race can be
tested; it is not a new P12 evaluator or grant scheme.

Actor identity comes from distinct actual PostgreSQL login roles and a fixed
session-user mapping. This usefully rejects caller arguments and GUC spoofing,
but does not test Core's shared authenticated role, Auth/JWT/session lifecycle,
trusted Active Tenant Assignment, P12 PDP or service-role paths. The command
executor is NOLOGIN/NOSUPERUSER/NOBYPASSRLS and not the table owner; its table
access remains subject to tenant RLS. The fixture owner and setup observer are
not proxies for an application user's authority.

No Data API, GraphQL, RPC exposure configuration, Storage, Realtime, browser,
Inngest, queue, Resend, webhook, rate limit, delivery, retry window, failover,
crash/restart, throughput, deadlock sweep or load behavior was exercised. The
test's `effects` table is a synthetic stand-in for source/effect identity, not
a new production outbox alongside P6/P17. Neither the counts nor generic denied
responses prove public timing/error equivalence or absence of side channels.

## Source semantics and reproduction

Primary PostgreSQL policy/constraint/lock and Supabase RLS/API documents were
freshly fetched by the coordinating review and their local hashes verified.
Read-Committed and transaction atomicity references reuse the D6 retrieval.
PostgreSQL explicitly says an ALL/UPDATE policy's omitted `WITH CHECK` inherits
`USING`. `SECURITY DEFINER` executes with its owner privileges; it is not
inherently an RLS bypass. Table/schema/function grants, ownership, policies,
owner/BYPASSRLS status, exposed APIs and alternate paths all need inspection.

Reproduction, from `/workspace/core`, with the already-cached digest available:

```sh
python docs/features/missionary-workspace-depth/grill/d7-evidence/postgres-probe/run.py
```

The runner reuses the existing D1 isolated-session helper (hash recorded), makes
no production connection and cleans its own container/volume in `finally`.
No package, image or tool installation is required. Reproduction replaces these
synthetic result artifacts; it does not modify application or migration files.
