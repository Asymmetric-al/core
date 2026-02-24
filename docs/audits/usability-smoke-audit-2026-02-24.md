# Usability + Smoke Audit — 2026-02-24

## Scope

This audit covered donor/public, auth, CMS public integration, and critical media upload UX paths using Playwright + Vitest + CI parity gates.

## Test commands executed

1. `bunx playwright test tests/e2e/usability-smoke.spec.ts`
2. `bun run test:e2e`
3. `bun run test:a11y`
4. `bun run test:perf`
5. `VERIFY_E2E_PROJECTS=all bun run verify:e2e`
6. `SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key bun run gate:ci`

## Results summary

- **Usability smoke suite:** 12/12 passed
- **Non-perf E2E suite (`test:e2e`):** 34 passed, 24 skipped, 0 failed
- **A11y suite (`test:a11y`):** 10/10 passed
- **Perf suite (`test:perf`):** 12/12 passed
- **Structured E2E verification (`verify:e2e`):** `ok: true`
- **Full CI parity gate (`gate:ci`):** passed

## Findings (issues + future risks)

### 1) E2E coverage has high-value gaps in critical business flows (medium)

- `tests/e2e/donate.spec.ts` is still minimal and includes a TODO, with no end-to-end payment path coverage.
- `tests/e2e/cms-publish-flow.spec.ts` and `tests/e2e/cms-tenant-isolation.spec.ts` currently validate auth/redirect guards, but do not yet assert true authoring publish lifecycle with tenant boundary data fixtures.

**Risk:** regressions in money movement and content publishing could pass CI undetected.

**Recommendation:** add seeded, deterministic E2E happy-path + failure-path specs for donation intent creation/confirmation and CMS draft→publish→public render per tenant.

---

### 2) Accessibility threshold policy allows residual contrast debt (medium)

- `tests/e2e/accessibility.spec.ts` permits up to 3 contrast violations:
  - `expect(contrastViolations.length).toBeLessThanOrEqual(3)`

**Risk:** prevents strict conformance and can normalize unresolved accessibility defects over time.

**Recommendation:** tighten threshold to zero over phased milestones (e.g., <=3 -> <=1 -> 0), with explicit tracked exceptions.

---

### 3) Performance assertions are partially observational, not fully gating (medium)

- `tests/e2e/performance.spec.ts` logs asset cache headers but does not fail if no cacheable assets are observed.
- TTFB is only asserted for homepage in perf tests; other critical routes are measured but not consistently budget-gated.

**Risk:** performance drift can occur without causing CI failures.

**Recommendation:** convert log-only checks into strict assertions (minimum cacheable asset count, route-specific TTFB budgets).

---

### 4) Environment dependency noise in integrated local runs (low)

- During broader E2E runs, admin server occasionally logs:
  - `cannot connect to Postgres: connect ECONNREFUSED 127.0.0.1:54322`
  - unhandled rejection logs
- Current tests still pass, but signal noisy runtime dependencies.

**Risk:** noisy logs can mask real regressions and reduce confidence in CI signal quality.

**Recommendation:** introduce explicit local test Postgres bootstrap for admin-dependent E2E runs, or separate donor-only and admin-dependent E2E profiles.

---

### 5) Skipped-test ratio is non-trivial (low/medium)

- `test:e2e` currently skips 24 tests when demo-auth prerequisites are unavailable.

**Risk:** silently reduced coverage in environments without seeded demo credentials.

**Recommendation:** add CI preflight checks that fail fast when required demo auth fixtures are missing for suites intended to be blocking.

## Net assessment

- **Current quality state:** stable for smoke, auth guardrails, and baseline UX flows.
- **Top priorities next:** close money-flow and publish-flow E2E gaps, tighten accessibility/performance policies from advisory to enforcing gates.
