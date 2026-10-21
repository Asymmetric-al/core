# eve-strict-auto-merge-policy Specification

## Purpose

Define fail-closed eligibility and evidence for strictly bounded Eve auto-merge while preserving human control of protected areas and existing governance authority.

## Requirements

### Requirement: Eve Auto-Merges Only When Strict Safe Policy Passes

Eve MUST auto-merge a PR **only** when strict safe policy passes — the PR is safe, its **required checks** are satisfied, its **required reviews** are satisfied, and **no protected area** is touched — and the default outcome MUST be **not to merge**.

Every clause in `openspec/contracts/eve-strict-auto-merge-policy.md#contract-e430cdf9882689e9f208` MUST apply without exception.

#### Scenario: A safe PR with checks and reviews satisfied auto-merges

- GIVEN the release switch is off for local verification and a PR is safe with required checks and required
  reviews satisfied and no protected area touched
- WHEN Eve evaluates the PR under strict auto-merge policy
- THEN the strict policy passes and Eve may auto-merge it
- AND the merge honors GitHub branch protection and required reviews and does not bypass them

#### Scenario: A PR with an unsatisfied required check does not auto-merge

- GIVEN a PR whose required check or required review is not satisfied
- WHEN Eve evaluates the PR under strict auto-merge policy
- THEN the strict policy does not pass and Eve does not auto-merge, defaulting to not merge

### Requirement: Auto-Merge Is Blocked For Repo-Aware Protected Areas

Auto-merge MUST be blocked for every repository-aware protected area so those changes remain human-controlled.

Every clause in `openspec/contracts/eve-strict-auto-merge-policy.md#contract-3a6f4fd49b62c26d1c96` MUST apply without exception.

#### Scenario: A protected-area PR is blocked from auto-merge

- GIVEN a PR that touches a repo-aware protected area (for example auth, payments, Supabase migrations, RLS,
  secrets, GitHub workflows, or runtime changes)
- WHEN Eve evaluates the PR under strict auto-merge policy
- THEN auto-merge is blocked and the change remains human-controlled
- AND the block holds even if the PR's required checks and reviews are satisfied

### Requirement: The Human Escalation Path Is Explicit

Eve MUST escalate to a human on an **explicit** path whenever auto-merge does not pass — because a required
check or required review is unsatisfied, or a protected area is present — and MUST NOT merge or silently drop
the PR. The non-passing PR MUST surface to a human rather than being abandoned.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:258]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:96]

#### Scenario: A non-passing PR escalates to a human

- GIVEN a PR that does not pass strict auto-merge policy (a protected area is present or a required check/review
  is unsatisfied)
- WHEN Eve completes its evaluation
- THEN Eve escalates to a human on an explicit path
- AND Eve neither auto-merges the PR nor silently drops it

### Requirement: Every Merge Decision Has Policy, Audit, And An Accountable Initiator

Every merge decision — pass or block — MUST execute through **#430's accountable bot identity** and record the **accountable admin, GitHub sender, schedule, or system trigger**; no decision MUST be anonymous.

Every clause in `openspec/contracts/eve-strict-auto-merge-policy.md#contract-89868932b2f354b433b4` MUST apply without exception.

#### Scenario: A merge decision is accountable, policy-gated, and audited

- GIVEN Eve is about to take a merge decision (pass or block) under strict auto-merge policy
- WHEN the decision is taken
- THEN it executes through #430's accountable bot identity recording the accountable admin, sender, schedule, or
  system trigger
- AND it is gated by #423's approval/budget policy, withheld if unauthorized, with spend under #423's budgets
- AND it emits an audit record in #419's shape recording the initiator, tool/subagent, model role, policy
  applied, evidence used, and what changed

### Requirement: The Strict Auto-Merge Policy Grants No New Authority

The strict auto-merge path MUST consume its existing runtime, protected-area, model, budget, and persisted kill-switch authorities without granting new authority.

Every clause in `openspec/contracts/eve-strict-auto-merge-policy.md#contract-a326c2da0f8f8df12490` MUST apply without exception.

#### Scenario: The merge policy stays within model policy, budget, and kill switch

- GIVEN the strict-auto-merge path needs a model and evaluates a PR
- WHEN it resolves the model and consumes model calls
- THEN it resolves through #421's policy via the #425 runtime, not a hardcoded provider
- AND the spend stays under #423's hard budgets, and it stops if #420's `disable GitHub actions` switch is set

#### Scenario: The merge policy grants no new authority

- GIVEN the strict-auto-merge path is present and every kill switch is cleared
- WHEN Eve evaluates a merge that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and block the
  merge
- AND the path never bypasses GitHub branch protection, required reviews, or those higher-authority constraints
