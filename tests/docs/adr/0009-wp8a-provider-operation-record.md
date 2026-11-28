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
    the legacy route's checkout mocks, which retired with it in part 2b:
    decision 66), and a client whose
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
39. **A paid event on a disconnected account opens a case (issue 2857
    item 1).** A success that names or matches a create request a
    disconnect parked (its outcome is known, so it has no repair case)
    opens one `paid_while_parked` case in `public.payment_event_cases` on
    the intake, with one `payment_while_parked` task and one link, and
    stages nothing; a replay answers the same case. A success for a request
    with an open repair case stays that case's evidence (decision 37).
40. **Every success after a staff abandonment opens `paid_after_abandon`
    (item 2)**, also when the create request is parked: the abandonment
    branches run before anything is read of the create request. Refusing
    the abandonment of an intake whose create is parked, the issue's other
    choice, was not taken, so staff can always close an intake.
41. **The apply audits the cancels it changed (item 14)**:
    `cancel_requests_abandoned` lists the ids its update returned.
42. **The enqueue takes the binding before the intake (item 15)**, decision
    32's order: it reads the intake's binding id without a lock, takes the
    binding `FOR SHARE`, then the intake `FOR NO KEY UPDATE` with that
    binding matched, and answers `not_found` when the binding moved
    meanwhile.
43. **A staff correction's receipt (items 3 to 7).** The key is looked up
    before the revision check, so a retry after a committed correction
    reaches the replay (item 6). A key used on another gift is refused with
    `409`, and nothing is written or sent (item 3). One snapshot per
    correction and kind, a partial unique index; the loser of that race
    replays the winner's (item 4). A replay sends its own correction's
    snapshot and reports `superseded` once a later correction of the gift
    is applied (item 5). A send that failed, or a snapshot with no send log
    after five minutes, is sent again; one inside those five minutes
    reports `pending` (item 7).
44. **The portal's lifetime is a settled aggregate (item 8)**:
    `public.donor_portal_lifetime` sums and counts the gifts the list
    admits (the donor's, and the login's gifts with no donor yet), legacy
    in a settled status and line-based once paid, so the figures hold past
    the 250 the list shows. It replaces decision 35's addition to the
    donor's stored totals.
45. **The fee-cover fund is compared in canonical form (item 10)**, lower
    case, and the fee lookup's rows are parsed at the boundary (item 11).
