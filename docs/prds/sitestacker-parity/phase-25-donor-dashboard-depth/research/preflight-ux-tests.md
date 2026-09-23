> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase25 /to-spec preflight — existing donor UX testing seams

9 September 2026. **Read-only seam discovery; no feature/spec drafting, test execution, publication, provider call or source change.** Source worktree `[historical Core checkout]`, HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The five existing dirty setup files remain present and untouched.

## Recommendation to put to the founder

**Use the existing Playwright donor journey harness as the primary acceptance seam: a person enters through the real app, acts through the ordinary UI, and observes the canonical API/source result, including reload, Back and cross-context denial.** Run desktop and mobile variants, automated accessibility scans and manual keyboard/focus/reflow checks through the same product composition. Keep focused owner API/SQL/concurrency, native Auth/provider and document-byte checks only where the browser cannot independently prove the invariant. Those are supporting proof boundaries, not separate competing UX test platforms.

The primary seam is one coherent user journey boundary, **not one giant test file**, and not a single test that exercises all thirty decisions sequentially. Independent deterministic examples may cover each job and its failure/recovery variants. Prefer one shared fixture/context setup and the existing app/API/browser runner over a new mock portal, component showcase, custom E2E framework or new testing service.

For confidence that the implemented integration works, the decisive examples must use the actual owner reads/commands against isolated, deliberately seeded test state. Route-fulfilled responses and demo snapshots remain valuable for deterministic UI failure injection, but they prove only the explicitly substituted layer. A passed demo smoke cannot count as native Auth, real Tenant/PDP/RLS, durable money, delivery or document proof.

The canonical `docs/ai/skills/to-spec/SKILL.md` says to prefer existing/highest seams and **“Check with the user that these seams match their expectations.”** Root owns that single required pre-drafting confirmation. This note does not supply new product questions or draft the resulting spec.

## Existing runner and configuration

<!-- prettier-ignore -->
| Prior art | What is actually available | Consequence for Phase25 |
| --- | --- | --- |
| `playwright.config.ts` | Main committed `@playwright/test` runner, shared global setup, donor app default port3005 and optional admin3030; desktop `chromium`, Pixel5 `mobile-chrome`, plus `chromium-donor` and `chromium-admin` projects. HTML/JSON report and retained failure traces/screenshots/video. | Extend this runner/project policy. Do not confuse app normal donor port3000 with main Playwright's3005. Privacy-safe synthetic accounts/data are needed because failure artifacts can capture page content. |
| `tests/e2e/playwright-shared.ts` | Shared base-URL normalization, worker/reuse policy and dev-server launch. Serial default, CI retries, per-surface boneyard composition. | Reuse the existing lifecycle; do not clone another donor server/config policy. Tests must remain idempotent across retries. |
| `playwright.donor.config.ts` | Thin `defineBoneyardConfig(DONOR_SURFACE)` wrapper, project `donor-boneyard`, normal donor port3000. | This is not the comprehensive donor acceptance project despite its filename. Primary Phase25 acceptance belongs in the main harness. |
| Main `chromium-donor` project | Matches only upload-crop and donor-giving-history; supplies `.auth/donor.json`. Those files are ignored by main desktop/mobile generic projects. | Current giving-history test is **not** covered on mobile merely because the main config declares mobile. Add the justified routing/project coverage within existing config when implementing the new journey; no new harness needed. |
| `tests/e2e/global-setup.ts` | Writes empty auth state when bypass or SKIP_E2E_AUTH is enabled; otherwise logs in through Email/Password when credentials are provided, or writes empty state when missing. | Storage-state file presence is not proof of real login. Current password setup must be adapted/qualified for Q14 link/code/social routes, using the shared Auth owner. Do not call that existing fixture passwordless-auth proof. |
| `playwright.development-smoke.config.ts` and `tests/e2e/development-smoke/helpers.ts` | Deployed donor/admin/missionary smoke with QA credentials entered through visible sign-in; Vercel automation protection bypass is sent in headers. Positive authenticated marker is preferred. | Useful real-deployment entry/return precedent. Keep it read-only on shared development and use isolated fixtures for mutations; do not turn every release test into a production-data operation. |
| `docs/ai/rules/testing.md` | Existing Playwright, Vitest, axe, Web Vitals, Instant Navigation and CI gate conventions. Role/text locators, polling instead of fixed sleeps. | Follow repo scripts and existing guards. An automation library or axe result is not a complete accessibility claim. |

### Bypass and fixture truth

