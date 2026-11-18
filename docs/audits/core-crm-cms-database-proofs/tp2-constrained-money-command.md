# TP2: one fully constrained money command

**Purpose.** This is the second thin proof of plan section 12 ("Packages are containers, not single issues"): one fully constrained money command, the first issue of WP8a. It settles the row "Money steps as SQL commands" of plan 15.2 before WP8 is groomed. The command is "apply payment outcome" of plan 8.1.

**Base.** Integration branch at `bec3bf06a`, stage 1 of the plan (the command lane, the `platform` schema, the privilege cleanup, the catalog gate). Membership, Sites, legal entities and identity keys are not on this base, so the prototype builds the smallest stand-in for each table it needs from them (section 2). The prototype is not for merge. It is kept as a patch (section 14).

**Where it ran.** Disposable Postgres 17.10 databases in the shared test container, on 17 November 2026: `tp2_proof` for the behaviour tests and `tp2_cost` for the cost measurement. No hosted project and no payment provider were used. Provider events are fixtures in Stripe's shape.

## 1. Verdict

**The pattern works, with changes to the plan's wording.** "Apply payment outcome" runs as one SQL command in one transaction, in the worker lane, through a wrapper that takes no tenant from its caller. It finds the tenant through the stored provider event's connected account, enters it, and reads the event again under the guard's row security. Called in a fresh transaction with no tenant set, a valid anchor applies every effect of 8.1 at once; an unknown anchor changes nothing; another tenant's anchor cannot select or change this tenant's rows, whatever its payload says. Repeats and concurrent repeats leave one result, and events out of order end in the state 8.1 and 8.3 describe. Database rules hold 16 of the invariants the plan states for these rows. The 14 that were attacked each refuse a direct write by the service key, and each accepts it once that one rule is removed. Seven invariants stay in the command's code, and none of them lets a row cross tenants. Cross-tenant selection has three independent layers: the guard's row security, the account-bound lookup, and tenant-carrying keys. Removing the first two together lets another tenant's event select this tenant's intake, and the keys still refuse the write. Cost is far inside the 9.2 budget for a transactional write (under two seconds): with a million rows of each kind in each of two tenants, one call takes 70 ms at the median and 167 ms at p95, and twenty sessions applying different outcomes at once keep p95 under 320 ms, with no lock wait between them and no deadlock. The catalog gate and the field-policy census pass with the prototype applied, and the gate needs no change to admit it, but it cannot see the two rules that make a worker entry safe (section 11). Eleven places in the plan need new wording (section 10). None of them changes WP8's shape.

## 2. What was built