46. **The manifest says what the grants say on `donations` (item 13).**
    `authenticated` selects `donations` whole because `donationsCollection`
    reads `select=*`, so donor and missionary read `is_anonymous` and
    `abandoned_by` (no login, no address: a flag and `'sweep'` or
    `'staff'`), both in the `financial` category of the gift's other
    attributes its giver sees, since an `internal` column never shows off
    Mission Control (the foundation's rule C6). The narrowing to column grants is WP8b's contract; the
    item-zero suite fails when `field_policies` and
    `has_column_privilege` disagree on either.
47. **The donor app counts settled gifts with one predicate (item 16)**:
    `isSettledGift` (Paid or Received) feeds this year's total, the last
    supported, the missionaries supported, the monthly series and the year
    summary.
48. **The intake's organization comes from the host (ruling W8-R41), and
    who may give where follows the six admission cases of the ruling on
    signed-in giving of 27 November (section 3).** `public.begin_line_gift`
    takes the host the request was made to and no organization, reads the
    organization from the reviewed lookup `public.resolve_verified_host`
    (state active), the one entry of `WORKER_WRAPPER_ANCHOR_LOOKUPS`, and
    refuses `42501 host_not_admitted` without one. The guard command locks
    the organization `FOR SHARE`, admits the host again under locks (the
    claimed name, the Site `FOR SHARE`, or the home record `FOR SHARE`) and
    refuses a host or surface before it judges the organization's status,
    so no answer tells whether another organization's name exists. The six
    cases: (1) a verified actor on a name that is both a Site's and the
    organization's home gives in place, with the host's Site and the
    `website` surface; (2) a signed-in gift at home handed off from a
    current Site of the organization keeps that Site, `donor_account`;
    (3) one whose source Site is absent, another organization's, unknown
    or inactive carries no Site, silently, `donor_account`; (4) a gift
    started inside the account carries no Site, `donor_account`; (5) a
    guest on any admitted Site name gets the host's Site, `website`, no
    actor; (6) an actor on a Site name that is not the home is
    `22023 actor_not_admitted`. A required or supplied actor without a
    user ID or the e-mail's confirmation is `22023 actor_required`, and a
    source Site on a Site's checkout is `22023 source_site_not_admitted`;
    a refusal writes nothing. The handler takes the host only from `Host`;
    the request names its path (`mode`: `guest` or `signed_in`, `guest`
    when absent) and the server never changes it: the guest path never
    reads a session and cannot ask for the account area; the signed-in
    path reads the session only on the organization's home, takes the
    actor only from it, and without one answers `401 sign_in_required`
    before the rate token and the command, so an expired session never
    becomes a guest gift (fix round F3). Plan lines 169, 179, 201, 210,
    221 and 1179 are amended to say so.
49. **The intake command** freezes the Site, the entry surface, the source
    code (an active listed code by its id; a well-formed code off the list
    kept apart for triage; a malformed or absent one stays absent) and
    anonymity; takes the entity from the lines (one entity; no donor line
    on the reserved fund), the active test-mode binding `FOR SHARE` before
    the intake, and the fee line from the fee cover the server computes with
    `fee-policy.ts`; admits a card only (bank debit and wallets are
    `22023 payment_method_refused`, the ruling on intent conflicts of
    27 November, section 3), so its one create request names
    `payment_method_types: ["card"]` and never `automatic_payment_methods`;
    refuses a fee cover above five percent of the donor's lines plus 100
    cents (`22023 fee_cover_out_of_range`) and a US-dollar total outside 50
    to 99,999,999 cents, the range Stripe takes (`22023
amount_out_of_range`), before any write; keeps the client key and the
    request as SHA-256 digests only; answers a replay with its first
    intake and refuses the key with another request (`23505`); and names
    the gift's state (`gift_state`): `paid` on any recorded evidence that
    money was taken, the intake completed, a success observation or a
    `paid_after_abandon` or `paid_while_parked` case (answered `409
gift_already_completed`, never `gift_closed`), `closed` once it is
    abandoned, its create request is `refused`, `dead_letter` or
    `abandoned`, or its PaymentIntent was reported cancelled (answered
    `409 gift_closed`),
    otherwise `open`, a declined card's gift included (answered its
    PaymentIntent). No browser total, tenant, entity or binding is read.
