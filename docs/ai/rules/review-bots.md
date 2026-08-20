# Review guidelines (automated code-review bots)

**Name:** `review-bots`
**Purpose:** Signal-over-noise rules for automated reviewers (Codex, Greptile, Cursor Bugbot/Security, and any agent acting as a reviewer).
**Applies when:** Automated review of a PR or local diff.
**Do not use when:** Implementing product features (use `docs/ai/rules/general.md` and domain rulebooks).

## Triggers

- PR review comments from bots
- Agent-as-reviewer sessions
- Greptile / Bugbot / Security review output

## Workflow

1. Rate findings into P0 / P1 / P2.
2. Require `file:line` evidence for behavior claims.
3. After the first round, re-reviews raise only new P0/P1 findings.

## Checklist

- [ ] Severity is explicit
- [ ] Speculative nits are not blocking merge
- [ ] Security findings are investigated regardless of confidence

---

These guidelines apply to automated reviewers (Codex, Greptile, Cursor Bugbot/Security, and any
agent acting as a reviewer). The
goal is signal over noise: real bugs surface, nits do not bury them.

**Severity — rate findings into these tiers:**

- **P0 / Blocker:** data loss, security vulnerability, auth/permission bypass, payment or
  webhook correctness, migration hazard, a crash or broken core flow. Must be fixed before merge.
- **P1 / Important:** a real bug, regression, or incorrect behavior in changed code; a missing test
  for new behavior on a money/auth/data path. Must be fixed or rebutted on-thread before merge.
- **P2 / Nit:** style, naming, formatting, minor clarity. Do **not** block merge; batch these and
  do not chase them individually across re-reviews.

**Rules of engagement:**

- Report findings with `file:line` evidence for any behavior claim; no speculative findings.
- Security findings are investigated regardless of confidence; style disputes
  are settled by checked-in formatter/linter configuration and these
  guidelines, not by debate threads.
- After the first review round, re-reviews should raise only **new** P0/P1 findings — suppress
  fresh nits — to avoid fix→new-nit loops.
- Merge safety is enforced by GitHub required checks, not by review bots; a passing/failing review
  is advisory.