- `scripts/run-with-ci-env.mjs` loads local env files, preserves supplied values, and supplies CI placeholders plus `E2E_AUTH_BYPASS=true` when absent. It is **not** a guarantee that the invoked process uses only placeholders: `.env.local`/environment can contain other configured values. No environment values or secrets were read or printed by this preflight.
- Main `playwright.config.ts` loads root env outside explicit CI-default/Vitest conditions; its local donor server also defaults bypass to true if not explicitly configured. A `:strict` command merely omits the wrapper; it does not by itself prove bypass is disabled. Qualify the exact run profile and explicitly disable bypass for real-Auth evidence.
- `packages/auth/e2e-auth.ts` uses surface-specific signed E2E cookies. The bypass is disabled under production NODE_ENV; real remote datasource use has separate signing/allowlist requirements. These safeguards are implementation facts, not a substitute for exercising native Auth. The README's singular legacy cookie wording is less precise than current source.
- `tests/e2e/helpers/install-demo-session.ts` posts the role to `/api/auth/demo-account` through `page.request`, sharing the browser cookie jar. That is a useful stable helper for demo UI smoke; it is not proof that the person passed a real provider/login/claim flow.
- Donor portal services may return deterministic E2E snapshots when bypass is active and the admin Supabase client is unavailable. `tests/unit/packages/api/donor-portal/auth-ownership.test.ts` explicitly tests that fallback. Nonempty fixtures can therefore appear without a real ledger or target owner projection.
- A missing prerequisite causing `test.skip` is **not a passed required journey**. Qualifying release profiles must identify required examples and fail setup/qualification rather than count a skipped auth/provider/source case as coverage. This is a test-run contract, not permission to remove safe skip behavior from unrelated general smoke.

## Actual browser prior art and limits

<!-- prettier-ignore -->
| Existing spec | Observed assertions | What it does not establish |
| --- | --- | --- |
| `tests/e2e/donor-giving-history.spec.ts` | Installs demo session, opens History, waits for either `giving-history-live` **or** `giving-history-unlinked`. | No exact gift/currency/filter/continuation/export/donor authority result; an unlinked state satisfies it. No current mobile coverage in its dedicated project. |
| `tests/e2e/usability-smoke.spec.ts` | Public home CTA, Sign In UI, demo availability, settings avatar upload controls. | No Q01–Q29 complete self-service tasks; current “Public Avatar” expectation is predecessor copy, not a reason to retain an unapproved public-profile effect. |
| `tests/e2e/donate.spec.ts` | Unauthenticated checkout returns Home without donate request; demo-authenticated path progresses through old form to payment heading. GET `/api/donate` is fulfilled with `publishableKey:null`. | No provider collection, successful gift posting, receipt issuance, ACH state or recurring authorization proof. Existing first/last-name and redirect assertions are old behavior that must be reconciled with the new accepted owner contract, not copied blindly. |
| `tests/e2e/auth-demo-donor.spec.ts` | Demo Access→protected route, reload session persistence; skips if demo endpoint/role unavailable. | Native email link/code/social, exact-target return, represented membership or G01. |
| `tests/e2e/auth-login-screen-donor.spec.ts` | Shared Sign In heading and Sign In or Demo Access button. | No successful authentication or credential/claim safety. |
| `tests/e2e/auth-session-guards.spec.ts` | With configured E2E credentials: login, expected Home, reload, signed-in `/login` redirect and sign-out. | Still the old password journey; skipped when prerequisites missing. Does not prove email-matching native provider-link policy. |
| `tests/e2e/auth-permissions.spec.ts` | Configured real-credential login and protected-route redirection. | Route shape alone does not prove field-level/PDP/RLS isolation or direct API/native bypass denial. |
| `tests/e2e/development-smoke/donor.smoke.spec.ts` | Real visible login when needed, greeting, some giving/impact text, Updates area, optional History navigation. Read-only. | No financial mutations or complete target data assertions. Its mandatory old greeting/summary expectations conflict with Q19's neutral/known-empty allowed state and must be updated to fixture-specific accepted outcomes. |
| `tests/e2e/base-ui-behavior-qa.spec.ts` | Admin shared-component integration: Escape/focus return, tabs, sheet, radio menu state, real route link. | Useful interaction test pattern, **not** authority to model Q17 donor notifications as a menu. It uses demo admin and can skip. |
| `tests/e2e/cms-ministry-updates.spec.ts` | Public homepage responds successfully when CMS integration enabled. | No actual update content, audience, Hide, reader filters or private/public invariance. |
| `tests/e2e/cms-local-happy-path.spec.ts` + `scripts/cms/run-local-e2e.mjs` | Seeded local CMS data checked by actual request responses and visible donor page; expected missing page404; local admin demo route. | Stronger shared browser+API+seed precedent, but exact current P22/P23/P24 source and private donor authorization still need qualification. Its historical forwarded-host fixture is not production host-authority proof. |

## Accessibility and navigation seam

