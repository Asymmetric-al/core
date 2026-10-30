# Admin cleanup: Support Hub settings

Part of task 5.4 in [tasks.md](../tasks.md). Base commit `629cb71dc`, analyzer
`@shadcn/lint@0.2.3` with Core's patch. Ledger batch:
`admin-support-settings-2026-10-30`.

## Scope

Twenty-five files under `apps/admin/features/support-hub/components/settings/`
had 243 raw findings (241 `no-restyle`, 2 `no-arbitrary-values`). All now
report zero findings and zero warnings, and their `suppressions.json` entries
are pruned. No shared component, token, contract, exception or suppression
count was added or widened.

| File                                            | Before |
| ----------------------------------------------- | -----: |
| `macros/MacroActionEditor.tsx`                  |     29 |
| `business-hours/BusinessHoursForm.tsx`          |     28 |
| `automations/AutomationActionRow.tsx`           |     20 |
| `automations/AutomationRuleForm.tsx`            |     18 |
| `automations/AutomationConditionRow.tsx`        |     14 |
| `signatures/SignatureList.tsx`                  |     13 |
| `sla/SlaPolicyList.tsx`                         |     13 |
| `collaborators/TeamList.tsx`                    |     11 |
| `automations/AutomationRuleList.tsx`            |     10 |
| `sla/SlaPolicyForm.tsx`                         |     10 |
| `business-hours/BusinessHoursList.tsx`          |      9 |
| `canned-responses/CannedResponseList.tsx`       |      9 |
| `labels/LabelsSettingsPanel.tsx`                |      9 |
| `macros/MacroList.tsx`                          |      9 |
| `automations/AutomationDryRunPreview.tsx`       |      8 |
| `signatures/SignatureForm.tsx`                  |      8 |
| `collaborators/TeamForm.tsx`                    |      5 |
| `inbox/InboxSettingsForm.tsx`                   |      4 |
| `saved-views/SavedViewsList.tsx`                |      4 |
| `canned-responses/CannedResponseForm.tsx`       |      3 |
| `assignment/AssignmentRulesForm.tsx`            |      2 |
| `collaborators/AgentsList.tsx`                  |      2 |
| `macros/MacroForm.tsx`                          |      2 |
| `notifications/NotificationPreferencesForm.tsx` |      2 |
| `SettingsRow.tsx`                               |      1 |

## Changes

- `SettingsRow` is a flex row with a `sm:w-60` label column instead of an
  arbitrary `minmax(0,240px)` grid.
- Widths moved from `SelectTrigger`, `SearchableSelect` and `Input` to plain
  wrappers. Automation condition and action rows, macro action rows and
  holiday rows now read type, value, remove on one line. Before, each row
  stacked to 125-128px. At 390px they wrap to two lines with no internal
  scrolling.
- Row controls use the default 36px height so heights match within a row;
  remove buttons are 32px `ghost icon-sm` (28px before). Red trash and amber
  star colours moved onto the icons.
- Add and pick buttons use `size="xs"`. Two labels without controls became
  captions. `font-mono` overrides on inputs were removed.
- Business-hours time inputs are 144px wide (110px before), so 12-hour times
  such as "09:00 AM" are no longer clipped.
- `MacroActionEditor` renders each row's kind-specific value control through
  an extracted `MacroActionValueControl`. The wrapper divs had pushed the
  component past React Doctor's 300-line limit. Behaviour, labels and
  handlers are unchanged; the macro add/remove browser steps and the 23
  Select null-policy tests were rerun after the extraction.

## Verification

- `bun run lint:ui <files> --raw`: 0 findings, 0 warnings. Admin
  `tsc --noEmit` passes.
- Eleven focused unit files pass (90 tests), including settings draft state,
  business hours, team draft ownership, automation row identity, dry-run state
  and the Select/SearchableSelect null-policy suites.
- Browser, real routes on two dev servers (base commit and change), demo
  auth. Every `/api/admin/support/*` read is stubbed with schema-shaped rows.
  Scenarios `support-settings-a` and `support-settings-b` ran 21 steps at
  1280 and 390px on both servers (84 records).
  - No step errors, page errors or horizontal overflow.
  - Add and remove change row counts as expected: automation rule form
    4 → 3, macros 4 → 5 → 4, holidays 1 → 2.
  - The action-type select lists 8 options; Escape returns focus to the
    trigger. Dry run reports "Rule matches".
  - Every icon button is named and on screen.
- Axe found no new violations. The `label` hits on unlabelled business-hours
  inputs and form fields, and the shell `label-content-name-mismatch`, `list`
  and `listitem`, are identical before the change.
- Hash-bound review ledgers: the Shadscan finding-ledger proofs and React
  Doctor exceptions bound to these files were re-reviewed. Their hashes were
  rebound only where the recorded rationale still holds and React Doctor
  still emits the same diagnostic with a byte-identical source context;
  anything else was reviewed individually. `bun run verify:shadscan` and
  `bun run react-doctor:check` pass on this branch.

## Known gaps and follow-ups

- No ghost-destructive or ghost-warning Button exists; no compact
  `SearchableSelect` or `Input` size exists.
- Pre-existing: unlabelled business-hours time and date inputs (axe `label`).
- Not exercised: save, delete and set-default writes (stubbed), the label
  editor form and create flows. Edit renders the same form components.

Evidence (ignored, hashed in the ledger):
`.tmp/admin-lint-5-4/support-settings/`.
