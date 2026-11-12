# Round 13 financial repair report

Date: 2026-11-12, Asia/Bangkok (+07:00).

## Result and scope

**F1 and F2 are repaired at the source/unit-test boundary.** The final related regression run passes 255 tests in 14 files. This is not a live cache-freshness, provider, or full financial acceptance certificate.

All work stayed in `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12`. No Git mutations, children, servers, browser requests, environment-file changes, provider calls, dependency installation, deployment, or snapshot refreeze/recapture were performed. Existing concurrent edits were retained; the pre-existing GUID validation change in the owned route was not rewritten. The existing decision-route regression file remains unchanged.

The repair follows [the final financial review](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/final-finance-review.md), applicable root/API instructions, backend/data-access/testing rules, OpenSpec project and contribution/CRM/platform contracts, and installed Next.js 16.4.2 cache documentation. Prepared prototype artifacts remain preparation evidence, not substituted production modules.

## Applied repairs

### F1: effective payment-status eligibility

- [dashboard-stats.ts:140](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/reads/dashboard-stats.ts:140) now uses the canonical `normalizeSharedPaymentStatus` contract also used by Reports. Only an effective status normalized to `completed` contributes money; every other effective status contributes zero.
- Completed aliases continue to use the effective corrected amount minus recorded non-negative refunds, floored at zero. Existing safe-integer validation and currency-withholding behavior are unchanged.
- Original stored settled-record count queries and trend bucket counts remain intact. A completed original gift corrected to failed still counts as an original gift record but adds zero money. Attribution remains in the original UTC creation month; no stored gift or adjustment is rewritten.
- [dashboard-stats.test.ts:232](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/api/reads/dashboard-stats.test.ts:232) adds persistent coverage for failed, pending, refunded, processing, unknown, and whitespace/case-varied failed statuses; completed aliases with corrected amount/refund arithmetic; prior-month attribution/count preservation; and latest-applied versus reversed corrections.

### F2: correction-write cache invalidation

- [route.ts:226](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/route.ts:226) calls the existing `revalidateAdminContributionsCache(auth.tenantId)` after an applied direct correction that is not an idempotent replay.
- [route.ts:304](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/packages/api/src/admin/contribution-operations/route.ts:304) does likewise after an applied approval result, excluding both decision-outcome and action-result replays.
- Invalidation occurs immediately after the successful mutation/decision return, before viewer projection. A later presentation failure therefore does not prevent invalidation of an already-applied write.
- Denied/failed writes, pending approvals, rejected requests, and idempotent replays do not invalidate. Authorization, lazy approval-policy loading, provider behavior, response projection, and unrelated action semantics remain unchanged.
- [contribution-operations-cache.test.ts:153](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/tests/unit/packages/api/admin/contribution-operations-cache.test.ts:153) invokes the actual route wrapper and existing cache helper, with auth, executor/decision, provider, and `next/cache` boundaries mocked. It asserts the exact existing five tag calls for each of two authenticated tenants, plus denial, 403/409/500 failure, pending/rejection, replay, and post-write projection-failure boundaries. Existing decision-service/action/permission tests also pass in the related suite.

The existing helper includes the authenticated tenant tag alongside its existing base/list/staged-gifts/summary tags. No tag definition, scope, or helper implementation was changed.

### Important cache-contract limitation

The existing helper calls `revalidateTag(tag, "max")`. Installed Next.js documentation specifies stale-while-revalidate: tagged server data is marked stale and a later request triggers refresh while stale data may be served. **This is helper-based invalidation, not synchronous expiration or guaranteed read-your-writes.** No claim of immediate Dashboard freshness follows from these tests. Changing the helper to `{ expire: 0 }` or changing shared freshness policy was outside the two owned source files and was not attempted.

## Real red-green evidence

Both failing runs exercised persistent regression tests against the actual source before its corresponding repair, not only the prepared treatment copy.

| Slice                     | Red before source repair                                                     | Green after source repair                                        | Retained output                                                                                                                                                                                                                                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Effective-status money    | 6 failed, 31 skipped; actual `10000`, expected `0`; exit 1                   | 37 passed; exit 0, before additional characterization cases      | [Red](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/effective-status-applied-red.log), [green](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/effective-status-applied-green.log) |
| Correction/approval cache | 6 failed, 13 passed; expected Contributions tag calls, received none; exit 1 | 32 passed across 3 files; exit 0, before additional replay cases | [Red](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/cache-invalidation-red.log), [green](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/cache-invalidation-green.log)             |

The final run includes the expanded regressions and adjacent contracts: **14 files, 255 tests passed, exit 0**, in 19.50 seconds. Vitest disabled cache and file parallelism and used one concurrent worker. See [final-regression.log](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/final-regression.log).

## Verification

All commands ran from the authorized worktree using installed dependencies only. Toolchain: Bun 1.4.3, Node 24.22.1, Next.js 16.4.2, Vitest 5.0.5. Package-local TypeScript resolves to 7.0.2; root TypeScript resolves to 6.0.3.

