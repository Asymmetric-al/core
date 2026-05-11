# PR #185 Review - Support Hub phase 1 discovery, file map, and parity map

- URL: https://github.com/Asymmetric-al/core/pull/185
- Base: `epic`
- Head: `cursor/support-hub-phase-1-discovery-1899`
- Draft: no
- GitHub state at review: `DIRTY`, `CHANGES_REQUESTED`
- Size: 112 changed files, +11,982 / -204
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: failed.

Conflict:

- `apps/admin/app/support/page.tsx`

Tests were not run because the PR does not produce a merged tree against current `epic`.

## Verdict

Do not merge. The PR title and some discussion describe a docs-only discovery pack, but the currently fetched PR ref changes runtime Support Hub code across 112 files and conflicts with the current support page.

## Findings

### P1 - Current branch cannot merge into `epic`

Impact: there is no final merged route tree to test.

Suggested fix:

- Rebase onto current `epic`.
- Resolve `apps/admin/app/support/page.tsx`.
- Run `bun install --frozen-lockfile && bun run ci:preflight` after conflict resolution.

### P1 - PR scope is not docs-only at the current ref

Evidence: the current diff includes `apps/admin/features/support-hub/**`, `packages/database/collections/support-hub.ts`, `packages/database/hooks/support-hub.ts`, and Support Hub UI/tests, not only `docs/features/support-hub/*.md`.

Impact: reviewers relying on the title/discussion can miss runtime behavior and shared-package changes.

Suggested fix:

- If this should be docs-only, remove runtime code from the branch.
- If this is now an implementation PR, rename the PR, update the body, and request a fresh runtime review.

### P2 - Bulk actions fire mutations without aggregate handling

Evidence: `apps/admin/features/support-hub/components/table/bulk-actions.tsx` lines 43-87 call `void mutateAsync` in loops for resolved, pending, snooze, and assign.

Impact: partial failures can leave mixed state with no clear feedback.

Suggested fix:

- Use `Promise.allSettled` or a shared bulk helper.
- Show aggregate success/failure to the operator.
- Add a test for partial failure.

### P2 - Composer dirty detection is a brittle JSON string search

Evidence: `use-conversation-composer.ts` lines 268-275 uses `JSON.stringify(content).includes('"text"')`.

Impact: attachment-only or non-text valid content can be treated as empty and blocked from send/save.

Suggested fix:

- Traverse the Tiptap tree for meaningful content.
- Include staged attachments in dirty state if attachment-only sends are allowed.

### P2 - Plain-text message body is rendered through the HTML viewer path

Evidence: `EmailMessage.tsx` lines 155-159 returns `message.body.text` when `body.html` is absent, and the caller passes it to `RichTextViewer`.

Impact: plain text containing markup-like characters is interpreted as HTML by the viewer path. `SafeHtml` sanitizes dangerous HTML, but the text is still not treated as literal text.

Suggested fix:

- When falling back to plain text, escape it or convert line breaks to text-safe paragraphs before passing to the viewer.
- Add tests for text bodies containing `<b>`, `<script>`, and angle brackets.

### P2 - Discovery docs still include wording that can mislead implementation

Evidence: `phase-01-discovery.md` still says "Inbox page is a client component" in the conflict table while later examples show a thin `page.tsx` wrapper. It also has phase and implementation details that must match current repo conventions.

Impact: follow-up implementers can create a route-level client boundary unnecessarily or follow stale phase expectations.

Suggested fix:

- State clearly that `apps/admin/app/support/page.tsx` should be a server wrapper mounting a client Support Hub surface unless there is an explicit reason otherwise.
- Keep the file map aligned to existing repo paths such as `tests/e2e/**`.

### P2 - Runtime support code remains mock/in-memory backed

Evidence: Support Hub data lives in client-side/in-memory TanStack collections under `packages/database/collections/support-hub.ts` and app hooks.

Impact: this may be acceptable for a discovery/prototype phase, but it should not be presented as production-ready support persistence.

Suggested fix:

- Keep docs and UI labels explicit that this is prototype/mock-backed.
- Do not merge as a production Support Hub surface until API/Supabase persistence and RLS are implemented and tested.

## Required Before Merge

- Decide whether this PR is docs-only or runtime implementation.
- Resolve the support page conflict.
- Fix or split the runtime findings if implementation remains.
- Re-run full preflight on the resolved tree.
