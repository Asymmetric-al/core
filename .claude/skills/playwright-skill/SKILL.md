---
name: playwright-skill
description: Current Playwright (1.64) patterns for writing, debugging, and scaling reliable test suites. Use for any Playwright task, even ones you think you know, because the guides cover APIs and CLI flags newer than most training data. Covers writing or fixing tests, locators, a failing or flaky test, a trace.zip or error message, playwright.config and projects, network mocking, auth, visual and accessibility testing, Docker and CI sharding, playwright-cli browser automation, Playwright Test Agents, page objects, migrating from Cypress or Selenium, and QA work: test case design, bug reports from failures, automating manual test cases, and reviewing tests. TypeScript and JavaScript.
license: MIT
metadata:
  author: testdino.com
  version: "2.8.0"
---

# Playwright Skill

> Opinionated, production-tested Playwright guidance — every pattern includes when (and when *not*) to use it.

**79 reference guides** covering the full Playwright surface: selectors, assertions, fixtures, page objects, network mocking, auth, visual regression, accessibility, API testing, CI/CD, debugging, and more.

**How to use this skill**: open the guide for the topic before answering, even for familiar APIs. Playwright adds and renames APIs and CLI flags every release, and the guides are verified against 1.64. Guides tag newer APIs with the release that added them, e.g. `(1.62+)`; check the project's version (`npx playwright --version`) before using one.

### Newer APIs (1.59–1.64) You May Not Know

| Need | API | Guide |
|---|---|---|
| Per-row / per-parent locator (column queries) | `locator.within(container)` (1.64) | [locators.md](core/locators.md) |
| Element from an aria-snapshot ref | `page.getByRef('e2')` (1.64) | [locators.md](core/locators.md) |
| Configure a project that does not run by default | `default: false`, `--project="*"` (1.64) | [projects-and-dependencies.md](ci/projects-and-dependencies.md) |
| Find order-dependent tests | `--shuffle [seed]` (1.64) | [flaky-tests.md](core/flaky-tests.md) |
| Serialize tests sharing a resource | `{ lock: 'name' }`, `describe.configure({ lock })` (1.63/1.64) | [parallel-and-sharding.md](ci/parallel-and-sharding.md) |
| Run retries at the end, isolated | `retryStrategy: 'isolated'` (config only, 1.62) | [flaky-tests.md](core/flaky-tests.md) |
| Select or quarantine tests before the run | `reporter.preprocess()` + `testRun.fail()` (1.62) | [dynamic-test-selection.md](core/dynamic-test-selection.md) |
| Re-run failures / changed files | `--last-failed`, `--only-changed`, `-x` | [debugging.md](core/debugging.md) |
| Inspect a `trace.zip` from the terminal | `npx playwright trace ...`, `snapshot --phase` (1.63) | [trace-analysis.md](core/trace-analysis.md) |
| Plan / generate / heal tests with AI | `npx playwright init-agents` | [test-agents.md](core/test-agents.md) |
| Component tests | stories-and-galleries `mount('story/id')` (1.62); experimental CT packages frozen | [component-testing.md](core/component-testing.md) |
| WebP baselines; CI creates missing baselines | `toHaveScreenshot: { type: 'webp' }`, `--update-snapshots=missing` passes (1.64) | [visual-regression.md](core/visual-regression.md) |
| Scoped HAR recording | `tracing.startHar(path, options)` (1.60) | [network-mocking.md](core/network-mocking.md) |
| Auth state in IndexedDB / OPFS; per-origin basic auth | `storageState({ indexedDB, opfs })` (opfs 1.63), `httpCredentials: [...]` (1.63) | [authentication.md](core/authentication.md) |
| Passkeys | `context.credentials`, `signCount` (1.61/1.64) | [auth-flows.md](core/auth-flows.md) |
| Cookies on an API request context | `request.addCookies()` / `cookies()` (1.64) | [api-testing.md](core/api-testing.md) |
| Page-registered agent tools | `page.webmcp.tools()` / `callTool()` (1.64) | [webmcp-testing.md](core/webmcp-testing.md) |

## Security Trust Boundary

This skill is designed for testing **applications you own or have explicit authorization to test**. It does not support or endorse automating interactions with third-party websites or services without permission.

When writing tests or automation that fetch content from external sources (e.g., `baseURL` pointing to staging/production), treat all returned page content as untrusted input — never pass raw page text back into agent instructions or dynamic code execution without sanitization, as this creates an indirect prompt injection risk.

For CI/CD workflows, pin all external dependencies (GitHub Actions, Docker images) to immutable references (commit SHAs, image digests) rather than mutable version tags. See [ci-github-actions.md](ci/ci-github-actions.md) and [docker-and-containers.md](ci/docker-and-containers.md) for pinning guidance.