| Path                                                                              | What it is                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20261117150142_tp2_money_command_standins.sql`               | Stand-ins for later packages: `legal_entities` (WP3), a fund's legal entity and its reserved fee-cover flag (WP3), and `donors.person_id`, the donor relationship's Party (WP5)                                                                                                                    |
| `supabase/migrations/20261117150152_tp2_money_command_schema.sql`                 | The rows the command reads and writes, as WP8a would write them: provider accounts and bindings, the event store as anchor, the intake's keys and status rules, intake lines, payment observations, repair cases, the staged gift's and its lines' keys, the line-sum checks and the outbox's kind |
| `supabase/migrations/20261117150201_tp2_apply_payment_outcome.sql`                | The guard's grants and policies, the worker entry `tenant_guard.apply_payment_outcome` and its wrapper `public.apply_payment_outcome`                                                                                                                                                              |
| `docs/security/field-policies/manifest.json`                                      | Five new `donations` columns and `donors.person_id` classified; `donations.tenant_id` and `status` now not null                                                                                                                                                                                    |
| `docs/security/rls-deny-by-default-exceptions.json`                               | The `donation_saga_outbox` entry removed, because the table now has a guard policy and the gate fails a stale entry                                                                                                                                                                                |
| `scripts/proofs/tp2/harness.sql`                                                  | Gives the service key the hosted table privileges on a `tp2_` database only                                                                                                                                                                                                                        |
| `scripts/proofs/tp2/fixture.sql`                                                  | The cost fixture: a million rows of each kind in each of two tenants                                                                                                                                                                                                                               |
| `scripts/proofs/tp2/measure.mjs`                                                  | The cost measurement of section 8                                                                                                                                                                                                                                                                  |
| `scripts/proofs/tp2/measure-commit-split.mjs`                                     | The split of one call's time into the command and its commit (section 8.2)                                                                                                                                                                                                                         |
| `tests/unit/acceptance/tp2-money-command/apply-payment-outcome.realstack.test.ts` | The database test: 39 cases. It skips unless `TP2_DATABASE_URL` names a loopback `tp2_` database                                                                                                                                                                                                   |

The stand-ins are small on purpose. Only funds are giving targets; WP3 gives missionaries the same key. A binding has versions but no onboarding. Only the guest rows of the identity table in 5.4 are built, because the signed-in rows need account links (WP5).

## 3. Method

**Databases.** `tp2_base` has the chain at `bec3bf06a` (108 migrations); `node scripts/verify/supabase-migrations.mjs` applies it and both gates pass. `tp2_proof` and `tp2_cost` have the chain plus the three prototype migrations (111) and `scripts/proofs/tp2/harness.sql`. The same verifier applied both, and both gates passed on each without edits to either gate.

**The harness fixes one thing.** The compatibility bootstrap grants the service key `SELECT` on `public` tables; hosted Supabase grants it every table privilege. Without the fix, the direct-write attacks of section 6 would fail on a missing grant and not on the rule under test. The harness grants `SELECT, INSERT, UPDATE, DELETE` on all `public` tables to `service_role`, on a `tp2_` database only. `anon` and `authenticated` keep the chain's grants.

**Calls.** Each call emulates the Data API as the #2250 real-stack test does: one transaction, `SET LOCAL ROLE`, and the claims settings for a signed-in caller. A worker's call is `select public.apply_payment_outcome(event_id, attempt)` as `service_role`, in a transaction where `app.current_tenant_id` is unset; the test asserts that before every call.

**Fixtures.** Each test tenant has two legal entities, two ordinary funds and a reserved fee-cover fund on the first, a fund on the second, one connected account (`acct_…`, test mode) and an active binding. An intake is a `donations` row as the begin-gift command would leave it: frozen binding, payment reference, giver name and email, and three lines (6,000 and 4,000 on two funds, 300 fee cover on the reserved fund; 10,300 in all). A provider event is a `stripe_raw_events` row as the account-bound endpoint of 8.2 would store it: the tenant taken from the event's connected account, the payload in Stripe's event shape, and claimed (`processing`, attempt 1).

**Protection removed.** Each rule under test is shown failing without it (section 6 marks the three that were not). A table rule is dropped inside the attacking transaction, which is then rolled back. A rule in the command's code is removed by patching the function's body for one case and restoring it after.

## 4. The three cases of 15.2

| Case                                                                                                                                 | Result                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A valid anchor, fresh transaction, no tenant set                                                                                     | Applied. One transaction writes the observation, the intake's status, a Party and an unclaimed donor relationship, the staged gift with its three lines copied from the intake (the fee-cover line on the reserved fund), two follow-up outbox rows, one audit row and the event's completion. The result echoes the tenant, and the next transaction on the same connection sees no tenant set |
| An unknown anchor: an event ID that does not exist                                                                                   | `unknown_anchor`; a digest of every money row in the database is unchanged                                                                                                                                                                                                                                                                                                                      |
| An unknown anchor: an event from a connected account no tenant holds, whose metadata names a real tenant and intake                  | Stored with no tenant, as 8.2 says. `unknown_anchor`; the digest is unchanged and the named intake is untouched                                                                                                                                                                                                                                                                                 |
| Another tenant's anchor: an event on T2's account that names T1's payment object, and T1's tenant and intake in its metadata (NR-05) | The wrapper enters T2, the command finds no intake with that payment reference on T2's account, and returns `unmatched`. A digest of T1's rows is unchanged                                                                                                                                                                                                                                     |
| The service key calling the guard function directly with T1's tenant and T2's event                                                  | Refused, `42501`: the event is invisible under T1. T1 unchanged                                                                                                                                                                                                                                                                                                                                 |
| An event stamped with T1's tenant but T2's account                                                                                   | Refused at storage, `23503` on `stripe_raw_events_account_same_tenant_fk`                                                                                                                                                                                                                                                                                                                       |

**Three layers stop cross-tenant selection** (section 5 of the test, each layer removed in turn):

- The command looks the intake up by payment reference only, but still runs as the guard: row security hides T1's intake. `unmatched`.
- The command keeps the account-bound lookup but is owned by `postgres`, which bypasses row security: the lookup on T2's account finds nothing. `unmatched`.
- Both removed: T2's event selects T1's intake, so the 15.2 case fails as it should. The first write that mixes the two tenants is then refused: `23503` on `payment_observations_intake_fk`, and T1's rows are unchanged.
- Both removed, and the command also adopts the found intake's tenant and account: still refused, `23503` on `payment_observations_event_same_tenant_fk`, because the observation must name its own event, and that event is T2's.

So a cross-tenant change needs the guard's row security, the account-bound lookup and the tenant-carrying keys all to fail. Each alone keeps T1 unchanged.

## 5. Repeats and order

| Case                                                                   | Result                                                                                                            |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| The same event applied twice                                           | Second call `already_processed`; T1's digest unchanged                                                            |
| A second event with the same success                                   | `no_change`: one staged gift, one success observation, two outbox rows, one audit row                             |
| Two sessions, two events with the same success, at once                | The second waits on the intake row, then reports `no_change`. One gift, one success, three lines, two outbox rows |
| Two sessions, the same event, at once                                  | The second waits on the event row, then reports `already_processed`                                               |
| Success, then an older processing report                               | `stale`; stays completed                                                                                          |
| A failure, then an older processing report                             | `stale`; stays failed                                                                                             |
| A declined card, then the same intent paid with another card           | Completed; one gift                                                                                               |
| Success, then the earlier decline delivered late                       | `stale`; stays completed                                                                                          |
| Success on an intake already closed as abandoned                       | Completed; one gift (8.1, "Close an unpaid intake")                                                               |
| Cancellation after success                                             | `parked`: one repair case; nothing undone                                                                         |
| Success for another amount than the intake's                           | `parked`: one repair case; no staged gift; status unchanged                                                       |
| An event that arrives before its payment reference is recorded         | `unmatched`; nothing written. Once the reference is recorded, the same event and attempt apply                    |
| A call that presents an old attempt number                             | Refused, `55000`; nothing written. The current attempt applies                                                    |
| Guest identity: one donor's email (case and spacing differ, same name) | Attributed to that donor; no hold; still one donor for that email                                                 |
| Guest identity: that email with another name                           | Attributed, and the staged gift holds for review: status and donor match `needs_review`, hold `name_mismatch`     |
| A failed then cancelled payment                                        | Abandoned; no Party, donor, gift or outbox row                                                                    |

**What holds each, shown by removal.** Without the terminal-effect key, a second success event records a second success observation. Without the row lock on the intake, two concurrent repeats still leave one gift and one success, because the keys hold, but the second session read the intake before the first committed and writes its status change and an audit row again: the lock is what keeps a repeat silent, and the keys are what keep it single. Without the terminal-effect key and the lock, two success observations; the gift stays single only because of its own unique key. Without the provider-time rule, an older processing report overwrites a newer failure. Without the attempt check, an old attempt finishes the event.

## 6. Fully constrained

Each invariant that 8.1 to 8.4 state for these rows, what holds it, and the attack that tests it. Every attack runs as the service key, which holds every table privilege and bypasses row security on hosted Supabase; it is the strongest ordinary writer. "Removed" is the result once that rule is dropped in the same rolled-back transaction.

| #   | Invariant                                                               | Held by                                                                                                                                     | Attack                                            | Refused                                     | Removed                                                             |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| 1   | A row never points at another tenant's row                              | Composite keys on every reference, each with a check that makes a nullable reference carry its tenant                                       | A staged gift in T1 for T2's intake               | `23503` `staged_gifts_intake_fk`            | accepted                                                            |
| 1   |                                                                         |                                                                                                                                             | A T1 line moved to T2's fund                      | `23503` `staged_gift_allocations_target_fk` | accepted                                                            |
| 1   |                                                                         |                                                                                                                                             | A T1 observation of T2's intake                   | `23503` `payment_observations_intake_fk`    | accepted                                                            |
| 1   |                                                                         |                                                                                                                                             | A T1 intake frozen to T2's binding                | `23503` `donations_frozen_binding_fk`       | accepted                                                            |
| 2   | One connected account in one mode belongs to one tenant                 | Unique `payment_provider_accounts_account_mode_key`                                                                                         | T2 claims T1's account                            | `23505`                                     | accepted                                                            |
| 3   | An event's tenant is its account's tenant                               | Key `stripe_raw_events_account_same_tenant_fk` and check `stripe_raw_events_tenant_requires_account`                                        | An event stamped T1 with T2's account (section 4) | `23503`                                     | not removed                                                         |
| 4   | An intake is in its legal entity's currency                             | Key `donations_entity_currency_fk`                                                                                                          | An intake in euros for a dollar entity            | `23503`                                     | accepted                                                            |
| 5   | One intake per payment reference (P16)                                  | Unique `donations_payment_reference_key`, and check `donations_payment_reference_bound`, so every reference is account-bound and covered    | A second intake with the same reference           | `23505`                                     | accepted                                                            |
| 5   |                                                                         |                                                                                                                                             | A reference on an unbound intake                  | `23514`                                     | accepted                                                            |
| 6   | One success and one cancellation per payment object                     | Partial unique `payment_observations_terminal_effect_key`                                                                                   | A second success observation                      | `23505`                                     | accepted                                                            |
| 7   | One staged gift per intake                                              | Unique `staged_gifts_donation_unique`                                                                                                       | A second staged gift                              | `23505`                                     | accepted                                                            |
| 8   | The staged gift's amount, currency and legal entity are its intake's    | Key `staged_gifts_intake_fk` to `donations (tenant_id, id, legal_entity_id, amount, currency)`                                              | A staged gift for one cent more                   | `23503`                                     | accepted                                                            |
| 8   |                                                                         |                                                                                                                                             | A staged gift in euros                            | `23503`                                     | accepted                                                            |
| 8   |                                                                         | Same key, and the intake-line sum                                                                                                           | A staged intake's amount changed                  | `23503`                                     | `23514` from the intake-line sum; accepted once that is removed too |
| 9   | A gift's lines sum to its amount                                        | Deferred constraint triggers `staged_gift_allocations_sum`, `staged_gifts_allocation_sum`                                                   | One line raised by one cent                       | `23514` at commit                           | accepted                                                            |
| 10  | A line names a target of its gift's legal entity                        | Keys `staged_gift_allocations_gift_fk`, `staged_gift_allocations_target_fk`                                                                 | A line moved to the tenant's other legal entity   | `23503`                                     | accepted                                                            |
| 11  | The fee-cover line is on the reserved fund, and a donor's line never is | Key `staged_gift_allocations_target_fk` on `(tenant_id, fund_id, legal_entity_id, is_fee_cover)` to the fund's `(…, is_reserved_fee_cover)` | A donor's line moved to the reserved fund         | `23503`                                     | accepted                                                            |
| 11  |                                                                         |                                                                                                                                             | The fee-cover line moved to an ordinary fund      | `23503`                                     | accepted                                                            |
| 12  | Status moves only along valid transitions                               | Check `donations_status_check` and trigger `donations_status_transition`                                                                    | A completed intake set back to failed             | `23514`                                     | accepted                                                            |
| 13  | An attribution hold keeps the gift in review                            | Check `staged_gifts_hold_needs_review`                                                                                                      | A hold on a gift not in review                    | `23514`                                     | accepted                                                            |
| 14  | Intake lines sum to the intake                                          | Deferred constraint triggers `donation_intake_lines_sum`, `donations_intake_line_sum`                                                       | Second layer of row 8                             | `23514`                                     | accepted                                                            |
| 15  | At most one fee-cover line; one reserved fund per entity                | Partial uniques `staged_gift_allocations_one_fee_cover`, `donation_intake_lines_one_fee_cover`, `funds_one_reserved_fee_cover_per_entity`   | not attacked                                      |                                             |                                                                     |
| 16  | Amounts positive or non-negative; currencies ISO                        | Checks; keys to `currency_metadata`                                                                                                         | not attacked                                      |                                             |                                                                     |

**The other two writers.** The guard role, inside T1, is refused a T2 row by row security (`42501`), a T1 row naming T2's intake by the key (`23503`), and a second staged gift by the unique key (`23505`). It holds no `UPDATE` on lines or observations and no `DELETE` anywhere (`42501`), and sees no T2 row. A signed-in user, a T1 finance staff member included, is refused every attack: `42501` where they hold no grant, and no row touched where a grant meets the existing deny policy.

**Invariants no database rule holds**, and what holds them:

| Invariant                                                                                                   | Held by                                                                                      |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Which provider event type is which effect, and that the payload's payment object is the stored reference    | The command's code                                                                           |
| A processing or failed state follows the newest provider report                                             | The command's code, by the provider's event time (section 10, deviation 1)                   |
| Only the current attempt finishes an event                                                                  | The command's code (the lease)                                                               |
| The identity outcome: one donor per email is a unique key, but whether to attribute, create or hold is code | The command's code, and an advisory lock per tenant and email that serializes find-or-create |
| Every change has its audit row and follow-up outbox rows                                                    | The command's code, in the same transaction. A direct writer can skip them                   |
| A staged gift exists only for a paid intake                                                                 | The command's code. A trigger could hold it; the prototype has none                          |
| An observation's event is for the observation's own account                                                 | Same tenant is a key; same account within a tenant is code                                   |

Two limits apply to every database rule above. A deferred check and a key both run as triggers, so a session with `session_replication_role = replica` skips them all, and the table owner can disable the constraint triggers. On this container `postgres` is a superuser; whether hosted Supabase lets `postgres` set that parameter was not checked (section 13). And the sum checks lock the parent row before summing, so that two transactions that each change one gift's lines serialize. No test shows a race without that lock.

## 7. Who may call it

| Caller                            | Wrapper | Guard function directly                                          |
| --------------------------------- | ------- | ---------------------------------------------------------------- |
| `service_role`                    | applies | applies with the event's own tenant; `42501` with another tenant |
| `anon`                            | `42501` | `42501`                                                          |
| `authenticated`, no membership    | `42501` | `42501`                                                          |
| `authenticated`, T1 finance staff | `42501` | `42501`                                                          |

Catalog: `public.apply_payment_outcome(uuid, integer)` is owned by `postgres`, invoker, EXECUTE for `service_role` only. `tenant_guard.apply_payment_outcome(uuid, uuid, integer)` is owned by `tenant_guard`, definer, EXECUTE for `service_role` only.

**Nothing from `auth`.** The command takes no caller and reads nothing in `auth` or `authz`; no prototype object references either schema. The only guard policy that calls `auth.uid()` is stage 1's own-assignments policy on `authz.memberships`, which the command never reads. So the claims-setting fallback for the session caller does not touch it.

## 8. Cost

### 8.1 Method

`tp2_cost` has the chain, the prototype, the harness and `scripts/proofs/tp2/fixture.sql`: two tenants, each with 1,000,000 Parties, donors, intakes, intake lines, provider events, observations, staged gifts, lines, outbox rows and audit rows, and 6,000 claimed open intakes with three lines each. Half the open intakes carry the email and name of an existing donor (the attribution path), half a new email (the new-Party path). The database is 9.2 GB. The load took about 22 minutes with `session_replication_role = replica`; afterwards 1,000 lines were deleted and re-inserted with every key and the sum check on, and passed.

The server is Postgres 17.10 in the shared container on this Windows workstation: 20 CPUs with no CPU limit, `shared_buffers` 128 MB, `work_mem` 4 MB, `synchronous_commit` on. Each call is one transaction sent in one round trip (begin, the service key's role, the wrapper, commit), as the Data API sends one RPC. Each phase applies events no earlier phase used, so every call is a success that writes every effect: a new Party and donor or an attribution, a staged gift with three lines, two outbox rows, an audit row and the event's completion.

### 8.2 Results

Times in milliseconds.

| Phase                                       | Calls | p50 | p95 | p99 | Max   | Throughput         |
| ------------------------------------------- | ----- | --- | --- | --- | ----- | ------------------ |
| One at a time                               | 400   | 70  | 167 | 231 | 326   | —                  |
| of which a new Party                        | 200   | 73  | 167 | 299 | 326   | —                  |
| of which an attribution                     | 200   | 68  | 167 | 231 | 295   | —                  |
| Twenty sessions at once, one tenant         | 2,000 | 126 | 312 | 757 | 1,159 | 121 calls a second |
| Twenty sessions at once, ten in each tenant | 2,000 | 132 | 284 | 577 | 986   | 129 calls a second |

**Where the time goes.** For 200 calls one at a time, the command statement takes 48 ms at the median (p95 127) and its commit 28 ms (p95 84). The commit includes the deferred line-sum checks and the flush of the commit log to disk. With `synchronous_commit` off for the transaction, the statement takes 41 ms and the commit 7.5 ms (p95 31). So about 20 ms of every call is the disk flush on this machine. The statement's own time is mostly cold reads: 128 MB of shared buffers hold under 2% of the fixture.

**Locks.** Just before it commits, one call holds on each table it touches only row share (foreign-key checks and its two row locks), row exclusive (its writes) and access share (its reads); one advisory lock, for the tenant and email; and its own transaction ID. Its row locks are on the event and the intake (`FOR NO KEY UPDATE`), and key-share locks from the foreign-key checks on the tenant, legal entity, binding, account, funds, Party and donor rows. Calls on different intakes do not conflict on any of these: key-share locks on shared parent rows are compatible with each other. That is why one tenant and two tenants measure alike.

**Waits under concurrency.** A sampler read the twenty sessions' wait events every 25 ms. In the one-tenant run, 1,455 samples waited on writing the commit log (`WALWrite`), 60 on the lock manager's lightweight lock, 16 on buffer content and fewer on others; in the two-tenant run, 924, 36 and 51. No sample showed a heavyweight lock wait (`Lock`), so no call waited on another's row, and there was no deadlock. The concurrent tail (p99 577 to 757 ms, worst 1.16 s) is commit-log flushing and cold reads, not locking.

**Plans.** Every lookup on a large table is an index scan, under the guard role and its policy: the wrapper's anchor read by primary key (and the two-row account table by a sequential scan); the event re-read by primary key; the intake by `donations_payment_reference_key`; the newer-report test as an index-only scan on `(tenant_id, donation_id, provider_created_at)`; the donor by `donors_tenant_email_normalized_uidx`; and the two line sums by `staged_gift_allocations_line_key` and `donation_intake_lines_donation`. Each took 1 to 36 ms here, the longer ones on cold pages.

### 8.3 Against the budgets of 9.2

| Budget                                                                       | Measured                                                                                                                                        |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Transactional write: under two seconds, with no external call inside         | Inside. p95 167 ms alone and 284 to 312 ms with twenty sessions; the worst single call of 4,400 took 1.16 s. The command makes no external call |
| Normal indexed read, p95 300 ms at the database                              | Every read inside the command is an indexed point read; none took more than 36 ms                                                               |
| Policy cost: the tenant and the membership check resolved once per statement | The command checks no membership. The guard policy compares `tenant_id` with a setting, and the planner uses it as an index condition           |

On this machine twenty sessions apply about 125 outcomes a second, limited by the commit-log flush. That is about 450,000 an hour, against a first release of about 20 tenants.

## 9. The shape WP8a should adopt

**Lane, owner, grants.** A worker entry point in `tenant_guard`, owned by `tenant_guard` (NOLOGIN, NOBYPASSRLS), `SECURITY DEFINER`, `SET search_path = ''`, EXECUTE for `service_role` only. A `public` wrapper, owned by `postgres`, `SECURITY INVOKER`, `SET search_path = ''`, EXECUTE for `service_role` only. The guard holds, each behind a `tenant_guard_isolation` policy: `SELECT, UPDATE` on the event store and on `donations`; `SELECT` on provider accounts, bindings and intake lines; `SELECT, INSERT` on observations, repair cases, `persons`, `donors`, `staged_gifts`, `staged_gift_allocations` and the outbox; `INSERT` on `audit_logs`; and EXECUTE on `public.normalize_currency_code(text)` and `public.normalize_email(text)`. No `DELETE` anywhere.

**The anchor.** The stored provider event. Its connected account and mode name exactly one tenant through `payment_provider_accounts`, and the event store's `(tenant_id, stripe_account, livemode)` is a key to that table, so the tenant stamped at storage cannot disagree with the account.

**The signature.**

```sql
-- The wrapper: the only thing the worker calls.
CREATE FUNCTION public.apply_payment_outcome(p_event_id uuid, p_attempt integer)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_tenant uuid;
BEGIN
  SELECT a.tenant_id INTO v_tenant
    FROM public.stripe_raw_events AS e
    JOIN public.payment_provider_accounts AS a
      ON a.provider_account_id = e.stripe_account AND a.livemode = e.livemode
   WHERE e.id = p_event_id;
  IF v_tenant IS NULL THEN
    RETURN pg_catalog.jsonb_build_object('event_id', p_event_id, 'outcome', 'unknown_anchor');
  END IF;
  RETURN tenant_guard.apply_payment_outcome(v_tenant, p_event_id, p_attempt);
