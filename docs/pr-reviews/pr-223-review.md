# PR #223 Review - Ai tooling standardization

- URL: https://github.com/Asymmetric-al/core/pull/223
- Base: `main`
- Head: `cursor/ai-tooling-standardization-ee26`
- Draft: no
- GitHub state at review: `BLOCKED`, `CHANGES_REQUESTED`
- Current size: 10,748 changed files, +1,569,283 / -51,983
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/main`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed. Existing non-blocking noise observed across clean PRs includes the `packages/ui/components/shadcn/data-grid/data-grid.tsx` import-order warning and the known admin build warning for `apps/admin/instrumentation.ts`.

## Verdict

Do not merge as-is. The PR includes a committed secret, an auth regression risk, and a scope that is far too large to review or safely ship under the stated OpenSpec intent.

## Findings

### P0 - Committed Nia API key

Evidence: `.nia-sync/home/.nia-sync/config.json` line 2 contains a key-shaped Nia API token. I am deliberately not copying the full value here; it starts with `nk_935`.

Impact: this is credential exposure in the repository. Even if the key was short-lived, it must be treated as compromised.

Suggested fix:

- Revoke and rotate the key immediately.
- Remove `.nia-sync/**` from the PR and repository history for this branch.
- Add `.nia-sync/` to the relevant ignore list.
- Run the repo secret scan before re-requesting review.

### P1 - Role authorization is not enforced for real Supabase sessions

Evidence: `packages/auth/middleware.ts` applies `allowedRoles` only in the E2E bypass path. Real Supabase sessions set `userId`, and the protected-route branch only redirects when there is no `userId` around lines 228-232.

Impact: a signed-in user with the wrong role can pass route protection that appears to be role-aware.

Suggested fix:

- Resolve the authenticated user's role for real Supabase sessions.
- Enforce `allowedRoles` before returning the protected response.
- Add tests for at least one cross-role denial and one allowed-role success path.

### P1 - The PR scope contradicts its OpenSpec proposal and is unreviewable

Evidence: `openspec/changes/modernize-agent-instructions/proposal.md` says files such as `CLAUDE.md`, nested `AGENTS.md`, `.mcp.json`, `.next-docs`, product code, tests, and database code do not change. The diff changes or adds those classes of files plus large vendor/tooling artifacts.

Impact: reviewers cannot trust the proposal as the product/change contract. A million-line tooling diff also hides high-risk changes.

Suggested fix:

- Split the PR into narrowly scoped branches.
- Keep one PR for agent instruction modernization.
- Move generated docs, vendored upstream code, tool caches, and unrelated product/config edits into separate PRs with their own proposals.
- Update OpenSpec to truthfully describe each retained scope.

### P1 - Tool caches and local artifacts are committed

Evidence: tracked artifacts include `.nia-sync/**`, `~/.traycer/yolo_artifacts/*.json`, and `vendor/payload-upstream/**`.

Impact: these files create secret, licensing, reviewability, and churn risks.

Suggested fix:

- Remove generated/local tool state from the PR.
- If any upstream source is intentionally vendored, add an ownership note, license pointer, and update policy.

### P2 - Ignore rules do not protect the new artifact paths

Evidence: `.gitignore` does not cover `.nia-sync` or the root-literal `~/.traycer` artifacts.

Suggested fix:

- Add explicit ignore entries for `.nia-sync/`, `~/.traycer/`, and any other generated local agent state that should never be tracked.

### P2 - `.agent/skills` and `.agents/skills` create ambiguous ownership

Evidence: the diff includes both singular and plural agent-skill paths.

Suggested fix:

- Pick the canonical generated-skill mirror.
- Document which path is source, which path is generated, and which verification command enforces sync.

### P2 - `build:admin:strict` duplicates the non-strict command

Evidence: `package.json` lines 21-22 define `build:admin:strict` with the same behavior as the normal admin build.

Suggested fix:

- Either remove the strict alias or make it enforce the intended stricter behavior.

## Required Before Merge

- Rotate the exposed key.
- Remove tracked local agent state and generated caches.
- Split the PR into reviewable scopes.
- Fix real-session role enforcement.
- Re-run `bun run ci:preflight` on the final, reduced merge tree.
