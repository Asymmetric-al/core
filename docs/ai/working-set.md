# Working Set

- Date: 2026-03-06
- Repo: Asymmetric-al/core

## Current Goal (single source of truth)

Review PR `#71` as documentation automation and correct docs that drifted from the merged Site Studio, authz, and CI implementation.

## Current Scope

- `README.md`
- `docs/ci.md`
- `docs/guides/features/teams-and-permissions.md`
- `.github/workflows/ci.yml`
- `.github/workflows/ci-integration.yml`
- `apps/admin/app/system-admin/page.tsx`
- `apps/admin/app/system-admin/teams/page.tsx`
- `apps/admin/app/admin/teams/teams-sections.tsx`
- `apps/admin/app/web-studio/page.tsx`
- `packages/auth/permissions.ts`

## Constraints

- Do not fabricate workflow behavior; only document what current YAML and code enforce.
- Keep doc changes focused on recently changed subsystems with active drift.
- Prefer updating existing docs instead of adding new pages.
- Keep stakeholder-facing language clear without removing technical precision.

## Open Decisions

- Which stale developer guides outside this PR should be modernized next (`getting-started`, architecture overviews, UI inventories)?

## Recent Completed Streams (summary only)

- 2026-02-26: Authz membership/RLS foundation landed (`authz.memberships`, role helpers, middleware/context integration, docs).
- 2026-02-23: Site Studio/Payload integration and quality gates expanded across CI + docs + tests.

## Evidence Sources Used

- `README.md`
- `docs/ci.md`
- `docs/guides/features/teams-and-permissions.md`
- `.github/workflows/ci.yml`
- `.github/workflows/ci-integration.yml`
- `apps/admin/app/system-admin/page.tsx`
- `apps/admin/app/system-admin/teams/page.tsx`
- `apps/admin/app/admin/teams/teams-sections.tsx`
- `apps/admin/app/web-studio/page.tsx`
- `packages/auth/permissions.ts`

## Tooling Note

- MCP resources are unavailable in this runtime; used repo-scoped `rg`, direct file reads, and targeted command verification.
