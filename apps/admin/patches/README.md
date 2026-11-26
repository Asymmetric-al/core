# Payload Drizzle UUID compatibility patch

`@payloadcms/drizzle@4.0.0-beta.9` checks an id against the `uuid` package's
`validate`, which accepts only RFC 4122 UUIDs (version 1 to 8 and the RFC
variant). PostgreSQL's `uuid` type accepts any canonical 128-bit hexadecimal
value, and Core's own ids include values that are not RFC 4122: the seed's
Sites and demo logins, and the fixture media ids derived from them. Unpatched,
Payload rewrites a query on such an id instead of running it: `equals` becomes
`IS NULL`, `not_equals` becomes `IS NOT NULL`, a polymorphic `in` becomes
`WHERE false` and a polymorphic `not_in` becomes `WHERE true`. A read finds
nothing, and a bulk delete can pass a lock it should have met.

The root `patchedDependencies` entry applies the patch during Bun installation,
including frozen lockfile installs. No application runtime monkeypatch is
required.

## Scope

- `dist/queries/sanitizeQueryValue.js:3` and
  `dist/queries/getTableColumnFromPath.js:5`: the `uuid` package's `validate`
  import is replaced by a local check that a value is a string matching
  `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`,
  case-insensitive. These are the only two places the package validates a
  query value as a UUID.

Nothing else changes. A value that is not a canonical hexadecimal UUID is still
refused as before; the patch admits no id PostgreSQL itself would reject.

## Provenance

- Package: `@payloadcms/drizzle@4.0.0-beta.9`, registry integrity
  `sha512-djEa9hHghKjly82ZSuuuoDfs3AZptAoMIMKPYcIZ8O4ZgdfSYHCdJCyKBB40o/IFsJpzm3ev7Cryh4P6s2aTFw==`
  (`bun.lock`).
- Upstream: `payloadcms/payload#16483`.
- Made with `bun patch` and committed with
  `bun patch --commit --patches-dir apps/admin/patches`.

## Validation

- `tests/unit/cms/payload-drizzle-uuid-patch.test.ts` exercises the installed
  package's two functions with non-RFC canonical UUIDs and with values that are
  not UUIDs. It fails on the unpatched package.
- `tests/unit/acceptance/issue-2679/cms-clean-baseline.realstack.acceptance.test.ts`
  works on real rows under non-RFC ids: a seed login is linked twice and reads
  its own row (`equals`), a seed Site's presentation carries a page and a menu
  item and `not_equals` excludes it, and a bulk delete meets the lock on a
  media record (a polymorphic `not_in`).
- `bun run cms:qualify` repeats the same checks against a migrated database.

## Removal

Remove the patch, its `patchedDependencies` entry and this file only after an
unpatched Payload release passes
`tests/unit/cms/payload-drizzle-uuid-patch.test.ts` and `bun run cms:qualify`.
A Payload upgrade that changes either file makes `bun install` fail to apply
the patch; re-make it against the new version or confirm the upstream fix and
remove it.