50. **The rate limit is a Postgres counter of digests.** Ten requests per
    address in a ten-minute window pass, the eleventh is refused; each call
    removes up to 200 rows of ended windows (`SKIP LOCKED`), so the table
    holds the current window's addresses. The address is the first entry of
    `x-forwarded-for`, which Vercel sets and overwrites so a client cannot
    add to it (https://vercel.com/docs/headers/request-headers). The handler
    checks the challenge first (no write), then the home and the session,
    then takes the token (its own row only), then calls the command.
51. **The config read is anonymous (W8-R18).** `public.checkout_giving_config`
    answers one connected account or nothing, the same nothing for every
    reason; its route answers one generic "giving unavailable" while
    `GUEST_GIVING_ENABLED` is off, the publishable key is not a test key, or
    anything fails. It reads through a sessionless public-key client
    (`createAnonymousClient`): no cookie is read or written, so a
    visitor's expired session changes nothing (fix round F4).
52. **The payment-event destination (W8-R39)** checks the signature, test
    mode and integer amounts in the raw text (decision 17's refusal of
    `1e2`) before any database call, takes the organization from the event's
    account in test mode only, stores the event, claims it and applies or
    defers it in its own request. It is mounted and answers `503` while
    `STRIPE_PAYMENT_EVENTS_WEBHOOK_SECRET` is unset.
53. **Connected refunds and disputes are kept for WP8c (ruling 2):** the
    event is `deferred` (a terminal status the claim answers), one Mission
    Control task per gift (or per event when no intake is known) carries
    every such event's link, and no money row changes. The deferral locks
    as the apply does (the event, the account, the gift) and refuses
    `55000 lease_lost` unless the event's lease is live and the account's
    sync lease names the event (fix round F2).
54. **One scheduled function (W8-R40).** `money-schedule` runs every thirty
    minutes with no step, no retry and one at a time: worker, sweep, events
    and reconciliation, each leaving at once with nothing due and failing
    alone, within a 45-second budget; a provider operation whose claim or
    report came back as an RPC error counts as failed; the account reader
    has a ten-second deadline and no automatic retry, and no row that reads
    the provider starts with less than that left (fix round F7). Inngest
    counts a run and each step as
    an execution, so it costs one execution a run: 48 a day, 1,440 in a
    thirty-day month and 1,488 in a thirty-one-day month per deployed
    environment at zero traffic, and nothing per gift, because the person at
    checkout is served by the route's inline first send and the
    destination's inline apply, never by the schedule. The three recovery
    scans already on the same cadence keep their own counts until part 2b
    retires the saga's and the legacy events' scans in the same release
    that opens checkout. The plan enforces a
    cap of 50,000 executions a month (1,519 used on 27 November); at the cap
    Inngest stops running functions until the period resets. Nothing is
    lost: payments still become gifts through the destination; queued and
    waiting requests, unpaid intakes and failed events stay in their tables
    and are taken up by the first run after the reset. Until then staff see
    no new schedule task (a dead letter, a drift) and the stored rows
    unchanged; the Inngest dashboard names the cap.
55. **The reconciliation reads each mapped test-mode account** whose binding
    is pending, active or restricted, maps the reading as the account apply
    does, and opens one task when it differs from the binding; only the
    account's own events move a binding. It locks the account and stamps
    `reconciled_at` as its first write, whatever its outcome (a failed
    provider read is handed over as `read_failed`, stamped and opens
    nothing), and the due work orders accounts by it, never read first:
    every account is read again within ceil(N / limit) ticks, a failing
    read goes to the back, and two reconciliations of one account open one
    task (fix round F5).
56. **`donations.tenant_id` is NOT NULL behind its migration's count gate
    (W8-R16, record line 964):** it refuses with the count and changes
    nothing while a gift has no organization; the database's three writers
    of donations each supply one, and the two legacy ones already refused a
    gift without one.

57. **A provider operation is claimed under the organization's and the
    binding's locks (issue 2857 item 18).** `tenant_guard.claim_provider_operation`
    share-locks the tenant row, refuses `create_payment` while the
    organization is not `active` (`organization_inactive`), takes the
    binding `FOR SHARE`, and only then the request, so a suspension or a
    disconnect committed first is seen and one committed later waits for the
    claim (two sessions; `20261128080000_wp8a2_rest2b_item_zero.sql`).
58. **A disconnect leaves no request whose outcome is unknown without a task
    (item 19).** At the disconnect, each such request of the binding gets
    one staff task and link (`provider_request_outcome_unknown_disconnected`);
    its status is unchanged and nothing is sent again or rerouted.
59. **Two requests with one key are serialized before the key is read
    (item 35).** `tenant_guard.begin_line_gift` takes a transaction advisory
    lock on the organization and the key's digest first, so the second
    request reads the first one's committed intake (a replay, or `23505`
    for other details), never a missing row.
60. **The portal counts a login's donorless gifts in the database (item 36).**
    `public.donor_portal_login_lifetime(tenant, donor, login)` aggregates by
    the login's own intake contacts; no capped list crosses the wire. The
    old `donor_portal_lifetime(uuid, uuid, uuid[])` stays for the running
    build and goes with WP8b's contract.
