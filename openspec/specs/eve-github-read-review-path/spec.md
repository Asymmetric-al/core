# eve-github-read-review-path Specification

## Purpose

Provide an evidence-grounded GitHub read and review path inside the existing Eve runtime, sandbox, identity, budget, and governance boundaries.

## Requirements

### Requirement: GitHub Review Actions Execute Through An Accountable Bot Identity

Every GitHub review action Eve takes — posting a review, a summary comment, or inline findings — MUST execute through the **GitHub App/bot identity**, and every such action MUST record the **accountable admin, GitHub sender, schedule, or system trigger**.

Every clause in `openspec/contracts/eve-github-read-review-path.md#contract-1c4535c34064b7403486` MUST apply without exception.

#### Scenario: A posted review records its accountable trigger

- GIVEN the release switch is off for local verification and a GitHub PR trigger fires
- WHEN Eve posts a review, summary comment, or inline finding
- THEN the action executes through the GitHub App/bot identity
- AND it records the accountable admin, GitHub sender, schedule, or system trigger

### Requirement: Eve Reviews PR Triggers And Posts Summary Plus Inline Findings Without Mutating The PR

On a **GitHub PR trigger**, Eve MUST review the PR and post a **summary comment plus inline findings** close to the code.

Every clause in `openspec/contracts/eve-github-read-review-path.md#contract-efc40a8c363d45a4abb2` MUST apply without exception.

#### Scenario: A PR trigger produces a review, not a mutation

- GIVEN a GitHub PR trigger fires for a pull request
- WHEN Eve responds through this path
- THEN it reviews the PR and posts a summary comment plus inline findings
- AND it does not label, rerun CI, push, create issues/branches/PRs, change PR state, or merge

### Requirement: Review Comments Are Policy-Gated By #423

Every review comment and inline finding Eve posts MUST be **gated by #423's approval/budget policy** before it is posted.

Every clause in `openspec/contracts/eve-github-read-review-path.md#contract-d3a2e27b3e0508de0883` MUST apply without exception.

#### Scenario: An unauthorized comment is withheld

- GIVEN Eve has produced a candidate review comment during a run
- WHEN #423's approval/budget policy does not authorize posting it
- THEN the comment is withheld rather than posted
- AND the model spend for the review stays under #423's budgets

### Requirement: Review Actions Are Audited In The #419 Record Shape

Every review action MUST emit an **audit record in #419's record shape**, capturing **who or what initiated the action, which tool or subagent ran, which model role was used, what policy applied, what evidence was used, and what changed**.

Every clause in `openspec/contracts/eve-github-read-review-path.md#contract-d86bde9121dc4fc923e9` MUST apply without exception.

#### Scenario: A posted review is audited

- GIVEN Eve posts a review, summary comment, or inline finding
- WHEN the action completes
- THEN an audit record is emitted in #419's shape recording the initiator, tool/subagent, model role, policy
  applied, evidence used, and what changed
- AND the path uses #419's shape, which it does not redefine

### Requirement: Protected-Area Detection Is Visible In The Review Output

Eve's review MUST make **protected-area detection visible in the review output** itself, not hidden.

Every clause in `openspec/contracts/eve-github-read-review-path.md#contract-dd2d4c286ab39aef7f05` MUST apply without exception.

#### Scenario: A protected-area PR surfaces the detection

- GIVEN a PR touches a repo-aware protected area in #417's set
- WHEN Eve reviews the PR
- THEN the protected-area detection is visible in the review output
- AND the path surfaces the detection without blocking or performing a merge

### Requirement: The Review Is A Decision Summary With No Sensitive Data On GitHub

The posted review MUST present a **high-quality decision summary** — what and why — **without raw model reasoning
or sensitive internals**. The review MUST NOT carry donor PII, payments, secrets, one-time codes, tenant facts,
or unredacted logs onto GitHub. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:178]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:627]

#### Scenario: The review posts a summary, not raw reasoning or sensitive data

- GIVEN Eve has completed a PR review
- WHEN it posts the review to GitHub
- THEN the review is a decision summary of what and why, not raw model reasoning or sensitive internals
- AND it contains no donor PII, payments, secrets, one-time codes, tenant facts, or unredacted logs

### Requirement: The Review Path Grants No New Authority

The review path MUST consume existing runtime, sandbox, model, budget, and persisted kill-switch authorities without granting new authority.

Every clause in `openspec/contracts/eve-github-read-review-path.md#contract-a84ab5094c68c51f182b` MUST apply without exception.

#### Scenario: Review work stays within model policy, budget, and kill switch

- GIVEN the review path needs a model and runs a PR review
- WHEN it resolves the model and consumes model calls
- THEN it resolves through #421's policy via the #425 runtime inside the #429 sandbox checkout, not a hardcoded
  provider
- AND the spend stays under #423's hard budgets, and it stops if #420's `disable GitHub actions` switch is set

#### Scenario: The review path grants no new authority

- GIVEN the review path is present and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the path never bypasses GitHub branch protection, required reviews, or those higher-authority constraints
