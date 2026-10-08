# Cross-app review of the second upstream integration

Static review compared approved develop `a7b216d141c17ea2d7f9514fdb28ce4db6f4fb68` against former develop `289c16317eee9807dfcebb412a20ebccbcfcd012` and application-stack tip `b9f0e94d7b5c6e0509244dc2a9e97670ee75771a`. Scope included six intersecting first-party paths, chart/table callers, task and reaction controls, app forms, and changed test harnesses. Base UI remains 1.8.0; approved upstream introduces TanStack Table 9.2.6, React 19.3.0 and Recharts 3.10.1.

Two stack-added test seams require adaptation before qualifying that integration:

- `tests/unit/packages/ui/ui-improvement-floating-actions.test.tsx:8,31`
- `tests/unit/apps/admin/features/support-hub/components/mobile-card-selection.test.tsx:4,26`

Both still import the removed `createDataTableRowModels` helper and provide its obsolete `rowModels` option. Remove those references and retain `dataTableFeatures`, stable row fixtures, selection state and existing interaction assertions. Reintroducing the obsolete boundary or weakening assertions would be incorrect.

Retain approved upstream fixes alongside the stack's semantic styling: numeric/undefined tooltip guards, Recharts 3 tooltip/legend types and declared series order, DataGrid manual-processing flags, task-board and reaction accessible names, DayPicker `autoFocus`, and Vitest-owned Window/document setup. Independent form review found preserved submission payloads, pending/dirty/reset behavior, retry input and field associations across the inspected donor, missionary and admin flows. No further concrete app-source compatibility fix was identified.

The prior 28 component screenshots and four captured source hashes describe their earlier source/dependency epoch. Newly inherited board labels change its source identity; preserve historical hashes and qualify evidence rather than claiming the old captures validate this integration. OpenSpec task 4.1 remains open for complete application-layout evidence.

No edits, installs or tests were performed. This report does not certify the merged tree or runtime on the new dependencies; integration and current-version gates remain required.
