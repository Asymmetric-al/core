# PR #190 Review - Support Hub Phase 5 productivity, internal collaboration, and fast actions

- URL: https://github.com/Asymmetric-al/core/pull/190
- Base: `production`
- Head: `cursor/support-hub-phase-5-productivity-1899`
- Draft: no
- GitHub state at review: `DIRTY`, `CHANGES_REQUESTED`
- Size: 304 changed files, +32,079 / -281
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: failed.

Conflict:

- `apps/admin/app/support/page.tsx`

Tests were not run because the PR does not produce a merged tree against current `production`.

## Verdict

Do not merge. There is a merge conflict plus real support workflow correctness/security issues around macro attribution and canned-response behavior.

## Findings

### P1 - Current branch cannot merge into `production`

Impact: the final Support Hub page composition cannot be reviewed or tested until the conflict is resolved.

Suggested fix:

- Rebase onto current `production`.
- Resolve `apps/admin/app/support/page.tsx`.
- Run `bun install --frozen-lockfile && bun run ci:preflight` on the resolved merge tree.

### P1 - Server macro route trusts `authorAgentId` from the request body

Evidence: `apps/admin/app/api/admin/support/conversations/[id]/run-macro/route.ts` validates `authorAgentId` from JSON lines 9-13 and passes the body to `runSupportMacroOnServer` at line 29. `runSupportMacroOnServer` then uses `input.authorAgentId` for private-note attribution around lines 107-112.

Impact: a signed-in support user can spoof another agent as the author of macro-created notes/activity unless another layer proves the id matches the authenticated user.

Suggested fix:

- Change `withSupportHubAccess` to pass the authenticated context to handlers.
- Resolve the current user's support agent id server-side from `auth.userId` and tenant.
- Ignore or reject client-supplied `authorAgentId`.
- Add an API test proving a mismatched author id cannot be used.

### P1 - Macros with `send_canned_response` silently no-op in some entry points

Evidence: `runSupportMacro` calls `onCannedResponseInsert?.(...)` around lines 210-228 and still records success. `SupportCommandPalette.handleRunMacro` calls `runMacro.mutateAsync` around lines 176-188 without passing `onCannedResponseInsert`.

Impact: the same macro can update labels/status/snooze and log that a canned response was inserted, while no response text is staged for the agent.

Suggested fix:

- Make `onCannedResponseInsert` required for macros containing `send_canned_response`, or
- Prevent those macros from running from entry points that cannot insert into the composer.
- Add tests for composer, header, and command-palette macro parity.

### P2 - Documented shortcut surface is partially unwired

Evidence: `lib/keymap.ts` defines actions such as `switchToReply`, `switchToNote`, `openAssigneeMenu`, `openLabelsMenu`, and `openMacrosMenu`. `SupportInbox.tsx` lines 126-136 wires only palette open, next/previous, resolve, snooze, and close.

Impact: docs and shortcut hints can advertise actions that do nothing at runtime.

Suggested fix:

- Wire the missing handlers through selected-conversation/detail state, or
- Remove those shortcuts from keymap/docs/hints until they exist.

### P2 - Bulk non-label actions are fire-and-forget loops

Evidence: `components/table/bulk-actions.tsx` lines 120-164 call `void mutateAsync` in loops for status, snooze, and assign, while label actions use `Promise.all` and error handling.

Impact: partial failures can leave a mixed state with no aggregate success/error feedback.

Suggested fix:

- Use `Promise.allSettled` or `Promise.all` with aggregate handling for every bulk action.
- Report partial success/failure clearly.
- Add unit coverage for one failed row.

### P2 - Dirty check is a brittle string search

Evidence: `use-conversation-composer.ts` uses `JSON.stringify(content).includes('"text"')` to decide if the payload is dirty.

Impact: non-text content such as attachments or valid non-text nodes can be misclassified as empty.

Suggested fix:

- Traverse the Tiptap document and detect meaningful text/leaf nodes explicitly.
- Include attachment state in the dirty calculation where sending attachments without text is supported.

### P2 - `@base-ui/react` version drift widens blast radius

Evidence: PR-thread review notes that `@base-ui/react` drifted from the base version.

Impact: broad shared UI dependency changes are unrelated to Support Hub productivity and can create cross-app regressions.

Suggested fix:

- Restore the base version unless the PR intentionally requires the change.
- If required, document why and run shared UI smoke checks.

## Required Before Merge

- Resolve merge conflict.
- Fix server-side macro author attribution.
- Make canned-response macro behavior consistent across entry points.
- Align shortcut claims with runtime handlers.
- Normalize bulk action error handling.
- Re-run full preflight and targeted Support Hub interaction checks.
