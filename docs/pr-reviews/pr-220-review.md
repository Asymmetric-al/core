# PR #220 Review - Deepen public CMS read/render module

- URL: https://github.com/Asymmetric-al/core/pull/220
- Base: `production`
- Head: `codex/public-cms-read-render-module`
- Draft: yes
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 16 changed files, +1,020 / -305
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 106 test files and 449 tests.

## Verdict

Technically close, but draft status should remain until the fallback/error behavior is clarified.

## Findings

### P2 - Draft PR

Impact: the author has not marked this as merge-ready.

Suggested fix:

- Keep it unmerged until the owner marks ready for review.

### P2 - CMS dependency failure now throws instead of returning not found

Evidence: `apps/donor/app/(public)/[...cmsSlug]/page.tsx` lines 34-36 throw when public page data cannot be loaded.

Impact: a CMS or backing-service outage can become a 500-style page failure rather than a softer `404` or fallback. That may be correct for observability, but it changes public-page failure behavior.

Suggested fix:

- Decide the operational contract:
  - If missing page is expected, use `notFound()`.
  - If dependency outage should page/error, throw but make the error path observable and covered.
- Add a test that distinguishes "page missing" from "CMS dependency failed."

### P2 - Link sanitizer accepts bare relative strings

Evidence: `packages/lib/cms/public-page-renderer.tsx` lines 125-128 allow relative strings that do not start with `/`.

Impact: values like `foo`, `../admin`, or malformed relative values can slip into public rendering. This is not currently an obvious XSS path, but it weakens the URL contract.

Suggested fix:

- Restrict public links to:
  - `/`-rooted local paths,
  - `#` anchors,
  - explicitly allowlisted protocols such as `https:` and `mailto:`.
- Add tests for bare relative strings and protocol edge cases.

## Required Before Merge

- Mark ready for review.
- Confirm and test public CMS outage behavior.
- Harden the URL sanitizer.
- Re-run `ci:preflight` after final changes.
