# Twenty CRM Integration Implementation Inventory

## Snapshot

- Date: 2026-05-07
- Repo: `Asymmetric-al/core`
- Branch inspected: local `epic`
- Method: direct repo reads and `rg`; Nia was not available in this session.
- Scope: inventory only. The phase plan is not changed based on this status.

## Already Implemented

### Monorepo and application foundation

- Bun and Turborepo are already the repo baseline.
- The repo already has separate Next.js apps for admin, donor, and missionary surfaces.
- Standard scripts exist for lint, typecheck, build, unit tests, E2E tests, data boundary verification, and workspace contract verification.

Evidence:

- `package.json`
- `apps/admin/package.json`
- `apps/donor/package.json`
- `apps/missionary/package.json`

### OpenSpec and platform boundaries

- OpenSpec project context exists.
- Platform intent, surfaces, principles, and boundaries specs exist.
- Current specs already treat Mission Control as the staff operations surface.
- Current specs already distinguish CRM operational truth from CMS public truth.
- Current specs already require server-side boundaries for sensitive operations.

Evidence:

- `openspec/project.md`
- `openspec/specs/platform-product-intent/spec.md`
- `openspec/specs/platform-surfaces/spec.md`
- `openspec/specs/platform-principles/spec.md`
- `openspec/specs/platform-boundaries/spec.md`

### Data access boundary

- The repo already requires business data access to live in `packages/api/src/*`.
- App API routes are expected to stay thin.
- The existing admin CRM route follows the thin re-export pattern.
- `verify:data-boundary` exists.

Evidence:

- `docs/guides/architecture/data-access-boundary.md`
- `scripts/verify/data-boundary-check.mjs`
- `apps/admin/app/api/admin/crm/records/route.ts`
- `packages/api/src/admin/crm/index.ts`

### Current CRM surface

- A native Mission Control CRM page already exists at `apps/admin/app/crm`.
- A current admin CRM API exists under `packages/api/src/admin/crm`.
- The current CRM list reads Supabase `donors` records and maps them to a shared CRM grid row.
- The CRM UI already uses shared table patterns and admin hooks.

Evidence:

- `apps/admin/app/crm/page.tsx`
- `apps/admin/app/crm/page-client.tsx`
- `apps/admin/app/crm/columns.tsx`
- `packages/api/src/admin/crm/index.ts`
- `packages/api/src/admin/crm/service.ts`
- `packages/api/src/admin/crm/model.ts`
- `packages/database/hooks/admin-crm-infinite.ts`
- `packages/database/types/crm-grid.ts`

### Existing operational data in Supabase

- The database schema already includes tenants, profiles, missionaries, donors, funds, donations, follows, donor activities, donor pledges, campaigns, notification queue, and pledge charge attempts.
- These tables can become source data for mapping/import work.

Evidence:

- `supabase/migrations/20250101000000_init_schema.sql`
- `supabase/migrations/20260214090000_foundation_1_schema.sql`
- `packages/database/types/database.ts`
- `packages/database/collections/client-db.ts`

### TanStack and UI foundations

- The repo already documents TanStack Query, Table, DB, and Virtual standards.
- Shared `DataTableResponsive` and virtualization support already exist.
- The current CRM UI is already using these shared UI foundations.

Evidence:

- `docs/guides/development/tanstack-integration.md`
- `packages/ui/components/shadcn/data-table/*`
- `packages/database/hooks/admin-crm-infinite.ts`
- `apps/admin/app/crm/page-client.tsx`

### Planned/reference awareness of Twenty

- The stack registry already lists Twenty CRM as planned/referenced.
- Mission Control tile copy references a fork of Twenty CRM.
- MCP example docs include a commented Twenty MCP example.

Evidence:

- `docs/ai/stack-registry.md`
- `packages/config/tiles.ts`
- `packages/lib/mission-control/tiles.ts`
- `docs/mcp-config.example.toml`
- `docs/guides/development/mcp-config.example.toml`

## Not Implemented Yet

### OpenSpec integration change

- No `openspec/changes/integrate-twenty-crm-core` package exists.
- No Twenty-specific ownership matrix exists.
- No accepted durable spec delta names Twenty as the backing CRM subsystem.

### Twenty runtime and infrastructure

- No Twenty server, worker, Redis, storage, or deployment topology exists in the repo.
- No Twenty Docker or service configuration exists for this app.
- No Supabase Postgres versus dedicated Postgres proof exists.
- No Twenty backup, restore, upgrade, or health runbook exists.

### Twenty environment contract