`tests/e2e/accessibility.spec.ts` already uses `@axe-core/playwright` and both generic main desktop/mobile projects. It currently checks **public Home, Login, Register, login form labels, public contrast and public mobile menu semantics**. Most tests filter to serious/critical violations; tag selection includes WCAG2/2.1 subsets, not comprehensive WCAG2.2 or the accepted private account pages. Do not claim the existing suite covers donor dashboard accessibility merely because it runs under donor baseURL.

Extend this same suite/helper pattern to relevant private routes and interaction states, with ordinary semantic assertions in the functional journey specs. Required practical checks include visible Ministry Updates text on phone, name/role/current state, one-vs-many preference summaries, independent switches and announcements, filter Apply/Back, virtualized history continuity, notification Popover versus phone full-page behavior, form errors preserving input, no-JS newsletter submit, fixed-pledge optional navigation, contextual detail return, and rare-feature structural omission. Use shared Base UI behaviors rather than asserting a CSS class or duplicating component keyboard code.

The canonical `docs/ai/skills/accessibility-review/SKILL.md` explicitly requires the manual pass automation cannot prove: Tab/Shift+Tab, Enter/Space and widget arrows, Escape, initial/follow-up focus, containment/return, readable labels, helpers/errors, contrast, zoom/reflow, touch and reduced motion. **Pixel5 emulation is not a physical-device or screen-reader session.** Run the appropriate real manual/AT cases and report their exact coverage; do not add another testing platform or claim conformance from an axe pass.

`tests/e2e/instant-navigation.spec.ts` provides `@next/playwright` `instant()` prior art. It deliberately self-skips without `INSTANT_NAV_RIG=1`; a valid verdict requires a production build with the testing API exposed under the approved preview rig. It currently covers **public donor routes**, not authenticated Phase25. `instant-nav.rig.md` documents the build/start/run profile, `EXPOSE_TESTING_API=1`, `VERCEL_ENV=preview`, and CI server-reuse/admin-exclusion conditions. Extend that existing rig only for navigation-critical private routes with a qualified authenticated test session; never expose the testing API in a real production deployment. Its historical note about demo sessions does not override current source production-NODE_ENV bypass denial.

## Supporting existing API/unit seams

The highest practical browser seam cannot directly prove every revoked Data API path, SQL race, provider lost response or byte-serving range. Keep these focused underneath it rather than forcing all low-level failure injection through a slow UI or inventing a separate product test stack.

<!-- prettier-ignore -->
| Prior-art files | Reusable boundary / evidence limit |
| --- | --- |
| `tests/unit/packages/api/donor-portal/auth-ownership.test.ts` | Calls actual exported route/service functions with mocked Auth and database clients. Useful denied/error response seam. Current donor-role and E2E fallback assertions are predecessor contracts requiring reconciliation, not canonical future authorization. |
| `tests/unit/packages/api/reads/donor-history.test.ts` | Calls actual history reader against mocked thenable query responses, exercises result/error/continuation. Does not run SQL/RLS or prove the new source descriptor. Existing offset/total fields are current behavior, not a reason to reject accepted source-cursor requirements. |
| `tests/unit/packages/api/feed-preferences.test.ts` | Actual route exports with a mocked Supabase client. Useful validation/error/response seam. Must replace obsolete broad donor/global-default semantics with the qualified current owner outcomes; cannot certify tenant safety by inspecting a mocked `.eq`. |
| `tests/unit/auth/client-session.test.ts` | Session/reset behavior with mocked Query client. Useful late-state/disposal guard; actual same-person cross-Tenant/represented-context and epoch behavior still requires target integration and browser proof. |
| `tests/unit/packages/database/donor-feed-posts.test.ts` | Mapping and fetch boundary with synthetic responses; good response/error-format and safe display-value tests. No content/audience grant proof. |
| `tests/unit/apps/donor/donor-dashboard-bootstrap.test.ts` | Focused bootstrap behavior with mocked fetch, useful partial/error outcome precedent. No false-new-donor or aggregate-source authority by itself. |
| `tests/unit/apps/donor/donor-history-tanstack.test.ts` | Static source regex requires a named hook/table and forbids a named virtualization helper. This is an architecture/provenance guard, **not user-visible behavior**. Reconcile it with the new implementation; do not shape Q10 around this incidental regex. |
| `tests/unit/packages/api/donor-portal/billing-boundary.test.ts` | Static source assertion of Stripe Billing Portal usage. Does not prove Q03/Q16/Remove semantics; older default/command ownership is explicitly superseded in final audit. |

Use the existing repository Vitest scripts for these focused tests; do not use raw `bun test`. Real SQL/RLS/grants/concurrency and provider/native Auth/document tests remain with their already owning harnesses, coordinated by the other preflight lanes. In particular, **G01 cannot be cleared by a successful page-only mocked social login.** Real qualified native endpoint coverage is required under the Auth owner, without changing the accepted architecture silently.

## Exact existing command map — discovery only, not run

