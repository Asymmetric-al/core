# Shadscan Readiness Implementation Plan

> **For implementation:** Use Core's canonical TDD, accessibility-review and
> Vitest skills. The user has authorized execution in this session. Provider-
> specific execution adapters do not replace the repository workflow.

**Goal:** Implement all researched Shadscan recommendations under AL-1931 with
complete application coverage, honest regression gates, confirmed UI repairs,
verified scanner classifications, and current-head delivery evidence.

**Architecture:** One root-owned audit entrypoint uses a locked published CLI
and validates complete raw reports. Apps keep independent floors; libraries and
verified limitations stay visible. UI fixes use existing shared primitives and
role/navigation contracts with behavior tests and offline browser verification.

**Tech Stack:** Bun 1.4, Node 24, Shadscan 0.17.0, Next 16.3.6, React 19, Base UI,
Vitest 4, Playwright and axe.

---

## Task 1: Audit gate

Files: root `package.json`, `bun.lock`, `.husky/pre-commit`,
`.github/workflows/shadscan.yml`, `scripts/verify/shadscan*.mjs`,
`tests/unit/scripts/shadscan*.test.ts`, and an audit contract JSON under tooling.

1. Write fixture-driven RED cases for unknown engine/schema, null score,
   incomplete/truncated apps, individual score regressions and stale evidence.
2. Implement the narrow shared gate using the installed CLI and argument arrays.
3. Verify raw reports are retained and shared-library findings remain separate.
4. Run focused script tests and the actual full workspace audit.
5. Capture final per-app floors after all UI remediation is integrated.

Public gate expectation:

```ts
expect(() =>
  validateReport({ ...completeReport, workspace: partialWorkspace }),
).toThrow(/coverage/);
expect(() =>
  validateFloors({ admin: 34, donor: 80, missionary: 80 }, floors),
).toThrow(/admin/);
```

## Task 2: Shared and donor/missionary accessibility

Files: shared FilterBar, floating data-table actions, auth cards, comments dialog,
navbar, ActivityDialog, ChartCard; donor map/history/FAQ/settings/public image;
missionary profile form/header/task actions; their existing or focused tests.

1. Express each real defect with a rendered role/name, deferred-pending or focus test.
2. Add stable names independent of mobile visibility, associate labels/errors,
   expose material status and await asynchronous signout.
3. Use shared `buttonVariants` on anchors and shared Sheet for modal ownership.
4. Keep existing successful Base UI context/prop labels and intentional role gates.
5. Verify desktop/mobile keyboard paths and axe in the offline compliance fixture.

Expected behavior examples:

```tsx
<Input aria-label="Search" value={search.value} onChange={onSearchChange} />
<Link href={profileHref} className={buttonVariants()}>View Profile</Link>
<p role="alert">{error}</p>
```

## Task 3: Admin accessibility and navigation search

Files: flagged admin Eve, contribution, CRM, feed, event and email controls;
CMS flow fallback components; Mission Control search composition; focused tests.

1. Verify each flagged control against its existing shared component context.
2. Fix confirmed names, group labels, field descriptions, live status and pending UI.
3. Provide visible CMS create/gallery loading feedback without streaming the
   authenticated preview or changing redirect-only siblings.
4. Replace Mission Control's advertised demo navigation entries with permitted
   current route commands; guard Cmd/Ctrl+K and preserve focused Support behavior.
5. Test role filtering, keyboard invocation/navigation, focus restoration and
   loading/error/pending behavior at existing public seams.

## Task 4: Evidence and product choices

Files: `docs/ci.md`, scoped audit guide, this plan and the active OpenSpec change;
audit classification JSON/tests.

1. Reconcile the initial 63 scored app failures and all 70 scored library failures
   with current source, including the 19 initial shared UI library failures.
2. Keep raw findings visible; record precise scanner limitations with executable
   positive and negative guards, never whole-rule acceptance.
3. Record forced-light, private noindex, scoped Support shortcut, global MC search
   and optional public-app command-menu decisions from current accepted context.
4. Re-scan after fixes to reveal further actionable evidence and ratchet floors.

## Task 5: Final verification and delivery

1. Run each focused Vitest file with `--maxWorkers=2`; preserve RED/GREEN logs.
2. Run offline browser fixture projects and relevant application regression checks.
3. Run `bun run verify:openspec-deltas`, strict change validation, appropriate
   verifiers, React Doctor and `bun run ci:preflight -- --full`.
4. Review final diff/history and preserve original root environment hash/checkout.
5. Commit with normal hooks, push with normal pre-push gate, create a `develop` PR
   referencing AL-1931, attach it, apply `qa:smoke`, and verify its exact-head
   required checks and preview result.
6. Perform independent code/guardian review and a requirement-by-requirement
   completion audit. Do not claim raw scanner failures are all product defects
   or claim rendered/production coverage that was not exercised.
