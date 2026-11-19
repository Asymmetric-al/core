# Identity person anchor (inert)

Owner: #2256 (#506 slice c). Migration:
`supabase/migrations/20261025110000_person_anchor.sql`.
Rollback: `supabase/migrations/rollback_20261025110000_person_anchor.sql`.

This slice reserves two structural seams for the Phase 9 party spine (#570) and
proves one existing seam. Everything it adds is **inert**: nothing reads or
writes `public.persons` or `person_id` in Phase 4.

## The anchor: `public.persons`

| Column       | Type          | Rule                       |
| ------------ | ------------- | -------------------------- |
| `tenant_id`  | `uuid`        | NOT NULL, FK `tenants(id)` |
| `id`         | `uuid`        | NOT NULL                   |
| `created_at` | `timestamptz` | NOT NULL, default `now()`  |

- Primary key `(tenant_id, id)`, so every reference to a person carries its
  tenant.
- Row level security is enabled and forced. The one policy,
  `persons_staff_select`, lets `authenticated` SELECT rows only through
  `authz.has_staff_membership(tenant_id, NULL)`: active staff of that tenant.
  Inactive staff, other tenants' staff and non-members see zero rows.
- Grants: `REVOKE ALL ... FROM PUBLIC, anon, authenticated` runs first (hosted
  Supabase gives new public tables default grants), then `authenticated` gets
  SELECT only and `service_role` gets ALL. `anon` and `PUBLIC` have no
  privilege, so an `anon` SELECT fails with 42501. A staff INSERT, UPDATE or
  DELETE also fails with 42501. The table is in no publication and is not an
  entry in `docs/security/rls-deny-by-default-exceptions.json`.
- The table ships empty. Re-running the migration restores these grants even
  after a hosted-style `GRANT ALL` to `anon`, `authenticated` or `PUBLIC`.

## The seams: `missionaries.person_id` and `profiles.person_id`

Both are nullable `uuid` with no default. `donors` gets **no** `person_id`, and
no `party_id` or `party_type` exists anywhere (Phase 9, #570).

Each seam has two constraints (Q17: composite through the tenant column):

| Table          | Constraint                                  | Definition                                                              |
| -------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| `missionaries` | `missionaries_person_same_tenant_fk`        | `FOREIGN KEY (tenant_id, person_id) REFERENCES persons (tenant_id, id)` |
| `missionaries` | `missionaries_person_requires_tenant_check` | `CHECK (person_id IS NULL OR tenant_id IS NOT NULL)`                    |
| `profiles`     | `profiles_person_same_tenant_fk`            | `FOREIGN KEY (tenant_id, person_id) REFERENCES persons (tenant_id, id)` |
| `profiles`     | `profiles_person_requires_tenant_check`     | `CHECK (person_id IS NULL OR tenant_id IS NOT NULL)`                    |

- The FK on `(tenant_id, person_id)` means a row can only point at a person in
  its own tenant. A cross-tenant reference fails with 23503.
- The FK is `MATCH SIMPLE`, so it is skipped when `tenant_id` is NULL. The CHECK
  closes that gap: setting `person_id` on a tenant-less row fails with 23514.
- **Re-homing:** a linked row can't move tenant. Changing `tenant_id` on a
  profile or missionary whose `person_id` is set fails with 23503; clear
  `person_id` first. A referenced person can't be deleted (23503); an
  unreferenced one can.
- For `profiles`, the FK goes through `tenant_id`, which stays a nullable hint
  (below). It constrains which person a profile may name. It never grants
  access.
- No index on `(tenant_id, person_id)` (OQ5): nothing queries it until Phase 9.

### Inert rules

Until a later spec activates the seams:

1. No code under `apps/`, `packages/`, `scripts/`, `tooling/` or
   `supabase/functions` names `persons` or `person_id` (the census verifier
   excepted). No seed or migration INSERT, UPDATE or COPY on `missionaries`
   sets `person_id`.
2. No database function names `person_id`, and `missionaries` has no rule.
3. `anon` and `authenticated` have no INSERT or UPDATE privilege on
   `missionaries.person_id`.
4. The two write sites of `.from("missionaries")`
   (`packages/api/src/admin/member-care/mutations.ts` and
   `packages/api/src/profile/index.ts`) never put `person_id` in a payload. If
   that list changes, see #2268.
5. `packages/database/types/database.ts` is not regenerated: no typed client
   can select the seams.

### Field policies

`missionaries.person_id` and `profiles.person_id` are census supplement v3
(`docs/security/field-policies/repository-supplement-v3-person-anchor.json`),
category `security` (Q11). Their ten `field_policies` rows are `(F,F,F)` on all
five surfaces (OQ6). The census now expects 176 candidate columns and 880 rows.

## Build-verify finding: `profiles.tenant_id`

**Applied state.** `profiles.tenant_id` is a nullable `uuid` with one FK to
`tenants(id)`. It is not NOT NULL, and this slice doesn't change it.

**Plan.** The parent spec treats `profiles.tenant_id` as a home/UI hint only,
non-authoritative for authorization, with no policy, resolver or tenant guard
reading it for authz.

**Finding: the repository contradicts the plan.** It is read as a tenant input
today. Per spec In 3, this is escalated in the PR and tracked in #2267; this
slice changes no behavior.

**Since the second release of WP2b (AL-2675,
`20261119022102_request_tenant_policies.sql`), no RLS policy reads
`profiles.tenant_id`.** The staff profile read is dropped (plan 5.1), and the
four Storage policies below test a live membership in the path's tenant
(`authz.caller_tenant_ids()`). The #2256 real-stack suite now expects an empty
policy reader set; the function readers below are unchanged. The policy rows
below record the set as #2256 froze it:

- RLS policies:
  - `public.profiles` `profiles staff tenant select`. Staff of the profile's
    `tenant_id` may read the profile row.
  - `storage.objects` `profiles owner folder insert` and
    `profiles owner folder update`, added by #2406. Each binds the object's
    tenant folder segment to the caller's own `profiles.tenant_id`, looked up
    by `user_id = auth.uid()`. Each fails closed when the caller has no
    profile, or has a NULL tenant and isn't a `super_admin`. The `super_admin`
    demo fallback mirrors `getAuthContext` and is tracked in #2267; if #2267
    removes or moves it, these two policies change in the same PR.
  - `storage.objects` `editor images owner folder insert` and
    `editor images owner folder update`, added by #2407 (PR a). Each binds the
    object's tenant folder segment (`editor/{tenant}/...`) to the caller's own
    `profiles.tenant_id`, looked up by `user_id = auth.uid()`. Each fails
    closed when the caller has no profile, or has a NULL tenant and isn't a
    `super_admin`. The `super_admin` demo fallback mirrors `getAuthContext`
    and is tracked in #2267; if #2267 removes or moves it, these two policies
    change in the same PR.
- Functions (SECURITY DEFINER unless marked INVOKER). Most bound an actor or
  referenced profile to a tenant by requiring `profiles.tenant_id` to match.
  Since council round 2 on WP2a (R1), the five that check an actor the
  application hands them test a live membership in the tenant instead, as the
  application does; their `super_admin` branch keeps the profile check until
  WP2c (`20261118093000_eve_actor_checks_read_membership.sql`; the decision
  table's section 7 lists every one). They still name profiles beside
  `authz.memberships.tenant_id`, so the lexical scan keeps them.
  Since AL-2675 (WP2a, NR-49) `enforce_contribution_operation_tenant_refs` and
  `enforce_contribution_notification_tenant_refs` test a live membership in the
  row's tenant instead (`private.profile_in_tenant`) and are no longer readers;
  `tenant_member_directory` reads profiles beside `authz.memberships.tenant_id`
  and appears in the lexical scan, though it never reads the profile's tenant.
  Since the WP2a sweep the scan covers the `private` schema too, and two more
  functions appear in it on the same terms: `tenant_member_profiles`, the
  service-key reader of a tenant's members, and `private.profile_in_tenant`
  (INVOKER):
  - `tenant_member_directory`: display names for the member directory.
  - `tenant_member_profiles` (INVOKER since council round 1 on WP2a): a
    tenant's memberships joined to profiles, for service-key server code
    (AL-2675 sweep, NR-68).
  - `profile_in_tenant` (`private`, INVOKER): whether a profile's login holds
    a live membership in a tenant.
  - `assert_eve_retention_actor`: a live flagged staff row for `admin`
    since R1; the `super_admin` branch reads the profile's tenant.
  - `assert_eve_admin_memory_owner`: a live row in the tenant since R1.
  - `validate_eve_notification_recipient`: a `super_admin` profile of the
    tenant; unchanged until WP2c, behind the closed recipient PATCH.
  - `assert_eve_launch_profile`: a live row of the role's kind since R1; the
    `super_admin` branch reads the profile's role and tenant.
  - `assert_eve_policy_actor_tenant`: a live row in the tenant since R1; a
    `super_admin` profile with no tenant still passes until WP2c.
  - `enforce_eve_policy_permission_tenant` (INVOKER): the profiles' tenant;
    no application code writes its table.
  - `enforce_eve_ai_settings_grant_tenant` (INVOKER): the profile's tenant;
    no application code writes its table.
  - `atomic_update_profile_with_audit` (INVOKER): the profile's login holds a
    live row in the tenant since R1.
  - `atomic_update_user_role_with_audit`: since WP2a joined stage 1, DEFINER;
    it judges the caller's tenant-administrator membership and finds the
    target by membership, and reads no profile's tenant.
  - `set_eve_retention_hold`
  - `expire_eve_retention_records`
  - `handle_new_user`: the writer. Since AL-2675 it gives the new login a
    donor membership (WP2 "Interim rules"), and since council round 1 on WP2a
    (F3) it writes that membership's tenant to the profile's tenant column
    too, because the release already running reads it there (plan 7.4). The
    column grants nothing under WP2a; the migration that drops it (WP5) ends
    the write.
- App code that uses `profile.tenant_id` to pick or check the tenant: none.
  AL-2675 moved `packages/auth/context.ts`, `packages/auth/resolve-user-role.ts`
  and `apps/admin/src/cms/auth/supabase-strategy.ts` to the caller's
  membership, and the WP2a sweep moved the last three readers:
  `packages/api/src/eve/admin-memory/route.ts` tests the caller's live
  membership in the request's tenant, `packages/api/src/posts/reaction-route-utils.ts`
  takes the tenant of the request's resolved assignment, and
  `packages/ui/hooks/retained-draft.tsx` scopes drafts by the page's tenant.
- App code that filters `profiles` by tenant or role: none. The WP2a sweep
  moved every such query to membership, because a profile holds one tenant
  at most and a person may hold memberships in two (NR-68). Server code that
  needs a tenant's members, approvers, notification recipients, or the
  authors and assignees it shows reads `tenant_member_profiles` with the
  service key; Mission Control's users list reads the member directory
  (`tenant_member_directory`) on the caller's own token, which checks the
  caller's staff row and returns named columns only (council round 1 on
  WP2a, F8). The reader manifest's filter half
  (criterion 6b) fails on any query filter of the profile's tenant or role,
  the generic tenant-row helper's call included.

In `packages/ui/hooks/retained-draft.tsx`, `SessionRetainedDraftProvider`
scopes in-memory drafts by the user ID, the profile ID and the page's tenant,
which the app's server-side role gate publishes with `RetainedDraftPageTenant`
from the request's resolved assignment (until WP2b carries the tenant in the
page address). Without a page tenant for this user the store is unowned, and
an owner change remounts and clears it. This client-side memory boundary grants
no permissions; route/API policies retain access authority. Future readers of
the profile's tenant must be added to the pinned list and to this doc.

## Asym merge-candidate pairs: `donor_merge_candidates`

`public.donor_merge_candidates`
(`supabase/migrations/20260704140000_donor_matching_merge_candidates.sql`) is
the Asym donor-pair store (Q8, clash 3). This slice changes no schema there.

- Its composite FKs `donor_merge_candidates_existing_donor_same_tenant_fk` and
  `donor_merge_candidates_incoming_donor_same_tenant_fk` point
  `(tenant_id, existing_donor_id)` and `(tenant_id, incoming_donor_id)` at
  `donors (tenant_id, id)`. A pair across tenants fails with 23503.
- A new pair starts `status = 'open'`, and no trigger moves it; nothing
  auto-merges. Merge execution is #512, dedupe scans are #513.
- The legacy `crm_merge_candidates` (Twenty era) is untouched and stays
  dormant (ADR-0001).

## Rollback and order

`rollback_20261025110000_person_anchor.sql` deletes the ten `person_id`
`field_policies` rows, drops the four seam constraints, drops both `person_id`
columns, then drops `persons`, in that order and without CASCADE. It removes
nothing else; #2254's `normalize_email` and donor keys survive. Run it before
#2254's rollback. The migration runner skips `rollback_` files. Once a later
phase writes persons, rolling back deletes them. After rollback then
re-apply on a persistent database, `person_id` lands at ordinals 23
(`missionaries`) and 15 (`profiles`) instead of 22 and 14 (PostgreSQL doesn't
reuse a dropped column's attnum), so the census v3 `local_catalog` check fails
on that database; CI always migrates a fresh one, so nothing changes in CI.

## Deploy: lock timeout

`ADD COLUMN` and the `CHECK … NOT VALID` adds take ACCESS EXCLUSIVE on
`missionaries` and `profiles`. The FK adds take SHARE ROW EXCLUSIVE on the
altered table and on `persons`, and on a first apply the `persons` FK takes it
on `tenants`. Every lock is held until COMMIT, so through the VALIDATE scans;
adding NOT VALID and then validating in the same transaction doesn't shorten
the hold. Both tables are small, so the hold is brief in practice.
`SET LOCAL lock_timeout = '5s'` bounds only the wait to acquire each lock. On
SQLSTATE 55P03 nothing is applied: re-run in a quiet window.

Re-running the file on a live database takes `persons` before `missionaries`,
so it can fail with SQLSTATE 40P01 (deadlock) against concurrent writes. The
transaction is atomic, so nothing is applied; re-run it in a quiet window.
