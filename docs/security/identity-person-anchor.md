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
slice changes no behavior. The frozen reader set, pinned by the #2256 acceptance
tests, is:

- RLS policies:
  - `public.profiles` `profiles staff tenant select`. Staff of the profile's
    `tenant_id` may read the profile row.
  - `storage.objects` `editor images owner folder insert` and
    `editor images owner folder update`, added by #2407 (PR a). Each binds the
    object's tenant folder segment (`editor/{tenant}/...`) to the caller's own
    `profiles.tenant_id`, looked up by `user_id = auth.uid()`. Each fails
    closed when the caller has no profile, or has a NULL tenant and isn't a
    `super_admin`. The `super_admin` demo fallback mirrors `getAuthContext`
    and is tracked in #2267; if #2267 removes or moves it, these two policies
    change in the same PR.
- Functions (SECURITY DEFINER unless marked INVOKER). Most bind an actor or
  referenced profile to a tenant by requiring `profiles.tenant_id` to match:
  - `enforce_contribution_operation_tenant_refs`
  - `enforce_contribution_notification_tenant_refs`
  - `assert_eve_retention_actor`
  - `assert_eve_admin_memory_owner`
  - `validate_eve_notification_recipient`
  - `assert_eve_launch_profile`
  - `assert_eve_policy_actor_tenant`
  - `enforce_eve_policy_permission_tenant` (INVOKER)
  - `enforce_eve_ai_settings_grant_tenant` (INVOKER)
  - `atomic_update_profile_with_audit` (INVOKER)
  - `atomic_update_user_role_with_audit` (INVOKER)
  - `set_eve_retention_hold`
  - `expire_eve_retention_records`
  - `handle_new_user`: the writer that sets it at sign-up.
- App code that uses `profile.tenant_id` to pick or check the tenant:
  - `apps/admin/src/cms/auth/supabase-strategy.ts`
  - `packages/api/src/eve/admin-memory/route.ts`
  - `packages/api/src/posts/reaction-route-utils.ts`
  - `packages/auth/context.ts`
  - `packages/auth/resolve-user-role.ts`

In `packages/auth/context.ts` and `packages/auth/resolve-user-role.ts` the hint
selects the tenant whose `authz.memberships` are loaded; the membership, not the
hint, carries the role. The other readers use it as a tenant-binding check. A
new reader must be added to the pinned list and to this doc, with #2267.

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
phase writes persons, rolling back deletes them.

## Deploy: lock timeout

Adding the columns and constraints takes brief ACCESS EXCLUSIVE locks on
`missionaries` and `profiles`, and the FKs take SHARE ROW EXCLUSIVE on
`tenants` and `persons`. Constraints are added NOT VALID and then validated, so
no lock is held for a full scan. `SET LOCAL lock_timeout = '5s'` bounds the
wait. On SQLSTATE 55P03 nothing is applied: re-run in a quiet window.
