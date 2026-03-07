# Working Set

- Date: 2026-03-07
- Repo: Asymmetric-al/core

## Current Goal (single source of truth)

Fix the high-signal API and auth boundary regressions identified in PR `#71` so the branch is safe to build and merge:

1. Restore anonymous access to the new public CMS Route Handlers.
2. Stop public signup from minting privileged authz state from caller-supplied role metadata.
3. Make tenant deactivation actually gate the public CMS API.
4. Tighten the donor/admin CMS contract, cache invalidation story, tests, and docs so future agents can extend the work safely.

## Current Scope

- `apps/admin/proxy.ts`
- `packages/auth/middleware.ts`
- `packages/auth/context.ts`
- `packages/auth/permissions.ts`
- `apps/admin/app/api/cms/public/navigation/route.ts`
- `apps/admin/app/api/cms/public/pages/[...slug]/route.ts`
- `apps/admin/app/api/cms/public/updates/route.ts`
- `apps/admin/src/cms/public/resolve-tenant.ts`
- `apps/admin/src/cms/hooks/audit.ts`
- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/collections/navigation.ts`
- `apps/admin/src/cms/collections/tenants.ts`
- `apps/donor/lib/cms/client.ts`
- `apps/donor/app/(public)/[...cmsSlug]/page.tsx`
- `apps/donor/app/(public)/page.tsx`
- `apps/admin/app/register/page.tsx`
- `apps/donor/app/(auth)/register/page.tsx`
- `apps/missionary/app/register/page.tsx`
- `supabase/migrations/20260226113000_authz_memberships_foundation.sql`
- Targeted tests/docs that cover the above behavior

## Constraints

- Keep the fixes surgical; do not refactor unrelated auth or CMS flows.
- Follow current Next.js 16 Proxy, Route Handler, and cache invalidation guidance from local docs.
- Preserve public CMS behavior for anonymous donor-side SSR reads.
- Privileged roles (`staff`, `admin`, `super_admin`) must not be assignable from public signup input.
- Keep docs and tests aligned with final behavior so future agents can pick up safely.

## Open Decisions

- Whether public signup should expose a role chooser at all, or default to a single safe self-service role with role upgrades handled elsewhere.
- Whether the donor CMS consumer should remain an internal HTTP hop for now or move to a shared server-only data access layer in a follow-up.

## Recent Completed Streams (summary only)

- 2026-03-07: API review identified public CMS proxy gating, signup role trust, and tenant activation gaps in PR `#71`.
- 2026-02-26: Authz membership/RLS foundation landed (`authz.memberships`, role helpers, middleware/context integration, docs).
- 2026-02-23: Site Studio/Payload integration and quality gates expanded across CI + docs + tests.

## Evidence Sources Used

- `apps/admin/proxy.ts`
- `packages/auth/middleware.ts`
- `packages/auth/context.ts`
- `packages/auth/permissions.ts`
- `apps/admin/app/api/cms/public/navigation/route.ts`
- `apps/admin/app/api/cms/public/pages/[...slug]/route.ts`
- `apps/admin/app/api/cms/public/updates/route.ts`
- `apps/admin/src/cms/public/resolve-tenant.ts`
- `apps/admin/src/cms/collections/tenants.ts`
- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/collections/navigation.ts`
- `apps/admin/src/cms/hooks/audit.ts`
- `apps/donor/lib/cms/client.ts`
- `apps/donor/app/(public)/[...cmsSlug]/page.tsx`
- `apps/donor/app/(public)/page.tsx`
- `apps/admin/app/register/page.tsx`
- `apps/donor/app/(auth)/register/page.tsx`
- `apps/missionary/app/register/page.tsx`
- `supabase/migrations/20260226113000_authz_memberships_foundation.sql`
- `.next-docs/01-app/03-api-reference/03-file-conventions/proxy.mdx`
- `.next-docs/01-app/01-getting-started/08-updating-data.mdx`

## Tooling Note

- Nia MCP is available for this stream. Use repo-scoped searches against `Asymmetric-al/core` plus Payload repo/docs sources, with the required preamble built from this file and `docs/ai/stack-registry.md`.