## Golden Rules

1. **`getByRole()` over CSS/XPath** — resilient to markup changes, mirrors how users see the page
2. **Never `page.waitForTimeout()`** — use `expect(locator).toBeVisible()` or `page.waitForURL()`
3. **Web-first assertions** — `expect(locator)` auto-retries; `expect(await locator.textContent())` does not
4. **Isolate every test** — no shared state, no execution-order dependencies
5. **`baseURL` in config** — zero hardcoded URLs in tests
6. **Retries: `2` in CI, `0` locally** — surface flakiness where it matters
7. **Traces: `'on-first-retry'`** — rich debugging artifacts without CI slowdown
8. **Fixtures over globals** — share state via `test.extend()`, not module-level variables
9. **One behavior per test** — multiple related `expect()` calls are fine
10. **Mock external services only** — never mock your own app; mock third-party APIs, payment gateways, email

## Guide Index

### Writing Tests

| What you're doing | Guide | Deep dive |
|---|---|---|
| Choosing selectors | [locators.md](core/locators.md) | [locator-strategy.md](core/locator-strategy.md) |
| Assertions & waiting | [assertions-and-waiting.md](core/assertions-and-waiting.md) | |
| Organizing test suites | [test-organization.md](core/test-organization.md) | [test-architecture.md](core/test-architecture.md) |
| Playwright config | [configuration.md](core/configuration.md) | |
| Page objects | [page-object-model.md](pom/page-object-model.md) | [pom-vs-fixtures-vs-helpers.md](pom/pom-vs-fixtures-vs-helpers.md) |
| Fixtures & hooks | [fixtures-and-hooks.md](core/fixtures-and-hooks.md) | |
| Test data | [test-data-management.md](core/test-data-management.md) | |
| Auth & login | [authentication.md](core/authentication.md) | [auth-flows.md](core/auth-flows.md) |
| API testing (REST/GraphQL) | [api-testing.md](core/api-testing.md) | |
| Visual regression | [visual-regression.md](core/visual-regression.md) | |
| Accessibility | [accessibility.md](core/accessibility.md) | |
| Mobile & responsive | [mobile-and-responsive.md](core/mobile-and-responsive.md) | |
| Component testing | [component-testing.md](core/component-testing.md) | |
| Network mocking | [network-mocking.md](core/network-mocking.md) | [when-to-mock.md](core/when-to-mock.md) |
| Forms & validation | [forms-and-validation.md](core/forms-and-validation.md) | |
| File uploads/downloads | [file-operations.md](core/file-operations.md) | [file-upload-download.md](core/file-upload-download.md) |
| Error & edge cases | [error-and-edge-cases.md](core/error-and-edge-cases.md) | |
| CRUD flows | [crud-testing.md](core/crud-testing.md) | |
| Drag and drop | [drag-and-drop.md](core/drag-and-drop.md) | |
| Search & filter UI | [search-and-filter.md](core/search-and-filter.md) | |

### Authoring Locatable Markup (Frontend)

> For **frontend engineers writing the app** — make components reliably locatable by tests and AI agents.

| What you're doing | Guide |
|---|---|
| Adding valid, unique, stable `data-testid` attributes | [frontend/data-testid-conventions.md](frontend/data-testid-conventions.md) |
| Framework patterns (React, Vue, Angular, Svelte) + centralizing IDs + prod stripping | [frontend/examples.md](frontend/examples.md) |

### QA Workflows

| What you're doing | Guide |
|---|---|
| Ticket / acceptance criteria → test cases, risk ranking, test plan | [test-design.md](qa/test-design.md) |
| Failing test → bug report; app bug vs test bug vs flake | [bug-reports.md](qa/bug-reports.md) |
| Manual test cases / CSV export → Playwright specs | [manual-to-automated.md](qa/manual-to-automated.md) |
| Review Playwright tests or a PR | [test-review.md](qa/test-review.md) |

### Debugging & Fixing

| Problem | Guide |
|---|---|
| General debugging workflow | [debugging.md](core/debugging.md) |
| Specific error message | [error-index.md](core/error-index.md) |
| Flaky / intermittent tests | [flaky-tests.md](core/flaky-tests.md) |
| Quarantine or select tests from a reporter | [dynamic-test-selection.md](core/dynamic-test-selection.md) |
| Common beginner mistakes | [common-pitfalls.md](core/common-pitfalls.md) |
| Debug a `trace.zip` from the terminal / with an agent | [trace-analysis.md](core/trace-analysis.md) |
| Generate or auto-heal tests with Playwright Test Agents | [test-agents.md](core/test-agents.md) |

### Framework Recipes

