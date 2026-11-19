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
- **Tenant source:** since the second release of WP2b (AL-2675, `20261119022102_request_tenant_policies.sql`), `authz.current_tenant_id()` reads no token claim. It returns the tenant the request's `x-asym-tenant` header names, when the request's one assignment resolves there. The three policies were rewritten in the same migration: the tenant condition, a donor assignment (`(SELECT authz.assignment_is('donor'))`), and the caller's own donor record in that tenant through `donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids()))`, each lookup a whole sub-select (council R11). So a staff member who also gives reads and writes their preferences only under their donor assignment. A malformed tenant header raises `22P02` wherever a policy's lookup runs; where it never runs, because the table holds no row the filter could return, the answer is empty and not an error (council R13). Either way nothing is admitted. The predicate above is the #2260 text.
- **#668** planned the same repoint through a request GUC; WP2b carried it by the request header instead.

## Down

Run by hand. It touches no data.

1. `DROP POLICY IF EXISTS` on `donor_feed_preferences_own_select`, `donor_feed_preferences_own_insert` and `donor_feed_preferences_own_update`.
2. `REVOKE ALL ON TABLE public.donor_feed_preferences FROM PUBLIC, anon, authenticated;` (`service_role` is untouched).
3. Re-add the `donor_feed_preferences` entry (`service_role_needed`) to `docs/security/rls-deny-by-default-exceptions.json`, or the RLS catalog gate fails on a tenant table with no policy that is not listed.
