# Current-cohort application regression fixes

Final clean application tip: `1944a55e682e3414d76e650b4cd5fb797bf4398d`. The normal commit changes five production files and one existing test file; shared components, dependencies, proof baselines and gate policies are untouched.

Four Web Studio create forms admitted a second submission while their first POST remained pending. Installed TanStack Form 1.33.5 skips its early `canSubmit` rejection on later submission attempts, permitting pending concurrent submissions. Async `act` around each existing repeat-submit action exposed four deterministic RED failures: two POST calls against the unchanged expected one. Each native submit handler now prevents default and exits when its live `form.state.isSubmitting` is true. Existing fields, payloads, validations, error messages, tenant checks, retry and navigation logic are unchanged.

The missionary task summary now explicitly names each button with its visible count and label. The task test remains byte-identical. Chromium 156 with matching Playwright 1.64 exposed the original styled names as `1 Active` and `0 Completed`; explicit labels preserve those names and avoid jsdom's differing flex-child accessibility calculation. This was an isolated native markup/CSS probe, not an application-wide browser audit.

GREEN: four focused suites, 22 tests, covering all four CMS pending/error/payload/retry paths, task toolbar filters/views/refresh, CMS route-state loading and task deletion/focus recovery. Scoped admin/missionary lint and typecheck passed all 15 tasks. Normal commit hooks passed ESLint, Prettier and staged Shadscan without score/policy changes. Seven source/test SHA identities match the verified pre-commit bytes; the committed diff whitespace check passes.

Evidence is under `/tmp/core-stack-review/new-cohort-app-pending-names-{green,scoped-gates,commit}.*`, `new-cohort-cms-duplicate-red.*`, `new-cohort-task-toolbar-red.*`, and `new-cohort-task-name-qualified-browser.*`. Root's complete current-tree unit/build/preflight and remote CI reruns remain required.
