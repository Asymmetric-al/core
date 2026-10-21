# eve-strict-auto-merge-policy normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-e430cdf9882689e9f208"></a>

## Eve Auto-Merges Only When Strict Safe Policy Passes

<!-- BEGIN CONTRACT {"id":"e430cdf9882689e9f208","name":"Eve Auto-Merges Only When Strict Safe Policy Passes"} -->

Eve MUST auto-merge a PR **only** when strict safe policy passes — the PR is safe, its **required checks** are
satisfied, its **required reviews** are satisfied, and **no protected area** is touched — and the default
outcome MUST be **not to merge**. A passing auto-merge MUST NOT bypass GitHub branch protection, required
reviews, or repository policy; the strict policy is additional to them, never a way around them.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:253]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:256]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-89868932b2f354b433b4"></a>

## Every Merge Decision Has Policy, Audit, And An Accountable Initiator

<!-- BEGIN CONTRACT {"id":"89868932b2f354b433b4","name":"Every Merge Decision Has Policy, Audit, And An Accountable Initiator"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a326c2da0f8f8df12490"></a>

## The Strict Auto-Merge Policy Grants No New Authority

<!-- BEGIN CONTRACT {"id":"a326c2da0f8f8df12490","name":"The Strict Auto-Merge Policy Grants No New Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3a6f4fd49b62c26d1c96"></a>

## Auto-Merge Is Blocked For Repo-Aware Protected Areas

<!-- BEGIN CONTRACT {"id":"3a6f4fd49b62c26d1c96","name":"Auto-Merge Is Blocked For Repo-Aware Protected Areas"} -->

Auto-merge MUST be blocked for repo-aware protected areas — auth, donations, payments, secrets, environment
config, Supabase migrations, RLS, production deployment config, tenant resolution, admin access control,
data-access boundary changes, GitHub workflows, Vercel config, agent instructions, Eve config, package changes,
dependency changes, and runtime changes — so those areas remain **human-controlled**. A PR touching any of them
MUST NOT be auto-merged even when its required checks and reviews are satisfied.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:100]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:257]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
