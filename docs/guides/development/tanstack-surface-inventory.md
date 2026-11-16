# TanStack surface inventory (frozen)

This document freezes the in-scope surfaces for TanStack Table + Query + DB + Virtual standardization. Last updated with the TanStack Surface Migration plan.

## Out of scope (unless re-scoped)

- Social/feed-style lists (e.g. missionary feed) that are not table or grid replacements.

## Admin (`apps/admin`)

| Surface          | Path                                                              | Pattern today                      |
| ---------------- | ----------------------------------------------------------------- | ---------------------------------- |
| Contributions    | `app/contributions/contributions-client.tsx`                      | `DataTable` + client `useQuery`    |
| CRM              | `app/crm/page.tsx`                                                | `DataTableResponsive`              |
| Tasks            | `app/tasks/follow-ups-grid.tsx`                                   | `DataGridPanel` + `useTable`       |
| Locations        | `features/mission-control/locations/components/LocationTable.tsx` | `DataTableWrapper`                 |
| Personnel / care | `features/mission-control/care/components/PersonnelList.tsx`      | `DataTableWrapper`                 |
| Events attendees | `app/events/page.tsx`                                             | Raw shadcn `Table` / `TableHeader` |
| Teams            | `app/admin/teams/teams-sections.tsx`                              | Raw shadcn `Table`                 |

**Column defs only (no table shell):** `app/contributions/columns.tsx`, `app/crm/columns.tsx`.

The Mobilize pipeline no longer renders a table: it shows a "Pipeline not connected yet" state until real candidate data exists, and the sample-task board and its column defs were removed.

## Donor (`apps/donor`)

| Surface         | Path                                                  | Pattern today                                                |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| Giving history  | `app/(dashboard)/donor-dashboard/history/page.tsx`    | `useDataTableVirtualization` + custom grid                   |
| History columns | `app/(dashboard)/donor-dashboard/history/columns.tsx` | `DataTableColumnHeader` (wire to shared table when migrated) |

## Missionary (`apps/missionary`)

| Surface              | Path                  | Pattern today                                             |
| -------------------- | --------------------- | --------------------------------------------------------- |
| Donors list + detail | `app/donors/page.tsx` | `useDataTableVirtualization` + inline `<table>` for gifts |

## Shared UI (`packages/ui`)

| Primitive        | Path                             | Notes                                                               |
| ---------------- | -------------------------------- | ------------------------------------------------------------------- |
| Data table stack | `components/shadcn/data-table/*` | Canonical table + responsive + wrapper + virtualization hook        |
| Data grid        | `components/shadcn/data-grid/*`  | TanStack Table + virtual; export policy decided in foundation phase |

## Shared data (`packages/database`)

| Layer               | Path                                                     |
| ------------------- | -------------------------------------------------------- |
| Collections         | `collections/client-db.ts`, `collections/collections.ts` |
| Live-query hooks    | `hooks/hooks.ts`, `hooks/index.ts`                       |
| Query client / keys | `providers/query-client.ts`, `query-keys.ts`             |
