# 0009. The provider-operation record's suites and the pins it moves

**Status:** Recorded on 2026-11-25 with AL-2681 (WP8a part 2, slice R1a);
decisions 6 to 11 added with slice R1b.
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
   rolled-back transaction and checks that F27's values come back.
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