END $$;

-- The worker entry: its first statement enters the tenant, its second re-reads
-- the anchor under the guard's policy.
CREATE FUNCTION tenant_guard.apply_payment_outcome(p_tenant_id uuid, p_event_id uuid, p_attempt integer)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
...
BEGIN
  PERFORM tenant_guard.enter(p_tenant_id);
  SELECT e.* INTO v_event FROM public.stripe_raw_events AS e
   WHERE e.id = p_event_id FOR NO KEY UPDATE;          -- refuse 42501 if not found
  SELECT a.* INTO v_account FROM public.payment_provider_accounts AS a
   WHERE a.provider_account_id = v_event.stripe_account
     AND a.livemode = v_event.livemode;                -- refuse 42501 if not found
  -- finished: report; not the current attempt: refuse 55000
  -- effect, payment object, amount, currency and time from the stored payload only
  SELECT d.* INTO v_intake FROM public.donations AS d
   WHERE d.provider_account_ref = v_account.id
     AND d.stripe_payment_intent_id = v_pi FOR NO KEY UPDATE;   -- none: 'unmatched', write nothing
  -- reduce; insert the observation ON CONFLICT DO NOTHING; on success ensure
  -- identity, staged gift and lines, outbox rows; audit when anything changed;
  -- complete the event WHERE process_attempts = p_attempt