61. **The limit is two buckets over a rolling ten minutes (decided thing 2;
    replaces decision 50).** `public.take_intake_attempt(host, surface,
address, key, user)` keeps one row per admitted attempt in
    `private.intake_rate_attempts` (SHA-256 digests of the bucket and the
    client key, the organization by `ON DELETE RESTRICT`, no grant to any API
    role). The address bucket (the Site the gift is recorded on, or the
    organization for an account-area gift, with the address) admits fewer
    than 30 unpaid and 250 in all; the person bucket (a signed-in session's
    user) fewer than 6 unpaid and 15 in all. A replayed admitted key is
    free; an unknown host writes nothing; each bucket is locked by an
    advisory lock in sorted order. A refusal answers `429` with
    `retryAfterSeconds`, `Retry-After` and the refusing `bucket`, which picks
    the page's sentence. `public.purge_intake_attempts()` removes every row
    older than the window on each money-schedule tick, whether or not its
    bucket is used again. The migration drops `take_intake_rate_token(text)`
    and `private.intake_rate_windows`; its header holds the gate that
    `GUEST_GIVING_ENABLED` is never on in a build older than this file.
62. **The config read knows which surface asks (item zero 5; amends
    decision 51).** `public.checkout_giving_config(host, targets, surface,
source_site)` admits a website ask only on an active Site's website name
    and an account ask only on the organization's home, so an inactive
    non-default Site on a shared home gets no account; given a source Site,
    it answers that Site's primary domain when it is a current Site of the
    host's organization (the way back). The two-argument form is dropped in
    the same migration; the anonymous allowlist still lists three functions.
63. **The intake route holds one service-key site (W8-R17).**
    `packages/api/src/donate/guest/intake-route.ts` reads the switch before
    it makes any client; its client calls exactly `take_intake_attempt` and
    `begin_line_gift`. The actor comes from the Auth session alone, the home
    from the verified-name lookup. The first send and the client secret go
    through the money schedule's own W8-R40 client and runner
    (`sendFirstPayment`, `paymentClientSecret`) with a 25-second budget, and
    every caller of the runner keeps a five-second reserve to report
    (`CALLER_REPORT_RESERVE_MS`, item 34).
64. **The giving routes are admitted on website-only names while giving is
    open.** `classifyDonorPath` names `/checkout`, `/api/checkout/config`
    and `/api/donate` giving before the account roots, and only while
    `GUEST_GIVING_ENABLED`, the Turnstile key pair and a test publishable key
    are all present, read once when the proxy module loads; `/checkout`
    leaves the protected prefixes only then (ruling Q4: the options are
    written once).
65. **The page pays with Stripe's deferred-intent flow on the connected
    account, cards only.** It reads the config for its one target and
    surface, loads Stripe.js with `stripeAccount`, and mounts the Payment
    Element with `mode: "payment"`, the amount, `usd` and
    `allowedPaymentMethodTypes: ["card"]` (stripe-js 10.1.0 has no
    `paymentMethodTypes` option); it creates the gift only on Give
    (`elements.submit()`, `POST /api/donate`, `confirmPayment` with the typed
    e-mail and name, `redirect: "if_required"`). The gift's key, with a
    digest of its inputs and a time, lives in `localStorage` for thirty
    minutes so every tab of the browser sends it; the e-mail, the name and
    the client secret stay per tab in `sessionStorage`. Turnstile is
    managed, `interaction-only`, auto-refreshing, and reset after any `400`,
    `429` or `503`. The thank-you reads the payment's state with Stripe.js
    (no new server read) and the route sends no referrer.
66. **What retires with the legacy route.** The legacy `POST` and `GET
/api/donate` (`packages/api/src/donate/index.ts`) go with their suites
    and their checkout fixture and mocks, so decision 15's F1 and the forms
    it used retire with the route (record line 1064); the legacy checkout
    modules go with the pins that read their source. Level 1's journeys run
    in the local stack job with Turnstile's always-pass test keys and
    Stripe.js stubbed at the network, and no Stripe key reaches their
    server; Level 2 (`bun run proof:giving:stripe-test`) runs only by hand,
    refuses a live key before any call, and is named by no workflow.

## Pins moved (D-18), each with the reason in the edited title

