---
name: payload
description: Develop and migrate Core's Payload CMS configuration, collections, access rules, hooks, admin integration, media, and Local API against its installed public v4 release.
---

# Payload application development in Core

Read `apps/admin/AGENTS.md`, `apps/admin/payload.config.ts`, and the affected CMS source before editing. OpenSpec and `docs/ai/rules/backend.md` own durable behavior. Supabase schema, RLS, and Auth follow the Supabase skill and `supabase/AGENTS.md`; business data remains behind `docs/guides/architecture/data-access-boundary.md`. Admin UI follows Core's Base UI, exact `base-maia`, semantic tokens, and shared component ownership.

Use the versions in `apps/admin/package.json` and the installed public exports. Read [Core's public-v4 compatibility reference](reference/PUBLIC-V4.md) for request creation, access defaults, media, generated types, and tokens. The official versioned migration guide and installed source resolve API questions. The vendored `vendor/payload-upstream` examples and removed generic v3 skill examples are historical sources, not current API authority. [Provenance and refresh](references/upstream.md) records the reviewed source and Core adaptations.

## Implementation workflow

1. Identify the owning collection, access function, hook, serializer, or admin adapter. Preserve its tenant, publication, draft, public-route, and document contracts.
2. Use the public API for the installed release. Preserve authenticated `req` through nested calls and transactions. User operations enforce access; privileged maintenance calls explicitly justify `overrideAccess: true`.
3. Preserve collection-specific versions and authorship settings. Core currently disables the shared instruction-management feature. Enabling a new feature or relationship requires its own domain and migration qualification.
4. Write a behavioral regression test at the affected seam. Use a disposable representative database for schema changes; compare records, relationships, assets, and rollback boundaries.
5. Generate import maps through `bun run cms:importmap`. Generate types through `node scripts/cms/run-payload-command.mjs generate:types`, then typecheck with those types present. Do not edit generated files or cast away a compatibility mismatch.
6. Use the committed CMS migration runner and the Web Studio runbook at `docs/guides/development/web-studio-runbook.md`. Verify the actual target, backup, preservation checks, migration order, and rollback boundary before an authorized application. Schema push is disabled in this workflow.
7. Run focused CMS tests, typecheck, and the relevant compiled/browser flows. Generated artifacts, runtime behavior, provider authentication, and deployment qualification are separate evidence.

For migration from another CMS, use [cms-migration](../cms-migration/SKILL.md). For the delivered public-v4 migration and its qualification limits, read `docs/maintenance/modernization/payload.md`.
