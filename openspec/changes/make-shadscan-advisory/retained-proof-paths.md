# Retained proof paths

Task 2.6 records every path that `tooling/shadscan/findings.json` cited as
proof, because this change deletes that ledger. The list was taken from the
ledger at `develop` commit `cf634218a2ac46c61dbede6c04c34a32d76bea66`: 129
entries citing 142 distinct paths (`proof[].path` and
`verificationTests[]`).

Every complete assertion span (design D3) present in these files on that
commit, and in every file under `tests/unit/apps`, `tests/unit/packages` and
`tests/fixtures/base-ui-compliance`, must be structurally identical on the
head. Non-test paths are listed because the ledger cited them; they hold no
assertion spans unless they call `assert.`.

## Paths

- `apps/admin/app/(app)/admin/eve/admin-memory-panel.tsx`
- `apps/admin/app/(app)/admin/eve/launch-readiness-panel.tsx`
- `apps/admin/app/(app)/admin/eve/section-states.tsx`
- `apps/admin/app/(app)/admin/eve/workspace-shell.tsx`
- `apps/admin/app/(app)/admin/page-client.tsx`
- `apps/admin/app/(app)/contributions/offline-gift/offline-gift-entry-dialog.tsx`
- `apps/admin/app/(app)/crm/detail-drawer.tsx`
- `apps/admin/app/(app)/email/email-studio-header.tsx`
- `apps/admin/app/(app)/pdf/page-client.tsx`
- `apps/admin/app/(app)/settings/integrations/resend/resend-sections.tsx`
- `apps/admin/app/(app)/settings/integrations/resend/use-resend-forms.ts`
- `apps/admin/app/(payload)/layout.tsx`
- `apps/admin/app/(payload)/web-studio/preview/[collection]/[id]/page.tsx`
- `apps/admin/app/layout.tsx`
- `apps/admin/app/mc-shell.tsx`
- `apps/admin/features/mission-control/components/navigation-search.tsx`
- `apps/admin/features/support-hub/components/command/use-inbox-shortcuts.ts`
- `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`
- `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx`
- `apps/donor/app/(public)/(solid)/checkout/checkout-client.tsx`
- `apps/donor/app/global-error.tsx`
- `apps/donor/app/global-not-found.tsx`
- `apps/donor/app/layout.tsx`
- `apps/donor/features/donor/components/donor-portal-header.tsx`
- `apps/donor/next.config.ts`
- `apps/factory-console/README.md`
- `apps/factory-console/src/app/layout.tsx`
- `apps/factory-console/src/components/chat.tsx`
- `apps/factory-console/src/components/console.tsx`
- `apps/factory-console/src/components/controls.tsx`
- `apps/factory-console/src/components/issue-detail.tsx`
- `apps/factory-console/src/components/ledger.tsx`
- `apps/factory-console/src/components/shared.tsx`
- `apps/factory-console/tests/shell.test.ts`
- `apps/missionary/app/_providers/missionary-layout-shell.tsx`
- `apps/missionary/app/donors/donor-tasks.tsx`
- `apps/missionary/app/donors/donors-page-dialogs.tsx`
- `apps/missionary/app/donors/donors-page-roster.tsx`
- `apps/missionary/app/donors/donors-page-states.tsx`
- `apps/missionary/app/donors/use-donors-page-view.tsx`
- `apps/missionary/app/global-error.tsx`
- `apps/missionary/app/global-not-found.tsx`
- `apps/missionary/app/layout.tsx`
- `apps/missionary/app/profile/profile-form-column.tsx`
- `apps/missionary/app/profile/profile-page-client.tsx`
- `apps/missionary/app/profile/profile-primitives.tsx`
- `apps/missionary/app/profile/use-profile-page-view.ts`
- `apps/missionary/components/app-header.tsx`
- `apps/missionary/components/app-shell.tsx`
- `apps/missionary/components/app-sidebar.tsx`
- `apps/missionary/components/navigation-items.ts`
- `apps/missionary/components/navigation-search.tsx`
- `apps/missionary/components/sidebar-account-menu.tsx`
- `apps/missionary/lib/route-policy.ts`
- `apps/missionary/next.config.ts`
- `apps/missionary/proxy.ts`
- `docs/guides/development/shadscan.md`
- `package.json`
- `packages/auth/package.json`
- `packages/config/navigation.ts`
- `packages/database/hooks/admin-crm-detail.ts`
- `packages/database/package.json`
- `packages/lib/package.json`
- `packages/missionary/components/add-partner-dialog.tsx`
- `packages/missionary/components/task-dialog.tsx`
- `packages/missionary/components/task-kanban-board.tsx`
- `packages/missionary/components/task-row.tsx`
- `packages/missionary/components/tasks/task-details-sheet.tsx`
- `packages/missionary/components/tasks/task-view-tabs.tsx`
- `packages/missionary/hooks/use-parked-submit.ts`
- `packages/missionary/package.json`
- `packages/ui/components.json`
- `packages/ui/components/app-shell/account-menu.tsx`
- `packages/ui/components/auth/FullLoginCard.tsx`
- `packages/ui/components/auth/LoginScreen.tsx`
- `packages/ui/components/auth/auth-primitives.tsx`
- `packages/ui/components/auth/change-password-form.tsx`
- `packages/ui/components/primitives/image-cropper.tsx`
- `packages/ui/components/primitives/labeled-field.tsx`
- `packages/ui/components/primitives/navigation-command-palette.tsx`
- `packages/ui/components/primitives/shortcut.tsx`
- `packages/ui/components/primitives/tanstack-form.tsx`
- `packages/ui/components/public/navbar-client.tsx`
- `packages/ui/components/shadcn-studio/blocks/dialog-search.tsx`
- `packages/ui/components/shadcn/alert.tsx`
- `packages/ui/components/shadcn/button-component.tsx`
- `packages/ui/components/shadcn/button.ts`
- `packages/ui/components/shadcn/command.tsx`
- `packages/ui/components/shadcn/dropdown-menu.tsx`
- `packages/ui/components/shadcn/empty.tsx`
- `packages/ui/components/shadcn/item.tsx`
- `packages/ui/components/shadcn/menubar.tsx`
- `packages/ui/components/shadcn/select.tsx`
- `packages/ui/components/shadcn/sheet.tsx`
- `packages/ui/components/shadcn/sidebar.tsx`
- `packages/ui/components/shadcn/slider.tsx`
- `packages/ui/components/shadcn/sonner.tsx`
- `packages/ui/components/shadcn/tooltip.tsx`
- `packages/ui/package.json`
- `scripts/verify/shadcn-config-guardrails.mjs`
- `tests/e2e/react-cleanup-memory.spec.ts`
- `tests/fixtures/base-ui-compliance/specs/admin-shadscan.spec.ts`
- `tests/fixtures/base-ui-compliance/specs/overlays.spec.ts`
- `tests/fixtures/base-ui-compliance/specs/search-delegation.spec.ts`
- `tests/fixtures/base-ui-compliance/specs/shadscan-readiness.spec.ts`
- `tests/unit/apps/admin/app/admin-page-availability.test.tsx`
- `tests/unit/apps/admin/app/eve-admin-memory-concurrency.test.tsx`
- `tests/unit/apps/admin/app/eve-launch-readiness-panel.test.tsx`
- `tests/unit/apps/admin/app/offline-gift-entry-dialog.test.tsx`
- `tests/unit/apps/admin/app/pdf/pdf-studio-header-export.test.tsx`
- `tests/unit/apps/admin/email/email-studio-header.test.tsx`
- `tests/unit/apps/admin/mission-control-navigation-search.test.tsx`
- `tests/unit/apps/admin/resend-field-accessibility.test.tsx`
- `tests/unit/apps/admin/shadscan-cms-boundaries.test.ts`
- `tests/unit/apps/donor/donor-navigation-search.test.tsx`
- `tests/unit/apps/donor/shadscan-settings-feedback.test.tsx`
- `tests/unit/apps/donor/static-shell-contract.test.ts`
- `tests/unit/apps/factory-console/shadscan-console-contracts.test.tsx`
- `tests/unit/apps/global-boundary-contracts.test.ts`
- `tests/unit/apps/missionary/donor-task-delete-confirmation.test.tsx`
- `tests/unit/apps/missionary/donors-detail-actions-focus.test.tsx`
- `tests/unit/apps/missionary/donors-page-module-shape.test.ts`
- `tests/unit/apps/missionary/missionary-navigation-search.test.tsx`
- `tests/unit/apps/missionary/route-gate-contract.test.ts`
- `tests/unit/apps/missionary/shadscan-header-pending.test.tsx`
- `tests/unit/apps/missionary/shadscan-mobile-sidebar.test.tsx`
- `tests/unit/apps/missionary/shadscan-profile-fields.test.tsx`
- `tests/unit/apps/shadscan-framework-contracts.test.tsx`
- `tests/unit/packages/database/shadscan-mutation-contract.test.tsx`
- `tests/unit/packages/missionary/add-partner-dialog.test.tsx`
- `tests/unit/packages/missionary/shadscan-task-controls.test.tsx`
- `tests/unit/packages/missionary/task-row-names.test.tsx`
- `tests/unit/packages/ui/auth-screen-pending.test.tsx`
- `tests/unit/packages/ui/base-ui-loading-button.test.tsx`
- `tests/unit/packages/ui/change-password-form.test.tsx`
- `tests/unit/packages/ui/navigation-command-palette.test.tsx`
- `tests/unit/packages/ui/shadscan-navbar.test.tsx`
- `tests/unit/packages/ui/shadscan-readiness.test.tsx`
- `tests/unit/packages/ui/shadscan-search-delegation.test.tsx`
- `tests/unit/packages/ui/shadscan-trigger-name.test.tsx`
- `tests/unit/packages/ui/tanstack-form-accessibility.test.tsx`
- `tests/unit/scripts/shadcn-config-guardrails.test.ts`
