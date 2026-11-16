# Workspaces hillclimb coverage

Every state below is defined once in `workspace-states.mjs`. Both
`capture-workspaces.mjs` (screenshots and `page-metrics.json`) and
`check-workspaces.mjs` (axe, overflow, rows, keyboard and dialog focus) use
it. Both versions run the same steps against the same fixtures:

- **The original (A):** a detached worktree at
  `8368004b339384eb98129a086ca71b7db88534ed`, served on port 3031 with
  `ASYM_E2E_AUTH_SURFACE=admin`. The test sign-in maps an app from its port,
  and 3031 is not mapped.
- **Each candidate (B):** this worktree on port 3030.

Widths: D = 1440x1000, I = 1024x900, T = 640x900, M = 390x844.

## CRM

| State                    | Route / steps                                                       | Widths  |
| ------------------------ | ------------------------------------------------------------------- | ------- |
| `crm-records`            | `/crm` (table, full page)                                           | D I T M |
| `crm-kanban`             | `/crm` → kanban view                                                | D M     |
| `crm-search`             | `/crm` → search for a donor's first name                            | D M     |
| `crm-view-options`       | `/crm` → "View" column menu                                         | D       |
| `crm-row-menu`           | `/crm` → first row's actions menu                                   | D       |
| `crm-drawer`             | `/crm?donor=` record drawer                                         | D M     |
| `crm-drawer-properties`  | drawer → Properties tab                                             | D       |
| `crm-drawer-gifts`       | drawer → scrolled to Gift history                                   | D M     |
| `crm-gift-views-menu`    | drawer → gift history views menu                                    | D       |
| `crm-notes`              | `/crm/notes` (full page)                                            | D I T M |
| `crm-note-detail`        | `/crm/notes` → first note dialog                                    | D M     |
| `crm-relationships`      | `/crm/relationships` (full page)                                    | D I T M |
| `crm-empty`              | `/crm`, empty fixtures                                              | D       |
| `crm-error`              | `/crm`, failing API                                                 | D       |
| `crm-notes-empty`        | `/crm/notes`, empty fixtures                                        | D       |
| `crm-relationships-more` | `/crm/relationships` → page past the first 50 (scroll or Load more) | D M     |

## Contributions

| State                          | Route / steps                                                                           | Widths  |
| ------------------------------ | --------------------------------------------------------------------------------------- | ------- |
| `contributions`                | `/contributions` (full page)                                                            | D I T M |
| `contributions-cards`          | → card view                                                                             | D I     |
| `contributions-filter`         | → Status filter open                                                                    | D       |
| `contributions-row-menu`       | → first row's actions menu                                                              | D       |
| `contributions-selection`      | → three rows selected (selection bar)                                                   | D M     |
| `contributions-send-receipts`  | → two rows selected → Send receipts                                                     | D       |
| `contribution-sheet`           | `/contributions?gift=` detail sheet                                                     | D M     |
| `contribution-refund`          | sheet → Refund gift                                                                     | D M     |
| `contribution-fund-correction` | n/a: no fund-designation correction in either version's sheet (refund and receipt only) | D M     |
| `contribution-send-receipt`    | sheet → Send receipt                                                                    | D       |
| `contribution-correction`      | sheet with a pending correction approval                                                | D       |
| `contributions-empty`          | empty fixtures                                                                          | D       |
| `contributions-error`          | failing API                                                                             | D       |

## Web Studio