- Server env schema entries now exist for `TWENTY_API_URL`, `TWENTY_API_KEY`, `TWENTY_WEBHOOK_SECRET`, `TWENTY_WORKSPACE_ID`, `TWENTY_RATE_LIMIT_RPM`, and the CRM sync flags in `packages/env/src/schema.ts`.
- `.env.example`, `packages/env/README.md`, and `docs/env-var-audit.md` document the Twenty server-only env contract.

### CRM gateway root subsystem

- The root `packages/api/src/crm/*` subsystem now exists.
- The Twenty Core API client now exists for gateway/sync use.
- No Twenty Metadata API client exists.
- Twenty auth, rate limit, pagination, batching, and error mapping helpers now exist for the implemented Core API paths.
- The existing `packages/api/src/admin/crm/*` code is admin-specific and Supabase-backed.

### Supabase Auth to CRM authorization bridge

- Existing admin CRM code uses staff/admin role checks.
- No generalized `requireCrmAccess` bridge exists with actor context, CRM action, resource type, tenant resolver, and audit subject.

### Command logging and audit trail

- No CRM command log table exists.
- No CRM sync log table exists.
- No command-level audit helper exists for Twenty writes.

### Link, merge, projection, and queue tables

- No `crm_record_links` table exists.
- No `crm_merge_candidates` table exists.
- No `crm_projection_state` table exists.
- No `crm_outbound_jobs` table exists.
- No durable inbound Twenty webhook event table exists.

### Twenty schema management

- No Twenty schema bootstrap exists.
- No Metadata API schema setup script exists.
- No isolated Twenty app manifest package exists.
- No documented decision exists between Metadata API and Twenty app manifests.

### Sync and eventing

- No Twenty webhook route exists.
- No Twenty webhook signature verification exists.
- No inbound event processor exists.
- No outbound sync queue exists.
- No replay tooling exists.
- No reconciliation jobs exist for CRM links, projections, duplicates, failed webhooks, or stalled jobs.

### Migration and import

- No inventory document maps current Supabase data to Twenty objects.
- No pure import transforms exist for donor, missionary, fund, CMS page, church, household, or pledge records.
- No batch import jobs exist.
- No shadow-mode parity dashboard exists.

### Native CRM route depth

- A current `/crm` page exists.
- The deeper route set from the plan does not exist yet, including `/crm/people`, `/crm/people/[id]`, `/crm/churches`, `/crm/households`, `/crm/pledges`, `/crm/tasks`, `/crm/activity`, and `/crm/reports`.
- Existing admin task pages are app-local task surfaces, not Twenty-backed CRM task integration.

### Cross-surface projections

- No Twenty-backed donor CRM detail projection exists.
- No Twenty-backed missionary CRM detail projection exists.
- No CMS linkage projection exists.
- No event attendee CRM context projection exists.
- No role-scoped donor or missionary CRM read slices exist.

### Operations and cutover

- No Twenty-specific monitoring exists.
- No Twenty outage, webhook replay, outbound retry, duplicate merge, projection drift, import failure, rollback, upgrade, restore, or secret rotation runbooks exist.
- No production cutover checklist exists.
- No domain-specific rollback rehearsals exist.

## Phase Status Matrix

| Phase                                          | Current repo status      | Notes                                                                                                                |
| ---------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 00 - Strategy and proof                        | Partial                  | OpenSpec foundation exists, but no Twenty change package, ownership matrix, or infrastructure proof exists.          |
| 01 - Core seam and authorization               | Partial                  | `packages/api` and admin CRM patterns exist, but no root CRM gateway or Twenty client exists.                        |
| 02 - Identity, schema, and mapping             | Partial                  | Source tables exist, but no CRM link, merge, projection, or Twenty schema management exists.                         |
| 03 - Sync, eventing, and replay                | Not implemented          | No Twenty webhook, queue, replay, or reconciliation system exists.                                                   |
| 04 - First domain and Mission Control          | Partial                  | Native `/crm` page exists, but it is Supabase donor-backed and not Twenty-backed.                                    |
| 05 - Relationship expansion                    | Partial source data only | Donors and pledges exist in Supabase, but Twenty-backed churches, households, orgs, and pledge CRM authority do not. |
| 06 - Cross-surface projections and shadow mode | Not implemented          | No Twenty-backed projections or shadow dashboards exist.                                                             |
| 07 - Production cutover and operations         | Not implemented          | General CI and validation exist, but no Twenty-specific operational layer exists.                                    |

## Practical Takeaway

The repo has a good foundation for this plan: data boundary, Mission Control shell, existing CRM page, Supabase-backed relationship data, TanStack table patterns, and OpenSpec platform boundaries.

The Twenty-specific integration is effectively not implemented yet. The existing CRM should be treated as the source data and UI foundation for a future Twenty integration, not as evidence that the Twenty subsystem already exists.
