# Historical Round 12 Tools review reconciliation

Collected 2026-11-12 from completed task b1028777-9421-45dd-9a8e-74930f29a289. Its evidence compares round11 with round12 in the frozen original checkout. Its preference for B and rejection of completeness are historical, not Round 13 scores.

## Current source inspection

- Email uses `useStudioDiscardGuard(ui.hasUnsavedChanges)` at `apps/admin/app/(app)/email/page-client.tsx:142`. The historical missing-registration claim does not describe current source. Live navigation protection remains an acceptance check.
- Tools builder records removal of the unrelated Automations settings destination, compact guidance, removal of the duplicate workflow chart, and direct PDF Open template action. Existing builder checks are recorded in `builders/tools.md`; active captures must establish presentation.
- Copied Reports summaries carry incomplete and unknown-completeness warnings in `apps/admin/app/(app)/reports/report-model.ts:160`. CSV scope and currency identity need separate evaluation; copied-summary coverage does not prove them.
- Phone workflow record IDs now have an accessible copy control in `apps/admin/features/mission-control/components/WorkflowSummariesTable.tsx`. Exact workflow names still use title and screen-reader text; inspect the precise historical claim before deciding whether the remaining disclosure is material.

## Remaining concrete defect

PDF `handleCopyHtml` calls `navigator.clipboard.writeText(exportedHtml)` and immediately updates copied state and success toast at `apps/admin/app/(app)/pdf/page-client.tsx:1589`. A rejected or delayed clipboard write therefore gets premature success; missing clipboard access can throw. This persists in the frozen Round 13 source. A focused regression should assert pending/rejected/missing-clipboard behavior and successful feedback only after resolution.

Do not edit product source while active capture collectors rely on the frozen checkpoint. Once their completion is delivered, apply the small clipboard fix with red/green coverage, update the checkpoint explicitly and recapture affected PDF evidence.

## Additional financial review follow-up

The historical review also raises currency identity in grouped Reports and CSV scope. Current `packages/api/src/admin/crm/reports/service.ts` aggregates `amountCents` without a currency field visible in its model. This observation warrants domain-contract and regression investigation; it is not yet proof of mixed-currency input being accepted. Existing independent final financial review is running. Preserve its independent scope and reconcile the finding when delivered.

No product edits or runtime captures were performed for this reconciliation. No new visual score or browser acceptance is claimed.