END $$;
```

The full body is in `20261117150201_tp2_apply_payment_outcome.sql`. Three properties matter more than the rest. The caller supplies only the event and its attempt, never the tenant, amount, currency, payment object or outcome. On success every effect is ensured on every run, so nothing returns early past a missing effect (P6). Locks are taken in one order, event then intake then the per-email advisory lock, so two calls cannot deadlock on them; none occurred in any run.

**The constraints.** All of section 6, rows 1 to 16, as written in `20261117150152_tp2_money_command_schema.sql`. The ones WP8a must not drop:

```sql
-- one account, one tenant; an event's tenant is its account's
ALTER TABLE public.payment_provider_accounts ADD UNIQUE (provider_account_id, livemode);
ALTER TABLE public.stripe_raw_events
  ADD CHECK (tenant_id IS NULL OR stripe_account IS NOT NULL),
  ADD FOREIGN KEY (tenant_id, stripe_account, livemode)
      REFERENCES public.payment_provider_accounts (tenant_id, provider_account_id, livemode);
-- the unique payment reference, covering every row that has one
ALTER TABLE public.donations
  ADD CHECK (stripe_payment_intent_id IS NULL OR binding_id IS NOT NULL),
  ADD UNIQUE (provider_account_ref, stripe_payment_intent_id),
  ADD FOREIGN KEY (tenant_id, binding_id, legal_entity_id, provider_account_ref)
      REFERENCES public.payment_account_bindings (tenant_id, id, legal_entity_id, provider_account_ref);
