# Payload source provenance and upgrade workflow

Runtime packages come from the exact official public cohort in
`apps/admin/package.json`, resolved by `bun.lock`. Core currently selects public
`4.0.0-beta.3`; this prerelease is qualified through the
[modernization checkpoint](../maintenance/modernization/payload.md).

## Frozen historical reference subset

`vendor/payload-upstream` is a non-runnable historical upstream reference. It is
not imported by first-party application code and does not describe the installed
v4 APIs. The obsolete `examples/` tree (812 tracked files, including 17 manifests)
was removed after checking first-party consumers. The retained upstream
`create-payload-app` reference still names local examples/templates; it must not
be executed as an installation source.

The [retirement provenance](../maintenance/modernization/payload-vendor-provenance.json)
records the previous Core commit, immutable vendor/example Git trees, every
removed path/blob/content hash, and retained license notice. Git history preserves
the full snapshot. Retained docs/packages and localization fixtures continue to
support dated research citations. The opaque `payload.db` is outside this
retirement: preserve it without reading, materializing, copying or modifying it.

Do not subtree-pull this partial reference or install its example dependencies.
That would reintroduce retired software. If a retained research citation needs a
new upstream version, select an exact official source commit, preserve its
license and provenance, update the citation explicitly and review a bounded
reference refresh. Current API guidance comes from the installed public exports,
the [versioned migration guide](https://github.com/payloadcms/payload/blob/v4.0.0-beta.3/docs/migration-guide/v4.mdx)
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