| State                              | Route / steps                                                      | Widths  |
| ---------------------------------- | ------------------------------------------------------------------ | ------- |
| `studio-dashboard`                 | `/web-studio` (full page)                                          | D I T M |
| `studio-nav-mobile`                | `/web-studio` → open studio navigation sheet                       | M       |
| `studio-pages`                     | `/web-studio/collections/pages` (full page)                        | D I T M |
| `studio-media`                     | `.../collections/media`                                            | D       |
| `studio-navigation`                | `.../collections/navigation`                                       | D       |
| `studio-ministry-updates`          | `.../collections/ministry-updates`                                 | D M     |
| `studio-page-templates`            | `.../collections/page-templates`                                   | D       |
| `studio-missionary-profiles`       | `.../collections/missionary-profiles`                              | D       |
| `studio-giving-pages`              | `.../collections/missionary-giving-pages`                          | D       |
| `studio-project-pages`             | `.../collections/project-pages`                                    | D       |
| `studio-users`                     | `.../collections/cms-users` (stock list, Studio chrome)            | D M     |
| `studio-tenants`                   | `.../collections/tenants`                                          | D       |
| `studio-pages-trash`               | `.../collections/pages/trash`                                      | D       |
| `studio-page-edit`                 | `.../collections/pages/1` document workspace                       | D I T M |
| `studio-page-settings`             | document → Workspace settings dialog                               | D M     |
| `studio-page-versions`             | `.../pages/1/versions`                                             | D M     |
| `studio-page-api`                  | `.../pages/1/api`                                                  | D       |
| `studio-page-create`               | `.../collections/pages/create`                                     | D M     |
| `studio-update-edit`               | `.../collections/ministry-updates/2`                               | D M     |
| `studio-navigation-edit`           | `.../collections/navigation/1`                                     | D       |
| `studio-media-edit`                | `.../collections/media/1`                                          | D       |
| `studio-account`                   | `/web-studio/account`                                              | D       |
| `studio-templates`                 | `/web-studio/templates` (full page)                                | D M     |
| `studio-missionaries`              | `/web-studio/missionaries`                                         | D M     |
| `studio-new-page`                  | `/web-studio/pages/new-from-template`                              | D M     |
| `studio-new-giving`                | `/web-studio/pages/give`                                           | D       |
| `studio-new-project`               | `/web-studio/projects/new`                                         | D       |
| `studio-new-update`                | `/web-studio/ministry-updates/new`                                 | D       |
| `studio-pages-filters`             | pages list → Filters → Add filter                                  | D M     |
| `studio-pages-view-menu`           | pages list → View (column) menu                                    | D       |
| `studio-pages-sort-menu`           | pages list → Sort menu (phone layout only)                         | M       |
| `studio-pages-filtered-empty`      | pages list with a search that matches nothing                      | D M     |
| `studio-giving-edit`               | giving pages list → open Grace Okafor                              | D M     |
| `studio-page-edit-details`         | document → Details disclosure (phone)                              | M       |
| `studio-page-edit-preview-menu`    | document → Preview menu (phone)                                    | M       |
| `studio-new-page-errors`           | new page → Create draft with required fields empty                 | D M     |
| `studio-new-page-template-picker`  | new page → Template combobox open                                  | D M     |
| `studio-new-giving-errors`         | new giving page → Create draft with fields empty                   | D       |
| `studio-missionaries-status-error` | missionaries hub with the giving-page status request failing (500) | D M     |
| `studio-templates-error`           | template gallery with the templates request failing (500)          | D M     |
| `studio-pages-grouped`             | pages list with `?groupBy=_status`                                 | D M     |
| `studio-pages-group-menu`          | pages list → Group by menu (A: Columns & filters)                  | D       |

Round 2 adds the last three rows above (Group by and Relationships past
50). Notes have 25 fixtures, under one page, so Notes paging is proven by
unit tests (`admin-crm-notes-relationships-paging.test.tsx`), not captures.

## Round 3 additions

| State                        | Route / steps                                                             | Widths |
| ---------------------------- | ------------------------------------------------------------------------- | ------ |
| `crm-gift-row-menu`          | drawer → first gift row "More gift actions"                               | D      |
| `crm-resend-receipt`         | drawer → Resend (or Send) receipt confirmation                            | D M    |
| `crm-relationship-detail`    | `/crm/relationships` → first row that opens details in place              | D M    |
| `crm-note-long`              | `/crm/notes` → save a ~3,000-character note in the composer, then open it | D M    |
| `studio-pages-selected`      | pages list → tick Year-End Giving and Kenya School Build                  | D M    |
| `studio-pages-bulk-publish`  | two pages ticked → Publish (confirmation open, never confirmed)           | D      |
| `studio-pages-tenant-filter` | pages list with a Tenant `where` in the URL, filter panel open            | D M    |

Round 3 also captures phones for `crm-empty`, `crm-error`, `crm-notes-empty`,
`contributions-empty`, `contributions-error`, `contribution-correction` and
the giving, project and update create flows; `crm-drawer-gifts` now scrolls
the gift list to the top of the drawer, and `contributions-selection` keeps
the selected cards in view on phones (`keepScroll`).

## Not reachable locally

These are listed so no surface is silently left out:

- **Offline gift entry dialog:** gated by
  `OFFLINE_GIFT_ENTRY_PERSISTENCE_ENABLED = false` in the original and the
  candidate. The trigger never renders.
- **`/contributions/{id}`:** a server redirect to `?gift=`, so it has no UI
  of its own.
- **Live tenant data:** the CRM and Contributions APIs need Supabase, so the
  pages use typed fixtures. Web Studio uses a local Payload database. Neither
  proves tenant integration.
- **Restricted roles:** only the demo admin account can sign in locally.
  Role gates are covered by unit tests, not browser captures.

States added for QA round 3 open each width in a fresh page (`freshPerWidth`):
menus close on resize, and some triggers exist in only one layout. Where a
version has no such trigger, or it is disabled until the form is filled
(the original's create flows), the page is captured as it stands and the
capture log names the missing trigger.