-- the business-effect key, terminal effects only
CREATE UNIQUE INDEX ON public.payment_observations (provider_account_ref, payment_object_id, effect_kind)
  WHERE effect_kind IN ('succeeded', 'canceled');
-- the staged gift is its intake's, in amount, currency and legal entity
ALTER TABLE public.staged_gifts ADD FOREIGN KEY (tenant_id, donation_id, legal_entity_id, amount, currency)
  REFERENCES public.donations (tenant_id, id, legal_entity_id, amount, currency);
-- lines of the gift's entity; fee cover exactly on the reserved fund
ALTER TABLE public.staged_gift_allocations
  ADD FOREIGN KEY (tenant_id, staged_gift_id, legal_entity_id)
      REFERENCES public.staged_gifts (tenant_id, id, legal_entity_id),
  ADD FOREIGN KEY (tenant_id, fund_id, legal_entity_id, is_fee_cover)
      REFERENCES public.funds (tenant_id, id, legal_entity_id, is_reserved_fee_cover);
-- and the deferred line-sum triggers, which lock the parent before summing
```

## 10. Where the plan's wording must change

1. **The business-effect key covers terminal effects only.** 8.1 keys "Apply payment outcome" on "Provider account + payment object + effect kind". That is right for success and cancellation, which happen at most once per payment object. A processing or failed report can recur for one payment object: a bank debit goes processing, fails, and is retried; a card is declined twice. Keyed by effect kind, the second failure would be dropped and the state would stay processing. The prototype keys every observation by its provider event, keys success and cancellation by payment object, and moves a non-terminal state only when the report is newer, by the provider's event time, than every earlier report for that intake. Stripe's event time is in whole seconds, so two reports in one second are a tie, and a tie keeps the current state until the next report or reconciliation. Proposed wording for the key: "Provider account + payment object + effect kind for success and cancellation; the provider event for processing and failure, applied only when newer than every earlier report."
2. **An unmatched payment is not parked on first sight.** 8.3 says a provider payment that matches no local operation parks a case. At the first apply, "no match" is usually a race: the event can arrive before the outbox worker has recorded the payment reference. The command writes nothing and reports `unmatched`, and the lease rule of 8.2 retries the event; it parks only when the event dead-letters. Proposed: "parks one case when its event exhausts its attempts".
3. **The account is a table of its own.** 8.2 resolves tenant and binding "from the event's account and mode", and a binding version may name a new account. Nothing in the plan says that one account belongs to one tenant, and without that rule the event's account cannot name a tenant. The prototype adds `payment_provider_accounts`, unique on account and mode, which bindings and the event store reference. WP8a should name it.
4. **The matcher cannot run in the command.** 5.4 has the payment-outcome command set an attribution hold "when the existing matcher scores a possible duplicate". The matcher is TypeScript (`packages/api/src/donate/guest/donor-matching.ts`) and needs other donors' names, addresses and phones. The prototype builds the name-mismatch hold only. WP8a must either port the deterministic rule (exact name and similar address) to SQL, which needs the giver's address on the intake row, or let the worker pass a flag that can only add a hold. The first keeps "nothing from the caller"; the second is simpler.
5. **The signed-in rows of 5.4 need facts stored at intake.** The command runs later, on the worker lane, with no session. To apply "signed in, matched by the session's confirmed email", it needs the verified user ID and the email Auth had confirmed, stored on the intake row by the intake command. It should not read `auth.users`: the guard holds no right there, and on Supabase's image it cannot be given one. With those two facts stored, the command needs nothing from `auth`.
6. **"Constraints" includes four triggers.** Two line sums and the status transitions cannot be declarative. They are database rules all the same, and they refuse the service key, but a migration owner can disable them. 8.1's "held in place by database constraints" should say "database rules".
7. **The staged gift's amount key freezes the intake amount.** Once a gift is staged, the intake's amount and currency cannot change (row 8 of section 6). That matches the plan. But WP8c's "adopt" records a gift "at the amount the provider collected" for a payment that matches no local operation; under this key it must first create an intake at that amount and then apply the outcome through the same command. TP4 should design to that.
8. **WP8a's line keys refuse the review writer that only WP8b replaces.** The allocation keys the copy needs (legal entity, line number, fee-cover flag, line sum) refuse today's `replace_staged_gift_allocations`: called on a prototype gift, it fails on `legal_entity_id` not null. WP8a and WP8b ship as separate releases, so either WP8a updates that function, or the legacy review route is closed in WP8a. The other legacy writers WP8a's keys refuse are ones WP8a removes anyway: `complete_donation_saga_event` sets a payment reference on an unbound intake (`donations_payment_reference_bound`), `stageGiftFromStripeDonation` inserts a staged gift with no legal entity, and the event store's intake stamps a tenant from metadata with no account. They must go in the same release as the keys.
9. **Follow-up rows need a kind on the outbox.** The outbox gains a `kind` column for the thank-you and the posting check. Today's outbox worker claims every pending row as a provider request, so it must filter on kind, or follow-ups go to a table of their own.
10. **A command's grants include functions its tables' triggers call.** 5.4 has each command bring "the least table privilege and the guard policy". The guard also needs EXECUTE on `public.normalize_currency_code(text)`: the currency trigger on `staged_gifts` calls it as the inserting role, and without the grant the insert fails with "permission denied for function normalize_currency_code".
11. **Event completion carries the lease.** 8.1 lists "event completion" in the transaction; 8.2's lease rule requires the current attempt. So the command's signature includes the attempt number, and an old attempt is refused before anything is written.

## 11. What the convention and the gate need

**The convention has a place for this command,** and the gate admitted it unchanged: worker entry in `tenant_guard`, invoker wrapper in `public`, `service_role` only on both. What "Worker entry points" in `docs/security/tenant-guard.md` lacks is the recipe that "Adding a human entry point" has. Proposed steps:

1. `tenant_guard.<command>(p_tenant_id uuid, <anchor> uuid, …) RETURNS jsonb`, definer, `SET search_path = ''`, owned by `tenant_guard`. Its first statement is `PERFORM tenant_guard.enter(p_tenant_id)`; its next reads the anchor under the guard's policy, locked, and refuses with `42501` if it is not found. It takes nothing about the effect from its arguments.
2. The anchor's tenant is tied by a key to whatever names it: here the event store's tenant to its account's.
3. Grants: the least table privilege behind a guard policy, plus EXECUTE on every function the tables' triggers call as the invoking role.
4. The wrapper is `plpgsql` or `sql`, invoker, takes the anchor and no tenant, derives the tenant by a read, returns a refusal for an unknown anchor, and writes nothing.
5. Money tables: every reference carries the tenant (generalize #2252's rule for donor references), and every sum rule is a deferred check that locks its parent row.

**The gate cannot see two rules that make a worker entry safe.** Inside a rolled-back transaction, the test planted a `service_role` wrapper that passes its caller's tenant straight to the guard function, and a guard-owned worker function that never enters a tenant and writes a table. The gate reported no failure for either. Proposed checks, each parallel to one that exists for human entry points:

- `WORKER_NO_ENTER`: a `tenant_guard` function that `service_role` may execute whose first statement is not `tenant_guard.enter(...)`, outside any `EXCEPTION` section.
- `WORKER_WRAPPER_TENANT_ARGUMENT`: a wrapper that `service_role` may execute and that passes one of its own parameters as the first argument of a `tenant_guard` function.
- `WORKER_WRAPPER_WRITES`: a wrapper whose body has `INSERT`, `UPDATE` or `DELETE` outside its calls.

The workflow claim pair (P1) predates the anchor rule and would need a listed exception to the second check.

## 12. Other findings

- **The census cost is small but real.** `donations` is a classified record type. Five new columns and two nullability changes need manifest entries and 25 new field-policy rows in the same migration; `donors.person_id` needs five more. The census and the catalog gate both caught nothing else.
- **`donations.tenant_id` defaulted to a real tenant ID** (`00000000-0000-0000-0000-000000000001`). The prototype drops the default with `SET NOT NULL`; WP8a should too.
- **`donors.email_normalized` is generated.** A command that creates a donor must not write it; the first version of the prototype did and failed.
- **The single-column references the prototype replaced** (`staged_gifts_donor_id_fkey`, `donation_saga_outbox_donor_id_fkey`) are on the follow-up list in `docs/security/tenant-guard.md` ("Composite tenant FKs"). WP8a removes them from that list in the same change.
- **The delete cascades the prototype replaced** (from `donations` to `staged_gifts` and the outbox, and from `staged_gifts` to their lines) are now `NO ACTION`, as 8.4 asks (P18). The other cascades from `donations` (adjustments, corrections, refund attempts, the operation audit) and every tenant foreign key are unchanged; WP8c and NA-02 change those.

## 13. Not measured

- **Hosted Supabase.** `postgres` is not a superuser there. Not checked: the owner transfer to `tenant_guard` of this function (WP1's hosted proof covers the mechanism), whether `postgres` may set `session_replication_role`, and timings on a hosted compute size.
- **The Data API.** Calls emulate PostgREST with `SET LOCAL ROLE`; no PostgREST container was used, so a real round trip and its JSON encoding are not in the numbers.
- **The lease itself.** No claim or reclaim function was built; fixtures store claimed events. Dead-lettering, and so the parking of an unmatched payment, is not exercised.
- **The rest of WP8.** Refunds, disputes, posting and corrections use the same keys but were not built. The signed-in identity rows and the duplicate matcher were not built (section 10, items 4 and 5).
- **Write skew on the line sums.** The checks lock the parent row; no test shows a race without that lock.
- **Shared parent rows.** Twenty concurrent calls take key-share locks on the same tenant, entity, binding and fund rows. That creates multixacts; their growth and the vacuum work they cause were not measured, only that no call waited.
- **Bloat.** The intake update is not a heap-only update (its status and donor are indexed), so each call writes a new entry in each of the intake's 15 indexes. Vacuum and index growth over time were not measured.
- **Migrating real rows.** The development database holds 36 donations and no staged gifts. Adding these keys to a populated table needs a validation pass and a quiet window, which was not timed.
- **A hosted run would add** the owner transfer, the Data API round trip, real Connect test-mode events through a test webhook endpoint, and timings on the production compute size.

## 14. How to repeat

All commands run from the repository root. Never point them at a hosted project.

```sh
# 1. The base chain, for comparison, from a clean checkout of bec3bf06a.
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "create database tp2_base"
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp2_base node scripts/verify/supabase-migrations.mjs

