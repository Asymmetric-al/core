# Delta for Eve Autonomous PR Operator and Work Initiation

## ADDED Requirements

### Requirement: Eve-Initiated Work Follows An Issue-First Flow

Work Eve discovers MUST be initiated **issue-first** — it MUST become an **issue, then a branch, then a PR** —
and MUST NOT be pushed silently. Eve MAY create issues, branches, PRs, and pushes for work it discovers so safe
improvements do not wait for manual task creation, and every initiation MUST record its initiating trigger.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:102]

#### Scenario: Discovered work becomes an issue before a PR

- GIVEN the release switch is off for local verification and Eve discovers safe work
- WHEN Eve initiates that work through this path
- THEN it opens an issue, then a branch, then a PR, rather than pushing a silent change
- AND the initiating trigger is recorded

### Requirement: Eve Performs Mutating PR Operations Under Policy Without Merging

This path MUST perform **no merge** — auto-merge and its protected-area block remain the strict-auto-merge
policy's scope (#432) — and it MUST NOT bypass GitHub branch protection or required reviews. On authorized work,
Eve MAY **label, rerun CI, push safe fixes, update PR state, create issues, create branches, and open PRs** under
policy. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]

#### Scenario: The operator opens and updates a PR but does not merge

- GIVEN Eve has authorized work on a pull request
- WHEN Eve operates on the PR through this path
- THEN it may label, rerun CI, push safe fixes, update PR state, and create issues/branches/PRs under policy
- AND it does not merge, and it does not bypass GitHub branch protection or required reviews

### Requirement: Engineering Autonomy Is Allowed While Business-Data Writes Stay Blocked

Eve MUST be confined to engineering autonomy. Eve MAY write **operational production records under policy** —
tasks, notes, labels, internal statuses, workflow metadata, memory, model settings, and review artifacts — but
MUST NOT autonomously write **broad customer, donor, payment, identity, tenant ownership, auth, secret,
migration, destructive production, or production deployment records** without stricter approval.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:419]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:423]

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

Every GitHub operation Eve takes MUST execute through **#430's accountable bot identity** and record the
**accountable admin, GitHub sender, schedule, or system trigger** — no operation MUST be anonymous. Every
operation MUST be **gated by #423's approval/budget policy** before it runs — an operation Eve is not authorized
to take MUST be **withheld, not taken**, and model spend MUST stay **under #423's hard budgets** — and every
operation MUST emit an **audit record in #419's shape** capturing who or what initiated it, which tool or
subagent ran, which model role was used, what policy applied, what evidence was used, and what changed.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:246]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]

#### Scenario: An operation is accountable, policy-gated, and audited

- GIVEN Eve is about to take a GitHub operation through this path
- WHEN the operation runs
- THEN it executes through #430's accountable bot identity recording the accountable admin, sender, schedule, or
  system trigger
- AND it is gated by #423's approval/budget policy, withheld if unauthorized, with spend under #423's budgets
- AND it emits an audit record in #419's shape recording the initiator, tool/subagent, model role, policy
  applied, evidence used, and what changed

### Requirement: The PR Operator Grants No New Authority

The operator path MUST run on the **#425 runtime** inside the **#429 sandbox checkout**, MUST resolve every model
through **#421's shared policy** (Gateway-primary; never hardcoding a model or provider), MUST spend **under #423
hard budgets**, MUST reuse **#430's accountable bot identity**, and MUST honor **#420's `disable GitHub actions`
kill switch** — reading the persisted switch state from the app-owned governance store, never a prompt/model/tool
claim. It MUST NOT bypass GitHub branch protection, required reviews, or repository policy; MUST stay **disabled
by default while the release switch is off**; and MUST NOT bypass #417 protected-area / production-write /
approval limits or #418 emergency-off precedence. The implementation MUST expose only an issue-first,
engineering-scoped, policy-gated operation allowlist and MUST NOT introduce a merge operation.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

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
