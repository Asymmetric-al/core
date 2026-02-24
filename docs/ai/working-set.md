# Working Set

- Date: 2026-02-23
- Repo: Asymmetric-al/core
- Goal: Ship TanStack Virtual foundation + per-app pilots (admin, donor, missionary) with backward-compatible shared API and updated docs/tests.
- Primary area: `packages/ui/components/shadcn/data-table/*`, `packages/ui/components/shadcn/data-grid/*`, `apps/admin/app/crm/page.tsx`, `apps/donor/app/(dashboard)/donor-dashboard/history/page.tsx`, `apps/missionary/app/donors/page.tsx`, `docs/guides/development/tanstack-*.md`
- Constraints:
  - Keep virtualization changes backward-compatible (`virtualization` config + legacy field mapping).
  - Preserve existing UX states (loading/empty/error/filter/selection) while virtualizing long lists.
  - Keep Query/Table/DB data responsibilities separate from virtualization/rendering concerns.
  - Follow Next.js 16 Cache Components constraints for server-side caching boundaries.
  - No secrets in code/docs.
- Evidence sources used:
  - Local source-of-truth in `packages/ui` and app pilot pages
  - TanStack MCP docs (`table`, `query`, `db`, `virtual`) for API-level guidance
  - `.next-docs` cache-components docs for Next.js 16 compatibility
- Tooling note:
  - Nia repo/tooling is not available in this session registry; local repo evidence + TanStack MCP docs are used.