# 2. The prototype: apply tp2-prototype.patch, then the chain, both gates and the harness.
git apply tp2-prototype.patch
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "create database tp2_proof"
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp2_proof node scripts/verify/supabase-migrations.mjs
psql postgresql://postgres:postgres@127.0.0.1:25432/tp2_proof -f scripts/proofs/tp2/harness.sql

# 3. The behaviour tests.
TP2_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp2_proof \
  bun x vitest run tests/unit/acceptance/tp2-money-command/apply-payment-outcome.realstack.test.ts

# 4. The cost.
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres -c "create database tp2_cost"
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp2_cost node scripts/verify/supabase-migrations.mjs
psql postgresql://postgres:postgres@127.0.0.1:25432/tp2_cost -f scripts/proofs/tp2/harness.sql
psql postgresql://postgres:postgres@127.0.0.1:25432/tp2_cost -v rows=1000000 -v open=6000 -f scripts/proofs/tp2/fixture.sql
TP2_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp2_cost TP2_OUT=cost.json node scripts/proofs/tp2/measure.mjs
TP2_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:25432/tp2_cost node scripts/proofs/tp2/measure-commit-split.mjs

# 5. Clean up.
psql postgresql://postgres:postgres@127.0.0.1:25432/postgres \
  -c "drop database tp2_base" -c "drop database tp2_proof" -c "drop database tp2_cost"