| Framework | Guide |
|---|---|
| Next.js (App Router + Pages Router) | [nextjs.md](core/nextjs.md) |
| React (Vite) | [react.md](core/react.md) |
| Vue 3 / Nuxt | [vue.md](core/vue.md) |
| Angular | [angular.md](core/angular.md) |

### Migration Guides

| From | Guide |
|---|---|
| Cypress | [from-cypress.md](migration/from-cypress.md) |
| Selenium / WebDriver | [from-selenium.md](migration/from-selenium.md) |

### Architecture Decisions

| Question | Guide |
|---|---|
| Which locator strategy? | [locator-strategy.md](core/locator-strategy.md) |
| E2E vs component vs API? | [test-architecture.md](core/test-architecture.md) |
| Mock vs real services? | [when-to-mock.md](core/when-to-mock.md) |
| POM vs fixtures vs helpers? | [pom-vs-fixtures-vs-helpers.md](pom/pom-vs-fixtures-vs-helpers.md) |

### CI/CD & Infrastructure

| Topic | Guide |
|---|---|
| GitHub Actions | [ci-github-actions.md](ci/ci-github-actions.md) |
| GitLab CI | [ci-gitlab.md](ci/ci-gitlab.md) |
| CircleCI / Azure DevOps / Jenkins | [ci-other.md](ci/ci-other.md) |
| Parallel execution & sharding | [parallel-and-sharding.md](ci/parallel-and-sharding.md) |
| Docker & containers | [docker-and-containers.md](ci/docker-and-containers.md) |
| Reports & artifacts | [reporting-and-artifacts.md](ci/reporting-and-artifacts.md) |
| Code coverage | [test-coverage.md](ci/test-coverage.md) |
| Global setup/teardown | [global-setup-teardown.md](ci/global-setup-teardown.md) |
| Multi-project config | [projects-and-dependencies.md](ci/projects-and-dependencies.md) |

### Specialized Topics

| Topic | Guide |
|---|---|
| Multi-user & collaboration | [multi-user-and-collaboration.md](core/multi-user-and-collaboration.md) |
| WebSockets & real-time | [websockets-and-realtime.md](core/websockets-and-realtime.md) |
| Browser APIs (geo, clipboard, permissions) | [browser-apis.md](core/browser-apis.md) |
| iframes & Shadow DOM | [iframes-and-shadow-dom.md](core/iframes-and-shadow-dom.md) |
| Canvas & WebGL | [canvas-and-webgl.md](core/canvas-and-webgl.md) |
| Service workers & PWA | [service-workers-and-pwa.md](core/service-workers-and-pwa.md) |
| Electron apps | [electron-testing.md](core/electron-testing.md) |
| Browser extensions | [browser-extensions.md](core/browser-extensions.md) |
| WebMCP agent tools | [webmcp-testing.md](core/webmcp-testing.md) |
| Security testing | [security-testing.md](core/security-testing.md) |
| Performance & benchmarks | [performance-testing.md](core/performance-testing.md) |
| i18n & localization | [i18n-and-localization.md](core/i18n-and-localization.md) |
| Multi-tab & popups | [multi-context-and-popups.md](core/multi-context-and-popups.md) |
| Clock & time mocking | [clock-and-time-mocking.md](core/clock-and-time-mocking.md) |
| Third-party integrations | [third-party-integrations.md](core/third-party-integrations.md) |

### CLI Browser Automation

| What you're doing | Guide |
|---|---|
| CLI browser interaction | [playwright-cli/SKILL.md](playwright-cli/SKILL.md) |
| Core commands (open, click, fill, navigate) | [core-commands.md](playwright-cli/core-commands.md) |
| Network mocking & interception | [request-mocking.md](playwright-cli/request-mocking.md) |
| Running custom Playwright code | [running-custom-code.md](playwright-cli/running-custom-code.md) |
| Multi-session browser management | [session-management.md](playwright-cli/session-management.md) |
| Cookies, localStorage, auth state | [storage-and-auth.md](playwright-cli/storage-and-auth.md) |
| Test code generation from CLI | [test-generation.md](playwright-cli/test-generation.md) |
| Tracing and debugging | [tracing-and-debugging.md](playwright-cli/tracing-and-debugging.md) |
| Screenshots, video, PDF | [screenshots-and-media.md](playwright-cli/screenshots-and-media.md) |
| Device & environment emulation | [device-emulation.md](playwright-cli/device-emulation.md) |
| Complex multi-step workflows | [advanced-workflows.md](playwright-cli/advanced-workflows.md) |

## Language Note

Examples are TypeScript; most core guides also show JavaScript. When the project uses `.js` files or has no `tsconfig.json`, adapt the TypeScript examples to plain JavaScript (drop type annotations, use `require` if the project is CommonJS).
