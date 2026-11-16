1. **Done**
   - `care-notes-html`: [PersonnelProfile.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/PersonnelProfile.tsx) supports legacy HTML, TipTap JSON, and literal notes as plain text. Added HTML regression coverage.
   - `care-directory-phone-names`: [care-personnel-grid.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/care-personnel-grid.tsx) places badges below untruncated, wrapping names.
   - `care-layout-gaps`: [CareDashboard.tsx](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/features/mission-control/care/components/CareDashboard.tsx) places the chart beneath follow-ups with consistent spacing; [care/page-client.tsx](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/care/page-client.tsx>) retains loading/error handling.
   - `care-date-input`: replaced the native input with shared Calendar/Popover components. Tested selection, clearing, and saving the local calendar date.
   - `mobilize-copy`: corrected the [Mobilize subtitle](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/mobilize/page-client.tsx>); the [Locations legend](<C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/apps/admin/app/(app)/mobilize/locations/page-client.tsx>) shows only types present. Updated tests.

2. **Not needed:** None.

3. **Skipped:** Live responsive and keyboard verification, respecting the server/localhost prohibition.

4. **Needs another owner:** None.

5. **Commands run**
   - `bunx vitest run --config vitest.config.mts` targeting Care, Mobilize, and Locations: **15 suites, 102 tests passed**. Final rerun of the five changed test files: **46 tests passed**. Care failures are resolved.
   - `node tooling/eslint-config/lint.mjs <six changed source files>`: **passed** after correcting shared-component style violations.
   - `bunx prettier --write <all changed files>`: **completed**.
   - `bunx tsc --noEmit --incremental false -p apps/admin`: **passed**.

All edits stayed in the `-r12` checkout; no git state changes.
