# `profiles` storage bucket contract

The `profiles` bucket holds avatar and cover photos. Migration
`supabase/migrations/20261027100000_profiles_bucket_owner_folders.sql` (#2406,
folds in #2417) scopes writes to the owner's folder, limits object reads
through the API to the owner, and sets size and type limits. Rollback:
`supabase/migrations/rollback_20261027100000_profiles_bucket_owner_folders.sql`.

## Key layout

```
{avatars|covers}/{tenantId}/{userId}/{rest}
```

- `avatars` or `covers` is the purpose.
- `tenantId` is the caller's `profiles.tenant_id`. A `super_admin` whose
  `tenant_id` is NULL uses `DEMO_TENANT_ID`
  (`00000000-0000-0000-0000-000000000001`, `packages/auth/constants.ts`); a
  `super_admin` with a tenant uses that tenant and never the demo one. This
  mirrors `getAuthContext`.
- `userId` is `auth.uid()` (`ctx.userId`).
- `rest` is non-empty. The upload route (`POST /api/upload/image`, #2308)
  writes `{uuid}.{ext}` with `upsert: false`.

## Policies on `storage.objects`

Exactly four policies cover the bucket. All are `TO authenticated`; `anon`
has none.

| Policy                         | Command | Rule                                                                                                 |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `profiles owner folder insert` | INSERT  | WITH CHECK: the name is in the caller's own folder (layout above)                                    |
| `profiles owner folder update` | UPDATE  | USING: `owner = auth.uid()`. WITH CHECK: still the owner, and the name is in the caller's own folder |
| `profiles owner select`        | SELECT  | USING: `owner = auth.uid()`                                                                          |
| `Owner delete profiles`        | DELETE  | USING: `owner = auth.uid()` (unchanged since init_schema)                                            |

- The folder check splits the name with `string_to_array(name, '/')`, not
  `storage.foldername()`, and wraps `auth.uid()` as `(SELECT auth.uid())`.
- Uploading a new object needs INSERT only. Storage API `remove` and `move`
  need SELECT on the owner's own rows, which `profiles owner select` gives.
- An owned object outside the layout (a legacy path) can be deleted or moved
  into the owner's folder, but not updated in place.
- The bucket stays `public`, so public object URLs are served without any
  SELECT policy. Listing, signed URLs and downloads go through RLS.
- Direct browser uploads (the dormant `useBackendProcessing={false}` branch
  of `ImageUpload`) must use this layout and `upsert: false`.
- The two folder policies read `profiles.tenant_id`, so they are in the
  sanctioned reader set in `docs/security/identity-person-anchor.md` (#2267).

## Bucket limits

| Column               | Value                                                |
| -------------------- | ---------------------------------------------------- |
| `file_size_limit`    | `5242880` (5 MB, the upload route's cap)             |
| `allowed_mime_types` | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |

Storage enforces these on upload. If the route's cap changes, change the
bucket limit in the same PR.

### Recorded prior limits

Before changing the limits, the migration copies the bucket's previous
`file_size_limit` and `allowed_mime_types` into
`private.storage_bucket_limits_20261027100000` (`bucket_id`,
`file_size_limit`, `allowed_mime_types`, `recorded_at`). The first record is
kept if the migration runs again. `ALL` is revoked from `PUBLIC`, `anon`,
`authenticated` and `service_role`, and nothing is granted, so no API role
can read it. The rollback restores these values and drops the table.

## Profile image URL rule

`PATCH /api/profile` (`avatarUrl`, `coverUrl`) and `PATCH /api/donor/portal`
(`avatarUrl`) accept a value only when it is:

- `null`, which clears the field;
- equal to the currently stored value, which is accepted and not rewritten;
- exactly `{origin}/storage/v1/object/public/profiles/{purpose}/{tenantId}/{userId}/{rest}`,
  where `origin` is the origin of `NEXT_PUBLIC_SUPABASE_URL`, `purpose` is
  `avatars` for `avatarUrl` and `covers` for `coverUrl`, `tenantId` is
  `ctx.tenantId` and `userId` is `ctx.userId`.

Comparisons are exact strings. The URL must be canonical, with no query,
fragment, credentials, `.` or `..` segments (raw or percent-encoded), encoded
`/` or empty segments. Anything else returns 400 `{ error }` and writes
nothing. With `NEXT_PUBLIC_SUPABASE_URL` unset, a new non-null URL returns 503. The validator is `packages/api/src/profile/image-url.ts`; it runs before
any write.

## Pre-deploy listing

Before the migration is applied to a hosted environment, the factory runs a
read-only listing of `profiles` objects (`name`, `metadata->>'mimetype'`,
`(metadata->>'size')::bigint`) that are outside the layout
(`name !~ '^(avatars|covers)/[^/]+/[^/]+/.+'`), not one of the four types,
or over 5242880 bytes, plus the bucket's current limits and policy list. The
result goes in the factory handoff note, not in the repository. Nothing is
moved or deleted; any cleanup is a separate, owner-approved step.

## Deploy

- The migration depends only on `20250101000000_init_schema.sql` and creates
  the `private` schema if it is missing.
- Either order works with the upload route: its keys pass the new INSERT
  policy, and its upload needs no SELECT.
- `NEXT_PUBLIC_SUPABASE_URL` in each app must equal the URL storage public
  links are built from.
- After deploy, for missionary avatar, missionary cover and donor avatar:
  upload a photo (201); open its public URL signed out (200); reload the
  profile; save a non-storage URL and another user's folder URL through the
  API (both 400); `list()` the bucket signed out and another user's folder
  signed in (both empty); upload an over-limit file and a non-image type (both
  rejected by storage).

## Rollback

The rollback file drops the three new policies, recreates
`Public read profiles`, `Authenticated upload profiles` and
`Owner update profiles` exactly as init_schema defines them, sets both limit
columns back to the recorded values, and drops the record table, all in one
transaction. If the recorded row is missing it raises and changes nothing; it
never sets the limits to NULL by default. Because it restores the earlier
upload and read policies, apply it only together with reverting the app
commit. If the recorded values differ from the factory's pre-deploy listing,
restore the listed values.
