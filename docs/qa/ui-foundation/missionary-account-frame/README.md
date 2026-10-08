# Missionary account frame — AL-1976

These October 8, 2026 checks exercise the actual Missionary Next.js application
after the account-frame changes. The full development suite passed **9/9 tests**
in **1.2 minutes**, without skips or retries. A supported production
instant-navigation run passed its focused account-links case **1/1**. The full
production diagnostic passed five public presentation cases and failed four
authenticated prerequisites because the existing demo fixture is deliberately
disabled in production. These captures are independent of the historical
`docs/qa/core-ui` material and do not complete OpenSpec task 4.1.

## Source and environment

- Starting `develop` SHA: `c4bc0553546f8b26599bc6dbe08f7aadbef52cc1`.
- Development browser source: that SHA plus the AL-1976 working-tree
  implementation and dedicated browser spec; it had not yet been committed
  when the development tests ran.
- Branch: `fix/AL-1976-missionary-account-frame`.
- Immutable implementation SHA: `a05829c601c0cb74e99bca81788522e5c84a060e`.
  The development browser run preceded a local transition boolean rename from
  `isSigningOut` to `isPending`; that rename changes no session operation,
  presentation state or navigation behavior. The production build uses this
  immutable application implementation plus the test-only instant assertions
  described below. Final source/gate recording is owned separately.
- Final publication SHA: recorded by the PR head and completion handoff; this
  packet is committed with the dedicated production-navigation coverage.
- Development worktree: `/workspace/missionary-account-frame`. The isolated
  worktree was subsequently moved with Git to `/workspace/missionary-frame`;
  the production build and runs used that path on the same branch and SHA.
- Runtime: Linux 6.18.44 x86_64, Node.js 24.19.0, Bun 1.4.2, Next.js 16.4.0,
  React 19.3.0, Playwright 1.64.0, Chromium 156.0.8078.4.
- Application: separate, sequential task-owned Next.js development and
  production servers at `http://localhost:4000`; no listener existed before
  startup. Both were stopped after their runs, and port 4000 was checked free.
- Configuration: `playwright.missionary.config.ts`, project
  `missionary-boneyard`, one worker, separate browser contexts and task-specific
  output `test-results/missionary-account-frame`.
- Production rig: `EXPOSE_TESTING_API=1 VERCEL_ENV=preview`, build ID
  `W7eMrC5-a1eSRduRde2oZ`. The generated required-server-files config retained
  `cacheComponents: true`, `partialPrefetching: true` and
  `exposeTestingApiInProductionBuild: true`. No rendering flag was changed.

The committed `scripts/run-with-ci-env.mjs` supplies the existing non-production
fixture defaults: placeholder Supabase public configuration, skipped local
environment validation and explicit E2E auth bypass. No provider credentials,
hand-written session cookies, auth success mocks, weakened guards or server
delay injections were used. The fixture exercises the actual demo-account and
sign-out handlers and the existing application navigation in development.
Production preserves its existing refusal to enable that fixture; preview
testing API exposure does not override the authentication guard.

## Presentation change

The root layout's existing `MissionaryLayoutShell` previously selected
`AppShell` for account routes, so shared account content inherited the sidebar,
workspace header, footer and padded workspace content frame. A route-group name
did not cancel that ancestor wrapper.

The app-specific selector now returns the existing account children directly
for exact `/login`, `/register`, `/forgot-password` and `/no-access` paths.
Login and registration loading reuse `AuthScreenSkeleton`, which owns its main
landmark. Registration remains invitation-only, and password reset remains
unavailable. `/no-access` has an explicit account-local button using the existing
session-sign-out operation, with pending state and a visible retryable error.
It does not sign out on mount.

The Boneyard frame and workspace shell remain in their existing branches.
Shared auth components, sign-in methods, validated `next` handling, provider
identity, authorization gates and the sibling role-gate arrangement are
unchanged. The default Playwright config excludes this Missionary-only spec
from its Donor projects; the dedicated Missionary config runs it.

## Reproduction commands

The available Bun and matching browser cache were selected explicitly:

```bash
export PATH=/workspace/.tools/missionary-account-frame-bun-1.4.2/node_modules/.bin:$PATH
export PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/missionary-account-frame-playwright-1.64.0
```

Task-owned development server startup, using the current application script:

