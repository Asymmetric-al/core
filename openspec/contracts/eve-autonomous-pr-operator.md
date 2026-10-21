# eve-autonomous-pr-operator normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-897870727fe769106728"></a>

## Eve Performs Mutating PR Operations Under Policy Without Merging

<!-- BEGIN CONTRACT {"id":"897870727fe769106728","name":"Eve Performs Mutating PR Operations Under Policy Without Merging"} -->

This path MUST perform **no merge** — auto-merge and its protected-area block remain the strict-auto-merge
policy's scope (#432) — and it MUST NOT bypass GitHub branch protection or required reviews. On authorized work,
Eve MAY **label, rerun CI, push safe fixes, update PR state, create issues, create branches, and open PRs** under
policy. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:383]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:387]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:629]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2a462daeb655047fd7cf"></a>

## Engineering Autonomy Is Allowed While Business-Data Writes Stay Blocked

<!-- BEGIN CONTRACT {"id":"2a462daeb655047fd7cf","name":"Engineering Autonomy Is Allowed While Business-Data Writes Stay Blocked"} -->

Eve MUST be confined to engineering autonomy. Eve MAY write **operational production records under policy** —
tasks, notes, labels, internal statuses, workflow metadata, memory, model settings, and review artifacts — but
MUST NOT autonomously write **broad customer, donor, payment, identity, tenant ownership, auth, secret,
migration, destructive production, or production deployment records** without stricter approval.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:419]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:423]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8a9bd8ddd237ba6a6397"></a>

## Eve-Initiated Work Follows An Issue-First Flow

<!-- BEGIN CONTRACT {"id":"8a9bd8ddd237ba6a6397","name":"Eve-Initiated Work Follows An Issue-First Flow"} -->

Work Eve discovers MUST be initiated **issue-first** — it MUST become an **issue, then a branch, then a PR** —
and MUST NOT be pushed silently. Eve MAY create issues, branches, PRs, and pushes for work it discovers so safe
improvements do not wait for manual task creation, and every initiation MUST record its initiating trigger.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:244]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:102]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2dc09bda7e14f091f7bf"></a>

## The PR Operator Grants No New Authority

<!-- BEGIN CONTRACT {"id":"2dc09bda7e14f091f7bf","name":"The PR Operator Grants No New Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-884f980b302b6f218bb7"></a>

## Every GitHub Operation Has Policy, Audit, And An Accountable Initiator

<!-- BEGIN CONTRACT {"id":"884f980b302b6f218bb7","name":"Every GitHub Operation Has Policy, Audit, And An Accountable Initiator"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