| Check                                                                                                                                                                                                            | Concrete result                                                                          | Evidence                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------- |
| Related regression suite, command below                                                                                                                                                                          | 14 files / 255 tests passed; exit 0                                                      | `final-regression.log`     |
| ESLint on the four owned TypeScript files, `--max-warnings 0`                                                                                                                                                    | Zero errors/warnings; exit 0                                                             | `final-eslint.log`         |
| `bun run --cwd packages/api typecheck --incremental false --pretty false`                                                                                                                                        | Package-local TypeScript 7.0.2, zero diagnostics; exit 0                                 | `api-typecheck-ts7.log`    |
| `bun packages/api/node_modules/typescript/bin/tsc --project docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/scoped-typecheck.tsconfig.json --noEmit --incremental false --pretty false` | TypeScript 7.0.2, both owned sources and both regression files, zero diagnostics; exit 0 | `scoped-typecheck-ts7.log` |
| Scoped Prettier check on both sources, both regression files, and scoped typecheck config                                                                                                                        | Passed; exit 0                                                                           | `scoped-format.log`        |
| `bun run verify:data-boundary`                                                                                                                                                                                   | Passed; exit 0                                                                           | `data-boundary.log`        |

Earlier API/scoped typechecks using root `bunx --no-install tsc` also passed, but used TypeScript 6.0.3. Their empty diagnostic logs are retained as `api-typecheck.log` and `scoped-typecheck.log`; they are not represented as TypeScript 7 checks. An initial lint pass had one import-order warning; it was fixed, and the strict final rerun is recorded separately in `final-eslint.log`. The earlier `scoped-eslint.log` retains that warning for provenance.

Final regression command:

```powershell
bunx --no-install vitest run --config vitest.config.mts --no-cache --maxWorkers 1 --no-file-parallelism `
  tests/unit/packages/api/reads/dashboard-stats.test.ts `
  tests/unit/packages/api/admin/contribution-operations-cache.test.ts `
  tests/unit/packages/api/admin/contribution-operation-decision-route.test.ts `
  tests/unit/packages/api/admin/contribution-operations-route-contract.test.ts `
  tests/unit/packages/api/admin/contribution-operations-actions.test.ts `
  tests/unit/packages/api/admin/contribution-effective-values.test.ts `
  tests/unit/packages/api/admin/contribution-effective-values-status.test.ts `
  tests/unit/packages/api/admin/contribution-adjustment-operations.test.ts `
  tests/unit/packages/api/admin/contribution-correction-requests.test.ts `
  tests/unit/packages/api/admin/contribution-approval-policy.test.ts `
  tests/unit/packages/api/admin/contribution-operations-permissions.test.ts `
  tests/unit/packages/api/shared/cache-tags.test.ts `
  tests/unit/apps/admin/app/contributions-hub-model.test.ts `
  tests/unit/apps/admin/app/reports-page.test.tsx
```

Scoped lint command:

```powershell
bunx --no-install eslint --max-warnings 0 `
  packages/api/src/reads/dashboard-stats.ts `
  packages/api/src/admin/contribution-operations/route.ts `
  tests/unit/packages/api/reads/dashboard-stats.test.ts `
  tests/unit/packages/api/admin/contribution-operations-cache.test.ts
```

The final source/test/config/report formatting check writes [final-format.log](C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d-r12/docs/qa/admin-workspaces-hillclimb/review/round13/runtime/finance-repair/final-format.log); its exit marker records that artifact check independently of the earlier scoped formatting result.

## Repaired source identity

SHA-256 hashes, verified after the final regression run:

| File                                                                  | SHA-256                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/api/src/reads/dashboard-stats.ts`                           | `A8F07FD2B618F4391E0C73482F57CDBA963C0951C82B5AD716A1D45A42597260` |
| `packages/api/src/admin/contribution-operations/route.ts`             | `E0950AC5E345579003A17731F4FBF2A66BA09ECD327CD4BEB9E71C083766A94C` |
| `tests/unit/packages/api/reads/dashboard-stats.test.ts`               | `5CD34EB1811DF0BC7D6F47505B34F157CB5EAC73233D67D947D53DD738E427D4` |
| `tests/unit/packages/api/admin/contribution-operations-cache.test.ts` | `620445EF141A78296EEE48CE29406A0CB1D9825237A2797A3CC6B12063184360` |

Preservation check: the existing `tests/unit/packages/api/admin/contribution-operation-decision-route.test.ts` remains at its initial SHA-256, `51EB196EBFA9BC724AC353D7D2C2824895F539D928F42424D9267D6AECC15985`.

## Remaining limits

- No live Next cache transform, invalidation timing, browser refresh, tenant/session/RLS integration, provider execution, or production-scale behavior was tested. Unit predicates and mocked cache calls are not proof of those systems.
- No full workspace suite, build, CI preflight, deployment, or independent visual/accessibility score was run or claimed.
- Round 13 frozen captures, manifest, and diff still identify the pre-repair checkpoint. They were not updated and must not be used as repaired-source runtime evidence. The prepared README/prototype remains historical; this report and source hashes identify the applied repair.
- Existing short-page/configuration sensitivity, non-transactional pagination across concurrent writes, original stored-status query coverage, and multicurrency/conversion guarantees were not expanded. Existing original-record counts remain intentionally different from Reports' retained-money counts.
- Cache-helper failures remain best-effort under its existing logged-error behavior; the repair does not introduce a new failure/retry or instant-expiration policy.

**Acceptance boundary:** the two reported source defects have targeted red-green repairs and passing related local gates. Full canonical financial parity and live correction freshness still require appropriately authorized runtime evidence; no refreeze or provider verification is implied.
