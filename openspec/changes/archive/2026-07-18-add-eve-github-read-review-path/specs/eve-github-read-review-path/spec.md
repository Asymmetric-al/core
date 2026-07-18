# Delta for Eve GitHub Read and Review Path

## ADDED Requirements

### Requirement: GitHub Review Actions Execute Through An Accountable Bot Identity

Every GitHub review action Eve takes — posting a review, a summary comment, or inline findings — MUST execute
through the **GitHub App/bot identity**, and every such action MUST record the **accountable admin, GitHub
sender, schedule, or system trigger**. No review action MUST be anonymous or lack recorded accountability.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:78]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]

#### Scenario: A posted review records its accountable trigger

- GIVEN the release switch is off for local verification and a GitHub PR trigger fires
- WHEN Eve posts a review, summary comment, or inline finding
- THEN the action executes through the GitHub App/bot identity
- AND it records the accountable admin, GitHub sender, schedule, or system trigger

### Requirement: Eve Reviews PR Triggers And Posts Summary Plus Inline Findings Without Mutating The PR

On a **GitHub PR trigger**, Eve MUST review the PR and post a **summary comment plus inline findings** close to
the code. This path MUST perform **no mutating PR operation** — it MUST NOT label, rerun CI, push, create
issues/branches/PRs, change PR state, or merge. Those mutating operations remain the autonomous PR operator's
scope (#431) and the strict-auto-merge policy's scope (#432).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:229]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:85]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]

#### Scenario: A PR trigger produces a review, not a mutation

- GIVEN a GitHub PR trigger fires for a pull request
- WHEN Eve responds through this path
- THEN it reviews the PR and posts a summary comment plus inline findings
- AND it does not label, rerun CI, push, create issues/branches/PRs, change PR state, or merge

### Requirement: Review Comments Are Policy-Gated By #423

Every review comment and inline finding Eve posts MUST be **gated by #423's approval/budget policy** before it is
posted. A comment Eve is not authorized to post MUST be **withheld, not posted**, and the model spend to produce
the review MUST stay **under #423's hard budgets**, degrading or refusing rather than exceeding the ceiling.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:233]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]

#### Scenario: An unauthorized comment is withheld

- GIVEN Eve has produced a candidate review comment during a run
- WHEN #423's approval/budget policy does not authorize posting it
- THEN the comment is withheld rather than posted
- AND the model spend for the review stays under #423's budgets

### Requirement: Review Actions Are Audited In The #419 Record Shape

Every review action MUST emit an **audit record in #419's record shape**, capturing **who or what initiated the
action, which tool or subagent ran, which model role was used, what policy applied, what evidence was used, and
what changed**. The path emits audit records; it MUST NOT redefine or persist the audit contract itself.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]

#### Scenario: A posted review is audited

- GIVEN Eve posts a review, summary comment, or inline finding
- WHEN the action completes
- THEN an audit record is emitted in #419's shape recording the initiator, tool/subagent, model role, policy
  applied, evidence used, and what changed
- AND the path uses #419's shape, which it does not redefine

### Requirement: Protected-Area Detection Is Visible In The Review Output

Eve's review MUST make **protected-area detection visible in the review output** itself, not hidden. When a PR
touches a **repo-aware protected area** (against #417's protected-area set — auth, donations, payments, secrets,
environment config, Supabase migrations, RLS, production deployment config, tenant resolution, admin access
control, data-boundary changes, GitHub workflows, Vercel config, agent instructions, Eve config,
package/dependency changes, and runtime changes), the review output MUST surface that detection. This path
detects and surfaces protected areas; it MUST NOT block or perform a merge (that is #432). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:234]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]

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

The review path MUST run on the **#425 runtime** inside the **#429 sandbox checkout**, MUST resolve every model
through **#421's shared policy** (Gateway-primary; never hardcoding a model or provider), MUST spend **under
#423 hard budgets**, and MUST honor **#420's `disable GitHub actions` kill switch** — reading the persisted
switch state from the app-owned governance store, never a prompt/model/tool claim. It MUST NOT bypass GitHub
branch protection, required reviews, or repository policy; MUST stay **disabled by default while the release
switch is off**; and MUST NOT bypass #417 protected-area / production-write / approval limits or #418
emergency-off precedence. Live channel and poster code MUST fail closed when those controls or accountable
identity are unavailable. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:183]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:667]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

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
