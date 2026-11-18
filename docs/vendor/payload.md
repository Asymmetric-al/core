# Payload source provenance and upgrade workflow

Runtime packages come from the exact official public cohort in
`apps/admin/package.json`, resolved by `bun.lock`. Core currently selects public
`4.0.0-beta.9`; this prerelease is qualified through the
[modernization checkpoint](../maintenance/modernization/payload.md) and
`bun run cms:qualify`.

## Retired upstream copy

`vendor/payload-upstream`, a copy of Payload 3.77.0, was removed in AL-2674
(WP1 of the CRM, CMS and database plan; audit finding NA-05): read for v4
behaviour it gave wrong answers. No first-party code, script or test used it.
Git history keeps the snapshot, so dated research citations of its paths
resolve at their own commits; read them as v3 evidence. The earlier
[retirement provenance](../maintenance/modernization/payload-vendor-provenance.json)
of its `examples/` tree stays as a dated record.

Do not restore or subtree-pull it. Current API guidance comes from the installed
public exports, the [versioned migration guide](https://github.com/payloadcms/payload/blob/v4.0.0-beta.9/docs/migration-guide/v4.mdx)
and Core's `docs/ai/skills/payload/reference/PUBLIC-V4.md`.

## Runtime upgrade workflow

Upgrade `payload`, `@payloadcms/db-postgres`, `@payloadcms/email-resend`,
`@payloadcms/next`, `@payloadcms/richtext-lexical`,
`@payloadcms/storage-vercel-blob`, `@payloadcms/transformer-sharp` and
`@payloadcms/ui` as one coherent cohort. Inspect upstream advisories, engines,
peers, maintained compatibility dependencies and migration instructions. Freeze
exact tested versions and record source/artifact hashes.

Use committed migrations through `scripts/cms/run-payload-command.mjs`. Fresh
integration order is Supabase SQL migrations, Payload migrations, migration
status verification, then application seed. Existing databases use the
[operations runbook](../guides/development/web-studio-runbook.md), preservation
checks and guarded rollback boundary. Do not use schema push or reset hosted data.

Regenerate types through the runner and import maps with `bun run cms:importmap`.
The import-map command post-processes generated output for lint/type consistency.
The Blob client handler remains declared without a fake provider token; storage
stays disabled without its real runtime token. Verify deterministic generation,
types present during typecheck, CMS/API contracts, tenant denials, media, editor,
all app builds, clean installation and actual deployed previews.

Core's public adapters and canonical skills own repository-specific behavior.
Refresh the versioned guidance and its provenance, then run `bun run skills:sync`
and `bun run skills:verify`. An upstream patch, if unavoidable, must be a reviewed
Bun patch with an owner, exact source and removal condition; do not edit installed
packages in place or force unrelated GraphQL major versions together.