These scripts were read from current root package.json. Run profiles must be chosen deliberately; the name of a command does not determine whether it used mock data or real Auth.

<!-- prettier-ignore -->
| Command | Current role |
| --- | --- |
| `bun run test:e2e tests/e2e/donor-giving-history.spec.ts --project=chromium-donor` | Exact focused prior-art History smoke under wrapper/default profile. Not target proof as written. |
| `bun run test:e2e tests/e2e/usability-smoke.spec.ts --project=chromium --project=mobile-chrome` | Existing desktop/mobile smoke composition; mostly public/demo. |
| `bun run test:e2e:auth:donor` | Existing demo donor login spec in chromium. |
| `bun run test:a11y` | Existing axe suite through main config. Extend accepted private-route coverage here. |
| `bun run test:a11y:strict` | Same spec without CI-default wrapper; still requires explicit correct real/isolated run environment. |
| `bun run test:e2e:strict tests/e2e/auth-session-guards.spec.ts --project=chromium` | Configured credential/session prior art without wrapper. For real Auth evidence explicitly disable bypass and supply only authorized test-profile configuration through secure injection. |
| `bun run test:e2e:development-smoke:donor` | Existing read-only deployed donor smoke. Requires QA URL/credential injection and header-only Vercel automation bypass when applicable. |
| `bun run test:e2e:cms:local` | Existing isolated seeded CMS integration orchestration; useful app/API/seed pattern, not an automatic Phase25 requirement for unrelated jobs. |
| `bun run test:perf` | Existing Playwright Web Vitals/SSR/cache tests; current public/login scope and measured budgets do not prove new donor workload performance. |
| `bun run test:e2e:smoke` | Bounded develop smoke gate: demo preflight/usability/donate/Support Hub plus upload-crop; not complete Auth/a11y/performance/Phase25 acceptance. |
| `bun run test:unit` | Existing Vitest wrapper (`scripts/verify/unit-tests.mjs`). |
| `bun run check` / `bun run ci:preflight` | Existing code gates; preflight mirrors the documented blocking CI stages, not a claim every browser/provider/SQL test ran. |

For new functional donor specs, use the same root runner and supported desktop/mobile projects; add exact matching/fixture coverage rather than assuming current `chromium-donor` testMatch discovers them. The final implementation task selects the smallest justified committed subset and then applicable broader gates. No commands above were executed in this preflight.

## Spec conventions that affect UX/test writing

- `AGENTS.md` separates intended authority from current source/runtime; preserves exact shared base-maia and business logic ownership; substantive behavior uses TDD at the nearest stable seam. Documentation-only/spec work uses deterministic validation rather than artificial tests.
- `docs/ai/skills/to-spec/SKILL.md` calls for a **long numbered actor/need/benefit User Stories list**, a user-centered Problem/Solution, Implementation Decisions, Testing Decisions, Out of Scope and Further Notes. Its Implementation Decisions section **must not freeze specific file paths or code snippets**. This preflight's paths are prior-art evidence for Testing Decisions, not a proposed implementation file tree.
- `openspec/config.yaml` requires observable durable behavior, preserving still-valid scenarios and covering Tenant, Legal Entity, role/authorization, privacy, money, recovery, accessibility and failure where relevant. `openspec/specs/identity-and-access/spec.md` demonstrates `### Requirement` followed by `#### Scenario` and GIVEN/WHEN/THEN/AND observable outcomes. `openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md` provides existing recurring command/correction scenario prior art; retain the accepted later owner refinements rather than copying its older examples blindly.
- `CONTEXT.md` supplies canonical terminology: Tenant is the organization boundary; Site is its public presentation boundary; Ministry Update is one source concept across surfaces, **not a newsletter, public page body or one-off email**; Ministry Update Engagement is shared, not per-surface reaction truth. Use Campaign commitment versus recurring arrangement consistently with the final route reconciliation. Do not make an implementation artifact such as a React hook, table name or provider status the actor in a user story.
- Trace accepted Q01–Q30 and the final clarification register into independently falsifiable behavior. Positive tasks alone are insufficient: no relevant record, unavailable source, revocation, unknown effect, stale revision, repeated operation, altered scope and honest return should be expressed where the actual journey needs them. Do not write a separate story for each cosmetic token or require another founder choice for settled Maia defaults.
- Use the locally pinned `bun run openspec -- ...` workflow and strict structural validation when drafting is authorized. No new testing service, dependency installation, broad component test platform or speculative all-provider matrix is implied by selecting the primary seam.

**Preflight conclusion:** the highest useful seam exists and should be extended. Current tests demonstrate runner/fixture and selected behavior patterns, but the complete target donor acceptance coverage must be written against qualified owner behavior. Confirm this one primary-seam-plus-supporting-owner-proof approach before spec drafting, exactly as the invoked skill requires.
