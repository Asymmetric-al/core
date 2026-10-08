# Application integration qualification

Final local application tip: `c372232f0a84497f8afbc5af8774e817d2470fa6`, a normal merge of application tip `b9f0e94d7b5c6e0509244dc2a9e97670ee75771a` and qualified foundation `10667cfb3935af86a05431b6da17e2b2cb06e608`. The worktree is clean. The subsequent requested foundation merge was already up to date.

Resolved the sole application conflict in donor History by retaining Core's semantic tooltip colors, chart values, mobile transaction rendering and receipt/statement actions while accepting upstream's numeric/undefined formatter guard. Inspection of automatic overlaps retained Recharts 3 tooltip/legend compatibility, declared series order, DataGrid manual-processing flags, board/reaction accessible names and Core's semantic styling.

Adapted only the Support Hub mobile-selection test's obsolete table setup: removed the `createDataTableRowModels` import and `rowModels` option. Stable fixtures and every interaction assertion are unchanged. The recorded RED failed exactly with `createDataTableRowModels is not a function`; GREEN passed all seven tests across four files covering Support selection/focus/identity, contribution receipt identities and reordered selection, donor History formatting and receipt/statement actions, and missionary preference isolation/local save.

Verified the invoked Bun was 1.4.2 and installed Vitest 5.0.3, React 19.3.0, TanStack Table 9.2.6, Recharts 3.10.1 and Base UI 1.8.0. GREEN evidence: `/tmp/core-stack-review/new-cohort-app-seams-green.log` and `.exit` (0). Normal commit hooks passed lint, Prettier and staged Shadscan. Owned-file formatting and diff whitespace checks passed.

Broad integration diff whitespace warnings occur solely in the byte-identical Supabase adapter patch inherited from approved develop; its context whitespace was preserved. This scoped qualification does not establish browser-wide coverage or full stack CI; root's current-tree preflight and remote checks remain required.
