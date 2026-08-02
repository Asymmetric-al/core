# ADR-0033: Require a complete fail-closed proof before Eve merges

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #432

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022, ADR-0024,
ADR-0026, ADR-0030, ADR-0031, and ADR-0032

## Context

Merge is Eve's highest-authority GitHub action because it lands code on the
protected `develop` branch. The ordinary #431 GitHub operator deliberately has
no merge operation. A separate decision must prove that a PR is issue-first,
current, safe, reviewed, green, and still protected at the moment of merge.

Relying only on GitHub's merge endpoint is insufficient. Installation tokens
can be granted bypass authority, branch rules can evolve, mergeability can be
pending, and model-supplied paths or SHAs can become stale. Conversely,
reimplementing GitHub protection and silently assuming unsupported rules are
safe would create a second, weaker protection system.

## Decision

Core exposes a separate dynamically scoped `github_strict_auto_merge` tool and
a direct completed-check-suite trigger. Both call the same server-owned
decision path and are available only for verified GitHub App sessions in
`Asymmetric-al/core`.

The default is no merge. Eve may merge only an open, non-draft, issue-first PR
into `develop` at the exact expected head SHA when all of the following are
true:

- the base branch has active classic branch protection enforced for admins;
- no bypass allowance or unverified active ruleset is present;
- every required check is observed from the required app and has a GitHub
  successful conclusion;
- the required count of current, non-bot human approvals is present;
- code-owner and last-push approval rules are absent until they can be proven
  precisely from supported evidence;
- GitHub reports the PR mergeable and `clean`, including required conversation
  resolution and strict up-to-date checks;
- the complete changed-file set contains no #417 protected or sensitive area;
  and
- the branch and PR body resolve to a real issue through
  `eve/issue-<number>-<slug>` and `Closes #<number>`.

The merge request uses GitHub's protected-branch endpoint with `merge_method:
merge` and the observed head SHA. It sends no bypass option. GitHub protection
therefore remains the final authority and a concurrent head change fails the
request.

Every non-passing evidence decision is withheld. When governance permits
external GitHub writes, Eve posts one idempotent escalation comment per PR head
SHA describing the blocking evidence and how a maintainer can request a fresh
evaluation. Governance and policy blocks remain visible in Mission Control and
the #419 audit trail even when external writes are disabled.

The path is gated by the release switch, emergency-off precedence, the
`github_actions` kill switch, and a dedicated #423 action and hard budget:
`engineering.github_merge.execute`, at most five evaluations per hour. Every
blocked, started, succeeded, failed, or already-completed decision carries the
#430 accountable GitHub App identity and verified trigger.

The master release switch remains off. This ADR creates verified capability,
not launch authorization.

## Consequences

- Eve cannot merge a protected-area PR, stale head, draft, non-issue-first PR,
  bot-only approval, missing check, or ambiguous protection configuration.
- GitHub remains the source of truth for branch protection and the final merge
  transaction; Eve's policy only adds stricter refusal conditions.
- Unsupported or newly introduced rules fail closed until their evidence can be
  evaluated explicitly.
- Check-suite completion can evaluate without a model call, while a maintainer
  can mention Eve to retry after resolving a review or protection block.
- Operators have a concrete, idempotent escalation and rollback path.

## Operations

Setup, permissions, verification, escalation, rollback, and recovery are
documented in `docs/guides/operations/eve-strict-auto-merge.md`.
