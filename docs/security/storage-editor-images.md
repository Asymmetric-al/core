# Editor image storage contract

The `document-uploads` bucket holds images inserted in the rich-text editor.
Migration `supabase/migrations/20261028100000_editor_image_storage.sql`
(#2407, PR a) scopes writes to the owner's folder, limits object reads through
the API to the owner, and sets size and type limits. Rollback:
`supabase/migrations/rollback_20261028100000_editor_image_storage.sql`.

## Upload route

The editor never writes to storage from the browser. With an `imagePurpose`
prop it posts `FormData { file, purpose }` with the session bearer to
`POST /api/upload/editor-image` (admin and missionary apps, shared handler
`packages/api/src/upload/editor-image.ts`). Without the prop, and without
`onImageClick`, it shows no upload button.

- `purpose` is exactly `feed`, `care-thread` or `care-note`; anything else is 400. `feed` needs a missionary, staff, admin or super_admin role. The care
  purposes need staff, admin or super_admin, and the missionary app refuses
  them for everyone (403, before any storage call).
- The file must be JPEG, PNG, WebP or GIF with matching leading bytes (415)
  and at most 5242880 bytes, checked on the declared and streamed body (413).
- The route uploads with the caller's bearer client (never the service role)
  and `upsert: false`, and answers 201 `{ url, path }` with the public URL.
  A storage error is a generic 502.
- Until #2407 PR (b), care images use this bucket and layout too, with public
  URLs, as the editor did before.

## Key layout

```
editor/{tenantId}/{userId}/{uuid}.{ext}
```

- `tenantId` is the caller's `profiles.tenant_id`. A `super_admin` whose
  `tenant_id` is NULL uses `DEMO_TENANT_ID`
  (`00000000-0000-0000-0000-000000000001`, `packages/auth/constants.ts`); a
  `super_admin` with a tenant never uses the demo one. This mirrors
  `getAuthContext`, and the policy text is #2406's.
- `userId` is `auth.uid()` (`ctx.userId`); `ext` comes from the detected type.
- Nothing in the key comes from client text.

## Policies on `storage.objects`

Exactly four policies cover the bucket. All are `TO authenticated`; `anon`
has none.

| Policy                              | Command | Rule                                                                                                 |
| ----------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `editor images owner folder insert` | INSERT  | WITH CHECK: the name is `editor/{own tenant}/{auth.uid()}/{non-empty rest}`                          |
| `editor images owner folder update` | UPDATE  | USING: `owner = auth.uid()`. WITH CHECK: still the owner, and the name is in the caller's own folder |
| `editor images owner select`        | SELECT  | USING: `owner = auth.uid()`                                                                          |
| `Owner delete document-uploads`     | DELETE  | USING: `owner = auth.uid()` (unchanged since init_schema)                                            |

- The folder check splits the name with `string_to_array(name, '/')` and
  wraps `auth.uid()` as `(SELECT auth.uid())`; it never casts a segment.
- Objects already at `editor/<random>-<timestamp>.<ext>` stay where they are
  and stay readable at their public URLs. Owners can delete them or move them
  into their own folder, but not update them in place.
- The bucket stays `public`, so public object URLs are served without any
  SELECT policy. Listing, signed URLs and downloads go through RLS.

## Bucket limits

| Column               | Value                                                |
| -------------------- | ---------------------------------------------------- |
| `file_size_limit`    | `5242880` (5 MB, the upload route's cap)             |
| `allowed_mime_types` | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |

### Recorded prior limits

Before changing the limits, the migration copies the bucket's previous values
into `private.storage_bucket_limits_20261028100000` (`bucket_id`,
`file_size_limit`, `allowed_mime_types`, `recorded_at`). The first record is
kept if the migration runs again. `ALL` is revoked from `PUBLIC`, `anon`,
`authenticated` and `service_role`, and nothing is granted.

## Pre-deploy listing

Only after the owner's go-ahead, the factory runs a read-only listing of
`document-uploads` objects outside the layout, not one of the four types, or
over 5242880 bytes; the bucket's current limits and policy list, flagging any
policy on this bucket that is not in the migrations (that goes back for
security sign-off before apply); and counts and row ids of care rows whose
content embeds this bucket's URLs. The result goes in the factory handoff
note, not the repository. Nothing is moved, deleted or rewritten.

## Deploy

- The migration depends only on `20250101000000_init_schema.sql` and creates
  the `private` schema if it is missing.
- Apply the migration and deploy the apps together. Migration first: the old
  editor's direct uploads are refused until the apps deploy. Apps first: the
  new route works, but the old policies still allow direct uploads.
- After deploy: in the worker feed and org updates, insert an image (201),
  publish, open its URL signed out (200); upload an over-limit file and a
  non-image type (413, 415); `list()` the bucket signed out (empty).

## Rollback

The rollback file drops the three new policies, recreates
`Public read document-uploads`, `Authenticated upload document-uploads` and
`Owner update document-uploads` exactly as init_schema defines them, sets both
limit columns back to the recorded values, and drops the record table, in one
transaction. If the recorded row is missing it raises and changes nothing; it
never sets the limits to NULL. It restores the earlier upload and read
policies, so apply it only together with reverting the app commit. If the
recorded values differ from the pre-deploy listing, restore the listed values.
