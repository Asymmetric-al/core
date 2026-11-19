# WP6 pre-baseline proofs: constraints, supplied IDs, JSON blocks and the plain media collection

**Purpose.** WP6 ("CMS clean target", plan section 12) writes one baseline migration for the new `cms` schema, and the baseline takes one block-storage form. Plan 15.2 lists the proofs that must run first. This report settles four rows of 15.2: "Hand-written constraints surviving Payload's generated migrations", "Supplied UUIDs for Site presentations and media records on v4", "JSON blocks", and "Core-issued signed upload into a private bucket, with Payload holding metadata only, on v4". There was time for a fifth row, "Payload's own publish control cannot make anything public", so it ran too.

**Base.** Integration branch at `639c9d8a4` (stage 1 of the plan merged with `develop`). Payload, `@payloadcms/db-postgres` and `@payloadcms/richtext-lexical` are pinned at 4.0.0-beta.9. Node 24.22.3. The prototype is not for merge. It is kept as one patch (section 15).

**Where it ran.** On 18 November 2026. Proofs 1, 2, 3 and 5 ran on a PostgreSQL 17.10 container of this proof's own (`wp6p-pg`, `postgres:17-alpine` on 127.0.0.1:26399), the same version as the shared test server, with one new database per variant. Proof 4 ran on a disposable local Supabase stack on slot B (project ID `wp6p-slot-b`, every port in the 263xx range, CLI 2.121.0), started from a scratch copy of `supabase/`. No hosted project was used. Development runs first went to the shared test server and changed the cluster-wide CMS roles there (section 13.1). No evidence in this report comes from those runs, and the roles they touched are restored.

## 1. Verdicts

**Hand-written constraints: it works, with a change to the plan.** Payload's generator never mentions a constraint it did not write, so a hand-written constraint survives every generated migration that adds, renames or removes a column it does not use. It survives a rename of a column it uses too, because Postgres carries a constraint across `RENAME COLUMN`. It is lost silently when a generated migration drops and re-creates a column it uses. That happens when the developer answers "create" to the generator's rename prompt, or when a field is removed or changes type: four constraints went with the column, and the migration succeeded. The plan's fallback, a hand-written file the release job re-applies, works. It re-applied cleanly after each change, and failed loudly after the rename, because the file still named the old column. The better form is to declare the constraints in Payload's own schema through the adapter's `afterSchemaInit` hook. The generator then writes them into the baseline and rewrites them on every change. A change that the data cannot satisfy fails the migration, and the transaction leaves the schema as it was. WP6 should use that form, with the suite's catalog check behind it (sections 4 and 10).

