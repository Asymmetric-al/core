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

- `tenantId` is the tenant of the membership row the request resolved
  (`ctx.tenantId` from `getAuthContext`, since WP2b's first release, AL-2675),
  and the policies accept it only where the caller holds a live membership.
  Before that release it was the caller's `profiles.tenant_id`, with
  `DEMO_TENANT_ID` for a `super_admin` whose `tenant_id` was NULL.
- `userId` is `auth.uid()` (`ctx.userId`); `ext` comes from the detected type.
- Nothing in the key comes from client text.

## Policies on `storage.objects`

Exactly four policies cover the bucket. All are `TO authenticated`; `anon`
has none.

As they stand since the second release of WP2b (below). "A live tenant" is
one where the caller holds a live membership row, through
`authz.caller_tenant_ids()`.

| Policy                              | Command | Rule                                                                                                                                               |
| ----------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editor images owner folder insert` | INSERT  | WITH CHECK: the name is `editor/{a live tenant}/{auth.uid()}/{non-empty rest}`                                                                     |
| `editor images owner folder update` | UPDATE  | USING and WITH CHECK: `owner = auth.uid()`, and the name is `editor/{a live tenant}/{auth.uid()}/{non-empty rest}`, before the update and after it |
| `editor images owner select`        | SELECT  | USING: `owner = auth.uid()`, and the name is `editor/{a live tenant}/...`                                                                          |
| `Owner delete document-uploads`     | DELETE  | USING: `owner = auth.uid()`, and the name is `editor/{a live tenant}/...`                                                                          |

- The folder check splits the name with `string_to_array(name, '/')` and
  wraps `auth.uid()` as `(SELECT auth.uid())`; it never casts a segment.
- Objects already at `editor/<random>-<timestamp>.<ext>` stay where they are,
  and their public URLs still serve them. They are outside the owner-folder
  layout, so no signed-in user can read, update, move or delete them through
  the Storage API; only the server can.
- The bucket stays `public`, so public object URLs are served without any
  SELECT policy, to anyone who has the URL, whatever the policies say.
  Listing, signed URLs and downloads through the API go through RLS.
- Until the second release of WP2b the two folder policies read
  `profiles.tenant_id`, which put them in the sanctioned reader set of
  `docs/security/identity-person-anchor.md` (#2267). No policy reads it now.

**Since the second release of WP2b (AL-2675,
`20261119135300_request_tenant_policies.sql`).** The upload, replace, read and
delete policies of the editor images all test a live membership of the caller
in the tenant the `editor/{tenantId}/...` path names, through
`authz.caller_tenant_ids()`, with no assignment, because Storage cannot carry
the request headers (plan 5.2; activation review Q10). A person with two
memberships, or two rows in one tenant, uploads in each; a person whose
membership has ended no longer reads or deletes their images in that tenant's
folder through the API. That does not withdraw an image: anyone who already
has its public URL can still fetch it. Reads and deletes now require the
owner-folder layout, so the legacy `editor/<random>-<timestamp>.<ext>`
objects above stay at their public URLs and are reachable through the API
only by the server (the coordinator's no-legacy ruling). No policy reads
`profiles.tenant_id` any more.

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