```bash
node scripts/run-with-ci-env.mjs -- bun run --cwd apps/missionary dev:playwright -- --port 4000 --hostname localhost
```

Final development browser command, reusing only that task-owned server:

```bash
PLAYWRIGHT_REUSE_EXISTING_SERVER=true node scripts/run-with-ci-env.mjs -- bunx playwright test tests/e2e/missionary-account-frame.spec.ts --config=playwright.missionary.config.ts --project=missionary-boneyard --output=test-results/missionary-account-frame --reporter=list
```

Result: **9 passed (1.2m)**. Formatting was also checked with:

```bash
bunx prettier --check tests/e2e/missionary-account-frame.spec.ts
```

Result: **passed**. Earlier draft runs exposed incorrect test assumptions about
the existing Tab order, Next.js route announcer, cold compilation and Boneyard
spacing; the tests were corrected against the real application. The fixture
logout limitation discovered by those runs is retained below.

The production rig used the repository's existing supported build and server:

```bash
EXPOSE_TESTING_API=1 VERCEL_ENV=preview bun run build:missionary
EXPOSE_TESTING_API=1 VERCEL_ENV=preview node scripts/run-with-ci-env.mjs -- bun run --cwd apps/missionary start -- --port 4000 --hostname localhost
```

Build result: **11/11 tasks passed**, including the rebuilt Missionary app;
10 dependency tasks were cached. The focused instant-navigation command was:

```bash
PLAYWRIGHT_REUSE_EXISTING_SERVER=true PLAYWRIGHT_MISSIONARY_BASE_URL=http://localhost:4000 INSTANT_NAV_RIG=1 EXPOSE_TESTING_API=1 VERCEL_ENV=preview node scripts/run-with-ci-env.mjs -- bunx playwright test tests/e2e/missionary-account-frame.spec.ts --config=playwright.missionary.config.ts --project=missionary-boneyard --grep 'account links preserve' --output=test-results/missionary-account-frame-production-lock --reporter=list
```

Result: **1 passed (3.1s)**. The test validates an active testing API by holding
the real `/login` response: the standalone loading status is visible, and the
final Sign In heading is absent until release. It also verifies standalone
password-help content and prefetched invitation-only registration content
during their navigation locks. An earlier trial expected a registration
skeleton under that client navigation lock; the actual app had already
prefetched the completed page, so the assertion was corrected to that supported
behavior. The separate JavaScript-disabled test covers its initial fallback.

The full production diagnostic used the same flags and command, omitted
`--grep`, and wrote to `test-results/missionary-account-frame-production-browser`.
Result: **5 passed, 4 failed (2.2m), exit 1**. Direct desktop/mobile login, both
server fallbacks and account-links/instant checks passed. Protected-return,
mobile workspace, no-access session exit and the authenticated Help portion of
the Boneyard test stopped at their unavailable Demo Access prerequisites.
These failures remain visible; no skips, timeout increases, guard changes or
authentication environment tricks were added.

Ignored local logs are in
`test-results/missionary-account-frame-production/`: `rig-build.log`,
`rig-server.log`, `rig-lock-browser.log` and `rig-browser.log`. The production
server was stopped by SIGINT after the diagnostic, and port 4000 was verified
free. This was a local production build, not a deployment or preview smoke.

## Acceptance evidence

