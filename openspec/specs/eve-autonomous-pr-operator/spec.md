# eve-autonomous-pr-operator Specification

## Purpose

Define Eve's governed, issue-first engineering operations in GitHub, including
the explicit no-merge, business-data, protected-area, policy, budget, audit,
and accountability boundaries.

## Requirements

### Requirement: Eve-Initiated Work Follows An Issue-First Flow

Work Eve discovers MUST be initiated **issue-first** — it MUST become an **issue, then a branch, then a PR** — and MUST NOT be pushed silently.

Every clause in `openspec/contracts/eve-autonomous-pr-operator.md#contract-8a9bd8ddd237ba6a6397` MUST apply without exception.

#### Scenario: Discovered work becomes an issue before a PR

- GIVEN the release switch is off for local verification and Eve discovers safe work
- WHEN Eve initiates that work through this path
- THEN it opens an issue, then a branch, then a PR, rather than pushing a silent change
- AND the initiating trigger is recorded

### Requirement: Eve Performs Mutating PR Operations Under Policy Without Merging

This path MUST perform **no merge** — auto-merge and its protected-area block remain the strict-auto-merge policy's scope (#432) — and it MUST NOT bypass GitHub branch protection or required reviews.

Every clause in `openspec/contracts/eve-autonomous-pr-operator.md#contract-897870727fe769106728` MUST apply without exception.

#### Scenario: The operator opens and updates a PR but does not merge

- GIVEN Eve has authorized work on a pull request
- WHEN Eve operates on the PR through this path
- THEN it may label, rerun CI, push safe fixes, update PR state, and create issues/branches/PRs under policy
- AND it does not merge, and it does not bypass GitHub branch protection or required reviews

### Requirement: Engineering Autonomy Is Allowed While Business-Data Writes Stay Blocked

Eve MUST be confined to engineering autonomy.

Every clause in `openspec/contracts/eve-autonomous-pr-operator.md#contract-2a462daeb655047fd7cf` MUST apply without exception.

#### Scenario: An engineering write is allowed but a business-data write is blocked

- GIVEN Eve is operating on work under policy
- WHEN the write is an operational production record (task, note, label, status, workflow metadata, memory,
  model setting, or review artifact)
- THEN Eve may perform it under policy
- AND WHEN the write is a broad customer, donor, payment, identity, tenant-ownership, auth, secret, migration,
  destructive-production, or production-deployment record
- THEN Eve is blocked from performing it autonomously without stricter approval

### Requirement: Product-Direction Changes Follow A Spec-First Path

Product features Eve invents MUST follow a **spec-first PR path**, and product-direction changes MUST update
**OpenSpec before merge**. Eve-created product work MUST update **OpenSpec before implementation proceeds**, so a
discovered change that alters product direction is not implemented as code first.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:395]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:109]

#### Scenario: A product-direction change updates OpenSpec first

- GIVEN Eve discovers or invents a change that alters product direction
- WHEN Eve initiates that work
- THEN it follows a spec-first PR path and updates OpenSpec before implementation proceeds
- AND the product-direction change is not merged without OpenSpec

### Requirement: Every GitHub Operation Has Policy, Audit, And An Accountable Initiator

Every GitHub operation Eve takes MUST execute through **#430's accountable bot identity** and record the **accountable admin, GitHub sender, schedule, or system trigger** — no operation MUST be anonymous.

Every clause in `openspec/contracts/eve-autonomous-pr-operator.md#contract-884f980b302b6f218bb7` MUST apply without exception.

#### Scenario: An operation is accountable, policy-gated, and audited

- GIVEN Eve is about to take a GitHub operation through this path
- WHEN the operation runs
- THEN it executes through #430's accountable bot identity recording the accountable admin, sender, schedule, or
  system trigger
- AND it is gated by #423's approval/budget policy, withheld if unauthorized, with spend under #423's budgets
- AND it emits an audit record in #419's shape recording the initiator, tool/subagent, model role, policy
  applied, evidence used, and what changed

### Requirement: The PR Operator Grants No New Authority

The PR operator MUST consume existing runtime, sandbox, model, budget, identity, and persisted kill-switch authorities without granting new authority.

Every clause in `openspec/contracts/eve-autonomous-pr-operator.md#contract-2dc09bda7e14f091f7bf` MUST apply without exception.

#### Scenario: Operator work stays within model policy, budget, and kill switch

- GIVEN the operator path needs a model and runs a PR operation
- WHEN it resolves the model and consumes model calls
- THEN it resolves through #421's policy via the #425 runtime inside the #429 sandbox checkout, not a hardcoded
  provider
- AND the spend stays under #423's hard budgets, and it stops if #420's `disable GitHub actions` switch is set

#### Scenario: The operator path grants no new authority

- GIVEN the operator path is present and every kill switch is cleared
- WHEN Eve evaluates an operation that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the path never bypasses GitHub branch protection, required reviews, or those higher-authority constraints
