# 0007. `authz.caller_assignment` requires the request's organization

**Status:** Recorded on 2026-11-25 with AL-2676. Source comments are banned
since AL-2676 ([#2751](https://github.com/Asymmetric-al/core/issues/2751)), so
the reasons that record D-18 of the implementation record would have put in
each frozen file are written here and in each edited test's title. It describes
the code as it is and ratifies no product intent. Accepted platform intent is
in [`docs/adr/`](../../../docs/adr/README.md).

## Context

`authz.caller_assignment(p_tenant_id UUID, p_role authz.membership_role)`
previously refused a request whose `x-asym-tenant` header named another
organization (`v_tenant IS NOT NULL AND v_tenant <> p_tenant_id`), but admitted
a request that sent no `x-asym-tenant` header or a blank one. That allowed a
dual-organization staff member to call `public.tenant_member_directory(uuid)`,
`public.tenant_membership_invitations(uuid)`, and (through
`private.crm_table_preference_actor`) the five CRM table-preference writers
without naming the target organization in `x-asym-tenant`, departing from the
accepted scenario in
`openspec/changes/build-crm-cms-database-foundation/specs/identity-and-access/spec.md:18-22`.

Two D-16 rulings govern this change:

- **D-16 ruling Q6 (2026-11-24, `ruling-command-request-org.md`):** ordered a
  second small package straight after the human command lane package (ADR 0006)
  to close `authz.caller_assignment`.
- **D-16 ruling on `caller_assignment` (2026-11-25,
  `ruling-caller-assignment-org.md`, Q1–Q3):**
  - **Q1 (a):** change `authz.caller_assignment` to return `NULL` when
    `v_tenant IS NULL OR v_tenant <> p_tenant_id`, keeping each caller's own
    `42501` refusal message and keeping `22P02`
    (`authz: the tenant header is not a UUID`) from `authz.request_tenant_id()`
    on malformed values (unlike the command lane in ADR 0006, which catches
    `22P02` and raises `42501`). Because `authz.request_tenant_id()` uses
    one-argument `pg_catalog.btrim(text)`, only missing headers, `""`, and
    ASCII spaces (`U+0020`) resolve to `NULL` (`42501`); tab, newline,
    carriage return, no-break space (`U+00A0`), and other Unicode whitespace
    fail the UUID match and raise `22P02`, admitting nothing.
  - **Q2:** track under AL-2676 (`tests/unit/acceptance/issue-2676/`).
  - **Q3:** remove the old no-header fallback and reverse the frozen tests in
    place under record D-18. This decision supersedes the last clause of
    `docs/security/tenant-policy-activation-review.md:77` ("with no header, a
    caller's one live row there still serves (council R8)") and D-64's clause
    "`caller_assignment` follows plan 5.1 when no header is sent": plan 5.4
    (`docs/audits/core-crm-cms-database-target-architecture.md:227`) defines
    the one-row fallback for the assignment header inside a named tenant, and
    `docs/security/tenant-policy-activation-review.md:75` states that a request
    that names no tenant gets no tenant.

Record D-18 permits updating frozen suites in the same change that legitimately
moves a seam, keeping every assertion at least as strong.

## Decisions

1. **Five frozen real-stack suites are updated in place so every call that must
   succeed, and every refusal testing a rule other than `x-asym-tenant`, sends
   `x-asym-tenant` equal to the tenant argument and asserts exact `42501`
   messages; the old no-header fallback cases are reversed beside served twins:**
   - `tests/unit/acceptance/issue-2402/harness.ts` and
     `tests/unit/acceptance/issue-2402/crm-table-preferences.realstack.acceptance.test.ts`:
     `Stack.as()` adds an optional `tenant` parameter that sets
     `"x-asym-tenant"` and returns `message` beside `code` and `value`.
     `invoke()`, `denied()` (for `authenticated` callers), the three direct
     `s.as()` calls in the assignment-header test, and the new-path `run()` in
     test 11 pass the target tenant argument as `x-asym-tenant`, and every
     `authenticated` denial asserts its exact `42501` message so none passes
     for the wrong reason.
   - `tests/unit/acceptance/issue-2675/membership-core.realstack.acceptance.test.ts`:
     all four `it` cases under `the member directory` send `"x-asym-tenant"`
     equal to the tenant argument on the `UDEV`/`UB` served reads (also
     asserting `b.code` is `null`), on the four previously headerless
     authenticated refusals (`UDEV` on `TB`, `UDON`/`UREV`/`UFC` on `TA`), and
     on the pre- and post-revocation `UDEV` calls in the fourth case (which the
     brief omitted), asserting the exact directory `42501` message on every
     authenticated refusal (`anon` stays an EXECUTE refusal).
   - `tests/unit/acceptance/issue-2675/request-scope-headers.realstack.acceptance.test.ts`:
     reverses the `MORGAN` one-row case so `{"x-asym-tenant": SECOND}` alone is
     served with `SECOND`'s members (the served twin) while `{ sub: "MORGAN" }`
     with no headers is refused with `42501`, the exact directory message, and
     empty rows; drops the now-redundant `undefined` variant in the demo-owner
     three-rows test above it and asserts the exact directory message under
     `{"x-asym-tenant": DEMO}`.
   - `tests/unit/acceptance/issue-2675/tenant-policy-migration.realstack.acceptance.test.ts`:
     in defect 9, drops the headerless `USG` call (already refused for holding
     two live rows in `TA`), asserts the exact directory `42501` message on the
     two remaining `USG` refusals, deletes the stale no-header comment, serves
     `UADM` with `{"x-asym-tenant": id.TA!}`, and asserts `UADM` with no
     headers is refused with `42501`, the exact message, and empty rows. In R8,
     asserts the exact message on `conflict`, deletes the stale no-header
     comment, serves `UB` with `{"x-asym-tenant": id.TB!}` (2 rows), and adds
     `UB`'s no-header refusal (`42501`, exact message, empty rows).
   - `tests/unit/acceptance/issue-2676/role-change-concurrency.realstack.acceptance.test.ts`:
     passes `tenant: i.tenant` to `runAs` on both `tenant_member_directory`
     calls in the R4 & F5 test.
   - `tooling/eslint-config/comment-baseline.json` is lowered via
     `bun run verify:comments -- --write` after deleting the two stale comments
     in `tenant-policy-migration.realstack.acceptance.test.ts`.
2. **Enforcement is proved across all nine `public` entry points, the helper
   itself, whitespace boundaries, and PostgREST:**
   - `tests/unit/acceptance/issue-2676/caller-assignment-request-organization.realstack.acceptance.test.ts`
     (registered in `REAL_DATABASE_FILES` in
     `tests/unit/acceptance/shared/realstack-step.test.ts`) exercises a
     dual-organization administrator across `tenant_member_directory(uuid)`,
     `tenant_member_directory(uuid, uuid[])`,
     `tenant_membership_invitations(uuid)`, `crm_missionary_labels(uuid, uuid[])`,
     and the five CRM table-preference writers for wrong tenant, missing
     header, blank `""`, ASCII-spaces-only `"   "`, malformed `"not-a-uuid"`,
     and matching tenant (with and without `x-asym-assignment`), asserting
     exact codes/messages and zero writes or view mutations on every refusal.
     It also exercises `authz.caller_assignment` directly as `postgres`,
     verifies catalog attributes and comment, and pins Working Rule 13
     whitespace handling (ASCII spaces vs tab, newline, CR, NBSP, em space,
     ideographic space).
   - `tests/unit/acceptance/issue-2676/membership-invitations.postgrest.acceptance.test.ts`
     fixes `api()` to check `options?.tenant !== undefined` and
     `options?.assignment !== undefined` (so `""` is sent instead of dropped)
     and adds a two-organization PostgREST proof covering
     `tenant_member_directory`, `tenant_membership_invitations`, and the five
     CRM table-preference writers with cleanup that surfaces its own error when
     the test succeeds.
