# 0006. Every human command requires the request's organization

**Status:** Recorded on 2026-11-24 with AL-2676. Source comments are banned
since AL-2676 ([#2751](https://github.com/Asymmetric-al/core/issues/2751)), so
the reasons that record D-18 of the implementation record would have put in
each frozen file are written here and in each edited test's title. It describes the code as it is and ratifies
no product intent. Accepted platform intent is in
[`docs/adr/`](../../../docs/adr/README.md).

## Context

`tenant_guard.begin_human_command(p_tenant_id uuid, p_capability text DEFAULT NULL)`
now requires the request's `x-asym-tenant` header (read through
`authz.request_tenant_id()`, treating `invalid_text_representation` / `22P02`
as missing) to be present and equal to `v_ctx.tenant_id`, refusing with
`42501` (`tenant_guard: request tenant scope is required and must match
command tenant`) before calling `tenant_guard.enter`. This enforces the
already-accepted per-request organization boundary centrally across every
human command, including the twelve entry points that did not check
`x-asym-tenant` themselves.

In the same migration, `tenant_guard.set_account_brand(uuid, text)` replaces
its `INSERT ... ON CONFLICT DO UPDATE` with `INSERT ... ON CONFLICT (tenant_id)
DO NOTHING RETURNING *` followed, on conflict, by `SELECT display_name INTO
STRICT ... FOR UPDATE` and `UPDATE ... RETURNING * INTO STRICT`, so two
concurrent first-time writers record the first writer's display name as the
second audit row's `from.display_name` on PostgreSQL 17.

Record D-18 permits updating frozen suites in the same change that legitimately
moves a seam, keeping every assertion at least as strong.

## Decisions

1. **Seven real-stack suites send `x-asym-tenant` matching the command's
   tenant argument on human command calls that must succeed.** Every refusal
   case testing a missing, wrong or malformed assignment header stays intact,
   and no `42501` check is weakened. Because the new check runs last in
   `begin_human_command` (after the active-tenant check and before
   `tenant_guard.enter`), every existing assignment, capability and status
   refusal message is unchanged:
   - `tests/unit/acceptance/issue-2672/role-change-command.realstack.acceptance.test.ts`:
     `asCaller` always sends `"x-asym-tenant": tenant` (with
     `"x-asym-assignment"` when an assignment row exists), and the foreign-admin
     and no-identity refusal cases assert their exact `42501` messages.
   - `tests/unit/acceptance/issue-2674/command-lane.realstack.acceptance.test.ts`:
     `header()` sends `"x-asym-tenant": id.TA` alongside `"x-asym-assignment"`,
     the no-header success calls and blank-assignment refusal (`empty`) pass
     `"x-asym-tenant": id.TA` (`empty` also asserts the several-assignments
     message), and the claims-setting loop sets `request.headers` to
     `{"x-asym-tenant": id.TA}`.
   - `tests/unit/acceptance/issue-2675/membership-core.realstack.acceptance.test.ts`:
     `header()`, the four no-header success calls, and the revoked-row
     refusals (`sole`, `after`) in the preamble block pass
     `"x-asym-tenant": id.TA`, with `sole` and `after` asserting the exact
     no-live-assignment message.
   - `tests/unit/acceptance/issue-2675/membership-role-commands.realstack.acceptance.test.ts`:
     `change()` and `revoke()` pass `"x-asym-tenant": id[opts.tenant ?? "TA"]`,
     the pre-revocation `resolve_command_assignment` check, the no-caller
     refusal (`a`), and the wrong-assignment refusal (`named`) pass
     `"x-asym-tenant": id.TA` (with `a` and `named` asserting their exact
     `42501` messages), and the committed race block's `begin()` sets
     `"x-asym-tenant": t`.
   - `tests/unit/acceptance/issue-2676/membership-invitations-commands.realstack.acceptance.test.ts`:
     `runAs` and `runCommittedAs` accept an optional `tenant` option that sets
     `"x-asym-tenant"`, passed on every `invite_member`,
     `revoke_membership_invitation` and `revoke_membership` call; all
     `accept_membership_invitation` calls remain without `x-asym-tenant`.
   - `tests/unit/acceptance/issue-2676/role-change-concurrency.realstack.acceptance.test.ts`:
     `runAs` and `runCommittedAs` accept an optional `tenant` option, passed on
     every `change_membership_role` and `revoke_membership` call.
   - `tests/unit/acceptance/issue-2677/crm-note-command.realstack.acceptance.test.ts`:
     `act()` accepts an optional `tenant` parameter passed from `create()`
     (`note.tenant ?? id.TA`) and from the two direct `tenant_guard.create_crm_note`
     calls; the committed race block's `begin()` sends `"x-asym-tenant": tenant`.
2. **Central enforcement is proved across all twelve previously unchecked
   entry points, the preamble, the one-row rule, pre-membership acceptance, and
   PostgREST.**
   `tests/unit/acceptance/issue-2676/command-request-organization.realstack.acceptance.test.ts`
   (wired into `REAL_DATABASE_FILES` in
   `tests/unit/acceptance/shared/realstack-step.test.ts`) exercises a dual-org
   administrator holding all five command capabilities across all twelve entry
   points (both `public` wrappers and `tenant_guard` inner functions) for wrong
   tenant, missing or blank (`""`, `"   "`) tenant, malformed tenant and
   matching tenant, asserting zero writes and unchanged target rows on every
   refusal. It also exercises `tenant_guard.begin_human_command` directly as
   `tenant_guard`, proves refusal occurs before `tenant_guard.enter` both
   behaviorally (entering tenant A first so `enter(B)` would raise its
   second-tenant error if reached) and via `pg_get_functiondef` ordering,
   confirms the one-row rule still holds when `x-asym-tenant` matches, and
   confirms `accept_membership_invitation` remains unaffected.
   `tests/unit/acceptance/issue-2676/membership-invitations.postgrest.acceptance.test.ts`
   adds a PostgREST proof of `invite_member` against a second active tenant
   whose cleanup surfaces any delete failure without hiding a test failure.
3. **The concurrent first-time brand-write audit fix is proved on two
   connections.**
   `tests/unit/acceptance/issue-2676/site-commands.realstack.acceptance.test.ts`
   adds a committed two-connection race (observed via `pg_stat_activity`
   `wait_event_type = 'Lock'` on a third connection) proving that two
   first-time `set_account_brand` calls record `from: null -> to: Alpha` and
   `from: Alpha -> to: Beta` in `public.audit_logs`, with cleanup surfacing
   any delete failure without hiding a test failure.
4. **The `resolve_verified_host` ACL assertion sorts by grantee expression.**
   `tests/unit/acceptance/issue-2676/sites.postgrest.acceptance.test.ts`
   replaces `array_agg(... order by 1)` (which ordered by a constant integer
   inside the aggregate argument) with ordering by the grantee-name expression
   itself, keeping the exact `["anon", "authenticated", "service_role"]`
   expectation.
