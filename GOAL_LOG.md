# React Doctor Cleanup Goal Log

## 2026-05-21

Goal: complete safe, repo-verifiable remediation from the first-party React
Doctor audit and document higher-risk follow-ups with owners and blockers.

### Audit Baseline

- Command: `bun run react-doctor:first-party -- --full --offline --fail-on none`
- Prior audit result: completed successfully for configured first-party `apps`
  and `packages` targets.
- Active configured findings before this cleanup: 0.
- Score: unavailable in offline mode.
- Caveat: broad ignored rule families remain intentional cleanup backlog;
  passing the configured audit is not proof that every possible React Doctor
  rule is clean.

### Completed Safe Remediations

| Area                               | Status | Decision / Notes                                                                                                                                                                             | Validation                                         |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Responsive data table mobile state | Done   | `DataTableResponsiveInner` now uses shared `useMediaQuery` instead of storing viewport state and attaching a manual `resize` listener. The only effect left coerces table view to card view. | Unit, lint, typecheck, React Doctor                |
| Safe HTML exception narrowing      | Done   | Removed global `react/no-danger` ignore after verifying first-party runtime TS/TSX source has no direct `dangerouslySetInnerHTML=` assignments.                                              | Contract test, React Doctor                        |
| Raw image exception narrowing      | Done   | Kept `nextjs-no-img-element` ignored globally for now, but documented and contract-tested the only first-party JSX exception: Tiptap image NodeView needs an `HTMLImageElement` resize ref.  | Contract test                                      |
| Missionary donor mutations         | Done   | Moved donor notes, tag updates, and edit-donor saves behind missionary route handlers backed by `@asym/api`, with role, tenant, profile, and donor scoping.                                  | API tests, client boundary tests, missionary build |
| Large client component slice       | Done   | Extracted donor mutation fetch behavior into `donor-mutation-client.ts` as a behavior-preserving slice from the large donors client.                                                         | Client tests, lint, typecheck                      |
| Windows validation portability     | Done   | Normalized paths in the auth-context propagation contract test so the full unit suite can run on Windows without falsely failing the forward-slash allowlist.                                | Focused test, full unit suite                      |
| Windows CI build wrapper           | Done   | Fixed `scripts/verify/ci-build.mjs` and `scripts/run-with-ci-env.mjs` so the root CI build works on Windows with Bun-installed Turbo and exits after Next app builds.                        | Wrapper unit test, `bun run build`                 |

### Explicitly Deferred Follow-ups

| Area                                              | Status   | Blocker / Reason                                                                                                                                                        | Owner               |
| ------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Broad large-client component splitting            | Deferred | Safe staged extraction requires route-owner behavior coverage and rendered checks for admin editor/feed, missionary feed, donor pledge/wallet/dashboard surfaces.       | App owners          |
| Bundle-heavy editor/map/chart/PDF/email changes   | Deferred | No dynamic import changes were made because route-level bundle baselines were not captured before this task; speculative splitting would risk SSR/CSR behavior changes. | Frontend/platform   |
| Accessibility/design rule re-enablement           | Deferred | Broad `jsx-a11y` and design rules should be re-enabled only per rendered route/component slice with Playwright/axe/screenshot validation.                               | Frontend/design     |
| Remaining React Doctor ignored component families | Deferred | Component shape, rendering, async/data, micro-performance, and correctness-suspicion families remain documented backlog; re-enable one family at a time.                | App/platform owners |

### Validation Results

- `bunx vitest run tests/unit/packages/ui/components/shadcn/data-table-responsive-inner.test.tsx` -> passed.
- `bunx vitest run tests/unit/apps/react-doctor-config-contracts.test.ts` -> passed.
- `bunx vitest run tests/unit/packages/api/missionary-portal/donor-mutations.test.ts tests/unit/apps/missionary/donor-mutation-boundary.test.ts tests/unit/apps/missionary/app/donors/donor-mutation-client.test.ts` -> passed.
- `bunx vitest run tests/unit/packages/api/auth/get-auth-context-request-propagation.test.ts` -> passed.
- `bunx turbo run lint --filter=@asym/ui --filter=@asym/api --filter=@asym/missionary-app` -> passed.
- `bunx turbo run typecheck --filter=@asym/ui --filter=@asym/api --filter=@asym/missionary-app` -> passed.
- `bun run format:check` -> passed.
- `bun run lint` -> passed.
- `bun run typecheck` -> passed.
- `bun run test:unit` -> passed: 247 files, 1070 passed, 2 skipped.
- `bun run react-doctor:first-party -- --full --offline --fail-on none` -> passed for configured first-party apps/packages; offline scores unavailable.
- `bunx vitest run tests/unit/scripts/run-with-ci-env.test.ts` -> passed.
- `bun run build` -> passed after fixing Windows command resolution and app-build exit behavior: shared packages, admin, donor, and missionary all passed.

### Rollback Notes

- `packages/ui/components/shadcn/data-table/data-table-responsive-inner.tsx`: restore the old `isMobile` state and `resize` listener if the shared media-query behavior regresses.
- `react-doctor.config.json` and `docs/guides/development/react-doctor.md`: re-add `react/no-danger` to the ignore list only if a reviewed, sanitized raw HTML rendering path is introduced and contract tests/docs are updated.
- `apps/missionary/app/api/missionary/donors/**`, `packages/api/src/missionary-portal/donor.ts`, and `apps/missionary/app/donors/donor-mutation-client.ts`: remove the route/API/client helper files and restore direct Supabase browser writes in `use-donors-page-view.tsx` and `edit-donor-dialog.tsx` to revert the donor mutation boundary change.
- `tests/unit/**`: remove the newly added focused tests only when reverting the corresponding production/config changes.
- `tests/unit/packages/api/auth/get-auth-context-request-propagation.test.ts`: remove `normalizeRepoPath` only if recursive test discovery is made POSIX-normalized elsewhere.
- `scripts/run-with-ci-env.mjs` and `scripts/verify/ci-build.mjs`: restore the previous async wrapper and Turbo app-build path only if Windows root builds are no longer required or Turbo app builds stop hanging locally.
- `docs/ai/working-set.md` and this file are tracking notes; revert or delete them if the cleanup record is no longer wanted.
