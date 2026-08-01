# ADR-0032: Use an issue-first governed GitHub operator for Eve

**Status:** Accepted

**Date:** 2026-07-17

**Issue:** #431

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022, ADR-0024,
ADR-0026, ADR-0030, and ADR-0031

## Context

Eve must be able to initiate and advance safe engineering work without silently
pushing changes or receiving general repository authority. The required
operations are issue creation, branch creation, pull-request creation, labels,
failed-CI reruns, safe-fix pushes, and pull-request state updates. Merge is a
separate, stricter decision owned by #432.

These operations mutate an external collaboration surface. A model-authored API
call alone cannot establish repository scope, issue provenance, business-data
safety, protected-area approval, accountable identity, release state, or
idempotency.

## Decision

Core exposes one dynamically resolved `github_operator` tool only to sessions
authenticated by Eve's verified GitHub webhook authenticator for
`Asymmetric-al/core` with a valid installation ID. Its closed operation union
contains exactly seven operations and contains no merge operation.

All work after issue creation requires an issue number. Eve-created branches
must use `eve/issue-<number>-<slug>`, and opened PR bodies acquire
`Closes #<number>`. Product-direction implementations must include an OpenSpec
change before a safe-fix push or PR open. External text is rejected when the
admin-memory data boundary detects donor, payment, identity, tenant, secret, or
similar business data.

Safe fixes are read from the #429 sandbox only after the declared file set
exactly matches Git status. Sensitive paths or credential-like content are
always refused. Protected paths require both Eve tool approval and a #423
approval ID. Source contents cross only from the credential-free sandbox into
the trusted runtime; GitHub App credentials never enter the sandbox. The
runtime writes commits through GitHub's Git Data API with non-force ref updates.

Before every operation, the #420 governance kernel authorizes the
`github_actions` domain and #423 consults
`engineering.github_operation.write`. That action has a dedicated hard hourly
budget so a complete issue-first sequence does not consume the unrelated review
budget. #419 records blocked, started, succeeded, and failed outcomes under
#430's tenant-linked bot identity and verified sender. Audit stores stable IDs,
counts, policy, and operation evidence, never issue bodies or source contents.

Replay-safe markers make issue, PR, and commit creation idempotent; branch,
label, and PR-state operations are naturally idempotent. A failed-workflow
rerun requires the expected GitHub run attempt and is withheld when the attempt
has changed.

The master release switch remains off. This implementation supplies governed
capability, not launch authorization, and it does not bypass branch protection,
required reviews, policy, or #432's merge decision.

## Consequences

- Eve can initiate legible engineering work and advance it without silent
  pushes.
- Business data, sensitive paths, force pushes, anonymous operations, and merge
  are outside the operator's authority.
- GitHub App permissions expand only for the reviewed operator operations.
- Every mutation consumes a hard budget unit and produces accountable audit.
- Product-direction changes cannot proceed code-first.

## Operations

Setup, permissions, verification, rollback, and recovery are documented in
`docs/guides/operations/eve-github-operator.md`.