**Supplied UUIDs: it works, with the settings the plan names.** With `idType: 'uuid'` and `allowIDOnCreate: true`, a Site presentation and a media record created through the service port keep the ID supplied. Through the actor port, and through REST, the factory's hook discards a supplied ID. A page create discards it on every path, which is WP6's acceptance line. The adapter setting alone keeps every supplied ID on every path, REST and pages included, so the factory's hook is required and not optional. An update cannot change an ID. The plan's fallback (Payload's own ID and a unique `site_id` or `asset_id` column) is not needed (section 5).

**JSON blocks: it works, and its costs are now known.** The round trip holds: a block's media reference and a rich-text node's media reference come back as IDs at depth 0 and as populated records at depth 1. A block schema change is invisible to the migration generator. A new field reads as absent on old data. A renamed field keeps its old value under the old key, and the new field reads empty. A removed field keeps coming back from stored data. So every rename or removal of a block field needs a hand-written data migration, and the reader must drop unknown fields, not only unknown blocks. Relational blocks handle the same three changes in the generated migration (`ADD`, `RENAME` after a prompt, `DROP COLUMN`), at the cost of two tables per block type and one more insert per block type on every save. Reference integrity is the same in both forms: deleting a referenced media record succeeds. JSON leaves the page holding a dangling ID, and relational blocks null it, because Payload's key is `ON DELETE SET NULL`. The plan's fallback (relational blocks) works, but buys nothing on integrity (section 6).

**The plain media collection with a Core-issued upload: it works.** Each step of the row was carried out on the local stack, in order:

- A server-side command recorded the asset and issued a one-object signed upload into a private bucket.
- The bytes went up with no key, and the same token could not write again.
- Finalize decoded the image, applied its orientation, re-encoded it with no EXIF, GPS or ICC data, wrote it once under a content-addressed key, and marked it ready.
- Payload registered the editorial record under the custody ID through the service port.
- A staff member picked the image in a block and in rich text.
- A route that checks the caller served it with `private, no-cache` and an ETag, and answered 304.
- The delete tombstoned, removed and purged.

An anonymous request and a signed-in member's direct Storage read, write, overwrite, delete, list and signed-URL request were all refused. A registration that failed after finalize was retried without writing a second object. Rich text picks a plain collection through Lexical's relationship node. Its upload node refuses any collection without Payload's `upload` config, so the plan's fallback, a custom node, is not needed to store the reference (section 7).

**Payload's own publish control: it cannot make anything public.** A REST write of `_status: published` by a staff member succeeds inside `cms`. Every statement it sends writes a `cms` table, none names another schema, and `cms_runtime` can read no table outside `cms` (section 8).

## 2. What was built

| Path                                                     | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/admin/src/cms-proofs/wp6/payload.config.ts`        | A Payload configuration of its own, not imported by the app: UUID IDs, `allowIDOnCreate`, schema push off, `schemaName: 'cms'`, GraphQL off, `blocksAsJSON` from `WP6P_BLOCKS`, and `afterSchemaInit` when `WP6P_CONSTRAINTS=schema`                                                                                                                                                                                                                                          |
| `apps/admin/src/cms-proofs/wp6/collections.ts`           | `site-presentations`, `pages` (one collection with a `site` relationship, `slug`, `family`, a `layout` of two block types and a rich-text `body`, drafts on), a plain `media` collection (alt, credit, folder; no upload config), and `principal-links` (an auth collection whose strategy reads the actor from a header the harness sets). `WP6P_STAGE` walks one page field and one block field through add, rename and remove, then renames the page's `site` relationship |
| `apps/admin/src/cms-proofs/wp6/tenant-scoped.ts`         | A minimal `tenantScoped()` factory: a tenant column, access that reads the caller's tenant, and a `beforeOperation` hook that discards `data.id` on create unless the call runs on the service port and the collection may take one                                                                                                                                                                                                                                           |
| `apps/admin/src/cms-proofs/wp6/schema-constraints.ts`    | The target's extra constraints declared through `afterSchemaInit`: the unique `(id, tenant)` key, tenant shape checks, the same-tenant composite key from pages and from page versions to the Site presentation, and a check that a page names its Site                                                                                                                                                                                                                       |
| `scripts/proofs/wp6/constraints.sql`                     | The same constraints as hand-written SQL, with the unique `(site, slug)` index. Every statement is safe to run again                                                                                                                                                                                                                                                                                                                                                          |
| `scripts/proofs/wp6/run-proofs.mjs`                      | The harness for proofs 1, 2, 3 and 5. It creates a database, applies the whole Supabase chain from empty, generates the baseline with Payload's generator, migrates as `cms_owner`, and runs the proof body as `cms_runtime`. Then it walks four generated migrations, checking the catalog after each. It refuses the shared test server's port                                                                                                                              |
| `scripts/proofs/wp6/answer-prompts.py`                   | Runs the generator in a pseudo-terminal and answers each "created or renamed" prompt, because the generator exits without writing in a non-interactive shell                                                                                                                                                                                                                                                                                                                  |
| `scripts/proofs/wp6/proof-body.mjs`, `proof-runtime.mjs` | The checks, run through the pinned Payload's own `tsx` as the qualification suite runs its body. Every statement the adapter sends is recorded                                                                                                                                                                                                                                                                                                                                |
| `scripts/proofs/wp6/media/media-custody.sql`             | A stand-in for `public.media_assets` (RLS forced, no policy, service role only), a stand-in for the resolver's membership answer, and the private bucket at the proposed limits of 6.6: 15 MB, and JPEG, PNG or WebP                                                                                                                                                                                                                                                          |
| `scripts/proofs/wp6/media/media-proof.mjs`               | Proof 4: the upload command, finalize (with `sharp` 0.35.5), registration through a Payload child process that holds no Supabase key, the media route, the direct Storage attempts and the delete                                                                                                                                                                                                                                                                             |

## 3. Method

Each proof-1-to-3 run is one variant on one new database: blocks `json` or `relational`, and constraints `hand` (a hand-written migration) or `schema` (`afterSchemaInit`). It runs:

1. The repository's Supabase chain from empty (`scripts/verify/supabase-migrations.mjs`), which creates `cms`, `cms_owner` and `cms_runtime`.
2. `payload migrate:create baseline`, run through `scripts/cms/run-payload-command.mjs`. In the `hand` variant a second, blank migration is generated and filled with `constraints.sql`. Both variants add the ledger revoke that the app's `20261117_082928_cms_runtime_ledger_read_only` makes.
3. `payload migrate`, logged in as `cms_owner`.
4. The proof body, with Payload logged in as `cms_runtime`, schema push off. It runs the seed, supplied IDs, deleting referenced media and the status write.
5. Four changes, each with `migrate:create`, `migrate` as `cms_owner`, a catalog check, a re-apply of `constraints.sql` as `cms_owner` in the `hand` variant, and a read of the old page followed by a write in the new shape:
   1. Add a page field and a block field.
   2. Rename both.
   3. Remove both.
   4. Rename the page's `site` field to `presentation`, a column that three of the constraints use.

   The fourth change runs twice: once with the prompt answered "rename" and once answered "create".

Six runs: `json-hand` (both answers), `json-schema` (both answers), `relational-hand` and `relational-schema` (rename). Each run's results, log and generated migrations are kept under `impl/evidence/wp6-proofs-results/`.

## 4. Proof 1: hand-written constraints and the generated migrations

The constraints are one of each kind the target has. Each is named `pages_*` or `_pages_v_*` unless stated:

- `site_presentations_id_tenant_key`, a unique key on `(id, tenant)`
- `pages_site_same_tenant_fk` and `_pages_v_site_same_tenant_fk`, composite foreign keys to that key, `ON DELETE RESTRICT`
- three tenant-shape checks, one each on Site presentations, media and pages
- `pages_site_required_check`, which makes a page name its Site
- `pages_site_slug_key`, a unique index on `(site_id, slug)`

| Change                                 | Generated SQL                                                                                                                                                                 | `hand`: after `migrate`                                                            | `hand`: re-apply                             | `schema`: after `migrate`                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline                               | 330 lines; names none of the hand-written constraints. The `schema` baseline names all of them                                                                                | All present                                                                        | Clean                                        | All present                                                                                                                                   |
| 1. Add                                 | `ADD COLUMN` only                                                                                                                                                             | All present                                                                        | Clean                                        | All present                                                                                                                                   |
| 2. Rename (answered "rename")          | `RENAME COLUMN` on `pages` and `_pages_v`                                                                                                                                     | All present                                                                        | Clean                                        | All present                                                                                                                                   |
| 3. Remove                              | `DROP COLUMN` on `pages` and `_pages_v`                                                                                                                                       | All present                                                                        | Clean                                        | All present                                                                                                                                   |
| 4. Rename `site_id`, answered "rename" | `RENAME COLUMN site_id TO presentation_id`; drops and re-adds Payload's own key and index. The `schema` form also drops and re-adds the three constraints that use the column | All present, now on `presentation_id` (Postgres carries them across the rename)    | **Fails**: `column "site_id" does not exist` | All present, on the new column                                                                                                                |
| 4. Rename `site_id`, answered "create" | `ADD COLUMN presentation_id`, then `DROP COLUMN site_id`. The `schema` form also re-adds the constraints on the new column                                                    | **Four lost silently** with the column; `migrate` exits 0; the page loses its Site | **Fails**, the same way                      | **Migration fails** on `pages_site_required_check`, because the existing page has no Site; the whole migration rolls back and nothing is lost |

Three facts carry the verdict.

- **The generator does not know a hand-written constraint, so it neither drops nor rewrites one by name.** The risk is a column that the generator drops and re-creates. In this proof the developer's answer to one prompt decided whether the page kept its Site and its constraints.
- **The generator is interactive.** Without a terminal, a rename makes `payload migrate:create` exit 13 and write nothing. With one, every renamed column asks "created or renamed", once per table: a page field asked twice (`pages` and `_pages_v`), and a relational block field four times. The answer is a schema decision, so it belongs to a developer at a terminal with the generated SQL in review, never to the release job.
- **In the `schema` form the constraints are part of the snapshot the generator diffs.** It wrote all of them into the baseline, rewrote the three that use a renamed column, and refused the change the data could not satisfy. That is stronger than the fallback, which only re-creates what a migration already removed, and only when the release job runs the file.

**Drafts need the same key.** A draft save writes only the versions table. With the key on `pages` alone, a later draft that moved a page to another tenant's Site was accepted. Only the published row kept the right Site. With `_pages_v_site_same_tenant_fk` added, the same update fails. The plan puts the key on "the base `pages` table" (6.3); it needs one on `_pages_v` too.

**How the database answers.** A unique violation on `(site, slug)` comes back from Payload as a validation error ("Value must be unique") with the field path. A foreign-key or check violation comes back from the Local API as a raw database error ("Failed query", code `23503` or `23514`), with no field path. Over REST this was not measured, but it cannot be a field error. The factory's validation hook must refuse a cross-tenant Site before the insert, and the database key stays the backstop.

**Payload's compound index names.** The `schema` variant declared the `(site, slug)` key with Payload's `indexes` option. Payload named it `site_slug_idx`, without the table name, and gave the versions table a non-unique `version_site_version_slug_idx`. A second collection with a compound index on the same field names would collide within `cms`. Unique keys should be declared through `afterSchemaInit` with their own names, as the other constraints were.

## 5. Proof 2: supplied IDs

With the target's settings (`idType: 'uuid'`, `allowIDOnCreate: true`, and the factory's hook). The service port is the server-only `req.context` flag. "Discarded" means the create succeeds under a new ID.

| Collection           | Service port (Local API) | Actor port (Local API) | REST (`POST /api/<collection>`) |
| -------------------- | ------------------------ | ---------------------- | ------------------------------- |
| `site-presentations` | Kept                     | Discarded              | Discarded (201)                 |
| `media`              | Kept                     | Discarded              | Discarded (201)                 |
| `pages`              | Discarded                | Discarded              | Discarded (201)                 |
| `principal-links`    | Kept (no hook)           | Not tried              | Not tried                       |

| Setting                                  | Result                                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `allowIDOnCreate: true` without the hook | Every supplied ID is kept on every path, pages and REST included. The hook is what discards                                               |
| `allowIDOnCreate: false`                 | Every supplied ID is dropped silently, service port included. The create succeeds under a new ID, so a provisioning step would not notice |
| A `PATCH` with another `id`              | 200; the ID is unchanged and no row exists under the other ID                                                                             |
| A supplied ID that is not a UUID         | Refused by Postgres (`22P02`), not by Payload's validation, so it arrives as a raw error                                                  |
| The same supplied ID twice               | The second create is refused: "Value must be unique" on `id`. A retried registration must read first, as proof 4's does                   |

The adapter generates the ID in Postgres (`gen_random_uuid()` as the column default; the insert sends `default`). `idType: 'uuidv7'` exists in the adapter and was not run.

## 6. Proof 3: JSON blocks, with relational blocks for comparison

**Round trip, JSON.** The page holds a hero block whose `image` is a relationship to `media`, a rich-text block with a relationship node to `media`, and a rich-text `body` with one too. The whole `layout` is one JSON column on `pages` and on `_pages_v`. At depth 0 each reference reads back as the media ID. At depth 1 the block's image and both rich-text nodes come back populated, with `alt`.

**One block schema change, both forms.** Old data is the page written before the change. It is read after the migration.

| Change to the hero block's field | JSON: generated migration | JSON: old data reads                                                               | Relational: generated migration                                | Relational: old data reads       |
| -------------------------------- | ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| Add `subheading`                 | Nothing                   | Without the field                                                                  | `ADD COLUMN` on `pages_blocks_hero` and `_pages_v_blocks_hero` | Without the field                |
| Rename `heading` to `title`      | Nothing                   | `heading` still holds the old value; `title` is empty; readers receive both shapes | Prompt; answered "rename": `RENAME COLUMN` on both tables      | `title` holds the old value      |
| Remove `subheading`              | Nothing                   | `subheading` still returned with its old value                                     | `DROP COLUMN` on both tables                                   | The field and its value are gone |

**Reference integrity.** A page referenced media record A from its block and media record B from its rich-text body. Both records were then deleted through the service port.

| Form       | Delete of a referenced media record | Block's image at depth 1 afterwards           | Rich-text node at depth 1 afterwards            |
| ---------- | ----------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| JSON       | Succeeds; no key exists             | The bare ID string, which looks unpopulated   | `value: null`                                   |
| Relational | Succeeds                            | `null`: Payload's key is `ON DELETE SET NULL` | `value: null` (rich text is JSON in both forms) |

The generated key on a relational block (`pages_blocks_hero_image_id_media_id_fk ... ON DELETE set null`) prevents a dangling ID. It does not prevent the delete, and it empties a block silently. In both forms the guards are the plan's delete check (the live-use predicate of 6.6) and the save hook.

**Cost in this configuration.** Four collections, one page collection with two block types:

| Measure                              | JSON                                                                                                                 | Relational                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Tables in `cms`                      | 22                                                                                                                   | 26 (two per block type: main and versions)            |
| Page create (statements, writes)     | 11, 5                                                                                                                | 15, 9                                                 |
| Draft save of a page with two blocks | 12 statements: one version row, one insert of two authorship rows, the `latest` flag update, and a no-op lock delete | 14 statements: the same and one insert per block type |

The target has many more block types, so the gap grows with them: two tables per block type and one insert per block type used on each save. The plan's "two-row write" per autosave holds for the version row only. Payload 4 also writes two authorship rows on every save (section 13.2).

**Decision 10, on this evidence.** JSON blocks pass the suite's round trip and survive a schema change without error. The price is that a block change is the developer's to migrate, and the reader's to tolerate. Relational blocks move that work into generated SQL and prompts, add tables and writes per block type, and protect nothing more. The baseline should take **JSON blocks**, with three conditions:

- every block field rename or removal ships with a JSON data migration;
- the release serializer and reader keep only the fields the shared block registry declares;
- the suite runs the round trip and the three changes on each upgrade.

## 7. Proof 4: a Core-issued upload, with Payload holding metadata only

Run on the slot-B stack. The bucket `wp6p-media` is private, with a 15 MB limit and JPEG, PNG or WebP only, and no Storage policy names it. The stack's existing policies on `storage.objects` belong to other buckets, and none admitted a read or a write on this one. The stand-in command and route hold the service key. The Payload child process holds only `cms_runtime`.

| Step                                                                                  | Result                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payload baseline on the stack as `cms_owner`; a Site presentation under a supplied ID | Migrated; ID kept                                                                                                                                                                                                                                                                                                                                                          |
| Upload command: custody row `uploading`, signed upload to `tmp/<tenant>/<asset id>`   | Issued; the browser gets a path and a one-object token                                                                                                                                                                                                                                                                                                                     |
| Upload with the anonymous client and the token                                        | Succeeds; the same token again is refused (409, "The resource already exists")                                                                                                                                                                                                                                                                                             |
| Limits                                                                                | The command refuses a declared 15 MB + 1 byte and a declared GIF. The bucket refuses 16 MB of bytes (413) and a GIF content type (415). GIF bytes labelled PNG pass the bucket and are refused at finalize. A 6000 × 5000 PNG of 407 KB passes the bucket and is refused at finalize (30 megapixels)                                                                       |
| Finalize                                                                              | The source is 800 × 600 with EXIF orientation 6, a GPS block and an ICC profile. The stored master is 600 × 800 with no EXIF, ICC, XMP or IPTC, and so is the variant, each re-read from Storage. Two encodes of the same bytes are identical. Keys are `<tenant>/<sha-256>` and `<tenant>/<sha-256>-w640`. The temporary object is removed and the custody row is `ready` |
| Registration, first attempt                                                           | Fails (Payload cannot connect)                                                                                                                                                                                                                                                                                                                                             |
| The whole command again                                                               | Finalize sees `ready` and writes nothing. Registration creates the Payload record under the custody ID. The two storage rows have the same IDs and creation times as before the retry                                                                                                                                                                                      |
| The command a third time                                                              | Registration finds the record and creates nothing                                                                                                                                                                                                                                                                                                                          |
| Picking the image                                                                     | The hero block's image field and a relationship node in a rich-text block and in the page body all hold the custody ID, and populate at depth 1                                                                                                                                                                                                                            |
| Lexical's upload node to the same record                                              | Refused on a published save ("This field has an invalid selection"). **Accepted on a draft save**, because Payload skips field validation on drafts by default                                                                                                                                                                                                             |
| Media route, master and variant                                                       | Anonymous 401; the anon key as a bearer 401; a signed-in user of no tenant 404; staff of another tenant 404; staff of the tenant 200 with `Cache-Control: private, no-cache` and an ETag of the content hash; the same request with `If-None-Match` 304                                                                                                                    |
| Direct Storage, as anonymous, as staff of the tenant and as a signed-in member        | Download "Object not found"; list empty; upload and overwrite 403 (row-level security); delete removes nothing; signed URL and signed upload URL refused. The public URL answers 400. The custody table answers "permission denied". Both objects are intact afterwards                                                                                                    |
| Delete                                                                                | The custody row is tombstoned and the route then answers 404. The Payload record is deleted through the service port, and the purge removes both objects. The page then holds the bare ID in its block, and `null` in its rich-text nodes                                                                                                                                  |

**Rich text and the plain collection.** Lexical's upload feature enables only collections that have Payload's `upload` config, and its relationship feature only collections that do not (`richtext-lexical/dist/features/relationship/shared/filterEnabledRelationshipCollections.js`). So the relationship node is how rich text references a plain media record. It stores the ID and populates like any relationship. The plan's fallback, a custom node that stores the custody ID, is not needed for storage. Whether the editor shows the picked image as an image or only as a document card was not checked in a browser (section 14).

**What this does not prove.** The route's caller check reads a stand-in table, not the Core resolver. The live-use predicate is not tested, because the media-use table belongs to WP7. The purge ran at once instead of after the recovery window. The images were small, so finalize's time and memory at 15 MB and 25 megapixels are not measured.

## 8. Proof 5: Payload's publish control

A staff member's `PATCH /api/pages/<id>` with `{"_status": "published"}` returns 200, and the page's row says `published`. The request sends 17 statements. Its seven writes all target `cms`: the lock table, `pages`, `pages_rels`, `_pages_v` and `_pages_v_rels`. No statement names another schema, and `cms_runtime` can read no table outside `cms`. Nothing public can follow, because the public read path never reads `cms` (6.6). The status still means nothing to the public, so Web Studio must not show it as "live" (6.6 already says so). WP6 should also refuse a status write that does not come from the publish action, so that the flag cannot mislead an editor.

## 9. Roles: who needed what

Every migration ran logged in as `cms_owner`, and every proof body as `cms_runtime`, with schema push off. Neither role needed a privilege it lacks today.

- `cms_owner` owns the schema and all 22 tables. It applied each generated migration and re-applied `constraints.sql`, staying within its connection limit of 2.
- `cms_runtime` holds no grant outside `cms`. With UUID IDs, Payload's ledger has no sequence, so the app's ledger migration's sequence revoke has nothing to act on. Its revoke of `INSERT`, `UPDATE` and `DELETE` on the ledger was carried into the proof's baseline and held.

On the local stack, `postgres` is not a superuser (`rolsuper` false, `rolcreaterole` true), as on a hosted project. Because it created the CMS roles, it is a member of both. That is how it can set their passwords, and how it can take either role with `SET ROLE`.

## 10. What WP6 should adopt

**Block storage: JSON.** Set `blocksAsJSON: true` (section 6). The cost is a JSON data migration for every block field rename or removal, a reader that drops undeclared fields, and the suite's block checks.

**IDs:**

- `idType: 'uuid'` and `allowIDOnCreate: true` on the adapter.
- In `tenantScoped()`, a `beforeOperation` hook that deletes `data.id` on create unless a server-only `req.context` flag marks the service port and the collection is `site-presentations` or `media`.
- `principal-links` keeps the login's UUID, through the service port.
- Registration and provisioning read before they create, because a second create under the same ID is refused.

**Constraints: in Payload's schema.** Declare the composite keys (on `pages` and on `_pages_v`), the unique `(id, tenant)` key, the checks and the unique `(site, slug)` key through `afterSchemaInit`, each with its own name. The generator then writes them into the baseline and every later migration. Keep one hand-written list of their names and definitions for the suite to check after every migration. If WP6 keeps them hand-written instead, the release job must re-apply the file after Payload's migrations, and the file must change in the same pull request as any rename of a column it uses.

**Collection settings that Payload 4 needs stated.** `versions: false` on every collection that needs no history (`site-presentations`, `media`, `principal-links`), because Payload 4 gives every collection a versions table by default. `versions.drafts.validate: true` on `pages`, or the tenant and reference checks in a `beforeChange` hook, because field validation does not run on a draft by default.

## 11. Where the plan's wording must change

1. **6.2, adapter settings.** Add `versions: false` on collections without drafts, and `versions.drafts.validate: true` (or hooks) on `pages`. Evidence: `payload/dist/collections/config/defaults.js:128` (`collection.versions ?? true`), `sanitize.js:249-272` (100 versions per document; `drafts.validate` false), and the upload node accepted only in a draft (section 7).
2. **6.2 and 6.5, principal links.** Payload 4 adds `createdBy` and `updatedBy` to every collection, by default, as relationships to the auth collections with a foreign key (`sanitize.js:103-136`, the `authorship` option). A save by an actor with no `principal-links` row fails with a foreign-key error. So the resolver step must ensure one row per login, under the login's UUID, through the service port. 6.5 says the strategy "builds a minimal actor"; it must also say who creates that row and when. Alternatively, `authorship: false` with the plan's own attribution.
3. **6.3, the composite key.** "On the base `pages` table" becomes "on `pages` and on its versions table `_pages_v`", because drafts write only the versions table (section 4). The same applies to navigation if it has drafts.
4. **6.3, factory validation.** A key or check violation leaves Payload as a raw database error with no field path, unlike a unique violation (section 4). The factory's hook refuses a cross-tenant reference first, and the key is the backstop.
5. **6.3, 6.7 and 11.4 (decision 5), relational blocks.** "Relational blocks keep only the single-column key to `cms.media` that Payload generates." That key is `ON DELETE SET NULL`: it never stops a delete, and it empties the block. Say so, or drop the sentence, because with JSON blocks it no longer applies.
6. **6.6, Reading.** The reader "parses the content against the shared block registry, drops unknown blocks". Add: "and keeps only the fields the registry declares for each block", because JSON blocks keep a renamed or removed field's old key (section 6).
7. **6.7, cost.** "Make each autosave a two-row write" becomes: one version row, two authorship rows and one update of the previous version's `latest` flag, measured on 4.0.0-beta.9. The 94-to-25 table estimate should be re-made with the settings in section 10: Payload 4's defaults give each collection a `_rels`, a `_v` and a `_v_rels` table.
8. **7.3 and 7.4, generated migrations.** The generator asks a question for each renamed column, and exits without writing when there is no terminal. Generation is a developer step whose answers are reviewed with the SQL, never a release-job step. Its output also imports `MigrateUpArgs` and `MigrateDownArgs` as values, which fails to run under the repository's TypeScript settings. The app's committed migrations use `import type` (`apps/admin/src/migrations/20261117_082928_cms_runtime_ledger_read_only.ts:1-3`), so WP6 needs that rewrite as a step.
9. **15.2 and 11.4, decision 5's fallback.** "The constraints live in a hand-written migration that the release job re-applies" works but is not the best form. Declare them in the adapter's schema (section 10). The suite checks the catalog after every migration in either form.
10. **15.2, the media row's fallback.** "A custom rich-text image node that stores the custody ID" is not needed to store a reference: Lexical's relationship node stores it (section 7). Whether editors need a custom node to see the picture remains open.
11. **7.2 and section 13, tests on a shared cluster.** See 13.1.

## 12. What the qualification suite needs

Each of these runs on a Postgres of the suite's own (13.1), on every Payload bump:

- **Constraints after every migration.** After the baseline and after a generated change, the catalog holds every listed constraint by name and definition, on `pages` and `_pages_v`. A cross-tenant Site is refused on create and on a later draft.
- **Supplied IDs.** The table of section 5: kept through the service port for Site presentations and media; discarded through the actor port and REST; discarded on every page create; unchanged by an update.
- **Draft validation.** An invalid reference is refused in a draft save as well as a published one.
- **Defaults.** Collections declared without versions have no `_v` table. The authorship columns write to `principal_links` as expected.
- **JSON blocks.** The round trip with a media reference at depth 0 and 1. Old data after a block field is added, renamed and removed. The generated migration for a block change is empty, which is the trigger for a data migration. A deleted media record leaves the ID the reader must handle.
- **Rich text.** The upload node to `media` is refused, and the relationship node is accepted.
- **Status write.** A REST status write touches only `cms`, as in section 8.
- **Generated code.** A generated migration runs under the repository's TypeScript settings after the import rewrite.

## 13. Other findings

### 13.1 The CMS roles are shared state on a shared cluster

Roles, their passwords and their memberships belong to the whole Postgres cluster, not to one database. While this proof ran on the shared test server, it first set the passwords of `cms_owner` and `cms_runtime` for each run. During one run they were cleared under it, most likely by another session's test, which sets and clears the same passwords. In the other direction, a run of `cms-database-roles.realstack.test.ts` failed with "password authentication failed for user cms_runtime" while this proof was resetting them. The proof then created two login roles that were members of the CMS roles. The role migration refuses to apply while either role has a member other than the migration runner, so for as long as those roles existed, every application of the chain to a new database on that cluster failed, and so did `tests/unit/cms/cms-database-roles.realstack.test.ts`. Both roles are gone. The cluster's membership query returns only `cms_owner | postgres`, and neither role has a password.

So a second login role that is a member of a CMS role is a release-blocking mistake on any shared cluster, and so is a password change on either role. The suite (`scripts/cms/qualify-payload-pin.mjs:240-243`) and the role test set those passwords on whatever server they target. WP6's tests get a `cms_runtime` connection in one of two ways:

- **On a Postgres of their own** (a container per run, or the local stack): log in as `cms_runtime` with a password set for the run. Only this tests the login itself and its connection limit. This proof did that for every result above.
- **On a shared cluster:** log in as the migration runner with the startup option `-c role=cms_runtime`, which `scripts/cms/lib/migration-connection.mjs:87-96` already does for `cms_owner` on loopback. It creates no role, grants no membership and changes no password. `current_user` is `cms_runtime`, so every privilege check is the real one. A superuser may take any role. On a Supabase stack, `postgres` is already a member of both (section 9). It does not test the password login or the connection limit, and the session could reset its role, so the test should assert that the statement log holds no `SET ROLE` or `RESET ROLE`. This way was not run here.

### 13.2 Other things WP6 should know

- `pages_rels_principal_links_fk` is `ON DELETE CASCADE`. Deleting a principal link silently removes the authorship rows of every document it touched.
- Payload's own key for the required `site` relationship is `ON DELETE SET NULL`. Only the composite key (`RESTRICT`) stops a Site presentation from being deleted under its pages.
- A page created with `draft: true` still writes the main `pages` row once. After that, drafts write only `_pages_v`.

## 14. Not measured, and what a hosted project would add

- **Web Studio in a browser.** How the relationship picker and the Lexical relationship node show a media record (an image or a document card), and whether an `upload` field can point at a plain collection in the admin. Payload's configuration check does not refuse such a field; it was not tried.
- `idType: 'uuidv7'`.
- **Finalize at the admitted limits.** Time and memory at 15 MB and 25 megapixels, and the media route on Vercel's function limits (15.2 has its own row). The images here were small.
- **Concurrency.** Two finalize calls at once rely on the `WHERE status = 'uploading'` compare-and-set and were not run together.
- **Out of scope here.** The live-use predicate, the real Core resolver behind the route, the delayed purge, Payload's REST routes under `/web-studio/api`, and pooling modes.
- **What a hosted project would add.** Storage behaviour behind Supabase's CDN: signed upload lifetime, the 304 path through the platform, and the size limit on the hosted bucket. The pooler with the CMS logins. `postgres` without superuser on a hosted database, which the local stack only imitates. Real network latency on the route.

## 15. How to repeat

From a WSL shell with Node 24.22.3, `psql` and Docker, in a clone at `639c9d8a4`:

```sh
# 1. The prototype.
git apply wp6-proofs-prototype.patch && bun install --frozen-lockfile

# 2. Proofs 1, 2, 3 and 5, on a Postgres of your own.
docker run -d --name wp6p-pg -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:26399:5432 postgres:17-alpine
export WP6P_ADMIN_URL=postgresql://postgres:postgres@127.0.0.1:26399/postgres
node scripts/proofs/wp6/run-proofs.mjs --variant=json-hand --stage4=rename --ids --status --out=/tmp/wp6p/json-hand-rename
node scripts/proofs/wp6/run-proofs.mjs --variant=json-hand --stage4=create --out=/tmp/wp6p/json-hand-create
node scripts/proofs/wp6/run-proofs.mjs --variant=json-schema --stage4=rename --out=/tmp/wp6p/json-schema-rename
node scripts/proofs/wp6/run-proofs.mjs --variant=json-schema --stage4=create --out=/tmp/wp6p/json-schema-create
node scripts/proofs/wp6/run-proofs.mjs --variant=relational-hand --stage4=rename --out=/tmp/wp6p/relational-hand-rename
node scripts/proofs/wp6/run-proofs.mjs --variant=relational-schema --stage4=rename --out=/tmp/wp6p/relational-schema-rename

# 3. Proof 4, on a slot-B stack from a scratch copy (every 543xx port to 263xx).
mkdir -p ~/wp6p-slot-b && cp -r supabase ~/wp6p-slot-b/
sed -i -E '0,/^project_id = ".*"/s//project_id = "wp6p-slot-b"/; s/\b5432([0-9])\b/2632\1/g; s/^inspector_port = 8083$/inspector_port = 26383/' ~/wp6p-slot-b/supabase/config.toml
bun run supabase -- start --workdir ~/wp6p-slot-b -x studio,edge-runtime,logflare,vector,imgproxy,postgres-meta,supavisor,realtime,mailpit
eval "$(bun run supabase -- status --workdir ~/wp6p-slot-b -o env | grep -E '^(ANON_KEY|SERVICE_ROLE_KEY|API_URL|DB_URL)=' \
  | sed -E 's/^SERVICE_ROLE_KEY=/export WP6P_SERVICE_KEY=/; s/^ANON_KEY=/export WP6P_ANON_KEY=/; s/^API_URL=/export WP6P_API_URL=/; s/^DB_URL=/export WP6P_DB_URL=/')"
psql "$WP6P_DB_URL" -v ON_ERROR_STOP=1 -f scripts/proofs/wp6/media/media-custody.sql
WP6P_OUT_DIR=/tmp/wp6p/media node scripts/proofs/wp6/media/media-proof.mjs --migrations=/tmp/wp6p/json-hand-rename/migrations

# 4. Clean up.
bun run supabase -- stop --workdir ~/wp6p-slot-b --no-backup && rm -rf ~/wp6p-slot-b
docker rm -f -v wp6p-pg
```

Each run writes `results-<variant>.json` and `run.log`, and copies its generated migrations into `--out`. The harness refuses the shared test server's port, because it sets the CMS roles' passwords.

## 16. Checks run

| Check                                                                                                                                                                  | Result                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Supabase chain from empty, six databases on `wp6p-pg`                                                                                                                  | Passed each time                                                                                                         |
| Baseline and four generated migrations as `cms_owner`, six runs                                                                                                        | Passed, except `json-schema` answered "create" at change 4, which failed as section 4 says                               |
| Hand-written constraints present after each migration (`hand`, answered "rename")                                                                                      | 8 of 8 after every change                                                                                                |
| The same, answered "create"                                                                                                                                            | 4 of 8 after change 4                                                                                                    |
| Re-apply of `constraints.sql` as `cms_owner`                                                                                                                           | Passed after the baseline and changes 1 to 3; failed after change 4 (exit 3)                                             |
| Seed checks as `cms_runtime`: two cross-tenant creates, a duplicate slug, a draft without a Site, SQL cross-tenant and bad-tenant inserts, a cross-tenant draft update | All seven refused in all six runs                                                                                        |
| Supplied-ID matrix under three settings                                                                                                                                | As section 5                                                                                                             |
| JSON round trip at depth 0 and 1; reads after add, rename and remove; JSON and relational                                                                              | As section 6                                                                                                             |
| Deleting referenced media, JSON and relational                                                                                                                         | As section 6                                                                                                             |
| Status write as staff over REST                                                                                                                                        | 200; seven writes, all in `cms`; nothing outside it                                                                      |
| Proof 4 on the slot-B stack, twice                                                                                                                                     | Every step as section 7, both runs                                                                                       |
| Upload node in rich text, draft and published, one run                                                                                                                 | Accepted in a draft; refused when published                                                                              |
| Stack's `postgres` attributes and CMS role memberships                                                                                                                 | Not a superuser; a member of both CMS roles                                                                              |
| Shared cluster after the incident                                                                                                                                      | Membership query returns only `cms_owner \| postgres`; neither CMS role has a password; no `wp6p_` role or database left |
| Slot-B stack and `wp6p-pg` after the proof                                                                                                                             | Stopped with `--no-backup`; 0 containers, 0 volumes, 0 networks left                                                     |