| Scenario                                          | Observed outcome and scope                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anonymous direct `/login`, desktop and mobile     | Passed at 1280×800 and 390×844. Main starts at the viewport origin, spans its width and at least its height, with no horizontal overflow. No workspace header, footer, sidebar wrapper/inset, search or dashboard sign-out control. One exposed main landmark and no nested main.                                                                                                                              |
| Initial server/loading frame                      | Passed in development and production for actual `/login` and `/register` server Suspense fallbacks with JavaScript disabled. Their status and busy main fill the viewport without dashboard chrome. The production instant lock separately held the real login fallback while the final heading was absent, then released it to the sign-in form. Existing placeholder contrast is limited as described below. |
| Registration and password help                    | Real Next.js Link navigation login → password help → login → registration → login passed. Invitation-only registration and the unavailable reset message remain; no registration operation was activated.                                                                                                                                                                                                      |
| Existing successful sign-in and validated return  | The existing Demo Access button POST and router navigation reached `/settings?tab=account` after the proxy preserved that protected deep link. Reload retained fixture access and the normal workspace sidebar/search/sign-out controls. Real password/provider sign-in was not exercised.                                                                                                                     |
| Already-signed-in redirect and access enforcement | Anonymous `/settings?tab=account` redirected to `/login` with the unchanged validated return destination. Real provider-backed signed-in and wrong-role behavior remains unverified; E2E cookies intentionally do not establish a Supabase user for account-screen redirects. Existing auth/gate contract tests are separate evidence.                                                                         |
| Workspace → login → workspace                     | The mobile Base UI sidebar portal and navigation-search dialog opened and closed. Existing header sign-out reached standalone login; Ctrl+K and Ctrl+B produced no stale workspace dialog/sidebar. Demo router navigation restored workspace search and its shortcut. Sign-out's login transition uses the existing full-page redirect; account Links and demo return separately exercise client navigation.   |
| `/no-access` included                             | No sign-out request occurred on mount. An intentionally held failing sign-out request exposed disabled pending state, then a visible alert and enabled retry while retaining fixture access. Retry used the real handler, returned HTTP 200 and reached standalone login. Fixture invalidation and real provider revocation have the limits below.                                                             |
| Boneyard and other routes                         | Real `/boneyard/tasks` retained its capture frame without workspace chrome; existing protected Help-menu navigation reached `/help/about` with normal workspace framing/search. Public policy matching and callback behavior are preserved by the narrow selector and separate source/unit contracts, not claimed as successful provider/callback browser flows.                                               |

The development and production desktop/mobile login checks found **zero axe violations** for `wcag2a`,
`wcag2aa`, `wcag21a` and `wcag21aa`; they exercised the existing Email → Forgot
password link → Password Tab order. The login and mobile workspace flows
reported no monitored hydration mismatch errors. This focused pass is not a
claim of complete WCAG conformance, all-console-error absence or full application
accessibility qualification.

## Safe screenshots

These are byte-identical copies from the final passing development run and the
two passing direct-login cases in the broader production diagnostic. Only PNGs
were copied; traces, videos, cookies and auth state remain outside this evidence
directory. Development captures retain the development tools and issue badges;
the production captures use the separately built application.
The settings identity and Boneyard rows are existing scaffold/fixture data, not
verified business records or activated integrations.

| Capture                                                        | Scope                                                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [Production login desktop](./login-production-desktop.png)     | Standalone shared sign-in from the production build at 1280×800, with visible keyboard focus. Existing production policy hides Demo Access. |
| [Production login mobile](./login-production-mobile.png)       | Standalone production sign-in at 390×844; no development tools or workspace chrome.                                                         |
| [Login desktop](./login-desktop.png)                           | Standalone shared sign-in at a 1280×800 viewport, with visible keyboard focus.                                                              |
| [Login mobile](./login-mobile.png)                             | Standalone shared sign-in at a 390×844 viewport.                                                                                            |
| [Login server fallback](./login-server-fallback.png)           | Real 1280×720 server fallback with JavaScript disabled; nearly uniform background because current skeleton and wrapper colors coincide.     |
| [Registration server fallback](./register-server-fallback.png) | Matching real server fallback with the same existing contrast limit.                                                                        |
| [Protected return](./fixture-protected-return.png)             | Authorized fixture at `/settings?tab=account`, after reload; existing workspace chrome and scaffold settings.                               |
| [Mobile sidebar](./mobile-workspace-sidebar.png)               | Existing Base UI portal open at a 390×844 viewport; full-page capture also includes the underlying dashboard document.                      |
| [No-access failure](./no-access-signout-failure.png)           | Standalone no-access frame with a failed sign-out alert and available retry.                                                                |
| [Boneyard](./boneyard-capture-frame.png)                       | Actual `/boneyard/tasks` capture frame and existing synthetic rows.                                                                         |

PNG SHA-256 hashes:

