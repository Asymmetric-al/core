# Payload vendor + upgrade workflow

This repository uses two complementary mechanisms for Payload CMS maintenance:

1. **Registry dependencies** in `apps/admin/package.json` for runtime (`payload`, `@payloadcms/next`, etc.)
2. **Vendored upstream mirror** in `vendor/payload-upstream` for auditability and upgrade planning

The vendored mirror is **not** imported by application code.

## Why we keep the mirror

- Review upstream changes with local context before dependency upgrades
- Keep a stable reference for security audits and debugging
- Support long-lived upgrade planning without forking Payload runtime code

## Initial setup

```bash
git remote add payload-upstream https://github.com/payloadcms/payload.git
git fetch payload-upstream --tags
git subtree add --prefix=vendor/payload-upstream payload-upstream v3.77.0 --squash
```

## Updating the mirror

```bash
git fetch payload-upstream --tags
git subtree pull --prefix=vendor/payload-upstream payload-upstream <new-tag> --squash
```

Example:

```bash
git subtree pull --prefix=vendor/payload-upstream payload-upstream v3.78.0 --squash
```

## Runtime dependency upgrade workflow

1. Update runtime dependencies in `apps/admin`:
   - `payload`
   - `@payloadcms/next`
   - `@payloadcms/db-postgres`
   - `@payloadcms/richtext-lexical`
2. Update subtree mirror to the same tag.
3. Run scoped checks:
   - `bun run typecheck:admin`
   - `bunx turbo run lint --filter=@asym/admin`
   - relevant CMS unit/e2e suites
4. Validate CMS admin boot + public publish path manually.

## Import map regeneration

When admin component overrides, Payload admin views, editor features, or plugins
with admin client components change, regenerate Payload import mappings:

```bash
bun run cms:importmap
```

The command:

1. runs `payload generate:importmap`
2. post-processes and formats the generated output to keep lint/type compatibility stable

Generated file location:

- `apps/admin/app/(payload)/web-studio/importMap.js`

Production guardrail: a stale import map can boot the route but leave
`/web-studio` blank if a plugin-provided client component is missing. The
`@payloadcms/storage-vercel-blob` upload handler is covered by
`tests/unit/cms/payload-import-map.test.ts`.

## CI migration order

`ci-integration.yml` enforces this order on fresh Postgres:

1. Supabase SQL migrations (`supabase/migrations/*.sql`)
2. Payload migrations (`bun run cms:migrate`)
3. Payload migration status check (`bun run cms:migrate:status`)
4. Seed application data (`supabase/seed.sql`)

## Local patch policy (Bun patch)

Avoid editing `node_modules` directly. If a temporary upstream patch is required:

```bash
bun patch <package-name>
# edit extracted package
bun patch --commit <path-to-patch-folder>
```

Then commit:

- generated patch files under `patches/`
- `patchedDependencies` updates in `package.json`

Remove temporary patches as soon as upstream publishes a fix.

## Guardrails

- `vendor/payload-upstream` is excluded from formatting/indexing automation.
- Keep subtree updates as dedicated commits for clean review history.
- Do not import source files from `vendor/payload-upstream` in production code.
