# Issue #2154 — runtime acceptance checklist (not automated)

Spec: [rev 1 comment](https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357332711) (approved with D1a and D2a in [this comment](https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357392859)); clarified by [addendum 1](https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357644363).

## Opt-in checks to run on the PR head

> 2026-11-18: #2706 retired the criterion 6 scope check (`ACCEPTANCE_2154_SCOPE=1` no longer runs anything); criterion 6 is now the review step below. Criteria 1 and 5 still run as written.

- [ ] Criterion 1 (PR body): `gh pr view <n> -R Asymmetric-al/core --json body --jq .body > /tmp/2154-body.md`, then `ACCEPTANCE_2154_PR_BODY_FILE=/tmp/2154-body.md bunx vitest run tests/unit/acceptance/issue-2154`.
- [ ] Criterion 5 (second sync is a no-op): `ACCEPTANCE_2154_SYNC=1 bunx vitest run tests/unit/acceptance/issue-2154` on a clean checkout, then confirm `git status` is still clean.

## Done criterion 6 (review)

- [ ] The PR's changed files (`gh pr diff <n> -R Asymmetric-al/core --name-only`) are only under `docs/ai/**`, `docs/agents/**`, `.agents/**`, `.claude/**`, `.cursor/**`, or are `tests/unit/scripts/factory-startup-guidance.contract.test.ts` ([addendum 2](https://github.com/Asymmetric-al/core/issues/2154#issuecomment-6357881867)); nothing under `docs/guides/**` or `openspec/**` changes (#2199).

## Done criterion 7

- [ ] Every required CI check on the PR head SHA is green, including the skill-mirror integrity checks.

## Not checked (D2a)

- The OpenSpec scenario at `openspec/changes/add-six-agent-codex-factory/specs/agent-instruction-system/spec.md:42` stays out of this PR and is tracked in #2199. The criterion 6 review step confirms that the PR changes nothing under `openspec/**`.

## Not automated (addendum 1 item 3)

- [ ] `docs/ai/skills/triage/AGENT-BRIEF.md:122` (example brief) is reworded from "closed with a `wontfix` label" to closing with a comment. It is In-scope work, not a done criterion.