```text
357d7ab86fe47802e49a8ef48ac0b8a819f6b9bb8383aadf21ed78372dad3d65  login-production-desktop.png
3af902f1237c3b9a51515455a107ddbc9ce89f913a18ca87cadcd0932bdc5f14  login-production-mobile.png
ad9826d8fc58e3580155553cb3e528b6f629bc724bfa95b54b30b4edd86eb561  login-desktop.png
8af99370878d5a8dc30288a0d60771bf068f43e5474ecd42167142d40268e45e  login-mobile.png
36f0c38805c2803fce17ebbffe64a4c7b38041e817ad76287bf3f80608ddc34c  login-server-fallback.png
37b4dbf92039556cadf05795be8a15eebc9665bf7e5774d4ac0e310877fe88f3  register-server-fallback.png
cdf35ec5101581f4b3829fa0f0281c55e49f1177ffcedd0b06fbdeb0943474a3  fixture-protected-return.png
3904a3021df0d51191b61ff3fdb61541a95e027109975988499395378ffaed3c  mobile-workspace-sidebar.png
7ea2ceb8061835c2ab8876af578a116499f568bee199f291ecb7a9838a3c42fc  no-access-signout-failure.png
bbc8687dd37cad3631fe62756e0998befb9f48d93001e1d45e097edaa6cd239f  boneyard-capture-frame.png
```

## Known limits and bounded follow-ups

- **Provider auth:** no authorized live Supabase credentials were available for
  password sign-in, signed-in account redirects, wrong-role provider sessions,
  callback exchange or provider session revocation. The existing middleware
  deliberately checks a real Supabase `user` for authenticated `/login`
  redirects, rather than treating the fixture cookie as one.
- **Existing fixture logout:** `packages/api/src/auth/signout.ts` clears only
  the legacy E2E cookie when bypass is enabled. Demo login uses a per-app cookie,
  so HTTP 200 and the login redirect do not establish fixture invalidation:
  the fixture could reopen `/settings` afterward. This also affects the existing
  header sign-out. No shared authentication change was made to conceal or repair
  this independent fixture defect.
- **Existing loading contrast:** shared `Skeleton` uses `bg-accent`, while
  `AuthScreenSkeleton` uses `bg-muted`. Current shared light and dark tokens give
  those colors the same value. The server captures therefore show the correct
  full-page frame but do not prove visibly contrasted placeholders. No shared
  component or token changes were introduced.
- **Dashboard data:** the existing fixture dashboard API returned HTTP 503.
  These tests qualify its frame/navigation, not provider-backed dashboard data.
  Scaffold identities, settings, disabled integrations and unavailable actions
  were preserved.
- **Production fixture prerequisites:** `packages/auth/e2e-auth.ts` explicitly
  returns false for bypass when `NODE_ENV=production`.
  `packages/api/src/auth/demo-account.ts` also preserves its existing production
  demo enablement and provider requirements. The wrapper's non-production
  fixture therefore cannot establish a production workspace session. Five
  public presentation cases and the focused instant-navigation case passed;
  the four fixture prerequisites failed visibly. Real production authenticated
  navigation and provider-backed sign-out remain unverified.
- **Other public/callback routes:** this checkout has no implemented Missionary
  `/about`, `/workers` or `/checkout` page. `/about` was observed as the existing
  global 404; it was not used to fabricate public application qualification.
  Provider callback success remains unverified. Route-policy and callback
  implementation were left unchanged.

## Local gates and regression evidence

The current `develop` issue reproduced independently: the composed selector
rendered the real dashboard header/sidebar/footer around login loading. The
initial focused regression failed before changing that boundary. Registration's
initial loading regression also failed its one-main/busy-status contract before
replacing the old half-height markup. These are task-specific RED/GREEN results,
not historical screenshots or a test of an isolated LoginScreen.

