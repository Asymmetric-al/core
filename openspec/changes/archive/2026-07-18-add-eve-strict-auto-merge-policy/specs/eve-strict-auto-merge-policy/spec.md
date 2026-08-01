# Delta for Eve Strict Auto-Merge Policy

## ADDED Requirements

### Requirement: Eve Auto-Merges Only When Strict Safe Policy Passes

Eve MUST auto-merge a PR **only** when strict safe policy passes — the PR is safe, its **required checks** are
satisfied, its **required reviews** are satisfied, and **no protected area** is touched — and the default
outcome MUST be **not to merge**. A passing auto-merge MUST NOT bypass GitHub branch protection, required
reviews, or repository policy; the strict policy is additional to them, never a way around them.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:253]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]

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

Auto-merge MUST be blocked for repo-aware protected areas — auth, donations, payments, secrets, environment
config, Supabase migrations, RLS, production deployment config, tenant resolution, admin access control,
data-access boundary changes, GitHub workflows, Vercel config, agent instructions, Eve config, package changes,
dependency changes, and runtime changes — so those areas remain **human-controlled**. A PR touching any of them
MUST NOT be auto-merged even when its required checks and reviews are satisfied.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:100]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:257]

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

Every merge decision — pass or block — MUST execute through **#430's accountable bot identity** and record the
**accountable admin, GitHub sender, schedule, or system trigger**; no decision MUST be anonymous. Every decision
MUST be **gated by #423's approval/budget policy** — a merge Eve is not authorized to take MUST be **withheld,
not taken**, and model spend MUST stay **under #423's hard budgets** — and MUST emit an **audit record in
#419's shape** capturing who or what initiated it, which tool or subagent ran, which model role was used, what
policy applied, what evidence was used, and what changed.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]

#### Scenario: A merge decision is accountable, policy-gated, and audited

- GIVEN Eve is about to take a merge decision (pass or block) under strict auto-merge policy
- WHEN the decision is taken
- THEN it executes through #430's accountable bot identity recording the accountable admin, sender, schedule, or
  system trigger
- AND it is gated by #423's approval/budget policy, withheld if unauthorized, with spend under #423's budgets
- AND it emits an audit record in #419's shape recording the initiator, tool/subagent, model role, policy
  applied, evidence used, and what changed

### Requirement: The Strict Auto-Merge Policy Grants No New Authority

The strict-auto-merge path MUST run on the **#425 runtime**, MUST remain separate from **#431's** seven-operation mutating PR operator surface
and **#430's** accountable bot identity, MUST read **#417's** protected-area set to block merges, MUST resolve
any model through **#421's shared policy** (Gateway-primary; never hardcoding a model or provider), MUST spend
**under #423 hard budgets**, and MUST honor **#420's `disable GitHub actions` kill switch** — reading the
persisted switch state from the app-owned governance store, never a prompt/model/tool claim. It MUST NOT bypass
GitHub branch protection, required reviews, or repository policy; MUST stay **disabled by default while the
release switch is off**; and MUST NOT bypass #417 protected-area / production-write / approval limits or #418
emergency-off precedence. Its executor MUST bind the merge to the observed head SHA, fail closed on incomplete
or unsupported protection evidence, and create an explicit idempotent human escalation for every non-passing
evidence decision.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

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
