# Issue #2154 — runtime acceptance checklist (not automated)

Spec: [rev 1 comment](https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357332711) (approved with D1a and D2a in [this comment](https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357392859)).

## Opt-in checks to run on the PR head

- [ ] Criterion 1 (PR body): `gh pr view <n> -R Asymmetric-al/core --json body --jq .body > /tmp/2154-body.md`, then `ACCEPTANCE_2154_PR_BODY_FILE=/tmp/2154-body.md bunx vitest run tests/unit/acceptance/issue-2154`.
- [ ] Criterion 5 (second sync is a no-op): `ACCEPTANCE_2154_SYNC=1 bunx vitest run tests/unit/acceptance/issue-2154` on a clean checkout, then confirm `git status` is still clean.
- [ ] Criterion 6 (scope): `ACCEPTANCE_2154_SCOPE=1 bunx vitest run tests/unit/acceptance/issue-2154`.

## Done criterion 7

- [ ] Every required CI check on the PR head SHA is green, including the skill-mirror integrity checks.

## Not checked (D2a)

- The OpenSpec scenario at `openspec/changes/add-six-agent-codex-factory/specs/agent-instruction-system/spec.md:42` stays out of this PR and is tracked in #2199. The scope check still rejects any `openspec/**` change in this PR.