| Command                                                                                                                                                                                                                                                                                                                                                                                              | Result                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bunx vitest run tests/unit/apps/missionary/missionary-account-frame.test.tsx tests/unit/apps/missionary/no-access-exit.test.tsx tests/unit/apps/missionary/missionary-navigation-search.test.tsx tests/unit/apps/missionary/route-gate-contract.test.ts tests/unit/packages/ui/auth-screen-pending.test.tsx tests/unit/auth packages/auth/auth-screen.test.ts packages/auth/client-session.test.ts` | 24 files, 207 tests passed. Includes existing navigation, redirect/gate and shared auth contracts.                                                                                                                                                                                   |
| `bunx vitest run tests/unit/apps/missionary/missionary-account-frame.test.tsx tests/unit/apps/missionary/no-access-exit.test.tsx tests/unit/apps/missionary/shadscan-header-pending.test.tsx`                                                                                                                                                                                                        | Final transition-name source: 3 files, 20 tests passed.                                                                                                                                                                                                                              |
| `bunx vitest run tests/unit/apps/missionary/missionary-account-frame.test.tsx tests/unit/apps/missionary/no-access-exit.test.tsx tests/unit/playwright-config.test.ts`                                                                                                                                                                                                                               | 3 files, 23 tests passed; default Donor discovery excludes this Missionary-only spec.                                                                                                                                                                                                |
| `bunx turbo run lint typecheck --filter=@asym/missionary-app`                                                                                                                                                                                                                                                                                                                                        | Final source: 12/12 tasks passed. Existing Next Pages-directory lint diagnostic remains.                                                                                                                                                                                             |
| `bun run test:unit`                                                                                                                                                                                                                                                                                                                                                                                  | 873 files passed, 2 existing files skipped; 6,977 tests passed, 4 existing tests skipped. No new skips or coverage claim from Core's custom raw V8 collector.                                                                                                                        |
| `bun run build:missionary`                                                                                                                                                                                                                                                                                                                                                                           | Passed; real app build generated 32 routes, with Cache Components and partial prefetching retained.                                                                                                                                                                                  |
| `bun run verify:shadscan`                                                                                                                                                                                                                                                                                                                                                                            | Passed from the neutral worktree; all 118 classifications/proofs validated. Application scores and floors unchanged.                                                                                                                                                                 |
| `bunx prettier --check` on changed sources and task evidence; `git diff --check`                                                                                                                                                                                                                                                                                                                     | Passed. Repository-wide formatting is also part of final preflight.                                                                                                                                                                                                                  |
| `bun run ci:preflight`                                                                                                                                                                                                                                                                                                                                                                               | Passed every selected stage, including repository-wide lint/typecheck, formatting, OpenSpec/contracts/design-system checks, and 6,977 unit tests with existing skips only. Routine compilation was not requested by the source-only policy; separate Missionary builds above passed. |

The initial focused and full-unit runs used the starting SHA plus the task
diff, before the equivalent transition-name adjustment. The final 20-test run,
scoped lint/typecheck and standard build used the application source committed
as `a05829c601c0cb74e99bca81788522e5c84a060e`. Final preflight used that
implementation plus the production-only browser assertions; subsequent edits
are task documentation. All used Bun 1.4.2 and Node 24.19.0. Initial
scoped lint correctly rejected two obsolete suppressions for the removed loading
classes; only those entries were deleted. Initial hooks/preflight correctly
rejected stale selector proof hashes. The two existing navigation findings were
reviewed against unchanged navigation contracts and only their selector hashes
were refreshed. No classification, fingerprint, finding count, policy or score
floor changed.

The new exit control uses the conventional `isPending` transition name so the
published scanner can recognize its existing pending label/disabled trigger;
no new scanner exception was introduced. The working-tree scanner also treated
`-account` in the original absolute checkout path as personal-field context for
unchanged Admin/UI name fields. A supported `git worktree move` to
`/workspace/missionary-frame` resolved that path-dependent false classification.
The supplied `/workspace/core` checkout was never changed, and no hook was
bypassed. The staged index and neutral working-tree reports both passed.

Read-only shadcn project info from `packages/ui` confirmed exact `base-maia`,
Base UI, Zinc and semantic CSS variables. Shared UI/auth implementations,
providers, sidebar/header/shell, route policy, proxy, callback and sibling role
gate remained unchanged. No broad OpenSpec work was completed.

## Integration and rollback

The task uses `fix/AL-1976-missionary-account-frame` for issue
[#1976](https://github.com/Asymmetric-al/core/issues/1976). Relevant merged PRs
#1972 and #1973 were inspected and preserved. Recent/open collaboration checks
found no overlapping open PR; `origin/develop` remained at the starting SHA.
No Admin/Missionary sidebar, Missionary home feature, Donor dashboard, shared
primitive or user-owned work was staged or overwritten. The small shared-tooling
diff is limited to removing obsolete suppressions, binding existing selector
proofs, and avoiding default Donor test discovery.

Final target/PR publication details are recorded in the PR and completion
handoff. Hosted checks and repository-approved `qa:smoke` are separate from these
local captures; no manual deployment, merge or production operation is implied.
Rollback consists of reverting only the AL-1976 implementation and evidence
commits. No authentication migration, schema or business-data rollback is needed.
