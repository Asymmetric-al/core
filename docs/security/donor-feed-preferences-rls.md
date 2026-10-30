# donor_feed_preferences: own-row RLS (#2260)

`GET` and `POST /api/donor/feed-preferences` (`packages/api/src/feed-preferences/index.ts`) run with the user-JWT server client. The database decides which rows a signed-in donor can read or save, not the route. Migration: `supabase/migrations/20261025120000_donor_feed_preferences_own_rows.sql`.

## Grant matrix

| Role            | Table privileges                                                              |
| --------------- | ----------------------------------------------------------------------------- |
| `anon`          | none                                                                          |
| `authenticated` | `SELECT, INSERT, UPDATE` (no `DELETE`, `TRUNCATE`, `REFERENCES` or `TRIGGER`) |
| `service_role`  | unchanged (the donor portal reads through the admin client)                   |
| `PUBLIC`        | none                                                                          |

No column-level grant exists for `anon` or `authenticated`. There is no `DELETE` grant or handler: a donor resets by posting the defaults.

## The own-row predicate

All three policies (`donor_feed_preferences_own_select`, `_own_insert`, `_own_update`, each `TO authenticated`) use the same predicate. The UPDATE policy uses it as both `USING` and `WITH CHECK`, so a row cannot be moved to another tenant or donor.

```sql
tenant_id = (SELECT authz.current_tenant_id())
AND EXISTS (
  SELECT 1 FROM public.donors d
  JOIN public.profiles p ON p.id = d.profile_id
  WHERE d.id = donor_feed_preferences.donor_id
    AND d.tenant_id = donor_feed_preferences.tenant_id
    AND p.user_id = (SELECT auth.uid())
)
```

- `tenant_id = authz.current_tenant_id()` keeps every row in the caller's JWT tenant. The function returns NULL without a valid UUID claim, so the predicate is false and nothing matches.
- `d.id = donor_id` ties the row to a real donor record.
- `d.tenant_id = tenant_id` stops a row pointing at a donor from another tenant.
- `p.user_id = auth.uid()` makes the donor the caller's own, through profile ownership. Staff membership does not count.

## Threat model

- A donor cannot read, update or insert another donor's row in the same tenant.
- A donor cannot see a cross-tenant row, even when filtering on that tenant.
- A donor cannot insert a row into another tenant, or for a donor in another tenant, and cannot update their own row to another tenant or donor (42501, `WITH CHECK`).
- With a stale or forged tenant claim (a tenant where the caller has no donor), a donor reads nothing and cannot insert.
- With no tenant claim, or a non-UUID one, a donor reads nothing, updates nothing and cannot insert.
- Staff in the tenant get no extra rows through this table; staff paths keep using the service-role donor-portal code.
- `anon` cannot SELECT, INSERT, UPDATE or DELETE (42501).
- `authenticated` cannot DELETE or TRUNCATE (42501).

The route applies the same rules first. It reads the tenant from `user.app_metadata.tenant_id` with the same UUID shape check (403 `Tenant context required` when it is missing or invalid). It finds the donor by profile ownership in that tenant, not by email (409 on more than one donor, nothing written). It returns 500 when the read fails, instead of silently returning defaults.

## Hosted default privileges

Hosted Supabase grants ALL on new `public` tables to `anon` and `authenticated` through default privileges. CI does not emulate those default grants. So the migration first runs `REVOKE ALL ... FROM PUBLIC, anon, authenticated` (which also clears column grants) and then grants `SELECT, INSERT, UPDATE` to `authenticated`. Its postcondition raises unless exactly the three policies exist, `anon` holds nothing and `authenticated` holds exactly those three. The real-stack acceptance test emulates the hosted grants in a rolled-back transaction and re-runs the migration.

## Dependencies: #2251 and #668

- **#2251** enables and forces RLS on the table. The migration's precondition raises unless both flags are set. This change removes the table from `docs/security/rls-deny-by-default-exceptions.json`, because the table now has policies.
- **JWT tenant source:** `authz.current_tenant_id()` reads `app_metadata.tenant_id` from `auth.jwt()` today.
- **#668** plans to make `authz.current_tenant_id()` read a request GUC. These policies go through that function, so they follow the rewrite. #668 also plans a gate that says RLS holds no identity logic. The `auth.uid()` clause here is identity logic by ruling, so #668 must exempt or rewrite these policies when it lands.

## Down

Run by hand. It touches no data.

1. `DROP POLICY IF EXISTS` on `donor_feed_preferences_own_select`, `donor_feed_preferences_own_insert` and `donor_feed_preferences_own_update`.
2. `REVOKE ALL ON TABLE public.donor_feed_preferences FROM PUBLIC, anon, authenticated;` (`service_role` is untouched).
3. Re-add the `donor_feed_preferences` entry (`service_role_needed`) to `docs/security/rls-deny-by-default-exceptions.json`, or the RLS catalog gate fails on a tenant table with no policy that is not listed.