| Pin                                                                                                                   | Moves because                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `issue-2250/tenant-guard.realstack…`, criterion 17, "no SELECT on … donation_saga_outbox"                             | The guard reads and locks a provider request through column grants behind a policy that admits provider requests only. `has_any_column_privilege` on the outbox turns true; `has_table_privilege` stays false                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `issue-2250/tenant-guard.realstack…`, `GUARD_REACH`                                                                   | `tenant_guard.money_park_operation(uuid,text,text)` is a `postgres`-owned invoker that only the guard may execute; both commands park through it. Trigger functions are fired, not executed by grant, and gain no line                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `issue-2681/wp8a-part1.realstack…`, R30                                                                               | Part 1 pinned that the outbox was untouched. Its status check now holds the provider statuses (`parked` among them) and it has a `lease_expires_at`; `guard_outbox` (`has_table_privilege`) stays false                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `docs/security/rls-deny-by-default-exceptions.json`, the outbox entry                                                 | The outbox gains a policy, so it leaves the zero-policy list                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `issue-2251/harness.ts` and `static.acceptance`                                                                       | The same table moves from S (service role needed) to F (forced, with policies), as WP8a part 1's tables did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES`                                                                | Four new real-stack files; R1b replaced the machine and record entries by their seven parts (decision 6) and added `wp8a-p2r1b-worker` (decision 8)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `issue-2681/wp8a-p2r1a-record-checks.realstack…`, C9 (finding 6)                                                      | The C9 matrix refuses a NULL in every clause of `donation_saga_outbox_attempts_check` (`max_attempts`, `attempt_count`) and `donation_saga_outbox_window_check` (`first_sent_at`; a NULL `send_deadline` is admitted by its own `IS NULL`), so the form test leaves those two and keeps the ten it only samples: `lease` and the five status-reading checks (`object`, `parked_at`, `retry_window`, `unknown`, `unsent`) on a NULL `status`, `sent` on a NULL `attempt_count`, which the attempts check reports first, `legacy` on a NULL `outcome_unknown`, `request` on `amount`, `currency`, `idempotency_key` and `donation_id`, and `request_params` on all but `asym_intake` |
| `issue-2681/wp8a-p2r1a-legacy.realstack…`, F27                                                                        | R1b narrows the guard's `INSERT` on `payment_repair_cases` to its four columns: `grants` `tenant_guard:INSERT,tenant_guard:SELECT` becomes `tenant_guard:SELECT` and `column_grants` 0 becomes 4 (decision 11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `tests/unit/scripts/tenant-rls-catalog.test.ts`, the compliant worker wrapper and the `FOR NO KEY UPDATE` wrapper     | Each read its anchor through a `JOIN`, which the gate no longer admits (decision 10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `issue-2675/tenant-policy-migration.realstack…`, `OVERRIDES` (not in the brief's list)                                | Its fixture inserts `donations` rows under replica mode, where the stamp trigger does not run, and fills every NOT NULL column that has no default by its type. `intake_format` has no default by design (an insert that names none is stamped by role), so the fixture now names `legacy_header`, the value every live writer is stamped with. Every assertion is unchanged                                                                                                                                                                                                                                                                                                       |
| `issue-2250/tenant-guard.realstack…`, `GUARD_REACH` (R2a)                                                             | Three entries: `tenant_guard.money_apply_payment_event(uuid)` and `tenant_guard.money_enqueue_payment_request(uuid)`, `postgres`-owned invokers only the guard may execute, and `public.normalize_currency_code(text)`, which the currency triggers on `donations` and `staged_gifts` call as the inserting role (decision 19)                                                                                                                                                                                                                                                                                                                                                     |
| R1a's harness: `GUARD_TEST_GRANTS`, `seedTwoTenants`, `guardIntake`, `removeTwoTenants`                               | The grants of decision 13. Each side gets an ordinary fund of its entity and each guard intake one donor line on it for its whole amount, since a line-based intake is refused at commit without lines that sum to its amount. The removal also deletes the tenants' observations, allocations, staged gifts, lines, events, target locks and funds                                                                                                                                                                                                                                                                                                                                |
| `wp8a-p2r1a-machine-sessions…` D20, `wp8a-p2r1b-worker…` C4, `wp8a-p2r1a-record-fence…` C15, C16 and F1.6             | The committed and rolled-back revokes name the lines table and the outbox column, never the outbox table or `normalize_currency_code` (decision 13). D20 asserts `INSERT` on `donations`, on the lines and on the outbox table false, the column `max_attempts` false, the column `request_params` true and `normalize_currency_code` true                                                                                                                                                                                                                                                                                                                                         |
| `wp8a-p2r1a-intake…` A1, `wp8a-p2r1a-record-params…` C14                                                              | Each grants the outbox's table `INSERT` inside its rolled-back transaction to reach the rule it is about (decision 13)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `issue-2676/money-embeds.realstack…`, the money and target pairs                                                      | `staged_gift_allocations` has a second composite key to `funds` (with the entity and the fee flag) and to `missionaries` (with the entity), so those two pairs read `direct: 2`; the other eight and every site pair keep `1`. No live read embeds a target from allocations (`INVENTORY`)                                                                                                                                                                                                                                                                                                                                                                                         |
| `issue-2676/giving-targets.realstack…`, "all ten gift target keys"                                                    | The two line keys join the list (twelve rows), and `array_length(c.conkey, 1), c.conname` breaks the tie between two keys of one source and target                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `issue-2675/tenant-policy-migration.realstack…`, `OVERRIDES` (R2a)                                                    | `staged_gifts` and `staged_gift_allocations` gain `intake_format`, `NOT NULL` with no default, as R1a's `donations` did; the fixture names `legacy_header` for both                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES` (R2a)                                                          | R2a's eight real-stack files (decision 12)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `issue-2250/tenant-guard.realstack…`, `GUARD_REACH` (rest PR 1)                                                       | Six entries: `private.insert_giver_donor` (a postgres-owned definer that writes a new giver's donor with their email, so the guard itself still holds no email column of donors, WP5 rest fix round F1 rule 1, and Add Partner can never meet the email key) and five more: `private.money_norm`, `private.money_entered_name`, `private.money_duplicate_donors`, `private.money_large_gift_hold` (postgres-owned invokers the core decides who gave and the holds with) and `private.grant_linked_donor_membership` (a postgres-owned definer that refuses without the link)                                                                                                      |
| `issue-2681/wp8a-p2r1a-intake.realstack…`, B7                                                                         | A changed organization is refused first by issue 2842's rule for every row (`donation_tenant_frozen`); every other sealed column still answers `donation_line_intake_sealed`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `issue-2681/wp8a-p2r1a-record-checks.realstack…`, C9 (both)                                                           | The parking time's two matrix rows set the park reason with it, so they still reach `donation_saga_outbox_parked_at_check`; the form test lists the park reason's two checks, written in the same form (twelve)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `issue-2681/wp8a-p2r2a-apply-match.realstack…`, C9                                                                    | Its adopted request, written in replica mode, carries the park reason the trigger now writes beside `parked_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `issue-2681/wp8a-p2r2a-apply-order.realstack…`, C12 and C13                                                           | The first success names the giver: the gift carries its donor, `matched` and `awaiting_review`, and the audit row its giver, holds and abandoned cancels                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `issue-2681/wp8a-p2r2a-live.realstack…`, F1                                                                           | Ruling Q-C: `beginGiftIntake` refuses a `gift:` key before the saga, so the route answers 400 and nothing is written                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `issue-2681/wp8a-p2-service-role.realstack…`, three pins                                                              | Three more sealed tables refuse TRUNCATE through their own rule functions, so the pins read issue 2841's five                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `issue-2672/staged-gift-allocations.realstack…`, the three-argument body                                              | W8-R14 updates it: on a line-based gift it hands the four-argument writer the status it locked; its legacy statements are 20260707220134's, byte for byte                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES` (rest PR 1)                                                    | The six new real-stack files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `issue-2681/wp8a-p2-service-role.realstack…`, F0 (fix round)                                                          | The replay ends before `20261126190000`, since M1 now refuses to run until it is applied (F8); every assertion is unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `issue-2406/profile-url.acceptance`, criterion 18 (fix round)                                                         | Its fake answers `public.actor_gifts_without_donor`, which the portal now calls (F2), with none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `packages/api/donor-portal/snapshot-gift-cap.test.ts` (fix round)                                                     | Its fake answers the same read, with none (F2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `apps/donor/history-receipt-links.test.ts` (fix round)                                                                | The Receipt control downloads the row's link and shows none without one, as a line-based gift has none until WP8b (F6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `issue-2681/wp8a-rest1-unpaid.realstack…`, F10 (item zero)                                                            | With no open repair case, a success for a parked create opens one `paid_while_parked` case (decision 39)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `issue-2406/profile-url.acceptance`, criterion 18 (item zero)                                                         | Its fake answers `public.donor_portal_lifetime`, which the portal now calls (decision 44), with zero                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `packages/api/admin/contribution-receipt-worker-names.test.ts`, F11 (item zero)                                       | The later retry reports the receipt's state, not `null` (decision 43)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES` (item zero)                                                    | The item-zero real-stack file                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `packages/api/admin/contribution-adjustment-operations.test.ts`, "#260 stale retry" (item zero)                       | A retry with the same key replays its correction although the revision moved; a new key on a stale revision is still refused with `409` (decision 43). Its fake now honours the key filter, which the earlier lookup reads                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `apps/donor/donor-routes-donor-class.test.ts` (2b)                                                                    | The intake has no donor-membership gate: a guest is its subject                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `graphql-gift-engagement-adapters.test.ts`, `issue-2253/service-role-gate`, `ci-preflight.contract` (2b)              | The legacy route's two service-key sites leave and the intake route's one arrives (decision 63)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `issue-2364/static` criterion 9 and `donor-pages` criterion 6 (2b)                                                    | The checkout reads `POST /api/checkout/config`, whose answer is the publishable key, the connected account and the way back only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `issue-2681/wp8a-p2r2a-live.realstack…`, F1 (2b)                                                                      | It drove the legacy route, which retires (decision 66)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `react-doctor-complexity-donor-contracts`, the checkout case, and `checkout-runtime-config-contracts` (2b)            | They read the legacy checkout's source, which is replaced                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `issue-2678/assignment-keys-migration…` 10, `wp8a-p2-service-role…` the gate's title, `issue-2674/catalog-gate…` (2b) | The allowlist names the config read in its four-argument form (decision 62)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `wp8a-rest2a-schedule…`, `wp8a-rest2a-intake…`, `wp8a-rest2a-guest…`, the 2a limit cases (2b)                         | The schedule purges first on each tick, and the limit takes five arguments and answers its bucket (decision 61)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `tests/unit/scripts/tenant-rls-catalog.test.ts`, the worker wrapper (2b)                                              | The wrapper is reviewed by its exact signature                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `shared/realstack-step.test.ts`, `REAL_DATABASE_FILES` (2b)                                                           | The two 2b real-stack files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tests/e2e/donate.spec.ts`, the signed-in case, and `donor-request-scope.spec.ts` (2b)                                | With giving off the page says giving is unavailable; its config read is `POST /api/checkout/config`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `issue-2681/wp8a-rest1-sessions…`, F3, the claim during a disconnect (2b)                                             | The claim takes the binding `FOR SHARE` (decision 57), so it waits for the disconnect and is refused `binding_inactive`; the request reported after the disconnect's read stays `retry_wait`, never sent on the closed account                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `issue-2678/worker-gift.postgrest…`, the `/api/donate` leg (2b, from `develop`)                                       | It drove the legacy route, which retires (decision 66); the `POST /api/donations` and GraphQL legs stay until C                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `issue-2406/profile-url.acceptance`, criterion 18 (2b)                                                                | Its fake answers `public.donor_portal_login_lifetime`, which the portal now calls (decision 60), with zero                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
