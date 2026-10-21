# eve-github-read-review-path normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-d86bde9121dc4fc923e9"></a>

## Review Actions Are Audited In The #419 Record Shape

<!-- BEGIN CONTRACT {"id":"d86bde9121dc4fc923e9","name":"Review Actions Are Audited In The #419 Record Shape"} -->

Every review action MUST emit an **audit record in #419's record shape**, capturing **who or what initiated the
action, which tool or subagent ran, which model role was used, what policy applied, what evidence was used, and
what changed**. The path emits audit records; it MUST NOT redefine or persist the audit contract itself.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:170]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:75]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-efc40a8c363d45a4abb2"></a>

## Eve Reviews PR Triggers And Posts Summary Plus Inline Findings Without Mutating The PR

<!-- BEGIN CONTRACT {"id":"efc40a8c363d45a4abb2","name":"Eve Reviews PR Triggers And Posts Summary Plus Inline Findings Without Mutating The PR"} -->

On a **GitHub PR trigger**, Eve MUST review the PR and post a **summary comment plus inline findings** close to
the code. This path MUST perform **no mutating PR operation** — it MUST NOT label, rerun CI, push, create
issues/branches/PRs, change PR state, or merge. Those mutating operations remain the autonomous PR operator's
scope (#431) and the strict-auto-merge policy's scope (#432).
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:229]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:85]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:236]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d3a2e27b3e0508de0883"></a>

## Review Comments Are Policy-Gated By #423

<!-- BEGIN CONTRACT {"id":"d3a2e27b3e0508de0883","name":"Review Comments Are Policy-Gated By #423"} -->

Every review comment and inline finding Eve posts MUST be **gated by #423's approval/budget policy** before it is
posted. A comment Eve is not authorized to post MUST be **withheld, not posted**, and the model spend to produce
the review MUST stay **under #423's hard budgets**, degrading or refusing rather than exceeding the ceiling.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:233]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:129]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-dd2d4c286ab39aef7f05"></a>

## Protected-Area Detection Is Visible In The Review Output

<!-- BEGIN CONTRACT {"id":"dd2d4c286ab39aef7f05","name":"Protected-Area Detection Is Visible In The Review Output"} -->

Eve's review MUST make **protected-area detection visible in the review output** itself, not hidden. When a PR
touches a **repo-aware protected area** (against #417's protected-area set — auth, donations, payments, secrets,
environment config, Supabase migrations, RLS, production deployment config, tenant resolution, admin access
control, data-boundary changes, GitHub workflows, Vercel config, agent instructions, Eve config,
package/dependency changes, and runtime changes), the review output MUST surface that detection. This path
detects and surfaces protected areas; it MUST NOT block or perform a merge (that is #432). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:234]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:389]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1c4535c34064b7403486"></a>

## GitHub Review Actions Execute Through An Accountable Bot Identity

<!-- BEGIN CONTRACT {"id":"1c4535c34064b7403486","name":"GitHub Review Actions Execute Through An Accountable Bot Identity"} -->

Every GitHub review action Eve takes — posting a review, a summary comment, or inline findings — MUST execute
through the **GitHub App/bot identity**, and every such action MUST record the **accountable admin, GitHub
sender, schedule, or system trigger**. No review action MUST be anonymous or lack recorded accountability.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:78]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:380]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a84ab5094c68c51f182b"></a>

## The Review Path Grants No New Authority

<!-- BEGIN CONTRACT {"id":"a84ab5094c68c51f182b","name":"The Review Path Grants No New Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
