# 0009. The provider-operation record's suites and the pins it moves

**Status:** Recorded on 2026-11-25 with AL-2681 (WP8a part 2, slice R1a);
decisions 6 to 11 added with slice R1b; decisions 12 to 20 with slice R2a;
decisions 21 to 29 with the rest's first pull request (the kernel).
Source comments are banned since AL-2676
([#2751](https://github.com/Asymmetric-al/core/issues/2751)), so the reasons
that record D-18 of the implementation record would have put in each frozen
file are written here and in each edited test's title. It describes the code as
it is and ratifies no product intent. Accepted platform intent is in
[`docs/adr/`](../../../docs/adr/README.md). The number 0008 is held by WP5
part 2's first package.

## Context

R1a adds the record of one request to the payment provider: a `kind` on
`public.donation_saga_outbox` (`legacy_saga` for every live row,
`provider_request` for a row the guard inserts), the request's columns, checks
and rules trigger, `public.payment_repair_cases`, the line-based intake
generation on `public.donations`, and three guard functions with two
`service_role` wrappers (migrations `20261126020000` to `20261126020200`).
Nothing live calls them, and the live build's rows are untouched.

R1b adds the worker that calls them, unmounted
(`packages/api/src/donate/provider-operations/`), a fake provider for its
tests, the rule that a repair case is inserted open and on a provider request
only, and the command-entry gate's whole-statement anchor read.

R2a adds the paid intake (migrations `*_wp8a2_r2a_fee_cover_key.sql`,
`*_wp8a2_r2a_intake_lines.sql`, `*_wp8a2_r2a_staging_generation.sql`,
`*_wp8a2_r2a_payment_observations.sql` and `*_wp8a2_r2a_enqueue_and_apply.sql`,
M1 to M5): a key on the reserved fee-cover fund and its backfill, the ordered
and immutable lines of a line-based intake, the staging generation that copies
them into one staged gift, the record of what the provider reported on part
1's event lane, the request's amount key, the one writer of a provider
request, and the command that applies a stored payment event. Nothing live
writes a line-based intake, a provider request or a connected payment event.

## Decisions

1. **The nine suites under `tests/unit/acceptance/issue-2681/wp8a-p2r1a-*`**
   read only `TENANT_GUARD_IT_ADMIN_DATABASE_URL` and run in the `migrate`
   job's program step (one file at a time). Every test but the two-session
   races runs in one transaction that is always rolled back.
2. **Time moves in replica mode.** A test that needs a lease to have expired
   or a send window to have closed rewrites the row's times as the owner under
   `session_replication_role = replica`, which skips the rules trigger but not
   the checks (TP4 section 6). The rewrite reads `clock_timestamp()` once, so
   the 23-hour window check holds to the microsecond.
3. **Grants a test needs are given inside its transaction** (coordinator's
   note 2): `INSERT` on both tables and `EXECUTE` on
   `public.normalize_currency_code(text)` to the guard for its fixtures, and
   table `INSERT`, `UPDATE` or `DELETE` to the tested role where a test proves
   a trigger or a check behind those grants (plain Postgres gives
   `service_role` `SELECT` only). They take a transaction advisory lock first,
   so suites that run side by side do not race on the same grant. C15, C16
   and F25 assert the migrations' own grants, unmodified.
4. **The two-session races (D20) commit their fixtures**, revoke the test
   grants before that commit, and remove their two tenants as the owner under
   replica mode, so no committed row and no committed grant is left behind.
5. **A2 is read as the guard role's contract item 7**: `postgres`, the
   migration owner, is the one member of `tenant_guard` (`INHERIT FALSE`,
   `SET TRUE`); no other login role reaches it, directly or through another
   role. Read literally ("no login role is a member"), the brief's line is
   false on every database, because `postgres` is a login role.
6. **R1b split the two long suites, moving each test unchanged.** The
   machine suite (1,605 lines) became `machine-claims` (D14 to D19),
   `machine-reports` (D21 to D24), `machine-guards` (F1.1 to F1.5 and F5) and
   `machine-sessions` (D20 and F2, the two-session tests, with the session
   helpers they share); the record suite (1,339 lines) became `record-checks`
   (C8, C9 and its expression assertion), `record-params` (C10, C13, C14) and
   `record-fence` (C11, C12, C15, C16, F1.6). Every `it` keeps its title and
   body byte for byte; a describe-local helper two parts need is copied
   verbatim into each, and each part keeps the test that fails, never skips,
   without its database URL in `migrate`. No part is longer than about 700
   lines.
7. **What R1a's review owed (record `:1062`) changed three tests after the
   split.** `race()` attaches its rejection handler where the second
   session's query is created and rethrows after the first session's
   `COMMIT`, so a wait loop that gives up never leaves a rejection unhandled.
   F2 rolls the holder session back before it releases the sessions and
   removes its tenants, instead of relying on the order in which connections
   are torn down. The expression assertion of C9 (finding 6) keeps only the
   checks the NULL matrix samples (see the pins below).
8. **R1b's worker suite `wp8a-p2r1b-worker` runs the unmounted module against
   the record.** Its RPC invoker calls the two `public` wrappers as
   `service_role` with no tenant set, through R1a's harness; C4, the one
   two-worker case, runs each call as its own committed transaction in its
   own session and removes its tenants as D20 does. The suite loads the
   module lazily, so its migration tests (G1 to G6) fail and pass on their
   own. G6 runs the migration's Down, read from its header, inside a
   rolled-back transaction and checks that F27's values come back and that
   the rules function is R1a's, byte for byte (the header writes a blank line
   of the function as a bare `--`).
9. **The fake provider is `tests/fixtures/stripe-provider-fake.ts`**, beside
   the other shared fixtures, because R2 imports it. It is a transport in the
   shape the Stripe SDK calls, never imports `stripe` at run time (the root
   has no `node_modules/stripe`), keeps keys per account with Stripe's
   replay, mismatch (400 `idempotency_error`) and in-flight (409) answers,
   and has its own clock for the 24-hour key window. Every test file that can
   reach the adapter or the SDK stubs the global `fetch` with a function that
   throws, so a mistake fails a test instead of reaching the network; the
   only key the tests pass is a placeholder in the test-key shape.
10. **Two fixtures of the command-entry gate become single-table reads**
    (`#2776`'s third item): the compliant wrapper and the `FOR NO KEY UPDATE`
    wrapper of `tests/unit/scripts/tenant-rls-catalog.test.ts` read their
    anchor through a `JOIN`, which passed only because the gate matched the
    prefix of the statement. A `JOIN` now fails, as E4 shows; each title says
    so.
11. **F27 moves with the INSERT rule** (migration
    `20261126080000_wp8a2_r1b_repair_case_insert_rule.sql`): the guard keeps
    `SELECT` on `public.payment_repair_cases` and holds `INSERT` of
    `tenant_id`, `kind`, `operation_id` and `donation_id` only, so the table
    ACL reads `tenant_guard:SELECT` and four columns carry a grant. The Down
    revokes the table `INSERT` first, which removes the column grants, and
    then grants it back, so F27 reads R1a's values after it.

12. **R2a's eight suites under `tests/unit/acceptance/issue-2681/wp8a-p2r2a-*`**
    (`schema`, `staging`, `enqueue`, `apply-order`, `apply-match`, `fences`,
    `sessions`, `live`) read only `TENANT_GUARD_IT_ADMIN_DATABASE_URL`, fail
    and never skip in `migrate`, and roll every test back but four in
    `sessions`: C7 (b), the two C14 races and B2, each of which commits two
    tenants with their fixtures and removes them in replica mode in its
    `finally`. The test grants are revoked in the same transaction that
    commits the fixtures, so none outlives it. A run stopped before the
    `finally` leaves those two tenants and the rows keyed to them (legal
    entities, accounts, bindings, funds, intakes and lines, requests,
    events, observations, staged gifts and allocations, tasks, links and
    audit rows) in the database; `removeTwoTenants` with their ids, or a
    fresh database, removes them. Their helpers are
    `wp8a-p2r2a-harness.ts` (it re-exports R1a's harness; an event is stored
    as 2b's route will store it, a `service_role` insert into
    `stripe_connect_events`, claimed with `public.claim_provider_event` and
    released with `public.record_provider_event_failure`) and
    `wp8a-p2r2a-worker.ts` (R1b's `runProviderOperation` over the fake). A
    file finds a migration by `^\d{14}_wp8a2_r2a_<name>\.sql$`, so the
    re-date at the final merge is one `git mv` per file. Every file that
    reaches the adapter or the SDK stubs `fetch` with a function that throws.
13. **The guard's test grants after R2a.** M3 grants the guard EXECUTE on
    `public.normalize_currency_code(text)` and M4 grants it `INSERT` of the
    thirteen outbox columns the enqueue names, so `GUARD_TEST_GRANTS` keeps
    only what no migration gives: table `INSERT` on `donations` and
    `donation_intake_lines` (2b's intake command brings them) and the outbox
    column `max_attempts`, which `guardIntake` names. `GUARD_TEST_REVOKES`
    takes those back by table and by column. A table `REVOKE` on the outbox
    would also strip M4's column grants, and a committed one would strip them
    from the shared database, so no test revokes the outbox's table `INSERT`.
    `GUARD_WIDE_INSERT_GRANTS` (the outbox's table `INSERT`) is used only
    inside rolled-back transactions, by the two tests that insert an outbox
    column outside the guard's grant to reach a rule behind it: R1a's A1
    (the kind) and C14 (rule I).
14. **A deferred balance is proven inside a rolled-back transaction** by
    `SET CONSTRAINTS <the balance triggers> IMMEDIATE` in a savepoint, then
    `DEFERRED` again, naming the R2a triggers only, so no other deferrable
    constraint of the chain changes mode. A pending event of an earlier
    statement fires too, so A2 rolls its key checks back to a savepoint before
    it tests the balance.
15. **F1 drives the real `POST /api/donate`** with module mocks of the auth
    context, the admin client, the tenant's Stripe client, the settlement
    currency, the audit logger and the saga processor (the forms of
    `packages/api/tests/unit/donate-checkout.mocks.ts`), and a client whose
    `rpc` runs `public.begin_donation_saga` and whose one table read runs the
    donations select as `service_role` in the test's transaction, with the
    `donor:donors(profile:profiles!profile_id(id))` embed written as a join.
    It proves ruling Q-C's interim: a replayed `gift:<id>:create_payment` key
    finds the provider request, `giftMismatches` reports the intake as
    another person's gift, and the route answers `409` with nothing written.
16. **The static scan of D1** reads `pg_get_functiondef` of M5's four
    functions and the seven trigger functions, removes comments and string
    literals, and lists every name followed by `(` that no `.` qualifies and
    that is not a SQL or PL/pgSQL word; a self-check proves an unqualified
    `format(` is caught and a qualified call or a column list is not.
17. **What `jsonb` cannot keep.** An event's payload is stored as `jsonb`,
    which reads `1e2` as `100` (the fences suite shows it), so the apply
    cannot refuse an amount written `1e2`. `100.0` and `"100"` stay distinct
    and are refused (`22023 payment_event_malformed`). 2b's route, which
    holds the raw text, is where `1e2` can be refused.
18. **The currency boundary.** R2a compares the intake, the request, its
    parameters and the event's amounts as exact integers in one currency.
    That holds because every legal entity is `usd`
    (`20261123030100_wp8a_legal_entities_and_funds_field_policies.sql`, the
    `legal_entities_currency_check`), where `currency_metadata`'s ISO minor
    unit equals Stripe's charge unit (`20261003051630_currency_foundation.sql`,
    `stripe_charge_exponent` and `stripe_charge_multiple`). Admitting a
    currency whose exponent differs from its Stripe charge exponent, or whose
    charge multiple exceeds 1, needs unit conversion and the multiple
    enforced first.
19. **`GUARD_REACH` prints `public.normalize_currency_code(text)`.** The
    `issue-2250` suite sets `search_path = ''`, so `regprocedure` qualifies
    the name, and the entry sorts after `private.share_lock_tenant(uuid)`.
20. **A linked or adopted request's foreign event is
    `intake_names_another_object`.** The operation match checks the intake
    before the request's status (index 4.3 (b)), and every writer that links
    or adopts a request records the intake's payment reference in the same
    transaction, so C9 names that reason for both; its `request_linked` case
    sets the request in replica mode with the intake's reference left NULL, a
    state no writer leaves, and stays only as the guard of the last branch.

21. **The rest's seven suites** (`wp8a-rest1-identity`, `-holds`,
    `-unpaid`, `-item-zero`, `-review`, `-sessions` and the PostgREST
    `-reads`) follow decisions 1, 9 and 12: only
    `TENANT_GUARD_IT_ADMIN_DATABASE_URL` (the reads suite: the stack's URL,
    database and service key in `local-supabase`), failing never skipping,
    R2a's harness (`wp8a-rest1-harness.ts` re-exports it), every test rolled
    back but the two-session ones and 2837's isolation test, which commit two
    tenants and remove them, and the logins they made, in their `finally`.
    Each realstack suite also passes on Supabase's own image.
22. **R1a's and R2a's harnesses gain the giver.** `GUARD_TEST_GRANTS` grants,
    and `GUARD_TEST_REVOKES` takes back, `INSERT` on
    `donation_intake_contacts` (2b's intake brings it); R2a's `lineIntake`
    writes one contact row with an address of its own, because a paid intake
    with no account to resolve and no email now refuses (`22023
giver_email_missing`); `removeTwoTenants` also removes holds, event
    cases, contacts, threshold rows, links, memberships, donors, workers and
    Parties of the two tenants.
23. **"Same" for names is JavaScript's `trim()` then `lower()`**, the trim set
    written out (ECMAScript WhiteSpace and LineTerminator, the set
    `payment_repair_cases`' reason check trims), inner spaces kept. `lower()`
    follows the database collation (`en_US.utf8` in CI) and can differ from
    JavaScript's `toLowerCase()` for a few letters (dotted capital I, final
    sigma). `donors` has one `name`, so a giver's first and last name, each
    normalized, are joined by one space and compared with it.
24. **A non-`usd` threshold** cannot be reached through an intake (every
    legal entity is `usd`, decision 18), so the rule is read on its helper,
    `private.money_large_gift_hold`.
25. **2837's comment is proven by mutants.** Each case replaces the core,
    inside its rolled-back transaction, by `pg_get_functiondef` with one
    filter line removed, and shows the answer is no longer
    `unknown_operation`.
26. **Promotion and posting are proven as the statements the live routes
    issue** (the legacy approve's and the staff patch's `UPDATE` of
    `staged_gifts`), as `service_role` with the hosted grants given in the
    transaction and as the owner; the database refuses them, whatever writes.
27. **READ COMMITTED only (issue 2837).** The core and the worker entry refuse any other level with `25001 read_committed_required`, the core as its first statement and the entry right after `tenant_guard.enter`, which reads no table, because the command-entry gate wants `enter` first; the second contradiction lookup relies on a fresh snapshot per statement. The isolation test commits: `BEGIN ISOLATION LEVEL ...` must open
    its own transaction, so the fixture commits and is removed as decision 4
    removes the races'.
28. **Guard-owned functions are replaced as their owner.** On Supabase's
    image `postgres` is no superuser and cannot `CREATE OR REPLACE` a
    function `tenant_guard` owns, so `apply_account_event` and
    `apply_payment_outcome` are replaced under `SET LOCAL ROLE tenant_guard`
    with `CREATE` on its schema for that statement only, as WP5 part 2-r2b1
    replaced `restrict_worker_publication`.
29. **No common table expression in a guard function**: the
    schema-qualification check (`issue-2250` criterion 14) reads a CTE's
    name as an unqualified relation, so the sweep, the disconnect and the
    core collect ids with `ARRAY(SELECT ...)` or lock with `PERFORM ... FOR
NO KEY UPDATE` first.
30. **Who gave sits on the intake's contact row (fix round F1).** The login,
    its address at intake and whether Auth had confirmed it are columns of
    `donation_intake_contacts`, not of `donations`: `authenticated` selects
    `donations` whole (the browser's collection reads `select=*`, which a
    column grant would refuse) and its row policy admits the attributed
    donor, staff and the receiving missionary. No Data API role and not
    `service_role` reads the contact row; the core reads it as the guard.
31. **A person's portal (F2)** lists their own donor's gifts and, of the
    gifts their login made, only those with no donor yet, whose ids
    `public.actor_gifts_without_donor` answers (a `postgres`-owned definer
    for `service_role`, ids only). A gift attributed or moved to another
    donor leaves the maker's portal.
32. **One order (F3).** The binding (the sweep `FOR SHARE`, the disconnect
    by its update), then the intake's provider requests in id order, then
    the intake. The core takes the requests before the intake whichever
    way it found the intake. A request's state changes only by an update
    that tests the state its locker read, and the disconnect locks the
    requests it parks in the statement that tests their state. A cancel
    for a disconnected binding is never written by the sweep: an intake
    holding a PaymentIntent there is `binding_disconnected` until the
    account returns.
33. **The sweep closes no intake in flight (F4):** a create request
    sending, waiting to retry or parked, or a request of the intake it did
    not lock, is `in_flight`, and nothing changes.
34. **Staff totals count what the lists count (F5).** The summary leaves out
    a line-based intake that is pending or abandoned; every other reader of
    `donations` totals settled gifts only or reads by donor, worker or id,
    and an unpaid or abandoned intake has no donor, no worker on its header
    and is never settled.
35. **The portal's figures (F6)** count settled gifts (Paid or Received)
    the same way everywhere: this year's total, the designations and the
    latest impact from them; lifetime given and the gift count add the
    settled line-based gifts to the donor's stored totals, which the apply
    does not keep. A failed gift counts nowhere. A line-based gift has no
    receipt link, receipt count or statement year until WP8b receipts it.
36. **The review route admits the fee-cover line only as stored (F7)**:
    it refuses a changed or missing one with 400 before it writes, as
    `replace_staged_gift_allocations` refuses it, and passes only the
    donor lines through the reference check.
37. **A success for a parked create request is its case's evidence (F10)**,
    also when the intake already records the PaymentIntent; it stages
    nothing. **After a staff abandonment no event writes anything** but the
    success's case (F14). **A committed correction reaches its receipt
    (F11):** the correction reads its detail without holds, and a retry with
    the same key makes a receipt the adjustment has none of. **The lines
    read pages (F12)**, 500 lines a page in a fixed order, under the Data
    API's 1,000-row cap. **Event cases are written by the guard alone, on
    every operation (F13).**
38. **The large-gift threshold compares the charged total, fee cover
    included** (inventory 8.3, accepted 27 November 2026): no ruling fixes
    the amount, and the charged total is the cautious reading.

## Pins moved (D-18), each with the reason in the edited title

| Pin                                                                                                               | Moves because                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `issue-2250/tenant-guard.realstack…`, criterion 17, "no SELECT on … donation_saga_outbox"                         | The guard reads and locks a provider request through column grants behind a policy that admits provider requests only. `has_any_column_privilege` on the outbox turns true; `has_table_privilege` stays false                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `issue-2250/tenant-guard.realstack…`, `GUARD_REACH`                                                               | `tenant_guard.money_park_operation(uuid,text,text)` is a `postgres`-owned invoker that only the guard may execute; both commands park through it. Trigger functions are fired, not executed by grant, and gain no line                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `issue-2681/wp8a-part1.realstack…`, R30                                                                           | Part 1 pinned that the outbox was untouched. Its status check now holds the provider statuses (`parked` among them) and it has a `lease_expires_at`; `guard_outbox` (`has_table_privilege`) stays false                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `docs/security/rls-deny-by-default-exceptions.json`, the outbox entry                                             | The outbox gains a policy, so it leaves the zero-policy list                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `issue-2251/harness.ts` and `static.acceptance`                                                                   | The same table moves from S (service role needed) to F (forced, with policies), as WP8a part 1's tables did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES`                                                            | Four new real-stack files; R1b replaced the machine and record entries by their seven parts (decision 6) and added `wp8a-p2r1b-worker` (decision 8)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `issue-2681/wp8a-p2r1a-record-checks.realstack…`, C9 (finding 6)                                                  | The C9 matrix refuses a NULL in every clause of `donation_saga_outbox_attempts_check` (`max_attempts`, `attempt_count`) and `donation_saga_outbox_window_check` (`first_sent_at`; a NULL `send_deadline` is admitted by its own `IS NULL`), so the form test leaves those two and keeps the ten it only samples: `lease` and the five status-reading checks (`object`, `parked_at`, `retry_window`, `unknown`, `unsent`) on a NULL `status`, `sent` on a NULL `attempt_count`, which the attempts check reports first, `legacy` on a NULL `outcome_unknown`, `request` on `amount`, `currency`, `idempotency_key` and `donation_id`, and `request_params` on all but `asym_intake` |
| `issue-2681/wp8a-p2r1a-legacy.realstack…`, F27                                                                    | R1b narrows the guard's `INSERT` on `payment_repair_cases` to its four columns: `grants` `tenant_guard:INSERT,tenant_guard:SELECT` becomes `tenant_guard:SELECT` and `column_grants` 0 becomes 4 (decision 11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/unit/scripts/tenant-rls-catalog.test.ts`, the compliant worker wrapper and the `FOR NO KEY UPDATE` wrapper | Each read its anchor through a `JOIN`, which the gate no longer admits (decision 10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `issue-2675/tenant-policy-migration.realstack…`, `OVERRIDES` (not in the brief's list)                            | Its fixture inserts `donations` rows under replica mode, where the stamp trigger does not run, and fills every NOT NULL column that has no default by its type. `intake_format` has no default by design (an insert that names none is stamped by role), so the fixture now names `legacy_header`, the value every live writer is stamped with. Every assertion is unchanged                                                                                                                                                                                                                                                                                                       |
| `issue-2250/tenant-guard.realstack…`, `GUARD_REACH` (R2a)                                                         | Three entries: `tenant_guard.money_apply_payment_event(uuid)` and `tenant_guard.money_enqueue_payment_request(uuid)`, `postgres`-owned invokers only the guard may execute, and `public.normalize_currency_code(text)`, which the currency triggers on `donations` and `staged_gifts` call as the inserting role (decision 19)                                                                                                                                                                                                                                                                                                                                                     |
| R1a's harness: `GUARD_TEST_GRANTS`, `seedTwoTenants`, `guardIntake`, `removeTwoTenants`                           | The grants of decision 13. Each side gets an ordinary fund of its entity and each guard intake one donor line on it for its whole amount, since a line-based intake is refused at commit without lines that sum to its amount. The removal also deletes the tenants' observations, allocations, staged gifts, lines, events, target locks and funds                                                                                                                                                                                                                                                                                                                                |
| `wp8a-p2r1a-machine-sessions…` D20, `wp8a-p2r1b-worker…` C4, `wp8a-p2r1a-record-fence…` C15, C16 and F1.6         | The committed and rolled-back revokes name the lines table and the outbox column, never the outbox table or `normalize_currency_code` (decision 13). D20 asserts `INSERT` on `donations`, on the lines and on the outbox table false, the column `max_attempts` false, the column `request_params` true and `normalize_currency_code` true                                                                                                                                                                                                                                                                                                                                         |
| `wp8a-p2r1a-intake…` A1, `wp8a-p2r1a-record-params…` C14                                                          | Each grants the outbox's table `INSERT` inside its rolled-back transaction to reach the rule it is about (decision 13)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `issue-2676/money-embeds.realstack…`, the money and target pairs                                                  | `staged_gift_allocations` has a second composite key to `funds` (with the entity and the fee flag) and to `missionaries` (with the entity), so those two pairs read `direct: 2`; the other eight and every site pair keep `1`. No live read embeds a target from allocations (`INVENTORY`)                                                                                                                                                                                                                                                                                                                                                                                         |
| `issue-2676/giving-targets.realstack…`, "all ten gift target keys"                                                | The two line keys join the list (twelve rows), and `array_length(c.conkey, 1), c.conname` breaks the tie between two keys of one source and target                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `issue-2675/tenant-policy-migration.realstack…`, `OVERRIDES` (R2a)                                                | `staged_gifts` and `staged_gift_allocations` gain `intake_format`, `NOT NULL` with no default, as R1a's `donations` did; the fixture names `legacy_header` for both                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES` (R2a)                                                      | R2a's eight real-stack files (decision 12)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `issue-2250/tenant-guard.realstack…`, `GUARD_REACH` (rest PR 1)                                                   | Six entries: `private.insert_giver_donor` (a postgres-owned definer that writes a new giver's donor with their email, so the guard itself still holds no email column of donors, WP5 rest fix round F1 rule 1, and Add Partner can never meet the email key) and five more: `private.money_norm`, `private.money_entered_name`, `private.money_duplicate_donors`, `private.money_large_gift_hold` (postgres-owned invokers the core decides who gave and the holds with) and `private.grant_linked_donor_membership` (a postgres-owned definer that refuses without the link)                                                                                                      |
| `issue-2681/wp8a-p2r1a-intake.realstack…`, B7                                                                     | A changed organization is refused first by issue 2842's rule for every row (`donation_tenant_frozen`); every other sealed column still answers `donation_line_intake_sealed`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `issue-2681/wp8a-p2r1a-record-checks.realstack…`, C9 (both)                                                       | The parking time's two matrix rows set the park reason with it, so they still reach `donation_saga_outbox_parked_at_check`; the form test lists the park reason's two checks, written in the same form (twelve)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `issue-2681/wp8a-p2r2a-apply-match.realstack…`, C9                                                                | Its adopted request, written in replica mode, carries the park reason the trigger now writes beside `parked_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `issue-2681/wp8a-p2r2a-apply-order.realstack…`, C12 and C13                                                       | The first success names the giver: the gift carries its donor, `matched` and `awaiting_review`, and the audit row its giver, holds and abandoned cancels                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `issue-2681/wp8a-p2r2a-live.realstack…`, F1                                                                       | Ruling Q-C: `beginGiftIntake` refuses a `gift:` key before the saga, so the route answers 400 and nothing is written                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `issue-2681/wp8a-p2-service-role.realstack…`, three pins                                                          | Three more sealed tables refuse TRUNCATE through their own rule functions, so the pins read issue 2841's five                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `issue-2672/staged-gift-allocations.realstack…`, the three-argument body                                          | W8-R14 updates it: on a line-based gift it hands the four-argument writer the status it locked; its legacy statements are 20260707220134's, byte for byte                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES` (rest PR 1)                                                | The six new real-stack files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
