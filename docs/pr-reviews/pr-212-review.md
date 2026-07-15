# PR #212 Review - Align Nia MCP repo integration

- URL: https://github.com/Asymmetric-al/core/pull/212
- Base: `production`
- Head: `cursor/nia-repo-integration-b221`
- Draft: no
- GitHub state at review: `DIRTY`, `REVIEW_REQUIRED`
- Size: 1,230 changed files, +432 / -262,035
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: failed.

Conflict:

- `docs/ai/working-set.md` was deleted by the PR and modified in `production`.

Tests were not run because the PR does not produce a merged tree.

## Verdict

Do not merge until the conflict is resolved and the new Nia workflow is safe when repository secrets are missing.

## Findings

### P1 - Current branch cannot merge into `production`

Impact: local verification cannot run on the final merge state.

Suggested fix:

- Rebase or merge current `production`.
- Decide whether `docs/ai/working-set.md` remains tracked, becomes an example only, or is replaced by another workflow.
- Run full preflight after conflict resolution.

### P1 - New Nia repository-registration workflow can make every `production` push fail if the secret is absent

Evidence: the proposed workflow runs on pushes to `production` and uses `${{ secrets.NIA_API_KEY }}` around lines 19-30.

Impact: if the secret is not configured in the repository, unrelated pushes to `production` can go red.

Suggested fix:

- Configure the secret before merge, or
- Make the job skip with a clear neutral/success message when the secret is missing until ops setup is complete.

### P2 - Workflow parses source id from free-form script output

Evidence: workflow line 27 uses `sed`; the proposed shell helper emits human-oriented output around lines 33-35.

Impact: a wording change can break the workflow.

Suggested fix:

- Emit JSON or a GitHub-output file from the script.
- Parse a stable field, not a log sentence.

### P2 - Docs still point to the tracked working-set file after deleting it

Evidence: `docs/README.md` still references `docs/ai/working-set.md`.

Impact: contributors and agents will follow a path the PR removes or makes ambiguous.

Suggested fix:

- Point docs to `docs/ai/working-set.example.md` plus a local gitignored working set if that is the new model.

### P2 - Example config uses key-shaped placeholders

Evidence: `docs/mcp-config.example.toml` includes placeholders like `Bearer nk_...` and `NIA_API_KEY = "nk_..."`.

Impact: key-shaped examples are easy to mistake for real secrets and can trip secret scanners.

Suggested fix:

- Replace with `YOUR_NIA_API_KEY` or `<NIA_API_KEY>`.

### P2 - Bulk deletion exceeds automated review limits

Evidence: PR touches 1,230 files and automated review noted a 500-file review cap.

Impact: review confidence is lower than normal even if the broad intent is cleanup.

Suggested fix:

- Split `.nia-sync` deletion from workflow/docs changes.
- Keep behavior changes in a small PR.

## Required Before Merge

- Resolve working-set conflict.
- Make CI safe without the Nia secret or confirm the secret is installed.
- Replace log parsing with structured output.
- Split or clearly scope the bulk deletion.
- Run full preflight.
