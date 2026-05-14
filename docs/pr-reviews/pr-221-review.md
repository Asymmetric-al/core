# PR #221 Review - Deepen auth client session module

- URL: https://github.com/Asymmetric-al/core/pull/221
- Base: `epic`
- Head: `codex/auth-client-session-module`
- Draft: no
- GitHub state at review: `DIRTY`, `REVIEW_REQUIRED`
- Size: 14 changed files, +531 / -211
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: failed.

Conflict:

- `docs/ai/working-set.md`

Tests were not run because the requested "test before moving on" gate requires a merged tree, and the PR currently cannot produce one without conflict resolution.

GitHub checks on the PR head were green, but those do not cover the current merge result.

## Verdict

Do not merge until the conflict is resolved and the auth behavior change is explicitly accepted.

## Findings

### P1 - Current branch cannot merge into `epic`

Impact: the merge conflict blocks local verification and makes the final diff unknown.

Suggested fix:

- Rebase or merge current `epic`.
- Resolve `docs/ai/working-set.md` without dropping current task context.
- Re-run `bun install --frozen-lockfile && bun run ci:preflight` after resolving.

### P1 - Sign-out semantics changed to local-only sessions

Evidence: server/client sign-out code now uses `scope: "local"`.

Impact: sign-out no longer necessarily invalidates other active sessions. That may be correct, but it is a security/product behavior change and should not be hidden inside a session-module cleanup.

Suggested fix:

- Confirm the desired product behavior: current-device only or all devices.
- If all-device sign-out is expected, restore the global/default behavior.
- If local-only is expected, document it in the auth module and add tests that make the scope intentional.

### P2 - Sign-out test asserts source text instead of behavior

Evidence: `tests/unit/auth/signout-handler.test.ts` lines 23-25 read `packages/api/src/auth/signout.ts` and assert a string.

Impact: the test can pass while behavior changes through a wrapper or fail on harmless refactors.

Suggested fix:

- Mock the Supabase client and assert that `signOut` receives the intended options.

### P2 - Signed-out state is dispatched from multiple places

Evidence: `packages/lib/mission-control/context.tsx` updates state both from the auth subscription callback and explicit `signOut`.

Impact: duplicated ownership increases race and flicker risk.

Suggested fix:

- Let the auth-state subscription own session state changes, or centralize explicit dispatch behind one helper.

### P2 - `subscribeToClientAuthState` accepts multiple parameter shapes

Evidence: the helper accepts either a Supabase client or an options object and uses structural runtime guards.

Impact: this makes a low-level auth helper harder to reason about and test.

Suggested fix:

- Prefer a single options object shape and update call sites.

## Required Before Merge

- Resolve conflict.
- Decide and document sign-out scope.
- Replace the source-reading test with behavioral coverage.
- Run full `ci:preflight` on the resolved merge tree.
