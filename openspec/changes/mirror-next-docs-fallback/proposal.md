# Mirror the Next.js fallback docs from the installed release

## Why

Root `AGENTS.md` sends agents to `.next-docs/` whenever dependencies are not
installed, which is how every new worktree starts. The fallback was last
regenerated on 2026-10-07 and had drifted from the pinned `next@16.4.2`: 40 of
its pages differed from the bundled docs and two were missing. The stale
`error` reference typed the thrown value as `Error`, and the stale
`cacheComponents` reference omitted the instruction to remove
`runtime = 'nodejs'`.

The documented regeneration command used `@next/codemod@canary`, a moving
release tag that also writes a compressed index into `AGENTS.md`. Nothing
detected the drift.

## What Changes

- Add `scripts/sync-next-docs.mjs`. It mirrors the docs bundled with the
  installed `next` package into `.next-docs/`, checks by default and writes
  only with `--write`.
- Refresh `.next-docs/` to `next@16.4.2`: 40 pages updated, 2 added, none
  removed.
- Add a unit test that fails when the committed fallback differs from the
  installed package, so a Next.js version change cannot leave it behind.
- Replace the floating-tag procedure in `docs/ai/protected-paths.md` and
  `docs/AI_AGENT_PLAYBOOK.md`.

## Non-goals

- No Next.js version change and no application code change.
- The managed opening block in `AGENTS.md` and the installed-docs-first rule
  are unchanged.

## Impact

Affected capability: `agent-instruction-system`. The change touches vendored
framework documentation, one maintenance script, one unit test and two
procedure documents. A later Next.js upgrade must run the script in the same
change. Rollback is a revert.