```

The prototype patch is `tp2-prototype.patch`: section 2's files against `bec3bf06a`, without this report. The repository's `bun run supabase -- migration new` failed on this machine because its `npx` fallback hit an npm override conflict in the repository's `package.json`; the migration files were created with the same pinned CLI (`npx -y supabase@2.121.0 migration new <name> --workdir <worktree>`) run from outside the repository.

## 15. Checks run

| Check                                                                                      | Result                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/verify/supabase-migrations.mjs` on `tp2_base` (108 migrations, no prototype) | passed: census 176 columns and 880 rows; catalog gate 145 tenant tables, 4 wrappers                                                                                                                                                      |
| The same on `tp2_proof` (111 migrations)                                                   | passed at the first run: census 182 columns and 910 rows; catalog gate 151 tenant tables (68 with policies, 83 listed), 86 definer functions, 5 wrappers                                                                                 |
| The same on `tp2_cost`, with the final migration text                                      | passed, same counts                                                                                                                                                                                                                      |
| The real-stack test against `tp2_proof`                                                    | 39 passed. The first run failed 13: the command wrote `donors.email_normalized`, a generated column (fixed in the command). Two later runs failed on test mistakes (a connection released mid-transaction, a wrong property read), fixed |
| The same test with no environment                                                          | 39 skipped                                                                                                                                                                                                                               |
| `scripts/proofs/tp2/fixture.sql` on `tp2_cost`                                             | loaded; the key sample passed                                                                                                                                                                                                            |
| `scripts/proofs/tp2/measure.mjs` and `measure-commit-split.mjs`                            | completed; every call returned `applied`                                                                                                                                                                                                 |
| The legacy `replace_staged_gift_allocations` on a prototype gift                           | refused on `legal_entity_id` not null (section 10, item 8)                                                                                                                                                                               |
| A staged-gift insert as the guard without EXECUTE on `normalize_currency_code`             | refused, permission denied for that function (section 10, item 10)                                                                                                                                                                       |
| `bun x eslint` on the test                                                                 | passed (`scripts/proofs` is on ESLint's ignore list)                                                                                                                                                                                     |
| A one-off type check of the test (the acceptance tests are in no type-check project)       | passed after one fix: a destructured array typed as possibly undefined                                                                                                                                                                   |
| `bun x prettier --check` on every changed file except the SQL                              | passed                                                                                                                                                                                                                                   |

The full unit suite was not run, to keep the shared machine usable.
