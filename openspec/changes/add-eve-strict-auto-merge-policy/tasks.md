<!-- Partner DRAFT for GitHub issue #432. Task list for the `add-eve-strict-auto-merge-policy` OpenSpec
change; enters `Asymmetric-al/core` only via Asymmetric's OpenSpec workflow after sign-off. Acceptance and
scope grounded in [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md] and
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]. -->

## 1. Define the strict-auto-merge-policy OpenSpec contract

- [ ] 1.1 Add the `eve-strict-auto-merge-policy` capability via this change's spec delta
      (`specs/eve-strict-auto-merge-policy/spec.md`), building on #430 (accountable bot identity) and #431
      (mutating PR operator, which performs no merge) without restating them
- [ ] 1.2 State the five requirements as spec: auto-merge only when strict safe policy passes; protected-area
      merge-block; explicit human escalation; every merge decision with policy, audit, and accountable
      initiator; subordination and no new authority
- [ ] 1.3 Validate: `bunx @fission-ai/openspec@latest validate add-eve-strict-auto-merge-policy --strict`

## 2. Record the provisional Eve design decision EVE-DESIGN-0014 (strict auto-merge policy)

- [ ] 2.1 Author the decision under provisional Eve design label EVE-DESIGN-0014 in this change's `design.md`, traceable from EVE-DESIGN-0012 (#430) and EVE-DESIGN-0013 (#431)
- [ ] 2.2 At implementation time, promote the accepted decision into `docs/adr/` using the next available canonical number, then update all references.
- [ ] 2.3 Cross-link the resulting canonical ADR from the parent PRD and issue #432

## 3. Strict-pass-only merge and protected-area block

- [ ] 3.1 Specify that Eve may auto-merge only when strict safe policy passes — a safe PR with required checks
      and required reviews satisfied and no protected area touched — with "not merge" as the default outcome, and
      that a passing merge never bypasses GitHub branch protection or required reviews
- [ ] 3.2 Specify that auto-merge is blocked for the repo-aware protected-area set (auth, donations, payments,
      secrets, environment config, Supabase migrations, RLS, production deployment config, tenant resolution,
      admin access control, data-access boundary changes, GitHub workflows, Vercel config, agent instructions,
      Eve config, package changes, dependency changes, runtime changes) so those areas remain human-controlled

## 4. Explicit escalation, accountability/policy/audit

- [ ] 4.1 Specify that when auto-merge does not pass (required check/review unsatisfied or a protected area
      present) the path escalates to a human on an explicit path — neither merging nor silently dropping the PR
- [ ] 4.2 Specify that every merge decision (pass or block) executes through #430's accountable bot identity, is
      gated by #423's approval/budget policy, and emits an audit record in #419's shape (who/what initiated,
      tool/subagent, model role, policy applied, evidence used, what changed)

## 5. Boundary and subordination

- [ ] 5.1 Draw the boundary: #430 owns read-and-review and the accountable bot identity; #431 owns the mutating
      PR operations and work initiation and performs no merge; #417 owns the protected-area set; #419 owns the
      audit shape; #423 owns approval/budget; #421 owns model policy; #425 owns the runtime; #429 owns the
      sandbox; #432 owns the strict auto-merge decision those compose in
- [ ] 5.2 State that the path resolves any model through #421 via the #425 runtime, reuses #431's operator
      surface, spends under #423 budgets, honors #420's `disable GitHub actions` switch, does not bypass GitHub
      branch protection/required reviews, stays disabled by default while the release switch is off, and never
      bypasses #417 protected-area/approval limits or #418 emergency-off precedence

## 6. Acceptance checks (HITL)

- [ ] 6.1 Maintainer review that auto-merge passes only for safe PRs with required checks and reviews satisfied
      and no protected area touched, and that a passing merge honors branch protection and required reviews
- [ ] 6.2 Confirm auto-merge blocks for every repo-aware protected area, and that the human escalation path is
      explicit for every non-passing PR
- [ ] 6.3 Confirm every merge decision is policy-gated, audited in #419's shape, and carries an accountable
      initiator via #430's bot identity, and that the path resolves models only through #421 via #425 so any
      partner GPU gateway stays a proposed, non-default, revocable fallback
- [ ] 6.4 Confirm no auto-merge executor, protected-area detector, required-check/review evaluator, escalation
      router, GitHub App code, or Supabase schema is included in this change
- [ ] 6.5 Confirm the change is subordinate to #430/#431/#417, OpenSpec, `AGENTS.md`, `docs/ai/*`, GitHub branch
      protection, and existing CI gates, and that the release switch stays off
- [ ] 6.6 Human sign-off before the change is opened as a PR against `Asymmetric-al/core:develop`
